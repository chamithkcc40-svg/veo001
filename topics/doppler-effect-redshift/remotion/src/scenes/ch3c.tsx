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
