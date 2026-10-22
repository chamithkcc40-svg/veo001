// ch5.tsx - Close (f5334-5790). All frames GLOBAL. s5_street + s5_sky are ONE continuous shot.
// s5_street  match-cut ring: a red ring opens from the tiny Milky Way of s4_ray ("us") and becomes the
//            iris into Sunset Street, later light (night palette, first stars). An ambulance passes
//            Pip left->right (siren_pass_soft from 5340, pass on sync.closePass 5412): rings blue
//            ahead, red behind; the Pitch Line drops on the pass. Pip smiles knowingly on "listen".
// s5_sky     Pip looks up on "hearing"; slow crane-up into the night sky; the red rings behind the
//            ambulance lift off, shrink and condense into red-shifted galaxies (sparkle 5471);
//            "LISTEN FOR THE DROP" small (sparkle 5591). Final hold keeps the upper-left and
//            upper-right sky clear for end-screen cards and the lower centre clear for captions.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, sync, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { StreetClouds, StreetFar, StreetGround, StreetHedges, StreetHouses, StreetSky } from "../kit/env/Street";
import { Rings } from "../kit/info/Rings";
import { PitchLine } from "../kit/info/PitchLine";
import { Galaxy } from "../kit/info/Galaxy";
import { Nebula } from "../kit/env/Space";
import { Ambulance, AMB_SIREN } from "../kit/props/Props";
import { Rig } from "../kit/rig/Rig";
import { PIP } from "../kit/rig/characters";
import { POSE, track } from "../kit/rig/poses";
import { SceneProps, SceneReg } from "../chapters/types";

const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;
const AMB_S = 0.72, AMB_Y = 836, AMB_V = 18; // softer, a touch slower than the cold open; enters from off-left (< ring speed)
const PIP_X = 1400; // Pip on the right this time (mirror of the cold open staging)
const RING_C = 26, RING_P = 7;
const ambX = (t: number) => PIP_X + (t - sync("closePass")) * AMB_V; // drives left -> right
const sirenAt = (t: number) => ({ x: ambX(t) - AMB_SIREN.x * AMB_S, y: AMB_Y + AMB_SIREN.y * AMB_S }); // facing +1 mirrors x

