import {
  memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode,
} from "react";
import {
  SunDim, Sun, LayoutGrid, Search, Mic, Moon, Rewind, Play, FastForward,
  VolumeX, Volume1, Volume2, Hash, Lightbulb, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight,
} from "lucide-react";

import { THEMES, THEME_META, LAYOUT_MAPS } from "../../lib/keyboard-theme-data";
import type {
  KeyboardTheme, KeyboardLayout, SoundPackId, ThemeMeta,
} from "../../lib/keyboard-theme-data";
import { keySounds } from "../../lib/sound-engine";
import { haptic, type HapticLevel } from "../../lib/haptics";
export type { KeyboardTheme, KeyboardLayout, SoundPackId } from "../../lib/keyboard-theme-data";

export type KeyColor = "base" | "mod" | "accent";
export type KeyAlign = "tl" | "c";
interface KeyDef {
  label: string;
  code: string;
  width: string;
  color: KeyColor;
  align: KeyAlign;
  icon?: ReactNode;
  /** Second alpha colour (checkered themes). */
  alt?: boolean;
}

export type InteractionSource = "physical" | "mouse" | "touch";
export type InteractionPhase = "down" | "up";
export type PreviewAlign = "start" | "center";

export interface KeyboardInteractionEvent {
  code: string;
  phase: InteractionPhase;
  source: InteractionSource;
  shiftKey: boolean;
}

export interface KeyboardProps {
  theme?: KeyboardTheme;
  layout?: KeyboardLayout;
  enableSound?: boolean;
  enableHaptics?: boolean;
  hapticLevel?: HapticLevel;
  /** "auto" follows the theme's own sound pack. */
  soundPack?: SoundPackId | "auto";
  /** 0 to 1. */
  volume?: number;
  /** Sample used by the "Click" pack. */
  soundUrl?: string;
  className?: string;
  align?: PreviewAlign;
  scale?: number;
  /** Shrink the keyboard to fit narrow screens. Default true. */
  fit?: boolean;
  onKeyEvent?: (event: KeyboardInteractionEvent) => void;
}

