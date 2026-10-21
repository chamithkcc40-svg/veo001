// ch2.tsx - Chapter 2 "Ripples" (f869-2387): pond (title ring, Skipper still + swimming), compare split,
// ear insert, same-speed diagram, Prague study, suitcase memory, railway 1845, trackside observers,
// twist page-curl, title page -> push through the window. All frames GLOBAL; cue/sync from data/video.json.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, sync } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, LightLeak, Rays, Stars } from "../kit/fx";
import { Pond, PondPads, PondWater } from "../kit/env/Pond";
import { Street } from "../kit/env/Street";
import { Study, StudyWindowView, WIN } from "../kit/env/Study";
import { Railway, RAIL } from "../kit/env/Railway";
import { Rings } from "../kit/info/Rings";
import { PitchLine } from "../kit/info/PitchLine";
import { LetterTitle, NameTag, Pill, Timeline } from "../kit/info/Labels";
import { Ambulance, AMB_SIREN, Horn, Quill, Ship, SpiralIcon, Speedometer, Suitcase, Train, TRAIN_STACK, Flag } from "../kit/props/Props";
import { Skipper } from "../kit/rig/Skipper";
import { Rig } from "../kit/rig/Rig";
import { handPos } from "../kit/rig/fk";
import { BUYSBALLOT, DOPPLER, HORN1, HORN2, HORN3, OBSERVER_A, OBSERVER_B, PIP } from "../kit/rig/characters";
import { merge, POSE, scribble, sway, track } from "../kit/rig/poses";
import { SceneReg, SceneProps } from "../chapters/types";

// ------------------------------------------------------------------ shared: page curl (twist sting)
// The new page is revealed in the half-plane x + y > S (peeling from the bottom-right corner);
// the peeled flap is the reflection of that region across the fold line, shaded like paper.
const SCREEN: [number, number][] = [[0, 0], [1920, 0], [1920, 1080], [0, 1080]];
const clipHalf = (S: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    const a = SCREEN[i], b = SCREEN[(i + 1) % 4];
    const da = a[0] + a[1] - S, db = b[0] + b[1] - S;
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
};
const polyStr = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(" ");
/** p 0..1 curl progress -> fold-line constant S (3000 = nothing revealed, -100 = all) */
const curlS = (p: number) => 3000 - p * 3100;
export const CurlReveal: React.FC<{ p: number; uid: string; children: React.ReactNode; flap?: string }> = ({ p, uid, children, flap = C.lilac }) => {
  if (p <= 0) return null;
  const S = curlS(p);
  const rev = clipHalf(S);
  if (p >= 1 || rev.length < 3) return <AbsoluteFill>{children}</AbsoluteFill>;
  const flapPts = rev.map(([x, y]) => [S - y, S - x] as [number, number]);
  const d = `polygon(${rev.map(([x, y]) => `${x}px ${y}px`).join(",")})`;
  const n = S / 2; // fold line passes (n, n)
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: d }}>{children}</AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id={`${uid}-flap`} gradientUnits="userSpaceOnUse" x1={n} y1={n} x2={n - 260} y2={n - 260}>
            <stop offset="0" stopColor={mix(flap, C.night, 0.25)} />
            <stop offset="0.25" stopColor={flap} />
            <stop offset="1" stopColor={mix(flap, C.white, 0.35)} />
          </linearGradient>
        </defs>
        <polygon points={polyStr(flapPts.map(([x, y]) => [x + 18, y + 18]))} fill={alpha(C.night, 0.35)} style={{ filter: "blur(14px)" }} />
        <polygon points={polyStr(flapPts)} fill={`url(#${uid}-flap)`} />
      </Svg>
    </AbsoluteFill>
  );
};
