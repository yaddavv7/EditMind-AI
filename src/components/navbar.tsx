"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Video, Play, LayoutDashboard, Film, ShieldCheck, Loader2 } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);

  const handleLaunchDemo = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/demo-seed", { method: "POST" });
      const data = await res.json();
      if (data.success && data.projectId) {
        router.push(`/editor/${data.projectId}`);
      } else {
        alert("Failed to seed demo project: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error creating demo: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0D13]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              EditMind<span className="text-violet-400">.ai</span>
            </span>
            <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
              Autonomous Video Suite
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4 text-violet-400" />
            Dashboard
          </Link>
          <a href="#presets" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Prompt Library
          </a>
          <a href="#dna" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Video className="w-4 h-4 text-blue-400" />
            Reference DNA
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            Workflow
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchDemo}
            disabled={seeding}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
            title="Instant working demo with preloaded clips & Reference DNA"
          >
            {seeding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            )}
            {seeding ? "Preparing Demo..." : "1-Click Demo"}
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Creating
          </Link>
        </div>
      </div>
    </header>
  );
}
