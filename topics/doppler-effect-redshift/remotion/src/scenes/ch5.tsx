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
import { Ambulance, AMB_SIREN } from "../kit/props/Props";
import { Rig } from "../kit/rig/Rig";
import { PIP } from "../kit/rig/characters";
import { POSE, track } from "../kit/rig/poses";
import { SceneProps, SceneReg } from "../chapters/types";

const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;
const AMB_S = 0.72, AMB_Y = 836, AMB_V = 15; // softer, slower pass than the cold open (< ring speed)
const PIP_X = 1240; // Pip on the right this time (mirror of the cold open staging)
const RING_C = 24, RING_P = 7;
const ambX = (t: number) => PIP_X + (t - sync("closePass")) * AMB_V; // drives left -> right
const sirenAt = (t: number) => ({ x: ambX(t) - AMB_SIREN.x * AMB_S, y: AMB_Y + AMB_SIREN.y * AMB_S }); // facing +1 mirrors x
