// ch3c.tsx - Chapter 3, second half (f3126-3830). All frames GLOBAL; cue frames from data/video.json.
// s3_barcode   INS Light Lab: starlight fans into the rainbow strip, 4 dark lines drop in, atoms tether
//              to them, a ghost LAB copy lifts off, the star's lines slide toward red (slide sfx 3231),
//              the offset is measured, a tiny galaxy drifts away beside it.
// s3_dome      WS night pine hill, barcode-wipe in, crane-in to the opening slit; 1912-1914 tags.
// s3_slipher   MS dome interior (red lamp): Slipher leaves the eyepiece, lifts a glass plate (clink 3469).
// s3_andromeda + s3_map  one continuous shot: the plate grows into the sky, Andromeda glides toward us
//              (lines slide BLUE, 0 -> ~300 km/s counter), then a pull back reveals ~15 spirals, nearly
//              all RED drifting outward; Pip, puzzled, in the corner on "Why".
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, V } from "../data";

/** start frame of the first spoken word matching `text` at or after global frame `after` (video.json) */
const word = (text: string, after: number): number => {
  const w = V.words.find((x) => x.s >= after && x.text.toLowerCase().replace(/[^a-z0-9]/g, "") === text);
  if (!w) throw new Error("missing word " + text);
  return w.s;
};
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { LabBg, DomeInterior, NightSky, PineHill, Pines } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Barcode, LAB_LINES } from "../kit/info/Barcode";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { NameTag, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { PIP, SLIPHER } from "../kit/rig/characters";
import { POSE, track, sway, merge } from "../kit/rig/poses";
import { GlassPlate } from "../kit/props/Props";
import { SceneProps, SceneReg } from "../chapters/types";

// ------------------------------------------------------------------ s3_barcode (INS, slow push)
// Layout (subject plane): source star far left -> prism -> fan of light -> STAR strip (lower). The
// ghost LAB copy lifts off the STAR strip on "If" and parks above it, carrying the atoms with it (the
// atoms set where the lines belong). Then the STAR lines slide toward red; the offset is measured.
const BC = { x: 600, y: 610, w: 1000, h: 104 }; // STAR (observed) strip
const LABY = 330; // parked LAB strip y
const PRISM = { x: 420, y: BC.y + BC.h / 2 }; // light enters the strip from its violet end
const SHIFT = 0.075; // strip-fraction slide toward red (exaggerated for legibility)
const lineX = (l: number, s = 0) => BC.x + (l + s) * BC.w;

/** a tiny atom glyph: nucleus + two tilted orbits with an electron each (orbits spin) */
const Atom: React.FC<{ x: number; y: number; f: number; s: number; i: number; color?: string }> = ({ x, y, f, s, i, color = C.mint }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={30} fill={alpha(color, 0.12)} />
    {[0, 60, 120].map((a, k) => (
      <g key={k} transform={`rotate(${a + i * 17})`}>
        <ellipse rx={26} ry={9} fill="none" stroke={alpha(color, 0.75)} strokeWidth={2.5} />
        <circle cx={26 * Math.cos(f / 5 + k * 2 + i)} cy={9 * Math.sin(f / 5 + k * 2 + i)} r={3.5} fill={C.white} />
      </g>
    ))}
    <circle r={7} fill={color} />
    <circle r={3} cx={-2} cy={-2} fill={C.white} opacity={0.8} />
  </g>
);

/** source star + white beam + glass prism + narrow rainbow fan entering the strip's violet end */
const PrismFeed: React.FC<{ f: number; beam: number; fan: number; o: number }> = ({ f, beam, fan, o }) => {
  const sx = 120, sy = PRISM.y - 40;
  const bx = sx + (PRISM.x - 30 - sx) * beam;
  const by = sy + (PRISM.y - sy) * beam;
  const tw2 = 0.85 + 0.15 * Math.sin(f / 4);
  return (
    <g opacity={o}>
      <defs>
        <linearGradient id="bcFan" x1="0" x2="0" y1="0" y2="1">
          {["#6A2BD8", "#3D5BFF", "#29D39A", "#FFD23D", "#FF3D5A"].map((c, i) => <stop key={i} offset={i / 4} stopColor={c} />)}
        </linearGradient>
      </defs>
      <GlowDot id="bcsrc" cx={sx} cy={sy} r={90 * tw2} color={C.core} o={0.8} />
      <circle cx={sx} cy={sy} r={12} fill={C.white} />
      {beam > 0 && <path d={`M${sx},${sy} L${bx},${by}`} stroke={C.white} strokeWidth={6} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${alpha(C.white, 0.9)})` }} />}
      {fan > 0 && <path d={`M${PRISM.x + 20},${PRISM.y} L${PRISM.x + 20 + (BC.x - PRISM.x - 20) * fan},${PRISM.y - (BC.h / 2) * fan} L${PRISM.x + 20 + (BC.x - PRISM.x - 20) * fan},${PRISM.y + (BC.h / 2) * fan} Z`} fill="url(#bcFan)" opacity={0.85} />}
      {/* prism: cel-shaded glass triangle with rim light */}
      <g transform={`translate(${PRISM.x},${PRISM.y}) rotate(${Math.sin(f / 30) * 2})`}>
        <path d="M0,-70 L62,46 L-62,46 Z" fill={alpha(C.peri, 0.45)} />
        <path d="M0,-70 L0,46 L-62,46 Z" fill={alpha(C.white, 0.14)} />
        <path d="M0,-70 L62,46" stroke={alpha(C.white, 0.85)} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** measuring bracket: dashed guides down from a LAB line and a STAR line, arrow between (toward red) */
const Measure: React.FC<{ x0: number; x1: number; yTop: number; yBot: number; p: number; o: number }> = ({ x0, x1, yTop, yBot, p, o }) => {
  if (o <= 0.01) return null;
  const ym = yBot - 26;
  const xe = x0 + (x1 - x0) * p;
  return (
    <g opacity={o}>
      <path d={`M${x0},${yTop} L${x0},${ym + 14}`} stroke={alpha(C.white, 0.7)} strokeWidth={3} strokeDasharray="8 10" />
      <path d={`M${x1},${yBot - 40} L${x1},${ym + 14}`} stroke={alpha(C.red, 0.9)} strokeWidth={3} strokeDasharray="8 10" opacity={p} />
      <path d={`M${x0},${ym} L${xe},${ym}`} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
      {p > 0.15 && <path d="M0,-11 L18,0 L0,11 Z" fill={C.red} transform={`translate(${xe},${ym})`} />}
    </g>
  );
};

/** small label to the right of a strip (Fredoka caps), slides in from the strip */
const StripTag: React.FC<{ x: number; y: number; text: string; p: number; color: string }> = ({ x, y, text, p, color }) => (
  <text x={x - (1 - p) * 30} y={y} opacity={clamp(p * 1.4)} fontFamily={F.display} fontWeight={600} fontSize={34} letterSpacing="0.1em" fill={color} dominantBaseline="middle">{text}</text>
);

const WIPE = 14; // barcode-wipe length (frames) shared by s3_barcode exit and s3_dome entrance
/** the 4 barcode lines grow sideways until they cover the frame (or shrink away when t runs 1 -> 0) */
export const BarWipe: React.FC<{ t: number; xs: number[] }> = ({ t, xs }) => {
  if (t <= 0.001) return null;
  const w = 14 + t * 560; // each bar covers about a quarter of the screen at t = 1
  return <Svg>{xs.map((x, i) => <rect key={i} x={x - w / 2} y={-40} width={w} height={1160} rx={Math.max(0, 7 - t * 7)} fill={C.night} />)}</Svg>;
};

// Beat timing (words): Starlight 3126 · barcode 3156 · dark lines 3174 · atoms 3196-3223 · If 3229
// (slide sfx 3231) · toward red 3276-3288 · moving away 3311-3345. Exit: barcode-wipe 3348-3362.
export const BarcodeScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const beam = prog(f, start + 2, start + 14, ease.out);
  const bw = word("barcode", start); // the spoken word "barcode" (sentence cue is "Starlight")
  const fan = prog(f, start + 12, bw - 2, ease.out);
  const reveal = prog(f, bw - 6, bw + 14, ease.out); // strip paints left -> right
  const dark = word("dark", start); // "dark lines"
  const lineRev = LAB_LINES.map((_, i) => sp(f, dark + i * 4, fps, spr.bouncy)); // each line drops in, overshoot
  const atomsAt = cue("atoms") + 4; // "set by its atoms": atoms pop above each line
  const atomP = LAB_LINES.map((_, i) => sp(f, atomsAt + i * 4, fps, spr.bouncy));
  const lift = sp(f, cue("slides") + 1, fps, spr.smooth); // on "If" the LAB copy lifts off with the atoms (slide sfx 3231)
  const labY = BC.y + (LABY - BC.y) * lift;
  const slideAt = word("slides", cue("slides")) - 2; // the spoken "slides" -> lands on "red"
  const slide = tw(f, [slideAt, slideAt + 30], [0, SHIFT], ease.inOut) + 0.004 * Math.sin(Math.max(0, f - slideAt - 30) / 3) * Math.exp(-Math.max(0, f - slideAt - 30) / 10) * (f > slideAt + 30 ? 1 : 0);
  const redW = word("red", slideAt);
  const meas = prog(f, redW, redW + 12, ease.out); // measured on "red"
  const away = cue("movingAway");
  const gal = prog(f, away - 6, away + 10, ease.inOut); // source star -> tiny galaxy
  const drift = prog(f, away, end, ease.inOutSine);
  const wipe = prog(f, end - WIPE, end, ease.in);
  const cam = { x: tw(f, [start, end], [-40, 60], ease.inOutSine), y: tw(f, [start, end], [30, -10], ease.inOutSine), zoom: tw(f, [start, end], [1.06, 1.16], ease.inOutSine), rot: 0, frame: f };
  const evenXs = [240, 720, 1200, 1680];
  const wipeXs = LAB_LINES.map((l, i) => mix2(lineX(l, SHIFT), evenXs[i], wipe));
  const gx = 1690 + 70 * drift, gy = BC.y - 10 - 50 * drift; // stays inside title-safe while drifting off
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Layer depth={0.3}><LabBg frame={f} strip={0.35} /></Layer>
        <Layer depth={0.55} blur={2}><Svg><Stars seed="bcfar" frame={f} n={70} maxR={2} opacity={0.5} /></Svg></Layer>
        <Layer depth={1}>
          <Svg>
            <PrismFeed f={f} beam={beam} fan={fan} o={1 - 0.6 * gal} />
            {/* LAB reference copy: appears as a ghost on top of the STAR strip, then lifts */}
            {lift > 0.01 && <Barcode id="bcLab" x={BC.x} y={labY} w={BC.w} h={BC.h * 0.8} ghost label="LAB" />}
            {lift > 0.01 && LAB_LINES.map((l, i) => <path key={i} d={`M${lineX(l)},${labY - 64} L${lineX(l)},${labY - 8}`} stroke={alpha(C.mint, 0.6 * atomP[i])} strokeWidth={2} strokeDasharray="4 6" />)}
            <Barcode id="bcStar" x={BC.x} y={BC.y} w={BC.w} h={BC.h} shift={slide} reveal={reveal} lineReveal={lineRev} />
            {LAB_LINES.map((l, i) => atomP[i] > 0.01 && <Atom key={i} f={f} i={i} x={lineX(l)} y={(lift > 0.01 ? labY : BC.y) - 92 - (1 - atomP[i]) * 40} s={0.4 + 0.6 * atomP[i]} />)}
            {lift < 0.99 && LAB_LINES.map((l, i) => atomP[i] > 0.01 && <path key={"t" + i} d={`M${lineX(l)},${BC.y - 64} L${lineX(l)},${BC.y - 6}`} stroke={alpha(C.mint, 0.7 * atomP[i] * (1 - lift))} strokeWidth={2} strokeDasharray="4 6" />)}
            {LAB_LINES.map((l, i) => <Measure key={i} x0={lineX(l)} x1={lineX(l, SHIFT)} yTop={LABY + BC.h * 0.8} yBot={BC.y} p={sp(f, redW + i * 3, fps, spr.snappy)} o={meas * (i === 1 || i === 3 ? 1 : 0.45)} />)}
            <StripTag x={BC.x} y={BC.y + BC.h + 46} text="STARLIGHT" p={prog(f, bw, bw + 14, ease.out)} color={C.lilac} />
            <StripTag x={BC.x + BC.w - 300} y={BC.y + BC.h + 46} text="→ toward red" p={meas} color={C.red} />
            {gal > 0.01 && (
              <g opacity={gal * (1 - wipe)}>
                <Galaxy id="bcgal" x={gx} y={gy} r={56 * (1 - 0.45 * drift)} frame={f} shift={0.2 + 0.8 * drift} tilt={0.35} rot={30} dots={34} />
                <path d={`M${gx - 70},${gy + 70} L${gx - 130},${gy + 108}`} stroke={alpha(C.red, 0.7 * drift)} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 14" />
              </g>
            )}
          </Svg>
        </Layer>
        <Layer depth={1.6} blur={6}><Svg><Dust seed="bcfg" frame={f} n={12} area={[-300, -200, 2500, 1500]} size={[4, 9]} color={C.lilac} opacity={0.28} speed={0.6} /></Svg></Layer>
      </Camera>
      <Pill f={f} fps={fps} at={away + 4} out={end - 4} text="source moving away" x={1850} y={470} anchor="right" color={C.red} size={30} />
      <ExaggeratedTag opacity={prog(f, slideAt, slideAt + 12, ease.out)} x={1824} y={60} text="shift exaggerated" />
      <Finish tint={C.violet} grade={0.1} vig={0.34} />
      <BarWipe t={wipe} xs={wipeXs} />
    </AbsoluteFill>
  );
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ s3_dome (WS, crane-in to the slit)
// Entrance: the barcode-wipe bars shrink away (same 4 x-positions the s3_barcode exit ended on).
// 7 planes: sky 0.05 · shooting star 0.1 · far ridge 0.25 (haze) · far pines 0.4 · hill + dome 0.6 ·
// near pines 0.85 · foreground pines 1.4 (blur). Fireflies drift by the door. On "Slipher" the slit
// opens and a pale beam of starlight pours in. Name tag + timeline carry over into s3_slipher.
const EVEN_XS = [240, 720, 1200, 1680];
const TAG_AT = () => cue("slipher") + 2;
/** overlay registered over s3_dome + s3_slipher so the tags ride across the hard cut (no re-entrance) */
export const DomeTags: React.FC<SceneProps> = ({ f, end }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Timeline f={f} fps={fps} at={cue("tens") + 8} out={end - 6} active={["1912-1914"]} x={520} y={52} />
      <NameTag f={f} fps={fps} at={TAG_AT()} out={end - 6} name="Vesto Slipher" sub="Lowell Observatory · 1912-1914" x={110} y={700} />
    </AbsoluteFill>
  );
};

/** fireflies near the dome door: seeded wander + slow blink (ambient life) */
const Fireflies: React.FC<{ f: number; n?: number; cx: number; cy: number; spread: number }> = ({ f, n = 9, cx, cy, spread }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = cx + rr("ffx" + i, -spread, spread) + noise1("ffnx" + i, f / 40) * 60;
      const y = cy + rr("ffy" + i, -spread * 0.4, spread * 0.3) + noise1("ffny" + i, f / 50) * 30;
      const on = clamp(0.5 + 0.8 * Math.sin(f / rr("ffp" + i, 9, 17) + i * 2));
      return <GlowDot key={i} id={"ff" + i} cx={x} cy={y} r={14} color={C.sunLt} o={0.9 * on} />;
    })}
  </g>
);

/** a single shooting star streak crossing the sky between frames a..b */
const Meteor: React.FC<{ f: number; a: number; b: number; x0: number; y0: number; dx: number; dy: number }> = ({ f, a, b, x0, y0, dx, dy }) => {
  if (f < a || f > b) return null;
  const t = prog(f, a, b, ease.inOut);
  const hx = x0 + dx * t, hy = y0 + dy * t;
  const o = Math.sin(t * Math.PI);
  return (
    <g opacity={o}>
      <path d={`M${hx},${hy} L${hx - dx * 0.18},${hy - dy * 0.18}`} stroke={C.white} strokeWidth={3} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${alpha(C.white, 0.9)})` }} />
      <circle cx={hx} cy={hy} r={3.5} fill={C.white} />
    </g>
  );
};

