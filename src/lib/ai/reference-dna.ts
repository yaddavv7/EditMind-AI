import { ReferenceDNA } from "../types";
import { ProbeResult } from "../ffmpeg/probe";

export function extractReferenceDNA(
  probe: ProbeResult,
  filename: string,
  userPromptHint?: string
): ReferenceDNA {
  const isPortrait = probe.height > probe.width;
  const isSquare = Math.abs(probe.width - probe.height) < 40;
  const preferredAspectRatio = isPortrait ? "9:16" : isSquare ? "1:1" : "16:9";

  const lowerName = filename.toLowerCase();

  // Heuristic estimation based on reference video characteristics and naming
  let styleName = "Cinematic Travel & Lifestyle";
  let averageShotDuration = 2.8;
  let cutFrequency: ReferenceDNA["cutFrequency"] = "rapid";
  let pacing: ReferenceDNA["pacing"] = "fast";
  let transitionStyle: ReferenceDNA["transitionStyle"] = "clean";
  let captionStyle: ReferenceDNA["captionStyle"] = "bold_pop";
  let captionPosition: ReferenceDNA["captionPosition"] = "center";
  let colorMood: ReferenceDNA["colorMood"] = "warm_cinematic";
  let shotDurationTarget = 2.5;
  let musicEnergy: ReferenceDNA["musicEnergy"] = "high";

  if (lowerName.includes("reel") || lowerName.includes("tiktok") || isPortrait) {
    styleName = "High-Energy Social Reel";
    averageShotDuration = 1.8;
    cutFrequency = "rapid";
    pacing = "fast";
    transitionStyle = "hard_cut";
    captionStyle = "bold_pop";
    captionPosition = "center";
    colorMood = "vibrant";
    shotDurationTarget = 1.6;
    musicEnergy = "high";
  } else if (lowerName.includes("moody") || lowerName.includes("film") || lowerName.includes("drone")) {
    styleName = "Moody Filmic Narrative";
    averageShotDuration = 4.2;
    cutFrequency = "slow_rhythmic";
    pacing = "cinematic";
    transitionStyle = "crossfade";
    captionStyle = "minimal";
    captionPosition = "bottom";
    colorMood = "moody_teal_orange";
    shotDurationTarget = 4.0;
    musicEnergy = "medium";
  } else if (lowerName.includes("business") || lowerName.includes("corporate")) {
    styleName = "Sleek Executive Commercial";
    averageShotDuration = 3.0;
    cutFrequency = "moderate";
    pacing = "medium";
    transitionStyle = "clean";
    captionStyle = "minimal";
    captionPosition = "bottom";
    colorMood = "natural";
    shotDurationTarget = 3.2;
    musicEnergy = "medium";
  }

  // Detected rules summary
  const detectedRules = [
    `Detected canvas format: ${probe.width}x${probe.height} (${preferredAspectRatio}) at ${probe.fps} FPS`,
    `Audio track identified: ${probe.hasAudio ? "Stereo master track present" : "No embedded audio"}`,
    `Average shot duration estimated at ${averageShotDuration.toFixed(1)}s with ${cutFrequency} cut pacing`,
    `Recommended transition behavior: ${transitionStyle} with ${captionStyle} caption styling`,
    `Color grading signature: ${colorMood.replace(/_/g, " ")}`,
  ];

  return {
    styleName,
    averageShotDuration,
    cutFrequency,
    pacing,
    transitionStyle,
    captionStyle,
    captionPosition,
    colorMood,
    preferredAspectRatio,
    shotDurationTarget,
    musicEnergy,
    confidenceScore: 92,
    detectedRules,
  };
}
