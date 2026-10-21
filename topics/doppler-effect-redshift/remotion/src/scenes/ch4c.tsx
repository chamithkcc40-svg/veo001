// ch4c.tsx - Chapter 4, final beats (f4693-5334). All frames GLOBAL.
// s4_lemaitre split: a study panel slides in from the left (whoosh 4691): Lemaitre writes, then offers
//             the page; timeline 1927 sits before 1929. On "But Hubble's chart" the right panel's chart
//             lights (pop 4824) and a row of silhouetted astronomers nods; both markers glow.
// s4_twist    the same page-curl sting as Ch2 (twist 4890) - the spiral motif returns.
// s4_road     a tiny ambulance zooms along a starry road (siren blip 4979); a gentle X (nope 5046).
// s4_dough    kitchen counter: dough rises (timelapse), raisin-galaxies spread without swimming;
//             the dough dissolves into a navy space sheet with the same raisins.
// s4_ray      a long wavy ray from a far galaxy to a tiny Milky Way: wiggles widen, blue->cream->RED.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, shiftColor, sp, tw } from "../util";
import { cue, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { Kitchen } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { NameTag, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { HUBBLE, LEMAITRE, OBSERVER_A, OBSERVER_B, SLIPHER } from "../kit/rig/characters";
import { POSE, merge, scribble, sway, track } from "../kit/rig/poses";
import { Ambulance, BigX } from "../kit/props/Props";
import { CurlReveal } from "./ch2";
import { DOTS, chalkLine } from "./ch4b";
import { TwistCard } from "./ch2c";
import { SceneProps, SceneReg } from "../chapters/types";

const word = (text: string, after: number): number => {
  const w = V.words.find((x) => x.s >= after && x.text.toLowerCase().replace(/[^a-z0-9]/g, "") === text);
  if (!w) throw new Error("missing word " + text);
  return w.s;
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ s4_lemaitre (split, drift)
// Panel slide: the left study panel (40 % wide) slides in over the expanding field on the whoosh (4691)
// with a small overshoot; the right panel (Hubble's chart, mini) follows 6 frames later from the right.
// Left: Lemaitre writes (scribble cycle), on "two years earlier" lifts and offers the page toward the
// chart. Right: on "But Hubble's chart" the line flares (pop 4824) and three silhouetted astronomers
// nod one after another (overlapping action). Timeline under both: 1927 then 1929, both glowing.
const SPLIT = 760; // panel divider x
const Panel: React.FC<{ x: number; w: number; slide: number; from: -1 | 1; children: React.ReactNode }> = ({ x, w, slide, from, children }) => {
  const off = (1 - slide) * (from < 0 ? -(x + w + 60) : 1920 - x + 60);
  return (
    <AbsoluteFill style={{ transform: `translateX(${off}px)` }}>
      <AbsoluteFill style={{ clipPath: `inset(40px ${1920 - x - w}px 200px ${x}px round 28px)` }}>{children}</AbsoluteFill>
      <Svg><rect x={x} y={40} width={w} height={840} rx={28} fill="none" stroke={alpha(C.lilac, 0.55)} strokeWidth={6} /></Svg>
    </AbsoluteFill>
  );
};
/** right panel: Hubble's chart again (same 24 schematic dots + line), mini, on its board */
const MiniChart: React.FC<{ f: number; flare: number }> = ({ f, flare }) => {
  const ox = 900, oy = 620, w = 820, h = 430;
  return (
    <Svg>
      <rect x={800} y={40} width={1060} height={840} fill={mix(C.plum, C.night, 0.35)} />
      <rect x={850} y={90} width={960} height={600} rx={20} fill={C.board} />
      <path d={chalkLine(ox, oy, ox + w, oy, "mcx")} stroke={C.chalk} strokeWidth={5} fill="none" />
      <path d={chalkLine(ox, oy, ox, oy - h, "mcy")} stroke={C.chalk} strokeWidth={5} fill="none" />
      <path d={chalkLine(ox, oy, ox + w * 0.98, oy - h * 0.9, "mcl", 18)} stroke={C.sunLt} strokeWidth={7 + 6 * flare} fill="none" strokeLinecap="round" style={{ filter: flare > 0.05 ? `drop-shadow(0 0 ${18 * flare}px ${C.sun})` : undefined }} />
      {DOTS.map((d, i) => <circle key={i} cx={ox + d.u * w} cy={oy - d.v * h} r={8 + 3 * flare * Math.max(0, Math.sin(f / 4 - i * 0.5))} fill={C.chalk} />)}
      <text x={ox + w} y={oy + 36} textAnchor="end" fontFamily={F.display} fontSize={24} fill={alpha(C.chalk, 0.8)}>distance →</text>
      <text x={ox + 16} y={oy - h + 6} fontFamily={F.display} fontSize={24} fill={alpha(C.chalk, 0.8)}>↑ speed away</text>
      <circle cx={1700} cy={60} r={300} fill={alpha(C.sun, 0.06 + 0.1 * flare)} />
    </Svg>
  );
};
