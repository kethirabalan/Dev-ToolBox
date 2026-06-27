import React from "react";
import { ToolType, ThemeConfig, UserProgress, DailyQuest } from "../types";
import { ListFilter, Sparkles, BookOpen, Clock, RefreshCw, Trophy, MessageSquare, ExternalLink } from "lucide-react";

interface ProgressSidebarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  progress: UserProgress;
  theme: ThemeConfig;
  playClick: () => void;
  dailyQuest: DailyQuest;
}

export default function ProgressSidebar({
  activeTool,
  setActiveTool,
  progress,
  theme,
  playClick,
  dailyQuest,
}: ProgressSidebarProps) {

  const toolsList = [
    { type: ToolType.BEAUTIFY, label: "JSON Beautify", shortcut: "Alt+1", glyph: "{ }" },
    { type: ToolType.COMPARE, label: "JSON Compare", shortcut: "Alt+2", glyph: "≠" },
    { type: ToolType.VALIDATOR, label: "JSON Validator", shortcut: "Alt+3", glyph: "✓" },
    { type: ToolType.YAML, label: "YAML Converter", shortcut: "Alt+4", glyph: "Y" },
    { type: ToolType.TOML, label: "TOML Converter", shortcut: "Alt+5", glyph: "T" },
    { type: ToolType.XML, label: "XML Converter", shortcut: "Alt+6", glyph: "X" },
    { type: ToolType.CSV, label: "CSV Converter", shortcut: "Alt+7", glyph: "C" },
    { type: ToolType.JWT, label: "JWT Decoder", shortcut: "Alt+8", glyph: "J" },
    { type: ToolType.BASE64, label: "Base64 Encoder", shortcut: "Alt+9", glyph: "64" },
    { type: ToolType.URL_PARSER, label: "URL Parser", shortcut: "Alt+U", glyph: "U" },
    { type: ToolType.SCHEDULE_CALCULATOR, label: "Schedule Calc", shortcut: "Alt+K", glyph: "⏱" },
    { type: ToolType.HASH_GENERATOR, label: "Hash Generator", shortcut: "Alt+H", glyph: "##" },
    { type: ToolType.TIMESTAMP, label: "Epoch Converter", shortcut: "Alt+T", glyph: "EP" },
    { type: ToolType.TECH_GAMES, label: "Retro Arcade", shortcut: "Alt+G", glyph: "🕹" },
  ];

  const handleToolSelect = (tool: ToolType) => {
    playClick();
    setActiveTool(tool);
  };

  // Render tiny 8-bit progress bar for quest
  const renderQuestBar = () => {
    const totalBlocks = 6;
    const filledBlocks = Math.round((dailyQuest.currentCount / dailyQuest.targetCount) * totalBlocks);
    const blocks = "█".repeat(Math.max(0, Math.min(totalBlocks, filledBlocks))) +
                   "░".repeat(Math.max(0, totalBlocks - Math.max(0, Math.min(totalBlocks, filledBlocks))));
    return blocks;
  };

  return (
    <aside 
      className="w-full lg:w-72 border-r-2 flex flex-col font-mono text-xs" 
      style={{ borderColor: theme.primaryColor, color: theme.primaryColor, backgroundColor: '#0a0b0a' }}
      id="progress-and-navigation-sidebar"
    >
      {/* Category Heading */}
      <div 
        className="p-2 border-b bg-[#111111] flex items-center gap-1.5 font-bold"
        style={{ borderColor: `${theme.primaryColor}33`, color: theme.primaryColor }}
      >
        <ListFilter className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
        <span>SELECT_CORE_TOOL.BIN</span>
      </div>

      {/* Tool Selector Buttons */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {toolsList.map((tool) => {
          const isActive = activeTool === tool.type;
          return (
            <button
              key={tool.type}
              onClick={() => handleToolSelect(tool.type)}
              className="w-full text-left p-2 border flex items-center justify-between group cursor-pointer transition-all duration-150"
              style={
                isActive
                  ? {
                      backgroundColor: theme.primaryColor,
                      color: "#0a0b0a",
                      borderColor: theme.primaryColor,
                      fontWeight: "bold",
                    }
                  : {
                      borderColor: `${theme.primaryColor}15`,
                      color: `${theme.primaryColor}cc`,
                      backgroundColor: "transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = theme.primaryColor;
                  e.currentTarget.style.backgroundColor = `${theme.primaryColor}11`;
                  e.currentTarget.style.color = theme.primaryColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = `${theme.primaryColor}15`;
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = `${theme.primaryColor}cc`;
                }
              }}
            >
              <div className="flex items-center gap-2">
                {/* Pixelated Glyphs */}
                <span 
                  className="inline-block text-center w-6 px-1 py-0.5 border text-[10px]"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#0a0b0a",
                          color: theme.primaryColor,
                          borderColor: "#0a0b0a",
                        }
                      : {
                          borderColor: `${theme.primaryColor}33`,
                          backgroundColor: "#111111",
                          color: theme.primaryColor,
                        }
                  }
                >
                  {tool.glyph}
                </span>
                <span className="truncate">{tool.label}</span>
              </div>
              <span 
                className="text-[9px] opacity-60 group-hover:opacity-100"
                style={{ color: isActive ? "#0a0b0a" : theme.primaryColor }}
              >
                {tool.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Daily Quest Box */}
      <div className="p-3 border-t bg-[#111111]/40" style={{ borderTopColor: `${theme.primaryColor}33` }}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold flex items-center gap-1 text-yellow-400">
            <Trophy className="w-3.5 h-3.5 fill-current text-yellow-500" />
            DAILY_QUEST.SYS
          </span>
          <span className="text-yellow-400">+{dailyQuest.xpReward} XP</span>
        </div>
        <p className="text-neutral-400 leading-normal text-[11px] mb-2">{dailyQuest.description}</p>
        
        <div className="flex items-center justify-between bg-neutral-950 p-1.5 border" style={{ borderColor: `${theme.primaryColor}22` }}>
          <span className="text-[10px] font-mono" style={{ color: `${theme.primaryColor}88` }}>[{renderQuestBar()}]</span>
          <span className="text-white font-bold">{dailyQuest.currentCount}/{dailyQuest.targetCount}</span>
        </div>
        {dailyQuest.completed && (
          <div 
            className="mt-1.5 text-center p-0.5 border text-[10px] font-bold animate-pulse"
            style={{ 
              backgroundColor: `${theme.primaryColor}11`, 
              borderColor: `${theme.primaryColor}33`, 
              color: theme.primaryColor 
            }}
          >
            ✓ QUEST COMPLETED (+{dailyQuest.xpReward} XP CALIBRATED)
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Sheet Box */}
      <div className="p-3 border-t bg-black/80 text-[10px] text-neutral-400 space-y-1" style={{ borderTopColor: `${theme.primaryColor}33` }}>
        <div className="text-white font-bold flex items-center gap-1 mb-1">
          <BookOpen className="w-3 h-3" style={{ color: theme.primaryColor }} />
          QUICK KEYBOARD BINDINGS:
        </div>
        <div className="flex justify-between">
          <span>Run Compiles</span>
          <span className="font-bold font-mono" style={{ color: theme.primaryColor }}>Ctrl + Enter</span>
        </div>
        <div className="flex justify-between">
          <span>Workspace console</span>
          <span className="font-bold font-mono" style={{ color: theme.primaryColor }}>Alt + N</span>
        </div>
        <div className="flex justify-between">
          <span>Achievements page</span>
          <span className="font-bold font-mono" style={{ color: theme.primaryColor }}>Alt + A</span>
        </div>
        <div className="flex justify-between">
          <span>Settings (themes)</span>
          <span className="font-bold font-mono" style={{ color: theme.primaryColor }}>Alt + S</span>
        </div>
      </div>

      {/* Broadcast Feed / Feedback Transmitter */}
      <div className="p-3 border-t bg-[#111111]/40 flex flex-col gap-1.5" style={{ borderTopColor: `${theme.primaryColor}33` }}>
        <div className="text-white font-bold flex items-center gap-1 text-[10px]">
          <MessageSquare className="w-3 h-3" style={{ color: theme.primaryColor }} />
          TRANSMIT_FEEDBACK.SYS
        </div>
        <p className="text-[10px] text-neutral-400 leading-normal">
          Suggest core tool features, report bugs, or request retro updates.
        </p>
        <a
          href="https://insigh.to/b/dev-toolbox"
          target="_blank"
          rel="noopener noreferrer"
          onClick={playClick}
          className="w-full py-1.5 border flex items-center justify-center gap-1 cursor-pointer transition-all hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider"
          style={{ borderColor: `${theme.primaryColor}55`, color: theme.primaryColor }}
        >
          <span>BroadCast Ideas</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </aside>
  );
}
