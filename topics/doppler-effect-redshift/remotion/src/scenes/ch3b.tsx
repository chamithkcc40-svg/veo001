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

const QuillStudy: React.FC<{ f: number; start: number }> = ({ f, start }) => {
  const peel = 2959; // "predicted": the ink line lifts off the page
  const P = { ...POSE.write, turn: 0.45, ...scribble(f) };
  const hp = handPos(DOPPLER, P, "R", 1000, 1000, 1.25);
  const t = prog(f, peel, CUT + 2, ease.in); // accelerates out of frame (anticipation of the cut)
  const p0 = [hp.x + 10, Math.min(hp.y + 20, 745)], p1 = [1300, 420], p2 = [2050, 60];
  const cam = { x: tw(f, [start, CUT], [-20, 60], ease.inOutSine), y: tw(f, [start, CUT], [0, -30], ease.inOutSine), zoom: tw(f, [start, CUT], [1.08, 1.0], ease.inOutSine), rot: 0, frame: f };
  return (
    <Camera cam={cam}>
      <Study frame={f} subject={
        <Svg>
          <Rig uid="dopQuill" def={DOPPLER} frame={f} x={1000} y={1000} scale={1.25} pose={P} expr={f < peel + 6 ? "focused" : "proud"} propR={<g transform="translate(4,6)"><Quill scale={0.9} /></g>} />
        </Svg>
      } deskChildren={
        <g transform="translate(1040,748) rotate(-3)">
          <rect x={-150} y={-12} width={300} height={24} rx={6} fill={mix(C.dough, C.white, 0.45)} />
          {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={-130} y={-8 + i * 3} width={rr("qink" + i, 140, 230)} height={2} rx={1} fill={alpha(C.night, 0.55)} />)}
        </g>
      } />
      <Layer depth={1}><Svg><DotArrow t={t} p0={p0} p1={p1} p2={p2} tail={0.45} /></Svg></Layer>
    </Camera>
  );
};

