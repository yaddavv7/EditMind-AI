import path from "path";
import fs from "fs";
import { runFfmpegArgs } from "./runner";
import { generateThumbnail } from "./probe";

export async function ensureDemoAssetsExist(): Promise<{
  clips: Array<{
    filename: string;
    originalName: string;
    url: string;
    thumbnailUrl: string;
    duration: number;
    width: number;
    height: number;
    hasAudio: boolean;
  }>;
  reference: {
    filename: string;
    originalName: string;
    url: string;
    duration: number;
  };
  audioTracks: Array<{
    id: string;
    filename: string;
    url: string;
    title: string;
  }>;
}> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const audioDir = path.join(process.cwd(), "public", "audio");

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  const clipConfigs = [
    {
      filename: "demo-sunset-cliff.mp4",
      originalName: "Sunset Cliff Vista (Raw Footage).mp4",
      thumb: "demo-sunset-cliff.jpg",
      duration: 6,
      width: 1920,
      height: 1080,
      filter: "testsrc2=duration=6:size=1920x1080:rate=30,eq=contrast=1.2:saturation=1.5:brightness=-0.05",
      audioFreq: 330,
    },
    {
      filename: "demo-beach-drone.mp4",
      originalName: "Azure Ocean Waves Aerial.mp4",
      thumb: "demo-beach-drone.jpg",
      duration: 6,
      width: 1920,
      height: 1080,
      filter: "smptehdbars=duration=6:size=1920x1080:rate=30,boxblur=2:1",
      audioFreq: 440,
    },
    {
      filename: "demo-city-lights.mp4",
      originalName: "Downtown Neon Lights & Traffic.mp4",
      thumb: "demo-city-lights.jpg",
      duration: 6,
      width: 1920,
      height: 1080,
      filter: "testsrc2=duration=6:size=1920x1080:rate=30,eq=contrast=1.3:saturation=1.8:brightness=-0.08",
      audioFreq: 520,
    },
    {
      filename: "demo-talking-creator.mp4",
      originalName: "Creator Vlog Introduction (Portrait).mp4",
      thumb: "demo-talking-creator.jpg",
      duration: 8,
      width: 1080,
      height: 1920,
      filter: "testsrc=duration=8:size=1080x1920:rate=30,hue=h=45:s=1.2",
      audioFreq: 260,
    },
  ];

  const generatedClips = [];

  for (const cfg of clipConfigs) {
    const filePath = path.join(uploadsDir, cfg.filename);
    const thumbPath = path.join(uploadsDir, cfg.thumb);

    if (!fs.existsSync(filePath)) {
      try {
        // Generate with FFmpeg
        const args = [
          "-y",
          "-f",
          "lavfi",
          "-i",
          cfg.filter,
          "-f",
          "lavfi",
          "-i",
          `sine=frequency=${cfg.audioFreq}:duration=${cfg.duration}`,
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          filePath,
        ];
        await runFfmpegArgs(args, { timeoutMs: 30000 });
      } catch (err) {
        console.error(`Error generating demo clip ${cfg.filename}:`, err);
      }
    }

    if (fs.existsSync(filePath) && !fs.existsSync(thumbPath)) {
      await generateThumbnail(filePath, thumbPath, 1.0);
    }

    generatedClips.push({
      filename: cfg.filename,
      originalName: cfg.originalName,
      url: `/uploads/${cfg.filename}`,
      thumbnailUrl: `/uploads/${cfg.thumb}`,
      duration: cfg.duration,
      width: cfg.width,
      height: cfg.height,
      hasAudio: true,
    });
  }

  // Reference video
  const refFilename = "demo-reference-reel.mp4";
  const refPath = path.join(uploadsDir, refFilename);
  if (!fs.existsSync(refPath)) {
    try {
      const args = [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "testsrc2=duration=8:size=1080x1920:rate=30,hue=s=1.8",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=480:duration=8",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        refPath,
      ];
      await runFfmpegArgs(args, { timeoutMs: 30000 });
    } catch (err) {
      console.error("Error creating reference clip:", err);
    }
  }

  // Audio tracks
  const tracks = [
    { name: "ambient-cinematic.mp3", title: "Ethereal Horizons (Cinematic Ambient)", freq: 220 },
    { name: "lofi-sunset.mp3", title: "Golden Hour Glow (Lo-Fi Chill)", freq: 330 },
    { name: "future-bass.mp3", title: "Neon Pulse (Future Bass Energy)", freq: 440 },
    { name: "acoustic-warmth.mp3", title: "Memories & Sun (Warm Acoustic)", freq: 523 },
  ];

  const generatedAudio = [];
  for (const trk of tracks) {
    const audioPath = path.join(audioDir, trk.name);
    if (!fs.existsSync(audioPath)) {
      try {
        const args = [
          "-y",
          "-f",
          "lavfi",
          "-i",
          `sine=frequency=${trk.freq}:duration=60`,
          "-c:a",
          "libmp3lame",
          "-b:a",
          "192k",
          audioPath,
        ];
        await runFfmpegArgs(args, { timeoutMs: 20000 });
      } catch (err) {
        console.error("Error generating audio track:", err);
      }
    }
    generatedAudio.push({
      id: `audio-${trk.name.replace(".mp3", "")}`,
      filename: trk.name,
      url: `/audio/${trk.name}`,
      title: trk.title,
    });
  }

  return {
    clips: generatedClips,
    reference: {
      filename: refFilename,
      originalName: "Viral Travel Reel Reference (9:16).mp4",
      url: `/uploads/${refFilename}`,
      duration: 8,
    },
    audioTracks: generatedAudio,
  };
}
