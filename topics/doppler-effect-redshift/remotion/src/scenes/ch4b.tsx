// ch4b.tsx - Chapter 4, middle beats (f4234-4693). All frames GLOBAL.
// s4_chart  Chart Room (chalk wipe in, card_slide 4234): HUBBLE: DISTANCES and SLIPHER: SPEEDS cards slide
//           together, then dock as the two axis labels; 24 dots tap on (sync.chalkTaps); the rising line
//           draws on "pattern" (chalk_line 4395); Hubble steps back; punch-in on "farther"; on "faster"
//           each dot becomes a tiny galaxy with a red arrow whose length grows with distance.
// s4_grid   expansion sheet: 5x3 grid of galaxies scales evenly (stretch 4552); gold ring on one galaxy,
//           its arrows all point away; then a second galaxy, same result.
// s4_peak   scale-through + fast pull back through a galaxy field, red with distance; gold title.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, ease, F, spr } from "../theme";
import { alpha, clamp, mix, noise1, prog, rr, sp, tw } from "../util";
import { cue, syncList, V } from "../data";
import { Camera, Layer, Svg } from "../kit/camera";
import { Dust, Finish, GlowDot, Stars } from "../kit/fx";
import { ChartRoom } from "../kit/env/Interiors";
import { Space } from "../kit/env/Space";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { LetterTitle, Pill, Timeline } from "../kit/info/Labels";
import { Rig } from "../kit/rig/Rig";
import { HUBBLE } from "../kit/rig/characters";
import { POSE, track, walk, merge } from "../kit/rig/poses";
import { SceneProps, SceneReg } from "../chapters/types";
