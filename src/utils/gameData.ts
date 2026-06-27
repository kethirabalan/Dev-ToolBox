import { Achievement, ToolType } from "../types";

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "beautify_50",
    title: "Pretty Boy",
    description: "Beautify a JSON payload with over 50 lines.",
    xpReward: 100,
    unlocked: false,
    icon: "✨",
  },
  {
    id: "validator_bug",
    title: "Spot the Bug",
    description: "Locate and point out a JSON validation syntax error.",
    xpReward: 100,
    unlocked: false,
    icon: "🐛",
  },
  {
    id: "diff_compare",
    title: "Double Vision",
    description: "Perform a diff match & compare on two JSON states.",
    xpReward: 120,
    unlocked: false,
    icon: "👁️",
  },
  {
    id: "jwt_decode",
    title: "Secret Agent",
    description: "Extract headers and payloads by decoding a secure JWT.",
    xpReward: 150,
    unlocked: false,
    icon: "🕵️",
  },
  {
    id: "b64_coder",
    title: "Cipher Slinger",
    description: "Encode or decode a message with Base64 encryption.",
    xpReward: 100,
    unlocked: false,
    icon: "🔑",
  },
  {
    id: "trans_data",
    title: "Data Polyglot",
    description: "Parse and translate YAML, TOML, XML, or CSV formatting.",
    xpReward: 150,
    unlocked: false,
    icon: "🌐",
  },
  {
    id: "url_hacker",
    title: "Net Voyager",
    description: "Parse a web URL and inspect structured search parameters.",
    xpReward: 100,
    unlocked: false,
    icon: "🛰️",
  },
  {
    id: "theme_custom",
    title: "CRT Modder",
    description: "Reconfigure terminal phosphor displays in settings.",
    xpReward: 50,
    unlocked: false,
    icon: "📺",
  },
  {
    id: "coffee_supporter",
    title: "Coffee Supporter",
    description: "Click the Buy Me a Coffee link to support developers.",
    xpReward: 200,
    unlocked: false,
    icon: "☕",
  },
  {
    id: "shortcut_guru",
    title: "Terminal Guru",
    description: "Trigger 5 actions using integrated keyboard shortcuts.",
    xpReward: 150,
    unlocked: false,
    icon: "⚡",
  },
  {
    id: "schedule_calc",
    title: "Time Lord",
    description: "Configure or parse a custom cron scheduling pattern.",
    xpReward: 120,
    unlocked: false,
    icon: "⏱️",
  },
  {
    id: "hash_gen",
    title: "Cryptographer",
    description: "Generate secure hashing signatures of developer payloads.",
    xpReward: 100,
    unlocked: false,
    icon: "🔐",
  },
  {
    id: "binary_boss",
    title: "Binary Boss",
    description: "Successfully complete 5 binary targets in the Byte Blaster.",
    xpReward: 150,
    unlocked: false,
    icon: "👾",
  },
  {
    id: "regex_wizard",
    title: "Regex Wizard",
    description: "Master all regex speedrun levels in the Regex Runner arcade.",
    xpReward: 180,
    unlocked: false,
    icon: "🧙‍♂️",
  },
  {
    id: "epoch_traveler",
    title: "Epoch Traveler",
    description: "Successfully parse and decode a Unix epoch timestamp.",
    xpReward: 120,
    unlocked: false,
    icon: "⏳",
  },
];

