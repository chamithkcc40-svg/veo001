// ch0.tsx - Cold open (f0-339): s0_void -> s0_street + s0_tilt (one continuous move) -> s0_space.
// All frames are GLOBAL. Cue frames come from data/video.json (cue/sync), never literals tied to audio.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, spr } from "../theme";
import { alpha, mix, prog, rr, sp, tw, noise1, clamp } from "../util";
import { cue, sync } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot } from "../kit/fx";
import { StreetClouds, StreetFar, StreetGround, StreetHedges, StreetHouses, StreetSky, STREET } from "../kit/env/Street";
import { Space } from "../kit/env/Space";
import { Rings } from "../kit/info/Rings";
import { PitchLine } from "../kit/info/PitchLine";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { LetterTitle } from "../kit/info/Labels";
import { Ambulance, AMB_SIREN } from "../kit/props/Props";
import { Rig } from "../kit/rig/Rig";
import { PIP } from "../kit/rig/characters";
import { track, POSE } from "../kit/rig/poses";
import { SceneReg, SceneProps } from "../chapters/types";

// ------------------------------------------------------------------ s0_void
const VOID_C = 24; // ring speed px/frame
const VOID_O = { x: 1240, y: 500 };
const EAR_X = 520; // where Pip's ear sits on screen in the CU

