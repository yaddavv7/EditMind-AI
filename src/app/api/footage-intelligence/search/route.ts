import { NextRequest, NextResponse } from "next/server";
import { searchFootageClips } from "@/lib/ai/footage-analysis";
import { ProjectStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { projectId, query } = await req.json();
    const project = ProjectStorage.getById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const results = searchFootageClips(project.assets || [], query || "");
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to search footage" },
      { status: 500 }
    );
  }
}
