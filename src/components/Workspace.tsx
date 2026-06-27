import React, { useState, useEffect } from "react";
import { ToolType, ThemeConfig } from "../types";
import { TOOL_SAMPLES } from "../utils/gameData";
import {
  beautifyJson,
  minifyJson,
  diffTexts,
  yamlToJson,
  jsonToYaml,
  tomlToJson,
  jsonToToml,
  xmlToJson,
  jsonToXml,
  csvToJson,
  jsonToCsv,
  decodeJwt,
  base64Decode,
  base64Encode,
  parseUrl,
  buildUrl,
  ParsedUrl,
} from "../utils/converters";
import { parseCronExpression, calculateDateDifference, CronResult, DateDiffResult } from "../utils/scheduleCalc";
import { sha256, md5, sha1 } from "../utils/crypto";
import { Copy, Trash2, ArrowLeftRight, FileText, CheckCircle, AlertTriangle, Play, HelpCircle, Plus } from "lucide-react";
import TechGames from "./TechGames";

function parseTimestampInput(val: string): {
  epochSeconds: number;
  epochMs: number;
  utcStr: string;
  localStr: string;
  isoStr: string;
  relativeStr: string;
} {
  const trimmed = val.trim();
  let dateObj: Date;

  if (/^-?\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (trimmed.length >= 13) {
      dateObj = new Date(num);
    } else {
      dateObj = new Date(num * 1000);
    }
  } else {
    dateObj = new Date(trimmed);
  }

  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid format: Must be standard Unix Epoch seconds/milliseconds or an ISO-8601 / RFC-2822 date string.");
  }

  const epochMs = dateObj.getTime();
  const epochSeconds = Math.floor(epochMs / 1000);
  const utcStr = dateObj.toUTCString();
  const localStr = dateObj.toString();
  const isoStr = dateObj.toISOString();

  const diffMs = epochMs - Date.now();
  const diffSec = Math.floor(diffMs / 1000);
  let relativeStr = "";
  if (Math.abs(diffSec) < 60) {
    relativeStr = diffSec >= 0 ? "just now / soon" : "just now / seconds ago";
  } else {
    const diffMin = Math.floor(diffSec / 60);
    if (Math.abs(diffMin) < 60) {
      relativeStr = diffMin >= 0 ? `in ${diffMin} minute${diffMin > 1 ? "s" : ""}` : `${Math.abs(diffMin)} minute${Math.abs(diffMin) > 1 ? "s" : ""} ago`;
    } else {
      const diffHr = Math.floor(diffMin / 60);
      if (Math.abs(diffHr) < 24) {
        relativeStr = diffHr >= 0 ? `in ${diffHr} hour${diffHr > 1 ? "s" : ""}` : `${Math.abs(diffHr)} hour${Math.abs(diffHr) > 1 ? "s" : ""} ago`;
      } else {
        const diffDay = Math.floor(diffHr / 24);
        relativeStr = diffDay >= 0 ? `in ${diffDay} day${diffDay > 1 ? "s" : ""}` : `${Math.abs(diffDay)} day${Math.abs(diffDay) > 1 ? "s" : ""} ago`;
      }
    }
  }

  return {
    epochSeconds,
    epochMs,
    utcStr,
    localStr,
    isoStr,
    relativeStr,
  };
}

interface WorkspaceProps {
  activeTool: ToolType;
  theme: ThemeConfig;
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
  addXp: (amount: number, reason: string) => void;
  unlockAchievement: (id: string) => void;
  incrementStat: (tool: ToolType) => void;
  incrementRegexSolved: () => void;
  triggerShortcutAction: () => void;
}

