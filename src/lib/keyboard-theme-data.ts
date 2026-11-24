export type KeyboardTheme =
  | "classic" | "mint" | "royal" | "dolch" | "sand" | "scarlet"
  | "gojo" | "sukuna" | "akatsuki" | "eva" | "tanjiro"
  | "goku" | "luffy" | "levi" | "naruto"
  | "vice" | "leonida"
  | "minecraft" | "valorant" | "zelda" | "mario";
export type KeyboardLayout = "qwerty" | "azerty" | "dvorak";

export type SoundPackId =
  | "sample" | "thock"
  | "gojo" | "sukuna" | "akatsuki" | "eva" | "tanjiro"
  | "vice" | "leonida";

export type ThemeGroup = "anime" | "gta" | "games" | "classic";

export interface ThemeTokens {
  case: string;
  base: string;
  /** Second alpha colour. Only used by checkered themes (Tanjiro). */
  baseAlt?: string;
  mod: string;
  accent: string;
  textBase: string;
  textMod: string;
  textAccent: string;
}

export interface ThemeMeta {
  label: string;
  /** Big headline on the home page. */
  title: string;
  tagline: string;
  /** Main glow / UI accent colour. */
  accent: string;
  /** Second glow colour (underglow crossfades between the two). */
  accentB: string;
  group: ThemeGroup;
  sound: SoundPackId;
  /** Playback speed for the sample pack (classic colourways only). */
  sampleRate: number;
  font: "display" | "neon" | "mincho" | "pixel";
  kanji?: string;
  checker?: boolean;
  /** Keycap legend overrides, keyed by KeyboardEvent.code. */
  legends?: Record<string, string>;
}

