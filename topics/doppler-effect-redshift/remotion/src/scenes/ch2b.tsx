// ch2b.tsx - Chapter 2 "Ripples", second half (f1340-2387): compare split, ear insert, same-speed
// diagram, Prague study, suitcase memory, railway 1845, trackside observers, twist page-curl,
// title page -> push through the window. All frames GLOBAL; cue/sync frames from data/video.json.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, blinkAt, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, sync } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, LightLeak, Stars } from "../kit/fx";
import { Pond } from "../kit/env/Pond";
import { Railway, RAIL, RailFore, RailHills, RailMid, RailSky } from "../kit/env/Railway";
import { Study, StudyDesk, StudyFore, StudyLight, StudyRoom, StudyWindowView, WIN } from "../kit/env/Study";
import { NameTag, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { handPos } from "../kit/rig/fk";
import { merge, POSE, scribble, sway, track } from "../kit/rig/poses";
import { Street } from "../kit/env/Street";
import { Rings } from "../kit/info/Rings";
import { PitchLine } from "../kit/info/PitchLine";
import { Ambulance, AMB_SIREN, Candle, Flag, Horn, Notebook, Quill, Ship, SpiralIcon, Speedometer, Suitcase, Train, TRAIN_STACK } from "../kit/props/Props";
import { Skipper } from "../kit/rig/Skipper";
import { BUYSBALLOT, DOPPLER, HORN1, HORN2, HORN3, OBSERVER_A, OBSERVER_B, PIP } from "../kit/rig/characters";
import { SceneProps, SceneReg } from "../chapters/types";

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

// ------------------------------------------------------------------ s2_ear (INS: Pip's ear, hits per second)
// Wavefronts travel at ONE speed (EAR_C) and reach the ear exactly on the audio click frames
// (sync earFast*/earSlow*): fast part = squeezed spacing (BLUE), slow part = stretched (RED).
const EAR_C = 14;
const EAR = { x: 1418, y: 470 };
const earHits = () => {
  const out: { t: number; fast: boolean }[] = [];
  for (let t = sync("earFastStart"); t <= sync("earFastEnd"); t += sync("earFastPeriod")) out.push({ t, fast: true });
  for (let t = sync("earSlowStart"); t <= sync("earSlowEnd"); t += sync("earSlowPeriod")) out.push({ t, fast: false });
  return out;
};

/** Pip's ear in close-up (drawn from PIP's costume colours). pulse 0..1 on each hit */
const BigEar: React.FC<{ f: number; pulse: number; wide: number }> = ({ f, pulse, wide }) => {
  const sk = PIP.costume.skin, sh = PIP.costume.skinSh, hair = PIP.costume.hair;
  const bl = blinkAt(f, "pipear");
  return (
    <g>
      <circle cx={1790} cy={540} r={400} fill={sk} />
      <path d="M1390,540 A400,400 0 0 1 1790,140 L2200,140 L2200,330 Q1900,250 1620,330 Q1480,370 1420,470 Z" fill={hair} />
      <path d="M1470,300 Q1560,220 1700,200" stroke={alpha(C.white, 0.18)} strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* eye at the frame edge (Pip faces right) */}
      <g transform="translate(1880,470)">
        <ellipse rx={30} ry={44 * (1 - bl) * (1 + 0.15 * wide)} fill={C.ink} />
        <circle cx={10} cy={-14} r={10 * (1 - bl)} fill={C.white} />
        <path d={`M-40,${-70 - wide * 14} Q0,${-92 - wide * 18} 40,${-74 - wide * 14}`} stroke={hair} strokeWidth={12} fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx={1830} cy={600} rx={60} ry={34} fill={alpha(C.pink, 0.45)} />
      {/* the ear */}
      <g transform={`translate(${EAR.x + 20},${EAR.y + 30}) scale(${1 + 0.06 * pulse})`}>
        <ellipse rx={82} ry={118} fill={sk} />
        <ellipse cx={8} cy={4} rx={56} ry={88} fill={sh} />
        <path d="M18,-60 Q-30,-50 -28,0 Q-26,40 6,52" stroke={sk} strokeWidth={18} fill="none" strokeLinecap="round" />
        <ellipse cx={14} cy={6} rx={16} ry={22} fill={mix(sh, C.plum, 0.4)} />
        <circle cx={14} cy={6} r={30 + 50 * pulse} fill="none" stroke={C.sunLt} strokeWidth={5} opacity={0.8 * pulse} />
      </g>
      {/* headphone band resting on the neck (Pip's prop) */}
      <path d="M1520,1000 Q1600,860 1760,900" stroke={PIP.costume.neckColor} strokeWidth={34} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** tick strip: one tick per ear hit, scrolling left; counter = hits in the last second */
const TickBar: React.FC<{ f: number; at: number; hits: { t: number; fast: boolean }[] }> = ({ f, at, hits }) => {
  const { fps } = useVideoConfig();
  const p = sp(f, at, fps, spr.smooth);
  const X0 = 170, X1 = 1060, Y = 760;
  const n = hits.filter((h) => h.t <= f && h.t > f - 30).length;
  const last = hits.filter((h) => h.t <= f).pop();
  const pop = last ? Math.exp(-(f - last.t) / 3) : 0;
  const col = last ? (last.fast ? C.blue : C.red) : C.white;
  return (
    <g opacity={p} transform={`translate(0,${(1 - p) * 40})`}>
      <rect x={X0 - 30} y={Y - 64} width={X1 - X0 + 260} height={128} rx={64} fill={alpha(C.night, 0.6)} />
      <rect x={X0} y={Y - 2} width={X1 - X0} height={4} rx={2} fill={alpha(C.lilac, 0.4)} />
      {hits.filter((h) => h.t <= f && X1 - (f - h.t) * 4 > X0).map((h) => {
        const x = X1 - (f - h.t) * 4;
        const k = sp(f, h.t, fps, spr.bouncy);
        return <rect key={h.t} x={x - 5} y={Y - 34 * k} width={10} height={68 * k} rx={5} fill={h.fast ? C.blue : C.red} opacity={clamp((x - X0) / 80)} />;
      })}
      <g transform={`translate(${X1 + 110},${Y})`}>
        <circle r={50 + pop * 8} fill={col} />
        <text y={20} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={58} fill={C.white}>{n}</text>
      </g>
      <text x={X0} y={Y - 80} fontFamily={F.display} fontWeight={600} fontSize={28} fill={C.lilac} letterSpacing="3">HITS PER SECOND</text>
    </g>
  );
};

export const Ear: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const hits = earHits();
  const last = hits.filter((h) => h.t <= f).pop();
  const pulse = last ? Math.exp(-(f - last.t) / 3.5) : 0;
  const slow = f >= sync("earSlowStart") - 10;
  // iris opens from the ear (transition in), closes faster at the end
  const iris = tw(f, [start, start + 16], [0, 2300], ease.out);
  const irisOut = prog(f, end - 6, end, ease.in);
  const cam = { x: tw(f, [start, end], [0, 60], ease.inOutSine), y: noise1("earcy", f / 30) * 5, zoom: tw(f, [start, end], [1.0, 1.08], ease.inOutSine), rot: 0, frame: f };
  // wavefronts: arcs centred far left; each reaches the ear at its hit frame (constant speed)
  const fronts = hits.map((h) => ({ ...h, x: EAR.x - (h.t - f) * EAR_C })).filter((w) => w.x > -200 && w.x < EAR.x + 60);
  const pitch = slow ? tw(f, [sync("earSlowStart") - 10, sync("earSlowStart") + 6], [1, -1], ease.inOut) : tw(f, [start + 8, start + 30], [0, 1], ease.out);
  const plIn = sp(f, cue("squeezedWaves") + 4, fps, spr.bouncy);
  const label = (txt: string, color: string, at: number, out: number) => {
    const p = sp(f, at, fps, spr.bouncy);
    const e = prog(f, out - 7, out, ease.in);
    if (p < 0.01 || e >= 1) return null;
    return (
      <g transform={`translate(560,${200 + (1 - p) * 30})`} opacity={Math.min(1, p * 1.5) * (1 - e)}>
        <text textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={64} fill={color} letterSpacing="4" style={{ filter: `drop-shadow(0 0 16px ${alpha(color, 0.7)})` }}>{txt}</text>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ clipPath: `circle(${iris * (1 - irisOut)}px at ${EAR.x}px ${EAR.y}px)` }}>
      <Camera cam={cam}>
        <Layer depth={0.2}>
          <Svg>
            <defs>
              <radialGradient id="earBg" cx="0.3" cy="0.45" r="0.9">
                <stop offset="0" stopColor={mix(C.violet, C.purple, 0.5)} />
                <stop offset="1" stopColor={C.night} />
              </radialGradient>
            </defs>
            <rect x={-400} y={-300} width={2800} height={1700} fill="url(#earBg)" />
            <Dust seed="eardust" frame={f} n={50} area={[-200, 0, 1700, 1080]} color={C.lilac} size={[1.2, 3]} opacity={0.35} speed={0.5} />
          </Svg>
        </Layer>
        <Layer depth={0.6} blur={4}>
          <Svg>{[0, 1, 2].map((i) => <circle key={i} cx={300 + i * 520} cy={300 + i * 160} r={180 + i * 40} fill={alpha([C.blue, C.magenta, C.teal][i], 0.12)} />)}</Svg>
        </Layer>
        <Layer depth={1}>
          <Svg>
            {fronts.map((w) => {
              const R = 1400;
              const cx = w.x - R;
              const a = 0.32;
              const col = w.fast ? C.blue : C.red;
              const o = clamp((w.x + 200) / 300) * (1 - clamp((w.x - EAR.x + 20) / 40));
              return <path key={w.t} d={`M${cx + R * Math.cos(-a)},${EAR.y + R * Math.sin(-a)} A${R},${R} 0 0 1 ${cx + R * Math.cos(a)},${EAR.y + R * Math.sin(a)}`} stroke={col} strokeWidth={9} fill="none" strokeLinecap="round" opacity={o} style={{ filter: `drop-shadow(0 0 10px ${alpha(col, 0.8)})` }} />;
            })}
            {label("SQUEEZED", C.blue, cue("squeezedWaves"), cue("stretchedWaves") - 2)}
            {label("STRETCHED", C.red, cue("stretchedWaves"), end)}
            <BigEar f={f} pulse={pulse} wide={slow ? 0 : 1} />
            <g opacity={plIn} transform={`translate(1240,${250 + (1 - plIn) * 30}) scale(${0.6 + 0.4 * plIn})`}>
              <PitchLine x={0} y={0} w={250} frame={f} pitch={pitch} tail="right" />
            </g>
            <Pill2 f={f} at={cue("higher")} out={cue("stretchedWaves") - 2} text="HIGHER" color={C.blue} />
            <Pill2 f={f} at={cue("lower")} out={end} text="LOWER" color={C.red} />
          </Svg>
        </Layer>
      </Camera>
      <Svg><TickBar f={f} at={start + 6} hits={hits} /></Svg>
      <Finish tint={C.violet} grade={0.1} vig={0.34} />
    </AbsoluteFill>
  );
};

