import { NextRequest, NextResponse } from "next/server";
import { ProjectStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const duplicated = ProjectStorage.duplicate(id);
  if (!duplicated) {
    return NextResponse.json({ error: "Failed to duplicate project" }, { status: 404 });
  }
  return NextResponse.json({ success: true, project: duplicated });
}