export const THEMES: Record<KeyboardTheme, ThemeTokens> = {
  classic: {
    case: "#232226", base: "#e4d7d7", mod: "#9b72ff", accent: "#9b72ff",
    textBase: "#4a4a4b", textMod: "#f0f0f0", textAccent: "#ffffff",
  },
  mint: {
    case: "#1b2622", base: "#eaf3ee", mod: "#2f6f56", accent: "#37b787",
    textBase: "#264034", textMod: "#eafaf3", textAccent: "#ffffff",
  },
  royal: {
    case: "#1a1c30", base: "#e2e4f7", mod: "#3c3f8a", accent: "#5b5fef",
    textBase: "#2a2b52", textMod: "#eceefd", textAccent: "#ffffff",
  },
  dolch: {
    case: "#2b241c", base: "#f1e6cf", mod: "#6b5236", accent: "#c98a3f",
    textBase: "#4a3c26", textMod: "#f6ecd9", textAccent: "#2b2115",
  },
  sand: {
    case: "#26221b", base: "#f3ead4", mod: "#8a6f45", accent: "#c9a227",
    textBase: "#4a3c22", textMod: "#f8f1de", textAccent: "#2b2115",
  },
  scarlet: {
    case: "#241416", base: "#e9e2e2", mod: "#5c1a1a", accent: "#d43b34",
    textBase: "#3a2222", textMod: "#f3e4e4", textAccent: "#ffffff",
  },

  // ---- Anime ---------------------------------------------------------
  // Gojo Satoru: Six Eyes cyan, Hollow Purple violet, midnight navy caps.
  gojo: {
    case: "#060914",
    base: "linear-gradient(180deg,#16254a,#0c1630)",
    mod: "linear-gradient(180deg,#201858,#0f0b2e)",
    accent: "linear-gradient(180deg,#6af4ff,#00b8d9)",
    textBase: "#bff4ff", textMod: "#dccbff", textAccent: "#021019",
  },
  // Sukuna: Malevolent Shrine red on blood-black.
  sukuna: {
    case: "#0c0304",
    base: "linear-gradient(180deg,#2a1214,#150709)",
    mod: "linear-gradient(180deg,#44101a,#240609)",
    accent: "linear-gradient(180deg,#ff4040,#b30000)",
    textBase: "#ffa59c", textMod: "#ffe0da", textAccent: "#ffffff",
  },
  // Akatsuki: black cloak, red clouds, cream cloud-outline keys.
  akatsuki: {
    case: "#07070a",
    base: "linear-gradient(180deg,#1d1d24,#101015)",
    mod: "linear-gradient(180deg,#c4141f,#7d0b14)",
    accent: "linear-gradient(180deg,#f6f2e8,#cfc9ba)",
    textBase: "#d9d9e2", textMod: "#ffffff", textAccent: "#8a0f19",
  },
  // Evangelion Unit-01: purple body, green trim, NERV orange.
  eva: {
    case: "#0d0617",
    base: "linear-gradient(180deg,#3f2380,#2a1454)",
    mod: "linear-gradient(180deg,#1f7048,#134a30)",
    accent: "linear-gradient(180deg,#ffa830,#e06a00)",
    textBase: "#d6c4ff", textMod: "#b8ffd2", textAccent: "#1c0d00",
  },
  // Tanjiro: checkered haori caps (green / black), Hinokami flame accents.
  tanjiro: {
    case: "#07120d",
    base: "linear-gradient(180deg,#1f8556,#175f3e)",
    baseAlt: "linear-gradient(180deg,#1c1c1c,#0b0b0b)",
    mod: "linear-gradient(180deg,#2c2c2c,#121212)",
    accent: "linear-gradient(180deg,#ff8a2a,#d9480f)",
    textBase: "#eafff3", textMod: "#ffb067", textAccent: "#ffffff",
  },

  // Goku: Ultra Instinct-ish orange gi, blue undershirt, Super Saiyan gold.
  goku: {
    case: "#070b1a",
    base: "linear-gradient(180deg,#ff9a1f,#e06a00)",
    mod: "linear-gradient(180deg,#1f4fd8,#0f2a7a)",
    accent: "linear-gradient(180deg,#fff27a,#ffc400)",
    textBase: "#2a1200", textMod: "#dbe6ff", textAccent: "#2a1a00",
  },
  // Luffy: straw-hat yellow, red vest, Grand Line blue.
  luffy: {
    case: "#10080a",
    base: "linear-gradient(180deg,#f6d36a,#d9a830)",
    mod: "linear-gradient(180deg,#d62839,#8f1220)",
    accent: "linear-gradient(180deg,#35b6ff,#0a6fbf)",
    textBase: "#3a2600", textMod: "#fff1f1", textAccent: "#00121f",
  },
  // Levi: Survey Corps green cloak, ODM steel, Wings of Freedom.
  levi: {
    case: "#0b0f0c",
    base: "linear-gradient(180deg,#38483c,#222d26)",
    mod: "linear-gradient(180deg,#5b4a35,#3a2e20)",
    accent: "linear-gradient(180deg,#e8ecef,#aab4bb)",
    textBase: "#cfe2d2", textMod: "#f1e3cf", textAccent: "#101418",
  },
  // Naruto: Konoha orange jumpsuit, Rasengan blue, headband steel.
  naruto: {
    case: "#0a0c18",
    base: "linear-gradient(180deg,#ff8a1f,#e0600a)",
    mod: "linear-gradient(180deg,#1a2a5c,#0e1838)",
    accent: "linear-gradient(180deg,#7fd8ff,#1e90ff)",
    textBase: "#2a0f00", textMod: "#d9e8ff", textAccent: "#00101f",
  },

  // ---- GTA VI --------------------------------------------------------
  // Vice City: neon Miami night. Hot pink, electric cyan, purple haze.
  vice: {
    case: "#12001a",
    base: "linear-gradient(180deg,#3d1156,#240636)",
    mod: "linear-gradient(180deg,#ff55ab,#e01a7c)",
    accent: "linear-gradient(180deg,#38f6ff,#00c8dd)",
    textBase: "#ff9ee0", textMod: "#ffffff", textAccent: "#001a1f",
  },
  // Leonida: golden hour. Teal sea, orange sun.
  leonida: {
    case: "#06161b",
    base: "linear-gradient(180deg,#16596a,#0d3a44)",
    mod: "linear-gradient(180deg,#ff9444,#e8631a)",
    accent: "linear-gradient(180deg,#ffd873,#f7b32b)",
    textBase: "#aaf5ea", textMod: "#2a0e00", textAccent: "#2a1600",
  },
  // ---- Games ---------------------------------------------------------
  // Minecraft: grass-green top row, dirt-brown caps, stone mods.
  minecraft: {
    case: "#1a120a",
    base: "linear-gradient(180deg,#8b5a2b,#5e3a1a)",
    mod: "linear-gradient(180deg,#7a7a7a,#4d4d4d)",
    accent: "linear-gradient(180deg,#5dd13a,#2f8f1a)",
    textBase: "#f6e3c4", textMod: "#f1f1f1", textAccent: "#06210a",
  },
  // Valorant: off-white caps, Radiant red, dark slate.
  valorant: {
    case: "#0b0f14",
    base: "linear-gradient(180deg,#ece8e1,#cfc9bf)",
    mod: "linear-gradient(180deg,#1b2530,#0f161d)",
    accent: "linear-gradient(180deg,#ff4655,#c4182a)",
    textBase: "#0f1923", textMod: "#ece8e1", textAccent: "#ffffff",
  },
  // Zelda: Hyrule forest green, Triforce gold, Sheikah blue.
  zelda: {
    case: "#07140e",
    base: "linear-gradient(180deg,#2e6b45,#1b4630)",
    mod: "linear-gradient(180deg,#e3c568,#b8922e)",
    accent: "linear-gradient(180deg,#7ff0ff,#1db2d6)",
    textBase: "#e6f7d4", textMod: "#2a1f00", textAccent: "#001a20",
  },
  // Mario: cap red, overalls blue, coin yellow.
  mario: {
    case: "#0a1020",
    base: "linear-gradient(180deg,#e8352e,#ac1712)",
    mod: "linear-gradient(180deg,#2d5be0,#1a37a0)",
    accent: "linear-gradient(180deg,#ffe14d,#f5b800)",
    textBase: "#fff2f0", textMod: "#eaf0ff", textAccent: "#2a1c00",
  },
};

