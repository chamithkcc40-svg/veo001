// ch3b.tsx - Chapter 3, back in the Prague study (f2797-3126):
// s3_toosmall (hard cut; window stars at TRUE scale barely change; magnifier "too small"; sheepish shrug)
// s3_quill   (Doppler writes; the ink trail becomes a dotted arrow that flies out of the window into
//             the night sky to a telescope; "They did." stamp). All frames GLOBAL.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { Study, WIN } from "../kit/env/Study";
import { NightSky, Pines } from "../kit/env/Interiors";
import { Pill } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { handPos } from "../kit/rig/fk";
import { DOPPLER } from "../kit/rig/characters";
import { POSE, scribble, track } from "../kit/rig/poses";
import { Magnifier, Quill, StampCheck, Telescope } from "../kit/props/Props";
import { SceneProps, SceneReg } from "../chapters/types";

// true-scale double stars: the colour shift Doppler hoped for is ~invisible. Same positions as the
// s2 window pair so continuity holds; tints are 4 % blue / 4 % red (exaggeration removed).
const PAIR = [{ x: WIN.x + 210, y: WIN.y + 130, c: C.blue }, { x: WIN.x + 300, y: WIN.y + 160, c: C.red }];
const TrueStars: React.FC<{ f: number; tint: number; s?: number }> = ({ f, tint, s = 1 }) => (
  <Svg>
    {PAIR.map((p, i) => {
      const tw2 = 0.85 + 0.15 * Math.sin(f / 5 + i * 2);
      const col = mix(C.white, p.c, tint);
      return (
        <g key={i} transform={`translate(${p.x},${p.y}) scale(${s * tw2})`}>
          <circle r={34} fill={alpha(col, 0.22)} />
          <circle r={11} fill={col} />
          <path d="M-28,0 L28,0 M0,-28 L0,28" stroke={col} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    })}
  </Svg>
);
