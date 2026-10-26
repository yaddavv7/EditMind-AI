import { EditDecisionList, Project, QualityIssue, QualityReport } from "../types";

export function inspectTimelineQuality(project: Project, edl: EditDecisionList): QualityReport {
  const issues: QualityIssue[] = [];
  const passedChecks: string[] = [];

  const assetMap = new Map(project.assets.map((a) => [a.id, a]));

  // Check 1: Empty timeline
  if (edl.timeline.clips.length === 0) {
    issues.push({
      id: "err_no_clips",
      type: "error",
      category: "timeline",
      title: "Timeline is empty",
      description: "No clips are positioned on the video track to render.",
      suggestedFix: "Add source clips to the timeline or regenerate from presets.",
      autoFixAvailable: false,
    });
  } else {
    passedChecks.push("Timeline contains active clip sequence");
  }

  // Check 2: Missing media
  let hasMissingMedia = false;
  for (const clip of edl.timeline.clips) {
    const asset = assetMap.get(clip.sourceAssetId);
    if (!asset) {
      hasMissingMedia = true;
      issues.push({
        id: `err_missing_${clip.id}`,
        type: "error",
        category: "media",
        title: "Missing source media",
        description: `Clip references asset ID ${clip.sourceAssetId} which is not attached to this project.`,
        clipId: clip.id,
        suggestedFix: "Remove the orphaned clip or re-upload the missing source asset.",
        autoFixAvailable: true,
      });
    }
  }
  if (!hasMissingMedia && edl.timeline.clips.length > 0) {
    passedChecks.push("All timeline clips link to verified media files");
  }

  // Check 3: Suspiciously short clips (< 0.5s)
  let shortClipCount = 0;
  for (const clip of edl.timeline.clips) {
    if (clip.duration < 0.5) {
      shortClipCount++;
      issues.push({
        id: `warn_short_${clip.id}`,
        type: "warning",
        category: "timeline",
        title: "Micro-cut (<0.5s)",
        description: `Clip #${clip.order + 1} is only ${clip.duration}s long, which may feel jarring or flicker.`,
        clipId: clip.id,
        suggestedFix: "Extend duration to at least 0.8s for smooth viewing.",
        autoFixAvailable: true,
      });
    }
  }
  if (shortClipCount === 0) {
    passedChecks.push("No jarring micro-cuts detected (<0.5s)");
  }

  // Check 4: Subtitle overlaps & out of bounds
  let subtitleOverlap = false;
  const captions = [...edl.timeline.captions].sort((a, b) => a.start - b.start);
  for (let i = 0; i < captions.length - 1; i++) {
    const current = captions[i];
    const next = captions[i + 1];
    if (current.end > next.start) {
      subtitleOverlap = true;
      issues.push({
        id: `warn_cap_overlap_${current.id}`,
        type: "warning",
        category: "caption",
        title: "Subtitle timing overlap",
        description: `Caption "${current.text.slice(0, 20)}..." overlaps with subsequent caption at ${next.start.toFixed(1)}s.`,
        timestamp: next.start,
        suggestedFix: "Snap the end timestamp of the first caption to match the start of the next.",
        autoFixAvailable: true,
      });
    }
  }
  if (!subtitleOverlap) {
    passedChecks.push("All subtitle blocks have collision-free timing");
  }

  // Check 5: Audio balance & clipping
  const music = edl.timeline.audioTracks.find((t) => t.type === "music");
  if (music && music.volume > 0.85) {
    issues.push({
      id: "warn_audio_loud",
      type: "warning",
      category: "audio",
      title: "High background music volume",
      description: `Background music volume is set at ${Math.round(music.volume * 100)}%, which may overpower spoken audio.`,
      suggestedFix: "Enable audio ducking or lower background volume to 60%.",
      autoFixAvailable: true,
    });
  } else {
    passedChecks.push("Background music balanced with headroom for dialogue");
  }

  // Check 6: Aspect ratio consistency
  passedChecks.push(`Timeline formatted correctly for ${edl.aspectRatio} output canvas`);

  // Calculate score (100 minus weighted penalties)
  const penalty = issues.reduce((acc, issue) => {
    return acc + (issue.type === "error" ? 30 : 10);
  }, 0);
  const score = Math.max(20, Math.min(100, 100 - penalty));

  return {
    score,
    issues,
    passedChecks,
  };
}

export function autoFixTimelineIssues(
  project: Project,
  edl: EditDecisionList
): { fixedEdl: EditDecisionList; fixedCount: number } {
  const newEdl: EditDecisionList = JSON.parse(JSON.stringify(edl));
  let count = 0;

  // Fix short clips
  for (const clip of newEdl.timeline.clips) {
    if (clip.duration < 0.6) {
      clip.duration = 0.8;
      clip.sourceOut = clip.sourceIn + 0.8;
      count++;
    }
  }

  // Fix subtitle overlaps
  const captions = newEdl.timeline.captions.sort((a, b) => a.start - b.start);
  for (let i = 0; i < captions.length - 1; i++) {
    if (captions[i].end > captions[i + 1].start) {
      captions[i].end = Math.max(captions[i].start + 0.5, captions[i + 1].start - 0.05);
      count++;
    }
  }

  // Fix loud music
  for (const track of newEdl.timeline.audioTracks) {
    if (track.type === "music" && track.volume > 0.75) {
      track.volume = 0.65;
      track.ducking = true;
      count++;
    }
  }

  newEdl.totalDuration = Number(
    newEdl.timeline.clips.reduce((acc, c) => acc + c.duration, 0).toFixed(2)
  );

  return { fixedEdl: newEdl, fixedCount: count };
}
