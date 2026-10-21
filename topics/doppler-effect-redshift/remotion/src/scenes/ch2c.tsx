// ch2c.tsx - Chapter 2 "Ripples", final beats (f2177-2387): s2_twist (page-curl sting with the spiral
// icon, used exactly twice in the film per 07) and s2_paper (title-page CU -> tilt up to Doppler at the
// window -> push through the window into the blue/red double stars). All frames GLOBAL.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { Study } from "../kit/env/Study";
import { Rig } from "../kit/rig/Rig";
import { DOPPLER } from "../kit/rig/characters";
import { POSE, scribble, track } from "../kit/rig/poses";
import { Candle, Quill, SpiralIcon } from "../kit/props/Props";
import { CurlReveal } from "./ch2";
import { SceneProps, SceneReg } from "../chapters/types";

// ------------------------------------------------------------------ s2_twist (sting)
// The curl peels the observers shot away (fwip sfx at 2174). A spiral winds in with anticipation
// (counter-turn), overshoots, then keeps a slow spin; concentric "ripple" rings breathe out of it
// and sparks orbit (secondary motion). Music is out here, so the picture carries the beat.
const TW_CURL = 16;
export const TwistCard: React.FC<{ f: number; at: number; uid: string }> = ({ f, at, uid }) => {
  const { fps } = useVideoConfig();
  const t = f - at;
  const wind = sp(f, at + 4, fps, spr.bouncy); // spiral pop (overshoot + settle)
  const pre = prog(f, at, at + 5, ease.out) * (1 - prog(f, at + 5, at + 10, ease.inOut)); // anticipation
  const rot = -40 * pre + wind * 360 + t * 3; // counter-turn, wind-in, then slow drift
  const scale = 0.2 + 0.8 * wind;
  const cx = 960, cy = 470;
  const bg = { top: C.violet, mid: C.purple, low: C.magenta };
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <radialGradient id={`${uid}-bg`} cx="0.5" cy="0.44" r="0.8">
            <stop offset="0" stopColor={bg.mid} />
            <stop offset="0.55" stopColor={bg.top} />
            <stop offset="1" stopColor={C.night} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill={`url(#${uid}-bg)`} />
        {/* paper fibres: the sting is a page, so it gets a faint ruled texture */}
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={i} x={0} y={70 + i * 64} width={1920} height={2} fill={alpha(C.lilac, 0.05)} />
        ))}
        <rect x={210} y={0} width={3} height={1080} fill={alpha(C.pink, 0.12)} />
      </Svg>
      <Svg>
        {/* ripple rings breathe out of the spiral every 9 frames (chapter motif) */}
        {Array.from({ length: 6 }).map((_, k) => {
          const born = at + 8 + k * 9;
          const age = f - born;
          if (age < 0) return null;
          const r = 90 + age * 9;
          const o = clamp(1 - age / 42) * 0.55;
          return <circle key={k} cx={cx} cy={cy} r={r} fill="none" stroke={k % 2 ? C.pink : C.sunLt} strokeWidth={5} opacity={o} />;
        })}
        <GlowDot id={`${uid}-g`} cx={cx} cy={cy} r={260 * scale} color={C.sun} o={0.45 * wind} />
        <g transform={`translate(${cx},${cy}) scale(${scale})`}>
          <g transform="translate(8,12)" opacity={0.35}><SpiralIcon r={120} color={C.night} rot={rot} /></g>
          <SpiralIcon r={120} color={C.sun} rot={rot} />
          <g opacity={0.55}><SpiralIcon r={120} color={C.sunLt} rot={rot - 6} /></g>
        </g>
        {/* orbiting sparks: overlapping action, each on its own phase and radius */}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = rr(`${uid}sa${i}`, 0, 6.28) + t * (0.05 + 0.02 * (i % 3));
          const R = (170 + i * 22) * wind;
          const s = sp(f, at + 8 + i * 2, fps, spr.snappy);
          return <circle key={i} cx={cx + Math.cos(a) * R} cy={cy + Math.sin(a) * R * 0.8} r={(4 + (i % 3) * 2) * s} fill={i % 2 ? C.lilac : C.sunLt} opacity={0.85} />;
        })}
      </Svg>
      <Dust seed={`${uid}d`} frame={f} n={30} color={C.lilac} opacity={0.35} />
      <Finish tint={C.magenta} grade={0.1} vig={0.34} />
    </AbsoluteFill>
  );
};

export const Twist: React.FC<SceneProps> = ({ f, start }) => {
  const curlAt = start - 4; // curl lands on the fwip (sfx 2174)
  const p = prog(f, curlAt, curlAt + TW_CURL, ease.inOut);
  return <CurlReveal p={p} uid="tw1" flap={C.lilac}><TwistCard f={f} at={curlAt} uid="tw1c" /></CurlReveal>;
};
