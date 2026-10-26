"use client";

import { QualityReport, QualityIssue } from "@/lib/types";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  Wand2,
} from "lucide-react";

interface QualityInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: QualityReport;
  onAutoFix: () => void;
}

export function QualityInspectorModal({
  isOpen,
  onClose,
  report,
  onAutoFix,
}: QualityInspectorModalProps) {
  if (!isOpen) return null;

  const hasFixableIssues = report.issues.some((i) => i.autoFixAvailable);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#121624] p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                report.score >= 90
                  ? "bg-emerald-500/20 text-emerald-300"
                  : report.score >= 70
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AI Quality Inspector</h3>
              <p className="text-xs text-gray-400">
                Automated validation of black frames, micro-cuts, subtitle overlaps, and audio levels
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

        {/* Score banner */}
        <div className="py-4 flex items-center justify-between bg-black/30 px-4 rounded-xl my-4 border border-white/5">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Timeline Readiness Score</span>
            <span className="text-2xl font-black text-white font-mono">{report.score}%</span>
          </div>

          {hasFixableIssues && (
            <button
              onClick={onAutoFix}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all"
            >
              <Wand2 className="w-4 h-4" />
              Apply 1-Click Auto-Fix
            </button>
          )}
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {report.issues.length === 0 ? (
            <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-sm text-emerald-200">Zero Critical Issues Detected</p>
              <p className="text-xs text-gray-400 mt-1">
                Your timeline sequence is fully optimized and safe for immediate high-resolution rendering.
              </p>
            </div>
          ) : (
            report.issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  issue.type === "error"
                    ? "bg-red-950/30 border-red-500/40 text-red-200"
                    : "bg-amber-950/20 border-amber-500/30 text-amber-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    {issue.type === "error" ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    {issue.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40">
                    {issue.category}
                  </span>
                </div>
                <p className="text-gray-300 text-[11px] mb-2">{issue.description}</p>
                {issue.suggestedFix && (
                  <p className="text-[10px] font-mono text-violet-300 bg-black/30 p-2 rounded">
                    Fix recommendation: {issue.suggestedFix}
                  </p>
                )}
              </div>
            ))
          )}

          {/* Passed Checks */}
          <div className="pt-3 border-t border-white/5 space-y-1.5">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
              Passed Heuristic Checks
            </span>
            {report.passedChecks.map((chk, i) => (
              <p key={i} className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{chk}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
