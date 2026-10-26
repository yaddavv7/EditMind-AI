import { NextRequest, NextResponse } from "next/server";
import { ProjectStorage, RenderJobStorage } from "@/lib/storage";
import { renderTimelineToVideo } from "@/lib/ffmpeg/renderer";
import { RenderJob } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { projectId, edl, quality } = await req.json();

    const project = ProjectStorage.getById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const edlToRender = edl || project.directions[project.activeDirection || "story"];
    if (!edlToRender || !edlToRender.timeline?.clips?.length) {
      return NextResponse.json(
        { error: "Cannot render: No clips found on active timeline." },
        { status: 400 }
      );
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    let width = 1920;
    let height = 1080;
    if (edlToRender.aspectRatio === "9:16") {
      width = 1080;
      height = 1920;
    } else if (edlToRender.aspectRatio === "1:1") {
      width = 1080;
      height = 1080;
    }

    const job: RenderJob = {
      id: jobId,
      projectId,
      status: "processing",
      progress: 5,
      stage: "Queued for FFmpeg video engine",
      createdAt: new Date().toISOString(),
      specs: {
        width,
        height,
        duration: edlToRender.totalDuration,
        fps: 30,
        aspectRatio: edlToRender.aspectRatio,
        quality: quality || "standard",
      },
    };

    RenderJobStorage.create(job);

    // Update project with last render id
    project.lastRenderJobId = jobId;
    ProjectStorage.save(project);

    // Run async render job without blocking the HTTP response
    (async () => {
      try {
        const outputUrl = await renderTimelineToVideo({
          jobId,
          project,
          edl: edlToRender,
          quality: quality || "standard",
        });

        // Update project with rendered video URL
        const p = ProjectStorage.getById(projectId);
        if (p) {
          p.renderedVideoUrl = outputUrl;
          ProjectStorage.save(p);
        }
      } catch (err: any) {
        console.error("Render failed:", err);
        RenderJobStorage.update(jobId, {
          status: "failed",
          error: err?.message || "Unknown FFmpeg error during render",
          stage: "Render failed",
        });
      }
    })();

    return NextResponse.json({
      success: true,
      jobId,
      status: "processing",
      message: "Render job dispatched successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to start render job" },
      { status: 500 }
    );
  }
}