export const DomeScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const unwipe = 1 - prog(f, start, start + WIPE, ease.out); // bars shrink away (entrance)
  const slitAt = cue("slipher") - 4;
  const slit = sp(f, slitAt, 30, spr.heavy); // the dome shutter slides open, heavy + slight overshoot
  const beam = prog(f, slitAt + 6, slitAt + 26, ease.out);
  // crane-in: rise from below the ridge, then push toward the slit (anticipation: tiny dip first)
  const dip = Math.sin(prog(f, start, start + 16, ease.inOutSine) * Math.PI) * 10;
  const cam = {
    x: tw(f, [start, end], [-60, 20], ease.inOutSine),
    y: tw(f, [start, end], [140, -150], ease.inOut) + dip,
    zoom: tw(f, [start, end], [1.0, 1.42], ease.inOut), rot: tw(f, [start, end], [-0.6, 0.3], ease.inOutSine), frame: f,
  };
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Layer depth={0.05}><NightSky frame={f} seed="domesky" /></Layer>
        <Layer depth={0.1}><Svg><Meteor f={f} a={start + 30} b={start + 52} x0={260} y0={90} dx={520} dy={170} /></Svg></Layer>
        <Layer depth={0.25} blur={2}><Svg><path d="M-700,700 Q200,540 760,600 Q1300,650 1700,560 Q2200,500 2700,620 V1500 H-700 Z" fill={mix(C.violet, C.peri, 0.25)} opacity={0.75} /></Svg></Layer>
        <Layer depth={0.4} blur={1}><Pines seed="dfar" n={20} y={690} scale={[0.32, 0.5]} color={mix(C.violet, C.night, 0.35)} frame={f} /></Layer>
        <Layer depth={0.6}>
          <PineHill frame={f} slit={slit} />
          <Svg>
            {beam > 0.01 && <path d={`M${980 - 30},${320} L${980 + 30},${320} L${980 + 200},${-200} L${980 - 160},${-200} Z`} fill={alpha(C.sunLt, 0.16 * beam)} style={{ filter: "blur(10px)" }} />}
            <Fireflies f={f} cx={980} cy={600} spread={260} />
          </Svg>
        </Layer>
        <Layer depth={0.85}><Pines seed="dnear" n={9} y={860} scale={[0.75, 1.05]} color={mix(C.violet, C.night, 0.7)} x0={-500} x1={2500} frame={f} /></Layer>
        <Layer depth={1.4} blur={7}><Pines seed="dfore" n={4} y={1220} scale={[1.6, 2.2]} color={C.night} x0={-300} x1={2400} frame={f} /></Layer>
      </Camera>
      <Finish tint={C.violet} grade={0.12} vig={0.36} />
      <BarWipe t={unwipe} xs={EVEN_XS} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s3_slipher (MS, push to the plate)
