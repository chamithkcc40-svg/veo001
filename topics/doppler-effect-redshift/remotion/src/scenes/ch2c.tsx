// ch2c.tsx - Chapter 2 "Ripples", final beats (f2177-2387): s2_twist (page-curl sting with the spiral
// icon, used exactly twice in the film per 07) and s2_paper (title-page CU -> tilt up to Doppler at the
// window -> push through the window into the blue/red double stars). All frames GLOBAL.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { Study } from "../kit/env/Study";
import { Rig } from "../kit/rig/Rig";
import { DOPPLER } from "../kit/rig/characters";
import { POSE, scribble, track } from "../kit/rig/poses";
import { Candle, Quill, SpiralIcon } from "../kit/props/Props";
import { CurlReveal } from "./ch2";
import { SceneProps, SceneReg } from "../chapters/types";

// ------------------------------------------------------------------ s2_twist (sting)
// The curl peels the observers shot away (fwip sfx at 2174). A spiral winds in with anticipation
// (counter-turn), overshoots, then keeps a slow spin; concentric "ripple" rings breathe out of it
// and sparks orbit (secondary motion). Music is out here, so the picture carries the beat.
const TW_CURL = 16;
export const TwistCard: React.FC<{ f: number; at: number; uid: string }> = ({ f, at, uid }) => {
  const { fps } = useVideoConfig();
  const t = f - at;
  const wind = sp(f, at + 4, fps, spr.bouncy); // spiral pop (overshoot + settle)
  const pre = prog(f, at, at + 5, ease.out) * (1 - prog(f, at + 5, at + 10, ease.inOut)); // anticipation
  const rot = -40 * pre + wind * 360 + t * 3; // counter-turn, wind-in, then slow drift
  const scale = 0.2 + 0.8 * wind;
  const cx = 960, cy = 470;
  const bg = { top: C.violet, mid: C.purple, low: C.magenta };
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <radialGradient id={`${uid}-bg`} cx="0.5" cy="0.44" r="0.8">
            <stop offset="0" stopColor={bg.mid} />
            <stop offset="0.55" stopColor={bg.top} />
            <stop offset="1" stopColor={C.night} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill={`url(#${uid}-bg)`} />
        {/* paper fibres: the sting is a page, so it gets a faint ruled texture */}
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={i} x={0} y={70 + i * 64} width={1920} height={2} fill={alpha(C.lilac, 0.05)} />
        ))}
        <rect x={210} y={0} width={3} height={1080} fill={alpha(C.pink, 0.12)} />
      </Svg>
      <Svg>
        {/* ripple rings breathe out of the spiral every 9 frames (chapter motif) */}
        {Array.from({ length: 6 }).map((_, k) => {
          const born = at + 8 + k * 9;
          const age = f - born;
          if (age < 0) return null;
          const r = 90 + age * 9;
          const o = clamp(1 - age / 42) * 0.55;
          return <circle key={k} cx={cx} cy={cy} r={r} fill="none" stroke={k % 2 ? C.pink : C.sunLt} strokeWidth={5} opacity={o} />;
        })}
        <GlowDot id={`${uid}-g`} cx={cx} cy={cy} r={260 * scale} color={C.sun} o={0.45 * wind} />
        <g transform={`translate(${cx},${cy}) scale(${scale})`}>
          <g transform="translate(8,12)" opacity={0.35}><SpiralIcon r={120} color={C.night} rot={rot} /></g>
          <SpiralIcon r={120} color={C.sun} rot={rot} />
          <g opacity={0.55}><SpiralIcon r={120} color={C.sunLt} rot={rot - 6} /></g>
        </g>
        {/* orbiting sparks: overlapping action, each on its own phase and radius */}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = rr(`${uid}sa${i}`, 0, 6.28) + t * (0.05 + 0.02 * (i % 3));
          const R = (170 + i * 22) * wind;
          const s = sp(f, at + 8 + i * 2, fps, spr.snappy);
          return <circle key={i} cx={cx + Math.cos(a) * R} cy={cy + Math.sin(a) * R * 0.8} r={(4 + (i % 3) * 2) * s} fill={i % 2 ? C.lilac : C.sunLt} opacity={0.85} />;
        })}
      </Svg>
      <Dust seed={`${uid}d`} frame={f} n={30} color={C.lilac} opacity={0.35} />
      <Finish tint={C.magenta} grade={0.1} vig={0.34} />
    </AbsoluteFill>
  );
};

