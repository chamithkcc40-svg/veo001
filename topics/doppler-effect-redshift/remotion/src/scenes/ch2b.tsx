// ch2b.tsx - Chapter 2 "Ripples", second half (f1340-2387): compare split, ear insert, same-speed
// diagram, Prague study, suitcase memory, railway 1845, trackside observers, twist page-curl,
// title page -> push through the window. All frames GLOBAL; cue/sync frames from data/video.json.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, sync } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, LightLeak, Stars } from "../kit/fx";
import { Pond } from "../kit/env/Pond";
import { Street } from "../kit/env/Street";
import { Rings } from "../kit/info/Rings";
import { Ambulance, AMB_SIREN } from "../kit/props/Props";
import { Skipper } from "../kit/rig/Skipper";
import { SceneProps } from "../chapters/types";

// ------------------------------------------------------------------ s2_compare (pond | street, same pattern)
// Both sources move left->right at the same v/c, emit at the same period: the two ring patterns match.
const CMP_V = 2.4, CMP_C = 5, CMP_P = 9;
const cmpX = (t: number, mid: number) => 960 + CMP_V * (t - mid);

export const Compare: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const mid = (start + end) / 2;
  // angled divider sweeps in from the right (tilted 8 deg), settles with overshoot
  const dIn = sp(f, start, fps, spr.snappy);
  const div = 1920 - 960 * dIn;
  const tilt = 8 * (1 - dIn) + 3;
  const k = Math.tan((tilt * Math.PI) / 180) * 540;
  const leftClip = `polygon(0 0, ${div + k}px 0, ${div - k}px 1080px, 0 1080px)`;
  const rightClip = `polygon(${div + k}px 0, 1920px 0, 1920px 1080px, ${div - k}px 1080px)`;
  const src = (t: number) => ({ x: cmpX(t, mid), y: 600 });
  const camX = (cmpX(f, mid) - 960) * 0.6;
  const eq = sp(f, start + 12, fps, spr.bouncy);
  return (
    <AbsoluteFill>
      {/* LEFT: the pond, Skipper swimming */}
      <AbsoluteFill style={{ clipPath: leftClip }}>
        <AbsoluteFill style={{ transform: `translateX(${-480 * dIn}px)` }}>
          <Camera cam={{ x: camX, y: 0, zoom: 1.0, rot: 0, frame: f }}>
            <Pond frame={f} subject={
              <Svg>
                <Rings id="cmpP" frame={f} path={src} start={start - 120} period={CMP_P} c={CMP_C} maxR={620} tint width={6} />
                <Skipper uid="cmpsk" frame={f} x={src(f).x} y={600} scale={0.9} pose={{ swimAmt: 1, stroke: f / 4.5, scarf: f / 3, scarfAmt: 1, tapLeg: ((f - start) % CMP_P) < 3 ? 1 : 0, expr: "happy" }} />
              </Svg>
            } />
          </Camera>
          <Finish tint={C.teal} grade={0.1} vig={0.28} />
        </AbsoluteFill>
      </AbsoluteFill>
      {/* RIGHT: the street, ambulance driving the same direction */}
      <AbsoluteFill style={{ clipPath: rightClip }}>
        <AbsoluteFill style={{ transform: `translateX(${480 + 400 * (1 - dIn)}px)` }}>
          <Camera cam={{ x: camX, y: 40, zoom: 1.0, rot: 0, frame: f }}>
            <Street tod="golden" frame={f} hedges={false} subject={
              <Svg>
                <Rings id="cmpS" frame={f} path={src} start={start - 120} period={CMP_P} c={CMP_C} maxR={620} tint width={6} />
                <Ambulance x={src(f).x + AMB_SIREN.x * 0.62} y={600 - AMB_SIREN.y * 0.62} scale={0.62} facing={1} flash={f / 7} wheel={f * 4} bounce={Math.sin(f / 2.5) * 1.2} />
              </Svg>
            } />
          </Camera>
          <Finish tint={C.sun} grade={0.12} vig={0.28} />
        </AbsoluteFill>
      </AbsoluteFill>
      {/* divider + equals badge */}
      <Svg>
        <path d={`M${div + k},-10 L${div - k},1090`} stroke={C.lilac} strokeWidth={18} strokeLinecap="round" />
        <path d={`M${div + k},-10 L${div - k},1090`} stroke={C.white} strokeWidth={6} strokeLinecap="round" />
        <g transform={`translate(${div},500) scale(${eq}) rotate(${(1 - eq) * 90})`}>
          <circle r={52} fill={C.sun} />
          <circle r={52} fill="none" stroke={alpha(C.white, 0.6)} strokeWidth={4} />
          <rect x={-24} y={-16} width={48} height={10} rx={5} fill={C.night} />
          <rect x={-24} y={6} width={48} height={10} rx={5} fill={C.night} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};
