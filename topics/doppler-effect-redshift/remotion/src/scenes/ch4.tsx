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
