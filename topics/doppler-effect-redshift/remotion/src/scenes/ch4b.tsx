// ch4b.tsx - Chapter 4, middle beats (f4234-4693). All frames GLOBAL.
// s4_chart  Chart Room (chalk wipe in, card_slide 4234): HUBBLE: DISTANCES and SLIPHER: SPEEDS cards slide
//           together, then dock as the two axis labels; 24 dots tap on (sync.chalkTaps); the rising line
//           draws on "pattern" (chalk_line 4395); Hubble steps back; punch-in on "farther"; on "faster"
//           each dot becomes a tiny galaxy with a red arrow whose length grows with distance.
// s4_grid   expansion sheet: 5x3 grid of galaxies scales evenly (stretch 4552); gold ring on one galaxy,
//           its arrows all point away; then a second galaxy, same result.
// s4_peak   scale-through + fast pull back through a galaxy field, red with distance; gold title.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, syncList, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { ChartRoom } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { LetterTitle, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { HUBBLE } from "../kit/rig/characters";
import { POSE, track, walk, merge } from "../kit/rig/poses";
import { SceneProps, SceneReg } from "../chapters/types";

const word = (text: string, after: number): number => {
  const w = V.words.find((x) => x.s >= after && x.text.toLowerCase().replace(/[^a-z0-9]/g, "") === text);
  if (!w) throw new Error("missing word " + text);
  return w.s;
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ s4_chart
// Board space = screen space (ChartRoom board: x 180..1740, y 120..820). Axes origin at AX.
// 24 schematic dots (illustrative, seeded; 07 forbids invented axis numbers): x spread along distance,
// y = slope * x + scatter, so the cloud rises with the line drawn through it. The Virgo group sits
// top-right and gets the only number tag, "Virgo galaxies ~1,000 km/s" (PNAS 2015).
const AX = { x: 340, y: 700, w: 1240, h: 500 }; // leaves room under the x axis for its label + credit
const DOTS = Array.from({ length: 24 }).map((_, i) => {
  const u = i < 20 ? 0.04 + 0.62 * Math.pow(rr("hd u" + i, 0, 1), 0.9) : 0.78 + 0.16 * rr("hd v" + i, 0, 1); // last 4 = Virgo group
  const v = clamp(u * 0.92 + rr("hd s" + i, -0.13, 0.13) * (0.4 + u), 0.02, 0.98);
  return { u, v };
}).sort((a, b) => a.u - b.u);
const dotXY = (d: { u: number; v: number }) => ({ x: AX.x + d.u * AX.w, y: AX.y - d.v * AX.h });
/** chalk stroke: slightly wobbly path with a dusty double line (seeded) */
const chalkLine = (x0: number, y0: number, x1: number, y1: number, seed: string, n = 14) =>
  Array.from({ length: n + 1 }).map((_, i) => { const t = i / n; return `${i ? "L" : "M"}${x0 + (x1 - x0) * t + rr(seed + "x" + i, -2, 2)},${y0 + (y1 - y0) * t + rr(seed + "y" + i, -2, 2)}`; }).join("");

/** chalk-wipe transition: a dusty diagonal band sweeps left -> right; everything left of it is revealed */
const WIPE4 = 16;
const ChalkWipe: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => {
  if (p <= 0) return null;
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const e = -300 + p * 2500; // leading edge x at the top; the band leans 300 px
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `polygon(-10px -10px, ${e}px -10px, ${e - 300}px 1090px, -10px 1090px)` }}>{children}</AbsoluteFill>
      <Svg>
        <path d={`M${e},-10 L${e - 300},1090`} stroke={alpha(C.chalk, 0.7)} strokeWidth={46} style={{ filter: "blur(10px)" }} />
        {Array.from({ length: 40 }).map((_, i) => {
          const t = rr("cw t" + i, 0, 1), off = rr("cw o" + i, -40, 20);
          return <circle key={i} cx={e - 300 * t + off} cy={-10 + 1100 * t} r={rr("cw r" + i, 2, 7)} fill={C.chalk} opacity={rr("cw a" + i, 0.3, 0.8)} />;
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/** paper index card that later docks as an axis label */
const DataCard: React.FC<{ title: string; sub?: string; x: number; y: number; s: number; rot: number; o: number; color: string; dock: number }> = ({ title, sub, x, y, s, rot, o, color, dock }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, whiteSpace: "nowrap" }}>
    <div style={{ background: mix(C.white, C.sunLt, 0.25 * (1 - dock)), borderRadius: 14, padding: "16px 30px 18px", boxShadow: `0 ${16 * (1 - dock)}px 40px ${alpha(C.night, 0.45 * (1 - dock))}`, borderTop: `10px solid ${color}` }}>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.night, letterSpacing: "0.05em" }}>{title}</div>
      {sub && <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 28, color: alpha(C.night, 0.7) }}>{sub}</div>}
    </div>
  </div>
);