const BASE_ROWS: KeyDef[][] = [
  [
    { label: "esc", code: "Escape", width: "45px", color: "accent", align: "tl" },
    { label: "F1", icon: <SunDim size={12} />, code: "F1", width: "40px", color: "base", align: "c" },
    { label: "F2", icon: <Sun size={12} />, code: "F2", width: "40px", color: "base", align: "c" },
    { label: "F3", icon: <LayoutGrid size={12} />, code: "F3", width: "40px", color: "base", align: "c" },
    { label: "F4", icon: <Search size={11} />, code: "F4", width: "40px", color: "base", align: "c" },
    { label: "F5", icon: <Mic size={11} />, code: "F5", width: "40px", color: "mod", align: "c" },
    { label: "F6", icon: <Moon size={11} />, code: "F6", width: "40px", color: "mod", align: "c" },
    { label: "F7", icon: <Rewind size={11} />, code: "F7", width: "40px", color: "mod", align: "c" },
    { label: "F8", icon: <Play size={11} />, code: "F8", width: "40px", color: "mod", align: "c" },
    { label: "F9", icon: <FastForward size={11} />, code: "F9", width: "40px", color: "mod", align: "c" },
    { label: "F10", icon: <VolumeX size={11} />, code: "F10", width: "40px", color: "base", align: "c" },
    { label: "F11", icon: <Volume1 size={11} />, code: "F11", width: "40px", color: "base", align: "c" },
    { label: "F12", icon: <Volume2 size={11} />, code: "F12", width: "40px", color: "base", align: "c" },
    { label: "", icon: <Hash size={10} />, code: "F13", width: "40px", color: "mod", align: "tl" },
    { label: "del", code: "Delete", width: "45px", color: "mod", align: "tl" },
    { label: "", icon: <Lightbulb size={10} />, code: "Insert", width: "45px", color: "mod", align: "tl" },
  ],
  [
    { label: "~\n`", code: "Backquote", width: "40px", color: "base", align: "tl" },
    { label: "!\n1", code: "Digit1", width: "40px", color: "base", align: "tl" },
    { label: "@\n2", code: "Digit2", width: "40px", color: "base", align: "tl" },
    { label: "#\n3", code: "Digit3", width: "40px", color: "base", align: "tl" },
    { label: "$\n4", code: "Digit4", width: "40px", color: "base", align: "tl" },
    { label: "%\n5", code: "Digit5", width: "40px", color: "base", align: "tl" },
    { label: "^\n6", code: "Digit6", width: "40px", color: "base", align: "tl" },
    { label: "&\n7", code: "Digit7", width: "40px", color: "base", align: "tl" },
    { label: "*\n8", code: "Digit8", width: "40px", color: "base", align: "tl" },
    { label: "(\n9", code: "Digit9", width: "40px", color: "base", align: "tl" },
    { label: ")\n0", code: "Digit0", width: "40px", color: "base", align: "tl" },
    { label: "_\n-", code: "Minus", width: "40px", color: "base", align: "tl" },
    { label: "+\n=", code: "Equal", width: "40px", color: "base", align: "tl" },
    { label: "backspace\n←", code: "Backspace", width: "96px", color: "mod", align: "tl" },
    { label: "pgup", code: "PageUp", width: "40px", color: "mod", align: "tl" },
  ],
  [
    { label: "tab", code: "Tab", width: "68px", color: "mod", align: "tl" },
    { label: "Q", code: "KeyQ", width: "40px", color: "base", align: "tl" },
    { label: "W", code: "KeyW", width: "40px", color: "base", align: "tl" },
    { label: "E", code: "KeyE", width: "40px", color: "base", align: "tl" },
    { label: "R", code: "KeyR", width: "40px", color: "base", align: "tl" },
    { label: "T", code: "KeyT", width: "40px", color: "base", align: "tl" },
    { label: "Y", code: "KeyY", width: "40px", color: "base", align: "tl" },
    { label: "U", code: "KeyU", width: "40px", color: "base", align: "tl" },
    { label: "I", code: "KeyI", width: "40px", color: "base", align: "tl" },
    { label: "O", code: "KeyO", width: "40px", color: "base", align: "tl" },
    { label: "P", code: "KeyP", width: "40px", color: "base", align: "tl" },
    { label: "{\n[", code: "BracketLeft", width: "40px", color: "base", align: "tl" },
    { label: "}\n]", code: "BracketRight", width: "40px", color: "base", align: "tl" },
    { label: "|\n\\", code: "Backslash", width: "68px", color: "base", align: "tl" },
    { label: "pgdn", code: "PageDown", width: "40px", color: "mod", align: "tl" },
  ],
  [
    { label: "caps lock", code: "CapsLock", width: "83px", color: "mod", align: "tl" },
    { label: "A", code: "KeyA", width: "40px", color: "base", align: "tl" },
    { label: "S", code: "KeyS", width: "40px", color: "base", align: "tl" },
    { label: "D", code: "KeyD", width: "40px", color: "base", align: "tl" },
    { label: "F", code: "KeyF", width: "40px", color: "base", align: "tl" },
    { label: "G", code: "KeyG", width: "40px", color: "base", align: "tl" },
    { label: "H", code: "KeyH", width: "40px", color: "base", align: "tl" },
    { label: "J", code: "KeyJ", width: "40px", color: "base", align: "tl" },
    { label: "K", code: "KeyK", width: "40px", color: "base", align: "tl" },
    { label: "L", code: "KeyL", width: "40px", color: "base", align: "tl" },
    { label: ":\n;", code: "Semicolon", width: "40px", color: "base", align: "tl" },
    { label: "\"\n'", code: "Quote", width: "40px", color: "base", align: "tl" },
    { label: "return", code: "Enter", width: "95px", color: "accent", align: "tl" },
    { label: "home", code: "Home", width: "40px", color: "mod", align: "tl" },
  ],
  [
    { label: "shift", code: "ShiftLeft", width: "100px", color: "mod", align: "tl" },
    { label: "Z", code: "KeyZ", width: "40px", color: "base", align: "tl" },
    { label: "X", code: "KeyX", width: "40px", color: "base", align: "tl" },
    { label: "C", code: "KeyC", width: "40px", color: "base", align: "tl" },
    { label: "V", code: "KeyV", width: "40px", color: "base", align: "tl" },
    { label: "B", code: "KeyB", width: "40px", color: "base", align: "tl" },
    { label: "N", code: "KeyN", width: "40px", color: "base", align: "tl" },
    { label: "M", code: "KeyM", width: "40px", color: "base", align: "tl" },
    { label: "<\n,", code: "Comma", width: "40px", color: "base", align: "tl" },
    { label: ">\n.", code: "Period", width: "40px", color: "base", align: "tl" },
    { label: "?\n/", code: "Slash", width: "40px", color: "base", align: "tl" },
    { label: "shift", code: "ShiftRight", width: "78px", color: "mod", align: "tl" },
    { label: "", icon: <ChevronUp size={16} />, code: "ArrowUp", width: "40px", color: "base", align: "c" },
    { label: "end", code: "End", width: "40px", color: "mod", align: "tl" },
  ],
  [
    { label: "ctrl", code: "ControlLeft", width: "51px", color: "mod", align: "tl" },
    { label: "option", code: "AltLeft", width: "51px", color: "mod", align: "tl" },
    { label: "⌘", code: "MetaLeft", width: "51px", color: "mod", align: "tl" },
    { label: "", code: "Space", width: "271px", color: "base", align: "c" },
    { label: "⌘", code: "MetaRight", width: "40px", color: "mod", align: "tl" },
    { label: "fn", code: "Fn", width: "40px", color: "mod", align: "tl" },
    { label: "ctrl", code: "ControlRight", width: "40px", color: "mod", align: "tl" },
    { label: "", icon: <ChevronLeft size={16} />, code: "ArrowLeft", width: "40px", color: "base", align: "c" },
    { label: "", icon: <ChevronDown size={16} />, code: "ArrowDown", width: "40px", color: "base", align: "c" },
    { label: "", icon: <ChevronRight size={16} />, code: "ArrowRight", width: "40px", color: "base", align: "c" },
  ],
];

