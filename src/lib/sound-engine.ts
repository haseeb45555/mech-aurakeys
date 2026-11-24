import type { SoundPackId } from "./keyboard-theme-data";

export type KeyKind = "normal" | "mod" | "space" | "enter" | "back";

const MOD_CODES = new Set([
  "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight",
  "MetaLeft", "MetaRight", "CapsLock", "Tab", "Escape", "Fn",
]);

export function kindFor(code: string): KeyKind {
  if (code === "Space") return "space";
  if (code === "Enter") return "enter";
  if (code === "Backspace" || code === "Delete") return "back";
  if (MOD_CODES.has(code)) return "mod";
  return "normal";
}

const LETTER_ORDER = "QWERTYUIOPASDFGHJKLZXCVBNM";

/** Stable index per key so every key always plays the same note. */
function noteIndex(code: string): number {
  if (code.startsWith("Key")) return Math.max(0, LETTER_ORDER.indexOf(code[3]));
  if (code.startsWith("Digit")) return Number(code.slice(5)) || 0;
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return h % 26;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// Musical scales (Hz). Keys map onto these so typing sounds like a melody.
const SCALE_GOJO = [587.33, 659.25, 739.99, 880, 987.77, 1174.66, 1318.51, 1479.98]; // D major pentatonic
const SCALE_VICE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33]; // A minor pentatonic
const SCALE_LEO = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51]; // C major pentatonic
const SCALE_EVA = [1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];

interface KindShape {
  pitch: number;
  gain: number;
  dur: number;
}

const SHAPES: Record<KeyKind, KindShape> = {
  normal: { pitch: 1, gain: 1, dur: 1 },
  mod: { pitch: 1.12, gain: 0.85, dur: 0.8 },
  space: { pitch: 0.7, gain: 1.2, dur: 1.5 },
  enter: { pitch: 0.82, gain: 1.15, dur: 1.3 },
  back: { pitch: 1.05, gain: 0.95, dur: 1 },
};

interface ToneOpts {
  type: OscillatorType;
  f: number;
  f2?: number;
  t: number;
  dur: number;
  gain: number;
  attack?: number;
  lp?: number;
  send?: number;
}

interface BurstOpts {
  t: number;
  dur: number;
  gain: number;
  type: BiquadFilterType;
  f: number;
  f2?: number;
  q?: number;
  send?: number;
}

class KeySoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private echoIn: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private sample: AudioBuffer | null = null;
  private rawSample: ArrayBuffer | null = null;
  private sampleUrl: string | null = null;
  private volume = 0.8;

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  /** Start fetching the classic click sample (decoded once the context exists). */
  loadSample(url: string) {
    if (this.sampleUrl === url) return;
    this.sampleUrl = url;
    this.sample = null;
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        this.rawSample = buf;
        this.decodeSample();
      })
      .catch(() => {});
  }

  private decodeSample() {
    if (!this.ctx || !this.rawSample || this.sample) return;
    this.ctx
      .decodeAudioData(this.rawSample.slice(0))
      .then((b) => { this.sample = b; })
      .catch(() => {});
  }

  /** Must be called from a user gesture the first time. Safe to call repeatedly. */
  unlock(): boolean {
    try {
      if (!this.ctx) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return false;
        this.ctx = new Ctx({ latencyHint: "interactive" });
        this.build(this.ctx);
        this.decodeSample();
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return true;
    } catch {
      return false;
    }
  }

  private build(c: AudioContext) {
    const master = c.createGain();
    master.gain.value = this.volume;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.12;
    master.connect(comp);
    comp.connect(c.destination);

    const bus = c.createGain();
    bus.connect(master);

    // Shared echo / "room" used by the chime and synth packs.
    const echoIn = c.createGain();
    const delay = c.createDelay(1);
    delay.delayTime.value = 0.17;
    const damp = c.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 2400;
    const fb = c.createGain();
    fb.gain.value = 0.32;
    const wet = c.createGain();
    wet.gain.value = 0.55;
    echoIn.connect(delay);
    delay.connect(damp);
    damp.connect(fb);
    fb.connect(delay);
    damp.connect(wet);
    wet.connect(master);

    const len = Math.floor(c.sampleRate * 1.5);
    const noise = c.createBuffer(1, len, c.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    this.master = master;
    this.bus = bus;
    this.echoIn = echoIn;
    this.noise = noise;
  }

  // ---- building blocks ------------------------------------------------

  private tone(o: ToneOpts) {
    const c = this.ctx;
    if (!c || !this.bus) return;
    const osc = c.createOscillator();
    osc.type = o.type;
    osc.frequency.setValueAtTime(o.f, o.t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, o.t + o.dur * 0.7);
    const g = c.createGain();
    const a = o.attack ?? 0.002;
    g.gain.setValueAtTime(0.0001, o.t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), o.t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
    osc.connect(g);
    let out: AudioNode = g;
    if (o.lp) {
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = o.lp;
      g.connect(f);
      out = f;
    }
    out.connect(this.bus);
    if (o.send && this.echoIn) {
      const s = c.createGain();
      s.gain.value = o.send;
      out.connect(s);
      s.connect(this.echoIn);
    }
    osc.start(o.t);
    osc.stop(o.t + o.dur + 0.03);
  }

  private burst(o: BurstOpts) {
    const c = this.ctx;
    if (!c || !this.bus || !this.noise) return;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = o.type;
    f.frequency.setValueAtTime(o.f, o.t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, o.t + o.dur);
    f.Q.value = o.q ?? 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(Math.max(0.0002, o.gain), o.t);
    g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.bus);
    if (o.send && this.echoIn) {
      const s = c.createGain();
      s.gain.value = o.send;
      g.connect(s);
      s.connect(this.echoIn);
    }
    src.start(o.t, Math.random() * 1.0, o.dur + 0.02);
  }

  /** Core mechanical switch: top click + body tone + bottom-out thock. */
  private mech(t: number, base: number, s: KindShape, vol = 1) {
    const p = s.pitch * rnd(0.96, 1.04);
    const g = s.gain * vol * rnd(0.92, 1.05);
    this.burst({ t, dur: 0.014, gain: 0.5 * g, type: "highpass", f: 3200 * p, q: 0.7 });
    this.tone({ type: "sine", f: base * p * 1.6, f2: base * p, t, dur: 0.09 * s.dur, gain: 0.6 * g, lp: 900 });
    this.burst({ t: t + 0.004, dur: 0.035 * s.dur, gain: 0.42 * g, type: "lowpass", f: 700 * p, q: 0.5 });
  }

  // ---- public ---------------------------------------------------------

  play(pack: SoundPackId, code: string, phase: "down" | "up" = "down", sampleRate = 1) {
    if (!this.unlock() || !this.ctx || !this.bus) return;
    const c = this.ctx;
    const t = c.currentTime + 0.001;
    const kind = kindFor(code);
    const s = SHAPES[kind];

    if (phase === "up") {
      if (pack !== "sample") {
        this.burst({ t, dur: 0.01, gain: 0.1 * s.gain, type: "highpass", f: 2600 * s.pitch, q: 0.7 });
      }
      return;
    }

    const n = noteIndex(code);

    switch (pack) {
      case "sample": {
        if (this.sample) {
          const src = c.createBufferSource();
          src.buffer = this.sample;
          src.playbackRate.value = sampleRate * s.pitch * rnd(0.97, 1.03);
          const g = c.createGain();
          g.gain.value = 0.55 * s.gain;
          src.connect(g);
          g.connect(this.bus);
          src.start(t);
        } else {
          this.mech(t, 170, s, 0.9);
        }
        break;
      }
      case "thock": {
        this.mech(t, 140, s, 1.1);
        break;
      }
      case "gojo": {
        this.mech(t, 190, s, 0.85);
        const f = SCALE_GOJO[n % SCALE_GOJO.length] * (kind === "space" ? 0.5 : 1);
        this.tone({ type: "sine", f, t, dur: 0.5, gain: 0.13 * s.gain, attack: 0.004, send: 0.5 });
        this.tone({ type: "sine", f: f * 2.76, t, dur: 0.28, gain: 0.05 * s.gain, attack: 0.003, send: 0.4 });
        if (kind === "space") {
          this.tone({ type: "sine", f: 90, f2: 48, t, dur: 0.38, gain: 0.5, send: 0.3 });
        }
        if (kind === "enter") {
          // "Lapse Blue" sweep
          this.burst({ t, dur: 0.36, gain: 0.22, type: "bandpass", f: 400, f2: 4200, q: 1.4, send: 0.6 });
        }
        break;
      }
      case "sukuna": {
        this.tone({ type: "sawtooth", f: 120 * s.pitch, f2: 62, t, dur: 0.13 * s.dur, gain: 0.5 * s.gain, lp: 520 });
        this.burst({ t, dur: 0.075, gain: 0.5 * s.gain, type: "bandpass", f: 7000, f2: 900, q: 1.2 });
        this.burst({ t, dur: 0.012, gain: 0.35, type: "highpass", f: 4200 });
        if (kind === "enter") {
          // second cut, "Cleave"
          this.burst({ t: t + 0.055, dur: 0.07, gain: 0.45, type: "bandpass", f: 6200, f2: 800, q: 1.2 });
        }
        if (kind === "space") {
          this.tone({ type: "sine", f: 62, f2: 38, t, dur: 0.32, gain: 0.7, lp: 200 });
          this.burst({ t, dur: 0.16, gain: 0.5, type: "lowpass", f: 260 });
        }
        break;
      }
      case "akatsuki": {
        this.mech(t, 160, s, 0.7);
        const ring = rnd(0.97, 1.03);
        this.tone({ type: "triangle", f: 1850 * ring, f2: 1450 * ring, t, dur: 0.11, gain: 0.17 * s.gain });
        this.burst({ t, dur: 0.06, gain: 0.34 * s.gain, type: "bandpass", f: 4300 * ring, q: 8 });
        if (kind === "enter") {
          this.tone({ type: "triangle", f: 2200, f2: 1700, t: t + 0.07, dur: 0.12, gain: 0.16 });
          this.burst({ t: t + 0.07, dur: 0.06, gain: 0.3, type: "bandpass", f: 4800, q: 8 });
        }
        if (kind === "space") {
          // taiko
          this.tone({ type: "sine", f: 130, f2: 62, t, dur: 0.3, gain: 0.75, lp: 400, send: 0.25 });
          this.burst({ t, dur: 0.14, gain: 0.5, type: "lowpass", f: 300, send: 0.2 });
        }
        break;
      }
      case "eva": {
        this.mech(t, 220, s, 0.5);
        const f = SCALE_EVA[n % SCALE_EVA.length];
        const beep = (at: number, hz: number, hz2?: number) =>
          this.tone({ type: "square", f: hz, f2: hz2, t: at, dur: 0.045, gain: 0.07, lp: 5200, attack: 0.001 });
        if (kind === "enter") {
          beep(t, 1567.98);
          beep(t + 0.06, 2093);
        } else if (kind === "back") {
          beep(t, 1760, 880);
        } else if (kind === "space") {
          this.tone({ type: "sine", f: 110, f2: 70, t, dur: 0.25, gain: 0.55 });
          beep(t, 700);
        } else {
          beep(t, f);
        }
        break;
      }
      case "tanjiro": {
        this.tone({ type: "sine", f: 520 * s.pitch, f2: 380 * s.pitch, t, dur: 0.055 * s.dur, gain: 0.55 * s.gain });
        this.burst({ t, dur: 0.03, gain: 0.4 * s.gain, type: "bandpass", f: 1400 * s.pitch, q: 3 });
        if (kind === "normal" && Math.random() < 0.22) {
          // water droplet
          this.tone({ type: "sine", f: 1200 * rnd(0.9, 1.4), f2: 1900, t: t + 0.02, dur: 0.22, gain: 0.05, send: 0.45 });
        }
        if (kind === "enter") {
          this.tone({ type: "sine", f: 1318.51, t, dur: 0.6, gain: 0.12, send: 0.5 });
          this.tone({ type: "sine", f: 1975.53, t: t + 0.06, dur: 0.6, gain: 0.09, send: 0.5 });
        }
        if (kind === "space") {
          this.tone({ type: "sine", f: 150, f2: 78, t, dur: 0.28, gain: 0.7, lp: 380 });
        }
        break;
      }
      case "vice": {
        this.mech(t, 210, s, 0.7);
        const f = SCALE_VICE[n % SCALE_VICE.length] * (kind === "space" ? 0.5 : 1);
        this.tone({ type: "sawtooth", f, t, dur: 0.3, gain: 0.1, lp: 2200, attack: 0.003, send: 0.45 });
        this.tone({ type: "sawtooth", f: f * 1.006, t, dur: 0.3, gain: 0.07, lp: 2000, attack: 0.003, send: 0.45 });
        if (kind === "enter" || kind === "space") {
          // gated clap
          for (let i = 0; i < 3; i++) {
            this.burst({ t: t + i * 0.013, dur: 0.07, gain: 0.3, type: "bandpass", f: 1500, q: 1.1, send: 0.5 });
          }
        }
        if (kind === "space") {
          this.tone({ type: "sine", f: 78, f2: 44, t, dur: 0.4, gain: 0.6 });
        }
        break;
      }
      case "leonida": {
        this.mech(t, 170, s, 0.6);
        const f = SCALE_LEO[n % SCALE_LEO.length] * (kind === "space" ? 0.5 : 1);
        this.tone({ type: "sine", f, t, dur: 0.38, gain: 0.17, attack: 0.002, send: 0.3 });
        this.tone({ type: "triangle", f: f * 2, t, dur: 0.18, gain: 0.04, attack: 0.002 });
        if (kind === "enter") {
          this.tone({ type: "sine", f: 1318.51, t, dur: 0.5, gain: 0.12, send: 0.3 });
          this.tone({ type: "sine", f: 1760, t: t + 0.08, dur: 0.55, gain: 0.12, send: 0.3 });
        }
        if (kind === "back") {
          this.tone({ type: "sine", f: 262, f2: 196, t, dur: 0.25, gain: 0.2 });
        }
        break;
      }
    }
  }
}

export const keySounds = new KeySoundEngine();
