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

// ------------------------------------------------------------------ pond sequence: s2_pond + s2_still + s2_swim
// One continuous top-down shot. Physics (07 sec. 13): ring k is born at tap k, centred where Skipper
// WAS at that tap, growing at POND_C px/frame. Skipper swims at ~0.5 c (never >= c).
export const POND_C = 5;
const TAP_P = 15;
const SK_Y = 520;
const SK_X0 = 820;
const SWIM_V = 2.6;
const SWIM_RAMP = 18;
const DROP = { x: 960, y: 470 };
const swim0 = () => cue("swims") + 2; // skitter sfx frame
/** Skipper's world x at frame t: still, then a smooth ramp to a steady swim with a small stroke surge */
export const skX = (t: number) => {
  const d = t - swim0();
  if (d <= 0) return SK_X0;
  const base = d < SWIM_RAMP ? (SWIM_V * d * d) / (2 * SWIM_RAMP) : SWIM_V * (d - SWIM_RAMP / 2);
  return SK_X0 + base + 3 * Math.sin(d / 4.5) * clamp(d / SWIM_RAMP);
};
export const skPath = (t: number) => ({ x: skX(t), y: SK_Y });
const tapStart = () => sync("pondTapStart");
const tapEnd = () => sync("pondTapEnd");

/** tap-leg curve: leg comes down 4 f before each tap, touches for 3 f, lifts over 5 f */
const tapLegAt = (f: number) => {
  if (f < tapStart() - 4 || f > tapEnd() + 8) return 0;
  const ph = (((f - tapStart()) % TAP_P) + TAP_P) % TAP_P;
  if (ph <= 2) return 1;
  if (ph <= 7) return 1 - ease.out((ph - 2) / 5);
  if (ph >= 11) return ease.inOut((ph - 11) / 4);
  return 0;
};

/** ring edges along the horizontal through the source line, on one side (dir) of the current source */
const ringEdges = (f: number, dir: 1 | -1, n: number) => {
  const out: number[] = [];
  const x = skX(f);
  for (let te = tapStart(); te <= Math.min(f, tapEnd()); te += TAP_P) {
    const r = POND_C * (f - te);
    if (r < 6 || r > 900) continue;
    const e = skX(te) + dir * r;
    if (dir * (e - x) > 4) out.push(e);
  }
  out.sort((a, b) => dir * (a - b));
  return out.slice(0, n);
};