const Void: React.FC<SceneProps> = ({ f }) => {
  const { fps } = useVideoConfig();
  const born = [cue("listen"), cue("listen") + 22]; // bloom sfx frames (15, 37)
  // first ring reaches the ear -> ear perk (anticipation dip, overshoot, settle)
  const hit = born[0] + Math.round((VOID_O.x - EAR_X) / VOID_C);
  const perk = sp(f, hit, fps, spr.bouncy) - sp(f, hit + 5, fps, spr.smooth) * 0.6;
  const earIn = sp(f, 18, fps, spr.smooth);
  const zoom = tw(f, [0, 60], [1, 1.07], ease.inOutSine);
  const fadeIn = prog(f, 0, 10, ease.out);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Camera cam={{ x: 0, y: 0, zoom, rot: 0, frame: f }}>
        <Layer depth={0}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 70% at 52% 48%, ${mix(C.night, C.violet, 0.35)}, ${C.night} 60%, #0B0420 100%)` }} />
        </Layer>
        <Layer depth={0.3} blur={1.5}>
          <Svg><Dust seed="voiddust" frame={f} n={46} size={[1, 3]} opacity={0.4} speed={0.6} /></Svg>
        </Layer>
        <Layer depth={0.8}>
          <Svg>
            <GlowDot id="voidcore" cx={VOID_O.x} cy={VOID_O.y} r={90 + 30 * Math.sin(f / 5)} color={C.lilac} o={0.35 * prog(f, born[0] - 4, born[0] + 4, ease.out)} />
            {born.map((b, i) => {
              const age = f - b;
              if (age < 0) return null;
              const r = VOID_C * age;
              const a = (1 - clamp(r / 1500)) * prog(f, b, b + 3, ease.out);
              return (
                <g key={i} style={{ filter: `drop-shadow(0 0 14px ${alpha(C.white, 0.8)})` }}>
                  <circle cx={VOID_O.x} cy={VOID_O.y} r={r} fill="none" stroke={C.white} strokeWidth={9 - i * 2} opacity={a} />
                  <circle cx={VOID_O.x} cy={VOID_O.y} r={Math.max(0, r - 18)} fill="none" stroke={C.lilac} strokeWidth={2} opacity={a * 0.5} />
                </g>
              );
            })}
          </Svg>
        </Layer>
        {/* L4: Pip's ear CU, entering from the left (x + opacity + scale), then perking */}
        <Layer depth={1.1}>
          <Svg>
            <g opacity={earIn} transform={`translate(${(1 - earIn) * -160},${(1 - earIn) * 20})`}>
              <Rig uid="pipcu" def={PIP} frame={f} x={EAR_X + 120} y={1900} scale={6.2}
                pose={{ turn: 0.85, lookX: 1, headTilt: -4 - perk * 5, bodyY: -perk * 10 }} expr={f > hit ? "curious" : "neutral"} idle={0.6} />
            </g>
          </Svg>
        </Layer>
      </Camera>
      <Finish tint={C.violet} grade={0.16} vig={0.4} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s0_street + s0_tilt
const AMB_S = 0.78;
const AMB_Y = 836;
const PIP_X = 480;
const AMB_V = 19; // px/frame, < ring speed (no shock cone)
const RING_C = 26;
const RING_P = 7;

const ambX = (t: number) => PIP_X + (sync("sirenPass") - t) * AMB_V;
const sirenAt = (t: number) => ({ x: ambX(t) + AMB_SIREN.x * AMB_S, y: AMB_Y + AMB_SIREN.y * AMB_S });

/** whip-tilt progress (px of upward camera travel) */
const tiltY = (f: number) => tw(f, [cue("tinyDrop"), cue("tinyDrop") + 52], [0, 1180], ease.inOut) + tw(f, [cue("tinyDrop") + 52, cue("universe0") + 10], [0, 160], ease.out);

const TiltLayer: React.FC<{ k: number; ty: number; children: React.ReactNode; blur?: number }> = ({ k, ty, children, blur = 0 }) => (
  <AbsoluteFill style={{ transform: `translateY(${ty * k}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>
);

const StreetScene: React.FC<SceneProps> = ({ f, start }) => {
  const { fps } = useVideoConfig();
  const pass = sync("sirenPass");
  const t0 = cue("tinyDrop");
  // iris: the second void ring becomes the window into the street (ring match-cut)
  const irisR = f < start + 18 ? Math.max(0, (f - (cue("listen") + 22)) * VOID_C * tw(f, [start, start + 18], [1, 2.6], ease.in)) : 4000;
  const ty = tiltY(f);
  const vel = Math.abs(tiltY(f + 1) - tiltY(f - 1)) / 2;
  const mb = Math.min(9, vel * 0.13); // motion blur during the whip
  const pull = tw(f, [t0, t0 + 60], [1, 0.86], ease.inOut);
  const camX = tw(f, [start, pass + 20], [230, -150], ease.inOut) + tw(f, [pass + 20, start + 200], [0, -40], ease.out);
  const cam = { x: camX, y: 0, zoom: tw(f, [start, pass], [1, 1.045], ease.inOutSine) * pull, rot: 0, frame: f, shake: 2.6 * (1 - prog(f, t0, t0 + 20)), seed: "street0" };

  // Pip: turns toward the sound, cups ears, tracks the pass, 'ooo' at the drop, looks up for the tilt
  const look = tw(f, [pass - 26, pass + 14], [1, -1], ease.inOut);
  const pose = track(f, [
    [start, { turn: 0.2, lookX: 0.3 }],
    [start + 22, { turn: 0.55, lookX: 1, headTilt: 4 }],
    [start + 40, { ...POSE.cupEars, turn: 0.55, lookX: 1, headTilt: 4 }],
    [pass - 4, { ...POSE.cupEars, turn: 0, lookX: 0, headTilt: 0 }],
    [pass + 18, { ...POSE.cupEars, turn: -0.5, lookX: -1, headTilt: -5 }],
    [t0 + 2, { ...POSE.lookUp, turn: -0.1, lookX: -0.2, armL: { a: -20, b: 30 }, armR: { a: 20, b: -30 } }],
  ], 12);
  if (f > pass - 26 && f < pass + 18) pose.lookX = look; // eyes lead the head (overlap)
  const expr = f < start + 30 ? "curious" : f < pass - 6 ? "focused" : f < pass + 40 ? "ooo" : f < t0 ? "surprised" : "curious";

  // Pitch Line: pops in, tight BLUE while approaching, then the step drop at the pass
  const plIn = sp(f, start + 30, fps, spr.bouncy);
  const plOut = prog(f, t0 + 10, t0 + 22, ease.in);
  const pitch = tw(f, [start + 30, pass - 30], [0.4, 1], ease.out);
  const step = prog(f, pass - 2, pass + 10, ease.out);

  const x = ambX(f);
  const onScreen = x > -900 && x < 2900;
  const subject = (
    <Svg>
      <g opacity={1 - prog(f, t0 + 2, t0 + 14, ease.out)}><Rings id="cold" frame={Math.min(f, t0 + 2)} path={sirenAt} start={sync("sirenStart")} stop={start + 150} period={RING_P} c={RING_C} maxR={1250} tint width={7} /></g>
      {onScreen && (
        <Ambulance x={x} y={AMB_Y} scale={AMB_S} flash={f / 7} wheel={-(f * AMB_V) / (44 * AMB_S) * 57.3}
          bounce={Math.sin(f / 2.3) * 1.6 + noise1("ab", f / 3) * 1.2} tilt={noise1("at", f / 6) * 0.4} />
      )}
      <Rig uid="pip0" def={PIP} frame={f} x={PIP_X} y={960} scale={1.12} pose={pose} expr={expr} follow={Math.sin(f / 6) * 3} />
      <g opacity={Math.min(plIn, 1 - plOut)} transform={`translate(${PIP_X},${560 + (1 - plIn) * 30}) scale(${0.6 + 0.4 * plIn}) translate(${-PIP_X},-560)`}>
        {step < 0.02
          ? <PitchLine x={PIP_X} y={560} w={260} frame={f} pitch={pitch} />
          : <PitchLine x={PIP_X} y={560} w={260} frame={f} pitch={0} step={step} />}
      </g>
    </Svg>
  );

  // rings -> stars: at the freeze the visible arcs of the last rings break into dots; the dots
  // ride the tilt at a far-plane rate (so they stay in the sky while the street drops away),
  // cool from red to lilac and twinkle into the starfield that s0_space continues.
  const starDots = () => {
    if (f < t0) return null;
    const out: React.ReactNode[] = [];
    const tf = t0; // freeze frame
    const z = 1.045; // camera zoom at the freeze
    for (let k = 0; k < 9; k++) {
      const te = start + 150 - k * RING_P;
      const s0 = sirenAt(te);
      const r = RING_C * (tf - te) * z;
      const cx = 960 + (s0.x - camX - 960) * z;
      const cy = 540 + (s0.y - 540) * z;
      const n = 120;
      const brk = prog(f, tf + 4 + k * 2, tf + 46 + k * 2, ease.out);
      for (let i = 0; i < n; i++) {
        const th = (i / n) * Math.PI * 2;
        const px0 = cx + Math.cos(th) * r;
        const py0 = cy + Math.sin(th) * r;
        if (px0 < -60 || px0 > 1980 || py0 < -60 || py0 > 1000) continue;
        const px = px0 + brk * rr(`sdx${k}-${i}`, -70, 70);
        const py = py0 + ty * 0.35 - brk * rr(`sdy${k}-${i}`, 60, 340);
        const twk = 0.55 + 0.45 * Math.sin(f / rr(`sdt${k}-${i}`, 4, 9) + i);
        const col = mix(C.red, C.lilac, brk);
        const big = rr(`sdb${k}-${i}`, 0, 1) > 0.88;
        out.push(<circle key={`${k}-${i}`} cx={px} cy={py} r={(big ? 6 : 3.4) * (0.75 + 0.5 * brk)} fill={col} opacity={twk * (1 - prog(f, cue("universe0") + 4, cue("universe0") + 30)) * 0.95} />);
      }
    }
    return <Svg style={{ filter: `drop-shadow(0 0 5px ${alpha(C.lilac, 0.8)})` }}>{out}</Svg>;
  };

  return (
    <AbsoluteFill style={{ clipPath: `circle(${irisR}px at ${VOID_O.x}px ${VOID_O.y}px)` }}>
      <AbsoluteFill>
        <Camera cam={cam}>
          <TiltLayer k={0.85} ty={ty}><Layer depth={0.08}><StreetSky tod="dusk" frame={f} starsO={0.55 + 0.45 * prog(f, t0, t0 + 50)} /></Layer></TiltLayer>
          <TiltLayer k={0.9} ty={ty} blur={mb * 0.4}><Layer depth={0.15} blur={1.5}><StreetClouds tod="dusk" frame={f} /></Layer></TiltLayer>
          <TiltLayer k={0.95} ty={ty} blur={mb * 0.6}><Layer depth={0.3} blur={3}><StreetFar tod="dusk" /></Layer></TiltLayer>
          <TiltLayer k={1} ty={ty} blur={mb * 0.8}><Layer depth={0.55} blur={1.2}><StreetHouses tod="dusk" frame={f} /></Layer></TiltLayer>
          <TiltLayer k={1.05} ty={ty} blur={mb}><Layer depth={1}><StreetGround tod="dusk" frame={f} /></Layer></TiltLayer>
          <TiltLayer k={1.05} ty={ty} blur={mb}><Layer depth={1}>{subject}</Layer></TiltLayer>
          <TiltLayer k={1.3} ty={ty} blur={mb * 1.3}><Layer depth={1.6} blur={8}><StreetHedges tod="dusk" frame={f} /></Layer></TiltLayer>
        </Camera>
      </AbsoluteFill>
      {starDots()}
      <Finish tint={C.magenta} grade={0.15} vig={0.3} />
      {/* the iris edge is a glowing ring for the first frames */}
      {f < start + 18 && (
        <Svg><circle cx={VOID_O.x} cy={VOID_O.y} r={irisR} fill="none" stroke={C.white} strokeWidth={10} opacity={1 - prog(f, start + 8, start + 18)} style={{ filter: `drop-shadow(0 0 16px ${C.white})` }} /></Svg>
      )}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ s0_space
type Gx = { x: number; y: number; r: number; rot: number; tilt: number; d: number };
const FIELD: Gx[] = Array.from({ length: 22 }).map((_, i) => {
  const a = rr("fa" + i, 0, Math.PI * 2);
  const rad = rr("fr" + i, 240, 980);
  return { x: 960 + Math.cos(a) * rad * 1.15, y: 520 + Math.sin(a) * rad * 0.6, r: rr("fs" + i, 22, 58), rot: rr("fo" + i, 0, 360), tilt: rr("ft" + i, 0.1, 0.6), d: rr("fd" + i, 0.6, 1.2) };
}).filter((g) => Math.hypot(g.x - 1260, g.y - 470) > 260);

const SpaceScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const fade = prog(f, start - 16, start + 6, ease.inOutSine);
  const u = f - start;
  const cam = { x: tw(f, [start - 16, end], [-90, 70], ease.inOutSine), y: tw(f, [start - 16, end], [60, -20], ease.inOutSine), zoom: tw(f, [start - 16, end], [1, 1.12], ease.inOutSine), rot: tw(f, [start - 16, end], [-0.6, 0.4], ease.inOutSine), frame: f };
  const spread = 1 + Math.max(0, u + 16) * 0.0022; // the field drifts apart slightly
  const hero = sp(f, start - 4, fps, spr.heavy);
  const shift = tw(f, [cue("growing0") - 30, cue("growing0") + 6], [0, 0.78], ease.inOut);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Camera cam={cam}>
        <Space frame={f} nebula={[C.magenta, C.purple]} subject={
          <Svg>
            {FIELD.map((g, i) => {
              const gp = sp(f, start - 10 + i * 2, fps, spr.smooth);
              return (
                <Galaxy key={i} id={`fg${i}`} x={960 + (g.x - 960) * spread * g.d ** 0.1} y={520 + (g.y - 520) * spread} r={g.r * (0.7 + 0.3 * gp)} frame={f} rot={g.rot} tilt={g.tilt}
                  shift={0.25 + 0.35 * prog(f, start + 10, end)} dots={26} opacity={gp * 0.85} glow={0.8} />
              );
            })}
            <ellipse cx={1260} cy={470} rx={330 * (0.82 + 0.18 * hero)} ry={330 * 0.68 * (0.82 + 0.18 * hero)} fill="none" stroke={C.red} strokeWidth={60} opacity={0.22 * shift} style={{ filter: "blur(30px)" }} />
            <Galaxy id="hero0" x={1260} y={470} r={150 * (0.82 + 0.18 * hero)} frame={f} rot={30} spin={0.22} tilt={0.32} shift={shift} glow={0.9 + 0.25 * Math.sin(f / 9)} opacity={Math.min(1, hero * 1.3)} dots={90} />
          </Svg>
        } />
      </Camera>
      <Finish tint={C.violet} grade={0.16} vig={0.32} />
      <LetterTitle f={f} fps={fps} at={start + 16} out={end + 2} text="ONE SIREN. ONE UNIVERSE." size={42} x={110} y={812} align="left" color={C.sun} glow={C.sun} stagger={1} weight={600} />
      <ExaggeratedTag x={1824} y={790} opacity={prog(f, cue("growing0") - 20, cue("growing0"), ease.out) * (1 - prog(f, end - 6, end, ease.in))} />
    </AbsoluteFill>
  );
};

export const CH0: SceneReg[] = [
  { ids: ["s0_void"], C: Void, post: 18 },
  { ids: ["s0_street", "s0_tilt"], C: StreetScene, post: 2 },
  { ids: ["s0_space"], C: SpaceScene, pre: 16 },
];
