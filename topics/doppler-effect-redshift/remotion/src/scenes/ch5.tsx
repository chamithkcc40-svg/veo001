// ch5.tsx - Close (f5334-5790). All frames GLOBAL. s5_street + s5_sky are ONE continuous shot.
// s5_street  match-cut ring: a red ring opens from the tiny Milky Way of s4_ray ("us") and becomes the
//            iris into Sunset Street, later light (night palette, first stars). An ambulance passes
//            Pip left->right (siren_pass_soft from 5340, pass on sync.closePass 5412): rings blue
//            ahead, red behind; the Pitch Line drops on the pass. Pip smiles knowingly on "listen".
// s5_sky     Pip looks up on "hearing"; slow crane-up into the night sky; the red rings behind the
//            ambulance lift off, shrink and condense into red-shifted galaxies (sparkle 5471);
//            "LISTEN FOR THE DROP" small (sparkle 5591). Final hold keeps the upper-left and
//            upper-right sky clear for end-screen cards and the lower centre clear for captions.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, sync, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { StreetClouds, StreetFar, StreetGround, StreetHedges, StreetHouses, StreetSky } from "../kit/env/Street";
import { Rings } from "../kit/info/Rings";
import { PitchLine } from "../kit/info/PitchLine";
import { Galaxy } from "../kit/info/Galaxy";
import { Ambulance, AMB_SIREN } from "../kit/props/Props";
import { Rig } from "../kit/rig/Rig";
import { PIP } from "../kit/rig/characters";
import { POSE, track } from "../kit/rig/poses";
import { SceneProps, SceneReg } from "../chapters/types";

const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;
const AMB_S = 0.72, AMB_Y = 836, AMB_V = 15; // softer, slower pass than the cold open (< ring speed)
const PIP_X = 1240; // Pip on the right this time (mirror of the cold open staging)
const RING_C = 24, RING_P = 7;
const ambX = (t: number) => PIP_X + (t - sync("closePass")) * AMB_V; // drives left -> right
const sirenAt = (t: number) => ({ x: ambX(t) - AMB_SIREN.x * AMB_S, y: AMB_Y + AMB_SIREN.y * AMB_S }); // facing +1 mirrors x

/** match-cut iris: centre = where the tiny Milky Way of s4_ray sits on screen at its last frame */
const IRIS = { x: 400, y: 460 };
const TiltLayer: React.FC<{ k: number; ty: number; children: React.ReactNode; blur?: number }> = ({ k, ty, children, blur = 0 }) => (
  <AbsoluteFill style={{ transform: `translateY(${ty * k}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>
);
/** red rings that lift off the street and condense into galaxies (screen space, centre band only) */
const LIFT = [
  { x: 820, y: 330 }, { x: 1010, y: 230 }, { x: 1180, y: 350 }, { x: 900, y: 470 }, { x: 1110, y: 500 }, { x: 960, y: 370 },
];
const LiftRings: React.FC<{ f: number; at: number; fps: number }> = ({ f, at, fps }) => (
  <Svg style={{ filter: `drop-shadow(0 0 8px ${alpha(C.red, 0.7)})` }}>
    {LIFT.map((g, k) => {
      const b = at + k * 9;
      const p = prog(f, b, b + 80, ease.inOut);
      if (p <= 0) return null;
      const sx = 560 + k * 70, sy = 900; // where the trailing rings were on the street
      const x = mix2(sx, g.x, p) + Math.sin(p * Math.PI) * (k % 2 ? 60 : -60), y = mix2(sy, g.y, p); // arcing path
      const R = mix2(300 - k * 20, 6, ease.inOut(clamp(p * 1.1)));
      const gp = sp(f, b + 66, fps, spr.bouncy);
      return (
        <g key={k}>
          {p < 0.98 && <circle cx={x} cy={y} r={R} fill="none" stroke={C.red} strokeWidth={6 + 4 * p} opacity={0.85 * (1 - prog(f, b + 64, b + 80, ease.out))} />}
          {gp > 0.01 && <Galaxy id={"lift" + k} x={x} y={y} r={(20 + (k % 3) * 8) * gp} frame={f} shift={0.55 + 0.08 * k} tilt={0.4} rot={k * 50} dots={22} glow={1.2} />}
        </g>
      );
    })}
  </Svg>
);