function buildRows(layout: KeyboardLayout, meta: ThemeMeta): KeyDef[][] {
  const map = LAYOUT_MAPS[layout] ?? {};
  return BASE_ROWS.map((row, ri) =>
    row.map((key, ci) => {
      let next: KeyDef = key;
      const mapped = map[key.code];
      if (mapped) next = { ...next, label: mapped };
      const legend = meta.legends?.[key.code];
      if (legend) {
        const join = key.code === "Enter" || key.code === "Delete";
        next = { ...next, label: join ? `${legend} ${key.label}` : legend };
      }
      if (meta.checker && key.color === "base" && (ri + ci) % 2 === 1) {
        next = { ...next, alt: true };
      }
      return next;
    }),
  );
}

const KEY_FONT = '"Inter","Noto Sans JP","Hiragino Sans","Yu Gothic",sans-serif';
const FKEY_RE = /^F([1-9]|1[0-2])$/;
const PREVENT_DEFAULT = new Set([
  "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "PageUp", "PageDown", "Home", "End",
]);

interface KeyCapProps {
  k: KeyDef;
  bg: string;
  fg: string;
  pressed: boolean;
  neon: boolean;
  onDown: (code: string, source: InteractionSource) => void;
  onUp: (code: string, source: InteractionSource) => void;
}

