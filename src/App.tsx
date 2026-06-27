import React, { useState, useEffect } from "react";
import { ToolType, ThemeConfig, UserProgress, DailyQuest, Achievement } from "./types";
import { RETRO_THEMES } from "./utils/themes";
import { INITIAL_ACHIEVEMENTS } from "./utils/gameData";
import {
  playClickSound,
  playSuccessSound,
  playErrorSound,
  playLevelUpSound,
  playAchievementSound,
} from "./utils/sound";

import TerminalHeader from "./components/TerminalHeader";
import ProgressSidebar from "./components/ProgressSidebar";
import Workspace from "./components/Workspace";
import AchievementsRoom from "./components/AchievementsRoom";
import ThemeSelector from "./components/ThemeSelector";
import { X, Award, Flame, Star, Volume2 } from "lucide-react";

// Default local storage keys
const STORAGE_PROGRESS_KEY = "json_toolbox_user_progress_v2";
const STORAGE_THEME_KEY = "json_toolbox_active_theme_v2";
const STORAGE_DAILY_QUEST_KEY = "json_toolbox_daily_quest_v2";

export default function App() {
  // Navigation & Tool State
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BEAUTIFY);
  const [currentTab, setCurrentTab] = useState<"workspace" | "achievements" | "settings">("workspace");

  // Custom theme configuration state
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    const savedThemeId = localStorage.getItem(STORAGE_THEME_KEY);
    if (savedThemeId) {
      const match = RETRO_THEMES.find(t => t.id === savedThemeId);
      if (match) return match;
    }
    return RETRO_THEMES[0];
  });

  // Gamification & Quest state
  const [progress, setProgress] = useState<UserProgress>(() => {
    const savedProgress = localStorage.getItem(STORAGE_PROGRESS_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress) as UserProgress;
        
        // Auto-fix achievements structures in case schema changes
        const syncedAchievements = INITIAL_ACHIEVEMENTS.map(initial => {
          const match = parsed.achievements?.find(saved => saved.id === initial.id);
          return match ? { ...initial, unlocked: match.unlocked, unlockedAt: match.unlockedAt } : initial;
        });

        const syncedStats = {
          beautifyCount: 0,
          compareCount: 0,
          validatorCount: 0,
          yamlCount: 0,
          tomlCount: 0,
          xmlCount: 0,
          csvCount: 0,
          jwtCount: 0,
          base64Count: 0,
          urlCount: 0,
          scheduleCount: 0,
          hashCount: 0,
          gamesPlayed: 0,
          regexSolved: 0,
          timestampCount: 0,
          ...(parsed.stats || {})
        };

        return {
          ...parsed,
          stats: syncedStats,
          achievements: syncedAchievements,
        };
      } catch (e) {
        console.error("Local storage progress corrupted, resetting.");
      }
    }

    return {
      level: 1,
      xp: 0,
      xpForNextLevel: 150,
      totalXp: 0,
      stats: {
        beautifyCount: 0,
        compareCount: 0,
        validatorCount: 0,
        yamlCount: 0,
        tomlCount: 0,
        xmlCount: 0,
        csvCount: 0,
        jwtCount: 0,
        base64Count: 0,
        urlCount: 0,
        scheduleCount: 0,
        hashCount: 0,
        gamesPlayed: 0,
        regexSolved: 0,
        timestampCount: 0,
      },
      achievements: INITIAL_ACHIEVEMENTS,
      streak: 1,
      lastActiveDate: new Date().toDateString(),
      dailyQuestCompleted: false,
      soundEnabled: true,
      crtEnabled: true,
    };
  });

  const [dailyQuest, setDailyQuest] = useState<DailyQuest>(() => {
    const savedQuest = localStorage.getItem(STORAGE_DAILY_QUEST_KEY);
    if (savedQuest) {
      try {
        return JSON.parse(savedQuest);
      } catch (e) {}
    }
    return {
      id: "compile_challenge",
      description: "Successfully process or compile 3 tool translations in your workstation.",
      targetCount: 3,
      currentCount: 0,
      xpReward: 100,
      completed: false,
    };
  });

  // Level Up and Achievement notification banners
  const [notifications, setNotifications] = useState<{ id: string; title: string; desc: string; type: "level" | "badge" }[]>([]);
  const [showLevelBanner, setShowLevelBanner] = useState<boolean>(false);
  const [newLevelTitle, setNewLevelTitle] = useState<string>("");

  // Sound Wrappers respecting user preference
  const playClick = () => {
    if (progress.soundEnabled) playClickSound();
  };
  const playSuccess = () => {
    if (progress.soundEnabled) playSuccessSound();
  };
  const playError = () => {
    if (progress.soundEnabled) playErrorSound();
  };
  const playLevelUp = () => {
    if (progress.soundEnabled) playLevelUpSound();
  };
  const playAchievement = () => {
    if (progress.soundEnabled) playAchievementSound();
  };

  // On Mount: Verify Active Daily Streaks
  useEffect(() => {
    calculateStreak(progress);
  }, []);

  // Save Progress whenever state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_DAILY_QUEST_KEY, JSON.stringify(dailyQuest));
  }, [dailyQuest]);

  const calculateStreak = (currProgress: UserProgress) => {
    const today = new Date().toDateString();
    const lastActive = currProgress.lastActiveDate;

    if (!lastActive) {
      setProgress(prev => ({ ...prev, streak: 1, lastActiveDate: today }));
      return;
    }

    if (lastActive === today) {
      // Already logged in today, keep streak
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActive === yesterday.toDateString()) {
      // Continuous daily streak increment!
      setProgress(prev => ({
        ...prev,
        streak: prev.streak + 1,
        lastActiveDate: today,
      }));
    } else {
      // Streak broken, reset to 1
      setProgress(prev => ({
        ...prev,
        streak: 1,
        lastActiveDate: today,
      }));
    }
  };

  // Gamification Engine: Add Experience (XP)
  const addXp = (amount: number, reason: string) => {
    setProgress(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let nextLevelXp = prev.xpForNextLevel;
      let didLevelUp = false;

      // Check if leveled up
      while (newXp >= nextLevelXp) {
        newXp -= nextLevelXp;
        newLevel += 1;
        nextLevelXp = newLevel * 150 + 100; // Exponential-ish leveling curve
        didLevelUp = true;
      }

      if (didLevelUp) {
        // Trigger Level Up
        setTimeout(() => {
          playLevelUp();
          setNewLevelTitle(getLevelTitle(newLevel));
          setShowLevelBanner(true);
          // Hide banner after 5 seconds
          setTimeout(() => setShowLevelBanner(false), 5000);
        }, 500);
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpForNextLevel: nextLevelXp,
        totalXp: prev.totalXp + amount,
      };
    });
  };

  // Unlock Badge Achievement
  const unlockAchievement = (id: string) => {
    setProgress(prev => {
      const match = prev.achievements.find(a => a.id === id);
      if (match && !match.unlocked) {
        // Play victory chime
        setTimeout(() => {
          playAchievement();
          const notifyId = Math.random().toString();
          setNotifications(old => [
            ...old,
            { id: notifyId, title: match.title, desc: match.description, type: "badge" },
          ]);
          // Auto remove notification banner after 6s
          setTimeout(() => {
            setNotifications(old => old.filter(n => n.id !== notifyId));
          }, 6000);
        }, 300);

        // Map unlocked fields
        const updatedAchievements = prev.achievements.map(a => {
          if (a.id === id) {
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });

        // Add XP reward instantly
        setTimeout(() => {
          addXp(match.xpReward, `Unlocked Badge: ${match.title}`);
        }, 100);

        return {
          ...prev,
          achievements: updatedAchievements,
        };
      }
      return prev;
    });
  };

  // Keyboard and Shortcuts Global Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent mapping interference while users are typing inside inputs
      const isTyping = ["textarea", "input"].includes((e.target as HTMLElement).tagName.toLowerCase());

      // Global navigation shortcuts
      if (e.altKey && !isTyping) {
        const key = e.key.toLowerCase();
        const code = e.code;
        let matchFound = true;

        if (key === "1" || code === "Digit1") setActiveTool(ToolType.BEAUTIFY);
        else if (key === "2" || code === "Digit2") setActiveTool(ToolType.COMPARE);
        else if (key === "3" || code === "Digit3") setActiveTool(ToolType.VALIDATOR);
        else if (key === "4" || code === "Digit4") setActiveTool(ToolType.YAML);
        else if (key === "5" || code === "Digit5") setActiveTool(ToolType.TOML);
        else if (key === "6" || code === "Digit6") setActiveTool(ToolType.XML);
        else if (key === "7" || code === "Digit7") setActiveTool(ToolType.CSV);
        else if (key === "8" || code === "Digit8") setActiveTool(ToolType.JWT);
        else if (key === "9" || code === "Digit9") setActiveTool(ToolType.BASE64);
        else if (key === "u" || code === "KeyU") setActiveTool(ToolType.URL_PARSER);
        else if (key === "k" || code === "KeyK") setActiveTool(ToolType.SCHEDULE_CALCULATOR);
        else if (key === "h" || code === "KeyH") setActiveTool(ToolType.HASH_GENERATOR);
        else if (key === "t" || code === "KeyT") setActiveTool(ToolType.TIMESTAMP);
        else if (key === "g" || code === "KeyG") setActiveTool(ToolType.TECH_GAMES);
        else if (key === "n" || code === "KeyN") setCurrentTab("workspace");
        else if (key === "a" || code === "KeyA") setCurrentTab("achievements");
        else if (key === "s" || code === "KeyS") setCurrentTab("settings");
        else matchFound = false;

        if (matchFound) {
          e.preventDefault();
          playClick();
          triggerShortcutAction();
        }
      }

      // Execute Compiler on Ctrl + Enter or Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        // Locate the compile compile button directly in workspace and trigger click
        const compileBtn = document.querySelector("#active-workstation button") as HTMLButtonElement;
        if (compileBtn) {
          compileBtn.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTool, progress.soundEnabled]);

  const triggerShortcutAction = () => {
    // Record keystroke compiles for quest
    if (!dailyQuest.completed) {
      setDailyQuest(prev => {
        const nextCount = prev.currentCount + 1;
        const isCompleted = nextCount >= prev.targetCount;
        if (isCompleted && !prev.completed) {
          // Claim daily quest award
          setTimeout(() => {
            playSuccess();
            addXp(prev.xpReward, "Daily challenge accomplished");
          }, 100);
        }
        return {
          ...prev,
          currentCount: Math.min(prev.targetCount, nextCount),
          completed: isCompleted,
        };
      });
    }

    // Trigger speed_demon badge on compiling 5 operations
    const stats = progress.stats;
    const totalRuns = stats.beautifyCount + stats.compareCount + stats.validatorCount + stats.yamlCount + stats.tomlCount + stats.xmlCount + stats.csvCount + stats.jwtCount + stats.base64Count + stats.urlCount + stats.scheduleCount + stats.hashCount + (stats.timestampCount || 0);
    if (totalRuns >= 5) {
      unlockAchievement("shortcut_guru");
    }
  };

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

  // Stat Counter helpers
  const incrementStat = (tool: ToolType) => {
    setProgress(prev => {
      const stats = { ...prev.stats };
      switch (tool) {
        case ToolType.BEAUTIFY: stats.beautifyCount++; break;
        case ToolType.COMPARE: stats.compareCount++; break;
        case ToolType.VALIDATOR: stats.validatorCount++; break;
        case ToolType.YAML: stats.yamlCount++; break;
        case ToolType.TOML: stats.tomlCount++; break;
        case ToolType.XML: stats.xmlCount++; break;
        case ToolType.CSV: stats.csvCount++; break;
        case ToolType.JWT: stats.jwtCount++; break;
        case ToolType.BASE64: stats.base64Count++; break;
        case ToolType.URL_PARSER: stats.urlCount++; break;
        case ToolType.SCHEDULE_CALCULATOR: stats.scheduleCount++; break;
        case ToolType.HASH_GENERATOR: stats.hashCount++; break;
        case ToolType.TIMESTAMP: stats.timestampCount = (stats.timestampCount || 0) + 1; break;
        case ToolType.TECH_GAMES: stats.gamesPlayed++; break;
      }
      return { ...prev, stats };
    });
  };

  const incrementRegexSolved = () => {
    setProgress(prev => {
      const stats = { ...prev.stats };
      stats.regexSolved = (stats.regexSolved || 0) + 1;
      return { ...prev, stats };
    });
  };

  // Buy Me a coffee award tracker
  const handleCoffeeClick = () => {
    playClick();
    unlockAchievement("coffee_supporter");
  };

  const handleToggleSound = () => {
    setProgress(prev => {
      const nextVal = !prev.soundEnabled;
      if (nextVal) playClickSound(); // beep when enabled
      return { ...prev, soundEnabled: nextVal };
    });
  };

  const handleToggleCrt = () => {
    playClick();
    setProgress(prev => ({ ...prev, crtEnabled: !prev.crtEnabled }));
  };

  // Factory reset
  const handleResetStats = () => {
    playClick();
    localStorage.removeItem(STORAGE_PROGRESS_KEY);
    localStorage.removeItem(STORAGE_DAILY_QUEST_KEY);
    localStorage.removeItem(STORAGE_THEME_KEY);
    
    setProgress({
      level: 1,
      xp: 0,
      xpForNextLevel: 150,
      totalXp: 0,
      stats: {
        beautifyCount: 0,
        compareCount: 0,
        validatorCount: 0,
        yamlCount: 0,
        tomlCount: 0,
        xmlCount: 0,
        csvCount: 0,
        jwtCount: 0,
        base64Count: 0,
        urlCount: 0,
        scheduleCount: 0,
        hashCount: 0,
        gamesPlayed: 0,
        regexSolved: 0,
        timestampCount: 0,
      },
      achievements: INITIAL_ACHIEVEMENTS,
      streak: 1,
      lastActiveDate: new Date().toDateString(),
      dailyQuestCompleted: false,
      soundEnabled: true,
      crtEnabled: true,
    });

    setDailyQuest({
      id: "compile_challenge",
      description: "Successfully process or compile 3 tool translations in your workstation.",
      targetCount: 3,
      currentCount: 0,
      xpReward: 100,
      completed: false,
    });

    setCurrentTheme(RETRO_THEMES[0]);
    setCurrentTab("workspace");
    playSuccess();
  };

  // Save customized theme configurations
  const handleSetTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    localStorage.setItem(STORAGE_THEME_KEY, theme.id);
    unlockAchievement("theme_custom");
  };

  return (
    <div
      className={`crt-container min-h-screen flex flex-col ${currentTheme.bgClass} overflow-hidden font-sans relative select-none`}
      style={{
        textShadow: `0 0 5px ${currentTheme.primaryColor}22`,
      }}
    >
      {/* Scanline simulation layer overlay */}
      <div className={`${progress.crtEnabled ? "crt-scanlines crt-flicker-active" : ""} flex flex-col flex-1 min-h-0`}>
        
        {/* Terminal top header panels */}
        <TerminalHeader
          progress={progress}
          theme={currentTheme}
          playClick={playClick}
          onToggleSound={handleToggleSound}
          onToggleCrt={handleToggleCrt}
          onCoffeeClick={handleCoffeeClick}
          onShowAchievements={() => setCurrentTab("achievements")}
          onShowSettings={() => setCurrentTab("settings")}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        {/* Dashboard Grid Workspace container */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          
          {/* Tool selector lists and quick metrics left sidebar panel */}
          <ProgressSidebar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            progress={progress}
            theme={currentTheme}
            playClick={playClick}
            dailyQuest={dailyQuest}
          />

          {/* Main workspace displays */}
          <main className="flex-1 flex flex-col min-h-0 bg-black/10 relative">
            
            {currentTab === "workspace" && (
              <Workspace
                activeTool={activeTool}
                theme={currentTheme}
                playClick={playClick}
                playSuccess={playSuccess}
                playError={playError}
                addXp={addXp}
                unlockAchievement={unlockAchievement}
                incrementStat={incrementStat}
                incrementRegexSolved={incrementRegexSolved}
                triggerShortcutAction={triggerShortcutAction}
              />
            )}

            {currentTab === "achievements" && (
              <AchievementsRoom
                progress={progress}
                theme={currentTheme}
                playClick={playClick}
              />
            )}

            {currentTab === "settings" && (
              <ThemeSelector
                currentTheme={currentTheme}
                setTheme={handleSetTheme}
                progress={progress}
                playClick={playClick}
                onToggleSound={handleToggleSound}
                onToggleCrt={handleToggleCrt}
                onResetStats={handleResetStats}
              />
            )}
          </main>
        </div>
      </div>

      {/* Floating Level Up Banner Toast overlay */}
      {showLevelBanner && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-[99999] p-4 animate-fade-in font-mono border-4 border-yellow-500 m-8 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-yellow-500 text-black font-black text-2xl tracking-widest animate-bounce">
              ▲ MAINFRAME UPGRADE ▲
            </div>
            <h1 className="text-3xl font-black text-yellow-400 select-all font-pixel">
              LEVEL {progress.level} REACHED
            </h1>
            <p className="text-green-400 text-sm tracking-widest uppercase">
              NEW CLASS UNLOCKED: <span className="text-white font-bold">{newLevelTitle}</span>
            </p>
            <div className="text-xs text-neutral-500 pt-4">
              Buffer thresholds expanded. Synthesizer clock synchronized.
            </div>
            <button
              onClick={() => {
                playClick();
                setShowLevelBanner(false);
              }}
              className="px-6 py-2 border-2 border-yellow-500 text-yellow-400 font-bold hover:bg-yellow-500 hover:text-black cursor-pointer transition-colors"
            >
              INITIALIZE NEXT LAYER [OK]
            </button>
          </div>
        </div>
      )}

      {/* Floating Badge notification slide-ins */}
      <div className="absolute bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-auto">
        {notifications.map((note) => (
          <div
            key={note.id}
            className="w-80 bg-neutral-950 border-2 border-yellow-500 p-3 shadow-2xl flex items-start gap-3 animate-slide-in relative text-yellow-400"
          >
            <div className="w-10 h-10 border border-yellow-500 flex items-center justify-center bg-yellow-950/40 text-xl flex-shrink-0 animate-pulse">
              🏆
            </div>
            <div className="flex-1 min-w-0 font-mono text-xs">
              <div className="font-bold text-white text-[11px] uppercase flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                ACHIEVEMENT LOCKED
              </div>
              <h4 className="font-black text-xs text-yellow-400 truncate mt-0.5">{note.title}</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5 leading-normal">{note.desc}</p>
            </div>
            <button
              onClick={() => {
                playClick();
                setNotifications(old => old.filter(n => n.id !== note.id));
              }}
              className="text-neutral-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
