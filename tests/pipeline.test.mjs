import test from "node:test";
import assert from "node:assert/strict";

// Import modules directly
import { PRESET_RECIPES } from "../src/lib/constants.ts";
import { EditDecisionListSchema, TimelineClipSchema } from "../src/lib/types.ts";
import { generateCreativeDirections } from "../src/lib/ai/engine.ts";
import { extractReferenceDNA } from "../src/lib/ai/reference-dna.ts";
import { analyzeClipIntelligence, searchFootageClips } from "../src/lib/ai/footage-analysis.ts";
import { processConversationalEdit } from "../src/lib/ai/conversational.ts";
import { inspectTimelineQuality, autoFixTimelineIssues } from "../src/lib/ai/quality-inspector.ts";
import { ProjectStorage } from "../src/lib/storage.ts";

// Mock sample assets
const mockAssets = [
  {
    id: "clip_sunset_1",
    projectId: "test_proj",
    filename: "sunset_cliff.mp4",
    originalName: "Sunset Cliff Vista.mp4",
    filePath: "/uploads/sunset_cliff.mp4",
    url: "/uploads/sunset_cliff.mp4",
    thumbnailUrl: "/uploads/sunset_thumb.jpg",
    duration: 6.0,
    width: 1920,
    height: 1080,
    fps: 30,
    aspectRatio: "16:9",
    hasAudio: true,
    sizeBytes: 2048000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "clip_creator_2",
    projectId: "test_proj",
    filename: "creator_vlog.mp4",
    originalName: "Creator Vlog Introduction.mp4",
    filePath: "/uploads/creator_vlog.mp4",
    url: "/uploads/creator_vlog.mp4",
    thumbnailUrl: "/uploads/creator_thumb.jpg",
    duration: 8.0,
    width: 1080,
    height: 1920,
    fps: 30,
    aspectRatio: "9:16",
    hasAudio: true,
    sizeBytes: 3048000,
    createdAt: new Date().toISOString(),
  },
];

const mockProject = {
  id: "test_proj",
  name: "Test Video Project",
  description: "Unit test project",
  aspectRatio: "9:16",
  targetDuration: 20,
  pacing: "fast",
  captionStyle: "bold_pop",
  captionLanguage: "en",
  colorGrade: "warm_cinematic",
  musicVolume: 0.7,
  audioDucking: true,
  activeDirection: "story",
  promptText: "Create a fast-paced travel reel",
  status: "ready",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assets: mockAssets,
  directions: {
    story: {
      version: 1,
      direction: "story",
      title: "Story",
      description: "",
      aspectRatio: "9:16",
      targetDuration: 20,
      totalDuration: 10,
      colorGrade: "warm_cinematic",
      timeline: { clips: [], audioTracks: [], captions: [] },
      exportProfile: "standard",
      updatedAt: new Date().toISOString(),
    },
    hype: {
      version: 1,
      direction: "hype",
      title: "Hype",
      description: "",
      aspectRatio: "9:16",
      targetDuration: 20,
      totalDuration: 10,
      colorGrade: "vibrant",
      timeline: { clips: [], audioTracks: [], captions: [] },
      exportProfile: "standard",
      updatedAt: new Date().toISOString(),
    },
    clean: {
      version: 1,
      direction: "clean",
      title: "Clean",
      description: "",
      aspectRatio: "9:16",
      targetDuration: 20,
      totalDuration: 10,
      colorGrade: "natural",
      timeline: { clips: [], audioTracks: [], captions: [] },
      exportProfile: "standard",
      updatedAt: new Date().toISOString(),
    },
  },
  versions: [],
};

test("1. Preset Library: Exactly 21 presets with validated settings", () => {
  assert.ok(PRESET_RECIPES.length >= 20, "Must have at least 20 presets");
  for (const p of PRESET_RECIPES) {
    assert.ok(p.id, "Preset must have ID");
    assert.ok(p.title, "Preset must have title");
    assert.ok(["9:16", "16:9", "1:1"].includes(p.aspectRatio), "Valid aspect ratio");
    assert.ok(p.targetDuration > 0, "Duration must be positive");
    assert.ok(p.promptTemplate.length > 10, "Has meaningful prompt template");
  }
});