export const THEME_META: Record<KeyboardTheme, ThemeMeta> = {
  classic: {
    label: "Classic", title: "Classic", group: "classic", sound: "sample", sampleRate: 1,
    tagline: "Clean mechanical keys with a classic click.",
    accent: "#9b72ff", accentB: "#9b72ff", font: "display",
  },
  mint: {
    label: "Mint", title: "Mint", group: "classic", sound: "sample", sampleRate: 1.08,
    tagline: "Soft green caps, bright and light click.",
    accent: "#37b787", accentB: "#37b787", font: "display",
  },
  royal: {
    label: "Royal", title: "Royal", group: "classic", sound: "sample", sampleRate: 1,
    tagline: "Deep indigo caps with a steady click.",
    accent: "#5b5fef", accentB: "#5b5fef", font: "display",
  },
  dolch: {
    label: "Dolch", title: "Dolch", group: "classic", sound: "sample", sampleRate: 1,
    tagline: "Beige and brown, the old-school workstation look.",
    accent: "#c98a3f", accentB: "#c98a3f", font: "display",
  },
  sand: {
    label: "Sand", title: "Sand", group: "classic", sound: "sample", sampleRate: 1,
    tagline: "Warm sand caps with a golden accent.",
    accent: "#c9a227", accentB: "#c9a227", font: "display",
  },
  scarlet: {
    label: "Scarlet", title: "Scarlet", group: "classic", sound: "sample", sampleRate: 0.94,
    tagline: "Dark red caps with a deeper click.",
    accent: "#d43b34", accentB: "#d43b34", font: "display",
  },

  gojo: {
    label: "Gojo", title: "Gojo", group: "anime", sound: "gojo", sampleRate: 1,
    tagline: "Six Eyes cyan, Hollow Purple underglow, crystal-chime keys.",
    accent: "#00e5ff", accentB: "#a855ff", font: "mincho",
    kanji: "無下限呪術",
    legends: { Escape: "∞", Enter: "紫", Space: "六眼" },
  },
  sukuna: {
    label: "Sukuna", title: "Sukuna", group: "anime", sound: "sukuna", sampleRate: 1,
    tagline: "Malevolent Shrine red. Every key lands like a slash.",
    accent: "#ff2a2a", accentB: "#ff7a1a", font: "mincho",
    kanji: "伏魔御廚子",
    legends: { Escape: "呪", Enter: "解", Delete: "捌", Space: "両面宿儺" },
  },
  akatsuki: {
    label: "Akatsuki", title: "Akatsuki", group: "anime", sound: "akatsuki", sampleRate: 1,
    tagline: "Crimson cloud caps with kunai-metal clicks.",
    accent: "#e11d2e", accentB: "#ff5c6a", font: "mincho",
    kanji: "暁",
    legends: { Escape: "暁", Enter: "雲", Space: "暁" },
  },
  eva: {
    label: "Eva-01", title: "Eva-01", group: "anime", sound: "eva", sampleRate: 1,
    tagline: "Unit-01 purple and green with terminal beeps.",
    accent: "#ff9a1f", accentB: "#39ff88", font: "mincho",
    kanji: "新世紀",
    legends: { Escape: "01", Enter: "起動", Space: "EVA-01" },
  },
  tanjiro: {
    label: "Tanjiro", title: "Tanjiro", group: "anime", sound: "tanjiro", sampleRate: 1,
    tagline: "Checkered haori caps and bamboo-wood taps.",
    accent: "#ff7a1a", accentB: "#2fbf7f", font: "mincho",
    kanji: "水の呼吸",
    checker: true,
    legends: { Escape: "水", Enter: "日", Space: "全集中" },
  },

  goku: {
    label: "Goku", title: "Goku", group: "anime", sound: "akatsuki", sampleRate: 1.05,
    tagline: "Super Saiyan gold aura, orange gi caps, ki-blast clicks.",
    accent: "#ffc400", accentB: "#2f7bff", font: "mincho",
    kanji: "龍珠",
    legends: { Escape: "気", Enter: "界王拳", Space: "かめはめ波" },
  },
  luffy: {
    label: "Luffy", title: "Luffy", group: "anime", sound: "tanjiro", sampleRate: 1.1,
    tagline: "Straw-hat gold, Grand Line blue, rubber-snap keys.",
    accent: "#ffcf3a", accentB: "#35b6ff", font: "mincho",
    kanji: "海賊王",
    legends: { Escape: "麦", Enter: "ギア5", Space: "海賊王" },
  },
  levi: {
    label: "Levi", title: "Levi", group: "anime", sound: "akatsuki", sampleRate: 0.95,
    tagline: "Survey Corps green and ODM steel. Clean, sharp, precise.",
    accent: "#c9d3d9", accentB: "#4f8a5e", font: "mincho",
    kanji: "自由の翼",
    legends: { Escape: "翼", Enter: "斬", Space: "調査兵団" },
  },
  naruto: {
    label: "Naruto", title: "Naruto", group: "anime", sound: "gojo", sampleRate: 1.1,
    tagline: "Konoha orange, Rasengan blue chime, never-give-up keys.",
    accent: "#ff8a1f", accentB: "#4db8ff", font: "mincho",
    kanji: "火影",
    legends: { Escape: "火", Enter: "螺旋丸", Space: "影分身" },
  },

  vice: {
    label: "Vice City", title: "Vice City", group: "gta", sound: "vice", sampleRate: 1,
    tagline: "Neon Miami nights: hot pink, electric cyan, synth plucks.",
    accent: "#ff2d95", accentB: "#00f0ff", font: "neon",
    legends: { Escape: "VI", Space: "vice city" },
  },
  leonida: {
    label: "Leonida", title: "Leonida", group: "gta", sound: "leonida", sampleRate: 1,
    tagline: "Golden-hour Leonida: teal sea, orange sun, kalimba keys.",
    accent: "#ff9f43", accentB: "#2ee6c8", font: "neon",
    legends: { Escape: "LE", Space: "leonida" },
  },
  minecraft: {
    label: "Minecraft", title: "Minecraft", group: "games", sound: "tanjiro", sampleRate: 0.9,
    tagline: "Dirt, stone and grass blocks. Every key is a block break.",
    accent: "#5dd13a", accentB: "#c8935a", font: "pixel",
    legends: { Escape: "ESC", Space: "CRAFT" },
  },
  valorant: {
    label: "Valorant", title: "Valorant", group: "games", sound: "eva", sampleRate: 1.15,
    tagline: "Radiant red on slate. Tactical, crisp, ready to clutch.",
    accent: "#ff4655", accentB: "#ece8e1", font: "display",
    legends: { Escape: "VAL", Space: "PLANT" },
  },
  zelda: {
    label: "Zelda", title: "Zelda", group: "games", sound: "leonida", sampleRate: 1.2,
    tagline: "Hyrule green, Triforce gold, Sheikah-blue chimes.",
    accent: "#e3c568", accentB: "#7ff0ff", font: "mincho",
    kanji: "神々のトライフォース",
    legends: { Escape: "△", Space: "HYRULE" },
  },
  mario: {
    label: "Mario", title: "Mario", group: "games", sound: "vice", sampleRate: 1.3,
    tagline: "Red cap, blue overalls, coin-bright arcade keys.",
    accent: "#ffe14d", accentB: "#e8352e", font: "pixel",
    legends: { Escape: "1UP", Space: "JUMP" },
  },
};

