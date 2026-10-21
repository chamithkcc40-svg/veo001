// ch4b.tsx - Chapter 4, middle beats (f4234-4693). All frames GLOBAL.
// s4_chart  Chart Room (chalk wipe in, card_slide 4234): HUBBLE: DISTANCES and SLIPHER: SPEEDS cards slide
//           together, then dock as the two axis labels; 24 dots tap on (sync.chalkTaps); the rising line
//           draws on "pattern" (chalk_line 4395); Hubble steps back; punch-in on "farther"; on "faster"
//           each dot becomes a tiny galaxy with a red arrow whose length grows with distance.
// s4_grid   expansion sheet: 5x3 grid of galaxies scales evenly (stretch 4552); gold ring on one galaxy,
//           its arrows all point away; then a second galaxy, same result.
// s4_peak   scale-through + fast pull back through a galaxy field, red with distance; gold title.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, syncList, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { ChartRoom } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { LetterTitle, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { HUBBLE } from "../kit/rig/characters";
import { POSE, track, walk, merge } from "../kit/rig/poses";
import { SceneProps, SceneReg } from "../chapters/types";

const word = (text: string, after: number): number => {
  const w = V.words.find((x) => x.s >= after && x.text.toLowerCase().replace(/[^a-z0-9]/g, "") === text);
  if (!w) throw new Error("missing word " + text);
  return w.s;
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ s4_chart
// Board space = screen space (ChartRoom board: x 180..1740, y 120..820). Axes origin at AX.
// 24 schematic dots (illustrative, seeded; 07 forbids invented axis numbers): x spread along distance,
// y = slope * x + scatter, so the cloud rises with the line drawn through it. The Virgo group sits
// top-right and gets the only number tag, "Virgo galaxies ~1,000 km/s" (PNAS 2015).
const AX = { x: 340, y: 700, w: 1240, h: 500 }; // leaves room under the x axis for its label + credit
const DOTS = Array.from({ length: 24 }).map((_, i) => {
  const u = i < 20 ? 0.04 + 0.62 * Math.pow(rr("hd u" + i, 0, 1), 0.9) : 0.78 + 0.16 * rr("hd v" + i, 0, 1); // last 4 = Virgo group
  const v = clamp(u * 0.92 + rr("hd s" + i, -0.13, 0.13) * (0.4 + u), 0.02, 0.98);
  return { u, v };
}).sort((a, b) => a.u - b.u);
const dotXY = (d: { u: number; v: number }) => ({ x: AX.x + d.u * AX.w, y: AX.y - d.v * AX.h });
/** chalk stroke: slightly wobbly path with a dusty double line (seeded) */
const chalkLine = (x0: number, y0: number, x1: number, y1: number, seed: string, n = 14) =>
  Array.from({ length: n + 1 }).map((_, i) => { const t = i / n; return `${i ? "L" : "M"}${x0 + (x1 - x0) * t + rr(seed + "x" + i, -2, 2)},${y0 + (y1 - y0) * t + rr(seed + "y" + i, -2, 2)}`; }).join("");

/** chalk-wipe transition: a dusty diagonal band sweeps left -> right; everything left of it is revealed */
const WIPE4 = 16;
const ChalkWipe: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => {
  if (p <= 0) return null;
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const e = -300 + p * 2500; // leading edge x at the top; the band leans 300 px
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `polygon(-10px -10px, ${e}px -10px, ${e - 300}px 1090px, -10px 1090px)` }}>{children}</AbsoluteFill>
      <Svg>
        <path d={`M${e},-10 L${e - 300},1090`} stroke={alpha(C.chalk, 0.7)} strokeWidth={46} style={{ filter: "blur(10px)" }} />
        {Array.from({ length: 40 }).map((_, i) => {
          const t = rr("cw t" + i, 0, 1), off = rr("cw o" + i, -40, 20);
          return <circle key={i} cx={e - 300 * t + off} cy={-10 + 1100 * t} r={rr("cw r" + i, 2, 7)} fill={C.chalk} opacity={rr("cw a" + i, 0.3, 0.8)} />;
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/** paper index card that later docks as an axis label */
const DataCard: React.FC<{ title: string; sub?: string; x: number; y: number; s: number; rot: number; o: number; color: string; dock: number }> = ({ title, sub, x, y, s, rot, o, color, dock }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, whiteSpace: "nowrap" }}>
    <div style={{ background: mix(C.white, C.sunLt, 0.25 * (1 - dock)), borderRadius: 14, padding: "16px 30px 18px", boxShadow: `0 ${16 * (1 - dock)}px 40px ${alpha(C.night, 0.45 * (1 - dock))}`, borderTop: `10px solid ${color}` }}>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.night, letterSpacing: "0.05em" }}>{title}</div>
      {sub && <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 28, color: alpha(C.night, 0.7) }}>{sub}</div>}
    </div>
  </div>
);

