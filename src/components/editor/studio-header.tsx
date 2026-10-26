"use client";

import Link from "next/link";
import { useState } from "react";
import { Project, EditDecisionList, QualityReport } from "@/lib/types";
import {
  Film,
  ArrowLeft,
  Sparkles,
  Download,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  RotateCw,
  Save,
  Check,
  Video,
  Play,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface StudioHeaderProps {
  project: Project;
  activeEdl: EditDecisionList;
  qualityReport: QualityReport;
  onOpenQualityInspector: () => void;
  onOpenExportModal: () => void;
  onSaveProject: () => void;
  isSaving: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function StudioHeader({
  project,
  activeEdl,
  qualityReport,
  onOpenQualityInspector,
  onOpenExportModal,
  onSaveProject,
  isSaving,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: StudioHeaderProps) {
  const hasErrors = qualityReport.issues.some((i) => i.type === "error");
  const hasWarnings = qualityReport.issues.some((i) => i.type === "warning");

  return (
    <header className="h-14 border-b border-white/10 bg-[#0B0D13] px-4 flex items-center justify-between text-xs select-none z-20">
      {/* Left: Back + Project Name */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center text-white">
            <Film className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight truncate max-w-[200px] sm:max-w-xs">
            {project.name}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">
            {activeEdl.aspectRatio}
          </span>
        </div>
      </div>

      {/* Center: History & Direction info */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Undo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Redo"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-white/10 mx-1" />
        <span className="text-[11px] font-mono text-gray-400">
          Target: {activeEdl.totalDuration.toFixed(1)}s / {project.targetDuration}s
        </span>
      </div>

      {/* Right: Quality Inspector, Save, Export */}
      <div className="flex items-center gap-2.5">
        {/* Quality Inspector Trigger */}
        <button
          onClick={onOpenQualityInspector}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            hasErrors
              ? "bg-red-500/10 border-red-500/40 text-red-300"
              : hasWarnings
              ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
          title="AI Quality Inspector"
        >
          {hasErrors ? (
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="hidden sm:inline">Quality Score</span>
          <span className="font-mono">{qualityReport.score}%</span>
        </button>

        {/* Save button */}
        <button
          onClick={onSaveProject}
          disabled={isSaving}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
          title="Save project changes"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
        </button>

        {/* Render & Export Trigger */}
        <button
          onClick={onOpenExportModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Render & Export</span>
        </button>
      </div>
    </header>
  );
}
