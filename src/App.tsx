import { useState, useCallback, useEffect, useRef, type CSSProperties, type ReactNode, type SVGProps } from "react";
import Keyboard, {
  type KeyboardTheme,
  type KeyboardLayout,
  type KeyboardInteractionEvent,
  type SoundPackId,
} from "./components/ui/keyboard";
import {
  KEYBOARD_THEMES,
  KEYBOARD_LAYOUTS,
  THEME_GROUPS,
  THEME_META,
  SOUND_PACKS,
  readableOn,
} from "./lib/keyboard-theme-data";
import LastKey, { type LastKeyEvent } from "./components/ui/last-key";
import Stage from "./components/Stage";
import SpeedTest from "./components/SpeedTest";
import { useSiteMode } from "./lib/site-mode";
import { haptic, hapticsSupported, HAPTIC_LEVELS, type HapticLevel } from "./lib/haptics";
import { Sun, Moon, Volume2, VolumeX, Maximize2, X, Share2, Timer } from "lucide-react";

function GithubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.807 5.624-5.48 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/** useState that survives a page reload. */
function usePersisted<T extends string | number | boolean>(
  key: string,
  initial: T,
  isValid: (v: unknown) => boolean,
): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) return parsed as T;
      }
    } catch { /* storage blocked or corrupt: use the default */ }
    return initial;
  });
  const set = useCallback((v: T) => {
    setValue(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
  }, [key]);
  return [value, set];
}

interface ChipProps {
  active: boolean;
  accent: string;
  onClick: () => void;
  children: ReactNode;
  dot?: string;
  title?: string;
}

function Chip({ active, accent, onClick, children, dot, title }: ChipProps) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={(e) => { onClick(); e.currentTarget.blur(); }}
      className={`chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium ${
        active
          ? ""
          : "bg-[var(--panel-2)] text-[var(--text-dim)] hover:bg-[var(--border)] hover:text-[var(--text)]"
      }`}
      style={
        active
          ? { background: accent, color: readableOn(accent), boxShadow: `0 0 18px ${accent}66` }
          : undefined
      }
    >
      {dot && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: dot, boxShadow: active ? "none" : `0 0 6px ${dot}` }}
        />
      )}
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[84px_1fr] sm:items-start">
      <p className="pt-1.5 text-[12px] font-medium text-[var(--text-mute)] sm:text-left">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}


/** True on phones and tablets (touch is the main input). */
const IS_TOUCH =
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;

/** Tracks whether the screen is currently taller than it is wide. */
function usePortrait(): boolean {
  const q = "(orientation: portrait)";
  const [p, setP] = useState(() => (typeof window !== "undefined" ? window.matchMedia(q).matches : true));
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setP(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return p;
}

/** Theme from a shared link (?theme=goku), if valid. */
function themeFromUrl(): KeyboardTheme | null {
  try {
    const t = new URLSearchParams(window.location.search).get("theme");
    return t && (KEYBOARD_THEMES as string[]).includes(t) ? (t as KeyboardTheme) : null;
  } catch {
    return null;
  }
}

const THEME_ORDER: KeyboardTheme[] = THEME_GROUPS.flatMap((g) => g.ids);

/** Horizontal swipe detector for touch screens. */
function useSwipe(onLeft: () => void, onRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const s0 = start.current;
      start.current = null;
      if (!s0) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s0.x;
      const dy = t.clientY - s0.y;
      if (Math.abs(dx) > 60 && Math.abs(dy) < 45) (dx < 0 ? onLeft : onRight)();
    },
  };
}

const isTheme = (v: unknown) => typeof v === "string" && (KEYBOARD_THEMES as string[]).includes(v);
const isLayout = (v: unknown) => typeof v === "string" && (KEYBOARD_LAYOUTS as string[]).includes(v);
const isPack = (v: unknown) =>
  v === "auto" || (typeof v === "string" && SOUND_PACKS.some((p) => p.id === v));
const isVolume = (v: unknown) => typeof v === "number" && v >= 0 && v <= 1;
const isHapticLevel = (v: unknown) => typeof v === "string" && (HAPTIC_LEVELS as string[]).includes(v);
const isBool = (v: unknown) => typeof v === "boolean";