const KeyCap = memo(function KeyCap({ k, bg, fg, pressed, neon, onDown, onUp }: KeyCapProps) {
  const isFKey = FKEY_RE.test(k.code);
  const bigGlyph = k.label.length === 1 && /[^\x00-\x7f]/.test(k.label);

  const baseShadow = pressed
    ? "inset -1px 0 1px rgba(0,0,0,.15), inset 0 -2px 2px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.6), 1px 2px 4px rgba(0,0,0,.25)"
    : "inset -2px 0 2px rgba(0,0,0,.2), inset 0 -3px 3px rgba(0,0,0,.3), 0 0 0 1px rgba(0,0,0,.6), 2px 5px 8px rgba(0,0,0,.28)";

  const style: CSSProperties = {
    width: k.width,
    flexShrink: 0,
    background: bg,
    transform: pressed ? "translateY(2px)" : "none",
    boxShadow: neon ? undefined : baseShadow,
    touchAction: "manipulation",
  };

  const faceStyle: CSSProperties = {
    position: "absolute",
    top: pressed ? "3px" : "2px",
    left: "3px",
    right: "6px",
    bottom: pressed ? "6px" : "8px",
    borderRadius: "4px",
    background: bg,
    boxShadow: neon
      ? "inset 0 0 6px color-mix(in srgb, var(--neon-accent) 15%, transparent)"
      : "-2px -2px 3px rgba(255,255,255,0.05), 2px 2px 3px rgba(0,0,0,0.1)",
    borderLeft: neon ? "1px solid color-mix(in srgb, var(--neon-accent) 25%, transparent)" : "1px solid rgba(255,255,255,0.08)",
    borderBottom: "1px solid rgba(0,0,0,0.15)",
    borderTop: neon ? "1px solid color-mix(in srgb, var(--neon-accent) 35%, transparent)" : "1px solid rgba(255,255,255,0.15)",
  };

  const classes = [
    "relative inline-flex rounded-[6px] h-[40px] select-none cursor-pointer",
    neon ? "key-neon" : "overflow-hidden",
    pressed ? "key-pressed" : "",
    k.color === "accent" ? "key-accent" : "",
    k.color === "mod" ? "key-mod" : "",
  ].filter(Boolean).join(" ");

  const source = (e: ReactPointerEvent): InteractionSource => (e.pointerType === "mouse" ? "mouse" : "touch");

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label={k.label || k.code}
      onPointerDown={(e) => { e.preventDefault(); onDown(k.code, source(e)); }}
      onPointerUp={(e) => onUp(k.code, source(e))}
      onPointerCancel={(e) => onUp(k.code, source(e))}
      onPointerLeave={(e) => { if (pressed) onUp(k.code, source(e)); }}
      style={style}
      className={classes}
    >
      <div aria-hidden="true" style={faceStyle} />
      <div
        className={`relative z-[1] flex flex-col w-full h-full font-medium leading-[1.15] whitespace-pre-wrap pointer-events-none ${
          k.align === "c" ? "items-center justify-center p-1 text-center" : "items-start justify-start px-[7px] py-[5px] text-left"
        } ${isFKey ? "-translate-y-[2px]" : ""}`}
        style={{
          color: fg,
          fontFamily: KEY_FONT,
          fontSize: bigGlyph ? "15px" : "10px",
          textShadow: neon ? "0 0 6px color-mix(in srgb, var(--neon-accent) 70%, transparent)" : undefined,
        }}
      >
        {k.icon && <span className="mb-[2px]">{k.icon}</span>}
        {k.label && (
          <span className={k.icon ? "text-[8.5px] opacity-90 mt-[1px]" : ""}>{k.label}</span>
        )}
      </div>
    </div>
  );
});

