// ch4.tsx - Chapter 4 "The Running Universe", first beats (f3830-4234). All frames GLOBAL.
// s4_dome   low WS inside the big dome: shutter grinds open (rumble 3831), Hubble walks into the pool of
//           starlight and looks up; spreading-letter chapter card; name tag. Camera tilts up.
// s4_plate  INS light table: a negative glass plate of Andromeda; one star blinks bright-dim-bright on
//           the three blips (3909/3927/3945), a loupe slides over it, Hubble's hand circles it. 1923.
// s4_scale  the negative plate INVERTS into real space (match on the Andromeda smudge); the smudge
//           resolves into a whole spiral, then the camera pulls wide and the gap to the Milky Way grows.
// s4_tapes  lateral track along a row of galaxies; three tape measures zip out (zips 4120/4135/4150).
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, sync, syncList, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { DomeInterior } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { LetterTitle, NameTag, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { HUBBLE } from "../kit/rig/characters";
import { POSE, track, walk, merge } from "../kit/rig/poses";
import { Hand } from "../kit/rig/Hand";
import { Magnifier } from "../kit/props/Props";
import { SceneProps, SceneReg } from "../chapters/types";

/** start frame of the first spoken word matching `text` at or after global frame `after` */
const word = (text: string, after: number): number => {
  const w = V.words.find((x) => x.s >= after && x.text.toLowerCase().replace(/[^a-z0-9]/g, "") === text);
  if (!w) throw new Error("missing word " + text);
  return w.s;
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ s4_dome (low WS, tilt up)
// Hard cut from the spiral map. 5 planes: dome wall + slit sky (0.3) · light shaft + motes (0.6) ·
// Hubble + floor pool (1) · near railing (1.45, blur). The shutter grinds open on the rumble (3831,
// heavy spring with a small overshoot + shake), the telescope slews, Hubble walks into the pool of
// light on "Enter" and looks up on "Hubble". Card letters spread apart as they arrive (07).
const HB = { x0: 360, x1: 760, y: 935, s: 1.4 }; // feet above the caption band
/** the starlight shaft from the slit to the floor, with drifting motes caught in it */
const Shaft: React.FC<{ f: number; o: number }> = ({ f, o }) => (
  <g opacity={o}>
    <path d="M880,-60 L1040,-60 L1150,930 L640,930 Z" fill={alpha(C.sunLt, 0.13)} style={{ filter: "blur(14px)" }} />
    <path d="M920,-60 L1000,-60 L1030,930 L760,930 Z" fill={alpha(C.white, 0.08)} style={{ filter: "blur(8px)" }} />
    <ellipse cx={830} cy={930} rx={300} ry={46} fill={alpha(C.sunLt, 0.3)} style={{ filter: "blur(10px)" }} />
    <Dust seed="shaftmotes" frame={f} n={26} area={[700, 0, 420, 1000]} size={[1.5, 3.5]} color={C.sunLt} opacity={0.7} speed={0.5} />
  </g>
);
/** giant reflector on a horseshoe mount (Mount Wilson-style, generic), low angle; slews by `angle` */
const BigScope: React.FC<{ angle: number }> = ({ angle }) => {
  const body = mix(C.lilac, C.violet, 0.5), dark = mix(C.violet, C.night, 0.45), lit = mix(C.lilac, C.white, 0.2);
  return (
    <g>
      {/* pier + horseshoe yoke */}
      <path d="M1180,1100 L1260,760 L1500,760 L1580,1100 Z" fill={dark} />
      <path d="M1180,1100 L1260,760 L1300,760 L1230,1100 Z" fill={alpha(C.white, 0.06)} />
      <circle cx={1380} cy={760} r={170} fill="none" stroke={mix(dark, C.violet, 0.3)} strokeWidth={56} strokeDasharray="540 600" transform="rotate(200,1380,760)" />
      <g transform={`translate(1380,700) rotate(${angle})`}>
        {/* open lattice tube: two rings and struts */}
        {[-170, 170].map((x) => <rect key={x} x={x - 14} y={-900} width={28} height={980} rx={10} fill={body} />)}
        {[-90, 90].map((x) => <rect key={x} x={x - 8} y={-900} width={16} height={980} rx={6} fill={alpha(body, 0.7)} />)}
        <rect x={-200} y={-940} width={400} height={70} rx={24} fill={lit} />
        <rect x={-200} y={-500} width={400} height={44} rx={16} fill={body} />
        <rect x={-210} y={0} width={420} height={140} rx={40} fill={body} />
        <rect x={-210} y={0} width={110} height={140} rx={40} fill={alpha(C.white, 0.14)} />
        <circle cx={0} cy={140} r={36} fill={dark} />
      </g>
    </g>
  );
};

export const DomeScene4: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const hub = cue("hubble");
  const slit = sp(f, sync("rumbleStart"), fps, spr.heavy); // shutter grinds open (overshoot settles)
  const grind = slit < 0.98 ? 3 * (1 - slit) : 0; // shutter judder shakes the camera while it moves
  const stopAt = hub + 6;
  const walkT = prog(f, start, stopAt, ease.inOutSine);
  const hx = mix2(HB.x0, HB.x1, walkT);
  const P = f < stopAt - 4
    ? merge(walk(f - start, 22, 1 - 0.6 * prog(f, stopAt - 14, stopAt - 4, ease.inOut)), { turn: 0.5, lookX: 0.6 })
    : track(f, [
        [stopAt - 4, { turn: 0.5, lookX: 0.6 }],
        [stopAt + 8, { ...POSE.lookUp, turn: 0.3, lookX: 0.4, headTilt: -14, lean: -3, armR: { a: 20, b: 30 } }],
        [end + 10, { ...POSE.lookUp, turn: 0.3, lookX: 0.5, headTilt: -16, lean: -4, armR: { a: 24, b: 36 } }],
      ], 9);
  const expr = f < stopAt ? "focused" : "curious";
  const scopeA = tw(f, [start, end], [-34, -24], ease.inOutSine); // the telescope slews as he arrives
  const cam = { x: tw(f, [start, end], [-30, 30], ease.inOutSine), y: tw(f, [start, end], [90, -70], ease.inOut), zoom: tw(f, [start, end], [1.02, 1.1], ease.inOutSine), rot: 0, frame: f, shake: 1 + grind, seed: "d4" };
  const spread = 0.04 + 0.12 * prog(f, start + 2, end, ease.out); // letters spread apart as they arrive
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Layer depth={0.3}><DomeInterior frame={f} slit={0.25 + 0.75 * slit} red={false} scope={false} /></Layer>
        <Layer depth={0.5}><Svg><BigScope angle={scopeA} /></Svg></Layer>
        <Layer depth={0.7}><Svg><Shaft f={f} o={clamp(slit * 1.2)} /></Svg></Layer>
        <Layer depth={1}>
          <Svg>
            <ellipse cx={hx} cy={HB.y + 4} rx={70} ry={12} fill={alpha(C.night, 0.4)} />
            <Rig uid="hubDome" def={HUBBLE} frame={f} x={hx} y={HB.y} scale={HB.s} pose={P} expr={expr} light={1} />
          </Svg>
        </Layer>
        <Layer depth={1.45} blur={6}><Svg><rect x={-200} y={985} width={2400} height={22} rx={10} fill={mix(C.violet, C.night, 0.7)} />{[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={-100 + i * 360} y={990} width={18} height={200} fill={mix(C.violet, C.night, 0.7)} />)}</Svg></Layer>
      </Camera>
      <LetterTitle f={f} fps={fps} at={start + 2} out={end + 2} text="4 · THE RUNNING UNIVERSE" size={64} color={C.white} glow={C.sun} y={190} spread={spread} stagger={1} />
      <NameTag f={f} fps={fps} at={hub + 2} out={end + 1} name="Edwin Hubble" sub="Mount Wilson · 1923 / 1929" x={110} y={700} />
      <Finish tint={C.violet} grade={0.12} vig={0.38} />
    </AbsoluteFill>
  );
};

export const CH4: SceneReg[] = [
  { ids: ["s4_dome"], C: DomeScene4 },
];