export const Twist: React.FC<SceneProps> = ({ f, start }) => {
  const curlAt = start - 4; // curl lands on the fwip (sfx 2174)
  const p = prog(f, curlAt, curlAt + TW_CURL, ease.inOut);
  return <CurlReveal p={p} uid="tw1" flap={C.lilac}><TwistCard f={f} at={curlAt} uid="tw1c" /></CurlReveal>;
};

// ------------------------------------------------------------------ s2_paper
// A  2237-2318  title-page CU (curl-out from the bottom-left), slow pull-back; on "sound." grey sound
//               rings drift over the page and dissolve; on "He named it" the words "coloured light"
//               warm up with a blue->red shimmer sweep (shimmer sfx 2301).
// B  2318-2340  whip-tilt up (page slides down, study slides in from the top, vertical blur).
// C  2338-2387  Doppler looks up; the double stars brighten on "colored"; push through the window
//               on "light of stars", landing on the glass shimmer (2388) -> Ch3 opens in the stars.
const PAGE = { x: 960, y: 455, w: 1240, h: 780 };
const TitleText: React.FC<{ f: number; warm: number; sweep: number }> = ({ f, warm, sweep }) => {
  // "coloured light" gets a moving gradient (blue -> white -> red) whose stop position = sweep
  const ink = mix(C.night, C.plumDk, 0.4);
  const hot = warm > 0.01;
  const grad = `linear-gradient(90deg, ${C.blue} ${sweep * 100 - 40}%, ${C.core} ${sweep * 100}%, ${C.red} ${sweep * 100 + 40}%)`;
  return (
    <div style={{ position: "absolute", left: PAGE.x - PAGE.w / 2, top: PAGE.y - PAGE.h / 2 + 70, width: PAGE.w, textAlign: "center", color: ink, fontFamily: F.period }}>
      <div style={{ fontSize: 30, letterSpacing: "0.28em", opacity: 0.75 }}>PRAGUE &nbsp;·&nbsp; 1842</div>
      <div style={{ width: 360, height: 3, margin: "22px auto 26px", background: alpha(ink, 0.5) }} />
      <div style={{ fontSize: 88, fontStyle: "italic", lineHeight: 1.1 }}>
        On the{" "}
        <span style={{ position: "relative", display: "inline-block" }}>
          <span style={{ opacity: 1 - warm * 0.999 }}>coloured light</span>
          {hot && (
            <span style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", opacity: warm, backgroundImage: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 ${10 * warm}px ${alpha(C.sun, 0.6)})` }}>coloured light</span>
          )}
        </span>
      </div>
      <div style={{ fontSize: 88, fontStyle: "italic", lineHeight: 1.15 }}>of the double stars...</div>
      <div style={{ fontSize: 34, marginTop: 30, opacity: 0.8 }}>by Christian Doppler</div>
    </div>
  );
};

