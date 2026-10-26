import { ClipIntelligence, SceneDetection, SourceAsset, TranscriptWord } from "../types";

// Simulated scene & visual tag analysis based on clip properties and heuristics
export function analyzeClipIntelligence(
  asset: Pick<SourceAsset, "filename" | "duration" | "width" | "height" | "fps" | "hasAudio">
): ClipIntelligence {
  const duration = Math.max(asset.duration, 2);
  const name = asset.filename.toLowerCase();

  const isPortrait = asset.height > asset.width;
  const isLandscape = asset.width >= asset.height;

  // Scene boundaries detection (heuristic interval)
  const sceneInterval = Math.min(3.0, duration / 2);
  const scenes: SceneDetection[] = [];

  let sceneIdx = 1;
  for (let t = 0; t < duration; t += sceneInterval) {
    const outTime = Math.min(t + sceneInterval, duration);
    if (outTime - t < 0.5) break;

    let label = `Scene ${sceneIdx}`;
    let isHighlight = false;
    const tags: string[] = [];

    if (name.includes("sunset") || name.includes("cliff")) {
      label = t === 0 ? "Golden Hour Establishing Shot" : "Sunset Horizon Panorama";
      tags.push("sunset", "landscape", "warm", "nature", "outdoor", "golden_hour");
      if (t === 0) isHighlight = true;
    } else if (name.includes("beach") || name.includes("ocean") || name.includes("drone")) {
      label = t === 0 ? "Aerial Beach Flyover" : "Ocean Surf Crest";
      tags.push("beach", "drone", "water", "landscape", "blue_water", "travel");
      if (t > 2) isHighlight = true;
    } else if (name.includes("city") || name.includes("neon") || name.includes("lights")) {
      label = t === 0 ? "Neon Street Architecture" : "Night Traffic Glow";
      tags.push("city", "night", "neon", "architecture", "modern", "cyberpunk");
      isHighlight = true;
    } else if (name.includes("creator") || name.includes("vlog") || isPortrait) {
      label = t === 0 ? "Engaging On-Camera Greeting" : "Key Talking Point Explanation";
      tags.push("person", "creator", "face", "talking_head", "dialogue", "indoor");
      if (t === 0) isHighlight = true;
    } else {
      label = `Shot ${sceneIdx}: ${isLandscape ? "Wide View" : "Close-up View"}`;
      tags.push(isLandscape ? "landscape" : "portrait", "action", "natural");
    }

    scenes.push({
      id: `scene_${sceneIdx}_${Math.floor(t * 10)}`,
      inTime: Number(t.toFixed(2)),
      outTime: Number(outTime.toFixed(2)),
      label,
      score: isHighlight ? 95 : 82,
      tags,
      isHighlight,
      thumbnailTime: Number((t + 0.5).toFixed(2)),
    });

    sceneIdx++;
  }

  // Generate transcript words if audio present
  const transcript: TranscriptWord[] = [];
  if (asset.hasAudio) {
    if (name.includes("creator") || name.includes("vlog") || isPortrait) {
      transcript.push(
        { start: 0.2, end: 1.0, text: "Welcome", confidence: 0.98 },
        { start: 1.1, end: 1.8, text: "back", confidence: 0.97 },
        { start: 1.9, end: 2.7, text: "everyone!", confidence: 0.99 },
        { start: 3.0, end: 4.2, text: "Today we are crafting something", confidence: 0.95 },
        { start: 4.3, end: 5.5, text: "completely breathtaking with AI.", confidence: 0.96 }
      );
    } else {
      transcript.push(
        { start: 0.5, end: 2.0, text: "[Ambient room tone]", confidence: 0.9 },
        { start: 2.5, end: 4.5, text: "[Natural breeze & atmosphere]", confidence: 0.92 }
      );
    }
  }

  // Tags aggregation
  const allTags = Array.from(new Set(scenes.flatMap((s) => s.tags)));

  // Determine suggested use
  let suggestedUse: "intro" | "hook" | "b-roll" | "highlight" | "outro" = "b-roll";
  if (name.includes("creator") || name.includes("vlog")) suggestedUse = "hook";
  else if (name.includes("sunset")) suggestedUse = "intro";
  else if (name.includes("city")) suggestedUse = "highlight";
  else if (name.includes("beach")) suggestedUse = "b-roll";

  return {
    duration,
    width: asset.width,
    height: asset.height,
    fps: asset.fps || 30,
    hasAudio: asset.hasAudio,
    scenes,
    tags: allTags,
    transcript,
    quality: {
      blurScore: 88,
      exposure: "good",
      audioClarity: asset.hasAudio ? "clean" : "silent",
      warnings: [],
    },
    suggestedUse,
    summary: `${asset.width}x${asset.height} ${Math.round(duration)}s footage with ${scenes.length} detectable scene segments and high visual clarity.`,
  };
}

// Natural language search across footage clips
export interface SearchFootageResult {
  assetId: string;
  assetName: string;
  thumbnailUrl: string;
  matchedScenes: Array<{
    sceneId: string;
    inTime: number;
    outTime: number;
    label: string;
    score: number;
    matchedTag: string;
  }>;
}

export function searchFootageClips(
  assets: SourceAsset[],
  query: string
): SearchFootageResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchFootageResult[] = [];

  const keywords = q.split(/\s+/).filter(Boolean);

  for (const asset of assets) {
    const intel = asset.intelligence || analyzeClipIntelligence(asset);
    const matchedScenes: SearchFootageResult["matchedScenes"] = [];

    for (const scene of intel.scenes) {
      let matchScore = 0;
      let matchedTag = "";

      for (const kw of keywords) {
        if (scene.label.toLowerCase().includes(kw)) {
          matchScore += 40;
          matchedTag = kw;
        }
        for (const tag of scene.tags) {
          if (tag.toLowerCase().includes(kw)) {
            matchScore += 35;
            matchedTag = tag;
          }
        }
      }

      // Check transcript
      for (const word of intel.transcript) {
        if (word.start >= scene.inTime && word.end <= scene.outTime) {
          for (const kw of keywords) {
            if (word.text.toLowerCase().includes(kw)) {
              matchScore += 45;
              matchedTag = `"${word.text}"`;
            }
          }
        }
      }

      if (matchScore > 0) {
        matchedScenes.push({
          sceneId: scene.id,
          inTime: scene.inTime,
          outTime: scene.outTime,
          label: scene.label,
          score: Math.min(100, matchScore + 20),
          matchedTag: matchedTag || "visual feature",
        });
      }
    }

    if (matchedScenes.length > 0) {
      results.push({
        assetId: asset.id,
        assetName: asset.originalName || asset.filename,
        thumbnailUrl: asset.thumbnailUrl,
        matchedScenes: matchedScenes.sort((a, b) => b.score - a.score),
      });
    }
  }

  return results;
}