// moving stars that get measured on "how stars move": each grows a small velocity arrow
const SKY_STARS = Array.from({ length: 7 }).map((_, i) => ({ x: rr("qs x" + i, 260, 1700), y: rr("qs y" + i, 120, 470), a: rr("qs a" + i, -180, 180), c: i % 2 ? C.red : C.blue }));
const QuillSky: React.FC<{ f: number; end: number }> = ({ f, end }) => {
  const { fps } = useVideoConfig();
  const t = prog(f, CUT - 2, 3022, ease.outCubic); // arrow decelerates onto the telescope
  const scope = { x: 1500, y: 800 };
  const p0 = [-120, 900], p1 = [700, -120], p2 = [scope.x - 40, scope.y - 190];
  const land = 3022;
  const hit = sp(f, land, fps, spr.bouncy); // telescope recoils + rim glow on arrival
  const meas = 3043; // "how stars move"
  const did = cue("theyDid");
  const stamp = sp(f, did, fps, { damping: 9, stiffness: 260, mass: 0.6 });
  const stampP = prog(f, did - 4, did, ease.in); // drop from above, fast
  const puff = prog(f, did, did + 16, ease.out);
  const cam = { x: tw(f, [CUT, end], [-60, 60], ease.inOutSine), y: tw(f, [CUT, end], [40, -10], ease.inOutSine), zoom: tw(f, [CUT, end], [1.0, 1.06], ease.inOutSine), rot: 0, frame: f, shake: 6 * Math.exp(-Math.max(0, f - did) / 4) * (f >= did ? 1 : 0), seed: "stamp" };
  return (
    <Camera cam={cam}>
      <Layer depth={0.1}><NightSky frame={f} seed="qsky" /></Layer>
      <Layer depth={0.3}><Svg>
        {SKY_STARS.map((s, i) => {
          const g = sp(f, meas + i * 3, fps, spr.snappy);
          const dx = Math.cos((s.a * Math.PI) / 180), dy = Math.sin((s.a * Math.PI) / 180);
          const drift = Math.max(0, f - meas) * 0.25;
          return (
            <g key={i} transform={`translate(${s.x + dx * drift},${s.y + dy * drift})`}>
              <GlowDot id={"qsg" + i} cx={0} cy={0} r={34} color={mix(C.white, s.c, 0.4 * g)} o={0.7} />
              <circle r={6} fill={C.white} />
              {g > 0.01 && <path d={`M${dx * 18},${dy * 18} L${dx * (18 + 60 * g)},${dy * (18 + 60 * g)}`} stroke={mix(C.white, s.c, 0.6)} strokeWidth={5} strokeLinecap="round" opacity={g} />}
              {g > 0.01 && <path d="M0,-9 L14,0 L0,9 Z" fill={mix(C.white, s.c, 0.6)} transform={`translate(${dx * (18 + 60 * g)},${dy * (18 + 60 * g)}) rotate(${s.a})`} opacity={g} />}
            </g>
          );
        })}
      </Svg></Layer>
      <Layer depth={0.45} blur={1.5}><Svg><path d="M-600,900 Q300,700 960,760 Q1500,800 2600,700 V1500 H-600 Z" fill={mix(C.violet, C.night, 0.6)} /></Svg></Layer>
      <Layer depth={0.6}><Pines seed="qp" n={16} y={900} scale={[0.5, 0.9]} color={mix(C.violet, C.night, 0.75)} frame={f} /></Layer>
      <Layer depth={1}>
        <Svg>
          <DotArrow t={t} p0={p0} p1={p1} p2={p2} tail={0.5} size={1.2} />
          {/* telescope on a little rock: recoils on arrival, rim glow pulses */}
          <path d={`M${scope.x - 220},${scope.y + 120} Q${scope.x},${scope.y - 10} ${scope.x + 240},${scope.y + 120} Z`} fill={mix(C.violet, C.night, 0.45)} />
          <GlowDot id="qscope" cx={scope.x + 60} cy={scope.y - 170} r={200} color={C.sun} o={0.5 * hit * (f >= land ? 1 : 0)} />
          <g transform={`translate(${scope.x},${scope.y + 40})`}>
            <Telescope angle={-38 + (f >= land ? (1 - hit) * 8 : 0)} scale={1.6} color={C.lilac} />
          </g>
          {/* stamp: drops (scale 2.2 -> 1 with overshoot) and rotates; dust ring on impact */}
          {f >= did - 4 && (
            <g transform={`translate(${scope.x - 420},${scope.y - 330}) rotate(${-14 + (1 - stamp) * 10}) scale(${f < did ? 2.6 - 1.4 * stampP : 0.9 + 0.3 * stamp})`} opacity={f < did ? stampP : 1}>
              <StampCheck color={C.mint} size={110} />
            </g>
          )}
          {f >= did && puff < 1 && (
            <ellipse cx={scope.x - 420} cy={scope.y - 330} rx={130 + puff * 140} ry={(130 + puff * 140) * 0.92} fill="none" stroke={alpha(C.mint, 0.7 * (1 - puff))} strokeWidth={10 * (1 - puff) + 2} />
          )}
        </Svg>
      </Layer>
      <Layer depth={1.5} blur={8}><Pines seed="qpf" n={5} y={1180} scale={[1.4, 2.0]} color={C.night} frame={f} /></Layer>
    </Camera>
  );
};

export const QuillScene: React.FC<SceneProps> = ({ f, start, end }) => (
  <AbsoluteFill>
    {f < CUT ? <QuillStudy f={f} start={start} /> : <QuillSky f={f} end={end} />}
    <Finish tint={f < CUT ? C.sun : C.violet} grade={0.1} vig={0.32} />
  </AbsoluteFill>
);

export const CH3B: SceneReg[] = [
  { ids: ["s3_toosmall"], C: TooSmall },
  { ids: ["s3_quill"], C: QuillScene },
];