/** Shot A: the manuscript title page on the desk, candle-lit from screen right. */
const PaperPage: React.FC<{ f: number; start: number }> = ({ f, start }) => {
  const { fps } = useVideoConfig();
  const sound = cue("didnt"); // 2237
  const named = cue("heNamed"); // 2301
  // grey sound rings (the expected answer) spread over the page on "after sound." then dissolve
  const soundOn = prog(f, sound + 30, sound + 40, ease.out) * (1 - prog(f, named - 6, named + 6, ease.in));
  const warm = prog(f, named, named + 14, ease.out);
  const sweep = tw(f, [named, named + 40], [-0.3, 1.3], ease.inOutSine);
  const fl = 0.9 + 0.1 * noise1("pcandle", f / 4);
  // quill hand: Doppler's hand rests at the page edge, lifts on "sound." (beat), lowers on "He named"
  const lift = prog(f, sound + 36, sound + 48, ease.out) * (1 - prog(f, named + 4, named + 18, ease.inOut));
  const handX = 1500 + Math.sin(f / 23) * 6, handY = 900 - lift * 70 + Math.sin(f / 17) * 3;
  const blot = sp(f, start + 6, fps, spr.snappy);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="ppDesk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={mix(C.plum, C.night, 0.2)} />
            <stop offset="1" stopColor={mix(C.plum, C.sun, 0.25)} />
          </linearGradient>
          <linearGradient id="ppPaper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={mix(C.dough, C.white, 0.15)} />
            <stop offset="0.7" stopColor={C.dough} />
            <stop offset="1" stopColor={mix(C.dough, C.sepia, 0.45)} />
          </linearGradient>
          <radialGradient id="ppPool" cx={1700} cy={300} r={1500} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.sun} stopOpacity={0.35 * fl} />
            <stop offset="1" stopColor={C.sun} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={-200} y={-200} width={2320} height={1480} fill="url(#ppDesk)" />
        {/* wood grain */}
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M-200,${i * 95 + 20} C400,${i * 95 + rr("pg" + i, -30, 30)} 1200,${i * 95 + rr("pg2" + i, 10, 60)} 2120,${i * 95 + 10}`} stroke={alpha(C.night, 0.12)} strokeWidth={4} fill="none" />
        ))}
        {/* under-sheet + page with soft contact shadow */}
        <rect x={PAGE.x - PAGE.w / 2 + 30} y={PAGE.y - PAGE.h / 2 + 26} width={PAGE.w} height={PAGE.h} rx={14} fill={alpha(C.night, 0.35)} style={{ filter: "blur(18px)" }} />
        <rect x={PAGE.x - PAGE.w / 2 - 40} y={PAGE.y - PAGE.h / 2 + 30} width={PAGE.w} height={PAGE.h} rx={10} fill={mix(C.dough, C.sepia, 0.35)} transform={`rotate(-2.5,${PAGE.x},${PAGE.y})`} />
        <rect x={PAGE.x - PAGE.w / 2} y={PAGE.y - PAGE.h / 2} width={PAGE.w} height={PAGE.h} rx={10} fill="url(#ppPaper)" />
        <rect x={PAGE.x - PAGE.w / 2 + 40} y={PAGE.y - PAGE.h / 2 + 40} width={PAGE.w - 80} height={PAGE.h - 80} rx={6} fill="none" stroke={alpha(C.plumDk, 0.35)} strokeWidth={3} />
        {/* ink blot appears as the quill touches (secondary detail) */}
        <ellipse cx={PAGE.x + 470} cy={PAGE.y + 300} rx={14 * blot} ry={9 * blot} fill={alpha(C.night, 0.55)} />
      </Svg>
      <TitleText f={f} warm={warm} sweep={sweep} />
      <Svg>
        {/* the "sound" guess: grey rings ripple across the page, then fade as the true title warms */}
        {soundOn > 0.01 && Array.from({ length: 5 }).map((_, k) => {
          const age = (f - sound - 30 - k * 7);
          if (age < 0) return null;
          return <circle key={k} cx={PAGE.x - 380} cy={PAGE.y + 40} r={40 + age * 7} fill="none" stroke={alpha(C.plumDk, 0.4)} strokeWidth={4} opacity={soundOn * clamp(1 - age / 70)} />;
        })}
        {/* Doppler's hand + quill (same costume colours as the rig: sleeve, cuff, skin) */}
        <g transform={`translate(${handX},${handY}) rotate(${-18 + lift * 8})`}>
          <rect x={-60} y={10} width={260} height={130} rx={60} fill={DOPPLER.costume.sleeve} />
          <rect x={-70} y={4} width={46} height={140} rx={22} fill={mix(C.white, C.dough, 0.4)} />
          <ellipse cx={-92} cy={70} rx={58} ry={50} fill={DOPPLER.costume.skin} />
          <ellipse cx={-126} cy={46} rx={22} ry={30} fill={DOPPLER.costume.skinSh} />
          <g transform="translate(-130,40)"><Quill scale={1.5} /></g>
        </g>
        {/* candle pool + candle edge in the top-right, out of focus */}
        <rect x={-200} y={-200} width={2320} height={1480} fill="url(#ppPool)" style={{ mixBlendMode: "screen" }} />
        <g transform="translate(1800,260) scale(2.4)" style={{ filter: "blur(10px)" }} opacity={0.9}><Candle frame={f} /></g>
      </Svg>
      <Dust seed="ppdust" frame={f} n={26} area={[900, 0, 1020, 800]} color={C.sunLt} size={[1.5, 3.5]} speed={0.5} opacity={0.55} />
    </AbsoluteFill>
  );
};