/** svg pill under the pitch line (HIGHER / LOWER) */
const Pill2: React.FC<{ f: number; at: number; out: number; text: string; color: string }> = ({ f, at, out, text, color }) => {
  const { fps } = useVideoConfig();
  const p = sp(f, at, fps, spr.bouncy);
  const e = prog(f, out - 7, out, ease.in);
  if (p < 0.01 || e >= 1) return null;
  return (
    <g transform={`translate(1240,${360 + (1 - p) * 20}) scale(${0.7 + 0.3 * p})`} opacity={Math.min(1, p * 1.5) * (1 - e)}>
      <rect x={-110} y={-34} width={220} height={68} rx={34} fill={color} />
      <text y={14} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={38} fill={C.white} letterSpacing="3">{text}</text>
    </g>
  );
};

// ------------------------------------------------------------------ s2_speed (diagram: same speed, different spacing)
// Two wave trains travel right at the SAME speed (SPD_V px/frame). Top: squeezed BLUE (gap 70),
// bottom: stretched RED (gap 170). Riders (speedometers) travel with the lead front; same needle.
const SPD_V = 7;
const Train2: React.FC<{ f: number; y: number; gap: number; color: string; lead: number; glow: number; n: number }> = ({ f, y, gap, color, lead, glow, n }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = lead - i * gap;
      const R = 125;
      const o = clamp((x + 100) / 200);
      return <path key={i} d={`M${x - R * 0.3},${y - R * 0.95} Q${x + R * 0.25},${y} ${x - R * 0.3},${y + R * 0.95}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" opacity={o} style={{ filter: `drop-shadow(0 0 ${8 + glow * 10}px ${alpha(color, 0.8)})` }} />;
    })}
    {/* spacing brackets between the first fronts */}
    {glow > 0.01 && [0, 1, 2].map((i) => {
      const a = lead - (i + 1) * gap + 6, b = lead - i * gap - 6;
      const k = clamp(glow * 3 - i * 0.6);
      return (
        <g key={"b" + i} opacity={k}>
          <path d={`M${a},${y + 140} L${a},${y + 156} L${b},${y + 156} L${b},${y + 140}`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${alpha(color, 0.9)})` }} />
        </g>
      );
    })}
  </g>
);

