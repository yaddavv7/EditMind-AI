"use client";

import { useState } from "react";
import { Project, SourceAsset } from "@/lib/types";
import { SearchFootageResult } from "@/lib/ai/footage-analysis";
import {
  Search,
  X,
  Sparkles,
  Film,
  CheckCircle2,
  Clock,
  Tag,
  Volume2,
  AlertTriangle,
  Play,
  Loader2,
} from "lucide-react";

interface FootageSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  inspectedAsset: SourceAsset | null;
  onSeekToTimestamp?: (time: number) => void;
}

export function FootageSearchDrawer({
  isOpen,
  onClose,
  project,
  inspectedAsset,
  onSeekToTimestamp,
}: FootageSearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchFootageResult[]>([]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch("/api/footage-intelligence/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, query }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQueries = [
    "Find sunset clips",
    "Show talking head dialogue",
    "Find ocean drone landscape",
    "Show neon night architecture",
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl h-full bg-[#101420] border-l border-white/10 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Footage Intelligence & Search</h3>
                <p className="text-[11px] text-gray-400">
                  Semantic scene detection, tags, speech transcripts & confidence matching
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ask e.g. 'Find sunset moments' or 'Show creator greeting'..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </button>
            </div>
          </form>

          {/* Sample quick pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sampleQueries.map((q) => (
              <button
                key={q}
                onClick={async () => {
                  setQuery(q);
                  setIsSearching(true);
                  try {
                    const res = await fetch("/api/footage-intelligence/search", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ projectId: project.id, query: q }),
                    });
                    const d = await res.json();
                    if (d.success) setSearchResults(d.results || []);
                  } finally {
                    setIsSearching(false);
                  }
                }}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-indigo-600/20 border border-white/10 text-[10px] text-gray-300 hover:text-indigo-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Center Results or Inspected Clip details */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-2">
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Matching Footage Results ({searchResults.length})
              </h4>
              {searchResults.map((res) => (
                <div
                  key={res.assetId}
                  className="p-3.5 rounded-xl border border-indigo-500/30 bg-[#141928] space-y-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-7 rounded bg-black overflow-hidden shrink-0">
                      {res.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={res.thumbnailUrl}
                          alt={res.assetName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="font-bold text-white text-xs truncate">{res.assetName}</span>
                  </div>

                  <div className="space-y-1.5">
                    {res.matchedScenes.map((sc) => (
                      <div
                        key={sc.sceneId}
                        className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-medium text-white text-[11px]">{sc.label}</p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            Timestamp: {sc.inTime}s - {sc.outTime}s • Matched: &ldquo;{sc.matchedTag}&rdquo;
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                          {sc.score}% confidence
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : inspectedAsset ? (
            /* Detailed Clip Inspector */
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-[#141928] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{inspectedAsset.originalName}</h4>
                  <span className="text-[10px] font-mono text-gray-400">
                    {inspectedAsset.width}x{inspectedAsset.height} • {inspectedAsset.duration.toFixed(1)}s
                  </span>
                </div>

                {/* Tags */}
                {inspectedAsset.intelligence?.tags && (
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block mb-1">
                      Detected Visual Tags:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inspectedAsset.intelligence.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality ratings */}
                {inspectedAsset.intelligence?.quality && (
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1">
                    <div className="p-2 rounded bg-black/40 border border-white/5">
                      <span className="text-gray-500 block text-[8px] uppercase">Sharpness</span>
                      <span className="text-emerald-400 font-bold">
                        {inspectedAsset.intelligence.quality.blurScore}/100
                      </span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-white/5">
                      <span className="text-gray-500 block text-[8px] uppercase">Exposure</span>
                      <span className="text-white font-bold capitalize">
                        {inspectedAsset.intelligence.quality.exposure}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-white/5">
                      <span className="text-gray-500 block text-[8px] uppercase">Audio Clarity</span>
                      <span className="text-violet-300 font-bold capitalize">
                        {inspectedAsset.intelligence.quality.audioClarity}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detected Scene Boundaries */}
              {inspectedAsset.intelligence?.scenes && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                    Scene Breakdown ({inspectedAsset.intelligence.scenes.length})
                  </span>
                  {inspectedAsset.intelligence.scenes.map((scene) => (
                    <div
                      key={scene.id}
                      className="p-2.5 rounded-lg border border-white/10 bg-[#121622] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white text-[11px]">{scene.label}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {scene.inTime.toFixed(1)}s - {scene.outTime.toFixed(1)}s
                        </p>
                      </div>
                      {scene.isHighlight && (
                        <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                          Highlight
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Transcript */}
              {inspectedAsset.intelligence?.transcript &&
                inspectedAsset.intelligence.transcript.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-white/10 bg-[#121622] space-y-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                      Spoken Audio Transcript
                    </span>
                    <div className="space-y-1">
                      {inspectedAsset.intelligence.transcript.map((w, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-1.5 py-0.5 rounded bg-black/40 text-[11px] text-gray-200 mr-1 mb-1 font-mono"
                        >
                          {w.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Film className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">
                Enter a query above or click any clip in the Media tab to inspect its intelligence profile.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
