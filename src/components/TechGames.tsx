import React, { useState, useEffect, useRef } from "react";
import { ThemeConfig, ToolType } from "../types";
import { Gamepad2, Trophy, Timer, Check, X, Flame, RotateCcw, Sparkles, Cpu, Code, ArrowRight } from "lucide-react";

interface TechGamesProps {
  theme: ThemeConfig;
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  unlockAchievement: (id: string) => void;
  addXp: (amount: number, reason: string) => void;
  setStatusMsg: (msg: { type: "info" | "success" | "error"; text: string } | null) => void;
  incrementStat?: (tool: ToolType) => void;
  incrementRegexSolved?: () => void;
}

interface RegexLevel {
  instructions: string;
  matches: string[];
  nonMatches: string[];
  placeholder: string;
  validator: (regexStr: string) => boolean;
}

export default function TechGames({
  theme,
  playClick,
  playSuccess,
  playError,
  unlockAchievement,
  addXp,
  setStatusMsg,
  incrementStat,
  incrementRegexSolved,
}: TechGamesProps) {
  const [activeGame, setActiveGame] = useState<"lobby" | "binary" | "regex">("lobby");

  // ==========================================
  // GAME 1: BYTE BLASTER STATE & LOGIC
  // ==========================================
  const [binaryScore, setBinaryScore] = useState(0);
  const [targetDecimal, setTargetDecimal] = useState(0);
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [binaryTimer, setBinaryTimer] = useState(40);
  const [binaryStatus, setBinaryStatus] = useState<"playing" | "won" | "lost">("playing");
  const binaryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const bitValues = [128, 64, 32, 16, 8, 4, 2, 1];

  // Start binary game or level
  const generateNewBinaryTarget = (currentScore: number) => {
    // Generate random target decimal
    const rand = Math.floor(Math.random() * 254) + 1;
    setTargetDecimal(rand);
    setBits([0, 0, 0, 0, 0, 0, 0, 0]);
    setBinaryStatus("playing");
  };

  const startBinaryGame = () => {
    playClick();
    if (incrementStat) {
      incrementStat(ToolType.TECH_GAMES);
    }
    setBinaryScore(0);
    setBinaryTimer(40);
    generateNewBinaryTarget(0);
    setActiveGame("binary");

    if (binaryTimerRef.current) clearInterval(binaryTimerRef.current);
    binaryTimerRef.current = setInterval(() => {
      setBinaryTimer((prev) => {
        if (prev <= 1) {
          if (binaryTimerRef.current) clearInterval(binaryTimerRef.current);
          setBinaryStatus("lost");
          playError();
          setStatusMsg({ type: "error", text: "TIME EXPIRED: Terminal buffer overflowed." });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleBit = (index: number) => {
    if (binaryStatus !== "playing") return;
    playClick();
    const newBits = [...bits];
    newBits[index] = newBits[index] === 1 ? 0 : 1;
    setBits(newBits);

    // Calculate sum
    const sum = newBits.reduce((acc, bit, idx) => acc + bit * bitValues[idx], 0);
    if (sum === targetDecimal) {
      // Correct Match!
      const nextScore = binaryScore + 1;
      setBinaryScore(nextScore);
      playSuccess();

      if (nextScore >= 5) {
        // Game fully won!
        setBinaryStatus("won");
        if (binaryTimerRef.current) clearInterval(binaryTimerRef.current);
        unlockAchievement("binary_boss");
        addXp(150, "Byte Blaster speedrun win");
        setStatusMsg({ type: "success", text: "SUCCESS: 8-bit architecture speedrun complete. Level Up!" });
      } else {
        // Next level
        setStatusMsg({ type: "success", text: `TARGET ALIGNED: ${targetDecimal} verified. Loading next frame...` });
        generateNewBinaryTarget(nextScore);
      }
    }
  };

  // Calculate current sum
  const currentBinarySum = bits.reduce((acc, bit, idx) => acc + bit * bitValues[idx], 0);

  // ==========================================
  // GAME 2: REGEX SPEEDRUN STATE & LOGIC
  // ==========================================
  const [regexLevelIdx, setRegexLevelIdx] = useState(0);
  const [regexInput, setRegexInput] = useState("");
  const [regexGameStatus, setRegexGameStatus] = useState<"playing" | "complete">("playing");

  const regexLevels: RegexLevel[] = [
    {
      instructions: "Match logs files ending with '.log'. Do not match HTML, JSON or general TXT formats.",
      matches: ["system.log", "kernel.log", "auth.log"],
      nonMatches: ["index.html", "package.json", "logs.txt"],
      placeholder: "e.g., \\.log$",
      validator: (pattern: string) => {
        try {
          const rx = new RegExp(pattern);
          return (
            rx.test("system.log") &&
            rx.test("kernel.log") &&
            rx.test("auth.log") &&
            !rx.test("index.html") &&
            !rx.test("package.json") &&
            !rx.test("logs.txt")
          );
        } catch {
          return false;
        }
      },
    },
    {
      instructions: "Match active container ports. These must be exactly 4-digit numbers, with no other text around them.",
      matches: ["3000", "8080", "4430"],
      nonMatches: ["80", "port-3000", "80808", "abc"],
      placeholder: "e.g., ^\\d{4}$",
      validator: (pattern: string) => {
        try {
          const rx = new RegExp(pattern);
          return (
            rx.test("3000") &&
            rx.test("8080") &&
            rx.test("4430") &&
            !rx.test("80") &&
            !rx.test("port-3000") &&
            !rx.test("80808") &&
            !rx.test("abc")
          );
        } catch {
          return false;
        }
      },
    },
    {
      instructions: "Match node IDs starting with 'CRT-' followed by exactly 3 alphanumeric characters (numbers or letters). Case-sensitive.",
      matches: ["CRT-A12", "CRT-X99", "CRT-H01"],
      nonMatches: ["CRT-12", "crt-abc", "CRT-ABCD", "MAIN-ABC"],
      placeholder: "e.g., ^CRT-[A-Za-z0-9]{3}$",
      validator: (pattern: string) => {
        try {
          const rx = new RegExp(pattern);
          return (
            rx.test("CRT-A12") &&
            rx.test("CRT-X99") &&
            rx.test("CRT-H01") &&
            !rx.test("CRT-12") &&
            !rx.test("crt-abc") &&
            !rx.test("CRT-ABCD") &&
            !rx.test("MAIN-ABC")
          );
        } catch {
          return false;
        }
      },
    },
    {
      instructions: "Secure target: Match hexadecimal MD5 signatures (exactly 32 characters, using lowercase letters a-f or numbers 0-9).",
      matches: ["098f6bcd4621d373cade4e832627b4f6", "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"],
      nonMatches: ["098f6bcd4621d373cade4e832627b4fG", "12345", "098f6bcd4621d373cade4e832627b4f6a"],
      placeholder: "e.g., ^[a-f0-9]{32}$",
      validator: (pattern: string) => {
        try {
          const rx = new RegExp(pattern);
          return (
            rx.test("098f6bcd4621d373cade4e832627b4f6") &&
            rx.test("1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d") &&
            !rx.test("098f6bcd4621d373cade4e832627b4fG") &&
            !rx.test("12345") &&
            !rx.test("098f6bcd4621d373cade4e832627b4f6a")
          );
        } catch {
          return false;
        }
      },
    },
  ];

  const currentLevel = regexLevels[regexLevelIdx];

  // Live checker variables
  let isValidRegex = false;
  let testMatches: boolean[] = [];
  let testNonMatches: boolean[] = [];

  if (activeGame === "regex") {
    try {
      const rx = new RegExp(regexInput);
      isValidRegex = true;
      testMatches = currentLevel.matches.map((str) => rx.test(str));
      testNonMatches = currentLevel.nonMatches.map((str) => rx.test(str));
    } catch {
      isValidRegex = false;
      testMatches = currentLevel.matches.map(() => false);
      testNonMatches = currentLevel.nonMatches.map(() => false);
    }
  }

  // Handle Regex validation
  const checkRegexLevelSuccess = () => {
    if (currentLevel.validator(regexInput)) {
      playSuccess();
      if (incrementRegexSolved) {
        incrementRegexSolved();
      }
      const nextLevel = regexLevelIdx + 1;
      if (nextLevel >= regexLevels.length) {
        setRegexGameStatus("complete");
        unlockAchievement("regex_wizard");
        addXp(180, "Regex speedrun game complete");
        setStatusMsg({ type: "success", text: "SYSTEM RESTORED: All Regex speedrun frames aligned!" });
      } else {
        setRegexLevelIdx(nextLevel);
        setRegexInput("");
        setStatusMsg({ type: "success", text: `FRAME ALIGNED: Parsing Level ${nextLevel + 1}` });
      }
    } else {
      playError();
      setStatusMsg({ type: "error", text: "COMPILATION ERROR: Expression fails to encompass all constraints." });
    }
  };

  const startRegexGame = () => {
    playClick();
    if (incrementStat) {
      incrementStat(ToolType.TECH_GAMES);
    }
    setRegexLevelIdx(0);
    setRegexInput("");
    setRegexGameStatus("playing");
    setActiveGame("regex");
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (binaryTimerRef.current) clearInterval(binaryTimerRef.current);
    };
  }, []);

  return (
    <div className="flex-1 p-6 flex flex-col justify-between font-mono animate-fade-in relative min-h-[500px]">
      
      {/* Glitchy CRT scanline overhead */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03),transparent)] z-10" />

      {/* LOBBY VIEW */}
      {activeGame === "lobby" && (
        <div className="max-w-2xl mx-auto w-full my-auto text-center space-y-8 py-8">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 mb-2">
              <Gamepad2 className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-widest text-white">
              RETRO ARCADE CONSOLE.EXE
            </h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Synthesize 8-bit registers or build regular expressions in speedrun puzzles to earn XP, trigger double multipliers, and calibrate your dev standing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* GAME 1: BYTE BLASTER SELECTION */}
            <div 
              className="border-2 p-5 bg-[#111111]/90 flex flex-col justify-between text-left space-y-4 hover:scale-[1.01] transition-transform"
              style={{ borderColor: `${theme.primaryColor}22` }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> HARDWARE SIMULATOR
                  </span>
                  <span className="text-[9px] text-zinc-500 font-bold bg-neutral-950 px-1.5 py-0.5 border border-zinc-800">
                    SPEEDRUN
                  </span>
                </div>
                <h3 className="text-sm font-bold text-neutral-200">BYTE BLASTER</h3>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Toggle bits (128, 64, 32...) to compute the random decimal before terminal buffer overflow. Solve 5 targets to win.
                </p>
              </div>
              <button
                onClick={startBinaryGame}
                className="w-full py-2 bg-neutral-900 hover:bg-emerald-950/60 border text-xs font-bold text-center transition-colors cursor-pointer text-white"
                style={{ borderColor: theme.primaryColor }}
              >
                BOOT BYTE_BLASTER.BIN
              </button>
            </div>

            {/* GAME 2: REGEX SPEEDRUN SELECTION */}
            <div 
              className="border-2 p-5 bg-[#111111]/90 flex flex-col justify-between text-left space-y-4 hover:scale-[1.01] transition-transform"
              style={{ borderColor: `${theme.primaryColor}22` }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
                    <Code className="w-3.5 h-3.5" /> SYNTAX SPEEDRUN
                  </span>
                  <span className="text-[9px] text-zinc-500 font-bold bg-neutral-950 px-1.5 py-0.5 border border-zinc-800">
                    PUZZLES
                  </span>
                </div>
                <h3 className="text-sm font-bold text-neutral-200">REGEX SPEEDRUN</h3>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Type regular expressions to match specific text inputs and filter noise. Match all conditions to level up.
                </p>
              </div>
              <button
                onClick={startRegexGame}
                className="w-full py-2 bg-neutral-900 hover:bg-emerald-950/60 border text-xs font-bold text-center transition-colors cursor-pointer text-white"
                style={{ borderColor: theme.primaryColor }}
              >
                BOOT REGEX_RUNNER.SYS
              </button>
            </div>

          </div>

          <div className="pt-2 border-t border-dashed border-zinc-800 flex justify-center gap-6 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> Byte Blaster: +150 XP</span>
            <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> Regex Wizard: +180 XP</span>
          </div>
        </div>
      )}

      {/* GAME 1: BYTE BLASTER INTERFACE */}
      {activeGame === "binary" && (
        <div className="max-w-xl mx-auto w-full my-auto space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-zinc-800">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 animate-pulse" /> BYTE_BLASTER.EXE (FRAME ACTIVE)
              </span>
              <h3 className="text-sm font-bold text-white">8-BIT REGISTER SYNTHESIS</h3>
            </div>
            <button
              onClick={() => { playClick(); setActiveGame("lobby"); if (binaryTimerRef.current) clearInterval(binaryTimerRef.current); }}
              className="px-2 py-1 border text-[10px] text-zinc-400 hover:text-white border-zinc-700 hover:bg-neutral-950 cursor-pointer"
            >
              QUIT_CONSOLE
            </button>
          </div>

          {/* Target Box */}
          <div className="grid grid-cols-3 gap-3 bg-neutral-950/60 border p-4" style={{ borderColor: `${theme.primaryColor}22` }}>
            <div className="text-center space-y-1 border-r border-zinc-800/60">
              <div className="text-[9px] text-zinc-500 uppercase font-bold">TARGET DECIMAL</div>
              <div className="text-2xl font-black text-white">{targetDecimal}</div>
            </div>
            <div className="text-center space-y-1 border-r border-zinc-800/60">
              <div className="text-[9px] text-zinc-500 uppercase font-bold">CURRENT DECIMAL</div>
              <div className="text-2xl font-black text-yellow-400">{currentBinarySum}</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-[9px] text-zinc-500 uppercase font-bold">SCORE FRAME</div>
              <div className="text-lg font-bold text-white flex items-center justify-center gap-1 mt-1">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span>{binaryScore}/5</span>
              </div>
            </div>
          </div>

          {binaryStatus === "playing" && (
            <div className="space-y-6">
              {/* Bit Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {bits.map((bit, idx) => {
                  const val = bitValues[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleBit(idx)}
                      className="flex flex-col items-center justify-between p-3 border-2 transition-all cursor-pointer relative select-none"
                      style={{
                        backgroundColor: bit === 1 ? `${theme.primaryColor}15` : "transparent",
                        borderColor: bit === 1 ? theme.primaryColor : `${theme.primaryColor}33`
                      }}
                    >
                      <span className="text-[9px] text-zinc-500 font-bold">{val}</span>
                      <span className="text-lg font-black my-2" style={{ color: bit === 1 ? theme.primaryColor : "#555" }}>
                        {bit}
                      </span>
                      <span className="text-[8px] text-zinc-600 font-bold uppercase">bit {7 - idx}</span>
                    </button>
                  );
                })}
              </div>

              {/* Status & Timer Footer */}
              <div className="flex items-center justify-between bg-black/40 p-3 border border-white/5 text-[11px]">
                <div className="flex items-center gap-2">
                  <Timer className={`w-4 h-4 ${binaryTimer <= 10 ? "text-rose-500 animate-pulse" : "text-emerald-400"}`} />
                  <span className="text-zinc-400">BUFFER DURATION:</span>
                  <span className={`font-bold ${binaryTimer <= 10 ? "text-rose-500" : "text-white"}`}>
                    {binaryTimer}s
                  </span>
                </div>
                <div className="text-zinc-500 text-[10px]">
                  *Click values to synthesize target: <span className="text-neutral-300 font-mono">{bits.join("")}</span>
                </div>
              </div>
            </div>
          )}

          {binaryStatus === "won" && (
            <div className="text-center p-8 bg-emerald-950/20 border border-emerald-500/30 space-y-4">
              <Sparkles className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-md font-bold text-emerald-400">SPEEDRUN MASTER ALIGNED!</h4>
                <p className="text-xs text-neutral-400">You completed 5/5 targets and unlocked the Binary Boss achievement.</p>
              </div>
              <div className="inline-block px-3 py-1 bg-emerald-900/40 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                +150 XP RECORDED
              </div>
              <div className="pt-2">
                <button
                  onClick={startBinaryGame}
                  className="px-4 py-2 bg-[#111111] border border-emerald-500 hover:bg-emerald-950/40 text-xs text-white font-bold cursor-pointer"
                >
                  PLAY AGAIN
                </button>
              </div>
            </div>
          )}

          {binaryStatus === "lost" && (
            <div className="text-center p-8 bg-rose-950/20 border border-rose-500/30 space-y-4">
              <RotateCcw className="w-8 h-8 text-rose-500 mx-auto animate-spin" />
              <div className="space-y-1">
                <h4 className="text-md font-bold text-rose-400">TERMINAL BUFFER OVERFLOW!</h4>
                <p className="text-xs text-neutral-400">Your instruction cycle was too slow. Keep the processor from overheating!</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={startBinaryGame}
                  className="px-4 py-2 bg-neutral-900 border border-rose-500 hover:bg-rose-950/30 text-xs text-white font-bold cursor-pointer"
                >
                  RE-COMPILE SIMULATION
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: REGEX SPEEDRUN INTERFACE */}
      {activeGame === "regex" && (
        <div className="max-w-2xl mx-auto w-full my-auto space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-zinc-800">
            <div className="space-y-1">
              <span className="text-[10px] text-purple-400 font-bold tracking-widest flex items-center gap-1">
                <Code className="w-3.5 h-3.5" /> REGEX_RUNNER.SYS (FRAME ACTIVE)
              </span>
              <h3 className="text-sm font-bold text-white">SPEEDRUN PATTERN SYNTAX</h3>
            </div>
            <button
              onClick={() => { playClick(); setActiveGame("lobby"); }}
              className="px-2 py-1 border text-[10px] text-zinc-400 hover:text-white border-zinc-700 hover:bg-neutral-950 cursor-pointer"
            >
              QUIT_CONSOLE
            </button>
          </div>

          {regexGameStatus === "playing" ? (
            <div className="space-y-5">
              
              {/* Level progress info bar */}
              <div className="flex items-center justify-between text-xs bg-neutral-950/60 p-3 border" style={{ borderColor: `${theme.primaryColor}22` }}>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold font-mono">FRAME {regexLevelIdx + 1}/{regexLevels.length}:</span>
                  <span className="text-zinc-300 font-bold">LIVE PARSER CHECK</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  All target checks must pass green
                </div>
              </div>

              {/* Instructions Box */}
              <div className="p-3.5 bg-[#111111]/90 border text-neutral-300 text-xs space-y-1 leading-relaxed" style={{ borderColor: `${theme.primaryColor}15` }}>
                <span className="font-bold text-[10px] text-zinc-500 block uppercase">INSTRUCTION PACKET:</span>
                <div>{currentLevel.instructions}</div>
              </div>

              {/* Target check block split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* MUST MATCH targets */}
                <div className="border p-3.5 space-y-2 bg-emerald-950/10" style={{ borderColor: "rgba(16,185,129,0.15)" }}>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">✓ SPEC_REQUIREMENT (MUST MATCH)</span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {currentLevel.matches.map((str, idx) => {
                      const doesMatch = testMatches[idx] || false;
                      return (
                        <div key={idx} className="flex items-center justify-between p-1 bg-black/30 px-2 rounded-xs border border-white/5">
                          <span className="text-neutral-300">{str}</span>
                          <span className="flex items-center">
                            {doesMatch ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-zinc-600" />
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MUST NOT MATCH targets */}
                <div className="border p-3.5 space-y-2 bg-rose-950/10" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">✗ NOISE_FILTER (MUST NOT MATCH)</span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {currentLevel.nonMatches.map((str, idx) => {
                      // It passes verification if rx does NOT test positive
                      const doesMatch = testNonMatches[idx] || false;
                      return (
                        <div key={idx} className="flex items-center justify-between p-1 bg-black/30 px-2 rounded-xs border border-white/5">
                          <span className="text-neutral-300">{str}</span>
                          <span className="flex items-center">
                            {!doesMatch ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-rose-400" />
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Pattern Input Box */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 block font-bold">EXPRESSION PATTERN:</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs select-none">/</span>
                    <input
                      type="text"
                      value={regexInput}
                      onChange={(e) => setRegexInput(e.target.value)}
                      placeholder={currentLevel.placeholder}
                      className="border w-full py-2 pl-5 pr-5 font-mono text-xs focus:outline-none focus:border-purple-500 text-neutral-200"
                      style={{ backgroundColor: "#0a0b0a", borderColor: `${theme.primaryColor}22` }}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs select-none">/</span>
                  </div>
                  <button
                    onClick={checkRegexLevelSuccess}
                    className="px-4 py-2 text-xs font-bold text-white hover:opacity-90 flex items-center gap-1 cursor-pointer transition-colors"
                    style={{ backgroundColor: theme.primaryColor, color: "#000" }}
                  >
                    <span>VERIFY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {!isValidRegex && regexInput.length > 0 && (
                  <div className="text-[10px] text-rose-400 font-bold">
                    ⚠️ Syntactic alert: Invalid regular expression pattern.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center p-8 bg-emerald-950/20 border border-emerald-500/30 space-y-4">
              <Sparkles className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-md font-bold text-emerald-400 font-mono">REGEX SPEEDRUN FRAME RESTORED</h4>
                <p className="text-xs text-neutral-400">You successfully mapped all regex filters and unlocked the Regex Wizard achievement.</p>
              </div>
              <div className="inline-block px-3 py-1 bg-emerald-900/40 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                +180 XP INSTALLED
              </div>
              <div className="pt-2">
                <button
                  onClick={startRegexGame}
                  className="px-4 py-2 bg-[#111111] border border-emerald-500 hover:bg-emerald-950/40 text-xs text-white font-bold cursor-pointer"
                >
                  REBOOT FRAME SEQUENCE
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