export default function App() {
  const { mode, toggle: toggleMode } = useSiteMode();
  const [theme, setTheme] = usePersisted<KeyboardTheme>("aura-theme", themeFromUrl() ?? "gojo", isTheme);
  const [layout, setLayout] = usePersisted<KeyboardLayout>("aura-layout", "qwerty", isLayout);
  const [soundPack, setSoundPack] = usePersisted<SoundPackId | "auto">("aura-pack", "auto", isPack);
  const [volume, setVolume] = usePersisted<number>("aura-volume-v2", IS_TOUCH ? 1 : 0.8, isVolume);
  const [soundOn, setSoundOn] = usePersisted<boolean>("aura-sound", true, isBool);
  const [hapticsOn, setHapticsOn] = usePersisted<boolean>("aura-haptics", true, isBool);
  const [hapticLevel, setHapticLevel] = usePersisted<HapticLevel>("aura-haptic-level-v2", IS_TOUCH ? "strong" : "medium", isHapticLevel);
  const [lastKey, setLastKey] = useState<LastKeyEvent | null>(null);
  const [big, setBig] = useState(false);
  const [speedOn, setSpeedOn] = useState(false);
  const [toast, setToast] = useState("");
  const speedFeed = useRef<((code: string) => void) | null>(null);
  const portrait = usePortrait();

  const meta = THEME_META[theme];
  const accent = meta.accent;
  const scene = meta.group !== "classic";

  const handleKeyEvent = useCallback((e: KeyboardInteractionEvent) => {
    if (e.phase !== "down") return;
    speedFeed.current?.(e.code);
    setLastKey({ code: e.code, id: `${e.code}-${performance.now()}` });
  }, []);

  const stepTheme = useCallback((dir: 1 | -1) => {
    const i = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(i + dir + THEME_ORDER.length) % THEME_ORDER.length];
    setTheme(next);
    haptic("Enter", hapticLevel);
  }, [theme, setTheme, hapticLevel]);
  const swipe = useSwipe(() => stepTheme(1), () => stepTheme(-1));

  const share = useCallback(async (text?: string) => {
    const url = `${window.location.origin}${window.location.pathname}?theme=${theme}`;
    const msg = text ?? `Try the ${meta.label} keyboard on AuraKeys:`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "AuraKeys", text: msg, url });
        return;
      }
      await navigator.clipboard.writeText(`${msg} ${url}`);
      setToast("Link copied");
    } catch {
      setToast("Could not share");
    }
    window.setTimeout(() => setToast(""), 2200);
  }, [theme, meta.label]);

  const vars = { ["--neon-accent" as string]: accent, ["--neon-b" as string]: meta.accentB } as CSSProperties;

  return (
    <div
      className={`relative min-h-full flex flex-col text-[var(--text)] ${scene ? "scene-dark" : ""}`}
      style={vars}
    >
      <Stage key={theme} theme={theme} />

      {big && (
        <div className="big-root" role="dialog" aria-label="Big keyboard">
          <div className={`big-pane ${portrait ? "big-rotated" : ""}`}>
            <button
              type="button"
              className="big-close"
              onClick={() => setBig(false)}
              aria-label="Close big keyboard mode"
            >
              <X size={18} />
            </button>
            <div className="big-last" {...swipe}>
              <LastKey lastKey={lastKey} accent={accent} layout={layout} />
            </div>
            <div className="big-kb">
              <Keyboard
                theme={theme}
                layout={layout}
                enableSound={soundOn}
                enableHaptics={hapticsOn}
                hapticLevel={hapticLevel}
                soundPack={soundPack}
                volume={volume}
                onKeyEvent={handleKeyEvent}
                maxFit={2.2}
              />
            </div>
            <p className="big-hint">{portrait ? "Keyboard is turned sideways so the keys are bigger." : "Tap the keys. Press X to close."}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="AuraKeys logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-cover"
              style={{ boxShadow: `0 0 0 1.5px ${accent}, 0 0 18px ${accent}77` }}
            />
            <div>
              <h1 className="font-display text-[15px] font-semibold tracking-tight leading-none">
                AuraKeys
              </h1>
              <p className="text-[11px] text-[var(--text-mute)] leading-none mt-0.5">
                by Haseeb Ullah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => { setSoundOn(!soundOn); e.currentTarget.blur(); }}
              className="rounded-lg p-2 text-[var(--text-dim)] hover:bg-[var(--panel-2)] hover:text-[var(--text)] transition-colors"
              title={soundOn ? "Mute sound" : "Enable sound"}
              aria-label={soundOn ? "Mute sound" : "Enable sound"}
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              onClick={(e) => { setHapticsOn(!hapticsOn); e.currentTarget.blur(); }}
              className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                hapticsOn
                  ? "text-[var(--text)] bg-[var(--panel-2)]"
                  : "text-[var(--text-dim)] hover:bg-[var(--panel-2)]"
              }`}
              title={hapticsOn ? "Disable haptics" : "Enable haptics"}
            >
              {hapticsOn ? "Haptic On" : "Haptic Off"}
            </button>
            <button
              type="button"
              onClick={(e) => { toggleMode(); e.currentTarget.blur(); }}
              className="rounded-lg p-2 text-[var(--text-dim)] hover:bg-[var(--panel-2)] hover:text-[var(--text)] transition-colors"
              title={scene ? "Light and dark mode apply to the Classic colourways" : "Toggle light/dark"}
              aria-label="Toggle light or dark mode"
            >
              {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a
              href="https://github.com/haseeb45555"
              target="_blank"
              rel="noreferrer"
              className="ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-[var(--text-dim)] hover:bg-[var(--panel-2)] hover:text-[var(--text)] transition-colors"
            >
              <GithubMark />
              <span className="hidden sm:inline">haseeb45555</span>
            </a>
            <a
              href="https://www.linkedin.com/in/haseeb-ullah-0a64b9351/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg p-2 text-[var(--text-dim)] hover:bg-[var(--panel-2)] hover:text-[var(--text)] transition-colors"
              aria-label="Haseeb Ullah on LinkedIn"
              title="LinkedIn"
            >
              <LinkedinMark />
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        {/* Hero */}
        <section className="relative w-full max-w-5xl text-center" {...swipe}>
          {meta.kanji && (
            <>
              <span className="kanji-side left-1 hidden md:block" aria-hidden="true">{meta.kanji}</span>
              <span className="kanji-side right-1 hidden md:block" aria-hidden="true">{meta.kanji}</span>
            </>
          )}
          <h2 key={theme} className={`hero-title font-${meta.font} py-1`}>
            {meta.title}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-[var(--text-dim)] leading-relaxed">
            {meta.tagline}
          </p>
        </section>

        {/* Last key indicator */}
        <div className="mt-4 mb-2 h-14">
          <LastKey lastKey={lastKey} accent={accent} layout={layout} />
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          {IS_TOUCH && (
            <button
              type="button"
              onClick={() => { setBig(true); haptic("Enter", hapticLevel); }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold"
              style={{ background: accent, color: readableOn(accent), boxShadow: `0 0 22px ${accent}88` }}
            >
              <Maximize2 size={15} /> Big keyboard
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { setSpeedOn(!speedOn); e.currentTarget.blur(); }}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--panel-2)] px-4 py-2 text-[13px] font-semibold"
          >
            <Timer size={15} /> {speedOn ? "Hide speed test" : "Speed test"}
          </button>
          <button
            type="button"
            onClick={(e) => { void share(); e.currentTarget.blur(); }}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--panel-2)] px-4 py-2 text-[13px] font-semibold"
          >
            <Share2 size={15} /> Share
          </button>
        </div>
        {IS_TOUCH && (
          <p className="-mt-1 mb-3 text-[11.5px] text-[var(--text-mute)]">Swipe the title left or right to change theme.</p>
        )}
        {speedOn && (
          <SpeedTest
            accent={accent}
            accentB={meta.accentB}
            themeLabel={meta.label}
            layout={layout}
            feedRef={speedFeed}
            onClose={() => setSpeedOn(false)}
            onShare={(t) => { void share(t); }}
          />
        )}

        {/* Keyboard */}
        <div className="w-full max-w-[920px] px-1 pb-8">
          <Keyboard
            theme={theme}
            layout={layout}
            enableSound={soundOn}
            enableHaptics={hapticsOn}
            hapticLevel={hapticLevel}
            soundPack={soundPack}
            volume={volume}
            onKeyEvent={handleKeyEvent}
          />
        </div>

        {/* Controls */}
        <div className="w-full max-w-3xl space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 backdrop-blur-md sm:p-5">
          <div className="space-y-3">
            {THEME_GROUPS.map((g) => (
              <Row key={g.id} label={g.label}>
                {g.ids.map((id) => (
                  <Chip
                    key={id}
                    active={theme === id}
                    accent={THEME_META[id].accent}
                    dot={THEME_META[id].accent}
                    onClick={() => setTheme(id)}
                  >
                    {THEME_META[id].label}
                  </Chip>
                ))}
              </Row>
            ))}
          </div>

          <div className="h-px bg-[var(--border)]" />

          <Row label="Sound">
            <Chip
              active={soundPack === "auto"}
              accent={accent}
              onClick={() => setSoundPack("auto")}
              title="Uses the sound that belongs to the theme"
            >
              Auto
            </Chip>
            {SOUND_PACKS.map((p) => (
              <Chip
                key={p.id}
                active={soundPack === p.id}
                accent={accent}
                onClick={() => setSoundPack(p.id)}
              >
                {p.label}
              </Chip>
            ))}
          </Row>

          <Row label="Volume">
            <div className="flex w-full max-w-xs items-center gap-3 pt-1">
              <input
                type="range"
                className="vol h-1.5 w-full cursor-pointer"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) => { setVolume(Number(e.target.value) / 100); e.currentTarget.blur(); }}
                aria-label="Volume"
              />
              <span className="w-9 text-right font-mono-key text-[11px] text-[var(--text-mute)]">
                {soundOn ? `${Math.round(volume * 100)}%` : "off"}
              </span>
            </div>
          </Row>

          <Row label="Vibration">
            {HAPTIC_LEVELS.map((lv) => (
              <Chip
                key={lv}
                active={hapticsOn && hapticLevel === lv}
                accent={accent}
                onClick={() => { setHapticsOn(true); setHapticLevel(lv); haptic("Enter", lv); }}
              >
                <span className="capitalize">{lv}</span>
              </Chip>
            ))}
            <Chip active={!hapticsOn} accent={accent} onClick={() => setHapticsOn(false)}>Off</Chip>
            {!hapticsSupported() && (
              <p className="w-full text-[11.5px] text-[var(--text-mute)]">
                This browser has no vibration support. Use Chrome on Android for full haptics.
              </p>
            )}
          </Row>

          <Row label="Layout">
            {KEYBOARD_LAYOUTS.map((id) => (
              <Chip key={id} active={layout === id} accent={accent} onClick={() => setLayout(id)}>
                <span className="capitalize">{id}</span>
              </Chip>
            ))}
          </Row>
        </div>

        <p className="mt-5 text-center text-[12px] text-[var(--text-mute)]">
          Type on your keyboard or tap the keys. On a phone, tap "Big keyboard mode" for bigger keys.
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-5 bg-[var(--bg)]/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 text-[12px] text-[var(--text-mute)]">
          <p>
            Built by{" "}
            <a
              href="https://github.com/haseeb45555"
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:text-[var(--text)] transition-colors"
              style={{ color: accent }}
            >
              Haseeb Ullah
            </a>{" "}
            · AuraKeys
          </p>
          <p className="flex items-center gap-1.5">
            <GithubMark width={13} height={13} />
            <a
              href="https://github.com/haseeb45555"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--text)] transition-colors"
            >
              github.com/haseeb45555
            </a>
          </p>
          <p className="flex items-center gap-1.5">
            <LinkedinMark width={13} height={13} />
            <a
              href="https://www.linkedin.com/in/haseeb-ullah-0a64b9351/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--text)] transition-colors"
            >
              linkedin.com/in/haseeb-ullah
            </a>
          </p>
        </div>
      </footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