export default function Workspace({
  activeTool,
  theme,
  playClick,
  playSuccess,
  playError,
  addXp,
  unlockAchievement,
  incrementStat,
  incrementRegexSolved,
  triggerShortcutAction,
}: WorkspaceProps) {
  // Input and output states
  const [inputVal, setInputVal] = useState("");
  const [extraVal, setExtraVal] = useState(""); // Used for Compare
  const [outputVal, setOutputVal] = useState("");
  
  // Status reporting
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>({
    type: "info",
    text: "READY: Input data and execute.",
  });

  // Base64 specific state
  const [b64Mode, setB64Mode] = useState<"encode" | "decode">("encode");

  // URL Parser specific state
  const [urlData, setUrlData] = useState<ParsedUrl | null>(null);

  // JWT Decoder state
  const [jwtData, setJwtData] = useState<any>(null);

  // XML / YAML / TOML / CSV bidirectional mode
  const [bidirectionalMode, setBidirectionalMode] = useState<"toJson" | "fromJson">("toJson");

  // Togglable view specifically for JSON Comparison (editor vs diff log)
  const [compareView, setCompareView] = useState<"editor" | "diff">("editor");

  // Schedule Calculator specific state
  const [scheduleMode, setScheduleMode] = useState<"cron" | "date_diff">("cron");
  const [cronData, setCronData] = useState<CronResult | null>(null);
  const [dateDiffData, setDateDiffData] = useState<DateDiffResult | null>(null);
  const [startDateVal, setStartDateVal] = useState("2026-06-27");
  const [endDateVal, setEndDateVal] = useState("2026-07-27");

  // Hash Generator state
  const [hashData, setHashData] = useState<{ sha256Val: string; md5Val: string; sha1Val: string } | null>(null);

  // Unix Timestamp state
  const [timestampLive, setTimestampLive] = useState<number>(Math.floor(Date.now() / 1000));
  const [timestampLiveActive, setTimestampLiveActive] = useState(true);
  const [timestampData, setTimestampData] = useState<{
    epochSeconds: number;
    epochMs: number;
    utcStr: string;
    localStr: string;
    isoStr: string;
    relativeStr: string;
  } | null>(null);

  useEffect(() => {
    if (!timestampLiveActive) return;
    const interval = setInterval(() => {
      setTimestampLive(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timestampLiveActive]);

  // Load sample data when activeTool changes
  useEffect(() => {
    loadSample();
  }, [activeTool]);

  const loadSample = () => {
    playClick();
    const sample = TOOL_SAMPLES[activeTool];
    setInputVal(sample.input);
    if (sample.extra) {
      setExtraVal(sample.extra);
    } else {
      setExtraVal("");
    }
    setOutputVal("");
    setStatusMsg({ type: "info", text: `Loaded offline sample for ${activeTool}.` });

    if (activeTool === ToolType.URL_PARSER) {
      try {
        const parsed = parseUrl(sample.input);
        setUrlData(parsed);
      } catch (err) {}
    } else {
      setUrlData(null);
    }
    
    if (activeTool === ToolType.JWT) {
      try {
        const parsed = decodeJwt(sample.input);
        setJwtData(parsed);
      } catch (err) {}
    } else {
      setJwtData(null);
    }

    if (activeTool === ToolType.SCHEDULE_CALCULATOR) {
      try {
        const parsed = parseCronExpression(sample.input);
        setCronData(parsed);
        const diff = calculateDateDifference(startDateVal, endDateVal);
        setDateDiffData(diff);
      } catch (err) {}
    } else {
      setCronData(null);
      setDateDiffData(null);
    }

    if (activeTool === ToolType.HASH_GENERATOR) {
      try {
        setHashData({
          sha256Val: sha256(sample.input),
          md5Val: md5(sample.input),
          sha1Val: sha1(sample.input),
        });
      } catch (err) {}
    } else {
      setHashData(null);
    }

    if (activeTool === ToolType.TIMESTAMP) {
      try {
        const parsed = parseTimestampInput(sample.input);
        setTimestampData(parsed);
      } catch (err) {}
    } else {
      setTimestampData(null);
    }

    // Default bidirectional modes
    setBidirectionalMode("toJson");
    setCompareView("editor");
    setScheduleMode("cron");
  };

  const handleClear = () => {
    playClick();
    setInputVal("");
    setExtraVal("");
    setOutputVal("");
    setJwtData(null);
    setUrlData(null);
    setCronData(null);
    setDateDiffData(null);
    setHashData(null);
    setTimestampData(null);
    setStatusMsg({ type: "info", text: "Main console buffer cleared." });
  };

  const handleCopy = (text: string) => {
    playClick();
    if (!text) {
      setStatusMsg({ type: "error", text: "COPY FAILED: Buffer is empty." });
      playError();
      return;
    }
    navigator.clipboard.writeText(text);
    setStatusMsg({ type: "success", text: "COPY OK: Cloned to system clipboard." });
    playSuccess();
    addXp(10, "Copied buffer data");
  };

  // Execution Logic for each tool
  const handleExecute = () => {
    playClick();
    if (!inputVal.trim()) {
      setStatusMsg({ type: "error", text: "EXECUTION HALTED: Missing core input parameter." });
      playError();
      return;
    }

    try {
      setStatusMsg({ type: "info", text: "PROCESS: Compiling code chunk..." });
      incrementStat(activeTool);
      triggerShortcutAction(); // Tick keyboard/shortcut counter

      switch (activeTool) {
        case ToolType.BEAUTIFY: {
          const pretty = beautifyJson(inputVal);
          setOutputVal(pretty);
          setStatusMsg({ type: "success", text: "BEAUTIFY OK: Standard formatted JSON." });
          playSuccess();
          addXp(15, "Formatted JSON");

          const lineCount = pretty.split("\n").length;
          if (lineCount > 50) {
            unlockAchievement("beautify_50");
          }
          break;
        }

        case ToolType.VALIDATOR: {
          // Parse JSON and show line/char error if invalid
          try {
            JSON.parse(inputVal);
            setOutputVal("✓ JSON SYNTAX IS VALID.\n\nStructure conforms perfectly to RFC 8259 specifications.\nReady for server deployment.");
            setStatusMsg({ type: "success", text: "VALIDATION OK: Zero syntax anomalies detected." });
            playSuccess();
            addXp(20, "Validated correct JSON");
          } catch (err) {
            const error = err as Error;
            setOutputVal(`✖ SYSTEM LINT EXCEPTION:\n\n${error.message}\n\n[PRO TIP]: Double-check trailing commas, bracket matches, or unescaped strings in your retro workstation.`);
            setStatusMsg({ type: "error", text: "SYNTAX ERROR: Anomalies found in structure." });
            playError();
            unlockAchievement("validator_bug");
            addXp(20, "Hacked a syntax bug");
          }
          break;
        }

        case ToolType.COMPARE: {
          if (!extraVal.trim()) {
            setStatusMsg({ type: "error", text: "COMPARE ERROR: Right side comparison input empty." });
            playError();
            return;
          }
          // Custom line diff
          const diffResults = diffTexts(inputVal, extraVal);
          const formattedOutput = diffResults
            .map(line => {
              const prefix = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
              return `${prefix} ${line.content}`;
            })
            .join("\n");
          
          setOutputVal(formattedOutput);
          setCompareView("diff");
          setStatusMsg({ type: "success", text: `COMPARE OK: Analyzed ${diffResults.length} differential line pairs.` });
          playSuccess();
          unlockAchievement("diff_compare");
          addXp(25, "Performed Code Diff");
          break;
        }

        case ToolType.YAML: {
          if (bidirectionalMode === "toJson") {
            const json = yamlToJson(inputVal);
            setOutputVal(json);
            setStatusMsg({ type: "success", text: "YAML TO JSON OK: Formatted successfully." });
          } else {
            const yaml = jsonToYaml(inputVal);
            setOutputVal(yaml);
            setStatusMsg({ type: "success", text: "JSON TO YAML OK: Generated valid YAML config." });
          }
          playSuccess();
          unlockAchievement("trans_data");
          addXp(20, "Translated YAML metadata");
          break;
        }

        case ToolType.TOML: {
          if (bidirectionalMode === "toJson") {
            const json = tomlToJson(inputVal);
            setOutputVal(json);
            setStatusMsg({ type: "success", text: "TOML TO JSON OK: Formatted successfully." });
          } else {
            const toml = jsonToToml(inputVal);
            setOutputVal(toml);
            setStatusMsg({ type: "success", text: "JSON TO TOML OK: Generated Cargo/Poetry file." });
          }
          playSuccess();
          unlockAchievement("trans_data");
          addXp(20, "Translated TOML cargo");
          break;
        }

        case ToolType.XML: {
          if (bidirectionalMode === "toJson") {
            const json = xmlToJson(inputVal);
            setOutputVal(json);
            setStatusMsg({ type: "success", text: "XML TO JSON OK: Successfully mapped tags to objects." });
          } else {
            const xml = jsonToXml(inputVal);
            setOutputVal(xml);
            setStatusMsg({ type: "success", text: "JSON TO XML OK: Formatted hierarchy tags." });
          }
          playSuccess();
          unlockAchievement("trans_data");
          addXp(20, "Synthesized XML feeds");
          break;
        }

        case ToolType.CSV: {
          if (bidirectionalMode === "toJson") {
            const json = csvToJson(inputVal);
            setOutputVal(json);
            setStatusMsg({ type: "success", text: "CSV TO JSON OK: Parsed rows to array elements." });
          } else {
            const csv = jsonToCsv(inputVal);
            setOutputVal(csv);
            setStatusMsg({ type: "success", text: "JSON TO CSV OK: Mapped arrays to spreadsheet rows." });
          }
          playSuccess();
          unlockAchievement("trans_data");
          addXp(20, "Parsed table-grid CSV");
          break;
        }

        case ToolType.JWT: {
          const decoded = decodeJwt(inputVal);
          setJwtData(decoded);
          setOutputVal(
            `/* DECODED JWT METADATA */\n\n` +
            `HEADER: ${JSON.stringify(decoded.header, null, 2)}\n\n` +
            `PAYLOAD: ${JSON.stringify(decoded.payload, null, 2)}\n\n` +
            `SIGNATURE STATUS: UNVERIFIED (OFFLINE MODE)\n` +
            `EXPIRATION STATE: ${decoded.isExpired ? "EXPIRED ⚠️" : "ACTIVE ✓"}\n` +
            `EXPIRES ON: ${decoded.expirationDate || "NEVER"}\n` +
            `ISSUED ON: ${decoded.issuedAtDate || "UNKNOWN"}`
          );
          setStatusMsg({ type: "success", text: "JWT DECODED OK: Extracted bearer claims." });
          playSuccess();
          unlockAchievement("jwt_decode");
          addXp(30, "Hacked token signatures");
          break;
        }

        case ToolType.BASE64: {
          if (b64Mode === "encode") {
            const encoded = base64Encode(inputVal);
            setOutputVal(encoded);
            setStatusMsg({ type: "success", text: "BASE64 ENCODE OK: String scrambled." });
          } else {
            try {
              const decoded = base64Decode(inputVal);
              setOutputVal(decoded);
              setStatusMsg({ type: "success", text: "BASE64 DECODE OK: Extracted clean source string." });
            } catch (err) {
              throw new Error("Invalid Base64 token sequence. Unable to parse.");
            }
          }
          playSuccess();
          unlockAchievement("b64_coder");
          addXp(15, "Processed base64 cipher");
          break;
        }

        case ToolType.URL_PARSER: {
          const parsed = parseUrl(inputVal);
          setUrlData(parsed);
          
          let breakdown = `PROTOCOL: ${parsed.protocol}\nHOST: ${parsed.hostname}\nPORT: ${parsed.port || "default"}\nPATH: ${parsed.pathname}\nHASH: ${parsed.hash || "none"}\n\nSEARCH PARAMS:\n`;
          if (parsed.searchParams.length === 0) {
            breakdown += "  (None detected)";
          } else {
            parsed.searchParams.forEach(p => {
              breakdown += `  • ${p.key}: "${p.value}"\n`;
            });
          }

          setOutputVal(breakdown);
          setStatusMsg({ type: "success", text: "URL RECONSTRUCTED OK: Extracted components." });
          playSuccess();
          unlockAchievement("url_hacker");
          addXp(20, "Routed URL packets");
          break;
        }

        case ToolType.SCHEDULE_CALCULATOR: {
          if (scheduleMode === "cron") {
            const parsed = parseCronExpression(inputVal);
            setCronData(parsed);
            if (parsed.isValid) {
              let logs = `/* CRON SCHEDULER INTERPRETATION */\n\n`;
              logs += `EXPRESSION: ${inputVal}\n`;
              logs += `TRANSLATION: ${parsed.description}\n\n`;
              logs += `UPCOMING ESTIMATED RUNS:\n`;
              parsed.nextRuns.forEach((run, idx) => {
                logs += `  [RUN ${idx + 1}]: ${run}\n`;
              });
              setOutputVal(logs);
              setStatusMsg({ type: "success", text: "CRON PARSED OK: Decoded scheduling expressions." });
              playSuccess();
              unlockAchievement("schedule_calc");
              addXp(20, "Analyzed cron job timing");
            } else {
              throw new Error(parsed.error || "Failed to parse cron expression.");
            }
          } else {
            const diff = calculateDateDifference(startDateVal, endDateVal);
            setDateDiffData(diff);
            if (diff.error) {
              throw new Error(diff.error);
            }
            let logs = `/* DATE DIFFERENCE METRICS */\n\n`;
            logs += `START RANGE: ${diff.startDate}\n`;
            logs += `END RANGE:   ${diff.endDate}\n\n`;
            logs += `CALCULATED SEGMENT DURATION:\n`;
            logs += `  • TOTAL DAYS:       ${diff.totalDays} days\n`;
            logs += `  • BUSINESS DAYS:    ${diff.businessDays} days (Mon-Fri)\n`;
            logs += `  • WEEKS CONVERSION:  ${diff.weeks} weeks\n`;
            logs += `  • HOURS TOTAL:      ${diff.hours} hrs\n`;
            logs += `  • MINUTES TOTAL:    ${diff.minutes} mins\n`;
            logs += `  • SECONDS TOTAL:    ${diff.seconds} secs\n`;
            setOutputVal(logs);
            setStatusMsg({ type: "success", text: "INTERVAL CALCULATED OK: Decoded time delta." });
            playSuccess();
            unlockAchievement("schedule_calc");
            addXp(20, "Calculated calendar interval");
          }
          break;
        }

        case ToolType.HASH_GENERATOR: {
          const sha256Val = sha256(inputVal);
          const md5Val = md5(inputVal);
          const sha1Val = sha1(inputVal);
          setHashData({ sha256Val, md5Val, sha1Val });

          let logs = `/* CRYPTOGRAPHIC HASH GENERATION */\n\n`;
          logs += `SOURCE INPUT: "${inputVal}"\n\n`;
          logs += `SHA-256 HASH:\n${sha256Val}\n\n`;
          logs += `MD5 HASH:\n${md5Val}\n\n`;
          logs += `SHA-1 HASH:\n${sha1Val}\n\n`;
          logs += `BASE64 ENCODED HEX:\n${base64Encode(sha256Val)}\n`;

          setOutputVal(logs);
          setStatusMsg({ type: "success", text: "CRYPTOGRAPHY COMPLETED: Signatures generated." });
          playSuccess();
          unlockAchievement("hash_gen");
          addXp(25, "Hashed target signatures");
          break;
        }

        case ToolType.TIMESTAMP: {
          const parsed = parseTimestampInput(inputVal);
          setTimestampData(parsed);

          let logs = `/* UNIX EPOCH TIMESTAMP ANALYSIS */\n\n`;
          logs += `INPUT QUERY: "${inputVal}"\n\n`;
          logs += `EPOCH SECONDS:      ${parsed.epochSeconds}\n`;
          logs += `EPOCH MILLISECONDS: ${parsed.epochMs}\n\n`;
          logs += `UTC DATE STRING:    ${parsed.utcStr}\n`;
          logs += `LOCAL DATE STRING:  ${parsed.localStr}\n`;
          logs += `ISO-8601 FORMAT:    ${parsed.isoStr}\n\n`;
          logs += `RELATIVE OFFSET:    ${parsed.relativeStr}\n`;

          setOutputVal(logs);
          setStatusMsg({ type: "success", text: "TIMESTAMP OK: Translated epoch value." });
          playSuccess();
          unlockAchievement("epoch_traveler");
          addXp(20, "Translated Epoch Timestamp");
          break;
        }

        case ToolType.TECH_GAMES: {
          setStatusMsg({ type: "info", text: "INTERACTIVE GAMES ACTIVE: Play directly using console buttons!" });
          break;
        }
      }
    } catch (err) {
      const error = err as Error;
      setOutputVal(`✖ WORKSTATION PARSE COMPILER ERROR:\n\n${error.message}\n\nPlease audit your terminal input structure for offline parity.`);
      setStatusMsg({ type: "error", text: "PROCESSING FAILURE: Exception occurred." });
      playError();
    }
  };

  // Live Sync edited URL query parameters back to string
  const handleUrlParamChange = (index: number, field: "key" | "value", value: string) => {
    if (!urlData) return;
    const updatedParams = [...urlData.searchParams];
    updatedParams[index][field] = value;
    
    const newUrlData = { ...urlData, searchParams: updatedParams };
    setUrlData(newUrlData);

    const generated = buildUrl(newUrlData);
    setInputVal(generated);
  };

  const handleAddUrlParam = () => {
    if (!urlData) return;
    playClick();
    const newParam = { key: "new_key", value: "new_value", id: Math.random().toString() };
    const newUrlData = { ...urlData, searchParams: [...urlData.searchParams, newParam] };
    setUrlData(newUrlData);
    
    const generated = buildUrl(newUrlData);
    setInputVal(generated);
    setStatusMsg({ type: "info", text: "Added query parameter key-pair." });
  };

  const handleDeleteUrlParam = (index: number) => {
    if (!urlData) return;
    playClick();
    const filtered = urlData.searchParams.filter((_, idx) => idx !== index);
    const newUrlData = { ...urlData, searchParams: filtered };
    setUrlData(newUrlData);
    
    const generated = buildUrl(newUrlData);
    setInputVal(generated);
    setStatusMsg({ type: "info", text: "Removed parameter pair." });
  };

  const toggleB64Mode = () => {
    playClick();
    const nextMode = b64Mode === "encode" ? "decode" : "encode";
    setB64Mode(nextMode);
    setInputVal(outputVal); // Swap buffers for easier workflows!
    setOutputVal("");
  };

  const toggleBidirectionalMode = () => {
    playClick();
    const nextMode = bidirectionalMode === "toJson" ? "fromJson" : "toJson";
    setBidirectionalMode(nextMode);
    setInputVal(outputVal); // Swap buffers for convenience
    setOutputVal("");
  };

  const handleMinify = () => {
    playClick();
    try {
      const minified = minifyJson(inputVal);
      setOutputVal(minified);
      setStatusMsg({ type: "success", text: "MINIFY OK: Flattened JSON payload." });
      playSuccess();
      addXp(10, "Compressed JSON");
    } catch (err) {
      const error = err as Error;
      setStatusMsg({ type: "error", text: "MINIFY ERROR: " + error.message });
      playError();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-transparent" id="active-workstation">
      {/* Action Bar / System Command Panel */}
      <div 
        className="flex flex-wrap items-center justify-between gap-2 p-2 border-b bg-[#111111]"
        style={{ borderColor: `${theme.primaryColor}25` }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs opacity-60" style={{ color: theme.primaryColor }}>CMD:</span>
          <button
            onClick={handleExecute}
            className={`px-3 py-1 font-mono text-xs font-bold border-2 ${theme.accentBorder} text-white hover:opacity-90 flex items-center gap-1 cursor-pointer transition-colors ${theme.glowColor}`}
            style={{ backgroundColor: '#0a0b0a', color: theme.primaryColor, borderColor: theme.primaryColor }}
            title="Execute current tool (Shortcut: Ctrl+Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            COMPILE [ctrl+enter]
          </button>
          
          {activeTool === ToolType.BEAUTIFY && (
            <button
              onClick={handleMinify}
              className="px-2 py-1 font-mono text-xs border bg-transparent hover:bg-[#111111] cursor-pointer"
              style={{ borderColor: `${theme.primaryColor}44`, color: theme.primaryColor }}
            >
              MINIFY
            </button>
          )}

          {/* Bidirectional Translation Toggles */}
          {[ToolType.YAML, ToolType.TOML, ToolType.XML, ToolType.CSV].includes(activeTool) && (
            <button
              onClick={toggleBidirectionalMode}
              className="px-2 py-1 font-mono text-xs border flex items-center gap-1.5 cursor-pointer"
              style={{ borderColor: `${theme.primaryColor}44`, color: theme.primaryColor, backgroundColor: `${theme.primaryColor}11` }}
            >
              <ArrowLeftRight className="w-3 h-3" />
              MODE: {bidirectionalMode === "toJson" ? "TO JSON" : "FROM JSON"}
            </button>
          )}

          {/* Base64 toggles */}
          {activeTool === ToolType.BASE64 && (
            <button
              onClick={toggleB64Mode}
              className="px-2 py-1 font-mono text-xs border flex items-center gap-1.5 cursor-pointer"
              style={{ borderColor: `${theme.primaryColor}44`, color: theme.primaryColor, backgroundColor: `${theme.primaryColor}11` }}
            >
              <ArrowLeftRight className="w-3 h-3" />
              MODE: {b64Mode.toUpperCase()}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSample}
            className="px-2 py-1 font-mono text-xs border bg-transparent text-neutral-400 hover:text-white cursor-pointer"
            style={{ borderColor: `${theme.primaryColor}22` }}
          >
            SAMPLE DATA
          </button>
          <button
            onClick={handleClear}
            className="px-2 py-1 font-mono text-xs border border-red-500/30 hover:border-red-500 bg-transparent text-red-500/80 hover:text-red-400 flex items-center gap-1 cursor-pointer hover:bg-red-950/20"
          >
            <Trash2 className="w-3 h-3" />
            CLEAR
          </button>
        </div>
      </div>

      {/* Editor Panel Grid */}
      {activeTool === ToolType.TECH_GAMES ? (
        <div className="flex-1 flex flex-col min-h-0 border-b overflow-y-auto" style={{ borderColor: `${theme.primaryColor}22`, backgroundColor: '#0a0b0a' }} id="active-games-arcade">
          <TechGames
            theme={theme}
            playClick={playClick}
            playSuccess={playSuccess}
            playError={playError}
            unlockAchievement={unlockAchievement}
            addXp={addXp}
            setStatusMsg={setStatusMsg}
            incrementStat={incrementStat}
            incrementRegexSolved={incrementRegexSolved}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 border-b" style={{ borderColor: `${theme.primaryColor}22` }}>
          {/* Input buffer */}
          <div className="flex flex-col border-r min-h-[250px] md:min-h-0" style={{ borderColor: `${theme.primaryColor}22` }}>
            <div className="flex items-center justify-between p-1.5 px-3 border-b bg-black/20 font-mono text-xs" style={{ borderColor: `${theme.primaryColor}11` }}>
              <span className="flex items-center gap-1.5 opacity-80" style={{ color: theme.primaryColor }}>
                <FileText className="w-3.5 h-3.5" />
                INPUT_STREAM.TXT
              </span>
              <button
                onClick={() => handleCopy(inputVal)}
                className="opacity-60 hover:opacity-100 flex items-center gap-1"
                style={{ color: theme.primaryColor }}
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <textarea
              value={inputVal}
              onChange={(e) => {
                const val = e.target.value;
                setInputVal(val);
                // Handle URL state sync in real-time
                if (activeTool === ToolType.URL_PARSER) {
                  try {
                    setUrlData(parseUrl(val));
                  } catch {}
                }
                if (activeTool === ToolType.SCHEDULE_CALCULATOR && scheduleMode === "cron") {
                  try {
                    setCronData(parseCronExpression(val));
                  } catch {}
                }
                if (activeTool === ToolType.HASH_GENERATOR) {
                  try {
                    setHashData({
                      sha256Val: sha256(val),
                      md5Val: md5(val),
                      sha1Val: sha1(val),
                    });
                  } catch {}
                }
                if (activeTool === ToolType.TIMESTAMP) {
                  try {
                    setTimestampData(parseTimestampInput(val));
                  } catch {}
                }
              }}
              placeholder={
                activeTool === ToolType.JWT
                  ? "PASTE RAW BEARER JWT TOKEN..."
                  : activeTool === ToolType.TIMESTAMP
                  ? "ENTER UNIX EPOCH SECONDS (e.g. 1782624000) OR ISO-8601 DATE STRING..."
                  : `ENTER SOURCE ${activeTool === ToolType.VALIDATOR ? "JSON" : activeTool} CONTENT HERE...`
              }
              className="flex-1 w-full p-4 font-mono text-sm focus:outline-none resize-none overflow-y-auto leading-relaxed border-0"
              style={{ color: theme.primaryColor, backgroundColor: '#0a0b0a' }}
            />
          </div>

          {/* Output/Compare stream buffer */}
          <div className="flex flex-col min-h-[250px] md:min-h-0" style={{ backgroundColor: '#0a0b0a' }}>
            {activeTool === ToolType.COMPARE ? (
              // Diff/Compare extra editor on the right side
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between p-1.5 px-3 border-b font-mono text-xs" style={{ borderColor: `${theme.primaryColor}11`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <span className="flex items-center gap-1.5 opacity-80" style={{ color: theme.primaryColor }}>
                    <FileText className="w-3.5 h-3.5" />
                    {compareView === "editor" ? "TARGET_COMPARISON_STREAM.TXT" : "DIFF_ANALYSIS_LOG.TXT"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClick();
                        setCompareView(prev => prev === "editor" ? "diff" : "editor");
                      }}
                      className="px-2 py-0.5 border text-[10px] bg-neutral-950/60 font-bold cursor-pointer animate-pulse"
                      style={{ borderColor: `${theme.primaryColor}33`, color: theme.primaryColor }}
                    >
                      VIEW: {compareView === "editor" ? "SHOW DIFF" : "SHOW EDITOR"}
                    </button>
                    <button
                      onClick={() => handleCopy(compareView === "editor" ? extraVal : outputVal)}
                      className="opacity-60 hover:opacity-100 flex items-center gap-1"
                      style={{ color: theme.primaryColor }}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                </div>
                
                {compareView === "editor" ? (
                  <textarea
                    value={extraVal}
                    onChange={(e) => setExtraVal(e.target.value)}
                    placeholder="PASTE THE TARGET JSON TO COMPARE..."
                    className="flex-1 w-full p-4 font-mono text-sm focus:outline-none resize-none overflow-y-auto leading-relaxed border-0"
                    style={{ color: theme.primaryColor, backgroundColor: '#0a0b0a' }}
                  />
                ) : (
                  <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap leading-relaxed select-text" style={{ backgroundColor: '#0a0b0a' }}>
                    {diffTexts(inputVal, extraVal).map((line, idx) => (
                      <div
                        key={idx}
                        className={`px-1 rounded-xs ${
                          line.type === "added"
                            ? "bg-emerald-950/60 text-emerald-400"
                            : line.type === "removed"
                            ? "bg-rose-950/60 text-rose-400 line-through"
                            : "text-zinc-500 opacity-80"
                        }`}
                      >
                        <span className="inline-block w-6 select-none opacity-40">
                          {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                        </span>
                        {line.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Output buffer for normal tools
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between p-1.5 px-3 border-b font-mono text-xs" style={{ borderColor: `${theme.primaryColor}11`, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <span className="flex items-center gap-1.5 opacity-80" style={{ color: theme.primaryColor }}>
                    <FileText className="w-3.5 h-3.5" />
                    OUTPUT_STREAM.LOG
                  </span>
                  <button
                    onClick={() => handleCopy(outputVal)}
                    className="opacity-60 hover:opacity-100 flex items-center gap-1"
                    style={{ color: theme.primaryColor }}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                
                {/* Standard Output Textarea */}
                <textarea
                  readOnly
                  value={outputVal}
                  placeholder="COMPILED OUTPUT WILL APPEAR HERE..."
                  className="flex-1 w-full p-4 font-mono text-sm focus:outline-none resize-none overflow-y-auto leading-relaxed border-0 select-text"
                  style={{ color: theme.primaryColor, backgroundColor: '#0a0b0a' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL interactive parameter module */}
      {activeTool === ToolType.URL_PARSER && urlData && (
        <div className="p-4 border-b font-mono text-xs bg-[#111111]/80" style={{ borderColor: `${theme.primaryColor}22` }}>
          <div className="flex items-center justify-between mb-2 pb-1 border-b" style={{ borderColor: `${theme.primaryColor}11` }}>
            <span className="flex items-center gap-1.5" style={{ color: theme.primaryColor }}>
              <ArrowLeftRight className="w-3.5 h-3.5" />
              INTERACTIVE URL QUERY BUILDER
            </span>
            <button
              onClick={handleAddUrlParam}
              className="px-2 py-0.5 border rounded-xs flex items-center gap-1 cursor-pointer"
              style={{ borderColor: `${theme.primaryColor}44`, color: theme.primaryColor, backgroundColor: `${theme.primaryColor}11` }}
            >
              <Plus className="w-3 h-3" /> ADD PARAM
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
            {urlData.searchParams.length === 0 ? (
              <div className="text-zinc-500 italic p-1">No active key-value search parameters on this URL payload.</div>
            ) : (
              urlData.searchParams.map((param, idx) => (
                <div key={param.id} className="flex items-center gap-2 bg-black/30 p-1 border" style={{ borderColor: `${theme.primaryColor}05` }}>
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => handleUrlParamChange(idx, "key", e.target.value)}
                    className="border px-2 py-0.5 w-1/3 focus:outline-none font-mono"
                    style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22`, color: theme.primaryColor }}
                    placeholder="key"
                  />
                  <span className="font-bold" style={{ color: `${theme.primaryColor}50` }}>=</span>
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => handleUrlParamChange(idx, "value", e.target.value)}
                    className="border px-2 py-0.5 flex-1 focus:outline-none font-mono text-neutral-300"
                    style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22` }}
                    placeholder="value"
                  />
                  <button
                    onClick={() => handleDeleteUrlParam(idx)}
                    className="p-1 text-red-400 hover:text-red-500 hover:bg-red-950/20 rounded-sm cursor-pointer"
                    title="Delete query parameters"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* JWT visual status panel */}
      {activeTool === ToolType.JWT && jwtData && (
        <div className="p-4 border-b font-mono text-xs flex flex-wrap gap-4 items-center bg-[#111111]/80" style={{ borderColor: `${theme.primaryColor}22` }}>
          <div className="flex items-center gap-2 px-3 py-2 border" style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22` }}>
            <span className="text-neutral-400">JWT HEADER:</span>
            <span className="text-emerald-400 font-bold">{jwtData.header?.alg || "NONE"}</span>
            <span className="text-neutral-500">|</span>
            <span className="text-amber-400 font-mono">{jwtData.header?.typ || "JWT"}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border" style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22` }}>
            <span className="text-neutral-400">SUBJECT CLAIM (SUB):</span>
            <span className="text-zinc-300 underline">{jwtData.payload?.sub || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border" style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22` }}>
            <span className="text-neutral-400">STATUS CHECK:</span>
            {jwtData.isExpired ? (
              <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> EXPIRED TOKEN
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> ACTIVE claims
              </span>
            )}
          </div>
        </div>
      )}

      {/* Schedule Calculator interactive configuration panel */}
      {activeTool === ToolType.SCHEDULE_CALCULATOR && (
        <div className="p-4 border-b font-mono text-xs bg-[#111111]/80 space-y-3 animate-fade-in" style={{ borderColor: `${theme.primaryColor}22` }}>
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: `${theme.primaryColor}11` }}>
            <span className="flex items-center gap-1.5 font-bold" style={{ color: theme.primaryColor }}>
              <ArrowLeftRight className="w-3.5 h-3.5" />
              INTERACTIVE SCHEDULER ENGINE
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClick();
                  setScheduleMode("cron");
                  setInputVal("*/15 9-17 * * 1-5");
                  try {
                    setCronData(parseCronExpression("*/15 9-17 * * 1-5"));
                  } catch (err) {}
                  setStatusMsg({ type: "info", text: "Switched to Cron Expression Simulator mode." });
                }}
                className={`px-2 py-1 border text-[10px] font-bold cursor-pointer transition-colors ${
                  scheduleMode === "cron" ? "bg-emerald-950/40 text-emerald-400" : "bg-neutral-900 text-neutral-400"
                }`}
                style={{ borderColor: scheduleMode === "cron" ? "rgba(16,185,129,0.3)" : `${theme.primaryColor}22` }}
              >
                CRON SIMULATOR
              </button>
              <button
                onClick={() => {
                  playClick();
                  setScheduleMode("date_diff");
                  const diff = calculateDateDifference(startDateVal, endDateVal);
                  setDateDiffData(diff);
                  setStatusMsg({ type: "info", text: "Switched to Date Interval Calculator mode." });
                }}
                className={`px-2 py-1 border text-[10px] font-bold cursor-pointer transition-colors ${
                  scheduleMode === "date_diff" ? "bg-emerald-950/40 text-emerald-400" : "bg-neutral-900 text-neutral-400"
                }`}
                style={{ borderColor: scheduleMode === "date_diff" ? "rgba(16,185,129,0.3)" : `${theme.primaryColor}22` }}
              >
                DATE RANGE CALCULATOR
              </button>
            </div>
          </div>

          {scheduleMode === "cron" ? (
            <div className="space-y-2">
              <div className="text-zinc-400 font-bold text-[10px]">QUICK REFERENCE CRON TEMPLATES:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Every 15m (Mon-Fri, 9-5)", value: "*/15 9-17 * * 1-5" },
                  { label: "Every hour on Sundays", value: "0 * * * 0" },
                  { label: "At 04:30 AM daily", value: "30 4 * * *" },
                  { label: "First day of month midnight", value: "0 0 1 * *" },
                ].map((tmpl) => (
                  <button
                    key={tmpl.value}
                    onClick={() => {
                      playClick();
                      setInputVal(tmpl.value);
                      const parsed = parseCronExpression(tmpl.value);
                      setCronData(parsed);
                      setStatusMsg({ type: "success", text: `Loaded cron template: ${tmpl.value}` });
                    }}
                    className="px-2 py-1 text-[10px] rounded-xs bg-black/40 border hover:bg-black/60 transition-colors cursor-pointer"
                    style={{ borderColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
              {cronData && cronData.isValid && (
                <div className="mt-2 p-2.5 bg-black/30 border space-y-1.5" style={{ borderColor: `${theme.primaryColor}11` }}>
                  <div className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" /> CRON EXPRESSION DESCR_OK
                  </div>
                  <div className="text-neutral-300 leading-relaxed text-[11px]">
                    <span className="text-zinc-500 font-bold">TRANSLATION:</span> {cronData.description}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-400 block text-[10px] font-bold">START DATE (YYYY-MM-DD):</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={startDateVal}
                      onChange={(e) => {
                        setStartDateVal(e.target.value);
                        const diff = calculateDateDifference(e.target.value, endDateVal);
                        setDateDiffData(diff);
                      }}
                      className="border px-2 py-1 flex-1 focus:outline-none font-mono text-neutral-200 text-xs"
                      style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22` }}
                    />
                    <input
                      type="text"
                      value={startDateVal}
                      onChange={(e) => {
                        setStartDateVal(e.target.value);
                        const diff = calculateDateDifference(e.target.value, endDateVal);
                        setDateDiffData(diff);
                      }}
                      placeholder="YYYY-MM-DD"
                      className="border px-2 py-1 w-28 focus:outline-none font-mono text-neutral-300 text-xs"
                      style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 block text-[10px] font-bold">END DATE (YYYY-MM-DD):</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={endDateVal}
                      onChange={(e) => {
                        setEndDateVal(e.target.value);
                        const diff = calculateDateDifference(startDateVal, e.target.value);
                        setDateDiffData(diff);
                      }}
                      className="border px-2 py-1 flex-1 focus:outline-none font-mono text-neutral-200 text-xs"
                      style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22` }}
                    />
                    <input
                      type="text"
                      value={endDateVal}
                      onChange={(e) => {
                        setEndDateVal(e.target.value);
                        const diff = calculateDateDifference(startDateVal, e.target.value);
                        setDateDiffData(diff);
                      }}
                      placeholder="YYYY-MM-DD"
                      className="border px-2 py-1 w-28 focus:outline-none font-mono text-neutral-300 text-xs"
                      style={{ backgroundColor: '#0a0b0a', borderColor: `${theme.primaryColor}22` }}
                    />
                  </div>
                </div>
              </div>

              {dateDiffData && !dateDiffData.error && (
                <div className="p-2.5 bg-black/30 border grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2" style={{ borderColor: `${theme.primaryColor}11` }}>
                  {[
                    { label: "Total Days", val: `${dateDiffData.totalDays} d` },
                    { label: "Biz Days (M-F)", val: `${dateDiffData.businessDays} d` },
                    { label: "Weeks", val: `${dateDiffData.weeks} wk` },
                    { label: "Hours", val: `${dateDiffData.hours.toLocaleString()} hr` },
                    { label: "Minutes", val: `${dateDiffData.minutes.toLocaleString()} m` },
                    { label: "Seconds", val: `${dateDiffData.seconds.toLocaleString()} s` },
                  ].map((stat, i) => (
                    <div key={i} className="p-1.5 border border-white/5 bg-black/10 text-center">
                      <div className="text-[9px] text-zinc-500 font-bold uppercase">{stat.label}</div>
                      <div className="text-xs font-bold text-neutral-200 mt-0.5">{stat.val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hash Generator interactive copying panel */}
      {activeTool === ToolType.HASH_GENERATOR && hashData && (
        <div className="p-4 border-b font-mono text-xs bg-[#111111]/80 space-y-2.5 animate-fade-in" style={{ borderColor: `${theme.primaryColor}22` }}>
          <div className="flex items-center gap-1.5 pb-1 border-b" style={{ borderColor: `${theme.primaryColor}11`, color: theme.primaryColor }}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-bold">LIVE CRYPTOGRAPHIC DIGEST CHECKSUMS</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "SHA-256 DIGEST", value: hashData.sha256Val },
              { label: "MD5 DIGEST", value: hashData.md5Val },
              { label: "SHA-1 DIGEST", value: hashData.sha1Val },
            ].map((hashItem, index) => (
              <div key={index} className="flex flex-col bg-black/40 p-2 border space-y-1.5" style={{ borderColor: `${theme.primaryColor}11` }}>
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="font-bold text-neutral-400">{hashItem.label}</span>
                  <button
                    onClick={() => handleCopy(hashItem.value)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-neutral-500"
                    style={{ hoverColor: theme.primaryColor }}
                  >
                    <Copy className="w-3 h-3" /> copy
                  </button>
                </div>
                <div className="font-mono text-[11px] break-all select-text bg-black/20 p-1 border border-black/40 text-neutral-300">
                  {hashItem.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unix Epoch & Timestamp Module */}
      {activeTool === ToolType.TIMESTAMP && (
        <div className="p-4 border-b font-mono text-xs bg-[#111111]/80 space-y-3.5 animate-fade-in" style={{ borderColor: `${theme.primaryColor}22` }}>
          {/* Live Monitor Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-black/40 p-3 border" style={{ borderColor: `${theme.primaryColor}15` }}>
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                LIVE SYSTEM CLOCK FREQUENCY
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wider text-white select-all">{timestampLive}</span>
                <span className="text-[10px] text-neutral-400">({new Date(timestampLive * 1000).toUTCString()})</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimestampLiveActive(!timestampLiveActive)}
                className="px-2 py-1 border text-[10px] font-bold uppercase cursor-pointer hover:bg-white/5"
                style={{ borderColor: `${theme.primaryColor}44`, color: theme.primaryColor }}
              >
                {timestampLiveActive ? "PAUSE CLOCK" : "RESUME CLOCK"}
              </button>
              <button
                onClick={() => handleCopy(String(timestampLive))}
                className="px-2 py-1 border text-[10px] font-bold uppercase cursor-pointer hover:bg-white/5"
                style={{ borderColor: `${theme.primaryColor}44`, color: theme.primaryColor }}
              >
                COPY LIVE
              </button>
              <button
                onClick={() => {
                  setInputVal(String(timestampLive));
                  try {
                    setTimestampData(parseTimestampInput(String(timestampLive)));
                  } catch {}
                  playClick();
                }}
                className="px-2 py-1 border text-[10px] font-bold uppercase cursor-pointer hover:bg-white/5"
                style={{ borderColor: `${theme.primaryColor}44`, color: theme.primaryColor }}
              >
                FEED INPUT
              </button>
            </div>
          </div>

          {/* Converted Outputs Grid */}
          {timestampData ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: theme.primaryColor }}>
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-bold uppercase">EPOCH CONVERSION TRANSLATION MATRIX</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: "EPOCH SECONDS", val: String(timestampData.epochSeconds) },
                  { label: "EPOCH MILLISECONDS", val: String(timestampData.epochMs) },
                  { label: "RELATIVE DURATION", val: timestampData.relativeStr },
                  { label: "UTC DATE STRING", val: timestampData.utcStr },
                  { label: "LOCAL DATE STRING", val: timestampData.localStr },
                  { label: "ISO-8601 FORMAT", val: timestampData.isoStr },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col bg-black/50 p-2 border space-y-1" style={{ borderColor: `${theme.primaryColor}11` }}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-neutral-400">{item.label}</span>
                      <button
                        onClick={() => handleCopy(item.val)}
                        className="opacity-50 hover:opacity-100 flex items-center gap-0.5 cursor-pointer text-neutral-500"
                        style={{ hoverColor: theme.primaryColor }}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[11px] font-mono select-text bg-black/20 p-1 border border-black/40 text-neutral-200 truncate" title={item.val}>
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-zinc-500 italic p-1">
              * Enter seconds/milliseconds or an ISO date format in the console input stream, then compile (Ctrl+Enter) to populate this conversion matrix.
            </div>
          )}

          {/* Cheat Sheet / Common Offsets Reference */}
          <div className="space-y-1.5 pt-1.5 border-t" style={{ borderColor: `${theme.primaryColor}11` }}>
            <div className="text-[9px] text-zinc-500 font-bold uppercase">QUICK DURATION EPOCH CONSTANTS CHEAT SHEET</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { label: "1 Min", seconds: "60" },
                { label: "1 Hour", seconds: "3600" },
                { label: "1 Day", seconds: "86400" },
                { label: "1 Week", seconds: "604800" },
                { label: "30 Days", seconds: "2592000" },
                { label: "365 Days", seconds: "31536000" },
              ].map((constItem, i) => (
                <div key={i} className="bg-black/30 p-1 border flex flex-col justify-between" style={{ borderColor: `${theme.primaryColor}11` }}>
                  <span className="text-[9px] text-neutral-400 font-bold">{constItem.label}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-neutral-200 font-bold font-mono">{constItem.seconds}s</span>
                    <button
                      onClick={() => handleCopy(constItem.seconds)}
                      className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                      style={{ color: theme.primaryColor }}
                      title="Copy seconds value"
                    >
                      <Copy className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Console Validation Error Log / Footer Status Indicator */}
      {statusMsg && (
        <div
          className={`flex items-start gap-2 p-3 font-mono text-xs border-t ${
            statusMsg.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
              : statusMsg.type === "error"
              ? "bg-rose-950/30 border-rose-500/30 text-rose-400"
              : "text-neutral-400"
          }`}
          style={{
            borderTopColor: statusMsg.type === "info" ? `${theme.primaryColor}11` : undefined,
            backgroundColor: statusMsg.type === "info" ? 'rgba(0,0,0,0.4)' : undefined,
          }}
        >
          <span className="font-bold flex-shrink-0 mt-0.5">
            {statusMsg.type === "success" ? "✓" : statusMsg.type === "error" ? "⚠" : "ℹ"} SYSTEM_LOG:
          </span>
          <p className="flex-1 leading-relaxed whitespace-pre-wrap">{statusMsg.text}</p>
        </div>
      )}
    </div>
  );
}
