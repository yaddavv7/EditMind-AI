import { NextRequest, NextResponse } from "next/server";
import { ProjectStorage } from "@/lib/storage";
import { Project } from "@/lib/types";
import { PRESET_RECIPES } from "@/lib/constants";
import { generateCreativeDirections } from "@/lib/ai/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = ProjectStorage.getAll();
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, presetId, aspectRatio, targetDuration } = body;

    const preset = PRESET_RECIPES.find((p) => p.id === presetId);

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalName = name || (preset ? `${preset.title} Edit` : "Untitled Project");
    const finalAspect = aspectRatio || preset?.aspectRatio || "9:16";
    const finalDuration = targetDuration || preset?.targetDuration || 30;

    const newProject: Project = {
      id: projectId,
      name: finalName,
      description: preset?.description || "Custom AI video project",
      aspectRatio: finalAspect,
      targetDuration: finalDuration,
      pacing: preset?.pacing || "medium",
      captionStyle: preset?.captionStyle || "bold_pop",
      captionLanguage: "en",
      colorGrade: preset?.colorTreatment || "natural",
      musicVolume: 0.65,
      audioDucking: true,
      activeDirection: "story",
      promptText: preset?.promptTemplate || "",
      selectedPresetId: presetId,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets: [],
      directions: {
        story: {
          version: 1,
          direction: "story",
          title: "Narrative Arc",
          description: "Story-led pacing",
          aspectRatio: finalAspect,
          targetDuration: finalDuration,
          totalDuration: 0,
          colorGrade: "warm_cinematic",
          timeline: { clips: [], audioTracks: [], captions: [] },
          exportProfile: "standard",
          updatedAt: new Date().toISOString(),
        },
        hype: {
          version: 1,
          direction: "hype",
          title: "High Energy Hook",
          description: "Fast-paced snappy cuts",
          aspectRatio: finalAspect,
          targetDuration: finalDuration,
          totalDuration: 0,
          colorGrade: "vibrant",
          timeline: { clips: [], audioTracks: [], captions: [] },
          exportProfile: "standard",
          updatedAt: new Date().toISOString(),
        },
        clean: {
          version: 1,
          direction: "clean",
          title: "Minimal Studio",
          description: "Pristine cuts",
          aspectRatio: finalAspect,
          targetDuration: finalDuration,
          totalDuration: 0,
          colorGrade: "natural",
          timeline: { clips: [], audioTracks: [], captions: [] },
          exportProfile: "standard",
          updatedAt: new Date().toISOString(),
        },
      },
      versions: [],
    };

    ProjectStorage.save(newProject);
    return NextResponse.json({ success: true, project: newProject });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create project" }, { status: 500 });
  }
}
