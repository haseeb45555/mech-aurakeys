import { useState } from "react";
import type { KeyboardTheme } from "../lib/keyboard-theme-data";
import { THEME_META } from "../lib/keyboard-theme-data";

function Palm({ className, color }: { className: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 210 330" fill={color} aria-hidden="true">
      <path d="M92 330 C98 244 110 172 134 96 L146 99 C124 174 112 244 114 330 Z" />
      <path d="M140 97 Q92 18 28 40 Q94 44 140 97Z" />
      <path d="M140 97 Q80 68 8 112 Q86 92 140 97Z" />
      <path d="M140 97 Q92 112 38 174 Q100 132 140 97Z" />
      <path d="M140 97 Q130 30 152 0 Q156 52 140 97Z" />
      <path d="M140 97 Q192 18 208 42 Q172 44 140 97Z" />
      <path d="M140 97 Q194 70 206 122 Q182 98 140 97Z" />
      <path d="M140 97 Q182 112 194 172 Q162 130 140 97Z" />
    </svg>
  );
}

function ViceScene() {
  return (
    <>
      <div className="sun" />
      <div className="floor" />
      <Palm className="palm-l" color="#0a0014" />
      <Palm className="palm-r" color="#0a0014" />
    </>
  );
}

function LeonidaScene() {
  return (
    <>
      <div className="sun" />
      <div className="sea" />
      <Palm className="palm-l" color="#041a20" />
      <Palm className="palm-r" color="#041a20" />
    </>
  );
}

function GojoScene() {
  return (
    <>
      <div className="stars" />
      <div className="orb orb-blue" />
      <div className="orb orb-red" />
      <div className="orb orb-purple" />
      <svg className="rings" viewBox="0 0 1000 1000" fill="none" aria-hidden="true">
        {[70, 130, 200, 280, 370, 470].map((r, i) => (
          <circle
            key={r}
            cx="500"
            cy="500"
            r={r}
            stroke="#00e5ff"
            strokeOpacity={0.2 - i * 0.025}
            strokeWidth="1.2"
            strokeDasharray={i % 2 ? "2 10" : undefined}
          />
        ))}
      </svg>
    </>
  );
}

function SukunaScene() {
  return (
    <>
      <div className="moon" />
      <svg className="cuts" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        <g strokeLinecap="round">
          <path d="M-20 90 L1020 330" stroke="#ff2a2a" strokeOpacity=".5" strokeWidth="2" />
          <path d="M-20 100 L1020 340" stroke="#fff" strokeOpacity=".18" strokeWidth="1" />
          <path d="M120 -20 L860 620" stroke="#ff2a2a" strokeOpacity=".4" strokeWidth="1.6" />
          <path d="M1020 40 L180 560" stroke="#ff4040" strokeOpacity=".35" strokeWidth="1.4" />
          <path d="M-20 470 L1020 210" stroke="#fff" strokeOpacity=".12" strokeWidth="1" />
          <path d="M600 -20 L420 620" stroke="#ff2a2a" strokeOpacity=".3" strokeWidth="1.2" />
        </g>
      </svg>
    </>
  );
}

function AkatsukiScene() {
  const cloud =
    "M10 70 C-6 60 0 36 22 38 C24 14 56 8 68 28 C84 14 110 26 106 46 C128 46 134 72 112 76 Z";
  return (
    <svg className="clouds" aria-hidden="true">
      <defs>
        <pattern id="ak-cloud" width="240" height="170" patternUnits="userSpaceOnUse">
          <g fill="#b3121f" stroke="#f6f2e8" strokeWidth="3" strokeLinejoin="round">
            <path d={cloud} transform="translate(16 20)" />
            <path d={cloud} transform="translate(126 96) scale(.85)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ak-cloud)" />
    </svg>
  );
}

function EvaScene() {
  return (
    <>
      <svg className="hex" aria-hidden="true">
        <defs>
          <path id="eva-h" d="M28 0L56 16.2V48.5L28 64.7L0 48.5V16.2Z" fill="none" stroke="#39ff88" strokeOpacity=".16" />
          <pattern id="eva-hex" width="56" height="97" patternUnits="userSpaceOnUse">
            <use href="#eva-h" />
            <use href="#eva-h" x="28" y="48.5" />
            <use href="#eva-h" x="-28" y="48.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#eva-hex)" />
      </svg>
      <div className="band band-t" />
      <div className="band band-b" />
    </>
  );
}

function TanjiroScene() {
  return (
    <>
      <div className="checker" />
      <div className="flame" />
    </>
  );
}