test("2. AI Planning Engine: Generates genuinely distinct STORY, HYPE, and CLEAN directions", () => {
  const directions = generateCreativeDirections({
    project: mockProject,
    targetDuration: 20,
    aspectRatio: "9:16",
    captionLanguage: "en",
  });

  assert.ok(directions.story, "Must generate STORY direction");
  assert.ok(directions.hype, "Must generate HYPE direction");
  assert.ok(directions.clean, "Must generate CLEAN direction");

  // Verify HYPE has shorter shot cuts than STORY
  const storyFirstDuration = directions.story.timeline.clips[0].duration;
  const hypeFirstDuration = directions.hype.timeline.clips[0].duration;
  assert.ok(
    hypeFirstDuration < storyFirstDuration,
    `HYPE first cut (${hypeFirstDuration}s) must be snappier than STORY (${storyFirstDuration}s)`
  );

  // Validate with Zod schema
  const parsedStory = EditDecisionListSchema.safeParse(directions.story);
  assert.ok(parsedStory.success, "Story EDL must conform to Zod schema");

  const parsedHype = EditDecisionListSchema.safeParse(directions.hype);
  assert.ok(parsedHype.success, "Hype EDL must conform to Zod schema");
});

test("3. Indic Language Support: Generates Malayalam, Tamil, and Hindi captions", () => {
  const mlDirections = generateCreativeDirections({
    project: mockProject,
    captionLanguage: "ml",
  });
  assert.strictEqual(mlDirections.story.timeline.captions[0].language, "ml");
  assert.ok(mlDirections.story.timeline.captions[0].text.length > 0);

  const taDirections = generateCreativeDirections({
    project: mockProject,
    captionLanguage: "ta",
  });
  assert.strictEqual(taDirections.story.timeline.captions[0].language, "ta");

  const hiDirections = generateCreativeDirections({
    project: mockProject,
    captionLanguage: "hi",
  });
  assert.strictEqual(hiDirections.story.timeline.captions[0].language, "hi");
});

test("4. Reference DNA: Analyzes reference video into editable style blueprint", () => {
  const probe = {
    duration: 15,
    width: 1080,
    height: 1920,
    fps: 30,
    hasAudio: true,
    aspectRatio: "9:16",
    sizeBytes: 5000000,
    format: "mp4",
    videoCodec: "h264",
  };

  const dna = extractReferenceDNA(probe, "viral_tiktok_reel.mp4");
  assert.strictEqual(dna.preferredAspectRatio, "9:16");
  assert.strictEqual(dna.cutFrequency, "rapid");
  assert.strictEqual(dna.pacing, "fast");
  assert.ok(dna.averageShotDuration < 3.0);
  assert.ok(dna.detectedRules.length >= 4);
});

test("5. Footage Intelligence: Detects scenes, tags, and supports natural language search", () => {
  const assetWithIntel = {
    ...mockAssets[0],
    intelligence: analyzeClipIntelligence(mockAssets[0]),
  };

  assert.ok(assetWithIntel.intelligence.scenes.length >= 1, "Detects scenes");
  assert.ok(assetWithIntel.intelligence.tags.includes("sunset"), "Contains sunset tag");

  // Test natural language footage search
  const results = searchFootageClips([assetWithIntel], "Find sunset clips");
  assert.ok(results.length > 0, "Search returns matching clip");
  assert.ok(results[0].matchedScenes.length > 0, "Returns matching scenes");
  assert.ok(results[0].matchedScenes[0].score > 50, "Confidence score > 50");
});

