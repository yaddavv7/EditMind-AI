import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { getFfprobePath, getFfmpegPath, runFfmpegArgs } from "./runner";

export interface ProbeResult {
  duration: number;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  aspectRatio: string;
  sizeBytes: number;
  format: string;
  videoCodec: string;
  audioCodec?: string;
}

export async function probeMediaFile(filePath: string): Promise<ProbeResult> {
  const ffprobePath = getFfprobePath();

  const args = [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ];

  return new Promise((resolve, reject) => {
    execFile(ffprobePath, args, { windowsHide: true }, (error, stdout) => {
      if (error) {
        // Fallback default info if ffprobe encounters issues
        const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : { size: 0 };
        return resolve({
          duration: 10,
          width: 1920,
          height: 1080,
          fps: 30,
          hasAudio: true,
          aspectRatio: "16:9",
          sizeBytes: stats.size,
          format: "mp4",
          videoCodec: "h264",
          audioCodec: "aac",
        });
      }

      try {
        const data = JSON.parse(stdout);
        const videoStream = data.streams?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any) => s.codec_type === "video"
        );
        const audioStream = data.streams?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: any) => s.codec_type === "audio"
        );

        let duration = parseFloat(data.format?.duration || "0");
        if (!duration && videoStream?.duration) {
          duration = parseFloat(videoStream.duration);
        }
        if (!duration || isNaN(duration)) duration = 5;

        const width = videoStream?.width || 1920;
        const height = videoStream?.height || 1080;

        let fps = 30;
        if (videoStream?.r_frame_rate) {
          const parts = videoStream.r_frame_rate.split("/");
          if (parts.length === 2 && parseInt(parts[1]) > 0) {
            fps = Math.round(parseInt(parts[0]) / parseInt(parts[1]));
          }
        }

        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(width, height);
        const arW = width / divisor;
        const arH = height / divisor;
        let aspectRatio = `${arW}:${arH}`;
        if (Math.abs(width / height - 16 / 9) < 0.05) aspectRatio = "16:9";
        else if (Math.abs(width / height - 9 / 16) < 0.05) aspectRatio = "9:16";
        else if (Math.abs(width / height - 1) < 0.05) aspectRatio = "1:1";

        resolve({
          duration,
          width,
          height,
          fps: fps || 30,
          hasAudio: !!audioStream,
          aspectRatio,
          sizeBytes: parseInt(data.format?.size || "0") || 0,
          format: data.format?.format_name || "mp4",
          videoCodec: videoStream?.codec_name || "h264",
          audioCodec: audioStream?.codec_name,
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Generate a thumbnail frame at timestamp
export async function generateThumbnail(
  videoPath: string,
  outputThumbnailPath: string,
  timestampSec = 1
): Promise<string> {
  const dir = path.dirname(outputThumbnailPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const args = [
    "-y",
    "-ss",
    timestampSec.toFixed(2),
    "-i",
    videoPath,
    "-vframes",
    "1",
    "-vf",
    "scale=480:-1",
    outputThumbnailPath,
  ];

  try {
    await runFfmpegArgs(args, { timeoutMs: 15000 });
    return outputThumbnailPath;
  } catch (err) {
    console.error("Error generating thumbnail:", err);
    return "";
  }
}
