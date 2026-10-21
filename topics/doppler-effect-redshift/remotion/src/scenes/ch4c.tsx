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
