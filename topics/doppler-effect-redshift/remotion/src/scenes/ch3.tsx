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
