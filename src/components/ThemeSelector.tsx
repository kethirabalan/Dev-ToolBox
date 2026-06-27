import React from "react";
import { ThemeConfig, UserProgress } from "../types";
import { RETRO_THEMES } from "../utils/themes";
import { Monitor, Volume2, Eye, ShieldAlert, Sparkles, MessageSquare, ExternalLink } from "lucide-react";

interface ThemeSelectorProps {
  currentTheme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  progress: UserProgress;
  playClick: () => void;
  onToggleSound: () => void;
  onToggleCrt: () => void;
  onResetStats: () => void;
}

export default function ThemeSelector({
  currentTheme,
  setTheme,
  progress,
  playClick,
  onToggleSound,
  onToggleCrt,
  onResetStats,
}: ThemeSelectorProps) {

  const handleThemeChange = (theme: ThemeConfig) => {
    playClick();
    setTheme(theme);
    // Custom achievements event check trigger will occur in App.tsx
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-black/40 font-mono text-green-500 space-y-6" id="settings-view-panel">
      {/* Settings Header */}
      <div className="border border-green-500/30 p-4 bg-neutral-950/80">
        <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-green-500" />
          SYSTEM TERMINAL SETTINGS
        </h2>
        <p className="text-[11px] text-neutral-400 leading-normal">
          Customize physical display configurations, adjust audio outputs, or recalibrate the retro mainframe environment. All adjustments are stored in your client browser cache.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme List Grid */}
        <div className="border border-green-500/20 p-4 bg-neutral-950/60 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase border-b border-green-500/10 pb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            PHOSPHOR CRT STYLES
          </h3>

          <div className="space-y-2">
            {RETRO_THEMES.map((theme) => {
              const isSelected = currentTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-full text-left p-3 border-2 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? `bg-black ${theme.accentBorder} ${theme.glowColor}`
                      : "border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual Color Dots */}
                    <span
                      className="w-4 h-4 border border-white/10 rounded-full inline-block"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? "text-white" : "text-neutral-300"}`}>
                        {theme.name}
                      </div>
                      <div className="text-[9px] text-neutral-500">
                        HEX: {theme.primaryColor} • shadow-glow config active
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] px-1 bg-green-950 text-green-400 border border-green-500/30 font-bold">
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Display and Data controls */}
        <div className="space-y-6">
          {/* Signal adjustment box */}
          <div className="border border-green-500/20 p-4 bg-neutral-950/60 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase border-b border-green-500/10 pb-1.5">
              HARDWARE SIGNAL ADJUSTMENTS
            </h3>

            {/* Toggle Audio */}
            <button
              onClick={onToggleSound}
              className={`w-full p-2.5 border text-left flex items-center justify-between cursor-pointer ${
                progress.soundEnabled
                  ? "border-green-500 bg-green-950/10 text-white"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-green-500" />
                <span className="text-xs">Chiptune Oscillator Audio</span>
              </div>
              <span className="text-[10px] font-bold">
                {progress.soundEnabled ? "ON [8-BIT OSC]" : "MUTED"}
              </span>
            </button>

            {/* Toggle Scanlines */}
            <button
              onClick={onToggleCrt}
              className={`w-full p-2.5 border text-left flex items-center justify-between cursor-pointer ${
                progress.crtEnabled
                  ? "border-green-500 bg-green-950/10 text-white"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-500" />
                <span className="text-xs">Analog CRT Glass Scanline Overlay</span>
              </div>
              <span className="text-[10px] font-bold">
                {progress.crtEnabled ? "ON [60Hz SCAN]" : "OFF"}
              </span>
            </button>
          </div>

          {/* Feedback Transmitter Section */}
          <div className="border border-green-500/20 p-4 bg-neutral-950/60 space-y-3" id="feedback-transmitter-panel">
            <h3 className="text-xs font-bold text-white uppercase border-b border-green-500/10 pb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-green-500" />
              SYSTEM FEEDBACK TRANSMITTER
            </h3>
            <p className="text-[10px] text-neutral-400 leading-normal">
              Have core tool recommendations, visual upgrade requests, or bug reports? Broadcast your transmission directly to the developer command database via our feedback frequency link.
            </p>
            <a
              href="https://insigh.to/b/dev-toolbox"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="w-full p-2.5 border border-green-500/30 bg-green-950/10 hover:bg-green-950/35 hover:border-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer text-center transition-colors shadow-sm"
            >
              <span>TRANSMIT SYSTEM FEEDBACK</span>
              <ExternalLink className="w-3.5 h-3.5 text-green-400" />
            </a>
          </div>

          {/* Hard reset box */}
          <div className="border border-red-500/20 p-4 bg-neutral-950/60 space-y-3">
            <h3 className="text-xs font-bold text-red-500 uppercase border-b border-red-500/10 pb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              FACTORY RESET PROCEDURES
            </h3>
            <p className="text-[10px] text-neutral-500 leading-normal">
              Purges all accumulated Dev XP, unlocked achievements, custom themes, and daily streak progress. Once executed, files are erased permanently from browser local storage.
            </p>
            <button
              onClick={() => {
                if (window.confirm("WARNING: Are you absolutely sure you want to reset your console level, stats, and achievements? This action cannot be undone.")) {
                  onResetStats();
                }
              }}
              className="w-full py-2 border-2 border-red-500 hover:bg-red-950/30 text-red-500 hover:text-red-400 font-bold text-xs cursor-pointer text-center"
            >
              PURGE LOCAL MAINFRAME MEMORY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
