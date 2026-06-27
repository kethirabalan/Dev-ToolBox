import React from "react";
import { UserProgress, ThemeConfig } from "../types";
import { Coffee, Volume2, VolumeX, Eye, EyeOff, Sparkles, Flame } from "lucide-react";

interface TerminalHeaderProps {
  progress: UserProgress;
  theme: ThemeConfig;
  playClick: () => void;
  onToggleSound: () => void;
  onToggleCrt: () => void;
  onCoffeeClick: () => void;
  onShowAchievements: () => void;
  onShowSettings: () => void;
  currentTab: "workspace" | "achievements" | "settings";
  setCurrentTab: (tab: "workspace" | "achievements" | "settings") => void;
}

export default function TerminalHeader({
  progress,
  theme,
  playClick,
  onToggleSound,
  onToggleCrt,
  onCoffeeClick,
  onShowAchievements,
  onShowSettings,
  currentTab,
  setCurrentTab,
}: TerminalHeaderProps) {
  
  // Custom XP progress rendering as retro [████░░░░] block
  const renderXpBar = () => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((progress.xp / progress.xpForNextLevel) * totalBlocks);
    const blocksStr = "█".repeat(Math.max(0, Math.min(totalBlocks, filledBlocks))) +
                      "░".repeat(Math.max(0, totalBlocks - Math.max(0, Math.min(totalBlocks, filledBlocks))));
    const percent = Math.round((progress.xp / progress.xpForNextLevel) * 100);
    return { blocksStr, percent };
  };

  const { blocksStr, percent } = renderXpBar();

  // Retro Titles depending on User level
  const getLevelTitle = (level: number) => {
    if (level >= 10) return "Root Admin";
    if (level >= 9) return "Cyber Wizard";
    if (level >= 8) return "Compiler Conqueror";
    if (level >= 7) return "Kernel Commander";
    if (level >= 6) return "Assembly Adept";
    if (level >= 5) return "Terminal Tactician";
    if (level >= 4) return "Buffer Baron";
    if (level >= 3) return "Syntax Soldier";
    if (level >= 2) return "Code Cadet";
    return "Script Kiddie";
  };

  const handleTabChange = (tab: "workspace" | "achievements" | "settings") => {
    playClick();
    setCurrentTab(tab);
  };

  return (
    <header 
      className="flex flex-col border-b-2 bg-[#111111]" 
      style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
      id="terminal-top-panel"
    >
      {/* Top Banner Row */}
      <div 
        className="flex flex-wrap items-center justify-between gap-4 p-3 border-b"
        style={{ borderColor: `${theme.primaryColor}22` }}
      >
        {/* Logo / Blinking title */}
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-xs animate-pulse"
            style={{ backgroundColor: theme.primaryColor }}
          ></div>
          <span className="font-mono text-base font-black tracking-wider text-white">
            DEV_TOOLBOX.EXE <span className="font-normal text-xs font-mono ml-1" style={{ color: theme.primaryColor }}>v1.0.0 [OFFLINE]</span>
          </span>
          <span 
            className="w-1.5 h-4 animate-bounce"
            style={{ backgroundColor: theme.primaryColor }}
          ></span>
        </div>

        {/* Gamified progress bar stats */}
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
          {/* Level indicators */}
          <div 
            className="flex items-center gap-2 bg-[#0a0b0a] px-2 py-1 border"
            style={{ borderColor: `${theme.primaryColor}22` }}
          >
            <span className="text-white font-bold">LVL {progress.level}</span>
            <span className="text-neutral-600">|</span>
            <span className="select-none" style={{ color: theme.primaryColor }}>[{blocksStr}]</span>
            <span className="text-neutral-400 text-[10px]">{progress.xp}/{progress.xpForNextLevel} XP ({percent}%)</span>
          </div>

          {/* Dev Rank title */}
          <div 
            className="hidden lg:flex items-center gap-1.5 bg-[#0a0b0a] px-2 py-1 border"
            style={{ borderColor: `${theme.primaryColor}22` }}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-neutral-400">RANK:</span>
            <span className="text-yellow-400 font-bold">{getLevelTitle(progress.level)}</span>
          </div>

          {/* Streaks */}
          {progress.streak > 0 && (
            <div className="flex items-center gap-1 bg-amber-950/40 text-amber-400 px-2.5 py-1 border border-amber-500/30">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>STREAK: {progress.streak} DAYS</span>
            </div>
          )}
        </div>

        {/* Audio / CRT configs & Contribution Link */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 border bg-[#0a0b0a] hover:text-white cursor-pointer"
            style={{ 
              borderColor: `${theme.primaryColor}33`, 
              color: theme.primaryColor,
              backgroundColor: progress.soundEnabled ? `${theme.primaryColor}11` : '#0a0b0a'
            }}
            title={progress.soundEnabled ? "Mute audio synths" : "Enable 8-bit sound fx"}
          >
            {progress.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-600" />}
          </button>

          {/* CRT glass Toggle */}
          <button
            onClick={onToggleCrt}
            className="p-1.5 border bg-[#0a0b0a] hover:text-white cursor-pointer"
            style={{ 
              borderColor: `${theme.primaryColor}33`, 
              color: theme.primaryColor,
              backgroundColor: progress.crtEnabled ? `${theme.primaryColor}11` : '#0a0b0a'
            }}
            title="Toggle terminal scanlines & CRT flicker"
          >
            {progress.crtEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-600" />}
          </button>

          {/* Buy Me a Coffee support */}
          <a
            href="https://buymeacoffee.com/kbalan"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCoffeeClick}
            className="px-3 py-1 font-bold font-mono text-xs flex items-center gap-1.5 border-2 transition-transform hover:-translate-y-0.5 select-none"
            style={{
              backgroundColor: theme.primaryColor,
              color: '#0a0b0a',
              borderColor: '#0a0b0a'
            }}
            id="coffee-donation-link"
          >
            <Coffee className="w-3.5 h-3.5 fill-current" />
            BUY ME A COFFEE
          </a>
        </div>
      </div>

      {/* Retro Navigation Tabs */}
      <div className="flex bg-[#0a0b0a] text-xs font-mono border-b" style={{ borderColor: `${theme.primaryColor}11` }}>
        <button
          onClick={() => handleTabChange("workspace")}
          className="px-4 py-2 border-r hover:text-white cursor-pointer"
          style={{
            borderTopColor: `${theme.primaryColor}11`,
            borderRightColor: `${theme.primaryColor}11`,
            borderBottomColor: currentTab === "workspace" ? theme.primaryColor : 'transparent',
            borderLeftColor: `${theme.primaryColor}11`,
            borderBottomWidth: currentTab === "workspace" ? '2px' : '0px',
            borderBottomStyle: 'solid',
            backgroundColor: currentTab === "workspace" ? '#111111' : 'transparent',
            color: currentTab === "workspace" ? '#ffffff' : `${theme.primaryColor}99`,
            fontWeight: currentTab === "workspace" ? 'bold' : 'normal',
          }}
        >
          [⌨] WORKSTATION_CONSOLE
        </button>

        <button
          onClick={() => handleTabChange("achievements")}
          className="px-4 py-2 border-r hover:text-white cursor-pointer"
          style={{
            borderTopColor: `${theme.primaryColor}11`,
            borderRightColor: `${theme.primaryColor}11`,
            borderBottomColor: currentTab === "achievements" ? theme.primaryColor : 'transparent',
            borderLeftColor: `${theme.primaryColor}11`,
            borderBottomWidth: currentTab === "achievements" ? '2px' : '0px',
            borderBottomStyle: 'solid',
            backgroundColor: currentTab === "achievements" ? '#111111' : 'transparent',
            color: currentTab === "achievements" ? '#ffffff' : `${theme.primaryColor}99`,
            fontWeight: currentTab === "achievements" ? 'bold' : 'normal',
          }}
        >
          [🏆] ACHIEVEMENTS_ROOM
        </button>

        <button
          onClick={() => handleTabChange("settings")}
          className="px-4 py-2 hover:text-white cursor-pointer"
          style={{
            borderBottomColor: currentTab === "settings" ? theme.primaryColor : 'transparent',
            borderBottomWidth: currentTab === "settings" ? '2px' : '0px',
            borderBottomStyle: 'solid',
            backgroundColor: currentTab === "settings" ? '#111111' : 'transparent',
            color: currentTab === "settings" ? '#ffffff' : `${theme.primaryColor}99`,
            fontWeight: currentTab === "settings" ? 'bold' : 'normal',
          }}
        >
          [⚙] THEME_CONFIGS
        </button>

        <div 
          className="flex-1 flex justify-end items-center px-4 select-none hidden sm:flex text-[10px]"
          style={{ color: `${theme.primaryColor}44` }}
        >
          SYS_STATUS: ONLINE (LOCAL ENGINE)
        </div>
      </div>
    </header>
  );
}
