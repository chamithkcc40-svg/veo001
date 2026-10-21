// ch3.tsx - Chapter 3 "Light Has a Siren Too", Light Lab sequence (f2387-2797), one continuous shot:
// s3_lab (arrive from the s2_paper star field, neon chapter card, wavy light rings, spacing->colour wave),
// s3_blue (star glides toward the viewer at screen right: front rings tighten BLUE),
// s3_galaxy (star blooms into the Glowing Galaxy, recedes: glow BLUE -> cream -> RED, REDSHIFT forms
// from converging red rings). All frames GLOBAL; cue frames from data/video.json.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rnd, rr, shiftColor, sp, tw } from "../util";
import { cue } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { LabBg } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Rings } from "../kit/info/Rings";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { RAINBOW } from "../kit/info/Barcode";
import { SceneProps, SceneReg } from "../chapters/types";

// ------------------------------------------------------------------ neon-tube chapter card
// Tubes flicker on letter by letter (seeded), with an unlit-glass underlay so the sign exists before it
// lights (entrance has a reason: the neon buzz sfx at 2393). Exit: power-down flicker + rise.
export const NeonCard: React.FC<{ f: number; at: number; out: number; num: string; text: string; y?: number; color?: string }> = ({ f, at, out, num, text, y = 190, color = C.pink }) => {
  const { fps } = useVideoConfig();
  const full = `${num} · ${text}`;
  const e = prog(f, out - 8, out, ease.in);
  if (f < at - 6 || e >= 1) return null;
  const hang = sp(f, at - 6, fps, spr.smooth); // sign drops on its wires first
  const swing = Math.sin((f - at) / 7) * 2.5 * Math.exp(-Math.max(0, f - at) / 30);
  return (
    <div style={{ position: "absolute", left: 0, width: 1920, top: y - 70 - (1 - hang) * 160 - e * 40, textAlign: "center", transform: `rotate(${swing}deg)`, transformOrigin: "960px -200px", opacity: 1 - e * 0.3 }}>
      {/* hanging wires */}
      <div style={{ position: "absolute", left: 960 - 520, top: -400, width: 3, height: 400, background: alpha(C.lilac, 0.25) }} />
      <div style={{ position: "absolute", left: 960 + 520, top: -400, width: 3, height: 400, background: alpha(C.lilac, 0.25) }} />
      <div style={{ display: "inline-block", padding: "18px 46px", borderRadius: 26, background: alpha(C.night, 0.55), boxShadow: `inset 0 0 0 3px ${alpha(C.lilac, 0.12)}` }}>
        {full.split("").map((ch, i) => {
          // each tube strikes at its own seeded moment, with 1-2 flicker dropouts, then steady hum
          const strike = at + 2 + i * 1.2 + rr("neon" + i, 0, 5);
          const on = f >= strike ? 1 : 0;
          const drop = (f > strike + 2 && f < strike + 4 && rnd("nd" + i) > 0.5) || (e > 0 && rnd("ne" + i + Math.floor(f / 2)) > 1 - e) ? 0.15 : 1;
          const hum = 0.92 + 0.08 * noise1("nh" + i, f / 3);
          const lit = on * drop * hum;
          const isNum = i < num.length;
          const c = isNum ? C.sun : color;
          return (
            <span key={i} style={{
              display: "inline-block", fontFamily: F.display, fontWeight: 500, fontSize: 70, letterSpacing: "0.08em", whiteSpace: "pre",
              color: lit > 0.5 ? mix(c, C.white, 0.55) : alpha(C.lilac, 0.18),
              textShadow: lit > 0.5 ? `0 0 8px ${alpha(c, 0.95 * lit)}, 0 0 26px ${alpha(c, 0.8 * lit)}, 0 0 60px ${alpha(c, 0.5 * lit)}` : "none",
            }}>{ch === " " ? "\u00A0" : ch}</span>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ spacing -> colour helpers
/** colour along the rainbow strip, u 0 (violet) .. 1 (red) */
export const rainbowAt = (u: number) => {
  const x = clamp(u) * (RAINBOW.length - 1);
  const i = Math.min(RAINBOW.length - 2, Math.floor(x));
  return mix(RAINBOW[i], RAINBOW[i + 1], x - i);
};
const LAM_MIN = 46, LAM_MAX = 150; // px wavelength drawn for violet .. red
export const lamToU = (lam: number) => clamp((lam - LAM_MIN) / (LAM_MAX - LAM_MIN));

/** a travelling wave line between x0..x1 whose wavelength = lam and colour follows it */
export const WaveLine: React.FC<{ f: number; x0: number; x1: number; y: number; lam: number; amp?: number; w?: number; o?: number; reveal?: number }> = ({ f, x0, x1, y, lam, amp = 34, w = 8, o = 1, reveal = 1 }) => {
  const col = rainbowAt(lamToU(lam));
  const xe = x0 + (x1 - x0) * reveal;
  let d = "";
  const phase = f * 0.32; // waves travel to the right (light moving)
  for (let x = x0; x <= xe; x += 4) {
    const env = Math.min(1, (x - x0) / 60, (x1 - x) / 60); // soft ends
    const yy = y + Math.sin(((x - x0) / lam) * Math.PI * 2 - phase) * amp * Math.max(0, env);
    d += `${x === x0 ? "M" : "L"}${x},${yy}`;
  }
  return (
    <g opacity={o}>
      <path d={d} stroke={col} strokeWidth={w * 2.6} fill="none" strokeLinecap="round" opacity={0.25} style={{ filter: "blur(8px)" }} />
      <path d={d} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke={alpha(C.white, 0.55)} strokeWidth={w * 0.3} fill="none" strokeLinecap="round" transform="translate(0,-2)" />
    </g>
  );
};

// ------------------------------------------------------------------ the test star's motion (one clock)
// v(t): still -> right toward the viewer (+2.4 px/f) -> reverses on the sweep sfx (2680) -> left (-2.4).
// Ring speed LAB_C = 5, so v/c <= 0.48 (no shock cone; Rings asserts it).
const LAB_C = 5;
const STAR0 = { x: 960, y: 470 };
const smooth = (t: number, a: number, b: number) => { const u = clamp((t - a) / (b - a)); return u * u * (3 - 2 * u); };
const starV = (t: number) => 2.4 * smooth(t, cue("squeezeWaves") + 6, cue("squeezeWaves") + 26) - 4.8 * smooth(t, cue("stretchThem") - 8, cue("stretchThem") + 12);
const X_CACHE = new Map<number, number>();
export const starX = (t: number) => {
  const k = Math.round(t * 4) / 4;
  const hit = X_CACHE.get(k);
  if (hit !== undefined) return hit;
  let x = STAR0.x;
  for (let s = cue("squeezeWaves"); s < k; s += 0.5) x += starV(s) * 0.5;
  X_CACHE.set(k, x);
  return x;
};
const starPath = (t: number) => ({ x: starX(t), y: STAR0.y });

/** the test star: a white point with 4-point glint, hot core; squash-stretches along its motion */
const TestStar: React.FC<{ x: number; y: number; f: number; v: number; s?: number; tint?: string }> = ({ x, y, f, v, s = 1, tint = C.white }) => {
  const tw2 = 0.9 + 0.1 * Math.sin(f / 4);
  const st = 1 + Math.min(0.25, Math.abs(v) * 0.08); // stretch with speed (follow-through feel)
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <GlowDot id="tsg" cx={0} cy={0} r={110 * tw2} color={tint} o={0.55} />
      <g transform={`scale(${st},${1 / st})`}>
        <path d="M-62,0 Q0,-7 62,0 Q0,7 -62,0 Z M0,-62 Q7,0 0,62 Q-7,0 0,-62 Z" fill={mix(tint, C.white, 0.6)} opacity={0.9 * tw2} />
        <circle r={20} fill={mix(tint, C.white, 0.7)} />
        <circle r={10} fill={C.white} />
      </g>
    </g>
  );
};

/** legend marker riding the rainbow strip (top of the lab) */
const StripMarker: React.FC<{ u: number; o: number; label?: string; color?: string; y?: number }> = ({ u, o, label, color, y = 160 }) => {
  const x = 360 + 1200 * clamp(u);
  const c = color ?? rainbowAt(u);
  return (
    <g opacity={o} transform={`translate(${x},${y})`}>
      <path d="M0,-50 L16,-72 L-16,-72 Z" fill={C.white} />
      <circle cy={-13} r={22} fill={c} stroke={C.white} strokeWidth={5} />
      {label && <text y={58} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={34} fill={c} letterSpacing="0.1em" style={{ filter: `drop-shadow(0 0 10px ${alpha(c, 0.8)})` }}>{label}</text>}
    </g>
  );
};

/** the viewer at screen right: a friendly eye glyph that blinks and widens as the star approaches */
const ViewerEye: React.FC<{ f: number; x: number; y: number; o: number; wide: number }> = ({ f, x, y, o, wide }) => {
  const bl = (f % 70) < 4 ? 0.15 : 1; // deterministic blink every 70 frames
  const h = 34 * bl * (1 + 0.25 * wide);
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      <ellipse rx={92} ry={70} fill={alpha(C.night, 0.5)} />
      <path d={`M-62,0 Q0,${-h * 1.6} 62,0 Q0,${h * 1.6} -62,0 Z`} fill={C.white} />
      {bl > 0.5 && <circle cx={-6 - 6 * wide} r={22} fill={C.violet} />}
      {bl > 0.5 && <circle cx={-12 - 6 * wide} cy={-7} r={7} fill={C.white} />}
      <text y={112} textAnchor="middle" fontFamily={F.display} fontWeight={600} fontSize={28} fill={alpha(C.lilac, 0.85)} letterSpacing="0.12em">YOU</text>
    </g>
  );
};

// ------------------------------------------------------------------ LabSeq: s3_lab + s3_blue + s3_galaxy
export const LabSeq: React.FC<SceneProps> = ({ f, start, end }) => {
  const { fps } = useVideoConfig();
  const sq = cue("squeezeWaves"), blueAt = cue("blue"), st = cue("stretchThem"), redAt = cue("red1"), rs = cue("redshift");
  // arrival: the s2 double stars converge into one white test star while space dissolves into the lab
  const arrive = prog(f, start, start + 26, ease.inOut);
  const sx = starX(f);
  const v = starV(f);
  // bloom: star -> Glowing Galaxy (starts just after "red", reaches full on "That's a")
  const bloomAt = redAt + 6;
  const bloom = prog(f, bloomAt, bloomAt + 22, ease.inOut);
  const galShift = tw(f, [bloomAt, bloomAt + 12, rs - 4, rs + 18], [-1, -1, 0, 1], ease.inOutSine);
  const galScale = tw(f, [bloomAt, rs + 30], [1, 0.9], ease.inOutSine);
  // spacing -> colour demo wave (s3_lab second half): wavelength sweeps red -> violet -> green
  const sc = cue("spacingColor");
  const lam = tw(f, [sc, sc + 26, sc + 52, sq - 4], [150, 150, 50, 98], ease.inOutSine);
  const waveIn = prog(f, sc - 10, sc + 8, ease.out) * (1 - prog(f, sq + 4, sq + 14, ease.in));
  // marker on the rainbow strip: follows the demo wave, then the star colour (blue/red)
  const mU = f < sq + 10 ? lamToU(lam) : f < st ? tw(f, [blueAt - 8, blueAt + 6], [0.45, 0.14], ease.out) : tw(f, [redAt - 8, redAt + 6], [0.14, 0.98], ease.out);
  const mO = prog(f, sc - 6, sc + 6, ease.out) * (1 - prog(f, bloomAt + 6, bloomAt + 14, ease.in));
  const mLabel = f >= redAt - 2 ? "RED" : f >= blueAt - 2 && f >= sq ? "BLUE" : undefined;
  const cardOut = sc - 12;
  const stripO = prog(f, cardOut - 4, cardOut + 14, ease.out);
  const eyeO = prog(f, sq + 2, sq + 14, ease.out) * (1 - prog(f, st + 4, st + 14, ease.in));
  const eyeWide = clamp((sx - 960) / 200);
  // ring emission: white while still; tinted by the Rings engine once the star moves
  const ringStop = bloomAt + 4;
  const ringO = 1 - 0.65 * waveIn;
  // galaxy sits where the star was, glides to centre as it blooms
  const gx = mix2(sx, 960, bloom), gy = mix2(STAR0.y, 430, bloom);
  // camera: drift (lab) -> track the star (blue/red) -> push on bloom -> pull on "redshift"
  const track2 = prog(f, sq, sq + 20, ease.inOut) * (1 - bloom);
  const camX = tw(f, [start, sq], [-30, 20], ease.inOutSine) * (1 - track2) + (sx - 960) * 0.45 * track2;
  const zoom = 1 + 0.03 * prog(f, start, sq, ease.inOutSine) + 0.12 * prog(f, bloomAt - 4, bloomAt + 18, ease.inOut) - 0.14 * prog(f, rs - 6, rs + 24, ease.inOut);
  const cam = { x: camX, y: noise1("labcy", f / 40) * 6, zoom, rot: 0, frame: f };
  // REDSHIFT: 7 red rings collapse onto letter slots, each letter pops as its ring lands
  const word = "REDSHIFT";
  const wordY = 800;
  const landAt = (i: number) => rs + 4 + i * 2;
  const wordOut = prog(f, end - 8, end + 4, ease.in);
  const dsX = (1 - arrive) * 70; // the double stars converge to the test star
  return (
    <AbsoluteFill>
      <Camera cam={cam}>
        <Layer depth={0.3}><LabBg frame={f} strip={stripO} /></Layer>
        <AbsoluteFill style={{ opacity: 1 - arrive }}><Space frame={f} dust={false} /></AbsoluteFill>
        <Layer depth={0.3} blur={0}>
          <Svg>
            {stripO > 0.01 && <StripMarker u={mU} o={mO * stripO} label={mLabel} y={160} />}
          </Svg>
        </Layer>
        <Layer depth={1}>
          <Svg>
            <Rings id="labr" frame={f} path={starPath} start={cue("lightWave") - 2} stop={ringStop} period={12} c={LAB_C} maxR={900} tint tintGain={2.2} width={5} wavy={7} opacity={ringO} />
            {waveIn > 0.01 && <WaveLine f={f} x0={300} x1={1620} y={760} lam={lam} reveal={prog(f, sc - 10, sc + 16, ease.out)} o={waveIn} />}
            {waveIn > 0.01 && (
              <text x={960} y={700} textAnchor="middle" fontFamily={F.display} fontWeight={600} fontSize={30} letterSpacing="0.14em" fill={alpha(C.lilac, 0.8 * waveIn)}>
                {lam > 120 ? "WIDE SPACING" : lam < 70 ? "TIGHT SPACING" : "SPACING"}
              </text>
            )}
            {bloom < 1 && (
              <g opacity={1 - bloom}>
                {arrive < 1 && <GlowDot id="dsb" cx={sx - dsX} cy={STAR0.y - dsX * 0.4} r={120} color={C.blue} o={0.6 * (1 - arrive)} />}
                {arrive < 1 && <GlowDot id="dsr" cx={sx + dsX} cy={STAR0.y + dsX * 0.6} r={120} color={C.red} o={0.6 * (1 - arrive)} />}
                <TestStar x={sx} y={STAR0.y} f={f} v={v} s={(0.4 + 0.6 * arrive) * (1 + bloom * 0.8)} />
              </g>
            )}
            {bloom > 0 && (
              <g opacity={Math.min(1, bloom * 1.6)}>
                <Galaxy id="labgal" x={gx} y={gy} r={190 * galScale * (0.5 + 0.5 * bloom)} frame={f} shift={galShift} tilt={0.3} rot={-20} glow={1.15} dots={80} />
              </g>
            )}
            <ViewerEye f={f} x={1730} y={STAR0.y} o={eyeO} wide={eyeWide} />
          </Svg>
        </Layer>
