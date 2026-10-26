import {
  AspectRatio,
  CaptionLanguage,
  CaptionStyle,
  ColorGrade,
  CreativeDirectionType,
  EditDecisionList,
  Project,
  SourceAsset,
  TimelineAudioTrack,
  TimelineCaption,
  TimelineClip,
} from "../types";
import { DEMO_AUDIO_TRACKS } from "../constants";

export interface GenerateDirectionsInput {
  project: Project;
  promptText?: string;
  targetDuration?: number;
  aspectRatio?: AspectRatio;
  colorGrade?: ColorGrade;
  captionLanguage?: CaptionLanguage;
  captionStyle?: CaptionStyle;
}

export function generateCreativeDirections(
  input: GenerateDirectionsInput
): {
  story: EditDecisionList;
  hype: EditDecisionList;
  clean: EditDecisionList;
} {
  const { project } = input;
  const assets = project.assets || [];

  if (assets.length === 0) {
    throw new Error("Cannot generate editing plans without any uploaded media clips.");
  }

  const aspectRatio = input.aspectRatio || project.aspectRatio || "9:16";
  const targetDuration = input.targetDuration || project.targetDuration || 30;
  const captionLang = input.captionLanguage || project.captionLanguage || "en";

  // Pick audio tracks for directions
  const ambientMusic = DEMO_AUDIO_TRACKS[0];
  const highEnergyMusic = DEMO_AUDIO_TRACKS[2];
  const cleanAcousticMusic = DEMO_AUDIO_TRACKS[3];

  // Helper to generate Indic or English sample captions
  const getCaptionsForDirection = (
    dir: CreativeDirectionType,
    lang: CaptionLanguage,
    duration: number
  ): TimelineCaption[] => {
    if (lang === "ml") {
      return [
        {
          id: `cap_ml_1`,
          start: 0.5,
          end: Math.min(3.5, duration / 2),
          text: "മനോഹരമായ നിമിഷങ്ങളുടെ ഓർമ്മകൾ",
          style: dir === "hype" ? "bold_pop" : dir === "clean" ? "minimal" : "cinema",
          language: "ml",
        },
        {
          id: `cap_ml_2`,
          start: Math.min(4.0, duration / 2 + 0.5),
          end: Math.min(7.5, duration - 0.5),
          text: "EditMind AI വഴി പുതിയ ഭാവം",
          style: dir === "hype" ? "bold_pop" : dir === "clean" ? "minimal" : "cinema",
          language: "ml",
        },
      ];
    } else if (lang === "ta") {
      return [
        {
          id: `cap_ta_1`,
          start: 0.5,
          end: Math.min(3.5, duration / 2),
          text: "அழகான நினைவுகளின் தொகுப்பு",
          style: dir === "hype" ? "bold_pop" : dir === "clean" ? "minimal" : "cinema",
          language: "ta",
        },
        {
          id: `cap_ta_2`,
          start: Math.min(4.0, duration / 2 + 0.5),
          end: Math.min(7.5, duration - 0.5),
          text: "EditMind AI உடன் புதிய வடிவமைப்பு",
          style: dir === "hype" ? "bold_pop" : dir === "clean" ? "minimal" : "cinema",
          language: "ta",
        },
      ];
    } else if (lang === "hi") {
      return [
        {
          id: `cap_hi_1`,
          start: 0.5,
          end: Math.min(3.5, duration / 2),
          text: "खूबसूरत लम्हों की जादुई कहानी",
          style: dir === "hype" ? "bold_pop" : dir === "clean" ? "minimal" : "cinema",
          language: "hi",
        },
        {
          id: `cap_hi_2`,
          start: Math.min(4.0, duration / 2 + 0.5),
          end: Math.min(7.5, duration - 0.5),
          text: "EditMind AI के साथ अब आसान एडिटिंग",
          style: dir === "hype" ? "bold_pop" : dir === "clean" ? "minimal" : "cinema",
          language: "hi",
        },
      ];
    }

    // Default English
    if (dir === "hype") {
      return [
        {
          id: `cap_en_1`,
          start: 0.2,
          end: 2.2,
          text: "STOP SCROLLING: LOOK AT THIS",
          style: "bold_pop",
          language: "en",
        },
        {
          id: `cap_en_2`,
          start: 2.5,
          end: 5.5,
          text: "Engineered for pure energy & impact.",
          style: "bold_pop",
          language: "en",
        },
      ];
    } else if (dir === "story") {
      return [
        {
          id: `cap_en_1`,
          start: 0.8,
          end: 4.0,
          text: "Every great journey begins with a moment.",
          style: "cinema",
          language: "en",
        },
        {
          id: `cap_en_2`,
          start: 4.5,
          end: 8.5,
          text: "Preserving memories that truly endure.",
          style: "cinema",
          language: "en",
        },
      ];
    } else {
      return [
        {
          id: `cap_en_1`,
          start: 0.5,
          end: 3.5,
          text: "Curated moments, refined to essentials.",
          style: "minimal",
          language: "en",
        },
        {
          id: `cap_en_2`,
          start: 4.0,
          end: 7.0,
          text: "Polished studio visual standards.",
          style: "minimal",
          language: "en",
        },
      ];
    }
  };

  // 1. DIRECTION: STORY
  // Narrative pacing: establishes scene with longer opening, dialogue focus, warm cinematic grade
  const storyClips: TimelineClip[] = [];
  let storyElapsed = 0;
  // Sort assets: prefer intro/talking or sunset first
  const storySortedAssets = [...assets].sort((a, b) => {
    const aName = a.filename.toLowerCase();
    const bName = b.filename.toLowerCase();
    if (aName.includes("creator") || aName.includes("vlog") || aName.includes("sunset")) return -1;
    if (bName.includes("creator") || bName.includes("vlog") || bName.includes("sunset")) return 1;
    return 0;
  });

  const storyShotTarget = 3.5;
  for (let i = 0; i < storySortedAssets.length; i++) {
    const asset = storySortedAssets[i];
    const clipDur = Math.min(storyShotTarget, asset.duration);
    storyClips.push({
      id: `story_clip_${i + 1}`,
      sourceAssetId: asset.id,
      sourceIn: 0,
      sourceOut: clipDur,
      duration: clipDur,
      order: i,
      speed: 1,
      volume: 1,
      transitionIn: {
        type: i === 0 ? "cut" : "dissolve",
        duration: 0.6,
      },
    });
    storyElapsed += clipDur;
    if (storyElapsed >= targetDuration) break;
  }

  const storyAudio: TimelineAudioTrack[] = [
    {
      ...ambientMusic,
      duration: storyElapsed,
      volume: 0.55,
      ducking: true,
    },
  ];

  const storyEDL: EditDecisionList = {
    version: 1,
    direction: "story",
    title: "Narrative Journey (Story)",
    description: "Emotional arc with deliberate pacing, gentle dissolves, and atmospheric soundtrack.",
    aspectRatio,
    targetDuration,
    totalDuration: Number(storyElapsed.toFixed(2)),
    colorGrade: "warm_cinematic",
    timeline: {
      clips: storyClips,
      audioTracks: storyAudio,
      captions: getCaptionsForDirection("story", captionLang, storyElapsed),
    },
    exportProfile: "standard",
    updatedAt: new Date().toISOString(),
  };

  // 2. DIRECTION: HYPE
  // Rapid 1.5s cuts, punchy cuts, vibrant saturation, high energy audio
  const hypeClips: TimelineClip[] = [];
  let hypeElapsed = 0;
  // Put city/lights or high energy action first
  const hypeSortedAssets = [...assets].sort((a, b) => {
    const aName = a.filename.toLowerCase();
    const bName = b.filename.toLowerCase();
    if (aName.includes("city") || aName.includes("neon")) return -1;
    if (bName.includes("city") || bName.includes("neon")) return 1;
    return 0;
  });

  const hypeShotTarget = 1.6;
  for (let i = 0; i < hypeSortedAssets.length * 2; i++) {
    const asset = hypeSortedAssets[i % hypeSortedAssets.length];
    const sourceIn = ((i * 1.5) % Math.max(1, asset.duration - hypeShotTarget));
    const clipDur = hypeShotTarget;

    hypeClips.push({
      id: `hype_clip_${i + 1}`,
      sourceAssetId: asset.id,
      sourceIn: Number(sourceIn.toFixed(2)),
      sourceOut: Number((sourceIn + clipDur).toFixed(2)),
      duration: clipDur,
      order: i,
      speed: 1,
      volume: 0.8,
      transitionIn: {
        type: "cut",
        duration: 0,
      },
    });
    hypeElapsed += clipDur;
    if (hypeElapsed >= targetDuration) break;
  }

  const hypeAudio: TimelineAudioTrack[] = [
    {
      ...highEnergyMusic,
      duration: hypeElapsed,
      volume: 0.8,
      ducking: false,
    },
  ];

  const hypeEDL: EditDecisionList = {
    version: 1,
    direction: "hype",
    title: "Fast-Paced Hook (Hype)",
    description: "Rapid 1.5s cuts timed to peak energy, high saturation, and bold center pop captions.",
    aspectRatio,
    targetDuration,
    totalDuration: Number(hypeElapsed.toFixed(2)),
    colorGrade: "vibrant",
    timeline: {
      clips: hypeClips,
      audioTracks: hypeAudio,
      captions: getCaptionsForDirection("hype", captionLang, hypeElapsed),
    },
    exportProfile: "standard",
    updatedAt: new Date().toISOString(),
  };

  // 3. DIRECTION: CLEAN
  // Balanced 2.5s cuts, neutral grading, subtle acoustic, minimal captions
  const cleanClips: TimelineClip[] = [];
  let cleanElapsed = 0;
  const cleanShotTarget = 2.6;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const clipDur = Math.min(cleanShotTarget, asset.duration);

    cleanClips.push({
      id: `clean_clip_${i + 1}`,
      sourceAssetId: asset.id,
      sourceIn: 0.5,
      sourceOut: 0.5 + clipDur,
      duration: clipDur,
      order: i,
      speed: 1,
      volume: 1,
      transitionIn: {
        type: "cut",
        duration: 0,
      },
    });
    cleanElapsed += clipDur;
    if (cleanElapsed >= targetDuration) break;
  }

  const cleanAudio: TimelineAudioTrack[] = [
    {
      ...cleanAcousticMusic,
      duration: cleanElapsed,
      volume: 0.5,
      ducking: true,
    },
  ];

  const cleanEDL: EditDecisionList = {
    version: 1,
    direction: "clean",
    title: "Minimal Studio (Clean)",
    description: "Restrained, professional styling with natural color tones and clean cutaways.",
    aspectRatio,
    targetDuration,
    totalDuration: Number(cleanElapsed.toFixed(2)),
    colorGrade: "natural",
    timeline: {
      clips: cleanClips,
      audioTracks: cleanAudio,
      captions: getCaptionsForDirection("clean", captionLang, cleanElapsed),
    },
    exportProfile: "standard",
    updatedAt: new Date().toISOString(),
  };

  return {
    story: storyEDL,
    hype: hypeEDL,
    clean: cleanEDL,
  };
}
