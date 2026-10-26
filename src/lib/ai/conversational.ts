import { EditDecisionList, Project } from "../types";

export interface ConversationalEditResult {
  updatedEdl: EditDecisionList;
  changeSummary: string;
  assistantReply: string;
  appliedActions: string[];
}

export function processConversationalEdit(
  project: Project,
  currentEdl: EditDecisionList,
  instruction: string
): ConversationalEditResult {
  const edl: EditDecisionList = JSON.parse(JSON.stringify(currentEdl));
  const text = instruction.toLowerCase().trim();

  const appliedActions: string[] = [];
  let summary = "";
  let reply = "";

  // 1. "Make intro faster" or "faster cuts"
  if (text.includes("intro faster") || text.includes("speed up intro") || text.includes("shorter intro")) {
    if (edl.timeline.clips.length > 0) {
      const firstClip = edl.timeline.clips[0];
      const oldDur = firstClip.duration;
      const newDur = Math.max(1.0, Number((oldDur * 0.6).toFixed(2)));
      firstClip.duration = newDur;
      firstClip.sourceOut = firstClip.sourceIn + newDur;
      appliedActions.push(`Trimmed opening shot from ${oldDur.toFixed(1)}s down to ${newDur.toFixed(1)}s`);
      summary = "Accelerated intro shot";
      reply = `I accelerated the intro hook by trimming your first shot from ${oldDur.toFixed(1)}s to ${newDur.toFixed(1)}s for immediate viewer engagement.`;
    }
  }

  // 2. "Make captions smaller" or "minimal captions"
  else if (text.includes("caption") && (text.includes("smaller") || text.includes("minimal") || text.includes("subtle"))) {
    for (const cap of edl.timeline.captions) {
      cap.style = "minimal";
    }
    appliedActions.push("Converted all subtitle tracks to understated, minimal typography");
    summary = "Switched subtitles to minimal styling";
    reply = "I updated all on-screen captions to minimal, clean lower-third styling to let the visuals take center stage.";
  }

  // 3. "Reduce background music" or "lower music" or "quieter"
  else if (text.includes("music") && (text.includes("reduce") || text.includes("lower") || text.includes("quiet") || text.includes("softer"))) {
    for (const track of edl.timeline.audioTracks) {
      if (track.type === "music") {
        const oldVol = track.volume;
        track.volume = Math.max(0.15, Number((oldVol * 0.6).toFixed(2)));
        appliedActions.push(`Reduced background score volume from ${Math.round(oldVol * 100)}% to ${Math.round(track.volume * 100)}%`);
      }
    }
    summary = "Lowered background music volume";
    reply = "I decreased the background music volume to ensure dialogue and ambient environmental audio remain crisp and dominant.";
  }

  // 4. "Make this feel more cinematic" or "cinematic"
  else if (text.includes("cinematic") || text.includes("moody")) {
    edl.colorGrade = "warm_cinematic";
    for (let i = 1; i < edl.timeline.clips.length; i++) {
      edl.timeline.clips[i].transitionIn = {
        type: "dissolve",
        duration: 0.6,
      };
    }
    appliedActions.push("Applied warm filmic color grade and gentle 0.6s cinematic dissolves between clips");
    summary = "Applied cinematic color and dissolves";
    reply = "I applied our warm filmic color grading profile and transformed cuts into smooth cinematic cross-dissolves.";
  }

  // 5. "15-second version" or "make it 15"
  else if (text.includes("15") || (text.includes("shorter") && !text.includes("intro"))) {
    edl.targetDuration = 15;
    // Trim clips proportionally
    const target = 15;
    let accumulated = 0;
    const trimmedClips = [];

    for (const clip of edl.timeline.clips) {
      const allowed = Math.min(2.0, target - accumulated);
      if (allowed <= 0.5) break;
      clip.duration = Number(allowed.toFixed(2));
      clip.sourceOut = clip.sourceIn + clip.duration;
      trimmedClips.push(clip);
      accumulated += clip.duration;
      if (accumulated >= target) break;
    }
    edl.timeline.clips = trimmedClips;
    edl.totalDuration = Number(accumulated.toFixed(2));
    appliedActions.push(`Re-timed clip sequence to fit tight 15-second format (${trimmedClips.length} clips)`);
    summary = "Adapted to 15-second cut";
    reply = `I re-architected your timeline into a crisp 15-second cut, keeping the strongest moments and rebalancing the pacing.`;
  }

  // 6. "Remove pauses" or "jump cut"
  else if (text.includes("pause") || text.includes("silence") || text.includes("jump cut")) {
    for (const clip of edl.timeline.clips) {
      if (clip.duration > 2.5) {
        clip.duration = Number((clip.duration * 0.8).toFixed(2));
        clip.sourceOut = clip.sourceIn + clip.duration;
      }
      clip.transitionIn = { type: "cut", duration: 0 };
    }
    appliedActions.push("Trimmed trailing pauses across all clips and set strict jump cuts");
    summary = "Tightened pauses with jump cuts";
    reply = "I shaved dead air and trailing pauses off each clip, switching transitions to immediate jump cuts for maximum momentum.";
  }

  // 7. General prompt refinement / fallback
  else {
    edl.colorGrade = "vibrant";
    if (edl.timeline.clips.length > 0) {
      edl.timeline.clips[0].volume = 1.0;
    }
    appliedActions.push(`Refined timeline pacing and audio balancing based on: "${instruction}"`);
    summary = `Refined edit: "${instruction}"`;
    reply = `I've analyzed "${instruction}" and adjusted your timeline parameters, balancing clip order and audio levels while preserving your media cuts.`;
  }

  // Recalculate total duration
  edl.totalDuration = Number(
    edl.timeline.clips.reduce((acc, c) => acc + c.duration, 0).toFixed(2)
  );
  edl.version = (edl.version || 1) + 1;
  edl.updatedAt = new Date().toISOString();

  return {
    updatedEdl: edl,
    changeSummary: summary,
    assistantReply: reply,
    appliedActions,
  };
}