function GokuScene() {
  return (
    <>
      <div className="rays" />
      <div className="aura" />
      <div className="balls">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={n} className="ball" style={{ ["--i" as string]: n }} />
        ))}
      </div>
    </>
  );
}

function LuffyScene() {
  return (
    <>
      <div className="sun" />
      <div className="sea" />
      <div className="wave wave-a" />
      <div className="wave wave-b" />
      <svg className="hat" viewBox="0 0 200 110" aria-hidden="true">
        <ellipse cx="100" cy="72" rx="96" ry="22" fill="#e8bb3c" />
        <path d="M44 70 Q46 14 100 12 Q154 14 156 70 Z" fill="#f2cc55" />
        <path d="M46 62 Q100 74 154 62 L155 70 Q100 82 45 70 Z" fill="#d62839" />
      </svg>
    </>
  );
}

function LeviScene() {
  return (
    <>
      <div className="mist" />
      <svg className="wings" viewBox="0 0 600 300" aria-hidden="true">
        <g fill="none" strokeLinejoin="round">
          <path d="M300 150 L60 40 L90 90 L40 100 L90 130 L60 170 L130 170 L300 150Z" stroke="#c9d3d9" strokeWidth="2.5" />
          <path d="M300 150 L540 40 L510 90 L560 100 L510 130 L540 170 L470 170 L300 150Z" stroke="#4f8a5e" strokeWidth="2.5" />
        </g>
      </svg>
      <div className="wall" />
    </>
  );
}

function NarutoScene() {
  return (
    <>
      <div className="swirl" />
      <div className="leaves">
        {[0, 1, 2, 3, 4, 5, 6].map((n) => (
          <span key={n} className="leaf" style={{ ["--i" as string]: n }} />
        ))}
      </div>
    </>
  );
}

function MinecraftScene() {
  return (
    <>
      <div className="sun" />
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="ground" />
    </>
  );
}

function ValorantScene() {
  return (
    <>
      <div className="grid" />
      <div className="slash slash-a" />
      <div className="slash slash-b" />
      <div className="slash slash-c" />
    </>
  );
}

function ZeldaScene() {
  return (
    <>
      <div className="glow" />
      <svg className="tri" viewBox="0 0 200 180" aria-hidden="true">
        <g fill="#e3c568">
          <path d="M100 8 L136 70 L64 70Z" />
          <path d="M64 78 L100 140 L28 140Z" />
          <path d="M136 78 L172 140 L100 140Z" />
        </g>
      </svg>
      <div className="motes">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={n} className="mote" style={{ ["--i" as string]: n }} />
        ))}
      </div>
    </>
  );
}

function MarioScene() {
  return (
    <>
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="hill" />
      <div className="bricks" />
    </>
  );
}

/**
 * Optional real artwork. Drop a file at public/bg/<theme>.jpg (or .webp) and it
 * fades in over the animated scene. If the file is missing nothing breaks.
 */
function BgImage({ theme }: { theme: KeyboardTheme }) {
  const [state, setState] = useState<"loading" | "ok" | "none">("loading");
  const [ext, setExt] = useState<"jpg" | "webp">("jpg");
  if (state === "none") return null;
  return (
    <img
      className={`bg-art ${state === "ok" ? "bg-art-on" : ""}`}
      src={`/bg/${theme}.${ext}`}
      alt=""
      decoding="async"
      onLoad={() => setState("ok")}
      onError={() => (ext === "jpg" ? setExt("webp") : setState("none"))}
    />
  );
}

export default function Stage({ theme }: { theme: KeyboardTheme }) {
  if (THEME_META[theme].group === "classic") return null;

  let scene = null;
  switch (theme) {
    case "vice": scene = <ViceScene />; break;
    case "leonida": scene = <LeonidaScene />; break;
    case "gojo": scene = <GojoScene />; break;
    case "sukuna": scene = <SukunaScene />; break;
    case "akatsuki": scene = <AkatsukiScene />; break;
    case "eva": scene = <EvaScene />; break;
    case "tanjiro": scene = <TanjiroScene />; break;
    case "goku": scene = <GokuScene />; break;
    case "luffy": scene = <LuffyScene />; break;
    case "levi": scene = <LeviScene />; break;
    case "naruto": scene = <NarutoScene />; break;
    case "minecraft": scene = <MinecraftScene />; break;
    case "valorant": scene = <ValorantScene />; break;
    case "zelda": scene = <ZeldaScene />; break;
    case "mario": scene = <MarioScene />; break;
    default: break;
  }

  return (
    <div className={`stage stage-${theme}`} aria-hidden="true">
      {scene}
      <BgImage theme={theme} />
      <div className="stage-vignette" />
    </div>
  );
}
