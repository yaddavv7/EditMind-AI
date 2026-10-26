import { NextRequest, NextResponse } from "next/server";
import { analyzeClipIntelligence } from "@/lib/ai/footage-analysis";
import { ProjectStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { projectId, assetId } = await req.json();
    const project = ProjectStorage.getById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const asset = project.assets.find((a) => a.id === assetId);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const intelligence = analyzeClipIntelligence(asset);
    asset.intelligence = intelligence;
    ProjectStorage.save(project);

    return NextResponse.json({ success: true, intelligence });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to analyze footage" },
      { status: 500 }
    );
  }
}