export const Speed: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const lead = 1180 + (f - start) * SPD_V;
  const camX = (f - start) * SPD_V * 0.9 + noise1("spdx", f / 25) * 6; // lateral track: riders drift slowly right of centre
  const needleAt = sync("earSlowEnd") + 8; // needle tick sfx frame (1600)
  const nd = sp(f, needleAt, fps, { damping: 9, stiffness: 140, mass: 0.7 });
  const value = 0.62 * nd;
  const glow = prog(f, cue("spacing"), cue("spacing") + 24, ease.out);
  const t1 = sp(f, cue("neverSpeed") + 14, fps, spr.bouncy);
  const t2 = sp(f, cue("spacing") + 2, fps, spr.bouncy);
  const gauge = (y: number, color: string, uid: string) => (
    <g transform={`translate(${lead + 150},${y}) scale(${sp(f, start + 4, fps, spr.bouncy)})`}>
      <path d="M-120,0 L-74,0" stroke={alpha(color, 0.6)} strokeWidth={4} strokeDasharray="6 8" />
      <Speedometer value={value + Math.sin(f / 3 + (uid === "a" ? 0 : 1.3)) * 0.004 * nd} r={70} color={color} label="SPEED" />
    </g>
  );
  return (
    <AbsoluteFill>
      <Camera cam={{ x: camX, y: 0, zoom: tw(f, [start, end], [1.04, 1.0], ease.inOutSine), rot: 0, frame: f }}>
        <Layer depth={0}>
          <Svg>
            <defs>
              <linearGradient id="spdBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C.violet} />
                <stop offset="1" stopColor={C.night} />
              </linearGradient>
            </defs>
            <rect x={-100} y={-100} width={2200} height={1300} fill="url(#spdBg)" />
          </Svg>
        </Layer>
        <Layer depth={0.3} blur={2}>
          <Svg>
            {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={-400 + i * 140} y={0} width={2} height={1080} fill={alpha(C.lilac, 0.07)} />)}
            <Stars seed="spdstars" frame={f} n={60} ox={-400} w={4000} maxR={1.8} opacity={0.5} />
          </Svg>
        </Layer>
        <Layer depth={1}>
          <Svg>
            {[400, 730].map((y) => <rect key={y} x={-200} y={y - 2} width={6000} height={4} rx={2} fill={alpha(C.lilac, 0.18)} />)}
            <Train2 f={f} y={400} gap={70} color={C.blue} lead={lead} glow={glow} n={14} />
            <Train2 f={f} y={730} gap={170} color={C.red} lead={lead} glow={glow} n={7} />
            {gauge(400, C.blue, "a")}
            {gauge(730, C.red, "b")}
          </Svg>
        </Layer>
        <Layer depth={1.5} blur={6}>
          <Svg>{Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={rr("sfx" + i, 0, 4200)} cy={rr("sfy" + i, 0, 1080)} r={rr("sfr" + i, 6, 16)} fill={alpha(C.lilac, 0.18)} />)}</Svg>
        </Layer>
      </Camera>
      {/* concept label: SAME SPEED · DIFFERENT SPACING (two halves land on their words) */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: 70, display: "flex", justifyContent: "center", gap: 28, fontFamily: F.display, fontWeight: 700, fontSize: 60, letterSpacing: "0.05em" }}>
        <span style={{ color: C.white, opacity: Math.min(1, t1 * 1.5), transform: `translateY(${(1 - t1) * 30}px) scale(${0.7 + 0.3 * t1})`, display: "inline-block", textShadow: `0 6px 0 ${alpha(C.night, 0.4)}` }}>SAME SPEED</span>
        <span style={{ color: C.sun, opacity: Math.min(1, t2 * 1.5), transform: `translateY(${(1 - t2) * 30}px) scale(${0.7 + 0.3 * t2})`, display: "inline-block", textShadow: `0 0 26px ${alpha(C.sun, 0.6)}, 0 6px 0 ${alpha(C.night, 0.4)}` }}>· DIFFERENT SPACING</span>
      </div>
      <Finish tint={C.violet} grade={0.1} vig={0.3} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s2_study (Prague 1842, candle)
