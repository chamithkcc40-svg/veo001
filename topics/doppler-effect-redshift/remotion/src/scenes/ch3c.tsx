// ch3c.tsx - Chapter 3, second half (f3126-3830). All frames GLOBAL; cue frames from data/video.json.
// s3_barcode   INS Light Lab: starlight fans into the rainbow strip, 4 dark lines drop in, atoms tether
//              to them, a ghost LAB copy lifts off, the star's lines slide toward red (slide sfx 3231),
//              the offset is measured, a tiny galaxy drifts away beside it.
// s3_dome      WS night pine hill, barcode-wipe in, crane-in to the opening slit; 1912-1914 tags.
// s3_slipher   MS dome interior (red lamp): Slipher leaves the eyepiece, lifts a glass plate (clink 3469).
// s3_andromeda + s3_map  one continuous shot: the plate grows into the sky, Andromeda glides toward us
//              (lines slide BLUE, 0 -> ~300 km/s counter), then a pull back reveals ~15 spirals, nearly
//              all RED drifting outward; Pip, puzzled, in the corner on "Why".
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { LabBg, DomeInterior, NightSky, PineHill, Pines } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Barcode, LAB_LINES } from "../kit/info/Barcode";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { NameTag, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { PIP, SLIPHER } from "../kit/rig/characters";
import { POSE, track, sway, merge } from "../kit/rig/poses";
import { GlassPlate } from "../kit/props/Props";
import { SceneProps, SceneReg } from "../chapters/types";

// ------------------------------------------------------------------ s3_barcode (INS, slow push)
// Layout (subject plane): source star far left -> prism -> fan of light -> STAR strip (lower). The
// ghost LAB copy lifts off the STAR strip on "If" and parks above it, carrying the atoms with it (the
// atoms set where the lines belong). Then the STAR lines slide toward red; the offset is measured.
const BC = { x: 600, y: 610, w: 1000, h: 104 }; // STAR (observed) strip
const LABY = 330; // parked LAB strip y
const PRISM = { x: 420, y: BC.y + BC.h / 2 }; // light enters the strip from its violet end
const SHIFT = 0.075; // strip-fraction slide toward red (exaggerated for legibility)
const lineX = (l: number, s = 0) => BC.x + (l + s) * BC.w;

/** a tiny atom glyph: nucleus + two tilted orbits with an electron each (orbits spin) */
const Atom: React.FC<{ x: number; y: number; f: number; s: number; i: number; color?: string }> = ({ x, y, f, s, i, color = C.mint }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={30} fill={alpha(color, 0.12)} />
    {[0, 60, 120].map((a, k) => (
      <g key={k} transform={`rotate(${a + i * 17})`}>
        <ellipse rx={26} ry={9} fill="none" stroke={alpha(color, 0.75)} strokeWidth={2.5} />
        <circle cx={26 * Math.cos(f / 5 + k * 2 + i)} cy={9 * Math.sin(f / 5 + k * 2 + i)} r={3.5} fill={C.white} />
      </g>
    ))}
    <circle r={7} fill={color} />
    <circle r={3} cx={-2} cy={-2} fill={C.white} opacity={0.8} />
  </g>
);

/** source star + white beam + glass prism + narrow rainbow fan entering the strip's violet end */
const PrismFeed: React.FC<{ f: number; beam: number; fan: number; o: number }> = ({ f, beam, fan, o }) => {
  const sx = 120, sy = PRISM.y - 40;
  const bx = sx + (PRISM.x - 30 - sx) * beam;
  const by = sy + (PRISM.y - sy) * beam;
  const tw2 = 0.85 + 0.15 * Math.sin(f / 4);
  return (
    <g opacity={o}>
      <defs>
        <linearGradient id="bcFan" x1="0" x2="0" y1="0" y2="1">
          {["#6A2BD8", "#3D5BFF", "#29D39A", "#FFD23D", "#FF3D5A"].map((c, i) => <stop key={i} offset={i / 4} stopColor={c} />)}
        </linearGradient>
      </defs>
      <GlowDot id="bcsrc" cx={sx} cy={sy} r={90 * tw2} color={C.core} o={0.8} />
      <circle cx={sx} cy={sy} r={12} fill={C.white} />
      {beam > 0 && <path d={`M${sx},${sy} L${bx},${by}`} stroke={C.white} strokeWidth={6} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${alpha(C.white, 0.9)})` }} />}
      {fan > 0 && <path d={`M${PRISM.x + 20},${PRISM.y} L${PRISM.x + 20 + (BC.x - PRISM.x - 20) * fan},${PRISM.y - (BC.h / 2) * fan} L${PRISM.x + 20 + (BC.x - PRISM.x - 20) * fan},${PRISM.y + (BC.h / 2) * fan} Z`} fill="url(#bcFan)" opacity={0.85} />}
      {/* prism: cel-shaded glass triangle with rim light */}
      <g transform={`translate(${PRISM.x},${PRISM.y}) rotate(${Math.sin(f / 30) * 2})`}>
        <path d="M0,-70 L62,46 L-62,46 Z" fill={alpha(C.peri, 0.45)} />
        <path d="M0,-70 L0,46 L-62,46 Z" fill={alpha(C.white, 0.14)} />
        <path d="M0,-70 L62,46" stroke={alpha(C.white, 0.85)} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};
