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

// ------------------------------------------------------------------ s4_plate (INS, slow push)
// Hard cut to a light table. A NEGATIVE glass plate (dark stars on pale glass) of Andromeda's edge.
// One star blinks bright-dim-bright on the three blips (sync.domeBlips): each blink is a dark dot that
// swells and shrinks (on a negative, bright = bigger + darker). A loupe glides over it (arc path), then
// Hubble's hand (tweed cuff) circles the star with a grease pencil. Timeline wakes on 1923.
const PL = { x: 960, y: 440, w: 1040, h: 640 }; // bottom edge stays above the caption band through the push // plate rectangle centre + size
const VAR = { x: 1150, y: 380 }; // the blinking star (plate space = screen space before the push)
/** negative plate content: pale glass, dark star specks, the dark smudge of Andromeda's disc */
const NegPlate: React.FC<{ f: number; blink: number }> = ({ f, blink }) => (
  <g>
    <rect x={PL.x - PL.w / 2} y={PL.y - PL.h / 2} width={PL.w} height={PL.h} rx={14} fill={mix(C.lilac, C.white, 0.35)} />
    <ellipse cx={780} cy={490} rx={470} ry={170} transform="rotate(-24,780,490)" fill={alpha(C.night, 0.18)} style={{ filter: "blur(40px)" }} />
    <ellipse cx={730} cy={515} rx={190} ry={66} transform="rotate(-24,730,515)" fill={alpha(C.night, 0.4)} style={{ filter: "blur(22px)" }} />
    {Array.from({ length: 90 }).map((_, i) => (
      <circle key={i} cx={rr("np x" + i, PL.x - PL.w / 2 + 20, PL.x + PL.w / 2 - 20)} cy={rr("np y" + i, PL.y - PL.h / 2 + 20, PL.y + PL.h / 2 - 20)} r={rr("np r" + i, 1.2, 4.2)} fill={alpha(C.night, rr("np o" + i, 0.45, 0.9))} />
    ))}
    {/* the variable star: swells darker when bright (it is a negative) */}
    <circle cx={VAR.x} cy={VAR.y} r={4 + 7 * blink} fill={alpha(C.night, 0.75 + 0.2 * blink)} />
    <circle cx={VAR.x} cy={VAR.y} r={14 + 16 * blink} fill={alpha(C.night, 0.12 * blink)} />
    {/* emulsion scratches + edge label strip */}
    <path d={`M${PL.x - 420},${PL.y - 300} l300,40 M${PL.x + 120},${PL.y + 280} l260,-30`} stroke={alpha(C.white, 0.5)} strokeWidth={1.5} />
    <rect x={PL.x - PL.w / 2 + 30} y={PL.y + PL.h / 2 - 70} width={260} height={40} rx={6} fill={alpha(C.sepia, 0.55)} />
    <text x={PL.x - PL.w / 2 + 46} y={PL.y + PL.h / 2 - 42} fontFamily={F.period} fontSize={26} fill={alpha(C.night, 0.75)}>M31 · Oct. 1923</text>
    <rect x={PL.x - PL.w / 2} y={PL.y - PL.h / 2} width={PL.w} height={PL.h} rx={14} fill="none" stroke={alpha(C.white, 0.7)} strokeWidth={6} />
    <rect x={PL.x - PL.w / 2 + 10} y={PL.y - PL.h / 2 + 10} width={PL.w * 0.3} height={PL.h - 20} rx={10} fill={alpha(C.white, 0.08 + 0.02 * Math.sin(f / 20))} />
  </g>
);

/** INS hand: Hubble's tweed sleeve + shirt cuff + fist holding a grease pencil; origin = pencil tip.
 *  Built from the rig's own Hand component and HUBBLE costume colours (same character, closer lens). */
