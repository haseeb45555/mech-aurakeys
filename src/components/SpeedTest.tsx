import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { charForCode } from "../lib/typing-test";
import type { KeyboardLayout } from "../lib/keyboard-theme-data";

const WORDS = (
  "the of and to in is you that it he was for on are as with his they at be this from have or by one had not but what all were when we there can an your which their said if do will each about how up out them then she many some so these would other into has more her two like him see time could no make than first been its who now people my made over did down only way find use may water long little very after words called just where most know"
).split(" ");

const DURATION = 30;

function makeText(): string {
  const out: string[] = [];
  for (let i = 0; i < 40; i++) out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  return out.join(" ");
}

interface Props {
  accent: string;
  accentB: string;
  themeLabel: string;
  layout: KeyboardLayout;
  /** SpeedTest puts its key handler here; App calls it on every key press. */
  feedRef: MutableRefObject<((code: string) => void) | null>;
  onClose: () => void;
  onShare: (text: string) => void;
}

function readBest(): number {
  try {
    return Number(localStorage.getItem("aura-best-wpm") ?? 0) || 0;
  } catch {
    return 0;
  }
}

export default function SpeedTest({ accent, accentB, themeLabel, layout, feedRef, onClose, onShare }: Props) {
  const [text, setText] = useState(makeText);
  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(DURATION);
  const [state, setState] = useState<"idle" | "run" | "done">("idle");
  const [best, setBest] = useState(readBest);
  const typedRef = useRef("");
  const stateRef = useRef<"idle" | "run" | "done">("idle");
  const endRef = useRef(0);

  const correct = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) c++;
    return c;
  }, [typed, text]);

  const elapsed = state === "idle" ? 0 : Math.max(1, DURATION - left);
  const wpm = state === "idle" ? 0 : Math.round(correct / 5 / (elapsed / 60));
  const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;

  const reset = useCallback(() => {
    setText(makeText());
    setTyped("");
    typedRef.current = "";
    setLeft(DURATION);
    setState("idle");
    stateRef.current = "idle";
  }, []);

  useEffect(() => {
    feedRef.current = (code: string) => {
      if (stateRef.current === "done") return;
      let next = typedRef.current;
      if (code === "Backspace") {
        next = next.slice(0, -1);
      } else {
        const ch = charForCode(code, false, layout);
        if (!ch || ch.length !== 1) return;
        next += ch;
      }
      if (stateRef.current === "idle") {
        stateRef.current = "run";
        endRef.current = performance.now() + DURATION * 1000;
        setState("run");
      }
      typedRef.current = next;
      setTyped(next);
    };
    return () => { feedRef.current = null; };
  }, [feedRef, layout]);

  useEffect(() => {
    if (state !== "run") return;
    const id = window.setInterval(() => {
      const r = Math.max(0, Math.ceil((endRef.current - performance.now()) / 1000));
      setLeft(r);
      if (r <= 0) {
        stateRef.current = "done";
        setState("done");
        window.clearInterval(id);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state !== "done") return;
    if (wpm > best) {
      setBest(wpm);
      try { localStorage.setItem("aura-best-wpm", String(wpm)); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const shown = text.slice(0, 120);

  return (
    <div className="mx-auto mb-4 w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--text-dim)]">
        <span className="font-semibold" style={{ color: accent }}>Speed test · {themeLabel}</span>
        <span className="font-mono-key">{left}s · {wpm} WPM · {acc}% · best {best}</span>
        <button type="button" onClick={onClose} className="rounded-md px-2 py-0.5 hover:bg-[var(--panel-2)]">Close</button>
      </div>

      <p className="font-mono-key text-[15px] leading-7 tracking-wide" aria-live="off">
        {shown.split("").map((ch, i) => {
          let color = "var(--text-mute)";
          if (i < typed.length) color = typed[i] === ch ? accentB : "#ff5c6a";
          return (
            <span
              key={i}
              style={{
                color,
                borderBottom: i === typed.length && state !== "done" ? `2px solid ${accent}` : undefined,
              }}
            >
              {ch}
            </span>
          );
        })}
      </p>

      {state === "idle" && (
        <p className="mt-2 text-[12px] text-[var(--text-mute)]">Start typing on the keyboard below. Backspace works.</p>
      )}
      {state === "done" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold">{wpm} WPM, {acc}% accuracy</span>
          <button
            type="button"
            onClick={reset}
            className="rounded-full px-3 py-1 text-[12px] font-semibold text-black"
            style={{ background: accent }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => onShare(`I typed ${wpm} WPM (${acc}% accuracy) on the ${themeLabel} AuraKeys keyboard. Beat me:`)}
            className="rounded-full bg-[var(--panel-2)] px-3 py-1 text-[12px] font-semibold"
          >
            Share score
          </button>
        </div>
      )}
    </div>
  );
}