// Hard cut inside the dome (red darkroom lamp). Slipher is bent to the spectrograph eyepiece; on
// "faint" he straightens (anticipation dip), lifts the developed glass plate on the clink (3469),
// eyebrows up on "spirals". The plate shows a faint spiral + its tiny barcode. The camera pushes into
// the plate so s3_andromeda can open by expanding the plate frame into the sky (match cut).
const SL = { x: 640, y: 1290, s: 2.05 };
export const PLATE_W = 190, PLATE_H = 134;
/** contents of Slipher's plate: faint spiral smudge + a short absorption barcode (shared w/ andromeda) */
export const PlateImage: React.FC<{ f: number; spiral: number; code: number }> = ({ f, spiral, code }) => (
  <g>
    <g opacity={spiral}><Galaxy id="plateGal" x={0} y={-14} r={30} frame={f} shift={0} tilt={0.45} rot={-25} dots={26} glow={0.7} /></g>
    <g opacity={code}><Barcode id="plateCode" x={-70} y={34} w={140} h={18} /></g>
  </g>
);
/** spectrograph box + eyepiece bolted to the telescope tail (drawn in the subject plane) */
const Spectrograph: React.FC<{ f: number }> = ({ f }) => (
  <g transform="translate(905,470) rotate(-8)">
    {/* telescope tail coming down from the upper right into the spectrograph */}
    <g transform="rotate(38)">
      <rect x={-75} y={-1000} width={150} height={1000} rx={40} fill={mix(C.lilac, C.violet, 0.55)} />
      <rect x={-75} y={-1000} width={40} height={1000} rx={20} fill={alpha(C.white, 0.1)} />
      <rect x={-86} y={-120} width={172} height={34} rx={12} fill={mix(C.lilac, C.violet, 0.7)} />
    </g>
    <rect x={-80} y={-10} width={160} height={110} rx={18} fill={mix(C.lilac, C.violet, 0.45)} />
    <rect x={-80} y={-10} width={160} height={28} rx={14} fill={alpha(C.white, 0.16)} />
    <rect x={-112} y={40} width={40} height={30} rx={10} fill={mix(C.lilac, C.violet, 0.7)} />
    <circle cx={50} cy={60} r={9} fill={alpha(C.red, 0.6 + 0.4 * Math.sin(f / 9))} />
  </g>
);

