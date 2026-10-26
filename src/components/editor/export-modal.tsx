"use client";

import { useState, useEffect } from "react";
import { EditDecisionList, ExportQuality, Project, RenderJob } from "@/lib/types";
import {
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  activeEdl: EditDecisionList;
  onRenderSuccess: (videoUrl: string) => void;
}

export function ExportModal({
  isOpen,
  onClose,
  project,
  activeEdl,
  onRenderSuccess,
}: ExportModalProps) {
  const [quality, setQuality] = useState<ExportQuality>("standard");
  const [resolution, setResolution] = useState<"1080p" | "720p">("1080p");
  const [isRendering, setIsRendering] = useState(false);
  const [activeJob, setActiveJob] = useState<RenderJob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (activeJob && (activeJob.status === "processing" || activeJob.status === "queued")) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/render/${activeJob.id}`);
          const data = await res.json();
          if (data.success && data.job) {
            setActiveJob(data.job);
            if (data.job.status === "completed") {
              setIsRendering(false);
              if (data.job.outputUrl) onRenderSuccess(data.job.outputUrl);
            } else if (data.job.status === "failed") {
              setIsRendering(false);
              setErrorMsg(data.job.error || "FFmpeg encountered an error rendering the timeline.");
            }
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJob, onRenderSuccess]);

  if (!isOpen) return null;

  const handleStartRender = async () => {
    setIsRendering(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          edl: activeEdl,
          quality,
        }),
      });
      const data = await res.json();
      if (data.success && data.jobId) {
        setActiveJob({
          id: data.jobId,
          projectId: project.id,
          status: "processing",
          progress: 5,
          stage: "Queued for FFmpeg video engine",
          createdAt: new Date().toISOString(),
          specs: {
            width: activeEdl.aspectRatio === "9:16" ? 1080 : 1920,
            height: activeEdl.aspectRatio === "9:16" ? 1920 : 1080,
            duration: activeEdl.totalDuration,
            fps: 30,
            aspectRatio: activeEdl.aspectRatio,
            quality,
          },
        });
      } else {
        setIsRendering(false);
        setErrorMsg(data.error || "Failed to start render job.");
      }
    } catch (err: any) {
      setIsRendering(false);
      setErrorMsg(err.message || "Network error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121624] p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Render & Export Master Video</h3>
              <p className="text-xs text-gray-400">
                Deterministic FFmpeg video encoding with audio mixing and burnt styling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          {/* Timeline Summary Box */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-gray-500 block text-[10px]">OUTPUT CANVAS</span>
              <span className="text-white font-bold">{activeEdl.aspectRatio}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">TOTAL DURATION</span>
              <span className="text-violet-400 font-bold">{activeEdl.totalDuration.toFixed(1)}s</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">CLIPS</span>
              <span className="text-white font-bold">{activeEdl.timeline.clips.length} cuts</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">COLOR GRADE</span>
              <span className="text-indigo-300 font-bold capitalize">
                {activeEdl.colorGrade.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Quality Mode Selection */}
          {!isRendering && activeJob?.status !== "completed" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Rendering Quality Profile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "draft", label: "Draft", desc: "Fastest Preview" },
                    { id: "standard", label: "Standard", desc: "CRF 23 • Balanced" },
                    { id: "high_quality", label: "High Quality", desc: "CRF 18 • Pristine" },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuality(q.id as ExportQuality)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        quality === q.id
                          ? "bg-violet-600/20 border-violet-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-xs">{q.label}</div>
                      <div className="text-[10px] text-gray-400">{q.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Target Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "1080p", label: "1080p Full HD", desc: "1080x1920 (Optimal for Reels)" },
                    { id: "720p", label: "720p Fast HD", desc: "720x1280 (Quicker encode)" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setResolution(r.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        resolution === r.id
                          ? "bg-violet-600/20 border-violet-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-xs">{r.label}</div>
                      <div className="text-[10px] text-gray-400">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Rendering Progress Display */}
          {(isRendering || activeJob?.status === "completed" || activeJob?.status === "failed") && (
            <div className="p-4 rounded-xl border border-violet-500/30 bg-[#0E111B] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  {activeJob?.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : activeJob?.status === "failed" ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  )}
                  {activeJob?.stage || "Processing render..."}
                </span>
                <span className="font-mono text-violet-400 font-bold">
                  {activeJob?.progress || 0}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    activeJob?.status === "completed"
                      ? "bg-emerald-500"
                      : activeJob?.status === "failed"
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-violet-600 to-indigo-500"
                  }`}
                  style={{ width: `${activeJob?.progress || 0}%` }}
                />
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-[11px] text-red-300">
                  {errorMsg}
                </div>
              )}

              {/* Render Completed Actions */}
              {activeJob?.status === "completed" && activeJob.outputUrl && (
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={activeJob.outputUrl}
                    download={`EditMind_${project.name.replace(/\s+/g, "_")}.mp4`}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Master MP4
                  </a>
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    Return to Studio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isRendering && activeJob?.status !== "completed" && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleStartRender}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start FFmpeg Render
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
