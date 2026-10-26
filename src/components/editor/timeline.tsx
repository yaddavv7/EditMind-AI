"use client";

import { useState, useRef } from "react";
import { EditDecisionList, Project, TimelineClip } from "@/lib/types";
import {
  Film,
  Type,
  Music,
  Scissors,
  Layers,
  Volume2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TimelineProps {
  project: Project;
  activeEdl: EditDecisionList;
  selectedClipId: string | null;
  onSelectClip: (clip: TimelineClip) => void;
  onUpdateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  currentTime: number;
  onSeek: (time: number) => void;
  onReorderClips: (startIndex: number, endIndex: number) => void;
}

export function Timeline({
  project,
  activeEdl,
  selectedClipId,
  onSelectClip,
  onUpdateClip,
  currentTime,
  onSeek,
  onReorderClips,
}: TimelineProps) {
  const [zoomLevel, setZoomLevel] = useState(24); // pixels per second
  const containerRef = useRef<HTMLDivElement>(null);

  const totalDuration = Math.max(activeEdl.totalDuration || 1, 1);
  const assetMap = new Map(project.assets.map((a) => [a.id, a]));

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
    onSeek(newTime);
  };

  // Build second ticks
  const ticks = [];
  const maxSec = Math.ceil(totalDuration) + 5;
  for (let s = 0; s <= maxSec; s += 2) {
    ticks.push(s);
  }

  return (
    <div className="h-64 border-t border-white/10 bg-[#0B0D13] flex flex-col select-none text-xs">
      {/* Timeline Toolbar */}
      <div className="h-9 border-b border-white/10 px-4 flex items-center justify-between text-gray-400 bg-[#0E111B]">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="font-semibold text-white">Multi-Track Sequence</span>
          <span className="text-gray-500 font-mono">
            {activeEdl.timeline.clips.length} Clips • {activeEdl.timeline.captions.length} Captions
          </span>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(12, prev - 4))}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] text-gray-400">{zoomLevel}px/s</span>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(60, prev + 4))}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Track Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left column) */}
        <div className="w-24 border-r border-white/10 bg-[#0E111B] flex flex-col shrink-0 text-[10px] font-semibold text-gray-400">
          <div className="h-6 border-b border-white/10 flex items-center px-2 font-mono text-[9px] text-gray-500">
            TIME
          </div>
          <div className="h-20 border-b border-white/10 flex items-center gap-1.5 px-2 text-violet-300">
            <Film className="w-3.5 h-3.5" />
            <span>V1 Video</span>
          </div>
          <div className="h-10 border-b border-white/10 flex items-center gap-1.5 px-2 text-indigo-300">
            <Type className="w-3.5 h-3.5" />
            <span>C1 Sub</span>
          </div>
          <div className="h-10 flex items-center gap-1.5 px-2 text-emerald-300">
            <Music className="w-3.5 h-3.5" />
            <span>A1 Music</span>
          </div>
        </div>

        {/* Scrollable Tracks Area */}
        <div
          ref={containerRef}
          onClick={handleTimelineClick}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#090B10] cursor-pointer"
        >
          {/* Playhead Vertical Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none transition-all duration-75"
            style={{ left: `${currentTime * zoomLevel}px` }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -ml-[5px] -mt-1 shadow-md" />
          </div>

          {/* Time Ruler */}
          <div className="h-6 border-b border-white/10 flex items-end relative text-[9px] text-gray-500 font-mono">
            {ticks.map((s) => (
              <div
                key={s}
                className="absolute bottom-0 border-l border-white/10 pl-1 pb-0.5"
                style={{ left: `${s * zoomLevel}px` }}
              >
                00:{s < 10 ? `0${s}` : s}
              </div>
            ))}
          </div>

          {/* Track 1: Video Track */}
          <div className="h-20 border-b border-white/10 relative flex items-center px-1">
            {activeEdl.timeline.clips.map((clip, idx) => {
              const asset = assetMap.get(clip.sourceAssetId);
              const isSelected = selectedClipId === clip.id;
              const clipWidth = Math.max(40, clip.duration * zoomLevel);

              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClip(clip);
                  }}
                  style={{ width: `${clipWidth}px` }}
                  className={`h-16 rounded-lg mr-1 border relative overflow-hidden transition-all flex flex-col justify-between p-1.5 shrink-0 ${
                    isSelected
                      ? "bg-violet-950/70 border-violet-400 shadow-lg shadow-violet-500/20"
                      : "bg-[#141824] border-white/15 hover:border-violet-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-white font-medium truncate">
                    <span className="truncate">
                      #{idx + 1} {asset?.originalName || "Clip"}
                    </span>
                    <span className="text-[9px] font-mono text-violet-300">
                      {clip.duration.toFixed(1)}s
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
                    <span className="capitalize">{clip.transitionIn?.type || "Cut"}</span>
                    <span>{clip.speed || 1}x</span>
                  </div>

                  {/* Trim handle indication */}
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-violet-500/40 hover:bg-violet-400 cursor-ew-resize" />
                </div>
              );
            })}
          </div>

          {/* Track 2: Caption Track */}
          <div className="h-10 border-b border-white/10 relative flex items-center px-1">
            {activeEdl.timeline.captions.map((cap) => {
              const capStartPx = cap.start * zoomLevel;
              const capWidthPx = Math.max(30, (cap.end - cap.start) * zoomLevel);

              return (
                <div
                  key={cap.id}
                  style={{
                    left: `${capStartPx}px`,
                    width: `${capWidthPx}px`,
                  }}
                  className="absolute h-7 rounded bg-indigo-950/60 border border-indigo-500/40 px-2 flex items-center justify-between text-[10px] text-indigo-200 truncate"
                >
                  <span className="truncate">{cap.text}</span>
                  <span className="text-[8px] font-mono text-indigo-400 uppercase ml-1">
                    {cap.language}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Track 3: Audio/Music Track */}
          <div className="h-10 relative flex items-center px-1">
            {activeEdl.timeline.audioTracks.map((track) => {
              const trkWidthPx = Math.max(50, track.duration * zoomLevel);
              return (
                <div
                  key={track.id}
                  style={{ width: `${trkWidthPx}px` }}
                  className="h-7 rounded bg-emerald-950/50 border border-emerald-500/30 px-2 flex items-center justify-between text-[10px] text-emerald-200 truncate"
                >
                  <div className="flex items-center gap-1 truncate">
                    <Music className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{track.title}</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 ml-2">
                    {Math.round(track.volume * 100)}% {track.ducking ? "(Ducking)" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
