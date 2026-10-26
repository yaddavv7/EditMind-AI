"use client";

import { useState, useRef, useEffect } from "react";
import { CreativeDirectionType, EditDecisionList, Project, SourceAsset } from "@/lib/types";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Smartphone,
  Monitor,
  Square,
  Eye,
  EyeOff,
} from "lucide-react";

interface CenterPreviewProps {
  project: Project;
  activeDirection: CreativeDirectionType;
  onChangeDirection: (dir: CreativeDirectionType) => void;
  activeEdl: EditDecisionList;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function CenterPreview({
  project,
  activeDirection,
  onChangeDirection,
  activeEdl,
  currentTime,
  onSeek,
  isPlaying,
  onTogglePlay,
}: CenterPreviewProps) {
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const totalDuration = Math.max(activeEdl.totalDuration || 1, 1);

  // Find the active clip and current caption for currentTime
  let accumulatedTime = 0;
  let activeClipUrl: string | null = null;
  let clipLocalTime = 0;

  const assetMap = new Map(project.assets.map((a) => [a.id, a]));

  for (const clip of activeEdl.timeline.clips) {
    if (currentTime >= accumulatedTime && currentTime <= accumulatedTime + clip.duration) {
      const asset = assetMap.get(clip.sourceAssetId);
      if (asset) {
        activeClipUrl = asset.url;
        clipLocalTime = clip.sourceIn + (currentTime - accumulatedTime) * (clip.speed || 1);
      }
      break;
    }
    accumulatedTime += clip.duration;
  }

  // Fallback to rendered video if available and no active clip
  const videoSourceUrl = project.renderedVideoUrl || activeClipUrl || project.assets[0]?.url;

  // Sync native HTML5 video element with playhead
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Find active caption text at currentTime
  const currentCaption = activeEdl.timeline.captions.find(
    (cap) => currentTime >= cap.start && currentTime <= cap.end
  );

  // Aspect ratio canvas dimensions styling
  let canvasStyle = "w-[300px] h-[533px]"; // 9:16
  if (activeEdl.aspectRatio === "16:9") {
    canvasStyle = "w-[560px] h-[315px]";
  } else if (activeEdl.aspectRatio === "1:1") {
    canvasStyle = "w-[400px] h-[400px]";
  }

  // Format time MM:SS.S
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return `${mins.toString().padStart(2, "0")}:${parseFloat(s) < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex-1 h-full bg-[#090B10] flex flex-col justify-between p-4 overflow-hidden select-none">
      {/* Top bar: 3 Creative Directions selector & Safe zones toggle */}
      <div className="flex items-center justify-between gap-4 mb-2">
        {/* Directions Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 shadow-sm">
          <span className="text-[10px] text-gray-400 font-semibold uppercase px-2">Directions:</span>
          {[
            { id: "story", label: "Story", badge: "Narrative Arc" },
            { id: "hype", label: "Hype", badge: "Fast Cuts" },
            { id: "clean", label: "Clean", badge: "Minimal" },
          ].map((dir) => {
            const isActive = activeDirection === dir.id;
            return (
              <button
                key={dir.id}
                onClick={() => onChangeDirection(dir.id as CreativeDirectionType)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{dir.label}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded ${
                    isActive ? "bg-white/20 text-white" : "text-gray-500"
                  }`}
                >
                  {dir.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Safe-zone toggle */}
        <div className="flex items-center gap-2">
          {project.renderedVideoUrl && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
              Playing Rendered Master MP4
            </span>
          )}
          <button
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              showSafeZone
                ? "bg-violet-600/20 border-violet-500 text-violet-300"
                : "border-white/10 text-gray-400 hover:text-white"
            }`}
            title="Toggle platform safe-zone overlay (TikTok/Reels UI margins)"
          >
            {showSafeZone ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="text-[11px]">Safe Zone</span>
          </button>
        </div>
      </div>

      {/* Center Video Canvas */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 py-2">
        <div
          className={`relative rounded-2xl border border-white/15 bg-black overflow-hidden shadow-2xl flex items-center justify-center ${canvasStyle}`}
        >
          {videoSourceUrl ? (
            <video
              ref={videoRef}
              src={videoSourceUrl}
              muted={isMuted}
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-500 p-4">
              <Play className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Upload clips or synthesize directions to preview</p>
            </div>
          )}

          {/* Subtitle / Caption Overlay */}
          {currentCaption && (
            <div className="absolute inset-x-4 bottom-12 text-center pointer-events-none z-10">
              <span
                className={`inline-block px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all ${
                  currentCaption.style === "bold_pop"
                    ? "bg-violet-600 text-white text-sm sm:text-base shadow-lg shadow-black/80 uppercase"
                    : currentCaption.style === "cinema"
                    ? "text-yellow-300 text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-widest font-serif"
                    : "bg-black/70 backdrop-blur-sm text-white text-xs sm:text-sm border border-white/20"
                }`}
              >
                {currentCaption.text}
              </span>
            </div>
          )}

          {/* Safe Zone Overlay */}
          {showSafeZone && (
            <div className="absolute inset-0 pointer-events-none border-2 border-red-500/40 m-6 flex flex-col justify-between text-[10px] text-red-400 font-mono p-2">
              <div className="text-center bg-black/40 px-2 py-0.5 rounded">
                Reels / TikTok Title Safe Line
              </div>
              <div className="text-right pr-2">Like / Share Icons Safe Area &rarr;</div>
              <div className="text-center bg-black/40 px-2 py-0.5 rounded">
                Caption & Audio Safe Line
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls Bar */}
      <div className="h-12 border border-white/10 rounded-xl bg-[#111522] px-4 flex items-center justify-between text-xs text-gray-300 shadow-lg">
        {/* Play/Pause & Time */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all shadow-md shadow-violet-600/30"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <span className="font-mono text-xs text-gray-300">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>

        {/* Audio Mute & Volume */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 rounded text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false);
              setVolume(parseFloat(e.target.value));
              if (videoRef.current) videoRef.current.volume = parseFloat(e.target.value);
            }}
            className="w-16 accent-violet-600"
          />

          <button
            onClick={() => {
              if (videoRef.current) {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  videoRef.current.requestFullscreen().catch(() => {});
                }
              }
            }}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-2"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
