"use client";

import { useState } from "react";
import { EditDecisionList, Project, TimelineClip } from "@/lib/types";
import {
  Sparkles,
  Sliders,
  History,
  Send,
  Loader2,
  Check,
  RotateCcw,
  Volume2,
  Gauge,
  Scissors,
  Layers,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

interface RightPanelProps {
  project: Project;
  activeEdl: EditDecisionList;
  selectedClip: TimelineClip | null;
  onUpdateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  onSendMessage: (text: string) => Promise<void>;
  isProcessingChat: boolean;
  chatHistory: Array<{ role: "user" | "assistant"; text: string; actions?: string[] }>;
  onRestoreVersion: (versionId: string) => Promise<void>;
}

export function RightPanel({
  project,
  activeEdl,
  selectedClip,
  onUpdateClip,
  onSendMessage,
  isProcessingChat,
  chatHistory,
  onRestoreVersion,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<"assistant" | "properties" | "history">("assistant");
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessingChat) return;
    const text = inputMessage.trim();
    setInputMessage("");
    await onSendMessage(text);
  };

  const sampleCommands = [
    "Make the intro faster",
    "Make captions smaller",
    "Reduce background music",
    "Make this feel more cinematic",
    "Make a 15-second version",
    "Remove long pauses",
  ];

  return (
    <aside className="w-80 h-full border-l border-white/10 bg-[#0E111B] flex flex-col select-none text-xs">
      {/* Tab Switcher */}
      <div className="grid grid-cols-3 border-b border-white/10 bg-[#0B0D13]">
        {[
          { id: "assistant", label: "AI Assistant", icon: Sparkles },
          { id: "properties", label: "Clip Inspector", icon: Sliders },
          { id: "history", label: "Versions", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 flex flex-col items-center justify-center gap-1 font-semibold transition-all ${
                isActive
                  ? "text-violet-400 border-b-2 border-violet-500 bg-white/5"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* TAB 1: AI ASSISTANT */}
        {activeTab === "assistant" && (
          <div className="flex-1 flex flex-col justify-between p-4">
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-violet-200">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="font-bold text-white text-xs">Conversational Editor</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Tell me what you&apos;d like changed in your edit. I update edit decisions
                  non-destructively and maintain your history.
                </p>
              </div>

              {/* Chat Log */}
              {chatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    item.role === "user"
                      ? "bg-white/5 border border-white/10 text-white ml-4 text-right"
                      : "bg-[#121624] border border-violet-500/20 text-gray-200 mr-2 text-left"
                  }`}
                >
                  <p className="font-semibold text-[10px] text-violet-400 mb-1 uppercase tracking-wider">
                    {item.role === "user" ? "You" : "EditMind Assistant"}
                  </p>
                  <p>{item.text}</p>
                  {item.actions && item.actions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                      {item.actions.map((act, i) => (
                        <p key={i} className="text-[10px] text-violet-300 flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{act}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isProcessingChat && (
                <div className="p-3 rounded-xl bg-[#121624] border border-violet-500/20 text-violet-300 flex items-center gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span>Analyzing instruction and modifying decision list...</span>
                </div>
              )}
            </div>

            {/* Quick Command Suggestions */}
            <div className="pt-3 border-t border-white/10 mt-2">
              <span className="text-[10px] text-gray-500 block mb-1.5 uppercase font-semibold">
                Quick Commands
              </span>
              <div className="flex flex-wrap gap-1 mb-3">
                {sampleCommands.slice(0, 4).map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => onSendMessage(cmd)}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-[10px] text-gray-300 hover:text-violet-200 transition-colors"
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  placeholder="e.g. Make intro faster, reduce music..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isProcessingChat}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={isProcessingChat || !inputMessage.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: CLIP INSPECTOR / PROPERTIES */}
        {activeTab === "properties" && (
          <div className="p-4 space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Clip Inspector
            </h4>

            {selectedClip ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[#121624] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Clip Order:</span>
                    <span className="font-mono font-bold text-white">#{selectedClip.order + 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-mono font-bold text-violet-400">
                      {selectedClip.duration.toFixed(2)}s
                    </span>
                  </div>
                </div>

                {/* Trim boundaries */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-violet-400" />
                    <span>Source In / Out Points</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="p-2 rounded bg-black/40 border border-white/10">
                      <span className="text-gray-500 block text-[9px]">IN (SEC)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={selectedClip.sourceIn}
                        onChange={(e) =>
                          onUpdateClip(selectedClip.id, { sourceIn: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-white/10">
                      <span className="text-gray-500 block text-[9px]">OUT (SEC)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={selectedClip.sourceOut}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || selectedClip.sourceIn + 1;
                          onUpdateClip(selectedClip.id, {
                            sourceOut: val,
                            duration: Math.max(0.5, val - selectedClip.sourceIn),
                          });
                        }}
                        className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Playback speed */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-400" />
                      <span>Speed Multiplier</span>
                    </span>
                    <span className="font-mono text-blue-300">{selectedClip.speed || 1}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[0.5, 1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => onUpdateClip(selectedClip.id, { speed: spd })}
                        className={`py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                          (selectedClip.speed || 1) === spd
                            ? "bg-blue-600/30 border-blue-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transition type */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Transition Into Clip</span>
                  </label>
                  <select
                    value={selectedClip.transitionIn?.type || "cut"}
                    onChange={(e) =>
                      onUpdateClip(selectedClip.id, {
                        transitionIn: {
                          type: e.target.value as any,
                          duration: e.target.value === "cut" ? 0 : 0.6,
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="cut">Direct Cut (Hard Cut)</option>
                    <option value="dissolve">Cross Dissolve (0.6s)</option>
                    <option value="fade">Fade In from Black</option>
                    <option value="wipe">Directional Wipe</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-white/10 bg-[#121622] text-center text-gray-400">
                <Sliders className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-xs">Click any clip on the bottom timeline to inspect its trims and properties.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VERSION HISTORY */}
        {activeTab === "history" && (
          <div className="p-4 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
              Timeline Version History
            </h4>

            {(project.versions || []).length === 0 ? (
              <div className="p-6 rounded-xl border border-white/10 bg-[#121622] text-center text-gray-400">
                <History className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-xs">No saved versions yet. Changes and AI refinements will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(project.versions || []).map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3 rounded-xl border border-white/10 bg-[#121624] space-y-2 hover:border-violet-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">
                        v{ver.versionNumber}: {ver.title}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(ver.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{ver.changeSummary}</p>
                    <button
                      onClick={() => onRestoreVersion(ver.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-violet-600/20 hover:bg-violet-600 border border-violet-500/30 text-violet-300 hover:text-white text-[10px] font-semibold transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore Version
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