const HC = { x0: 1650, x1: 1790, y: 1130, s: 1.55 }; // Hubble MS at board right, steps back on "pattern"
export const ChartScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const taps = syncList("chalkTaps"), pattern = cue("pattern"), farther = cue("farther"), faster = cue("faster");
  const most = cue("mostSlipher"), dist = word("distances", start);
  const wipe = prog(f, start - WIPE4 / 2, start + WIPE4 / 2, ease.inOut);
  // cards: slide in from both sides on the card_slide sfx, bump together (overshoot), then dock as axis labels
  const inL = sp(f, start + 2, fps, spr.snappy), inR = sp(f, start + 6, fps, spr.snappy);
  const dock = sp(f, dist - 10, fps, spr.smooth);
  const cA = { x: mix2(mix2(-300, 800, inL), AX.x + AX.w / 2, dock), y: mix2(430, AX.y + 66, dock), s: mix2(1, 0.62, dock), rot: mix2(-4 + 4 * inL, 0, dock) };
  const cB = { x: mix2(mix2(2220, 1140, inR), AX.x - 70, dock), y: mix2(450, AX.y - AX.h / 2, dock), s: mix2(1, 0.62, dock), rot: mix2(5 - 2 * inR, -90, dock) };
  const axes = prog(f, dist - 4, dist + 16, ease.out);
  const dotP = DOTS.map((_, i) => sp(f, taps[i] ?? taps[taps.length - 1], fps, spr.bouncy));
  const line = prog(f, pattern, pattern + 26, ease.inOut);
  const gal = DOTS.map((d, i) => sp(f, faster + Math.round(d.u * 16), fps, spr.smooth)); // near first, far last
  const punch = prog(f, farther - 6, farther + 14, ease.inOut) * (1 - prog(f, faster + 10, end, ease.inOutSine) * 0.6);
  const push = prog(f, start, end, ease.inOutSine);
  const cam = { x: mix2(-30, 30, push) + 360 * punch, y: mix2(20, -10, push) - 230 * punch, zoom: 1.0 + 0.06 * push + 0.32 * punch, rot: 0, frame: f, shake: 0.8, seed: "ch4c" };
  const back = prog(f, pattern + 2, pattern + 26, ease.inOut);
  const hx = mix2(HC.x0, HC.x1, back);
  const P = f < pattern + 2
    ? merge({ turn: -0.6, lookX: -1, lookY: -0.3, armL: { a: -118 + 5 * Math.sin(f / 3), b: -26 + 6 * Math.cos(f / 4) }, handL: "fist", lean: -4 })
    : f < pattern + 26 ? merge(walk(-(f - pattern), 20, 0.7), { turn: -0.5, lookX: -1 })
    : track(f, [
        [pattern + 26, { turn: -0.5, lookX: -1 }],
        [pattern + 38, { ...POSE.handOnChin, turn: -0.5, lookX: -1, lookY: -0.4 }],
        [faster + 2, { ...POSE.handOnChin, turn: -0.5, lookX: -1, lookY: -0.5, headTilt: 8 }],
        [faster + 14, { armL: { a: -100, b: -6 }, handL: "point", turn: -0.5, lookX: -1, lookY: -0.4, lean: -3 }],
        [end + 20, { armL: { a: -96, b: -8 }, handL: "point", turn: -0.4, lookX: -1, lookY: -0.4, lean: -2 }],
      ], 9);
  const expr = f < pattern ? "focused" : f < faster ? "curious" : "proud";
  return (
    <ChalkWipe p={wipe}>
      <AbsoluteFill>
        <Camera cam={cam}>
          <Layer depth={1}><ChartRoom frame={f} /></Layer>
          <Layer depth={1}>
            <Svg>
              <path d={chalkLine(AX.x, AX.y, AX.x + AX.w * axes, AX.y, "axx")} stroke={C.chalk} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
              <path d={chalkLine(AX.x, AX.y, AX.x, AX.y - AX.h * axes, "axy")} stroke={C.chalk} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
              {axes > 0.95 && <path d={`M${AX.x + AX.w - 18},${AX.y - 14} L${AX.x + AX.w + 4},${AX.y} L${AX.x + AX.w - 18},${AX.y + 14} M${AX.x - 14},${AX.y - AX.h + 18} L${AX.x},${AX.y - AX.h - 4} L${AX.x + 14},${AX.y - AX.h + 18}`} stroke={C.chalk} strokeWidth={6} fill="none" strokeLinecap="round" />}
              <text x={AX.x + AX.w - 10} y={AX.y + 44} textAnchor="end" fontFamily={F.display} fontSize={30} fill={alpha(C.chalk, 0.85 * axes)}>distance →</text>
              <text x={AX.x + 24} y={AX.y - AX.h + 10} fontFamily={F.display} fontSize={30} fill={alpha(C.chalk, 0.85 * axes)}>↑ speed away</text>
              {line > 0 && <path d={chalkLine(AX.x, AX.y, AX.x + AX.w * 0.98 * line, AX.y - AX.h * 0.9 * line, "hline", 20)} stroke={C.sunLt} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.95} />}
              {DOTS.map((d, i) => {
                const { x, y } = dotXY(d), p = dotP[i], g = gal[i];
                if (p <= 0.01) return null;
                const len = 30 + 120 * d.u; // arrow length grows with distance
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={11 * p * (1 - g)} fill={C.chalk} />
                    {g > 0.01 && <Galaxy id={"hd" + i} x={x} y={y} r={12 + 6 * g} frame={f} shift={0.25 + 0.75 * d.u} tilt={0.4} rot={i * 37} dots={14} glow={g} opacity={g} />}
                    {g > 0.05 && <path d={`M${x + 22},${y} L${x + 22 + len * g},${y}`} stroke={C.red} strokeWidth={6} strokeLinecap="round" />}
                    {g > 0.6 && <path d={`M${x + 10 + len * g},${y - 10} L${x + 24 + len * g},${y} L${x + 10 + len * g},${y + 10}`} stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
                  </g>
                );
              })}
            </Svg>
            <DataCard title="HUBBLE: DISTANCES" x={cA.x} y={cA.y} s={cA.s} rot={cA.rot} o={clamp(inL * 2)} color={C.sun} dock={dock} />
            <DataCard title="SLIPHER: SPEEDS" sub={f >= most ? "(most of them)" : undefined} x={cB.x} y={cB.y} s={cB.s} rot={cB.rot} o={clamp(inR * 2)} color={C.red} dock={dock} />
          </Layer>
          <Layer depth={1.12}><Svg><Rig uid="hubChart" def={HUBBLE} frame={f} x={hx} y={HC.y} scale={HC.s} pose={P} expr={expr} light={-1} /></Svg></Layer>
          <Layer depth={1.6} blur={6}><Svg><Dust seed="chalkdust" frame={f} n={24} color={C.chalk} opacity={0.3} size={[2, 6]} speed={0.5} /></Svg></Layer>
        </Camera>
        <Timeline f={f} fps={fps} at={start + 4} out={pattern} active={["1929"]} x={520} y={20} />
        <Pill f={f} fps={fps} at={farther + 12} out={end + 2} text="Virgo galaxies ~1,000 km/s" x={1340} y={150} color={C.sunLt} size={30} />
        <Pill f={f} fps={fps} at={pattern + 18} out={end + 2} text="after Hubble 1929, PNAS · 24 galaxies · schematic" x={110} y={840} anchor="left" color={alpha(C.chalk, 0.9)} size={22} />
        <ExaggeratedTag opacity={prog(f, faster, faster + 12, ease.out)} x={1824} y={60} />
        <Finish tint={C.plum} grade={0.08} vig={0.34} />
      </AbsoluteFill>
    </ChalkWipe>
  );
};

export const CH4B: SceneReg[] = [
  { ids: ["s4_chart"], C: ChartScene },
];
