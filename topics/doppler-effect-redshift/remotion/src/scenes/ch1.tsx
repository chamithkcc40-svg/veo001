// ch1.tsx - Chapter 1 "One Siren, Two Sounds" (f339-869): s1_cab, s1_roof, s1_split, s1_notsiren, s1_air.
// Golden-afternoon palette. All frames GLOBAL; cue/sync frames from data/video.json.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, mix, prog, rr, sp, tw, noise1 } from "../util";
import { cue, sync } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, LightLeak } from "../kit/fx";
import { Street, STREET } from "../kit/env/Street";
import { CabInterior, CabWindow } from "../kit/env/Interiors";
import { Rings } from "../kit/info/Rings";
import { PitchLine } from "../kit/info/PitchLine";
import { Ambulance, AMB_SIREN, BigX, SteeringWheel } from "../kit/props/Props";
import { Rig } from "../kit/rig/Rig";
import { NELL, PIP } from "../kit/rig/characters";
import { track, POSE } from "../kit/rig/poses";
import { SceneReg, SceneProps } from "../chapters/types";

// ------------------------------------------------------------------ chapter title: swinging street sign
const SwingSign: React.FC<{ f: number; at: number; out: number; num: string; title: string }> = ({ f, at, out, num, title }) => {
  const { fps } = useVideoConfig();
  const drop = sp(f, at, fps, spr.bouncy);
  const t = Math.max(0, f - (at + 4));
  const swing = f < at + 4 ? -10 * drop : 13 * Math.exp(-t / 16) * Math.cos(t * 0.33) + Math.sin(f / 18) * 0.8; // pendulum, damped
  const ex = prog(f, out - 9, out, ease.in);
  if (f < at - 1 || ex >= 1) return null;
  const y = -320 + 470 * drop - 520 * ex;
  return (
    <Svg>
      <g transform={`translate(960,${y}) rotate(${swing})`}>
        {[-330, 330].map((x) => (
          <g key={x}>
            {Array.from({ length: 9 }).map((_, i) => <ellipse key={i} cx={x * 0.98} cy={-420 + i * 44} rx={9} ry={22} fill="none" stroke={mix(C.lilac, C.violet, 0.4)} strokeWidth={6} />)}
          </g>
        ))}
        <rect x={-500} y={-40} width={1000} height={190} rx={40} fill={alpha(C.night, 0.35)} transform="translate(10,16)" />
        <rect x={-500} y={-40} width={1000} height={190} rx={40} fill={C.teal} />
        <rect x={-484} y={-26} width={968} height={162} rx={30} fill={mix(C.teal, C.night, 0.2)} />
        <rect x={-484} y={-26} width={968} height={10} rx={5} fill={alpha(C.mint, 0.45)} />
        {[-460, 460].map((x) => <circle key={x} cx={x} cy={-12} r={9} fill={C.sunLt} />)}
        <circle cx={-385} cy={55} r={62} fill={C.sun} />
        <text x={-385} y={78} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={66} fill={C.night}>{num}</text>
        <text x={-295} y={76} textAnchor="start" fontFamily={F.display} fontWeight={600} fontSize={56} fill={C.white} letterSpacing="2">{title}</text>
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------ s1_cab
const Cab: React.FC<SceneProps> = ({ f, start, end }) => {
  const bump = noise1("bump", f / 4) * 3 + (Math.max(0, Math.sin((f - start) / 9)) ** 8) * 5; // road bumps
  const push = tw(f, [start, end], [1.0, 1.07], ease.inOutSine);
  const nod = sp(f, cue("picture") + 26, 30, spr.smooth) - sp(f, cue("picture") + 34, 30, spr.smooth);
  const tag = Math.sin(f / 7) * 12 + bump * 1.5;
  const pose = { ...POSE.handsOnWheel, headTilt: 4 + nod * 7, lookX: 0.15, turn: 0.1, bodyY: bump * 0.4 };
  const cam = { x: 0, y: -bump * 0.6, zoom: push, rot: noise1("cr", f / 10) * 0.25, frame: f };
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Layer depth={0.35} blur={1.2}><CabWindow frame={f} speed={1} /></Layer>
        <Layer depth={0.8}><Svg><Dust seed="cabdust" frame={f} n={18} area={[240, 120, 1460, 480]} color={C.sunLt} opacity={0.35} size={[1.5, 3.5]} /></Svg></Layer>
        <Layer depth={1}><CabInterior frame={f} tagSwing={tag} /></Layer>
        <Layer depth={1.05}><Svg><Rig uid="nellcab" def={NELL} frame={f} x={960} y={1400} scale={2.25} pose={pose} expr={f > cue("picture") + 20 ? "happy" : "neutral"} /></Svg></Layer>
        <Layer depth={1.35} blur={2}><Svg><g transform={`translate(960,${1150 + bump})`}><SteeringWheel r={270} rot={Math.sin(f / 22) * 4} /></g></Svg></Layer>
      </Camera>
      <Finish tint={C.sun} grade={0.12} vig={0.3} />
      <SwingSign f={f} at={start + 2} out={end - 4} num="1" title="ONE SIREN, TWO SOUNDS" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s1_roof (vehicle-follow; Nell's frame)
const ROOF_V = 16; // street scroll px/frame (vehicle speed)
const NellInWindow: React.FC<{ f: number; nod: number; uid: string }> = ({ f, nod, uid }) => (
  <g>
    <defs>
      <clipPath id={`${uid}-win`}><path d="M42,-78 L-16,-78 Q-42,-78 -56,-52 L-80,0 L42,0 Z" /></clipPath>
    </defs>
    <g clipPath={`url(#${uid}-win)`}>
      <Rig uid={uid} def={NELL} frame={f} x={-10} y={120} scale={0.5} pose={{ ...POSE.handsOnWheel, turn: -0.6, lookX: -0.8, headTilt: -2 + nod * 8 }} expr="neutral" idle={0.8} />
      <path d="M42,-78 L-16,-78 Q-42,-78 -56,-52 L-80,0 L42,0 Z" fill={alpha(C.peri, 0.22)} />
      <path d="M-10,-74 L-36,-6" stroke={alpha(C.white, 0.3)} strokeWidth={8} strokeLinecap="round" />
    </g>
  </g>
);

const Roof: React.FC<SceneProps> = ({ f, start, end }) => {
  const S = 0.95;
  const AX = 1000, AY = 900;
  const nod = sp(f, cue("steady") + 4, 30, spr.smooth) - sp(f, cue("steady") + 14, 30, spr.smooth);
  const camX = 600 - (f - start) * ROOF_V; // camera follows the vehicle (moving screen-left)
  const bounce = Math.sin(f / 2.1) * 1.8 + noise1("rb", f / 3) * 1.4;
  const zoom = tw(f, [start, end], [1.0, 1.06], ease.inOutSine);
  const siren = { x: AX + AMB_SIREN.x * S, y: AY + AMB_SIREN.y * S + bounce };
  const plIn = sp(f, cue("steady") - 6, 30, spr.bouncy);
  return (
    <AbsoluteFill>
      <Camera cam={{ x: camX, y: 20, zoom, rot: 0, frame: f, shake: 1.2, seed: "roof" }}>
        <Street tod="golden" frame={f} hedges dof={1.4} />
      </Camera>
      {/* the vehicle and its rings stay put on screen (we ride along): in Nell's frame the rings are even and WHITE */}
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "960px 540px" }}>
        <Svg>
          {/* speed lines streaming past */}
          {Array.from({ length: 8 }).map((_, i) => {
            const x = ((((rr("sl" + i, 0, 2400) + (f - start) * 46) % 2600) + 2600) % 2600) - 300;
            return <rect key={i} x={x} y={rr("sly" + i, 640, 860)} width={rr("slw" + i, 80, 200)} height={4} rx={2} fill={alpha(C.white, 0.35)} />;
          })}
          <Rings id="roofr" frame={f} path={() => siren} start={sync("steadyStart")} period={9} c={10} maxR={760} width={7} opacity={0.95} />
          <Ambulance x={AX} y={AY} scale={S} flash={f / 7} wheel={(f * ROOF_V) / 42 * 57.3 * -1} bounce={bounce} driver={<NellInWindow f={f} nod={nod} uid="nellwin" />} />
          <g opacity={plIn} transform={`translate(${AX - 360},${360 + (1 - plIn) * 24}) scale(${0.6 + 0.4 * plIn})`}>
            <PitchLine x={0} y={0} w={240} frame={f} pitch={0} neutral tail="right" />
          </g>
        </Svg>
      </AbsoluteFill>
      <Finish tint={C.sun} grade={0.12} vig={0.28} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s1_split
const SPLIT_V = 15;
const SPLIT_S = 0.6;
const SPLIT_PIP = 1440; // Pip's screen x (centre of the right half)
const splitAmbX = (t: number) => SPLIT_PIP + (sync("splitPass") - t) * SPLIT_V;

const LabelPill: React.FC<{ f: number; at: number; out: number; text: string; y: number; size: number; color: string; bg: string; arrows?: boolean }> = ({ f, at, out, text, y, size, color, bg, arrows }) => {
  const { fps } = useVideoConfig();
  const p = sp(f, at, fps, spr.bouncy);
  const e = prog(f, out - 7, out, ease.in);
  const o = Math.min(Math.min(1, p * 1.6), 1 - e);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: 1920, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 26, opacity: o, transform: `translateY(${(1 - p) * 30 - e * 20}px) scale(${0.6 + 0.4 * p + Math.sin(f / 9) * 0.006})` }}>
      {arrows && <svg width={70} height={40}><path d="M60,20 H14 M30,6 L12,20 L30,34" stroke={C.lilac} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: size, color, background: bg, padding: `${size * 0.18}px ${size * 0.6}px`, borderRadius: 999, letterSpacing: "0.05em", boxShadow: `0 14px 40px ${alpha(C.night, 0.45)}` }}>{text}</div>
      {arrows && <svg width={70} height={40}><path d="M10,20 H56 M40,6 L58,20 L40,34" stroke={C.lilac} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
};

const Split: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const pass = sync("splitPass");
  const wipeIn = tw(f, [start, start + 14], [1920, 960], ease.out); // divider sweeps in from the right
  const wipeOut = tw(f, [end - 14, end], [0, 1], ease.in); // divider wipes away to the left
  const div = wipeIn - wipeOut * 960;
  const thumbs = cue("bothRight");
  // LEFT: Nell in the cab, steady white pitch line
  const bump = noise1("sb", f / 4) * 2.4;
  const nellPose = track(f, [
    [start, { ...POSE.handsOnWheel, turn: 0.1 }],
    [thumbs, { ...POSE.handsOnWheel, armR: { a: 70, b: 70 }, handR: "thumb", turn: 0.4, lookX: 0.8 }],
  ], 10);
  nellPose.bodyY += bump * 0.4;
  // RIGHT: Pip on the sidewalk, ambulance passes (R->L), rings squeezed BLUE ahead / stretched RED behind
  const look = tw(f, [pass - 22, pass + 14], [1, -1], ease.inOut);
  const pipPose = track(f, [
    [start + 10, { ...POSE.cupEars, turn: 0.5, lookX: 1 }],
    [pass - 4, { ...POSE.cupEars, turn: 0, lookX: 0 }],
    [pass + 16, { ...POSE.cupEars, turn: -0.5, lookX: -1 }],
    [thumbs, { armL: { a: -70, b: -70 }, handL: "thumb", turn: -0.5, lookX: -0.9 }],
  ], 10);
  if (f > pass - 22 && f < pass + 14) pipPose.lookX = look;
  const pipExpr = f < pass - 6 ? "focused" : f < pass + 30 ? "ooo" : f < thumbs ? "curious" : "joy";
  const pitch = f < pass ? tw(f, [start + 20, pass - 20], [0.5, 1], ease.out) : -1;
  const step = prog(f, pass - 3, pass + 9, ease.out) * (1 - prog(f, pass + 26, pass + 34, ease.inOut));
  const sirenAt = (t: number) => ({ x: splitAmbX(t) + AMB_SIREN.x * SPLIT_S, y: 820 + AMB_SIREN.y * SPLIT_S });
  const ax = splitAmbX(f);
  const driftL = tw(f, [start, end], [0, -40], ease.inOutSine);
  const driftR = tw(f, [start, end], [0, 50], ease.inOutSine);
  const plL = sp(f, start + 12, fps, spr.bouncy);
  const plR = sp(f, start + 18, fps, spr.bouncy);
  return (
    <AbsoluteFill>
      {/* LEFT half */}
      <AbsoluteFill style={{ clipPath: `inset(0 ${1920 - div}px 0 0)` }}>
        <AbsoluteFill style={{ transform: `translateX(${-(1920 - Math.max(960, div)) / 2 + driftL}px)` }}>
          <Camera cam={{ x: 0, y: -bump * 0.5, zoom: 1.02, rot: 0, frame: f }}>
            <Layer depth={0.35} blur={1.2}><CabWindow frame={f} /></Layer>
            <Layer depth={1}><CabInterior frame={f} tagSwing={Math.sin(f / 7) * 12} /></Layer>
            <Layer depth={1.05}><Svg><Rig uid="nellsp" def={NELL} frame={f} x={960} y={1400} scale={2.1} pose={nellPose} expr={f < thumbs ? "neutral" : "happy"} /></Svg></Layer>
            <Layer depth={1.3} blur={2}><Svg><g transform="translate(960,1150)"><SteeringWheel r={250} rot={Math.sin(f / 22) * 4} /></g></Svg></Layer>
          </Camera>
          <Svg>
            <g opacity={plL} transform={`translate(1230,${300 + (1 - plL) * 24}) scale(${0.6 + 0.4 * plL})`}>
              <PitchLine x={0} y={0} w={240} frame={f} pitch={0} neutral tail="left" />
            </g>
          </Svg>
        </AbsoluteFill>
        <Finish tint={C.teal} grade={0.1} vig={0.25} />
      </AbsoluteFill>
      {/* RIGHT half */}
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${div}px)` }}>
        <Camera cam={{ x: -120 + driftR, y: 0, zoom: 1, rot: 0, frame: f, shake: 1.8, seed: "split" }}>
          <Street tod="golden" frame={f} subject={
            <Svg>
              <Rings id="splitr" frame={f} path={(t) => ({ x: sirenAt(t).x - 120, y: sirenAt(t).y })} start={sync("splitStart")} stop={pass + 60} period={7} c={22} maxR={1100} tint width={6} />
              {ax > -400 && ax < 2600 && <Ambulance x={ax - 120} y={820} scale={SPLIT_S} flash={f / 7} wheel={-(f * SPLIT_V) / 26 * 57.3} bounce={Math.sin(f / 2.3) * 1.4} />}
              <Rig uid="pipsp" def={PIP} frame={f} x={SPLIT_PIP - 120 + 60} y={960} scale={1.1} pose={pipPose} expr={pipExpr} />
            </Svg>
          } />
        </Camera>
        <Svg>
          <g opacity={plR} transform={`translate(${SPLIT_PIP + 20},${470 + (1 - plR) * 24}) scale(${0.6 + 0.4 * plR})`}>
            {step > 0.02 ? <PitchLine x={0} y={0} w={250} frame={f} pitch={0} step={step} /> : <PitchLine x={0} y={0} w={250} frame={f} pitch={pitch} />}
          </g>
        </Svg>
        <Finish tint={C.sun} grade={0.12} vig={0.25} />
      </AbsoluteFill>
      {/* divider pill */}
      <Svg>
        <rect x={div - 9} y={-20} width={18} height={1120} rx={9} fill={C.lilac} />
        <rect x={div - 3} y={-20} width={6} height={1120} rx={3} fill={C.white} />
        <g transform={`translate(${div},540)`}>
          <circle r={34} fill={C.lilac} />
          <path d="M-12,-10 L-20,0 L-12,10 M12,-10 L20,0 L12,10" stroke={C.violet} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </Svg>
      <LabelPill f={f} at={cue("sameSiren")} out={end - 4} text="SAME SIREN" y={92} size={58} color={C.night} bg={C.sun} />
      <LabelPill f={f} at={cue("twoSounds")} out={end - 4} text="TWO SOUNDS" y={200} size={46} color={C.white} bg={alpha(C.night, 0.82)} arrows />
      {/* ding sparkle on the thumbs-up */}
      <Svg>
        {[480, 1440].map((x, i) => {
          const p = prog(f, thumbs + 4 + i * 2, thumbs + 20 + i * 2, ease.out);
          if (p <= 0 || p >= 1) return null;
          return <g key={x} transform={`translate(${x + (i ? -150 : 180)},${i ? 640 : 560})`} opacity={1 - p}>{Array.from({ length: 8 }).map((_, k) => <rect key={k} x={20 + p * 40} y={-3} width={22} height={6} rx={3} fill={C.sunLt} transform={`rotate(${k * 45})`} />)}</g>;
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s1_notsiren
const NotSiren: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const S = 2.3;
  const AX = 960 + 35 * S, AY = 1260;
  const punch = tw(f, [start, start + 8], [1.12, 1.0], ease.out) * tw(f, [start + 8, end], [1, 1.05], ease.inOutSine);
  const q = sp(f, cue("whatChanged") + 2, fps, spr.bouncy);
  const qBob = Math.sin(f / 5) * 8;
  const qOut = prog(f, cue("notSiren") + 2, cue("notSiren") + 8, ease.in);
  const xp = prog(f, cue("notSiren") + 6, cue("notSiren") + 14, ease.out);
  const xs = sp(f, cue("notSiren") + 6, fps, spr.bouncy);
  const shake = f > cue("notSiren") + 8 && f < cue("notSiren") + 16 ? Math.sin(f * 2.4) * 6 : 0;
  return (
    <AbsoluteFill>
      <Camera cam={{ x: tw(f, [start, end], [-40, 30], ease.inOutSine) + shake, y: -60, zoom: punch, rot: 0, frame: f }}>
        <Street tod="golden" frame={f} hedges={false} dof={2.6} />
        <Layer depth={1}>
          <Svg>
            <Ambulance x={AX} y={AY} scale={S} flash={f / 9} wheel={0} />
          </Svg>
        </Layer>
      </Camera>
      <Svg>
        <g transform={`translate(960,${300 + qBob}) scale(${q * (1 - qOut)}) rotate(${(1 - q) * -30 + Math.sin(f / 7) * 5})`}>
          <circle r={110} fill={C.sun} />
          <text y={58} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={170} fill={C.night}>?</text>
        </g>
        {xp > 0 && (
          <g transform={`translate(960,${420}) scale(${0.6 + 0.4 * xs})`} style={{ filter: `drop-shadow(0 10px 20px ${alpha(C.night, 0.5)})` }}>
            <BigX size={170} p={xp} />
          </g>
        )}
      </Svg>
      <Finish tint={C.sun} grade={0.12} vig={0.3} />
      <div style={{ position: "absolute", left: 0, width: 1920, top: 128, display: "flex", justifyContent: "center", opacity: xp, transform: `translateY(${(1 - xs) * -30}px) scale(${0.7 + 0.3 * xs})` }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 64, color: C.white, background: C.red, padding: "10px 40px", borderRadius: 999, letterSpacing: "0.05em", boxShadow: `0 14px 40px ${alpha(C.night, 0.45)}` }}>NOT THE SIREN</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s1_air
const Air: React.FC<SceneProps> = ({ f, start, end }) => {
  const drop = tw(f, [start, start + 26], [-260, 110], ease.inOut); // camera drops to ground level
  const dolly = tw(f, [start, end + 10], [-60, 80], ease.inOutSine);
  const AX = 520, PX = 1500;
  const siren = { x: AX + AMB_SIREN.x * 0.55, y: 862 + AMB_SIREN.y * 0.55 };
  const glow = prog(f, start + 20, end, ease.inOut);
  return (
    <AbsoluteFill>
      <Camera cam={{ x: dolly, y: drop, zoom: tw(f, [start, end + 10], [1.0, 1.08], ease.inOutSine), rot: 0, frame: f }}>
        <Street tod="golden" frame={f} dof={1.2} subject={
          <Svg>
            <Ambulance x={AX} y={862} scale={0.55} flash={f / 8} wheel={0} />
            <Rig uid="pipair" def={PIP} frame={f} x={PX} y={900} scale={0.8} pose={{ turn: -0.5, lookX: -1, headTilt: -3 }} expr="curious" />
            {/* air shimmer band between them */}
            {Array.from({ length: 7 }).map((_, i) => {
              let d = "";
              for (let k = 0; k <= 40; k++) {
                const x = AX + 120 + (k / 40) * (PX - AX - 220);
                const y = 600 + i * 26 + Math.sin(k * 0.7 + f / 6 + i) * 5;
                d += `${k ? "L" : "M"}${x},${y}`;
              }
              return <path key={i} d={d} stroke={alpha(C.white, 0.08 + 0.1 * glow)} strokeWidth={3} fill="none" />;
            })}
            <g opacity={0.25 + 0.55 * glow}>
              <Rings id="airr" frame={f} path={() => siren} start={start - 40} period={12} c={9} maxR={1100} width={4} dash="2 14" />
            </g>
            <Dust seed="airdust" frame={f} n={40} area={[AX + 100, 450, PX - AX - 150, 400]} color={C.sunLt} size={[1.5, 4]} opacity={0.6} speed={0.7} />
          </Svg>
        } />
      </Camera>
      <LightLeak t={prog(f, start, end + 20, ease.inOutSine)} color={C.sun} opacity={0.22} />
      <Finish tint={C.sun} grade={0.12} vig={0.3} />
    </AbsoluteFill>
  );
};

export const CH1: SceneReg[] = [
  { ids: ["s1_cab"], C: Cab },
  { ids: ["s1_roof"], C: Roof },
  { ids: ["s1_split"], C: Split },
  { ids: ["s1_notsiren"], C: NotSiren },
  { ids: ["s1_air"], C: Air },
];
