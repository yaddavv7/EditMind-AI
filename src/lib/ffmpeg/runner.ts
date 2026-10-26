import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// Find ffmpeg path
export function getFfmpegPath(): string {
  // 1. Check environment variable
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }

  // 2. Look for installed @ffmpeg-installer binary directly on disk
  const platform = process.platform;
  const arch = process.arch;
  const exeName = platform === "win32" ? "ffmpeg.exe" : "ffmpeg";

  const potentialPaths = [
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", `${platform}-${arch}`, exeName),
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", "win32-x64", "ffmpeg.exe"),
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", "ffmpeg", "bin", exeName),
  ];

  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // 3. Fallback to global command in PATH
  return "ffmpeg";
}

// Find ffprobe path
export function getFfprobePath(): string {
  if (process.env.FFPROBE_PATH && fs.existsSync(process.env.FFPROBE_PATH)) {
    return process.env.FFPROBE_PATH;
  }

  const platform = process.platform;
  const arch = process.arch;
  const exeName = platform === "win32" ? "ffprobe.exe" : "ffprobe";

  const potentialPaths = [
    path.join(process.cwd(), "node_modules", "@ffprobe-installer", `${platform}-${arch}`, exeName),
    path.join(process.cwd(), "node_modules", "@ffprobe-installer", "win32-x64", "ffprobe.exe"),
    path.join(process.cwd(), "node_modules", "@ffprobe-installer", "ffprobe", "bin", exeName),
  ];

  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return "ffprobe";
}

export function isFfmpegAvailable(): boolean {
  try {
    const ffmpegPath = getFfmpegPath();
    return fs.existsSync(ffmpegPath) || ffmpegPath === "ffmpeg";
  } catch {
    return false;
  }
}

export interface FfmpegExecOptions {
  timeoutMs?: number;
  onProgress?: (progress: number, stage: string) => void;
}

export async function runFfmpegArgs(
  args: string[],
  options: FfmpegExecOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  const ffmpegPath = getFfmpegPath();
  const timeoutMs = options.timeoutMs || 180000; // 3 min default

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, {
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`FFmpeg process timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      const chunk = data.toString();
      stderr += chunk;

      const match = chunk.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (match && options.onProgress) {
        const hours = parseFloat(match[1]);
        const minutes = parseFloat(match[2]);
        const seconds = parseFloat(match[3]);
        const currentSec = hours * 3600 + minutes * 60 + seconds;
        options.onProgress(currentSec, "Rendering frames");
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `FFmpeg exited with error code ${code}.\nCommand: ${ffmpegPath} ${args.join(
              " "
            )}\nError Details:\n${stderr.slice(-1000)}`
          )
        );
      }
    });
  });
}
