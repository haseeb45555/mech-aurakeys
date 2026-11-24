import { kindFor, type KeyKind } from "./sound-engine";

export type HapticLevel = "light" | "medium" | "strong";
export const HAPTIC_LEVELS: HapticLevel[] = ["light", "medium", "strong"];

// Most phone motors can't render anything under ~10ms, so keep these longer.
const BASE_MS: Record<KeyKind, number> = { normal: 16, mod: 12, space: 32, enter: 40, back: 24 };
const MULT: Record<HapticLevel, number> = { light: 0.8, medium: 1.5, strong: 3 };

let iosLabel: HTMLLabelElement | null = null;

/** iOS Safari has no Vibration API; a native switch toggle gives a small tap instead. */
function iosTick() {
  if (typeof document === "undefined") return;
  if (!iosLabel) {
    const hide = "position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.id = "aura-haptic-switch";
    input.style.cssText = hide;
    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.style.cssText = hide;
    document.body.append(input, label);
    iosLabel = label;
  }
  iosLabel.click();
}

export function hapticsSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/** Call from a touch/click/key handler. Does nothing where the device can't vibrate. */
export function haptic(code: string, level: HapticLevel = "medium") {
  try {
    if (hapticsSupported()) {
      navigator.vibrate(Math.round(BASE_MS[kindFor(code)] * MULT[level]));
    } else {
      iosTick();
      // iPhones only get a tiny tick, so double it for a firmer feel.
      if (level !== "light") setTimeout(iosTick, level === "strong" ? 35 : 55);
    }
  } catch { /* ignore */ }
}
