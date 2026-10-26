"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PRESET_RECIPES } from "@/lib/constants";
import {
  Sparkles,
  Play,
  Video,
  Layers,
  Wand2,
  Cpu,
  ShieldCheck,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Sliders,
  ArrowRight,
  Loader2,
  Film,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [seeding, setSeeding] = useState(false);

  const categories = ["ALL", "CINEMATIC", "SOCIAL MEDIA", "BUSINESS", "PERSONAL", "EDUCATIONAL"];

  const filteredPresets =
    selectedCategory === "ALL"
      ? PRESET_RECIPES
      : PRESET_RECIPES.filter((p) => p.category === selectedCategory);

  const handleLaunchDemo = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/demo-seed", { method: "POST" });
      const data = await res.json();
      if (data.success && data.projectId) {
        router.push(`/editor/${data.projectId}`);
      } else {
        alert("Failed to seed demo: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleSelectPreset = async (presetId: string) => {
    try {
      setSeeding(true);
      const preset = PRESET_RECIPES.find((p) => p.id === presetId);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${preset?.title || "New"} Project`,
          presetId,
          aspectRatio: preset?.aspectRatio,
          targetDuration: preset?.targetDuration,
        }),
      });
      const data = await res.json();
      if (data.success && data.project?.id) {
        router.push(`/editor/${data.project.id}`);
      }
    } catch (err: any) {
      alert("Error creating project: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D13]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-24 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-indigo-500/15 to-blue-500/15 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Next-Generation Autonomous Video Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Your Vision.{" "}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
                Edited by AI.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-300 mb-10 leading-relaxed font-normal">
              Turn your raw footage into incredible videos using natural language prompts, creative
              presets, or a reference video.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <button
                onClick={handleLaunchDemo}
                disabled={seeding}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {seeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                {seeding ? "Loading Demo Studio..." : "Start Creating (Instant Demo)"}
              </button>

              <a
                href="#presets"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 hover:border-violet-500/40 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white font-medium text-sm sm:text-base transition-all"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                Explore Editing Styles
              </a>
            </div>

            {/* Core promise quote */}
            <div className="max-w-xl mx-auto p-4 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-sm text-center">
              <p className="text-sm font-medium text-gray-300 italic">
                &ldquo;Show us what you want. Give us your clips. Get an edit you can actually control.&rdquo;
              </p>
            </div>
          </div>

          {/* Interactive Studio Preview Mockup */}
          <div className="max-w-5xl mx-auto px-4 mt-14 relative z-10">
            <div className="rounded-2xl border border-white/15 bg-[#121622] shadow-2xl shadow-violet-950/40 overflow-hidden">
              {/* Studio window header */}
              <div className="px-4 py-3 border-b border-white/10 bg-[#0E111B] flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-gray-300">
                    EditMind Studio — Bali_Travel_Reel_2026.emp
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                    FFmpeg Accelerated
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    1080x1920 (9:16)
                  </span>
                </div>
              </div>

              {/* Mock workspace inner */}
              <div className="grid grid-cols-12 h-[380px] bg-[#0E111B]">
                {/* Left Panel */}
                <div className="col-span-3 border-r border-white/10 p-3 space-y-3 bg-[#111520] hidden sm:block">
                  <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Source Footage</span>
                    <span className="text-violet-400 text-[10px]">4 Clips</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
                      <div className="w-10 h-7 rounded bg-violet-900/40 border border-violet-500/30 flex items-center justify-center text-[10px] text-violet-300 font-bold">
                        01
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-xs text-white truncate font-medium">Sunset Cliff Vista</p>
                        <p className="text-[10px] text-gray-400">6.0s • 4K • Outdoor</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
                      <div className="w-10 h-7 rounded bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-300 font-bold">
                        02
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-xs text-white truncate font-medium">Azure Ocean Drone</p>
                        <p className="text-[10px] text-gray-400">6.0s • 4K • Travel</p>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
                      <div className="w-10 h-7 rounded bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-[10px] text-purple-300 font-bold">
                        03
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-xs text-white truncate font-medium">Downtown Neon Glow</p>
                        <p className="text-[10px] text-gray-400">6.0s • 4K • Cyber</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Canvas Preview */}
                <div className="col-span-12 sm:col-span-6 p-4 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#0B0D14] to-[#121622]">
                  <div className="relative w-44 h-72 rounded-xl border border-white/20 bg-black overflow-hidden shadow-2xl flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/30 via-violet-600/30 to-blue-600/30" />
                    <div className="z-10 text-center px-4">
                      <div className="inline-block px-2 py-0.5 rounded bg-black/60 border border-white/20 text-[10px] font-mono text-violet-300 mb-2">
                        Preview • 00:04.2 / 00:20.0
                      </div>
                      <p className="text-xs font-extrabold text-white drop-shadow-md tracking-wide uppercase">
                        &quot;Golden Hour Horizons&quot;
                      </p>
                    </div>
                    {/* Safe zone lines indicator */}
                    <div className="absolute inset-x-2 bottom-3 border-t border-dashed border-red-500/40 text-[8px] text-red-400 text-center pt-0.5">
                      Reels Safe Zone
                    </div>
                  </div>
                  {/* 3 Directions Badges */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-violet-600 text-white">
                      Story (Active)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-gray-400">
                      Hype
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-gray-400">
                      Clean
                    </span>
                  </div>
                </div>

                {/* Right Panel: AI Assistant */}
                <div className="col-span-3 border-l border-white/10 p-3 bg-[#111520] hidden sm:flex flex-col justify-between text-left">
                  <div>
                    <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span>AI Editor Assistant</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-300 leading-relaxed mb-2">
                      <span className="text-violet-400 font-medium">User:</span> &ldquo;Make the
                      intro faster and keep warm colors.&rdquo;
                    </div>
                    <div className="p-2.5 rounded-lg bg-violet-950/30 border border-violet-500/20 text-[11px] text-violet-200 leading-relaxed">
                      <span className="text-violet-300 font-semibold">Assistant:</span> Trimmed
                      opening shot from 3.5s to 1.8s and reinforced golden hour split-toning.
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Quality Inspector</span>
                    <span className="text-emerald-400 font-bold">100% Passed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SIGNATURE FEATURES SHOWCASE */}
        <section id="dna" className="py-20 border-t border-white/10 bg-[#0E111B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">
                Signature Intelligence
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Features You Won&apos;t Find in Traditional Editors
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1: Reference DNA */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#121624] hover:border-violet-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Reference DNA</h4>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    Upload any inspirational reference video. EditMind AI extracts cut frequency, shot
                    durations, pacing curves, transition styles, and caption formatting into an
                    editable style blueprint.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 text-xs text-violet-300 font-mono flex items-center justify-between">
                  <span>Shot duration: 2.8s</span>
                  <span className="px-2 py-0.5 rounded bg-violet-500/20">Clean Cuts</span>
                </div>
              </div>

              {/* Feature 2: Footage Intelligence */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#121624] hover:border-indigo-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Footage Intelligence</h4>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    Deep scene analysis detects facial expressions, landscape horizons, action
                    moments, and full speech transcripts. Query your footage using natural language:
                    &ldquo;Find the sunset clip&rdquo;.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 text-xs text-indigo-300 font-mono flex items-center justify-between">
                  <span>Semantic Scene Search</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20">Instant Confidence</span>
                </div>
              </div>

              {/* Feature 3: Three Creative Directions */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#121624] hover:border-blue-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Three Creative Directions</h4>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    Get three genuinely distinct editing recipes: <strong>STORY</strong> (emotional arc,
                    gentle pacing), <strong>HYPE</strong> (rapid cuts, punchy hook), and{" "}
                    <strong>CLEAN</strong> (minimalist studio polish).
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 text-xs text-blue-300 font-mono flex items-center justify-between">
                  <span>1-Click Direction Compare</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20">Zero Lock-in</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW HOW IT WORKS */}
        <section id="how-it-works" className="py-20 border-t border-white/10 bg-[#0B0D13]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">
                Simple 5-Step Process
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                From Raw Clips to Export in Minutes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  step: "01",
                  title: "Upload Footage",
                  desc: "Drag and drop raw clips, smartphone videos, or an optional reference video.",
                },
                {
                  step: "02",
                  title: "Prompt or Preset",
                  desc: "Choose from 20+ fine-tuned presets or type what you want in plain English.",
                },
                {
                  step: "03",
                  title: "AI Synthesis",
                  desc: "EditMind generates 3 distinct Edit Decision Lists with tailored pacing and subtitles.",
                },
                {
                  step: "04",
                  title: "Real FFmpeg Render",
                  desc: "Deterministic video encoding trims, crops, mixes audio, and burns color grades.",
                },
                {
                  step: "05",
                  title: "Refine & Export",
                  desc: "Request conversational changes or download crisp MP4 files for every platform.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-white/10 bg-[#121622] flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-2xl font-bold text-violet-400/80 mb-3 block">
                      {item.step}
                    </span>
                    <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROMPT LIBRARY & PRESETS CATALOG */}
        <section id="presets" className="py-20 border-t border-white/10 bg-[#0E111B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2">
                  Built-in Prompt Library
                </h2>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  20+ Production-Ready Creative Presets
                </h3>
              </div>
              {/* Category tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPresets.map((recipe) => (
                <div
                  key={recipe.id}
                  className="p-5 rounded-xl border border-white/10 bg-[#121624] hover:border-violet-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-violet-300">
                        {recipe.category}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        {recipe.aspectRatio} • {recipe.targetDuration}s
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {recipe.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                      {recipe.description}
                    </p>

                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 mb-4 text-[11px] text-gray-300 font-mono italic line-clamp-2">
                      &ldquo;{recipe.promptTemplate}&rdquo;
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPreset(recipe.id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-violet-600/20 hover:bg-violet-600 border border-violet-500/30 text-violet-200 hover:text-white text-xs font-semibold transition-all"
                  >
                    Use This Preset
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MULTI-PLATFORM ADAPTATION & AUDIO / INDIC SUPPORT */}
        <section id="multi-platform" className="py-20 border-t border-white/10 bg-[#0B0D13]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2">
                  One Video, Every Platform
                </h2>
                <h3 className="text-3xl font-bold text-white tracking-tight mb-4">
                  Smart Recomposition for Vertical & Landscape
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  Don&apos;t settle for awkward letterboxing. EditMind recomposes your footage
                  dynamically, honoring platform safe-zones for TikTok, Instagram Reels, and YouTube
                  Shorts.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white">Safe-Area Awareness</p>
                      <p className="text-[11px] text-gray-400">
                        Prevents captions and action from getting covered by likes, comments, and captions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white">Indic Script Captions</p>
                      <p className="text-[11px] text-gray-400">
                        Tested UTF-8 subtitle rendering for Malayalam (മലയാളം), Tamil (தமிழ்), Hindi
                        (हिन्दी), and English.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white">Intelligent Audio Ducking</p>
                      <p className="text-[11px] text-gray-400">
                        Background score automatically lowers during spoken dialogue and rises during b-roll.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual platform preview illustration */}
              <div className="p-8 rounded-2xl border border-white/10 bg-[#121624] flex items-center justify-around">
                <div className="text-center space-y-2">
                  <div className="w-20 h-36 rounded-lg border-2 border-violet-500/50 bg-black/60 mx-auto flex items-center justify-center text-[10px] text-violet-300 font-mono">
                    9:16
                  </div>
                  <p className="text-xs font-semibold text-white">TikTok / Reels</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-36 h-20 rounded-lg border-2 border-blue-500/50 bg-black/60 mx-auto flex items-center justify-center text-[10px] text-blue-300 font-mono">
                    16:9
                  </div>
                  <p className="text-xs font-semibold text-white">YouTube 4K</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-24 h-24 rounded-lg border-2 border-emerald-500/50 bg-black/60 mx-auto flex items-center justify-center text-[10px] text-emerald-300 font-mono">
                    1:1
                  </div>
                  <p className="text-xs font-semibold text-white">Instagram Feed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-20 border-t border-white/10 bg-gradient-to-b from-[#0E111B] to-[#07090D] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Ready to Experience AI Video Editing That Actually Works?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              No complicated timelines or expensive hardware. Just describe your vision, upload your
              clips, and let EditMind AI render your next masterpiece.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleLaunchDemo}
                disabled={seeding}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-base shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.02]"
              >
                {seeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {seeding ? "Generating Studio..." : "Launch Demo Studio Now"}
              </button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-base transition-all"
              >
                Go to Creator Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