// Transition in: a ripple ring grows out of the candle flame and reveals the study (ripple -> candle glow).
const CANDLE = { x: 1460, y: 634 };
const RippleReveal: React.FC<{ f: number; at: number; dur: number; cx: number; cy: number; children: React.ReactNode; color?: string }> = ({ f, at, dur, cx, cy, children, color = C.sunLt }) => {
  const p = prog(f, at, at + dur, ease.inOut);
  const R = 40 + p * 2300;
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${R}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>
      <Svg>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth={10 * (1 - p) + 2} opacity={1 - p * 0.6} style={{ filter: `drop-shadow(0 0 14px ${alpha(color, 0.9)})` }} />
        <circle cx={cx} cy={cy} r={R * 0.86} fill="none" stroke={alpha(color, 0.5)} strokeWidth={3} opacity={1 - p} />
      </Svg>
    </AbsoluteFill>
  );
};

export const StudyScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const cough = cue("frail") + 8; // cough sfx lands at 1758
  const ck = prog(f, cough - 6, cough, ease.out) * (1 - prog(f, cough + 14, cough + 24, ease.inOut));
  const writing = 1 - ck;
  const base = { ...POSE.write, turn: 0.45 };
  const coughPose = { armL: { a: 40, b: 150 }, handL: "fist" as const, lean: 12, headTilt: 16, lookY: 1 };
  const pose = merge(base, writing > 0.5 ? scribble(f) : {}, {});
  const P = { ...pose, armL: { a: pose.armL!.a + (coughPose.armL.a - pose.armL!.a) * ck, b: pose.armL!.b + (coughPose.armL.b - pose.armL!.b) * ck }, lean: (pose.lean ?? 0) + 6 * ck, headTilt: (pose.headTilt ?? 0) + 6 * ck, handL: ck > 0.5 ? "fist" as const : pose.handL };
  P.bodyY = (P.bodyY ?? 0) + Math.sin((f - cough) * 1.4) * 3 * ck; // cough jolts
  const expr = ck > 0.3 ? "wince" : f > cue("prague") + 14 ? "proud" : "focused";
  const cam = { x: tw(f, [start, end], [-40, 40], ease.inOutSine), y: tw(f, [start, end], [10, -20], ease.inOutSine), zoom: tw(f, [start, end], [1.02, 1.12], ease.inOutSine), rot: 0, frame: f };
  // quill + ink trail on the page
  const hp = handPos(DOPPLER, P, "R", 1000, 1000, 1.25);
  return (
    <RippleReveal f={f} at={start - 2} dur={16} cx={CANDLE.x} cy={CANDLE.y}>
      <Camera cam={cam}>
        <Study frame={f} subject={
          <Svg>
            <Rig uid="dopst" def={DOPPLER} frame={f} x={1000} y={1000} scale={1.25} pose={P} expr={expr} propR={<g transform="translate(4,6)"><Quill scale={0.9} /></g>} />
          </Svg>
        } deskChildren={
          <g>
            <g transform="translate(1040,748) rotate(-3)">
              <rect x={-150} y={-12} width={300} height={24} rx={6} fill={mix(C.dough, C.white, 0.45)} />
              {Array.from({ length: 6 }).map((_, i) => {
                const w = clamp((f - start - 10 - i * 14) / 14) * rr("ink" + i, 140, 230);
                return <rect key={i} x={-130} y={-8 + i * 3} width={w} height={2} rx={1} fill={alpha(C.night, 0.55)} />;
              })}
            </g>
            <circle cx={hp.x} cy={Math.min(hp.y + 18, 745)} r={2.5 * writing} fill={C.night} opacity={0.5} />
          </g>
        } />
      </Camera>
      <Timeline f={f} fps={fps} at={cue("y1842")} out={end + 20} active={["1842"]} x={520} y={52} />
      <NameTag f={f} fps={fps} at={cue("frail") + 4} out={end + 20} name="Christian Doppler" sub="Prague · 1842" x={110} y={700} />
      <Finish tint={C.sun} grade={0.12} vig={0.34} />
    </RippleReveal>
  );
};

