import { NextResponse } from "next/server";
import { ensureDemoAssetsExist } from "@/lib/ffmpeg/demo-generator";
import { ProjectStorage } from "@/lib/storage";
import { Project, SourceAsset } from "@/lib/types";
import { generateCreativeDirections } from "@/lib/ai/engine";
import { analyzeClipIntelligence } from "@/lib/ai/footage-analysis";
import { probeMediaFile } from "@/lib/ffmpeg/probe";
import { extractReferenceDNA } from "@/lib/ai/reference-dna";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 1. Ensure realistic synthetic/demo video clips exist
    const demoAssets = await ensureDemoAssetsExist();

    const projectId = "proj_demo_bali_travel";

    // Build source assets
    const assets: SourceAsset[] = [];
    for (let i = 0; i < demoAssets.clips.length; i++) {
      const c = demoAssets.clips[i];
      const asset: SourceAsset = {
        id: `demo_asset_${i + 1}`,
        projectId,
        filename: c.filename,
        originalName: c.originalName,
        filePath: `/uploads/${c.filename}`,
        url: c.url,
        thumbnailUrl: c.thumbnailUrl,
        duration: c.duration,
        width: c.width,
        height: c.height,
        fps: 30,
        aspectRatio: c.width > c.height ? "16:9" : "9:16",
        hasAudio: c.hasAudio,
        sizeBytes: 1024 * 1024 * 2,
        createdAt: new Date().toISOString(),
      };
      asset.intelligence = analyzeClipIntelligence(asset);
      assets.push(asset);
    }

    // Extract reference DNA for demo reference
    const refLocalPath = path.join(process.cwd(), "public", "uploads", demoAssets.reference.filename);
    const probe = await probeMediaFile(refLocalPath);
    const dna = extractReferenceDNA(probe, demoAssets.reference.originalName);

    const demoProject: Project = {
      id: projectId,
      name: "Bali Travel Reel & Cinematic Memories (Demo)",
      description: "Sample project with 4 pre-analyzed raw clips and extracted Reference DNA ready to edit.",
      aspectRatio: "9:16",
      targetDuration: 20,
      pacing: "fast",
      captionStyle: "bold_pop",
      captionLanguage: "en",
      colorGrade: "warm_cinematic",
      musicVolume: 0.7,
      audioDucking: true,
      activeDirection: "story",
      promptText: "Create a 20-second cinematic travel Reel from my clips. Start with an eye-catching horizon hook, use snappy transitions, warm colors, and clean beat-synced cuts.",
      selectedPresetId: "instagram-reel",
      status: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets,
      referenceAsset: {
        id: "ref_demo_1",
        projectId,
        filename: demoAssets.reference.filename,
        originalName: demoAssets.reference.originalName,
        url: demoAssets.reference.url,
        dna,
        createdAt: new Date().toISOString(),
      },
      directions: {
        story: {
          version: 1,
          direction: "story",
          title: "Narrative Arc",
          description: "Story-led pacing",
          aspectRatio: "9:16",
          targetDuration: 20,
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
          aspectRatio: "9:16",
          targetDuration: 20,
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
          aspectRatio: "9:16",
          targetDuration: 20,
          totalDuration: 0,
          colorGrade: "natural",
          timeline: { clips: [], audioTracks: [], captions: [] },
          exportProfile: "standard",
          updatedAt: new Date().toISOString(),
        },
      },
      versions: [],
    };

    // Generate creative directions
    demoProject.directions = generateCreativeDirections({
      project: demoProject,
      promptText: demoProject.promptText,
      targetDuration: 20,
      aspectRatio: "9:16",
      captionLanguage: "en",
    });

    // Save project
    ProjectStorage.save(demoProject);

    // Add initial version
    ProjectStorage.addVersion(
      projectId,
      "Initial Demo Setup",
      "Loaded 4 sample clips, extracted Reference DNA, and synthesized 3 creative directions.",
      demoProject.directions.story
    );

    const saved = ProjectStorage.getById(projectId);

    return NextResponse.json({
      success: true,
      message: "Demo project seeded successfully.",
      projectId,
      project: saved,
    });
  } catch (error: any) {
    console.error("Demo seed error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to seed demo project." },
      { status: 500 }
    );
  }
}
