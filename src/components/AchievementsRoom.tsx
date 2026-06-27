import React from "react";
import { UserProgress, ThemeConfig, Achievement } from "../types";
import { Trophy, ShieldCheck, Lock, Award, ServerCrash, Cpu } from "lucide-react";

interface AchievementsRoomProps {
  progress: UserProgress;
  theme: ThemeConfig;
  playClick: () => void;
}

export default function AchievementsRoom({
  progress,
  theme,
  playClick,
}: AchievementsRoomProps) {

  const unlockedCount = progress.achievements.filter(a => a.unlocked).length;
  const totalCount = progress.achievements.length;
  const unlockPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Custom XP progress rendering as retro [████░░░░] block
  const renderBigXpBar = () => {
    const totalBlocks = 20;
    const filledBlocks = Math.round((progress.xp / progress.xpForNextLevel) * totalBlocks);
    const blocksStr = "█".repeat(Math.max(0, Math.min(totalBlocks, filledBlocks))) +
                      "░".repeat(Math.max(0, totalBlocks - Math.max(0, Math.min(totalBlocks, filledBlocks))));
    return blocksStr;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-black/40 font-mono text-green-500 space-y-6" id="achievements-room-view">
      {/* Achievements Card Banner */}
      <div className="border-2 border-green-500 p-4 bg-black/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-400 fill-current" />
            <h2 className="text-lg font-bold text-white tracking-wider">DEVELOPER ACHIEVEMENTS HALL</h2>
          </div>
          <p className="text-xs text-neutral-400 leading-normal max-w-xl">
            Complete debugging quests and successfully run toolbox compilers to earn Experience Points (XP) and unlock elite developer badges. All achievements are processed purely offline on this sandbox machine.
          </p>
        </div>

        <div className="text-right flex flex-col items-end gap-1.5 bg-neutral-950 p-3 border border-green-500/20">
          <span className="text-xs text-neutral-400">TOTAL BADGES UNLOCKED:</span>
          <span className="text-2xl font-black text-yellow-400">{unlockedCount} / {totalCount}</span>
          <span className="text-[10px] text-green-400/60 font-bold">[{unlockPercent}% ARCHIVE RESOLVED]</span>
        </div>
      </div>

      {/* Stats and Level Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Profile Progress */}
        <div className="lg:col-span-2 border border-green-500/30 p-4 bg-neutral-950/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/10">
              <Cpu className="w-4 h-4 text-green-500" />
              <span className="font-bold text-white uppercase text-xs">WORKSTATION METRIC STATISTICS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-black/50 p-2.5 border border-green-500/10 text-center">
                <div className="text-[10px] text-neutral-400">LEVEL</div>
                <div className="text-xl font-bold text-white">{progress.level}</div>
              </div>
              <div className="bg-black/50 p-2.5 border border-green-500/10 text-center">
                <div className="text-[10px] text-neutral-400">TOTAL EXPERIENCE</div>
                <div className="text-xl font-bold text-green-400">{progress.totalXp} XP</div>
              </div>
              <div className="bg-black/50 p-2.5 border border-green-500/10 text-center">
                <div className="text-[10px] text-neutral-400">ACTIVE STREAK</div>
                <div className="text-xl font-bold text-amber-400">{progress.streak} DAYS</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>XP PROGRESSION TO LEVEL {progress.level + 1}</span>
                <span className="text-green-400 font-bold">{progress.xp} / {progress.xpForNextLevel} XP</span>
              </div>
              <div className="bg-neutral-900 border border-green-500/30 p-2 rounded-xs text-center text-xs select-none tracking-widest text-green-400">
                [{renderBigXpBar()}]
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-green-500/10 text-[11px] text-neutral-400 space-y-1">
            <div className="text-white font-bold mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              LOCAL TELEMETRY FEED (OPERATION TOTALS):
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Beautifiers: <span className="text-green-400 font-bold">{progress.stats.beautifyCount}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Comparisons: <span className="text-green-400 font-bold">{progress.stats.compareCount}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Validators: <span className="text-green-400 font-bold">{progress.stats.validatorCount}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                YAML / TOML: <span className="text-green-400 font-bold">{progress.stats.yamlCount + progress.stats.tomlCount}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                XML Parser: <span className="text-green-400 font-bold">{progress.stats.xmlCount}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                CSV parser: <span className="text-green-400 font-bold">{progress.stats.csvCount}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                JWT decoded: <span className="text-green-400 font-bold">{progress.stats.jwtCount}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Base64 coder: <span className="text-green-400 font-bold">{progress.stats.base64Count}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                URL Parser: <span className="text-green-400 font-bold">{progress.stats.urlCount || 0}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Schedule Calc: <span className="text-green-400 font-bold">{progress.stats.scheduleCount || 0}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Hash Generator: <span className="text-green-400 font-bold">{progress.stats.hashCount || 0}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Epoch Converter: <span className="text-green-400 font-bold">{progress.stats.timestampCount || 0}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Games Played: <span className="text-green-400 font-bold">{progress.stats.gamesPlayed || 0}</span>
              </div>
              <div className="bg-black/30 p-1.5 border border-green-500/5">
                Regex Solved: <span className="text-green-400 font-bold">{progress.stats.regexSolved || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Tiers Reference */}
        <div className="border border-green-500/30 p-4 bg-neutral-950/80">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/10">
            <Award className="w-4 h-4 text-green-500" />
            <span className="font-bold text-white uppercase text-xs">DEVELOPER LEVEL TIERS</span>
          </div>
          <div className="space-y-1.5 font-mono text-[10px] leading-relaxed">
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level >= 10 ? "bg-yellow-950/40 text-yellow-400 border-yellow-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 10: Root Admin</span>
              <span>10,000+ XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 9 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 9: Cyber Wizard</span>
              <span>5,000 XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 8 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 8: Compiler Conqueror</span>
              <span>3,200 XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 7 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 7: Kernel Commander</span>
              <span>2,000 XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 6 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 6: Assembly Adept</span>
              <span>1,200 XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 5 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 5: Terminal Tactician</span>
              <span>800 XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 4 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 4: Buffer Baron</span>
              <span>500 XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 3 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 3: Syntax Soldier</span>
              <span>300 XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 2 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 2: Code Cadet</span>
              <span>150 XP</span>
            </div>
            <div className={`flex items-center justify-between p-1 px-2 border ${progress.level === 1 ? "bg-green-950/40 text-green-400 border-green-500/30 font-bold" : "border-transparent text-neutral-400"}`}>
              <span>LVL 1: Script Kiddie</span>
              <span>0 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {progress.achievements.map((badge) => (
          <div
            key={badge.id}
            className={`p-3 border flex items-start gap-3 transition-all ${
              badge.unlocked
                ? "border-green-500/60 bg-green-950/10 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.1)]"
                : "border-neutral-800 bg-black/40 text-neutral-500 opacity-65"
            }`}
          >
            {/* Badge Icon */}
            <div className={`w-12 h-12 flex-shrink-0 border flex items-center justify-center text-xl select-none ${badge.unlocked ? "border-green-500 bg-green-950/40 text-white" : "border-neutral-800 bg-neutral-900"}`}>
              {badge.unlocked ? badge.icon : <Lock className="w-5 h-5 text-neutral-600" />}
            </div>

            {/* Content info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5 gap-2">
                <h3 className={`font-bold text-xs truncate ${badge.unlocked ? "text-white" : "text-neutral-500"}`}>
                  {badge.title}
                </h3>
                {badge.unlocked ? (
                  <span className="text-[9px] bg-green-900/40 text-green-400 px-1 border border-green-500/20 font-bold whitespace-nowrap">
                    +{badge.xpReward} XP
                  </span>
                ) : (
                  <span className="text-[9px] bg-neutral-950 text-neutral-600 px-1 border border-neutral-800 font-bold whitespace-nowrap">
                    LOCKED
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 leading-normal mb-1">{badge.description}</p>
              
              {badge.unlocked && badge.unlockedAt && (
                <div className="text-[8px] text-neutral-500 font-mono italic">
                  UNLOCKED: {new Date(badge.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