// ------------------------------------------------------------------ s2_suitcase (sepia memory)
// Doppler latches the suitcase (latch sfx), lifts it (prop follows his hand via FK), looks at the ship
// in the window ("moved to America"), then sets it down (thud sfx) with a small hopeful smile.
const DOP_X = 930, FLOOR = 890, DS = 1.6, CASE_S = 1.05;
const CASE_FLOOR = { x: 1250, y: FLOOR + 4 };
export const SuitcaseScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const latch = cue("nearlyQuit"); // 1912 latch sfx
  const thud = latch + 35; // 1947 thud sfx
  const pose = track(f, [
    [start, { turn: 0.55, lean: 18, armR: { a: 42, b: 18 }, armL: { a: 20, b: 30 }, handR: "open", handL: "open", headTilt: 12, lookY: 1, lookX: 0.6 }],
    [latch - 2, { turn: 0.55, lean: 22, armR: { a: 46, b: 8 }, armL: { a: 30, b: 20 }, handR: "fist", handL: "open", headTilt: 14, lookY: 1, lookX: 0.6 }],
    [latch + 14, { turn: 0.5, lean: 2, armR: { a: 14, b: 4 }, armL: { a: -8, b: 8 }, handR: "fist", headTilt: -6, lookY: -0.6, lookX: 1 }],
    [thud - 2, { turn: 0.55, lean: 16, armR: { a: 30, b: 4 }, armL: { a: -4, b: 10 }, handR: "fist", headTilt: 6, lookY: 0.4, lookX: 0.8 }],
    [thud + 12, { turn: 0.35, lean: 0, armR: { a: 10, b: -6 }, armL: { a: -14, b: 40 }, handR: "open", handL: "open", headTilt: -8, lookY: -0.5, lookX: 0.9 }],
  ], 12);
  // packing jiggle before the latch
  if (f < latch - 12) pose.armR = { a: pose.armR.a + Math.sin(f / 4) * 5, b: pose.armR.b + Math.cos(f / 5) * 8 };
  const lift = prog(f, latch + 2, latch + 14, ease.inOut) * (1 - prog(f, thud - 8, thud, ease.in));
  const hand = handPos(DOPPLER, pose, "R", DOP_X, FLOOR, DS);
  const cx = CASE_FLOOR.x + (hand.x + 6 - CASE_FLOOR.x) * lift;
  const cy = CASE_FLOOR.y + (hand.y + 196 * CASE_S - 10 - CASE_FLOOR.y) * lift;
  const swing = lift > 0.5 ? Math.sin((f - latch) / 5) * 6 * Math.exp(-(f - latch - 14) / 20) : 0;
  const open = 1 - prog(f, latch - 10, latch, ease.in);
  const squash = f >= thud ? 1 - 0.08 * Math.exp(-(f - thud) / 3) : 1;
  const expr = f < latch ? "focused" : f < thud - 6 ? "sad" : f < thud + 16 ? "sheepish" : "happy";
  const ship = prog(f, latch + 8, latch + 30, ease.out);
  const sep = prog(f, start, start + 12, ease.inOut) * (1 - prog(f, end - 14, end, ease.inOut));
  const fadeIn = prog(f, start, start + 12, ease.inOut);
  const cam = { x: tw(f, [start, end], [-30, 50], ease.inOutSine), y: noise1("suy", f / 40) * 6, zoom: tw(f, [start, end], [1.06, 1.0], ease.inOutSine), rot: tw(f, [start, end], [-0.6, 0.4], ease.inOutSine), frame: f };
  return (
    <AbsoluteFill style={{ opacity: fadeIn, filter: `sepia(${0.85 * sep}) saturate(${1 - 0.25 * sep}) brightness(${1 + 0.04 * sep})` }}>
      <Camera cam={cam}>
        <Layer depth={0.15} blur={1}><StudyWindowView frame={f} /></Layer>
        <Layer depth={0.15} blur={0.6}>
          <Svg>
            {/* "America": a moonlit sea band and a sailing ship drifting across the window */}
            <g opacity={ship}>
              <rect x={WIN.x - 100} y={WIN.y + WIN.h - 120} width={WIN.w + 200} height={140} fill={mix(C.peri, C.night, 0.45)} />
              {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={WIN.x + 40 + i * 52 + Math.sin(f / 9 + i) * 8} y={WIN.y + WIN.h - 100 + (i % 3) * 22} width={30} height={4} rx={2} fill={alpha(C.sunLt, 0.55)} />)}
              <circle cx={WIN.x + WIN.w - 110} cy={WIN.y + 110} r={42} fill={mix(C.sunLt, C.white, 0.5)} />
              <g transform={`translate(${WIN.x + 170 + ship * 60 + (f - start) * 0.25},${WIN.y + WIN.h - 112 + Math.sin(f / 12) * 3}) rotate(${Math.sin(f / 14) * 2})`}>
                <Ship scale={1.25} color={mix(C.night, C.violet, 0.3)} />
              </g>
            </g>
          </Svg>
        </Layer>
        <Layer depth={0.5} blur={1.2}><StudyRoom frame={f} /></Layer>
        <Layer depth={1}>
          <Svg>
            <rect x={-400} y={FLOOR - 60} width={2800} height={600} fill={mix(C.plum, C.night, 0.35)} />
            {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={-400 + i * 180} y={FLOOR - 60} width={4} height={600} fill={alpha(C.night, 0.25)} transform={`skewX(${(i - 8) * 3})`} />)}
            <rect x={-400} y={FLOOR - 64} width={2800} height={8} fill={alpha(C.sunLt, 0.25)} />
            {/* side table + candle */}
            <g transform={`translate(1700,${FLOOR})`}>
              <rect x={-130} y={-250} width={260} height={30} rx={10} fill={mix(C.plum, C.sun, 0.3)} />
              <rect x={-110} y={-222} width={20} height={222} rx={8} fill={mix(C.plum, C.night, 0.2)} />
              <rect x={90} y={-222} width={20} height={222} rx={8} fill={mix(C.plum, C.night, 0.2)} />
              <g transform="translate(20,-250)"><Candle frame={f} scale={0.8} /></g>
            </g>
            <Rig uid="dopsu" def={DOPPLER} frame={f} x={DOP_X} y={FLOOR} scale={DS} pose={pose} expr={expr} />
            <g transform={`translate(${cx},${cy}) rotate(${swing}) scale(1,${squash})`}>
              <ellipse cx={0} cy={2} rx={110 * CASE_S} ry={12} fill={alpha(C.night, 0.3 * (1 - lift))} />
              <Suitcase open={open} scale={CASE_S} />
            </g>
            {/* dust puff on the thud */}
            {f >= thud && f < thud + 24 && [-1, 1].map((d) => (
              <g key={d} opacity={1 - (f - thud) / 24}>
                {[0, 1, 2].map((k) => <circle key={k} cx={CASE_FLOOR.x + d * (90 + (f - thud) * (2 + k))} cy={FLOOR - 6 - k * 8 - (f - thud) * 0.6} r={8 + k * 3 + (f - thud) * 0.4} fill={alpha(C.lilac, 0.5)} />)}
              </g>
            ))}
          </Svg>
        </Layer>
        <Layer depth={1}><StudyLight frame={f} cx={1720} cy={FLOOR - 340} /></Layer>
        <Layer depth={1.5} blur={9}><StudyFore /></Layer>
      </Camera>
      {/* memory edge: soft light vignette */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 55%, ${alpha(C.sunLt, 0.35 * sep)} 100%)`, pointerEvents: "none" }} />
      <Finish tint={C.sun} grade={0.12} vig={0.3} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ railway helpers (s2_train, s2_observers)
/** smoke puffs: one per chuff cue, born at the stack where the loco WAS, drifting up and back */
const Smoke: React.FC<{ f: number; stack: (t: number) => { x: number; y: number }; s: number }> = ({ f, stack, s }) => {
  const out: React.ReactNode[] = [];
  for (let t = sync("chuffStart"); t <= Math.min(f, sync("chuffEnd")); t += sync("chuffPeriod")) {
    const age = f - t;
    if (age > 70) continue;
    const p = stack(t);
    const k = age / 70;
    const r = (18 + age * 1.1) * s;
    out.push(
      <g key={t} opacity={(1 - k) * clamp(age / 3)}>
        <circle cx={p.x - age * 1.6 * s} cy={p.y - age * 2.2 * s} r={r} fill={mix(C.white, C.lilac, k)} />
        <circle cx={p.x - age * 1.6 * s + r * 0.5} cy={p.y - age * 2.2 * s - r * 0.3} r={r * 0.6} fill={C.white} opacity={0.8} />
      </g>,
    );
  }
  return <g>{out}</g>;
};

/** the three horn players on the open car (car-local coordinates, origin = car deck centre) */
const HORN_S = 0.6;
const HornBand: React.FC<{ f: number; blow: number }> = ({ f, blow }) => (
  <g>
    {[HORN1, HORN2, HORN3].map((def, i) => {
      const x = -140 + i * 140;
      const P = merge({ ...POSE.hornPlay, turn: 0.55, lookX: 0.6 }, sway(f, i * 1.3, 0.8 + 0.4 * blow));
      return <Rig key={def.seed} uid={"hb" + i} def={def} frame={f + i * 17} x={x} y={0} scale={HORN_S} pose={P} expr={blow > 0.5 ? "ooo" : "joy"}
        propR={<g transform="translate(-8,-40) rotate(-12)"><Horn scale={0.95} /></g>} />;
    })}
  </g>
);
/** bell positions (car-local) for horn rings */
const BELLS = [-140, 0, 140].map((x) => ({ x: x + 70, y: -150 }));

export const TrainScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const go = start + 10; // whistle (1983) = the train sets off
  const V = 7;
  const d = Math.max(0, f - go);
  const travel = d < 30 ? (V * d * d) / 60 : V * (d - 15);
  const S = 0.9;
  const locoX = 760 + travel;
  const trackY = RAIL.track + 18;
  const locoAt = (t: number) => { const dd = Math.max(0, t - go); return 760 + (dd < 30 ? (V * dd * dd) / 60 : V * (dd - 15)); };
  const stack = (t: number) => ({ x: locoAt(t) + TRAIN_STACK.x * S, y: trackY + TRAIN_STACK.y * S });
  const carX = (t: number) => locoAt(t) - 520 * S;
  // camera pans with the train; whip-pan in from the left (motion blur decays)
  const whip = prog(f, start, start + 12, ease.out);
  const camX = locoX - 1150 - (1 - whip) * 1400; // loco held at ~x 1150; Buys Ballot slides past
  const cam = { x: camX, y: -20 + noise1("trcy", f / 30) * 4, zoom: 1.0, rot: 0, frame: f };
  const blow = prog(f, cue("horns") - 4, cue("horns") + 8, ease.out);
  // Buys Ballot: flag raised, drops sharply on the whistle (anticipation: lifts higher first), then jots in notebook
  const bbPose = track(f, [
    [start, { ...POSE.flagUp, turn: 0.4, lookX: 0.8 }],
    [go - 4, { armR: { a: 172, b: 10 }, handR: "fist", turn: 0.4, lookX: 0.8, lean: -4 }],
    [go + 4, { armR: { a: 70, b: 10 }, handR: "fist", turn: 0.4, lookX: 1, lean: 8 }],
    [go + 40, { ...POSE.notebook, turn: 0.3, lookX: 0.6 }],
  ], 6);
  const tags = cue("dutch");
  return (
    <AbsoluteFill style={{ filter: whip < 1 ? `blur(${(1 - whip) * 16}px)` : undefined }}>
      <Camera cam={cam}>
        <Railway frame={f} subject={
          <Svg>
            <Smoke f={f} stack={stack} s={S} />
            {BELLS.map((b, i) => (
              <Rings key={i} id={"trh" + i} frame={f} path={(t) => ({ x: carX(t) + b.x * S, y: trackY - 104 * S + b.y * S })} start={cue("horns") + i * 3} period={10} c={16} maxR={420} tint width={4} opacity={0.75} />
            ))}
            <g transform={`translate(${locoX},${trackY + Math.sin(f / 2.2) * 1.2})`}>
              <Train wheel={(travel / (42 * S)) * 57.3} scale={S} car={<HornBand f={f} blow={blow} />} />
            </g>
            <Rig uid="bbtr" def={BUYSBALLOT} frame={f} x={1250} y={RAIL.track + 190} scale={1.0} pose={bbPose} expr={f < go + 6 ? "focused" : "happy"}
              propR={f < go + 30 ? <g transform="translate(0,6)"><Flag frame={f} /></g> : <g transform="translate(0,4)"><Notebook /></g>} />
          </Svg>
        } />
      </Camera>
      <Timeline f={f} fps={fps} at={start + 6} out={end + 10} active={["1845"]} x={520} y={52} />
      <NameTag f={f} fps={fps} at={tags} out={end + 10} name="Buys Ballot" sub="near Utrecht · 1845" x={110} y={700} />
      <Finish tint={C.oliveLt} grade={0.1} vig={0.28} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s2_observers (low angle, the car passes at sync.hornsPass)
const OBS_X = 1000; // the observers stand here; the car's centre crosses OBS_X exactly at hornsPass
const OBS_V = 13, OBS_C = 26, OBS_S = 1.25;
export const Observers: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const pass = sync("hornsPass");
  const carC = (t: number) => OBS_X + (t - pass) * OBS_V; // flatcar centre x
  const locoX = (t: number) => carC(t) + 520 * OBS_S;
  const trackY = 600;
  const bell = (t: number) => ({ x: carC(t) + 70 * OBS_S, y: trackY - 104 * OBS_S - 150 * OBS_S });
  // observers: cup ears, heads follow the car, surprised on the pass
  const look = tw(f, [pass - 26, pass + 16], [-1, 1], ease.inOut);
  const obs = (seed: number) => {
    const P = track(f, [
      [start, { turn: -0.5, lookX: -1 }],
      [start + 10, { ...POSE.cupEars, turn: -0.5, lookX: -1 }],
      [pass - 2, { ...POSE.cupEars, turn: 0, lookX: 0, headTilt: -4 }],
      [pass + 18, { ...POSE.cupEars, turn: 0.5, lookX: 1, headTilt: 5 }],
    ], 9);
    P.lookX = look;
    P.lean += Math.sin(f / 16 + seed) * 1.2;
    return P;
  };
  const exprO = f < pass - 8 ? "focused" : f < pass + 22 ? "surprised" : "ooo";
  const pitch = f < pass ? tw(f, [start + 6, pass - 12], [0.4, 1], ease.out) : tw(f, [pass, pass + 8], [1, -1], ease.inOut);
  const pl = sp(f, start + 8, fps, spr.bouncy);
  const cam = { x: tw(f, [start, end], [-40, 60], ease.inOutSine), y: 30, zoom: tw(f, [start, end], [1.0, 1.05], ease.inOutSine), rot: -1.5, frame: f, shake: 2.5 * Math.exp(-((f - pass) ** 2) / 300), seed: "obs" };
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Layer depth={0.08}><RailSky frame={f} /></Layer>
        <Layer depth={0.2} blur={3}><Svg><g transform="translate(0,-110)"><RailHillsInline /></g></Svg></Layer>
        <Layer depth={0.45} blur={1.5}><Svg><g transform="translate(0,-90)"><RailMidInline frame={f} /></g></Svg></Layer>
        <Layer depth={1}>
          <Svg>
            {/* low-angle ground: track bed close to camera */}
            <rect x={-600} y={trackY - 30} width={3200} height={500} fill={mix(C.oliveLt, C.olive, 0.4)} />
            <rect x={-600} y={trackY - 18} width={3200} height={46} fill={mix(C.plum, C.olive, 0.3)} />
            {Array.from({ length: 70 }).map((_, i) => <rect key={i} x={-600 + i * 50} y={trackY - 12} width={26} height={34} rx={4} fill={C.plum} />)}
            <rect x={-600} y={trackY - 16} width={3200} height={8} rx={4} fill={C.lilac} />
            <rect x={-600} y={trackY + 10} width={3200} height={8} rx={4} fill={C.lilac} />
            <Rings id="obsr" frame={f} path={bell} start={start - 70} period={8} c={OBS_C} maxR={1300} tint tintGain={2.6} width={6} />
            <Smoke f={f} stack={(t) => ({ x: locoX(t) + TRAIN_STACK.x * OBS_S, y: trackY + TRAIN_STACK.y * OBS_S })} s={OBS_S} />
            <g transform={`translate(${locoX(f)},${trackY + Math.sin(f / 2) * 1.5})`}>
              <Train wheel={(f * OBS_V) / (42 * OBS_S) * 57.3} scale={OBS_S} car={<HornBand f={f} blow={1} />} />
            </g>
          </Svg>
        </Layer>
        <Layer depth={1.25}>
          <Svg>
            <rect x={-600} y={990} width={3200} height={400} fill={mix(C.olive, C.oliveLt, 0.25)} />
            <Rig uid="obsA" def={OBSERVER_A} frame={f} x={OBS_X - 170} y={1110} scale={1.08} pose={obs(0)} expr={exprO} />
            <Rig uid="obsB" def={OBSERVER_B} frame={f + 11} x={OBS_X + 170} y={1120} scale={1.12} pose={obs(1.7)} expr={exprO} />
          </Svg>
        </Layer>
        <Layer depth={1.6} blur={8}><RailFore frame={f} /></Layer>
      </Camera>
      <Svg>
        <g opacity={pl} transform={`translate(${OBS_X - 480},${640 + (1 - pl) * 24}) scale(${0.6 + 0.4 * pl})`}>
          <PitchLine x={0} y={0} w={230} frame={f} pitch={pitch} tail="right" />
        </g>
        <g opacity={pl} transform={`translate(${OBS_X + 500},${620 + (1 - pl) * 24}) scale(${0.6 + 0.4 * pl})`}>
          <PitchLine x={0} y={0} w={230} frame={f + 5} pitch={pitch} tail="left" />
        </g>
      </Svg>
      <Finish tint={C.oliveLt} grade={0.1} vig={0.3} />
    </AbsoluteFill>
  );
};
const RailHillsInline: React.FC = () => <RailHills />;
const RailMidInline: React.FC<{ frame: number }> = ({ frame }) => <RailMid frame={frame} />;

export const CH2B: SceneReg[] = [
  { ids: ["s2_compare"], C: Compare, post: 18 }, // stays under the ear iris
  { ids: ["s2_ear"], C: Ear },
  { ids: ["s2_speed"], C: Speed, post: 16 },
  { ids: ["s2_study"], C: StudyScene, post: 12 },
  { ids: ["s2_suitcase"], C: SuitcaseScene },
  { ids: ["s2_train"], C: TrainScene },
  { ids: ["s2_observers"], C: Observers, post: 16 }, // stays under the twist curl
];