export const SlipherScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const faint = cue("faint"), clink = faint + 10, spirals = word("spirals", faint);
  const P = track(f, [
    [start, { lean: 12, headTilt: 10, turn: 0.7, lookX: 1, armR: { a: 70, b: 40 }, armL: { a: 15, b: 30 }, handR: "open" }],
    [faint - 8, { lean: 12, headTilt: 10, turn: 0.7, lookX: 1, armR: { a: 70, b: 40 }, armL: { a: 15, b: 30 }, handR: "open" }],
    [faint, { lean: 4, headTilt: 2, turn: 0.6, lookX: 1, armR: { a: 92, b: 12 }, armL: { a: 10, b: 20 }, handR: "fist", bodyY: 4 }], // reach to the slot
    [clink + 2, { lean: 2, headTilt: 0, turn: 0.5, lookX: 0.8, armR: { a: 95, b: 14 }, armL: { a: 10, b: 20 }, handR: "fist" }],
    [clink + 14, { ...POSE.holdUp, lean: -3, turn: 0.35, lookX: 0.7, lookY: -0.5, armL: { a: 8, b: 16 }, bodyY: -4 }], // lift (overshoot via track)
    [end, { ...POSE.holdUp, lean: -2, turn: 0.35, lookX: 0.7, lookY: -0.5, armL: { a: 8, b: 16 }, headTilt: -4 }],
  ], 8);
  const hasPlate = f >= clink;
  const expr = f < faint ? "focused" : f < spirals ? "curious" : "surprised";
  const plateGlow = sp(f, spirals, fps, spr.smooth);

export const CH3C: SceneReg[] = [
  { ids: ["s3_barcode"], C: BarcodeScene },
];