export const THEME_GROUPS: { id: ThemeGroup; label: string; ids: KeyboardTheme[] }[] = [
  { id: "anime", label: "Anime", ids: ["gojo", "sukuna", "akatsuki", "eva", "tanjiro", "goku", "luffy", "levi", "naruto"] },
  { id: "gta", label: "GTA VI", ids: ["vice", "leonida"] },
  { id: "games", label: "Games", ids: ["minecraft", "valorant", "zelda", "mario"] },
  { id: "classic", label: "Classic", ids: ["classic", "mint", "royal", "dolch", "sand", "scarlet"] },
];

export const KEYBOARD_THEMES = Object.keys(THEMES) as KeyboardTheme[];

export const THEME_LABELS = Object.fromEntries(
  KEYBOARD_THEMES.map((id) => [id, THEME_META[id].label]),
) as Record<KeyboardTheme, string>;

export const THEME_ACCENTS = Object.fromEntries(
  KEYBOARD_THEMES.map((id) => [id, THEME_META[id].accent]),
) as Record<KeyboardTheme, string>;

export const SOUND_PACKS: { id: SoundPackId; label: string }[] = [
  { id: "sample", label: "Click" },
  { id: "thock", label: "Deep thock" },
  { id: "gojo", label: "Crystal" },
  { id: "sukuna", label: "Slash" },
  { id: "akatsuki", label: "Kunai" },
  { id: "eva", label: "MAGI beep" },
  { id: "tanjiro", label: "Bamboo" },
  { id: "vice", label: "Synth" },
  { id: "leonida", label: "Kalimba" },
];

