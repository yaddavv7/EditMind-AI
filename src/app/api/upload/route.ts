import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { probeMediaFile, generateThumbnail } from "@/lib/ffmpeg/probe";
import { analyzeClipIntelligence } from "@/lib/ai/footage-analysis";
import { ProjectStorage } from "@/lib/storage";
import { SourceAsset } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const assetType = (formData.get("type") as string) || "clip"; // 'clip' | 'reference' | 'audio'

    if (!file) {
      return NextResponse.json({ error: "No file provided in upload request." }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || "media_upload.mp4";
    const ext = path.extname(originalName) || ".mp4";
    const sanitizedBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const uniqueFilename = `${sanitizedBase}_${Date.now()}${ext}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(destinationPath, rawBuffer);

    // Probe the file with ffprobe
    const probe = await probeMediaFile(destinationPath);

    // Generate thumbnail for video
    let thumbUrl = "/placeholder-video.jpg";
    if (ext === ".mp4" || ext === ".mov" || ext === ".webm") {
      const thumbFilename = `${sanitizedBase}_${Date.now()}_thumb.jpg`;
      const thumbPath = path.join(uploadsDir, thumbFilename);
      const generatedThumb = await generateThumbnail(destinationPath, thumbPath, 1.0);
      if (generatedThumb && fs.existsSync(thumbPath)) {
        thumbUrl = `/uploads/${thumbFilename}`;
      }
    }

    const fileUrl = `/uploads/${uniqueFilename}`;

    const newAsset: SourceAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: projectId || "general",
      filename: uniqueFilename,
      originalName,
      filePath: destinationPath,
      url: fileUrl,
      thumbnailUrl: thumbUrl,
      duration: probe.duration,
      width: probe.width,
      height: probe.height,
      fps: probe.fps,
      aspectRatio: probe.aspectRatio,
      hasAudio: probe.hasAudio,
      sizeBytes: probe.sizeBytes,
      createdAt: new Date().toISOString(),
    };

    // Analyze footage intelligence
    newAsset.intelligence = analyzeClipIntelligence(newAsset);

    // If projectId provided and asset is clip, link to project
    if (projectId && assetType === "clip") {
      ProjectStorage.addAsset(projectId, newAsset);
    }

    return NextResponse.json({
      success: true,
      asset: newAsset,
      probe,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process upload." },
      { status: 500 }
    );
  }
}
