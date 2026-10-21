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
