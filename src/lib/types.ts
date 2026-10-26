import { z } from "zod";

// --- Project Types ---
export type AspectRatio = "9:16" | "16:9" | "1:1";
export type PacingStyle = "fast" | "medium" | "cinematic" | "relaxed";
export type CaptionStyle = "minimal" | "bold_pop" | "karaoke" | "cinema" | "none";
export type CaptionLanguage = "en" | "ml" | "ta" | "hi";
export type ColorGrade = "natural" | "warm_cinematic" | "moody_teal_orange" | "vintage_film" | "vibrant" | "monochrome";
export type CreativeDirectionType = "story" | "hype" | "clean";
export type ExportQuality = "draft" | "standard" | "high_quality";

// --- Clip / Asset Intelligence ---
export interface SceneDetection {
  id: string;
  inTime: number;
  outTime: number;
  label: string;
  score: number;
  tags: string[];
  isHighlight: boolean;
  thumbnailTime: number;
}

export interface TranscriptWord {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface FootageQuality {
  blurScore: number; // 0 (very blurry) to 100 (crisp)
  exposure: "good" | "underexposed" | "overexposed";
  audioClarity: "clean" | "noisy" | "silent";
  warnings: string[];
}

export interface ClipIntelligence {
  duration: number;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  scenes: SceneDetection[];
  tags: string[];
  transcript: TranscriptWord[];
  quality: FootageQuality;
  suggestedUse: "intro" | "hook" | "b-roll" | "highlight" | "outro";
  summary: string;
}

export interface SourceAsset {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  filePath: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  aspectRatio: string;
  hasAudio: boolean;
  sizeBytes: number;
  createdAt: string;
  intelligence?: ClipIntelligence;
}

// --- Reference DNA ---
export interface ReferenceDNA {
  styleName: string;
  averageShotDuration: number;
  cutFrequency: "rapid" | "moderate" | "slow_rhythmic";
  pacing: PacingStyle;
  transitionStyle: "hard_cut" | "crossfade" | "zoom_whip" | "clean";
  captionStyle: CaptionStyle;
  captionPosition: "bottom" | "center" | "top";
  colorMood: ColorGrade;
  preferredAspectRatio: AspectRatio;
  shotDurationTarget: number;
  musicEnergy: "low" | "medium" | "high" | "epic";
  confidenceScore: number;
  detectedRules: string[];
}

export interface ReferenceAsset {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  url: string;
  dna: ReferenceDNA;
  createdAt: string;
}

// --- Edit Decision List (EDL) ---
export interface TimelineClip {
  id: string;
  sourceAssetId: string;
  sourceIn: number;
  sourceOut: number;
  duration: number;
  order: number;
  speed: number;
  volume: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  transitionIn?: {
    type: "cut" | "fade" | "wipe" | "dissolve";
    duration: number;
  };
  captionText?: string;
  captionHighlight?: string;
}

export interface TimelineAudioTrack {
  id: string;
  type: "music" | "voiceover" | "ambient";
  title: string;
  sourceUrl: string;
  startTime: number;
  duration: number;
  volume: number; // 0 to 1
  ducking: boolean;
}

export interface TimelineCaption {
  id: string;
  start: number;
  end: number;
  text: string;
  style: CaptionStyle;
  language: CaptionLanguage;
}

export interface EditDecisionList {
  version: number;
  direction: CreativeDirectionType;
  title: string;
  description: string;
  aspectRatio: AspectRatio;
  targetDuration: number;
  totalDuration: number;
  colorGrade: ColorGrade;
  timeline: {
    clips: TimelineClip[];
    audioTracks: TimelineAudioTrack[];
    captions: TimelineCaption[];
  };
  exportProfile: ExportQuality;
  updatedAt: string;
}

// --- Project Model ---
export interface ProjectVersion {
  id: string;
  versionNumber: number;
  title: string;
  changeSummary: string;
  createdAt: string;
  edl: EditDecisionList;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  aspectRatio: AspectRatio;
  targetDuration: number;
  pacing: PacingStyle;
  captionStyle: CaptionStyle;
  captionLanguage: CaptionLanguage;
  colorGrade: ColorGrade;
  musicVolume: number;
  audioDucking: boolean;
  selectedMusicId?: string;
  activeDirection: CreativeDirectionType;
  promptText: string;
  selectedPresetId?: string;
  status: "draft" | "analyzing" | "generating" | "rendering" | "ready" | "error";
  createdAt: string;
  updatedAt: string;
  assets: SourceAsset[];
  referenceAsset?: ReferenceAsset;
  directions: {
    story: EditDecisionList;
    hype: EditDecisionList;
    clean: EditDecisionList;
  };
  versions: ProjectVersion[];
  lastRenderJobId?: string;
  renderedVideoUrl?: string;
}

// --- AI Quality Inspector ---
export interface QualityIssue {
  id: string;
  type: "warning" | "error" | "info";
  category: "timeline" | "audio" | "caption" | "aspect_ratio" | "media";
  title: string;
  description: string;
  timestamp?: number;
  clipId?: string;
  suggestedFix?: string;
  autoFixAvailable: boolean;
}

export interface QualityReport {
  score: number; // 0 - 100
  issues: QualityIssue[];
  passedChecks: string[];
}

// --- Render Job ---
export interface RenderJob {
  id: string;
  projectId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number; // 0 - 100
  stage: string;
  outputUrl?: string;
  outputPath?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  specs: {
    width: number;
    height: number;
    duration: number;
    fps: number;
    aspectRatio: AspectRatio;
    quality: ExportQuality;
  };
}

// --- Preset Recipe ---
export interface PresetRecipe {
  id: string;
  title: string;
  category: "CINEMATIC" | "SOCIAL MEDIA" | "BUSINESS" | "PERSONAL" | "EDUCATIONAL";
  description: string;
  aspectRatio: AspectRatio;
  targetDuration: number;
  pacing: PacingStyle;
  captionStyle: CaptionStyle;
  transitionPreference: "cut" | "fade" | "wipe" | "dissolve";
  colorTreatment: ColorGrade;
  audioBehavior: {
    includeMusic: boolean;
    musicVibe: string;
    audioDucking: boolean;
    musicVolume: number;
  };
  clipSelectionStrategy: string;
  promptTemplate: string;
  badge?: string;
}

// --- Zod Validation Schemas ---
export const TimelineClipSchema = z.object({
  id: z.string(),
  sourceAssetId: z.string(),
  sourceIn: z.number().min(0),
  sourceOut: z.number().min(0),
  duration: z.number().positive(),
  order: z.number().int().min(0),
  speed: z.number().min(0.25).max(4).default(1),
  volume: z.number().min(0).max(2).default(1),
  crop: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  transitionIn: z
    .object({
      type: z.enum(["cut", "fade", "wipe", "dissolve"]),
      duration: z.number().min(0).max(3),
    })
    .optional(),
  captionText: z.string().optional(),
  captionHighlight: z.string().optional(),
});

export const EditDecisionListSchema = z.object({
  version: z.number(),
  direction: z.enum(["story", "hype", "clean"]),
  title: z.string(),
  description: z.string(),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]),
  targetDuration: z.number().positive(),
  totalDuration: z.number().positive(),
  colorGrade: z.enum([
    "natural",
    "warm_cinematic",
    "moody_teal_orange",
    "vintage_film",
    "vibrant",
    "monochrome",
  ]),
  timeline: z.object({
    clips: z.array(TimelineClipSchema),
    audioTracks: z.array(
      z.object({
        id: z.string(),
        type: z.enum(["music", "voiceover", "ambient"]),
        title: z.string(),
        sourceUrl: z.string(),
        startTime: z.number().min(0),
        duration: z.number().positive(),
        volume: z.number().min(0).max(1),
        ducking: z.boolean(),
      })
    ),
    captions: z.array(
      z.object({
        id: z.string(),
        start: z.number().min(0),
        end: z.number().min(0),
        text: z.string(),
        style: z.enum(["minimal", "bold_pop", "karaoke", "cinema", "none"]),
        language: z.enum(["en", "ml", "ta", "hi"]),
      })
    ),
  }),
  exportProfile: z.enum(["draft", "standard", "high_quality"]),
  updatedAt: z.string(),
});