const PencilHand: React.FC<{ rot: number }> = ({ rot }) => {
  const K = HUBBLE.costume;
  return (
    <g transform={`rotate(${rot})`}>
      <rect x={-8} y={-150} width={16} height={150} rx={6} fill={C.red} />
      <path d="M-8,-12 L0,8 L8,-12 Z" fill={C.red} />
      <rect x={-8} y={-150} width={5} height={140} fill={alpha(C.white, 0.25)} />
      <g transform="translate(0,-120) rotate(180) scale(2.6)"><Hand kind="fist" r={26} skin={K.skin} shade={K.skinSh} side="R" worldRot={0} /></g>
      <rect x={-46} y={-260} width={92} height={60} rx={18} fill={C.white} />
      <rect x={-62} y={-560} width={124} height={320} rx={40} fill={K.top} />
      <rect x={-62} y={-560} width={36} height={320} rx={18} fill={alpha(C.white, 0.1)} />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M-60,${-540 + i * 52} l120,-18`} stroke={alpha(K.top2, 0.6)} strokeWidth={4} />)}
    </g>
  );
};

export const PlateScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const blips = syncList("domeBlips"); // bright, dim, bright
  const lvl = [1, 0.15, 1];
  let blink = 0.35;
  blips.forEach((b, i) => { const k = clamp(1 - Math.abs(f - b - 2) / 7); if (k > 0) blink = mix2(blink, lvl[i], ease.out(k)); });
  // loupe glides in on an arc (from lower-left), lands over the star after blip 1, lifts away before the pencil
  const lp = sp(f, blips[0] - 12, fps, spr.smooth), lOut = prog(f, blips[2] + 8, blips[2] + 20, ease.in);
  const la = mix2(-0.9, 0, lp) + 0.7 * lOut;
  const lx = VAR.x + Math.sin(la) * 520, ly = VAR.y + (1 - Math.cos(la)) * 380 + 30 * lOut;
  // pencil: enters from lower-right, circles the star (one lap with overshoot), then a tick mark
  const penIn = sp(f, blips[2] + 4, fps, spr.snappy);
  const circ = prog(f, blips[2] + 14, blips[2] + 40, ease.inOut);
  const ang = -Math.PI / 2 + circ * Math.PI * 2.15;
  const R = 46;
  const tipX = mix2(VAR.x + 600, VAR.x + Math.cos(ang) * R, penIn), tipY = mix2(VAR.y + 500, VAR.y + Math.sin(ang) * R * 0.9, penIn);
  const penOut = prog(f, end - 14, end, ease.in);
  const ring = Array.from({ length: 41 }).map((_, i) => { const a = -Math.PI / 2 + (i / 40) * circ * Math.PI * 2.15; return `${i ? "L" : "M"}${VAR.x + Math.cos(a) * R},${VAR.y + Math.sin(a) * R * 0.9}`; }).join("");
  const z = tw(f, [start, end], [1.0, 1.22], ease.inOutSine);
  const cam = { x: tw(f, [start, end], [0, 170], ease.inOutSine), y: tw(f, [start, end], [0, 40], ease.inOutSine), zoom: z, rot: tw(f, [start, end], [-1.2, 0.4], ease.inOutSine), frame: f, shake: 0.8, seed: "pl4" };
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Layer depth={0.4}><Svg><rect x={-400} y={-300} width={2800} height={1700} fill={mix(C.plum, C.night, 0.55)} />{Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-300 + i * 300} y={-300} width={8} height={1700} fill={alpha(C.night, 0.25)} />)}</Svg></Layer>
        <Layer depth={0.8}><Svg><rect x={PL.x - PL.w / 2 - 70} y={PL.y - PL.h / 2 - 60} width={PL.w + 140} height={PL.h + 120} rx={36} fill={mix(C.plum, C.sun, 0.18)} /><rect x={PL.x - PL.w / 2 - 40} y={PL.y - PL.h / 2 - 30} width={PL.w + 80} height={PL.h + 60} rx={24} fill={C.sunLt} opacity={0.9} /></Svg></Layer>
        <Layer depth={1}>
          <Svg>
            <NegPlate f={f} blink={blink} />
            {circ > 0 && <path d={ring} fill="none" stroke={C.red} strokeWidth={7} strokeLinecap="round" opacity={0.9} />}
            {circ >= 1 && <text x={VAR.x + 62} y={VAR.y - 40} fontFamily={F.period} fontSize={52} fill={C.red} opacity={prog(f, blips[2] + 40, blips[2] + 48, ease.out)}>VAR!</text>}
            {lp > 0.01 && lOut < 1 && (
              <g transform={`translate(${lx},${ly})`} opacity={1 - lOut}>
                <Magnifier id="loupe4" r={120}>
                  <g transform={`translate(${-VAR.x * 1.8},${-VAR.y * 1.8}) scale(1.8)`}><NegPlate f={f} blink={blink} /></g>
                </Magnifier>
              </g>
            )}
            {penIn > 0.01 && <g transform={`translate(${tipX + penOut * 400},${tipY + penOut * 300})`}><PencilHand rot={-38 + 6 * Math.sin(ang)} /></g>}
          </Svg>
        </Layer>
        <Layer depth={1.5} blur={6}><Svg><Dust seed="pl4d" frame={f} n={14} color={C.sunLt} opacity={0.3} size={[3, 7]} speed={0.5} /></Svg></Layer>
      </Camera>
      <Timeline f={f} fps={fps} at={cue("y1923") + 2} out={end + 30} active={["1923"]} x={520} y={40} />
      <Finish tint={C.plum} grade={0.08} vig={0.36} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s4_scale (WS, pull to wide)
// Match-cut: the negative "develops" (pale plate rect flashes and fades from the frame the plate shot
// ended on) and the dark smudge becomes the real glowing spiral at the SAME screen spot; the red pencil
// ring lingers on the variable star. On "whole galaxy" the arms resolve; on "far" the camera pulls
// wide, the Milky Way slides in at left and the gap keeps widening on "beyond" (scale bar stretches).
const PLATE_END = { x: 325, y: 14, w: 1269, h: 781 }; // plate rect on screen at the end of s4_plate
const SMUDGE = { x: 570, y: 440 }, VAR_SCR = { x: 1022, y: 345 };
const ScaleBar: React.FC<{ x0: number; x1: number; y: number; o: number; f: number }> = ({ x0, x1, y, o, f }) => {
  if (o <= 0.01 || x1 <= x0) return null;
  const n = Math.max(2, Math.floor((x1 - x0) / 60));
  return (
    <g opacity={o}>
      <path d={`M${x0},${y} L${x1},${y}`} stroke={alpha(C.lilac, 0.85)} strokeWidth={4} strokeDasharray="14 10" strokeDashoffset={-f * 1.5} />
      {Array.from({ length: n + 1 }).map((_, i) => <path key={i} d={`M${x0 + ((x1 - x0) * i) / n},${y - 8} v16`} stroke={alpha(C.lilac, 0.5)} strokeWidth={2} />)}
      <path d={`M${x0 + 18},${y - 14} L${x0},${y} L${x0 + 18},${y + 14} M${x1 - 18},${y - 14} L${x1},${y} L${x1 - 18},${y + 14}`} stroke={C.sunLt} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
export const ScaleScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const whole = word("whole", start), far = cue("farBeyond"), beyond = word("beyond", far);
  const dev = prog(f, start, start + 14, ease.out); // negative develops into the positive sky
  const resolve = sp(f, whole - 4, fps, spr.smooth); // arms resolve, glow blooms
  const pull = prog(f, far - 8, far + 22, ease.inOut);
  const widen = prog(f, beyond - 4, end + 20, ease.inOutSine);
  const gx = mix2(SMUDGE.x, 1400, pull) + 160 * widen, gy = mix2(SMUDGE.y, 450, pull);
  const gr = mix2(250, 120, pull) * (1 - 0.15 * widen);
  const mx = mix2(-360, 380, pull) - 40 * widen, my = 520;
  const cam = { x: tw(f, [start, end], [0, 40], ease.inOutSine), y: tw(f, [start, end], [-10, 20], ease.inOutSine), zoom: mix2(1.1, 0.98, pull), rot: 0, frame: f };
  const subject = (
    <Svg>
      <Galaxy id="mw4" x={mx} y={my} r={140} frame={f} shift={0} tilt={0.72} rot={-8} dots={60} glow={0.9} armColor={C.sunLt} opacity={pull} />
      <Galaxy id="and4" x={gx} y={gy} r={gr} frame={f} shift={0} tilt={0.62} rot={-24} dots={Math.round(40 + 40 * resolve)} glow={0.6 + 0.6 * resolve} opacity={0.55 + 0.45 * dev} />
      <ScaleBar x0={mx + 190} x1={gx - gr * 1.6} y={760} o={pull} f={f} />
      <g opacity={(1 - pull) * prog(f, start, start + 6, ease.out)}>
        <circle cx={VAR_SCR.x} cy={VAR_SCR.y} r={56} fill="none" stroke={C.red} strokeWidth={6} opacity={0.8} />
        <circle cx={VAR_SCR.x} cy={VAR_SCR.y} r={5} fill={C.sunLt} />
      </g>
    </Svg>
  );
  return (
    <AbsoluteFill>
      <Camera cam={cam}><Space frame={f} subject={subject} nebula={[C.purple, C.violet]} /></Camera>
      {dev < 1 && <Svg><rect x={PLATE_END.x - 200 * dev} y={PLATE_END.y - 120 * dev} width={PLATE_END.w + 400 * dev} height={PLATE_END.h + 240 * dev} rx={14} fill={mix(C.lilac, C.white, 0.35)} opacity={1 - dev} /></Svg>}
      <Pill f={f} fps={fps} at={whole + 6} out={far + 4} text="a galaxy of its own" x={SMUDGE.x + 40} y={760} color={C.sunLt} size={34} />
      <Pill f={f} fps={fps} at={far + 10} out={end + 30} text="MILKY WAY · us" x={mx} y={640} color={C.sun} size={28} />
      <Pill f={f} fps={fps} at={far + 16} out={end + 30} text="ANDROMEDA" x={gx} y={620} color={C.lilac} size={28} />
      <Finish tint={C.violet} grade={0.1} vig={0.34} />
    </AbsoluteFill>
  );
};

export const CH4: SceneReg[] = [
  { ids: ["s4_dome"], C: DomeScene4 },
  { ids: ["s4_plate"], C: PlateScene },
  { ids: ["s4_scale"], C: ScaleScene },
];
