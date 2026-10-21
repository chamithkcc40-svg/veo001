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
import { Street } from "../kit/env/Street";
import { Rings } from "../kit/info/Rings";
import { Ambulance, AMB_SIREN } from "../kit/props/Props";
import { Skipper } from "../kit/rig/Skipper";
import { PIP } from "../kit/rig/characters";
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
