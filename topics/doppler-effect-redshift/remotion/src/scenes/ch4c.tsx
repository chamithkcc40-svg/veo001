// ch4c.tsx - Chapter 4, final beats (f4693-5334). All frames GLOBAL.
// s4_lemaitre split: a study panel slides in from the left (whoosh 4691): Lemaitre writes, then offers
//             the page; timeline 1927 sits before 1929. On "But Hubble's chart" the right panel's chart
//             lights (pop 4824) and a row of silhouetted astronomers nods; both markers glow.
// s4_twist    the same page-curl sting as Ch2 (twist 4890) - the spiral motif returns.
// s4_road     a tiny ambulance zooms along a starry road (siren blip 4979); a gentle X (nope 5046).
// s4_dough    kitchen counter: dough rises (timelapse), raisin-galaxies spread without swimming;
//             the dough dissolves into a navy space sheet with the same raisins.
// s4_ray      a long wavy ray from a far galaxy to a tiny Milky Way: wiggles widen, blue->cream->RED.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, shiftColor, sp, tw } from "../util";
import { cue, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { Kitchen } from "../kit/env/Interiors";
import { Study } from "../kit/env/Study";
import { Space } from "../kit/env/Space";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { NameTag, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { HUBBLE, LEMAITRE, OBSERVER_A, OBSERVER_B, SLIPHER } from "../kit/rig/characters";
import { POSE, merge, scribble, sway, track } from "../kit/rig/poses";
import { Ambulance, BigX } from "../kit/props/Props";
import { CurlReveal } from "./ch2";
import { DOTS, chalkLine } from "./ch4b";
import { TwistCard } from "./ch2c";
import { SceneProps, SceneReg } from "../chapters/types";

const word = (text: string, after: number): number => {
  const w = V.words.find((x) => x.s >= after && x.text.toLowerCase().replace(/[^a-z0-9]/g, "") === text);
  if (!w) throw new Error("missing word " + text);
  return w.s;
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ s4_lemaitre (split, drift)
// Panel slide: the left study panel (40 % wide) slides in over the expanding field on the whoosh (4691)
// with a small overshoot; the right panel (Hubble's chart, mini) follows 6 frames later from the right.
// Left: Lemaitre writes (scribble cycle), on "two years earlier" lifts and offers the page toward the
// chart. Right: on "But Hubble's chart" the line flares (pop 4824) and three silhouetted astronomers
// nod one after another (overlapping action). Timeline under both: 1927 then 1929, both glowing.
const SPLIT = 760; // panel divider x
const Panel: React.FC<{ x: number; w: number; slide: number; from: -1 | 1; children: React.ReactNode }> = ({ x, w, slide, from, children }) => {
  const off = (1 - slide) * (from < 0 ? -(x + w + 60) : 1920 - x + 60);
  return (
    <AbsoluteFill style={{ transform: `translateX(${off}px)` }}>
      <AbsoluteFill style={{ clipPath: `inset(130px ${1920 - x - w}px 200px ${x}px round 28px)` }}>{children}</AbsoluteFill>
      <Svg><rect x={x} y={130} width={w} height={750} rx={28} fill="none" stroke={alpha(C.lilac, 0.55)} strokeWidth={6} /></Svg>
    </AbsoluteFill>
  );
};
/** right panel: Hubble's chart again (same 24 schematic dots + line), mini, on its board */
const MiniChart: React.FC<{ f: number; flare: number }> = ({ f, flare }) => {
  const ox = 900, oy = 620, w = 820, h = 430;
  return (
    <Svg>
      <rect x={800} y={40} width={1060} height={840} fill={mix(C.plum, C.night, 0.35)} />
      <rect x={850} y={90} width={960} height={600} rx={20} fill={C.board} />
      <path d={chalkLine(ox, oy, ox + w, oy, "mcx")} stroke={C.chalk} strokeWidth={5} fill="none" />
      <path d={chalkLine(ox, oy, ox, oy - h, "mcy")} stroke={C.chalk} strokeWidth={5} fill="none" />
      <path d={chalkLine(ox, oy, ox + w * 0.98, oy - h * 0.9, "mcl", 18)} stroke={C.sunLt} strokeWidth={7 + 6 * flare} fill="none" strokeLinecap="round" style={{ filter: flare > 0.05 ? `drop-shadow(0 0 ${18 * flare}px ${C.sun})` : undefined }} />
      {DOTS.map((d, i) => <circle key={i} cx={ox + d.u * w} cy={oy - d.v * h} r={8 + 3 * flare * Math.max(0, Math.sin(f / 4 - i * 0.5))} fill={C.chalk} />)}
      <text x={ox + w} y={oy + 36} textAnchor="end" fontFamily={F.display} fontSize={24} fill={alpha(C.chalk, 0.8)}>distance →</text>
      <text x={ox + 16} y={oy - h + 6} fontFamily={F.display} fontSize={24} fill={alpha(C.chalk, 0.8)}>↑ speed away</text>
      <circle cx={1700} cy={60} r={300} fill={alpha(C.sun, 0.06 + 0.1 * flare)} />
    </Svg>
  );
};

const PAGE = <g transform="translate(-6,-70) rotate(-8)"><rect x={-40} y={-56} width={80} height={104} rx={6} fill={C.dough} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-28} y={-40 + i * 18} width={56 - (i % 2) * 14} height={5} rx={2} fill={alpha(C.night, 0.4)} />)}</g>;
export const LemaitreScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const lem = cue("lemaitre"), two = cue("twoYears"), chart = cue("hubblesChart"), conv = cue("convinced");
  const slideL = sp(f, start - 2, fps, { damping: 15, stiffness: 120, mass: 0.9 });
  const slideR = sp(f, start + 6, fps, { damping: 15, stiffness: 120, mass: 0.9 });
  const flare = sp(f, chart + 6, fps, spr.bouncy) * (1 - 0.5 * prog(f, chart + 30, end, ease.inOutSine));
  const P = f < two + 4
    ? merge(POSE.write, scribble(f), { turn: 0.4 })
    : track(f, [[two + 4, merge(POSE.write, { turn: 0.4 })], [two + 16, { ...POSE.offer, turn: 0.6, lookX: 1, lean: 4 }], [end + 10, { ...POSE.offer, armR: { a: 86, b: 16 }, turn: 0.6, lookX: 1, lean: 5 }]], 10);
  const expr = f < two ? "focused" : "happy";
  const nod = (k: number) => { const t0 = conv - 6 + k * 5; return f < t0 ? 0 : 10 * Math.sin(clamp((f - t0) / 20) * Math.PI * 2) * Math.exp(-(f - t0) / 30); };
  const crowd = [{ d: OBSERVER_A, x: 1040 }, { d: SLIPHER, x: 1330 }, { d: OBSERVER_B, x: 1620 }];
  const crowdIn = sp(f, chart + 2, fps, spr.smooth);
  const drift = prog(f, start, end, ease.inOutSine);
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + 0.03 * drift}) translateX(${-12 * drift}px)` }}>
      <Space frame={f} nebula={[C.plum, C.violet]} />
      <Panel x={60} w={SPLIT - 60} slide={slideL} from={-1}>
        <AbsoluteFill style={{ transform: "translateX(-590px)" }}>
          <Study frame={f} fore={false} subject={<Svg><Rig uid="lemSt" def={LEMAITRE} frame={f} x={1000} y={1000} scale={1.25} pose={P} expr={expr} propR={f >= two + 6 ? PAGE : undefined} /></Svg>} />
        </AbsoluteFill>
      </Panel>
      <Panel x={SPLIT + 40} w={1860 - SPLIT - 40} slide={slideR} from={1}>
        <MiniChart f={f} flare={flare} />
        <Svg>
          {crowd.map((c, k) => (
            <g key={k} transform={`translate(0,${(1 - crowdIn) * 200})`}>
              <Rig uid={"crowd" + k} def={c.d} frame={f + k * 11} x={c.x} y={1130} scale={1.3} pose={{ headTilt: nod(k), turn: 0 }} expr="neutral" silhouette={mix(C.night, C.violet, 0.2)} />
            </g>
          ))}
        </Svg>
      </Panel>
      <NameTag f={f} fps={fps} at={lem + 2} out={chart} name="Georges Lemaître" sub="Belgian priest · 1927" x={110} y={170} />
      <Timeline f={f} fps={fps} at={start + 8} out={end + 20} active={f < chart + 4 ? ["1927"] : ["1927", "1929"]} x={520} y={20} />
      <Finish tint={C.violet} grade={0.1} vig={0.34} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s4_twist (sting)
// The SAME page-curl sting as Ch2 (motif recall: "one last twist"); it peels the Lemaitre split away
// on the twist sfx (4890). The music drops to a soft pad here (mix), so the spiral carries the beat.
export const Twist4: React.FC<SceneProps> = ({ f, start }) => {
  const at = start - 4;
  const p = prog(f, at, at + 16, ease.inOut);
  return <CurlReveal p={p} uid="tw4" flap={C.lilac}><TwistCard f={f} at={at} uid="tw4c" /></CurlReveal>;
};

// ------------------------------------------------------------------ s4_road (WS, track ambulance)
// Curl-out from the twist card (bottom-left corner peels) onto a starry road that floats in space:
// a tiny ambulance zooms across (siren blip 4979) with speed lines; the camera tracks it, then settles
// as it brakes centre-frame. On "like sirens down a street" (nope 5046) a big soft X draws over it,
// the ambulance shrinks back sheepishly (squash), and a lilac "not quite" pill pops.
const ROAD_Y = 700;
const StarRoad: React.FC<{ f: number; scroll: number }> = ({ f, scroll }) => (
  <Svg>
    <path d={`M-400,${ROAD_Y + 40} C400,${ROAD_Y - 10} 1500,${ROAD_Y - 10} 2400,${ROAD_Y + 40} L2400,${ROAD_Y + 140} C1500,${ROAD_Y + 90} 400,${ROAD_Y + 90} -400,${ROAD_Y + 140} Z`} fill={alpha(mix(C.violet, C.night, 0.3), 0.9)} />
    <path d={`M-400,${ROAD_Y + 40} C400,${ROAD_Y - 10} 1500,${ROAD_Y - 10} 2400,${ROAD_Y + 40}`} stroke={alpha(C.peri, 0.6)} strokeWidth={4} fill="none" />
    {Array.from({ length: 22 }).map((_, i) => {
      const x = ((i * 160 - scroll) % 3520 + 3520) % 3520 - 800;
      return <rect key={i} x={x} y={ROAD_Y + 62 - 12 * Math.cos(((x - 1000) / 2800) * Math.PI)} width={70} height={8} rx={4} fill={alpha(C.sunLt, 0.7)} />;
    })}
    <Stars seed="roadstars" frame={f} n={40} ox={-scroll * 0.2} w={2400} h={120} oy={ROAD_Y + 20} maxR={2.2} color={C.lilac} opacity={0.6} />
  </Svg>
);

export const RoadScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const nope = cue("sirensStreet") + 6; // nope sfx 5046
  const curl = prog(f, start - 2, start + 14, ease.inOut);
  // ambulance: zooms in from off-left at speed, brakes to centre (ease-out + overshoot rock), then
  // rolls slowly right; after the X it backs up a little, squashed and sheepish.
  const arrive = prog(f, start + 4, start + 50, ease.out);
  const ax = mix2(-500, 900, arrive) + 60 * prog(f, start + 50, nope, ease.inOutSine) - 40 * prog(f, nope + 4, nope + 20, ease.out);
  const vel = Math.max(0, 1 - arrive) * 1.6;
  const rock = -6 * Math.sin(clamp((f - start - 40) / 18) * Math.PI) * Math.exp(-Math.max(0, f - start - 40) / 14);
  const xP = sp(f, nope - 2, fps, { damping: 16, stiffness: 110, mass: 0.8 });
  const sq = 1 - 0.1 * sp(f, nope, fps, spr.bouncy) + 0.1 * sp(f, nope + 8, fps, spr.smooth);
  const scroll = (f - start) * 10 * (0.3 + vel);
  const cam = { x: mix2(-260, 0, arrive) + 20 * prog(f, nope, end, ease.inOutSine), y: tw(f, [start, end], [10, -20], ease.inOutSine), zoom: tw(f, [start, end], [1.0, 1.08], ease.inOutSine), rot: 0, frame: f, shake: 0.6, seed: "rd4" };
  const subject = (
    <>
      <StarRoad f={f} scroll={scroll * 0.5} />
      <Svg>
          {vel > 0.05 && [0, 1, 2, 3].map((i) => <rect key={i} x={ax - 300 - i * 70} y={ROAD_Y - 120 + i * 26} width={200 * vel} height={6} rx={3} fill={alpha(C.lilac, 0.5 * vel)} />)}
          <g transform={`translate(${ax},${ROAD_Y + 52}) rotate(${rock}) scale(${2 - sq},${sq})`}>
            <Ambulance x={0} y={0} scale={0.55} flash={f / 6} wheel={-(f - start) * 10 * (0.3 + vel)} facing={1} />
          </g>
          {xP > 0.01 && <g transform={`translate(${ax + 10},${ROAD_Y - 70}) rotate(${-6 + 6 * xP})`} opacity={0.92}><BigX size={150} color={C.pink} p={xP} /></g>}
      </Svg>
    </>
  );
  return (
    <CurlReveal p={curl} uid="rd4c" flap={C.lilac}>
      <AbsoluteFill>
        <Camera cam={cam}><Space frame={f} subject={subject} nebula={[C.purple, C.violet]} /></Camera>
        <Pill f={f} fps={fps} at={nope + 10} out={end + 2} text="not quite" x={960} y={170} color={C.lilac} size={34} />
        <Finish tint={C.violet} grade={0.1} vig={0.36} />
      </AbsoluteFill>
    </CurlReveal>
  );
};

// ------------------------------------------------------------------ s4_dough (MS, push, dissolve)
// Hard cut to the Kitchen kit (tile wall, starry window, shelves, counter). A bowl of dough rises in a
// smooth timelapse (the window sky turns over fast = time passing; dough bubble sfx 5112). Raisins are
// tiny galaxies fixed in DOUGH coordinates: they spread because the dough grows, never swimming through
// it (a gold ruler between two raisins lengthens). On "raisins apart" the dough dissolves into a navy
// space sheet carrying the same raisins, now real galaxies (match by position for s4_ray).
const BOWL = { x: 960, y: 800 };
const RAISINS = Array.from({ length: 9 }).map((_, i) => ({ u: rr("rz u" + i, -0.8, 0.8), v: rr("rz v" + i, 0.2, 0.85), rot: rr("rz r" + i, 0, 360) }));
/** dough dome: half-width W, height H above the bowl rim, soft bubbly top */
const doughPath = (W: number, H: number, f: number) => {
  const n = 24;
  let d = `M${BOWL.x - W},${BOWL.y - 40}`;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = Math.PI * (1 - t);
    const bump = 1 + 0.035 * Math.sin(t * 19 + f / 9) + 0.02 * Math.sin(t * 7 - f / 13);
    d += ` L${BOWL.x + Math.cos(a) * W * bump},${BOWL.y - 40 - Math.sin(a) * H * bump}`;
  }
  return d + " Z";
};
const raisinXY = (r: { u: number; v: number }, W: number, H: number) => ({ x: BOWL.x + r.u * W * Math.sqrt(1 - r.v * r.v * 0.6), y: BOWL.y - 40 - r.v * H * 0.85 });
