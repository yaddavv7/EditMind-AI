import { NextRequest, NextResponse } from "next/server";
import { ProjectStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = ProjectStorage.getById(id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, versions: project.versions || [] });
}

// Restore a specific version
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = ProjectStorage.getById(id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { versionId } = await req.json();
  const targetVersion = (project.versions || []).find((v) => v.id === versionId);
  if (!targetVersion) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  // Restore the target version EDL to the active direction
  const activeDir = project.activeDirection || "story";
  project.directions[activeDir] = JSON.parse(JSON.stringify(targetVersion.edl));

  // Save with history notation
  ProjectStorage.addVersion(
    id,
    `Restored: ${targetVersion.title}`,
    `Reverted timeline to version #${targetVersion.versionNumber}`,
    targetVersion.edl
  );

  const updated = ProjectStorage.getById(id);
  return NextResponse.json({ success: true, project: updated });
}
