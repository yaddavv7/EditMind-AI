"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Project } from "@/lib/types";
import { PRESET_RECIPES } from "@/lib/constants";
import {
  Plus,
  Search,
  Film,
  Sparkles,
  Copy,
  Trash2,
  Edit2,
  Clock,
  Play,
  Layers,
  Video,
  Loader2,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [seedingDemo, setSeedingDemo] = useState(false);

  // New project modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");

  // Rename modal state
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLaunchDemo = async () => {
    try {
      setSeedingDemo(true);
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
      setSeedingDemo(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim() || "Untitled Video Project",
          aspectRatio: selectedAspectRatio,
          targetDuration: selectedDuration,
          presetId: selectedPresetId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.project?.id) {
        router.push(`/editor/${data.project.id}`);
      }
    } catch (err: any) {
      alert("Error creating project: " + err.message);
    }
  };

  const handleDuplicate = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchProjects();
      }
    } catch (err: any) {
      alert("Error duplicating: " + err.message);
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (err: any) {
      alert("Error deleting: " + err.message);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameProjectId || !renameText.trim()) return;
    try {
      const res = await fetch(`/api/projects/${renameProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === renameProjectId ? { ...p, name: renameText.trim() } : p))
        );
        setRenameProjectId(null);
      }
    } catch (err: any) {
      alert("Error renaming: " + err.message);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D13]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Banner: Demo One-Click Access */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-violet-950/50 via-[#161B2A] to-blue-950/40 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-0.5">
                Instant Verification: Load Pre-Packaged Demo Studio
              </h3>
              <p className="text-xs text-gray-300">
                Experience full Reference DNA, Footage Intelligence, 3 Creative Directions, and real
                FFmpeg video rendering with sample footage right now.
              </p>
            </div>
          </div>
          <button
            onClick={handleLaunchDemo}
            disabled={seedingDemo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm shrink-0 shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {seedingDemo ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {seedingDemo ? "Seeding Demo Project..." : "Load Demo Project"}
          </button>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Projects Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage your video edits, drafts, and rendered exports
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#121622] border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* New Project Button */}
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-3" />
            <p className="text-xs text-gray-400">Loading your creative projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty state */
          <div className="py-16 px-4 rounded-2xl border border-white/10 bg-[#121622] text-center max-w-lg mx-auto my-6">
            <div className="w-12 h-12 rounded-full bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto mb-4">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">No projects found</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Start fresh with an empty canvas or try one of our 20+ preset editing styles.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
              >
                Create Project
              </button>
              <button
                onClick={handleLaunchDemo}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold"
              >
                Load Demo Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredProjects.map((project) => {
              const clipCount = project.assets?.length || 0;
              const hasRender = !!project.renderedVideoUrl;

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/editor/${project.id}`)}
                  className="rounded-2xl border border-white/10 bg-[#121624] hover:border-violet-500/40 transition-all cursor-pointer overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-violet-950/20"
                >
                  <div>
                    {/* Thumbnail banner */}
                    <div className="relative h-44 bg-gradient-to-tr from-[#0F131E] to-[#181E30] flex items-center justify-center overflow-hidden border-b border-white/5">
                      {project.assets?.[0]?.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.assets[0].thumbnailUrl}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                          <Film className="w-8 h-8 text-gray-600" />
                          <span className="text-[10px]">No clips uploaded</span>
                        </div>
                      )}

                      {/* Aspect Ratio Badge */}
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/15 text-[10px] font-mono text-gray-200">
                        {project.aspectRatio}
                      </span>

                      {/* Render status badge */}
                      {hasRender && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Rendered MP4
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                          {project.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {project.promptText || project.description || "Custom AI video edit"}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                        <span>{clipCount} clips</span>
                        <span>•</span>
                        <span>{project.targetDuration}s target</span>
                        <span>•</span>
                        <span className="capitalize">{project.activeDirection || "story"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-4 py-3 border-t border-white/5 bg-[#0F131F] flex items-center justify-between text-xs text-gray-400">
                    <span className="text-[10px] flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        title="Rename"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameProjectId(project.id);
                          setRenameText(project.name);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title="Duplicate"
                        onClick={(e) => handleDuplicate(project.id, e)}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title="Delete"
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Style Discovery Section */}
        <div className="mt-12 pt-10 border-t border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Quick Start from Editing Presets
              </h2>
              <p className="text-xs text-gray-400">
                Pick a recipe to create a pre-configured project instantly
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_RECIPES.slice(0, 4).map((preset) => (
              <div
                key={preset.id}
                onClick={async () => {
                  const res = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: `${preset.title} Edit`,
                      presetId: preset.id,
                      aspectRatio: preset.aspectRatio,
                      targetDuration: preset.targetDuration,
                    }),
                  });
                  const d = await res.json();
                  if (d.success && d.project?.id) router.push(`/editor/${d.project.id}`);
                }}
                className="p-4 rounded-xl border border-white/10 bg-[#121624] hover:border-violet-500/40 transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 block mb-1">
                  {preset.category}
                </span>
                <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors mb-1">
                  {preset.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{preset.description}</p>
                <div className="text-[10px] font-mono text-gray-500 flex items-center justify-between">
                  <span>{preset.aspectRatio}</span>
                  <span className="text-violet-400 group-hover:translate-x-1 transition-transform">
                    Use &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121624] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create New Video Project</h3>
            <p className="text-xs text-gray-400 mb-5">
              Set project name, aspect ratio canvas, and target duration.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Vacation Reel 2026"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Aspect Ratio Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Output Format & Canvas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "9:16", label: "Vertical", sub: "TikTok/Reels" },
                    { id: "16:9", label: "Widescreen", sub: "YouTube/4K" },
                    { id: "1:1", label: "Square", sub: "Instagram/Post" },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() =>
                        setSelectedAspectRatio(ratio.id as "9:16" | "16:9" | "1:1")
                      }
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedAspectRatio === ratio.id
                          ? "bg-violet-600/20 border-violet-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{ratio.id}</div>
                      <div className="text-[10px] text-gray-400">{ratio.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-1.5">
                  <span>Target Duration</span>
                  <span className="font-mono text-violet-400">{selectedDuration} seconds</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-xs font-medium hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30"
                >
                  Create & Open Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121624] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Rename Project</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={renameText}
                onChange={(e) => setRenameText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameProjectId(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
