import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { probeMediaFile } from "@/lib/ffmpeg/probe";
import { extractReferenceDNA } from "@/lib/ai/reference-dna";
import { ProjectStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { projectId, referenceUrl, filename, userPromptHint } = await req.json();

    const project = ProjectStorage.getById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let localPath = referenceUrl;
    if (!fs.existsSync(localPath)) {
      localPath = path.join(process.cwd(), "public", referenceUrl.replace(/^[\\\/]/, ""));
    }

    const probe = await probeMediaFile(localPath);
    const dna = extractReferenceDNA(probe, filename || path.basename(referenceUrl), userPromptHint);

    project.referenceAsset = {
      id: `ref_${Date.now()}`,
      projectId,
      filename: filename || path.basename(referenceUrl),
      originalName: filename || "Reference Video",
      url: referenceUrl,
      dna,
      createdAt: new Date().toISOString(),
    };

    // Auto-align project default settings to reference DNA
    project.aspectRatio = dna.preferredAspectRatio;
    project.pacing = dna.pacing;
    project.captionStyle = dna.captionStyle;
    project.colorGrade = dna.colorMood;

    ProjectStorage.save(project);

    return NextResponse.json({ success: true, dna, project });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to extract Reference DNA" },
      { status: 500 }
    );
  }
}