const Brackets: React.FC<{ f: number; at: number; dir: 1 | -1; color: string; y: number; lineY: number; n?: number; label?: string; out?: number }> = ({ f, at, dir, color, y, lineY, n = 4, label, out = 1e9 }) => {
  const { fps } = useVideoConfig();
  const p = sp(f, at, fps, spr.snappy);
  const e = prog(f, out - 8, out, ease.in);
  if (p <= 0.01 || e >= 1) return null;
  const edges = ringEdges(f, dir, n);
  return (
    <g opacity={Math.min(1, p * 1.5) * (1 - e)}>
      {edges.map((x, i) => {
        if (i === 0) return null;
        const a = edges[i - 1], b = x;
        const k = sp(f, at + i * 3, fps, spr.bouncy);
        const lo = Math.min(a, b), w = Math.abs(b - a);
        const h = -20 * k;
        return (
          <g key={i}>
            <path d={`M${a},${lineY + 10} L${a},${y}`} stroke={alpha(color, 0.5)} strokeWidth={2} strokeDasharray="4 6" />
            <path d={`M${lo + 3},${y} L${lo + 3},${y - h} L${lo + w - 3},${y - h} L${lo + w - 3},${y}`} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${alpha(color, 0.7)})` }} />
            {label === "=" && <text x={lo + w / 2} y={y + 44} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={30} fill={color} opacity={k}>=</text>}
          </g>
        );
      })}
      {edges.map((x, i) => <circle key={"d" + i} cx={x} cy={lineY} r={6 * sp(f, at + i * 3, fps, spr.bouncy)} fill={color} />)}
      {label && label !== "=" && edges.length > 1 && (
        <text x={(edges[0] + edges[Math.min(edges.length - 1, 3)]) / 2} y={y + 62} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={40} fill={color} letterSpacing="3" style={{ filter: `drop-shadow(0 3px 6px ${alpha(C.night, 0.6)})` }}>{label}</text>
      )}
    </g>
  );
};

/** chapter card "2 · RIPPLES": letters ride a ripple ring (drop -> ring -> letters settle on its upper arc) */
const RippleTitle: React.FC<{ f: number; at: number; out: number; cx: number; cy: number }> = ({ f, at, out, cx, cy }) => {
  const { fps } = useVideoConfig();
  const text = "RIPPLES";
  const grow = sp(f, at, fps, { damping: 16, stiffness: 70, mass: 1 });
  const ex = prog(f, out - 10, out, ease.in);
  if (f < at || ex >= 1) return null;
  const R = 70 + 190 * grow + ex * 160;
  const spread = 13; // deg per letter
  const a0 = -90 - (spread * (text.length - 1)) / 2;
  const badge = sp(f, at + 4, fps, spr.bouncy);
  return (
    <g opacity={1 - ex}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.white} strokeWidth={6} opacity={0.9} style={{ filter: `drop-shadow(0 0 10px ${alpha(C.white, 0.7)})` }} />
      <circle cx={cx} cy={cy} r={R * 0.82} fill="none" stroke={C.mint} strokeWidth={2} opacity={0.5} />
      {text.split("").map((ch, i) => {
        const p = sp(f, at + 6 + i * 3, fps, spr.bouncy);
        const a = ((a0 + i * spread + (1 - p) * -30 + Math.sin(f / 20 + i) * 0.6) * Math.PI) / 180;
        const rr0 = R + 46;
        const x = cx + Math.cos(a) * rr0, y = cy + Math.sin(a) * rr0 + (1 - p) * 20;
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontFamily={F.display} fontWeight={700} fontSize={84 * (0.6 + 0.4 * p)} fill={C.white} opacity={Math.min(1, p * 1.5)}
            transform={`rotate(${(a * 180) / Math.PI + 90},${x},${y})`} style={{ filter: `drop-shadow(0 5px 0 ${alpha(C.night, 0.35)})` }}>{ch}</text>
        );
      })}
      <g transform={`translate(${cx},${cy}) scale(${badge * (1 + Math.sin(f / 9) * 0.02)}) rotate(${(1 - badge) * -40})`}>
        <circle r={64} fill={C.sun} />
        <circle r={64} fill="none" stroke={alpha(C.white, 0.5)} strokeWidth={4} />
        <text y={26} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={80} fill={C.night}>2</text>
      </g>
    </g>
  );
};

const PondSeq: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const land = cue("bug") + 6; // skitter sfx
  const perfect = cue("perfect");
  const front = cue("inFront");
  const behind = cue("behind");
  const sw = swim0();
  // camera: push-in during the title, settle as Skipper lands, then pan with the swim
  const zoom = tw(f, [start, land - 4], [1.0, 1.09], ease.inOutSine) - tw(f, [land - 4, land + 30], [0, 0.05], ease.inOut) - tw(f, [sw, sw + 60], [0, 0.04], ease.inOut);
  const camX = (skX(f) - SK_X0) * 0.55 + tw(f, [start, sw], [-30, 0], ease.inOutSine);
  const camY = tw(f, [start, land], [-40, 0], ease.inOutSine) + noise1("pcy", f / 40) * 6;
  const cam = { x: camX, y: camY, zoom, rot: tw(f, [start, end], [-1.2, 0.8], ease.inOutSine), frame: f };
  // drop: a droplet falls toward the water (shrinks in top-down), splash at the bloop
  const bloop = start + 4;
  const dropP = prog(f, start - 8, bloop, ease.in);
  // Skipper landing: arcs in from the upper left, big (near the lens) -> water level, squash on contact
  const flyP = prog(f, land - 20, land, ease.inOut);
  const lx = mix2(260, SK_X0, flyP), ly = mix2(-80, SK_Y, flyP) - Math.sin(flyP * Math.PI) * 120;
  const airScale = 1.15 + (1 - flyP) * 0.9;
  const sq = f < land ? 1 : 1 - 0.22 * Math.exp(-(f - land) / 4) * Math.cos((f - land) / 2.2);
  const onWater = f >= land;
  const sx = onWater ? skX(f) : lx;
  const sy = onWater ? SK_Y : ly;
  const d = f - sw;
  const swimAmt = clamp(d / 10);
  const look = tw(f, [behind - 2, behind + 10], [0, 1], ease.out) * (1 - tw(f, [end - 30, end - 14], [0, 1], ease.inOut));
  const bow = prog(f, end - 26, end - 16, ease.out) * (1 - prog(f, end - 12, end - 2, ease.inOut));
  const expr = f < tapStart() ? "happy" : f < perfect ? "focused" : f < sw ? "proud" : f < behind ? "happy" : f < end - 30 ? "surprised" : "proud";
  const antenna = Math.sin(f / 5) * 6 * (onWater ? 1 : 2) + (onWater ? 14 * Math.exp(-(f - land) / 6) * Math.cos((f - land) / 2) : 0) + swimAmt * -8;
  const aheadK = prog(f, front, front + 22, ease.inOut);
  const behindK = prog(f, behind, behind + 22, ease.inOut);
  const subject = (
    <Svg>
      {/* title drop + rings */}
      {dropP > 0 && dropP < 1 && <g transform={`translate(${DROP.x},${DROP.y}) scale(${1.8 - dropP * 1.5})`}><ellipse rx={20} ry={24} fill={alpha(C.white, 0.85)} /><ellipse cx={-6} cy={-8} rx={6} ry={8} fill={C.white} /></g>}
      <Rings id="pdrop" frame={f} path={() => DROP} start={bloop} stop={bloop + 24} period={12} c={7} maxR={1200} width={6} opacity={0.85} />
      <RippleTitle f={f} at={bloop} out={cue("bug") - 4} cx={DROP.x} cy={DROP.y} />
      {/* landing splash */}
      <Rings id="pland" frame={f} path={() => ({ x: SK_X0, y: SK_Y })} start={land} stop={land} period={40} c={7} maxR={420} width={4} opacity={0.7} />
      {/* Skipper's taps: RIPPLE A (still) then RIPPLE B (moving) */}
      <Rings id="ptap" frame={f} path={skPath} start={tapStart()} stop={tapEnd()} period={TAP_P} c={POND_C} maxR={900} tint aheadK={aheadK} behindK={behindK} width={6.5} />
      <Brackets f={f} at={perfect + 4} out={sw} dir={1} color={C.white} y={SK_Y + 150} lineY={SK_Y} label="=" />
      <Brackets f={f} at={perfect + 10} out={sw} dir={-1} color={C.white} y={SK_Y + 150} lineY={SK_Y} label="=" />
      <Brackets f={f} at={cue("squeezed") - 2} dir={1} color={C.blue} y={SK_Y + 150} lineY={SK_Y} label="SQUEEZED" n={5} />
      <Brackets f={f} at={cue("stretched") - 2} dir={-1} color={C.red} y={SK_Y + 150} lineY={SK_Y} label="STRETCHED" n={4} />
      {/* air shadow while flying */}
      {!onWater && f >= land - 20 && <ellipse cx={lx + 30 * (1 - flyP)} cy={mix2(-80, SK_Y, flyP) + 30 * (1 - flyP)} rx={70 * flyP} ry={26 * flyP} fill={alpha(C.night, 0.2 * flyP)} />}
      {f >= land - 20 && (
        <Skipper uid="skp" frame={f} x={sx} y={sy} scale={(onWater ? 1.15 : airScale)} rot={onWater ? Math.sin(f / 30) * 2 : 25 * (1 - flyP)}
          shadow={onWater}
          pose={{ tapLeg: tapLegAt(f), stroke: d / 4.5 * Math.PI * 2 / (Math.PI * 2) * 1.4, swimAmt, lookBack: look, squash: sq, scarf: f / 3, scarfAmt: 0.3 + swimAmt * 0.9, antenna, expr, bow }} />
      )}
    </Svg>
  );
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Pond frame={f} subject={subject} dof={1} />
      </Camera>
      <LightLeak t={prog(f, start, end, ease.inOutSine)} color={C.mint} opacity={0.14} />
      <Finish tint={C.teal} grade={0.12} vig={0.32} />
    </AbsoluteFill>
  );
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

export const CH2: SceneReg[] = [
  { ids: ["s2_pond", "s2_still", "s2_swim"], C: PondSeq },
];
