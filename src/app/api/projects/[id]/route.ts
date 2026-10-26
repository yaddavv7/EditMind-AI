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
  return NextResponse.json({ success: true, project });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = ProjectStorage.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const updates = await req.json();
    const updated = ProjectStorage.save({
      ...existing,
      ...updates,
      id, // ensure ID is never overridden
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = ProjectStorage.delete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Project not found or already deleted" }, { status: 404 });
  }
  return NextResponse.json({ success: true, deleted: true });
}
