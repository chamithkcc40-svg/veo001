// ch3.tsx - Chapter 3 "Light Has a Siren Too", Light Lab sequence (f2387-2797), one continuous shot:
// s3_lab (arrive from the s2_paper star field, neon chapter card, wavy light rings, spacing->colour wave),
// s3_blue (star glides toward the viewer at screen right: front rings tighten BLUE),
// s3_galaxy (star blooms into the Glowing Galaxy, recedes: glow BLUE -> cream -> RED, REDSHIFT forms
// from converging red rings). All frames GLOBAL; cue frames from data/video.json.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rnd, rr, shiftColor, sp, tw } from "../util";
import { cue } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { LabBg } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Rings } from "../kit/info/Rings";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { RAINBOW } from "../kit/info/Barcode";
import { SceneProps, SceneReg } from "../chapters/types";

// ------------------------------------------------------------------ neon-tube chapter card
// Tubes flicker on letter by letter (seeded), with an unlit-glass underlay so the sign exists before it
// lights (entrance has a reason: the neon buzz sfx at 2393). Exit: power-down flicker + rise.
export const NeonCard: React.FC<{ f: number; at: number; out: number; num: string; text: string; y?: number; color?: string }> = ({ f, at, out, num, text, y = 190, color = C.pink }) => {
  const { fps } = useVideoConfig();
  const full = `${num} · ${text}`;
  const e = prog(f, out - 8, out, ease.in);
  if (f < at - 6 || e >= 1) return null;
  const hang = sp(f, at - 6, fps, spr.smooth); // sign drops on its wires first
  const swing = Math.sin((f - at) / 7) * 2.5 * Math.exp(-Math.max(0, f - at) / 30);
  return (
    <div style={{ position: "absolute", left: 0, width: 1920, top: y - 70 - (1 - hang) * 160 - e * 40, textAlign: "center", transform: `rotate(${swing}deg)`, transformOrigin: "960px -200px", opacity: 1 - e * 0.3 }}>
      {/* hanging wires */}
      <div style={{ position: "absolute", left: 960 - 520, top: -400, width: 3, height: 400, background: alpha(C.lilac, 0.25) }} />
      <div style={{ position: "absolute", left: 960 + 520, top: -400, width: 3, height: 400, background: alpha(C.lilac, 0.25) }} />
      <div style={{ display: "inline-block", padding: "18px 46px", borderRadius: 26, background: alpha(C.night, 0.55), boxShadow: `inset 0 0 0 3px ${alpha(C.lilac, 0.12)}` }}>
        {full.split("").map((ch, i) => {
          // each tube strikes at its own seeded moment, with 1-2 flicker dropouts, then steady hum
          const strike = at + 2 + i * 1.2 + rr("neon" + i, 0, 5);
          const on = f >= strike ? 1 : 0;
          const drop = (f > strike + 2 && f < strike + 4 && rnd("nd" + i) > 0.5) || (e > 0 && rnd("ne" + i + Math.floor(f / 2)) > 1 - e) ? 0.15 : 1;
          const hum = 0.92 + 0.08 * noise1("nh" + i, f / 3);
          const lit = on * drop * hum;
          const isNum = i < num.length;
          const c = isNum ? C.sun : color;
          return (
            <span key={i} style={{
              display: "inline-block", fontFamily: F.display, fontWeight: 500, fontSize: 70, letterSpacing: "0.08em", whiteSpace: "pre",
              color: lit > 0.5 ? mix(c, C.white, 0.55) : alpha(C.lilac, 0.18),
              textShadow: lit > 0.5 ? `0 0 8px ${alpha(c, 0.95 * lit)}, 0 0 26px ${alpha(c, 0.8 * lit)}, 0 0 60px ${alpha(c, 0.5 * lit)}` : "none",
            }}>{ch === " " ? "\u00A0" : ch}</span>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ spacing -> colour helpers
/** colour along the rainbow strip, u 0 (violet) .. 1 (red) */
export const rainbowAt = (u: number) => {
  const x = clamp(u) * (RAINBOW.length - 1);
  const i = Math.min(RAINBOW.length - 2, Math.floor(x));
  return mix(RAINBOW[i], RAINBOW[i + 1], x - i);
};
const LAM_MIN = 46, LAM_MAX = 150; // px wavelength drawn for violet .. red
export const lamToU = (lam: number) => clamp((lam - LAM_MIN) / (LAM_MAX - LAM_MIN));

/** a travelling wave line between x0..x1 whose wavelength = lam and colour follows it */
export const WaveLine: React.FC<{ f: number; x0: number; x1: number; y: number; lam: number; amp?: number; w?: number; o?: number; reveal?: number }> = ({ f, x0, x1, y, lam, amp = 34, w = 8, o = 1, reveal = 1 }) => {
  const col = rainbowAt(lamToU(lam));
  const xe = x0 + (x1 - x0) * reveal;
  let d = "";
  const phase = f * 0.32; // waves travel to the right (light moving)
  for (let x = x0; x <= xe; x += 4) {
    const env = Math.min(1, (x - x0) / 60, (x1 - x) / 60); // soft ends
    const yy = y + Math.sin(((x - x0) / lam) * Math.PI * 2 - phase) * amp * Math.max(0, env);
    d += `${x === x0 ? "M" : "L"}${x},${yy}`;
  }
  return (
    <g opacity={o}>
      <path d={d} stroke={col} strokeWidth={w * 2.6} fill="none" strokeLinecap="round" opacity={0.25} style={{ filter: "blur(8px)" }} />
      <path d={d} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke={alpha(C.white, 0.55)} strokeWidth={w * 0.3} fill="none" strokeLinecap="round" transform="translate(0,-2)" />
    </g>
  );
};

// ------------------------------------------------------------------ the test star's motion (one clock)
// v(t): still -> right toward the viewer (+2.4 px/f) -> reverses on the sweep sfx (2680) -> left (-2.4).
// Ring speed LAB_C = 5, so v/c <= 0.48 (no shock cone; Rings asserts it).
const LAB_C = 5;
const STAR0 = { x: 960, y: 470 };
const smooth = (t: number, a: number, b: number) => { const u = clamp((t - a) / (b - a)); return u * u * (3 - 2 * u); };
const starV = (t: number) => 2.4 * smooth(t, cue("squeezeWaves") + 6, cue("squeezeWaves") + 26) - 4.8 * smooth(t, cue("stretchThem") - 8, cue("stretchThem") + 12);
const X_CACHE = new Map<number, number>();
export const starX = (t: number) => {
  const k = Math.round(t * 4) / 4;
  const hit = X_CACHE.get(k);
  if (hit !== undefined) return hit;
  let x = STAR0.x;
  for (let s = cue("squeezeWaves"); s < k; s += 0.5) x += starV(s) * 0.5;
  X_CACHE.set(k, x);
  return x;
};
const starPath = (t: number) => ({ x: starX(t), y: STAR0.y });
