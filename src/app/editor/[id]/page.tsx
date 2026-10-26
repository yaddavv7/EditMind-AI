"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  Project,
  CreativeDirectionType,
  EditDecisionList,
  TimelineClip,
  QualityReport,
  SourceAsset,
} from "@/lib/types";
import { inspectTimelineQuality, autoFixTimelineIssues } from "@/lib/ai/quality-inspector";
import { StudioHeader } from "@/components/editor/studio-header";
import { LeftPanel } from "@/components/editor/left-panel";
import { CenterPreview } from "@/components/editor/center-preview";
import { RightPanel } from "@/components/editor/right-panel";
import { Timeline } from "@/components/editor/timeline";
import { QualityInspectorModal } from "@/components/editor/quality-inspector-modal";
import { ExportModal } from "@/components/editor/export-modal";
import { FootageSearchDrawer } from "@/components/editor/footage-search-drawer";
import { Loader2, Film, Sparkles, Upload } from "lucide-react";

export default function EditorStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Active creative direction: 'story' | 'hype' | 'clean'
  const [activeDirection, setActiveDirection] = useState<CreativeDirectionType>("story");

  // Playhead & playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClip, setSelectedClip] = useState<TimelineClip | null>(null);

  // Undo / Redo stacks
  const [undoStack, setUndoStack] = useState<EditDecisionList[]>([]);
  const [redoStack, setRedoStack] = useState<EditDecisionList[]>([]);

  // Modals
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [inspectedAsset, setInspectedAsset] = useState<SourceAsset | null>(null);

  // Chat conversation
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; text: string; actions?: string[] }>
  >([
    {
      role: "assistant",
      text: "Welcome to EditMind AI Studio. I can re-pace your clips, adjust captions, balance audio, or create platform cuts. Type your instructions below!",
    },
  ]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // Fetch project
  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        if (data.success && data.project) {
          setProject(data.project);
          setActiveDirection(data.project.activeDirection || "story");
          if (data.project.assets?.length > 0) {
            setInspectedAsset(data.project.assets[0]);
          }
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Failed to load project", err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id, router]);

  // Current active EDL
  const activeEdl: EditDecisionList =
    project?.directions?.[activeDirection] || {
      version: 1,
      direction: activeDirection,
      title: "Active Direction",
      description: "",
      aspectRatio: project?.aspectRatio || "9:16",
      targetDuration: project?.targetDuration || 30,
      totalDuration: 0,
      colorGrade: project?.colorGrade || "warm_cinematic",
      timeline: { clips: [], audioTracks: [], captions: [] },
      exportProfile: "standard",
      updatedAt: new Date().toISOString(),
    };

  // Playhead timer animation
  useEffect(() => {
    let animFrame: number;
    let lastTimestamp: number = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        const total = Math.max(activeEdl.totalDuration || 1, 1);
        setCurrentTime((prev) => {
          const next = prev + dt;
          return next >= total ? 0 : next;
        });
      }
      animFrame = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      animFrame = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, activeEdl.totalDuration]);

  // Push to undo stack before mutation
  const pushUndoState = () => {
    setUndoStack((prev) => [JSON.parse(JSON.stringify(activeEdl)), ...prev.slice(0, 20)]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !project) return;
    const [previous, ...restUndo] = undoStack;
    setRedoStack((prev) => [JSON.parse(JSON.stringify(activeEdl)), ...prev]);
    setUndoStack(restUndo);

    const updatedDirections = { ...project.directions, [activeDirection]: previous };
    setProject({ ...project, directions: updatedDirections });
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !project) return;
    const [next, ...restRedo] = redoStack;
    setUndoStack((prev) => [JSON.parse(JSON.stringify(activeEdl)), ...prev]);
    setRedoStack(restRedo);

    const updatedDirections = { ...project.directions, [activeDirection]: next };
    setProject({ ...project, directions: updatedDirections });
  };

  // Quality Report
  const qualityReport: QualityReport = project
    ? inspectTimelineQuality(project, activeEdl)
    : { score: 100, issues: [], passedChecks: [] };

  // Update Project metadata
  const handleUpdateProject = (updates: Partial<Project>) => {
    if (!project) return;
    setProject({ ...project, ...updates });
  };

  // Save Project to backend
  const handleSaveProject = async () => {
    if (!project) return;
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Upload Clip
  const handleUploadClip = async (file: File) => {
    if (!project) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", project.id);
      formData.append("type", "clip");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.asset) {
        setProject((prev) => (prev ? { ...prev, assets: [...prev.assets, data.asset] } : null));
        setInspectedAsset(data.asset);
      }
    } catch (err) {
      console.error("Clip upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Extract Reference DNA
  const handleExtractReferenceDNA = async (referenceUrl: string, filename: string) => {
    if (!project) return;
    try {
      const res = await fetch("/api/reference-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, referenceUrl, filename }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error("Reference DNA extraction failed", err);
    }
  };

  // Generate 3 Creative Directions
  const handleGenerateDirections = async () => {
    if (!project) return;
    setIsGenerating(true);
    pushUndoState();
    try {
      const res = await fetch("/api/ai/generate-directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          promptText: project.promptText,
          targetDuration: project.targetDuration,
          aspectRatio: project.aspectRatio,
          captionLanguage: project.captionLanguage,
        }),
      });
      const data = await res.json();
      if (data.success && data.directions) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                directions: data.directions,
                status: "ready",
                versions: data.project?.versions || prev.versions,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Failed to generate directions", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Switch Direction (STORY, HYPE, CLEAN)
  const handleChangeDirection = (dir: CreativeDirectionType) => {
    if (!project) return;
    setActiveDirection(dir);
    setProject({ ...project, activeDirection: dir });
    setCurrentTime(0);
  };

  // Update a single timeline clip
  const handleUpdateClip = (clipId: string, updates: Partial<TimelineClip>) => {
    if (!project) return;
    pushUndoState();

    const currentClips = [...activeEdl.timeline.clips];
    const clipIdx = currentClips.findIndex((c) => c.id === clipId);
    if (clipIdx === -1) return;

    currentClips[clipIdx] = { ...currentClips[clipIdx], ...updates };

    const newDuration = Number(currentClips.reduce((acc, c) => acc + c.duration, 0).toFixed(2));
    const newEdl = {
      ...activeEdl,
      totalDuration: newDuration,
      timeline: { ...activeEdl.timeline, clips: currentClips },
    };

    const newDirections = { ...project.directions, [activeDirection]: newEdl };
    setProject({ ...project, directions: newDirections });
    if (selectedClip?.id === clipId) {
      setSelectedClip(currentClips[clipIdx]);
    }
  };

  // Conversational Assistant message
  const handleSendMessage = async (text: string) => {
    if (!project) return;
    setIsProcessingChat(true);
    pushUndoState();

    setChatHistory((prev) => [...prev, { role: "user", text }]);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          instruction: text,
          currentEdl: activeEdl,
        }),
      });
      const data = await res.json();
      if (data.success && data.updatedEdl) {
        const newDirections = { ...project.directions, [activeDirection]: data.updatedEdl };
        setProject((prev) =>
          prev
            ? {
                ...prev,
                directions: newDirections,
                versions: data.project?.versions || prev.versions,
              }
            : null
        );

        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.assistantReply,
            actions: data.appliedActions,
          },
        ]);
      }
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I encountered an issue processing that edit. Please try a simpler command.",
        },
      ]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  // Auto-Fix Timeline Issues
  const handleAutoFix = () => {
    if (!project) return;
    pushUndoState();
    const { fixedEdl, fixedCount } = autoFixTimelineIssues(project, activeEdl);
    const newDirections = { ...project.directions, [activeDirection]: fixedEdl };
    setProject({ ...project, directions: newDirections });
    setIsQualityModalOpen(false);
    alert(`AI Quality Inspector auto-resolved ${fixedCount} issue(s) successfully!`);
  };

  // Restore a Version
  const handleRestoreVersion = async (versionId: string) => {
    if (!project) return;
    pushUndoState();
    try {
      const res = await fetch(`/api/projects/${project.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        alert("Restored timeline version!");
      }
    } catch (err) {
      console.error("Restore error", err);
    }
  };

  if (loading || !project) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0B0D13] text-gray-400">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-3" />
        <p className="text-xs font-mono">Initializing EditMind Creative Studio...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B0D13] overflow-hidden">
      {/* Studio Top Header */}
      <StudioHeader
        project={project}
        activeEdl={activeEdl}
        qualityReport={qualityReport}
        onOpenQualityInspector={() => setIsQualityModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onSaveProject={handleSaveProject}
        isSaving={isSaving}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />

      {/* Main Workspace (Left Sidebar + Center Canvas + Right Sidebar) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <LeftPanel
          project={project}
          onUpdateProject={handleUpdateProject}
          onUploadClip={handleUploadClip}
          onExtractReferenceDNA={handleExtractReferenceDNA}
          onInspectClip={(asset) => {
            setInspectedAsset(asset);
            setIsSearchDrawerOpen(true);
          }}
          onOpenSearchDrawer={() => setIsSearchDrawerOpen(true)}
          onGenerateDirections={handleGenerateDirections}
          isGenerating={isGenerating}
          isUploading={isUploading}
        />

        {/* Center Preview Player */}
        <CenterPreview
          project={project}
          activeDirection={activeDirection}
          onChangeDirection={handleChangeDirection}
          activeEdl={activeEdl}
          currentTime={currentTime}
          onSeek={(t) => setCurrentTime(t)}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />

        {/* Right Sidebar: AI Assistant, Clip Inspector, Version History */}
        <RightPanel
          project={project}
          activeEdl={activeEdl}
          selectedClip={selectedClip}
          onUpdateClip={handleUpdateClip}
          onSendMessage={handleSendMessage}
          isProcessingChat={isProcessingChat}
          chatHistory={chatHistory}
          onRestoreVersion={handleRestoreVersion}
        />
      </div>

      {/* Bottom Timeline */}
      <Timeline
        project={project}
        activeEdl={activeEdl}
        selectedClipId={selectedClip?.id || null}
        onSelectClip={(c) => setSelectedClip(c)}
        onUpdateClip={handleUpdateClip}
        currentTime={currentTime}
        onSeek={(t) => setCurrentTime(t)}
        onReorderClips={(from, to) => {}}
      />

      {/* Modals & Drawers */}
      <QualityInspectorModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        report={qualityReport}
        onAutoFix={handleAutoFix}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        activeEdl={activeEdl}
        onRenderSuccess={(videoUrl) => {
          setProject((prev) => (prev ? { ...prev, renderedVideoUrl: videoUrl } : null));
        }}
      />

      <FootageSearchDrawer
        isOpen={isSearchDrawerOpen}
        onClose={() => setIsSearchDrawerOpen(false)}
        project={project}
        inspectedAsset={inspectedAsset}
      />
    </div>
  );
}
