import { NextRequest, NextResponse } from "next/server";
import { generateCreativeDirections } from "@/lib/ai/engine";
import { ProjectStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { projectId, promptText, targetDuration, aspectRatio, captionLanguage } =
      await req.json();

    const project = ProjectStorage.getById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.assets || project.assets.length === 0) {
      return NextResponse.json(
        { error: "Please upload or add at least one clip before generating edit plans." },
        { status: 400 }
      );
    }

    const directions = generateCreativeDirections({
      project,
      promptText: promptText || project.promptText,
      targetDuration: targetDuration || project.targetDuration,
      aspectRatio: aspectRatio || project.aspectRatio,
      captionLanguage: captionLanguage || project.captionLanguage,
    });

    project.directions = directions;
    project.status = "ready";
    if (promptText) project.promptText = promptText;

    // Record initial plan as version 1
    const activeDir = project.activeDirection || "story";
    ProjectStorage.addVersion(
      projectId,
      "AI Generated Edit Plans",
      `Synthesized STORY, HYPE, and CLEAN directions based on prompt: "${promptText || "Default prompt"}"`,
      directions[activeDir]
    );

    const saved = ProjectStorage.getById(projectId);
    return NextResponse.json({ success: true, directions, project: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate creative directions" },
      { status: 500 }
    );
  }
}