export const TOOL_SAMPLES: Record<ToolType, { input: string; extra?: string }> = {
  [ToolType.BEAUTIFY]: {
    input: '{"id":1,"name":"Retro Dev","role":"Synthesizer","active":true,"skills":["JSON","YAML","TOML"],"experience":{"years":10,"level":"99"},"meta":{"last_login":"2026-06-27T06:00:00Z","node":"CRT_NODE_01"},"terminal_config":{"color":"green_phosphor","flicker":true,"sound_volume":0.8}}',
  },
  [ToolType.COMPARE]: {
    input: '{\n  "name": "Dev_Toolbox",\n  "version": "1.0.0",\n  "status": "online",\n  "modules": ["JSON", "XML", "YAML"],\n  "developer": "kbalan"\n}',
    extra: '{\n  "name": "Dev_Toolbox",\n  "version": "1.0.1",\n  "status": "deployed",\n  "modules": ["JSON", "XML", "YAML", "TOML"],\n  "developer": "kbalan",\n  "coffee_fueled": true\n}',
  },
  [ToolType.VALIDATOR]: {
    input: '{\n  "project": "Retro Console",\n  "bugs_fixed": 999,\n  "working": true,\n  "unsupported_key": "oops", // This comment is not valid JSON!\n  "nested": {\n    "array": [1, 2, 3,]\n  }\n}',
  },
  [ToolType.YAML]: {
    input: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: retro-terminal-deployment\n  labels:\n    app: toolbox\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: terminal\n  template:\n    metadata:\n      labels:\n        app: terminal\n    spec:\n      containers:\n      - name: mainframe\n        image: kbalan/retro-beautify:latest\n        ports:\n        - containerPort: 3000\n        env:\n        - name: COFFEE_FUELED\n          value: "true"\n`,
  },
  [ToolType.TOML]: {
    input: `[package]
name = "retro_toolbox"
version = "0.1.0"
authors = ["kbalan <buymeacoffee.com/kbalan>"]
edition = "2021"

[dependencies]
js-yaml = "4.1.0"
motion = "12.23.24"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
`,
  },
  [ToolType.XML]: {
    input: `<?xml version="1.0" encoding="UTF-8"?>
<dashboard version="1.2">
  <status code="200">ACTIVE</status>
  <hardware>
    <processor model="CRT-6502" speed="1.2MHz" />
    <memory unit="KB">64</memory>
  </hardware>
  <users>
    <user id="u01" role="root">kbalan</user>
    <user id="u02" role="guest">anon_hacker</user>
  </users>
</dashboard>
`,
  },
  [ToolType.CSV]: {
    input: `ID,Username,Role,Level,Location,IsActive
1,kbalan,Root Admin,99,India,true
2,hax0r,Cadet,12,Matrix,false
3,bit_flipper,Synthesizer,45,CyberSpace,true
4,null_pointer,Bug Finder,3,Sandbox,true
5,stack_overflow,Developer,80,Sillicon_Valley,true
`,
  },
  [ToolType.JWT]: {
    // Standard secure dummy JWT with "kbalan" signature
    input: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImtiYWxhbiIsImFkbWluIjp0cnVlLCJpYXQiOjE3ODI0MDAwMDAsImV4cCI6MTgwMTI5NjAwMH0.c2lnbmF0dXJlX3ZhbGlkYXRpb25fZHVtbXlfZGV2X3Rvb2xib3g",
  },
  [ToolType.BASE64]: {
    input: "QmVhdXRpZnkuIENvbXBhcmUuIFZhbGlkYXRlLiBMZXZlbCB1cCEgRnVlbCB0aGUgZGV2ZWxvcGVyIHdpdGggY29mZmVlIGF0IGJ1eW1lYWNvZmZlZS5jb20va2JhbGFu",
  },
  [ToolType.URL_PARSER]: {
    input: "https://buymeacoffee.com/kbalan?user=developer&mode=offline&sound=enabled&theme=amber_crt&layout=compact&level=7&xp=4500",
  },
  [ToolType.SCHEDULE_CALCULATOR]: {
    input: "*/15 9-17 * * 1-5",
  },
  [ToolType.HASH_GENERATOR]: {
    input: "dev_toolbox_top_secret_salt_2026_kbalan",
  },
  [ToolType.TIMESTAMP]: {
    input: "1782624000",
  },
  [ToolType.TECH_GAMES]: {
    input: "SELECT GAME FROM RETRO ARCADE CONSOLE BELOW",
  },
};