/** Pick black or white text for a given #rrggbb background. */
export function readableOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#08080c" : "#ffffff";
}

export const LAYOUT_MAPS: Record<KeyboardLayout, Record<string, string>> = {
  qwerty: {},
  azerty: {
    Backquote: "²", Digit1: "&", Digit2: "é", Digit3: "\"", Digit4: "'", Digit5: "(",
    Digit6: "-", Digit7: "è", Digit8: "_", Digit9: "ç", Digit0: "à", Minus: ")", Equal: "=",
    KeyQ: "A", KeyW: "Z", KeyA: "Q", KeyZ: "W", KeyM: ",", Semicolon: "M",
    BracketLeft: "^", BracketRight: "$", Backslash: "*", Quote: "ù",
    KeyE: "E", KeyR: "R", KeyT: "T", KeyY: "Y", KeyU: "U", KeyI: "I", KeyO: "O", KeyP: "P",
    KeyS: "S", KeyD: "D", KeyF: "F", KeyG: "G", KeyH: "H", KeyJ: "J", KeyK: "K", KeyL: "L",
    KeyX: "X", KeyC: "C", KeyV: "V", KeyB: "B", KeyN: "N", Comma: ";", Period: ":", Slash: "!",
  },
  dvorak: {
    KeyQ: "'", KeyW: ",", KeyE: ".", KeyR: "P", KeyT: "Y", KeyY: "F", KeyU: "G",
    KeyI: "C", KeyO: "R", KeyP: "L", KeyA: "A", KeyS: "O", KeyD: "E", KeyF: "U",
    KeyG: "I", KeyH: "D", KeyJ: "H", KeyK: "T", KeyL: "N", KeyZ: ";", KeyX: "Q",
    KeyC: "J", KeyV: "K", KeyB: "X", KeyN: "B", KeyM: "M", Minus: "[", Equal: "]",
    BracketLeft: "/", BracketRight: "=", Backslash: "\\", Semicolon: "S",
    Quote: "-", Comma: "W", Period: "V", Slash: "Z",
  },
};

export const KEYBOARD_LAYOUTS: KeyboardLayout[] = ["qwerty", "azerty", "dvorak"];
