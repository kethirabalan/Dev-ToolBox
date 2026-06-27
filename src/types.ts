export enum ToolType {
  BEAUTIFY = "BEAUTIFY",
  COMPARE = "COMPARE",
  VALIDATOR = "VALIDATOR",
  YAML = "YAML",
  TOML = "TOML",
  XML = "XML",
  CSV = "CSV",
  JWT = "JWT",
  BASE64 = "BASE64",
  URL_PARSER = "URL_PARSER",
  SCHEDULE_CALCULATOR = "SCHEDULE_CALCULATOR",
  HASH_GENERATOR = "HASH_GENERATOR",
  TECH_GAMES = "TECH_GAMES",
  TIMESTAMP = "TIMESTAMP"
}

export interface ThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  terminalBg: string;
  textClass: string;
  accentClass: string;
  accentBorder: string;
  glowColor: string;
  primaryColor: string;
  secondaryColor: string;
  mutedColor: string;
  shadowClass: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export interface ToolStats {
  beautifyCount: number;
  compareCount: number;
  validatorCount: number;
  yamlCount: number;
  tomlCount: number;
  xmlCount: number;
  csvCount: number;
  jwtCount: number;
  base64Count: number;
  urlCount: number;
  scheduleCount: number;
  hashCount: number;
  gamesPlayed?: number;
  regexSolved?: number;
  timestampCount?: number;
}

export interface UserProgress {
  level: number;
  xp: number;
  xpForNextLevel: number;
  totalXp: number;
  stats: ToolStats;
  achievements: Achievement[];
  streak: number;
  lastActiveDate?: string;
  dailyQuestCompleted: boolean;
  soundEnabled: boolean;
  crtEnabled: boolean;
}

export interface DailyQuest {
  id: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  completed: boolean;
}
