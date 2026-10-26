"use client";

import { useState, useRef } from "react";
import { Project, SourceAsset, ReferenceDNA, CaptionLanguage, ColorGrade, AspectRatio } from "@/lib/types";
import { PRESET_RECIPES, DEMO_AUDIO_TRACKS } from "@/lib/constants";
import {
  Upload,
  Video,
  Sparkles,
  Sliders,
  Film,
  Search,
  Plus,
  Trash2,
  Check,
  Music,
  Languages,
  Play,
  Loader2,
  FileVideo,
  Info,
} from "lucide-react";

interface LeftPanelProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  onUploadClip: (file: File) => Promise<void>;
  onExtractReferenceDNA: (referenceUrl: string, filename: string) => Promise<void>;
  onInspectClip: (asset: SourceAsset) => void;
  onOpenSearchDrawer: () => void;
  onGenerateDirections: () => Promise<void>;
  isGenerating: boolean;
  isUploading: boolean;
}

export function LeftPanel({
  project,
  onUpdateProject,
  onUploadClip,
  onExtractReferenceDNA,
  onInspectClip,
  onOpenSearchDrawer,
  onGenerateDirections,
  isGenerating,
  isUploading,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<"media" | "dna" | "prompt" | "settings">("media");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const [analyzingDNA, setAnalyzingDNA] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await onUploadClip(e.target.files[0]);
    }
  };

  const handleRefFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAnalyzingDNA(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", project.id);
        formData.append("type", "reference");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success && data.asset) {
          await onExtractReferenceDNA(data.asset.url, data.asset.originalName);
        }
      } catch (err) {
        console.error("Reference upload error", err);
      } finally {
        setAnalyzingDNA(false);
      }
    }
  };

  const handleDemoReferenceExtract = async () => {
    setAnalyzingDNA(true);
    try {
      await onExtractReferenceDNA("/uploads/demo-reference-reel.mp4", "Demo Viral Travel Reel (9:16).mp4");
    } finally {
      setAnalyzingDNA(false);
    }
  };

  return (
    <aside className="w-80 h-full border-r border-white/10 bg-[#0E111B] flex flex-col select-none text-xs">
      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-white/10 bg-[#0B0D13]">
        {[
          { id: "media", label: "Media", icon: Film },
          { id: "dna", label: "Ref DNA", icon: Video },
          { id: "prompt", label: "Presets", icon: Sparkles },
          { id: "settings", label: "Settings", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 flex flex-col items-center justify-center gap-1 font-semibold transition-all ${
                isActive
                  ? "text-violet-400 border-b-2 border-violet-500 bg-white/5"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: MEDIA ASSETS */}
        {activeTab === "media" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Project Footage ({project.assets?.length || 0})
              </span>
              <button
                onClick={onOpenSearchDrawer}
                className="text-[10px] text-violet-300 hover:text-white flex items-center gap-1 font-medium"
              >
                <Search className="w-3 h-3" />
                Footage Search
              </button>
            </div>

            {/* Drag and Drop Upload Box */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border border-dashed border-white/20 hover:border-violet-500/60 bg-white/5 hover:bg-violet-950/20 text-center cursor-pointer transition-all group"
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin mb-1" />
                  <span className="text-violet-300 font-medium text-[11px]">
                    Probing & Analyzing Footage...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-1">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-violet-400 transition-colors mb-1" />
                  <span className="text-gray-200 font-semibold text-xs">Upload Raw Clips</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">MP4, MOV, WebM (up to 1080p/4K)</span>
                </div>
              )}
            </div>

            {/* Clips List */}
            <div className="space-y-2">
              {(project.assets || []).map((asset, idx) => (
                <div
                  key={asset.id}
                  className="p-2.5 rounded-xl border border-white/10 bg-[#121624] hover:border-violet-500/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-12 h-9 rounded-md bg-black/50 border border-white/10 overflow-hidden shrink-0 relative">
                      {asset.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-mono">
                          #{idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-white truncate text-xs">{asset.originalName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {asset.duration.toFixed(1)}s • {asset.width}x{asset.height}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onInspectClip(asset)}
                    className="p-1.5 rounded-md hover:bg-violet-600/20 text-gray-400 hover:text-violet-300 transition-colors shrink-0"
                    title="Inspect Footage Intelligence (Scenes, Tags, Transcript)"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick trigger to synthesize directions */}
            {project.assets?.length > 0 && (
              <button
                onClick={onGenerateDirections}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 transition-all mt-4"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isGenerating ? "Synthesizing Edit Decision Lists..." : "Generate AI Edit Plans"}
              </button>
            )}
          </div>
        )}

        {/* TAB 2: REFERENCE DNA */}
        {activeTab === "dna" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                Reference DNA
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Upload a video to extract average cut frequency, shot pacing, transition style, and
                color mood.
              </p>
            </div>

            {/* Reference Upload Box */}
            <input
              type="file"
              ref={refFileInputRef}
              onChange={handleRefFileChange}
              accept="video/*"
              className="hidden"
            />
            <div className="space-y-2">
              <button
                onClick={() => refFileInputRef.current?.click()}
                disabled={analyzingDNA}
                className="w-full py-2.5 rounded-xl border border-dashed border-violet-500/40 bg-violet-950/20 hover:bg-violet-950/40 text-violet-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {analyzingDNA ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload Reference Video
              </button>

              <button
                onClick={handleDemoReferenceExtract}
                disabled={analyzingDNA}
                className="w-full py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Use Sample Viral Travel Reference
              </button>
            </div>

            {/* Extracted DNA Profile Card */}
            {project.referenceAsset?.dna ? (
              <div className="p-4 rounded-xl border border-violet-500/30 bg-[#121624] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">
                    {project.referenceAsset.dna.styleName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-mono">
                    {project.referenceAsset.dna.confidenceScore}% match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-gray-500 block text-[9px] uppercase">Avg Shot</span>
                    <span className="text-white font-bold">
                      {project.referenceAsset.dna.averageShotDuration}s
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-gray-500 block text-[9px] uppercase">Cut Pacing</span>
                    <span className="text-violet-300 font-bold capitalize">
                      {project.referenceAsset.dna.cutFrequency}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-gray-500 block text-[9px] uppercase">Transitions</span>
                    <span className="text-indigo-300 font-bold capitalize">
                      {project.referenceAsset.dna.transitionStyle}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5">
                    <span className="text-gray-500 block text-[9px] uppercase">Color Mood</span>
                    <span className="text-blue-300 font-bold capitalize">
                      {project.referenceAsset.dna.colorMood.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Detected Rules list */}
                <div className="space-y-1 pt-1 border-t border-white/5">
                  <span className="text-[10px] text-gray-400 font-semibold">Detected Blueprint:</span>
                  {project.referenceAsset.dna.detectedRules.map((rule, idx) => (
                    <p key={idx} className="text-[10px] text-gray-400 flex items-start gap-1.5">
                      <span className="text-violet-400 font-bold">•</span>
                      <span>{rule}</span>
                    </p>
                  ))}
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => {
                    const dna = project.referenceAsset!.dna;
                    onUpdateProject({
                      aspectRatio: dna.preferredAspectRatio,
                      pacing: dna.pacing,
                      captionStyle: dna.captionStyle,
                      colorGrade: dna.colorMood,
                    });
                    alert("Applied Reference DNA settings to project canvas, color, and pacing!");
                  }}
                  className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply DNA to Timeline
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-white/10 bg-[#121622] text-center text-gray-400">
                <Video className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-xs">No reference video analyzed yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROMPT & PRESETS */}
        {activeTab === "prompt" && (
          <div className="space-y-4">
            {/* Prompt Editor */}
            <div>
              <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-1.5">
                Natural Language Prompt
              </label>
              <textarea
                rows={4}
                value={project.promptText || ""}
                onChange={(e) => onUpdateProject({ promptText: e.target.value })}
                placeholder="Describe your vision, pacing, music vibe, and styling..."
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            {/* Quick Prompt Enhancers */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "Faster cuts",
                "Warm golden hour",
                "Bold viral captions",
                "Smooth cinematic dissolves",
                "Lo-fi background beat",
              ].map((pill) => (
                <button
                  key={pill}
                  onClick={() => {
                    const current = project.promptText || "";
                    onUpdateProject({ promptText: current ? `${current}. ${pill}.` : pill });
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 hover:text-white transition-colors"
                >
                  + {pill}
                </button>
              ))}
            </div>

            {/* Preset Selector */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-2">
                Apply Editing Preset (20+)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {PRESET_RECIPES.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onUpdateProject({
                        selectedPresetId: preset.id,
                        promptText: preset.promptTemplate,
                        aspectRatio: preset.aspectRatio,
                        targetDuration: preset.targetDuration,
                        pacing: preset.pacing,
                        captionStyle: preset.captionStyle,
                        colorGrade: preset.colorTreatment,
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      project.selectedPresetId === preset.id
                        ? "bg-violet-950/40 border-violet-500 text-white"
                        : "bg-[#121624] border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{preset.title}</span>
                      <span className="text-[9px] font-mono text-violet-400">{preset.category}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{preset.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onGenerateDirections}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isGenerating ? "Synthesizing Directions..." : "Generate 3 Creative Directions"}
            </button>
          </div>
        )}

        {/* TAB 4: PROJECT SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            {/* Canvas Format */}
            <div>
              <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-1.5">
                Canvas Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "9:16", name: "Vertical", sub: "TikTok" },
                  { id: "16:9", name: "Widescreen", sub: "YouTube" },
                  { id: "1:1", name: "Square", sub: "Post" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onUpdateProject({ aspectRatio: r.id as AspectRatio })}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      project.aspectRatio === r.id
                        ? "bg-violet-600/20 border-violet-500 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="font-mono font-bold text-xs">{r.id}</div>
                    <div className="text-[9px] text-gray-400">{r.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Duration */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                <span>Target Duration</span>
                <span className="font-mono text-violet-400">{project.targetDuration}s</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={project.targetDuration}
                onChange={(e) => onUpdateProject({ targetDuration: parseInt(e.target.value) })}
                className="w-full accent-violet-600"
              />
            </div>

            {/* Caption Language (Indic Support) */}
            <div>
              <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-1.5">
                Caption Script & Language
              </label>
              <select
                value={project.captionLanguage || "en"}
                onChange={(e) =>
                  onUpdateProject({ captionLanguage: e.target.value as CaptionLanguage })
                }
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="en">English (Latin Script)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिन्दी)</option>
              </select>
            </div>

            {/* Color Grade */}
            <div>
              <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-1.5">
                Color Grading Treatment
              </label>
              <select
                value={project.colorGrade || "warm_cinematic"}
                onChange={(e) => onUpdateProject({ colorGrade: e.target.value as ColorGrade })}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="natural">Natural (True Color)</option>
                <option value="warm_cinematic">Warm Filmic Golden Hour</option>
                <option value="moody_teal_orange">Moody Teal & Orange</option>
                <option value="vintage_film">Vintage 35mm Film</option>
                <option value="vibrant">Vibrant & Pop</option>
                <option value="monochrome">Monochrome Black & White</option>
              </select>
            </div>

            {/* Music Track & Volume */}
            <div>
              <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-1.5">
                Background Music
              </label>
              <select
                value={project.selectedMusicId || "audio-ambient-cinematic"}
                onChange={(e) => onUpdateProject({ selectedMusicId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500 mb-2"
              >
                {DEMO_AUDIO_TRACKS.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                <span>Music Volume</span>
                <span className="font-mono">{Math.round((project.musicVolume || 0.65) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={project.musicVolume !== undefined ? project.musicVolume : 0.65}
                onChange={(e) => onUpdateProject({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-violet-600"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