/** match-cut iris: centre = where the tiny Milky Way of s4_ray sits on screen at its last frame */
const IRIS = { x: 400, y: 460 };
const TiltLayer: React.FC<{ k: number; ty: number; children: React.ReactNode; blur?: number }> = ({ k, ty, children, blur = 0 }) => (
  <AbsoluteFill style={{ transform: `translateY(${ty * k}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>
);
/** red rings that lift off the street and condense into galaxies (screen space, centre band only) */
const LIFT = [
  { x: 820, y: 330 }, { x: 1010, y: 230 }, { x: 1180, y: 350 }, { x: 900, y: 470 }, { x: 1110, y: 500 }, { x: 960, y: 370 },
];
const LiftRings: React.FC<{ f: number; at: number; fps: number; spread: number }> = ({ f, at, fps, spread }) => (
  <Svg style={{ filter: `drop-shadow(0 0 8px ${alpha(C.red, 0.7)})` }}>
    {LIFT.map((g, k) => {
      const b = at + k * 9;
      const p = prog(f, b, b + 80, ease.inOut);
      if (p <= 0) return null;
      const sx = 560 + k * 70, sy = 900; // where the trailing rings were on the street
      const gx = 960 + (g.x - 960) * spread, gy = 370 + (g.y - 370) * spread; // the hold keeps expanding
      const x = mix2(sx, gx, p) + Math.sin(p * Math.PI) * (k % 2 ? 60 : -60), y = mix2(sy, gy, p); // arcing path
      const R = mix2(300 - k * 20, 6, ease.inOut(clamp(p * 1.1)));
      const gp = sp(f, b + 66, fps, spr.bouncy);
      return (
        <g key={k}>
          {p < 0.98 && <circle cx={x} cy={y} r={R} fill="none" stroke={C.red} strokeWidth={6 + 4 * p} opacity={0.85 * (1 - prog(f, b + 64, b + 80, ease.out))} />}
          {gp > 0.01 && <Galaxy id={"lift" + k} x={x} y={y} r={(20 + (k % 3) * 8) * gp} frame={f} shift={0.55 + 0.08 * k} tilt={0.4} rot={k * 50} dots={22} glow={1.2} />}
        </g>
      );
    })}
  </Svg>
);

/** Hubble flow for the final hold: seeded galaxies drift OUTWARD from the centre with speed proportional
 *  to distance (the law, as a picture), redden as they recede, and fade before the end-screen corners
 *  (upper-left / upper-right) and the caption band. 24 galaxies = the 24 of Hubble's 1929 plot. */
const HUB_C = { x: 960, y: 380 };
const HubbleField: React.FC<{ f: number; at: number; fps: number }> = ({ f, at, fps }) => (
  <Svg>
    {Array.from({ length: 24 }).map((_, k) => {
      const b = at + k * 7; // staggered births, centre-out
      const age = f - b;
      if (age < 0) return null;
      const th = rr("hub" + k, 0, Math.PI * 2), d0 = rr("hubd" + k, 30, 190);
      const grow = Math.exp(age / (fps * 6.5)); // distance x speed: d(t) = d0 * e^(Ht)
      const x = HUB_C.x + Math.cos(th) * d0 * grow * 1.6, y = HUB_C.y + Math.sin(th) * d0 * grow * 0.75;
      const inBand = 1 - prog(Math.abs(x - 960), 520, 700, ease.out); // fade before the corner cards
      const above = 1 - prog(y, 600, 700, ease.out); // never into the tag / caption band
      const born = sp(f, b, fps, spr.bouncy);
      const o = clamp(born) * inBand * above;
      if (o < 0.02) return null;
      const r = (8 + rr("hubr" + k, 0, 10)) * (0.8 + 0.2 * grow) * born;
      return <Galaxy key={k} id={"hub" + k} x={x} y={y} r={r} frame={f} shift={clamp(0.2 + 0.25 * (grow - 1))} tilt={rr("hubt" + k, 0.2, 0.6)} rot={k * 37} spin={0.3} dots={14} glow={1.3} opacity={o} />;
    })}
  </Svg>
);

export const CloseScene: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const pass = sync("closePass"), listen = cue("listen2"), hear = cue("hearing"), last = cue("lastWord");
  const iris = f < start + 20 ? Math.max(0, (f - start + 2) * 26 * tw(f, [start, start + 20], [1, 3], ease.in)) : 4000;
  // crane-up: slow, starts on "hearing", eases into the final hold (one continuous move, no cut)
  const ty = tw(f, [hear + 2, hear + 120], [0, 1250], ease.inOut) + tw(f, [hear + 120, end], [0, 60], ease.out);
  const camX = tw(f, [start, pass + 30], [-140, 110], ease.inOut) + tw(f, [pass + 30, end], [0, 30], ease.out);
  const cam = { x: camX, y: 0, zoom: tw(f, [start, pass], [1.02, 1.06], ease.inOutSine) * tw(f, [hear, hear + 120], [1, 0.94], ease.inOut), rot: 0, frame: f, shake: 1.8 * (1 - prog(f, hear, hear + 40)), seed: "close5" };
  const pose = track(f, [
    [start, { turn: -0.4, lookX: -1, headTilt: 3 }],
    [pass - 30, { turn: -0.5, lookX: -1, headTilt: 4, armL: { a: -14, b: 20 } }],
    [pass + 16, { turn: 0.5, lookX: 1, headTilt: -3 }],
    [listen, { turn: 0.2, lookX: 0.2, headTilt: 6, ...POSE.thumbsUpR }],
    [hear + 6, { ...POSE.lookUp, turn: 0, headTilt: -14, armL: { a: -18, b: 26 }, armR: { a: 18, b: -26 } }],
    [end, { ...POSE.lookUp, turn: 0, headTilt: -16, armL: { a: -20, b: 30 }, armR: { a: 20, b: -30 } }],
  ], 12);
  const expr = f < pass - 6 ? "curious" : f < listen ? "ooo" : f < hear ? "proud" : "happy";
  const plIn = sp(f, start + 14, fps, spr.bouncy), plOut = prog(f, hear - 4, hear + 8, ease.in);
  const pitch = tw(f, [start + 14, pass - 24], [0.4, 1], ease.out), step = prog(f, pass - 2, pass + 10, ease.out);
  const x = ambX(f);
  const ringsO = 1 - prog(f, hear + 30, hear + 70, ease.out);
  const subject = (
    <Svg>
      <g opacity={ringsO}><Rings id="close" frame={f} path={sirenAt} start={sync("closeStart")} stop={hear + 10} period={RING_P} c={RING_C} maxR={1200} tint width={6} /></g>
      {x > -900 && x < 3000 && <Ambulance x={x} y={AMB_Y} scale={AMB_S} flash={f / 7} wheel={(f * AMB_V) / (44 * AMB_S) * 57.3} facing={1} bounce={Math.sin(f / 2.3) * 1.4 + noise1("cab", f / 3)} tilt={noise1("cat", f / 6) * 0.4} />}
      <Rig uid="pip5" def={PIP} frame={f} x={PIP_X} y={960} scale={1.12} pose={pose} expr={expr} follow={Math.sin(f / 6) * 3} />
      <g opacity={Math.min(plIn, 1 - plOut)} transform={`translate(${PIP_X},${560 + (1 - plIn) * 30}) scale(${0.6 + 0.4 * plIn}) translate(${-PIP_X},-560)`}>
        {step < 0.02 ? <PitchLine x={PIP_X} y={560} w={260} frame={f} pitch={pitch} /> : <PitchLine x={PIP_X} y={560} w={260} frame={f} pitch={0} step={step} />}
      </g>
    </Svg>
  );
  const tagP = sp(f, last + 14, fps, spr.smooth); // final small text (sparkle 5591 lands on it)
  const holdT = prog(f, last, end + 20, ease.inOutSine), hold = 1 + 0.05 * holdT; // slow push + drift in the hold
  const shP = prog(f, end - 110, end - 84, ease.inOut), shootX = mix2(1500, 1180, shP), shootY = mix2(240, 345, shP), shootO = Math.sin(shP * Math.PI); // one shooting star mid-hold (centre band, not the end-screen corners)
  return (
    <AbsoluteFill style={{ clipPath: `circle(${iris}px at ${IRIS.x}px ${IRIS.y}px)` }}>
      <Camera cam={cam}>
        <TiltLayer k={0.82} ty={ty}><Layer depth={0.08}><StreetSky tod="night" frame={f} starsO={0.7 + 0.3 * prog(f, hear, hear + 90)} /></Layer></TiltLayer>
        <TiltLayer k={0.88} ty={ty}><Layer depth={0.15} blur={1.5}><StreetClouds tod="night" frame={f} /></Layer></TiltLayer>
        <TiltLayer k={0.95} ty={ty}><Layer depth={0.3} blur={3}><StreetFar tod="night" /></Layer></TiltLayer>
        <TiltLayer k={1} ty={ty}><Layer depth={0.55} blur={1.2}><StreetHouses tod="night" frame={f} birds={false} /></Layer></TiltLayer>
        <TiltLayer k={1.05} ty={ty}><Layer depth={1}><StreetGround tod="night" frame={f} /></Layer></TiltLayer>
        <TiltLayer k={1.05} ty={ty}><Layer depth={1}>{subject}</Layer></TiltLayer>
        <TiltLayer k={1.3} ty={ty}><Layer depth={1.6} blur={8}><StreetHedges tod="night" frame={f} /></Layer></TiltLayer>
      </Camera>
      <AbsoluteFill style={{ transform: `scale(${hold})`, transformOrigin: "960px 420px" }}>
        <Svg><g opacity={prog(f, hear + 60, hear + 150, ease.inOut)}><Stars seed="closesky" frame={f} n={70} ox={-60 * holdT} oy={-40 * holdT} h={860} maxR={2.6} color={C.lilac} /></g></Svg>
        <g style={{ opacity: prog(f, hear + 70, hear + 130, ease.inOut) }}><Nebula frame={f * 4} tint={C.magenta} tint2={C.violet} /></g>
        <HubbleField f={f} at={hear + 84} fps={fps} />
        <LiftRings f={f} at={hear + 6} fps={fps} spread={1 + 0.22 * holdT} />
        {/* the drop, as a picture: a soft red ring-wave pulses out from behind the tag every 40 frames */}
        <Svg>{[0, 1, 2, 3, 4].map((k) => { const b = last + 24 + k * 40, a = f - b; if (a < 0 || a > 70) return null; return <ellipse key={k} cx={960} cy={664} rx={120 + a * 9} ry={(120 + a * 9) * 0.32} fill="none" stroke={C.red} strokeWidth={3} opacity={0.4 * (1 - a / 70)} />; })}</Svg>
        {f > last + 40 && <Svg><path d={`M${shootX},${shootY} l-140,46`} stroke={alpha(C.white, 0.7 * shootO)} strokeWidth={3} strokeLinecap="round" /></Svg>}
      </AbsoluteFill>
      <Dust seed="close5d" frame={f} n={16} color={C.lilac} opacity={0.3} size={[2, 5]} speed={0.4} />
      {tagP > 0.01 && (
        <div style={{ position: "absolute", left: 0, width: 1920, top: 640 - 16 * tagP, textAlign: "center", opacity: Math.min(1, tagP * 1.3) }}>
          <span style={{ fontFamily: F.display, fontWeight: 600, fontSize: 40, letterSpacing: `${0.22 + 0.06 * tagP}em`, color: C.sunLt, textShadow: `0 0 24px ${alpha(C.sun, 0.6)}` }}>LISTEN FOR THE DROP</span>
        </div>
      )}
      <Finish tint={C.violet} grade={0.14} vig={0.34} />
      {f < start + 20 && <Svg><circle cx={IRIS.x} cy={IRIS.y} r={iris} fill="none" stroke={C.red} strokeWidth={10} opacity={1 - prog(f, start + 8, start + 20)} style={{ filter: `drop-shadow(0 0 16px ${C.red})` }} /></Svg>}
    </AbsoluteFill>
  );
};

export const CH5: SceneReg[] = [{ ids: ["s5_street", "s5_sky"], C: CloseScene }];
