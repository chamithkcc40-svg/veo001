// ch4.tsx - Chapter 4 "The Running Universe", first beats (f3830-4234). All frames GLOBAL.
// s4_dome   low WS inside the big dome: shutter grinds open (rumble 3831), Hubble walks into the pool of
//           starlight and looks up; spreading-letter chapter card; name tag. Camera tilts up.
// s4_plate  INS light table: a negative glass plate of Andromeda; one star blinks bright-dim-bright on
//           the three blips (3909/3927/3945), a loupe slides over it, Hubble's hand circles it. 1923.
// s4_scale  the negative plate INVERTS into real space (match on the Andromeda smudge); the smudge
//           resolves into a whole spiral, then the camera pulls wide and the gap to the Milky Way grows.
// s4_tapes  lateral track along a row of galaxies; three tape measures zip out (zips 4120/4135/4150).
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, syncList, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { DomeInterior } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { LetterTitle, NameTag, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { HUBBLE } from "../kit/rig/characters";
import { POSE, track, walk, merge } from "../kit/rig/poses";
import { Hand } from "../kit/rig/Hand";
import { Magnifier } from "../kit/props/Props";
import { SceneProps, SceneReg } from "../chapters/types";

/** start frame of the first spoken word matching `text` at or after global frame `after` */
const word = (text: string, after: number): number => {
  const w = V.words.find((x) => x.s >= after && x.text.toLowerCase().replace(/[^a-z0-9]/g, "") === text);
  if (!w) throw new Error("missing word " + text);
  return w.s;
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ s4_dome (low WS, tilt up)
// Hard cut from the spiral map. 5 planes: dome wall + slit sky (0.3) · light shaft + motes (0.6) ·
// Hubble + floor pool (1) · near railing (1.45, blur). The shutter grinds open on the rumble (3831,
// heavy spring with a small overshoot + shake), the telescope slews, Hubble walks into the pool of
// light on "Enter" and looks up on "Hubble". Card letters spread apart as they arrive (07).
const HB = { x0: 430, x1: 800, y: 1010, s: 1.12 };
/** the starlight shaft from the slit to the floor, with drifting motes caught in it */
const Shaft: React.FC<{ f: number; o: number }> = ({ f, o }) => (
  <g opacity={o}>
    <path d="M880,-60 L1040,-60 L1150,1010 L640,1010 Z" fill={alpha(C.sunLt, 0.13)} style={{ filter: "blur(14px)" }} />
    <path d="M920,-60 L1000,-60 L1030,1010 L760,1010 Z" fill={alpha(C.white, 0.08)} style={{ filter: "blur(8px)" }} />
    <ellipse cx={895} cy={1012} rx={300} ry={46} fill={alpha(C.sunLt, 0.3)} style={{ filter: "blur(10px)" }} />
    <Dust seed="shaftmotes" frame={f} n={26} area={[700, 0, 420, 1000]} size={[1.5, 3.5]} color={C.sunLt} opacity={0.7} speed={0.5} />
  </g>
);
