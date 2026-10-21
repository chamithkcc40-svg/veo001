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

// ------------------------------------------------------------------ s3_toosmall
// Hard cut back to the study (same set as s2, continuity). The window pair starts with the "hoped-for"
// exaggerated colours; on "wrong" the colour drains to true scale; on "too small" a magnifier swings
// in (overshoot) over the pair and still finds almost nothing; Doppler shrugs on the squeak (2886).
export const TooSmall: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const wrong = cue("guessedWrong") + 24; // "...wrong"
  const small = cue("tooSmall");
  const drain = prog(f, wrong, wrong + 18, ease.inOut);
  const tint = 0.85 - 0.81 * drain; // -> 0.04 true scale
  const mag = sp(f, small - 4, fps, spr.bouncy);
  const shrugAt = small + 8;
  const P = track(f, [
    [start, { ...POSE.lookUp, turn: 0.6, lookX: 1, armR: { a: 30, b: 70 }, armL: { a: 20, b: 60 }, handR: "fist" }],
    [wrong + 6, { ...POSE.lookUp, turn: 0.6, lookX: 1, headTilt: -4, armR: { a: 30, b: 70 }, armL: { a: 20, b: 60 }, handR: "fist" }],
    [shrugAt - 3, { turn: 0.2, lookX: 0.2, bodyY: 4, armR: { a: 30, b: 70 }, armL: { a: -20, b: -60 } }], // anticipation dip
    [shrugAt + 6, { ...POSE.shrug, turn: 0, lookX: 0, bodyY: -6 }],
    [shrugAt + 34, { ...POSE.shrug, turn: 0, lookX: 0, headTilt: 10, armL: { a: -35, b: -80 }, armR: { a: 35, b: 80 } }],
  ], 8);
  const expr = f < wrong + 4 ? "curious" : f < shrugAt ? "puzzled" : "sheepish";
  const cam = { x: tw(f, [start, end], [0, 170], ease.inOutSine), y: tw(f, [start, end], [0, -70], ease.inOutSine), zoom: tw(f, [start, end], [1.0, 1.2], ease.inOutSine), rot: 0, frame: f };
  const mx = PAIR[0].x + 45, my = PAIR[0].y + 15;
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Study frame={f} starPair={0} subject={
          <Svg>
            <Rig uid="dopSmall" def={DOPPLER} frame={f} x={1000} y={1000} scale={1.25} pose={P} expr={expr} />
          </Svg>
        } />
        <Layer depth={0.15}><TrueStars f={f} tint={tint} s={1} /></Layer>
        <Layer depth={0.15}>
          <Svg>
            {mag > 0.01 && (
              <g transform={`translate(${mx + (1 - mag) * 260},${my + 40 + (1 - mag) * 160}) rotate(${(1 - mag) * 30}) scale(${0.6 + 0.4 * mag})`} opacity={Math.min(1, mag * 2)}>
                <Magnifier r={150} id="tsMag">
                  {/* inside: the pair at 2.2x - still nearly white (true scale shift) */}
                  <g transform={`scale(2.2) translate(${-mx},${-my})`}>
                    <rect x={mx - 200} y={my - 200} width={400} height={400} fill={C.night} />
                    {PAIR.map((p, i) => (
                      <g key={i} transform={`translate(${p.x},${p.y})`}>
                        <circle r={30} fill={alpha(mix(C.white, p.c, 0.04), 0.25)} />
                        <circle r={10} fill={mix(C.white, p.c, 0.04)} />
                      </g>
                    ))}
                  </g>
                </Magnifier>
              </g>
            )}
          </Svg>
        </Layer>
      </Camera>
      <Pill f={f} fps={fps} at={small + 6} out={end + 6} text="too small to see" x={1500} y={170} color={C.sunLt} size={36} />
      <Pill f={f} fps={fps} at={start + 12} out={wrong + 4} text="his guess: stars visibly coloured" x={1440} y={720} color={C.lilac} size={28} />
      <Finish tint={C.sun} grade={0.12} vig={0.34} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s3_quill
// Shot A (2947-2985) study MS: Doppler writes with a small smile; the last ink line peels off the page
//   as a dotted arrow (whoosh 2961) and shoots out of frame top-right -> MATCH CUT on the arrow:
// Shot B (2985-3126) night sky WS over a pine ridge: the arrow enters bottom-left, arcs across the sky
//   and lands on a telescope ("astronomers would one day use it"); on "how stars move" the stars grow
//   small motion arrows (measured); "They did." -> stamp check slams in (stamp 3083) with dust puff.
const CUT = 2985;
/** point on the quadratic arc for t 0..1 + its tangent angle */
const arcPt = (t: number, p0: number[], p1: number[], p2: number[]) => {
  const u = 1 - t;
  const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
  const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
  const dx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
};
/** dotted arrow drawn along an arc up to t; dots trail and fade (follow-through) */
const DotArrow: React.FC<{ t: number; p0: number[]; p1: number[]; p2: number[]; color?: string; tail?: number; size?: number }> = ({ t, p0, p1, p2, color = C.sunLt, tail = 1, size = 1 }) => {
  if (t <= 0) return null;
  const n = 34;
  const dots: React.ReactNode[] = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * t;
    const age = t - u; // 0 at the head
    if (age > tail) continue;
    const p = arcPt(u, p0, p1, p2);
    dots.push(<circle key={i} cx={p.x} cy={p.y} r={7 * size * (1 - age / (tail * 1.4))} fill={color} opacity={clamp(1 - age / tail)} />);
  }
  const h = arcPt(t, p0, p1, p2);
  return (
    <g style={{ filter: `drop-shadow(0 0 10px ${alpha(color, 0.9)})` }}>
      {dots}
      <path d={`M0,0 L-34,-20 L-26,0 L-34,20 Z`} transform={`translate(${h.x},${h.y}) rotate(${h.a}) scale(${size})`} fill={color} />
    </g>
  );
};
