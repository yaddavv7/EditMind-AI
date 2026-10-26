import { NextRequest, NextResponse } from "next/server";
import { processConversationalEdit } from "@/lib/ai/conversational";
import { ProjectStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { projectId, instruction, currentEdl } = await req.json();

    const project = ProjectStorage.getById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const edlToUse = currentEdl || project.directions[project.activeDirection || "story"];
    if (!edlToUse) {
      return NextResponse.json(
        { error: "No active edit decision list found to edit." },
        { status: 400 }
      );
    }

    const result = processConversationalEdit(project, edlToUse, instruction || "");

    // Update active direction in project
    const activeDir = project.activeDirection || "story";
    project.directions[activeDir] = result.updatedEdl;

    // Save project with version record
    ProjectStorage.addVersion(
      projectId,
      result.changeSummary || "Conversational Refinement",
      result.assistantReply,
      result.updatedEdl
    );

    const updated = ProjectStorage.getById(projectId);

    return NextResponse.json({
      success: true,
      updatedEdl: result.updatedEdl,
      changeSummary: result.changeSummary,
      assistantReply: result.assistantReply,
      appliedActions: result.appliedActions,
      project: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process conversational command" },
      { status: 500 }
    );
  }
}
