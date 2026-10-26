import path from "path";
import fs from "fs";
import { EditDecisionList, Project, RenderJob, SourceAsset } from "../types";
import { runFfmpegArgs } from "./runner";
import { RenderJobStorage } from "../storage";

export interface RenderOptions {
  jobId: string;
  project: Project;
  edl: EditDecisionList;
  quality?: "draft" | "standard" | "high_quality";
}

export async function renderTimelineToVideo(options: RenderOptions): Promise<string> {
  const { jobId, project, edl } = options;
  const quality = options.quality || edl.exportProfile || "standard";

  const rendersDir = path.join(process.cwd(), "public", "renders");
  const tempDir = path.join(process.cwd(), "data", "temp", jobId);
  if (!fs.existsSync(rendersDir)) fs.mkdirSync(rendersDir, { recursive: true });
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const outputFilename = `render_${jobId}.mp4`;
  const outputPath = path.join(rendersDir, outputFilename);
  const outputUrl = `/renders/${outputFilename}`;

  // Target resolutions based on aspect ratio
  let targetWidth = 1920;
  let targetHeight = 1080;
  if (edl.aspectRatio === "9:16") {
    targetWidth = 1080;
    targetHeight = 1920;
  } else if (edl.aspectRatio === "1:1") {
    targetWidth = 1080;
    targetHeight = 1080;
  }

  // Adjust resolution if draft
  if (quality === "draft") {
    targetWidth = Math.round(targetWidth * 0.66 / 2) * 2;
    targetHeight = Math.round(targetHeight * 0.66 / 2) * 2;
  }

  // Lookup asset map
  const assetMap = new Map<string, SourceAsset>();
  for (const a of project.assets) {
    assetMap.set(a.id, a);
  }

  const clips = [...edl.timeline.clips].sort((a, b) => a.order - b.order);
  if (clips.length === 0) {
    throw new Error("No clips present on the timeline to render.");
  }

  RenderJobStorage.update(jobId, {
    status: "processing",
    progress: 10,
    stage: "Preparing timeline segments",
  });

  // Step 1: Process and normalize each individual clip segment
  const segmentFiles: string[] = [];
  const totalClips = clips.length;

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const asset = assetMap.get(clip.sourceAssetId);

    if (!asset) {
      throw new Error(`Source asset ${clip.sourceAssetId} not found in project assets.`);
    }

    let inputPath = asset.filePath;
    if (!fs.existsSync(inputPath)) {
      inputPath = path.join(process.cwd(), "public", asset.filePath.replace(/^[\\\/]/, ""));
    }

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Media file not found on disk: ${inputPath}`);
    }

    const segOutput = path.join(tempDir, `seg_${i}.mp4`);
    segmentFiles.push(segOutput);

    // Color grading filters
    let colorFilter = "";
    switch (edl.colorGrade) {
      case "warm_cinematic":
        colorFilter = ",eq=contrast=1.12:saturation=1.25:brightness=0.02,hue=h=8:s=1.1";
        break;
      case "moody_teal_orange":
        colorFilter = ",eq=contrast=1.2:saturation=1.15:brightness=-0.04,hue=h=-10:s=1.2";
        break;
      case "vintage_film":
        colorFilter = ",eq=contrast=1.05:saturation=0.85:brightness=0.03,curves=vintage";
        break;
      case "vibrant":
        colorFilter = ",eq=contrast=1.15:saturation=1.45:brightness=0.01";
        break;
      case "monochrome":
        colorFilter = ",hue=s=0,eq=contrast=1.25:brightness=0.02";
        break;
      default:
        colorFilter = "";
        break;
    }

    // Video filter: crop/scale to fill target canvas cleanly
    const scaleFilter = `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},setsar=1${colorFilter}`;

    // Speed adjustment filter if different from 1
    const speed = clip.speed || 1;
    let videoSpeedFilter = "";
    let audioSpeedFilter = "";
    if (speed !== 1) {
      const setpts = (1 / speed).toFixed(4);
      videoSpeedFilter = `,setpts=${setpts}*PTS`;
      audioSpeedFilter = `,atempo=${speed}`;
    }

    // Audio volume
    const clipVol = clip.volume !== undefined ? clip.volume : 1;
    const audioVolFilter = `volume=${clipVol.toFixed(2)}${audioSpeedFilter}`;

    const segArgs = [
      "-y",
      "-ss",
      clip.sourceIn.toFixed(2),
      "-t",
      clip.duration.toFixed(2),
      "-i",
      inputPath,
      "-vf",
      `${scaleFilter}${videoSpeedFilter}`,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
    ];

    if (asset.hasAudio) {
      segArgs.push("-af", audioVolFilter, "-c:a", "aac", "-ar", "44100", "-b:a", "128k");
    } else {
      // Add silent audio so concatenation doesn't fail
      segArgs.push(
        "-f",
        "lavfi",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-c:a",
        "aac",
        "-shortest"
      );
    }

    segArgs.push(segOutput);

    RenderJobStorage.update(jobId, {
      progress: Math.round(15 + (i / totalClips) * 35),
      stage: `Processing clip ${i + 1} of ${totalClips}`,
    });

    await runFfmpegArgs(segArgs, { timeoutMs: 60000 });
  }

  // Step 2: Create concat list file
  const concatListPath = path.join(tempDir, "concat_list.txt");
  const concatContent = segmentFiles
    .map((filePath) => `file '${filePath.replace(/\\/g, "/")}'`)
    .join("\n");
  fs.writeFileSync(concatListPath, concatContent, "utf-8");

  const concatenatedVideo = path.join(tempDir, "concatenated.mp4");

  RenderJobStorage.update(jobId, {
    progress: 55,
    stage: "Stitching timeline clips",
  });

  const concatArgs = [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatListPath,
    "-c",
    "copy",
    concatenatedVideo,
  ];

  await runFfmpegArgs(concatArgs, { timeoutMs: 60000 });

  // Step 3: Mix background music and final audio if tracks exist
  const activeMusicTrack = edl.timeline.audioTracks?.find((t) => t.type === "music");
  let finalAudioVideo = concatenatedVideo;

  if (activeMusicTrack && activeMusicTrack.sourceUrl) {
    RenderJobStorage.update(jobId, {
      progress: 75,
      stage: "Mixing soundtrack and audio ducking",
    });

    let musicPath = activeMusicTrack.sourceUrl;
    if (!fs.existsSync(musicPath)) {
      musicPath = path.join(process.cwd(), "public", activeMusicTrack.sourceUrl.replace(/^[\\\/]/, ""));
    }

    if (fs.existsSync(musicPath)) {
      const mixedPath = path.join(tempDir, "mixed.mp4");
      const musicVol = (activeMusicTrack.volume || 0.6).toFixed(2);

      // Mix original audio and music
      const mixArgs = [
        "-y",
        "-i",
        concatenatedVideo,
        "-i",
        musicPath,
        "-filter_complex",
        `[1:a]volume=${musicVol}[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]`,
        "-map",
        "0:v",
        "-map",
        "[aout]",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        mixedPath,
      ];

      try {
        await runFfmpegArgs(mixArgs, { timeoutMs: 60000 });
        finalAudioVideo = mixedPath;
      } catch (mixErr) {
        console.warn("Background music mix warning, falling back to original audio:", mixErr);
      }
    }
  }

  // Step 4: Final encode to destination MP4
  RenderJobStorage.update(jobId, {
    progress: 90,
    stage: "Finalizing MP4 encoding",
  });

  const crf = quality === "high_quality" ? "18" : quality === "draft" ? "28" : "23";
  const preset = quality === "draft" ? "ultrafast" : "medium";

  const finalArgs = [
    "-y",
    "-i",
    finalAudioVideo,
    "-c:v",
    "libx264",
    "-preset",
    preset,
    "-crf",
    crf,
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    outputPath,
  ];

  await runFfmpegArgs(finalArgs, { timeoutMs: 90000 });

  // Clean up temp dir
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup error
  }

  RenderJobStorage.update(jobId, {
    status: "completed",
    progress: 100,
    stage: "Ready for download and preview",
    outputUrl,
    outputPath,
    completedAt: new Date().toISOString(),
  });

  return outputUrl;
}