function isEditableTarget() {
  const el = document.activeElement;
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export default function Keyboard({
  theme = "classic",
  layout = "qwerty",
  enableSound = true,
  enableHaptics = true,
  hapticLevel = "medium",
  soundPack = "auto",
  volume = 0.8,
  soundUrl = "/sounds/click.ogg",
  className = "",
  align = "center",
  scale = 1,
  fit = true,
  onKeyEvent,
}: KeyboardProps) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(() => new Set());
  const activeRef = useRef<Set<string>>(new Set());
  const outerRef = useRef<HTMLDivElement>(null);
  const natRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0, fit: 1 });

  const t = THEMES[theme] ?? THEMES.classic;
  const meta = THEME_META[theme] ?? THEME_META.classic;
  const neon = meta.group !== "classic";
  const pack: SoundPackId = soundPack === "auto" ? meta.sound : soundPack;

  // Latest props, read by the stable press/release handlers below.
  const cfgRef = useRef({ enableSound, enableHaptics, hapticLevel, pack, sampleRate: meta.sampleRate, onKeyEvent });
  useEffect(() => {
    cfgRef.current = { enableSound, enableHaptics, hapticLevel, pack, sampleRate: meta.sampleRate, onKeyEvent };
  }, [enableSound, enableHaptics, hapticLevel, pack, meta.sampleRate, onKeyEvent]);

  useEffect(() => { keySounds.setVolume(volume); }, [volume]);
  useEffect(() => { if (enableSound) keySounds.loadSample(soundUrl); }, [enableSound, soundUrl]);

  // Fit the keyboard to the width of its container (no sideways scrolling on phones).
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const nat = natRef.current;
    if (!outer || !nat) return;
    const parent = outer.parentElement ?? outer;
    const measure = () => {
      const w = nat.offsetWidth;
      const h = nat.offsetHeight;
      const avail = parent.clientWidth;
      const f = fit && avail > 0 && w > 0 ? Math.min(1, (avail - 4) / w) : 1;
      setNatural((prev) =>
        prev.w === w && prev.h === h && Math.abs(prev.fit - f) < 0.001 ? prev : { w, h, fit: f },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    ro.observe(nat);
    return () => ro.disconnect();
  }, [fit]);

  const pressKey = useCallback((code: string, source: InteractionSource = "physical", shiftKey = false) => {
    if (source !== "physical" && activeRef.current.has(code)) return;
    activeRef.current.add(code);
    setActiveKeys(new Set(activeRef.current));
    const cfg = cfgRef.current;
    if (cfg.enableSound) keySounds.play(cfg.pack, code, "down", cfg.sampleRate);
    if (cfg.enableHaptics) haptic(code, cfg.hapticLevel);
    cfg.onKeyEvent?.({ code, phase: "down", source, shiftKey });
  }, []);

  const releaseKey = useCallback((code: string, source: InteractionSource = "physical", shiftKey = false) => {
    if (!activeRef.current.has(code)) return;
    activeRef.current.delete(code);
    setActiveKeys(new Set(activeRef.current));
    const cfg = cfgRef.current;
    if (cfg.enableSound) keySounds.play(cfg.pack, code, "up", cfg.sampleRate);
    cfg.onKeyEvent?.({ code, phase: "up", source, shiftKey });
  }, []);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isEditableTarget()) return;
      if (PREVENT_DEFAULT.has(e.code) && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
      pressKey(e.code, "physical", e.shiftKey);
    };
    const handleUp = (e: KeyboardEvent) => {
      if (isEditableTarget()) return;
      releaseKey(e.code, "physical", e.shiftKey);
    };
    // A key released while the tab was in the background never sends keyup.
    const handleBlur = () => {
      activeRef.current.clear();
      setActiveKeys(new Set());
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [pressKey, releaseKey]);

  const onCapDown = useCallback((code: string, source: InteractionSource) => pressKey(code, source), [pressKey]);
  const onCapUp = useCallback((code: string, source: InteractionSource) => releaseKey(code, source), [releaseKey]);

  const rows = useMemo(() => buildRows(layout, meta), [layout, meta]);

  const colorFor = (k: KeyDef): { bg: string; fg: string } => {
    if (k.color === "accent") return { bg: t.accent, fg: t.textAccent };
    if (k.color === "mod") return { bg: t.mod, fg: t.textMod };
    return { bg: k.alt && t.baseAlt ? t.baseAlt : t.base, fg: t.textBase };
  };

  const s = natural.fit * scale;
  const sized = natural.w > 0;

  const outerStyle: CSSProperties = {
    width: sized ? natural.w * s : undefined,
    height: sized ? natural.h * s : undefined,
    marginLeft: align === "center" ? "auto" : undefined,
    marginRight: align === "center" ? "auto" : undefined,
    ...(neon
      ? ({ ["--neon-accent" as string]: meta.accent, ["--neon-b" as string]: meta.accentB } as CSSProperties)
      : {}),
  };

  return (
    <div ref={outerRef} style={outerStyle} className="kb-outer">
      <div
        ref={natRef}
        className="kb-scaler"
        style={{ transform: `scale(${s})`, transformOrigin: "top left", width: "max-content", position: "relative" }}
      >
        {neon && (
          <div className="underglow" aria-hidden="true">
            <i className="ug-a" />
            <i className="ug-b" />
          </div>
        )}
        <div
          className={`keyboard-frame p-2 rounded-[14px] shadow-inner border flex flex-col gap-[1.5px] relative ${className} ${
            neon ? "keyboard-neon" : ""
          }`}
          style={{
            background: t.case,
            borderColor: neon ? undefined : "rgba(255,255,255,0.06)",
          }}
        >
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex gap-[1.5px] w-max ${align === "start" ? "justify-start" : "justify-center"}`}
            >
              {row.map((k) => {
                const { bg, fg } = colorFor(k);
                return (
                  <KeyCap
                    key={k.code}
                    k={k}
                    bg={bg}
                    fg={fg}
                    pressed={activeKeys.has(k.code)}
                    neon={neon}
                    onDown={onCapDown}
                    onUp={onCapUp}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
