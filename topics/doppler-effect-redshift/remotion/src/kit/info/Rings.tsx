// Rings.tsx - the film's core motif. Physically correct emission (07 sec. 13):
//  - ring k is born at frame t_k = start + k*period, centred where the SOURCE WAS at t_k
//  - radius grows at constant speed c (px/frame) in every direction (the one allowed linear mapping)
//  - only the source moves; the source must stay slower than c (asserted)
//  - colour: per-ring linear gradient along the motion direction, BLUE on the squeezed (ahead)
//    side and RED on the stretched (behind) side, strength proportional to v/c; white if still.
// Alpha eases out with radius. Use inside an <svg>.
import React from "react";
import { C } from "../../theme";
import { clamp, mix } from "../../util";

export type SourcePath = (frame: number) => { x: number; y: number };

export type RingsProps = {
  id: string;
  frame: number; // current frame (same clock as `path`)
  path: SourcePath;
  start: number; // first emission frame
  stop?: number; // last emission frame
  period: number; // frames between emissions
  c: number; // ring speed px/frame
  maxR: number; // fade-out radius
  width?: number;
  color?: string; // neutral colour
  tint?: boolean; // colour by squeeze/stretch
  tintGain?: number;
  opacity?: number;
  scaleY?: number; // flatten for perspective (ground-plane rings)
  wavy?: number; // amplitude of wiggle (light rings drawn as wavy lines)
  dash?: string;
  onlyColor?: string; // force a single colour (e.g. all-red)
};

const velocity = (path: SourcePath, t: number) => {
  const a = path(t - 1), b = path(t + 1);
  return { vx: (b.x - a.x) / 2, vy: (b.y - a.y) / 2 };
};

export const Rings: React.FC<RingsProps> = (p) => {
  const { frame, path, start, period, c, maxR, id } = p;
  const stop = p.stop ?? Infinity;
  const width = p.width ?? 6;
  const neutral = p.color ?? C.white;
  const sy = p.scaleY ?? 1;
  const out: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  if (frame < start) return null;
  const kMax = Math.floor((Math.min(frame, stop) - start) / period);
  const kMin = Math.max(0, Math.floor((frame - start - maxR / c) / period) - 1);
  for (let k = kMin; k <= kMax; k++) {
    const te = start + k * period;
    const age = frame - te;
    if (age < 0) continue;
    const r = c * age;
    if (r > maxR || r < 0.5) continue;
    const src = path(te);
    const { vx, vy } = velocity(path, te);
    const v = Math.hypot(vx, vy);
    if (v >= c) {
      // guardrail: never draw a shock cone
      throw new Error(`Rings ${id}: source speed ${v.toFixed(2)} >= ring speed ${c}`);
    }
    const life = r / maxR;
    const a = (p.opacity ?? 1) * (1 - life * life) * clamp(age / 4);
    const gid = `${id}-g${k}`;
    let stroke = p.onlyColor ?? neutral;
    if (!p.onlyColor && p.tint && v > 0.05) {
      const ux = vx / v, uy = vy / v;
      const s = clamp((v / c) * (p.tintGain ?? 3.2));
      const ahead = mix(neutral, C.blue, s);
      const behind = mix(neutral, C.red, s);
      defs.push(
        <linearGradient key={gid} id={gid} gradientUnits="userSpaceOnUse"
          x1={src.x - ux * r} y1={src.y - uy * r * sy} x2={src.x + ux * r} y2={src.y + uy * r * sy}>
          <stop offset="0" stopColor={behind} />
          <stop offset="0.38" stopColor={behind} />
          <stop offset="0.5" stopColor={neutral} />
          <stop offset="0.62" stopColor={ahead} />
          <stop offset="1" stopColor={ahead} />
        </linearGradient>,
      );
      stroke = `url(#${gid})`;
    }
    if (p.wavy) {
      const n = Math.max(24, Math.round(r / 3));
      const waves = Math.max(6, Math.round((2 * Math.PI * r) / 46));
      let d = "";
      for (let i = 0; i <= n; i++) {
        const th = (i / n) * Math.PI * 2;
        const rr = r + Math.sin(th * waves) * p.wavy;
        d += `${i ? "L" : "M"}${src.x + Math.cos(th) * rr},${src.y + Math.sin(th) * rr * sy}`;
      }
      out.push(<path key={k} d={d + "Z"} fill="none" stroke={stroke} strokeWidth={width * (1 - life * 0.4)} opacity={a} strokeLinejoin="round" />);
    } else {
      out.push(
        <ellipse key={k} cx={src.x} cy={src.y} rx={r} ry={r * sy} fill="none" stroke={stroke}
          strokeWidth={width * (1 - life * 0.4)} opacity={a} strokeDasharray={p.dash} strokeLinecap="round" />,
      );
    }
  }
  return (
    <g>
      <defs>{defs}</defs>
      <g style={{ filter: `drop-shadow(0 0 ${width * 1.4}px ${neutral}55)` }}>{out}</g>
    </g>
  );
};

/** times (frames) at which an emitted ring reaches point (px,py): used for ear-hit ticks */
export const ringHits = (path: SourcePath, start: number, stop: number, period: number, c: number, px: number, py: number, until: number) => {
  const hits: number[] = [];
  for (let te = start; te <= stop; te += period) {
    const s = path(te);
    const d = Math.hypot(px - s.x, py - s.y);
    const th = te + d / c;
    if (th <= until) hits.push(th);
  }
  return hits;
};
