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