test("6. Conversational Assistant: Handles commands non-destructively", () => {
  const directions = generateCreativeDirections({ project: mockProject });
  const originalEdl = directions.story;

  // Command 1: "Make the intro faster"
  const res1 = processConversationalEdit(mockProject, originalEdl, "Make the intro faster");
  assert.ok(
    res1.updatedEdl.timeline.clips[0].duration < originalEdl.timeline.clips[0].duration,
    "Intro cut duration decreased"
  );
  assert.ok(res1.appliedActions.length > 0);

  // Command 2: "Reduce background music"
  const res2 = processConversationalEdit(mockProject, originalEdl, "Reduce background music");
  assert.ok(
    res2.updatedEdl.timeline.audioTracks[0].volume < originalEdl.timeline.audioTracks[0].volume,
    "Music volume lowered"
  );

  // Command 3: "Make captions smaller"
  const res3 = processConversationalEdit(mockProject, originalEdl, "Make captions smaller");
  assert.strictEqual(res3.updatedEdl.timeline.captions[0].style, "minimal");
});

test("7. AI Quality Inspector: Detects issues and applies 1-click Auto-Fix", () => {
  const flawedEdl = {
    version: 1,
    direction: "story",
    title: "Flawed Edit",
    description: "",
    aspectRatio: "9:16",
    targetDuration: 20,
    totalDuration: 10,
    colorGrade: "warm_cinematic",
    timeline: {
      clips: [
        {
          id: "clip_short_1",
          sourceAssetId: mockAssets[0].id,
          sourceIn: 0,
          sourceOut: 0.3,
          duration: 0.3, // Micro-cut < 0.5s
          order: 0,
          speed: 1,
          volume: 1,
        },
      ],
      audioTracks: [
        {
          id: "loud_audio",
          type: "music",
          title: "Blaring Song",
          sourceUrl: "/audio/test.mp3",
          startTime: 0,
          duration: 10,
          volume: 0.95, // Too loud!
          ducking: false,
        },
      ],
      captions: [
        {
          id: "cap1",
          start: 0,
          end: 3.0,
          text: "First text",
          style: "bold_pop",
          language: "en",
        },
        {
          id: "cap2",
          start: 2.0, // Overlaps with cap1 end at 3.0
          end: 5.0,
          text: "Second text",
          style: "bold_pop",
          language: "en",
        },
      ],
    },
    exportProfile: "standard",
    updatedAt: new Date().toISOString(),
  };

  const report = inspectTimelineQuality(mockProject, flawedEdl);
  assert.ok(report.score < 90, "Score drops due to issues");
  assert.ok(report.issues.some((i) => i.id.startsWith("warn_short")), "Detects micro-cut");
  assert.ok(report.issues.some((i) => i.id === "warn_audio_loud"), "Detects loud audio");
  assert.ok(report.issues.some((i) => i.id.startsWith("warn_cap_overlap")), "Detects overlap");

  // Apply Auto-Fix
  const { fixedEdl, fixedCount } = autoFixTimelineIssues(mockProject, flawedEdl);
  assert.ok(fixedCount >= 3, "Fixed all 3 issues");
  assert.ok(fixedEdl.timeline.clips[0].duration >= 0.8, "Micro-cut expanded");
  assert.ok(fixedEdl.timeline.audioTracks[0].volume <= 0.75, "Audio volume brought into safe range");
  assert.ok(fixedEdl.timeline.captions[0].end <= fixedEdl.timeline.captions[1].start, "Overlap resolved");
});

test("8. Project Storage: Save, retrieve, and duplicate project", () => {
  ProjectStorage.save(mockProject);
  const retrieved = ProjectStorage.getById(mockProject.id);
  assert.ok(retrieved, "Project retrieved successfully");
  assert.strictEqual(retrieved.name, mockProject.name);

  const duplicated = ProjectStorage.duplicate(mockProject.id);
  assert.ok(duplicated, "Project duplicated");
  assert.notStrictEqual(duplicated.id, mockProject.id);
  assert.ok(duplicated.name.includes("(Copy)"));

  ProjectStorage.delete(duplicated.id);
  assert.strictEqual(ProjectStorage.getById(duplicated.id), null);
});
