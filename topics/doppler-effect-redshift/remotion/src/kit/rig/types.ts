// Shared rig types. One rig system for every human character (STYLE_BIBLE 6).
import React from "react";

export type Expression =
  | "neutral" | "happy" | "joy" | "surprised" | "ooo" | "curious" | "puzzled"
  | "sheepish" | "focused" | "sad" | "proud" | "wince";

export type Limb = { a: number; b: number }; // a = shoulder/hip angle (deg, 0 = down, + = toward the character's front/right of screen), b = elbow/knee bend (deg)

export type Pose = {
  armL: Limb; // screen-left arm
  armR: Limb; // screen-right arm
  legL: Limb;
  legR: Limb;
  lean: number; // torso lean deg (+ = right)
  headTilt: number; // deg
  lookX: number; // -1..1 pupil / face offset
  lookY: number; // -1..1
  turn: number; // -1..1 fake 3/4 head turn (shifts features)
  bodyY: number; // px vertical offset (bob / squash)
  squash: number; // 1 = none; <1 squash, >1 stretch
  handL: "open" | "fist" | "point" | "thumb" | "cup";
  handR: "open" | "fist" | "point" | "thumb" | "cup";
};

export const BASE_POSE: Pose = {
  armL: { a: -8, b: 8 }, armR: { a: 8, b: -8 },
  legL: { a: -3, b: 0 }, legR: { a: 3, b: 0 },
  lean: 0, headTilt: 0, lookX: 0, lookY: 0, turn: 0, bodyY: 0, squash: 1,
  handL: "open", handR: "open",
};

export type HairStyle = "pip" | "nell" | "doppler" | "slick" | "part" | "short" | "bald" | "bun";
export type Hat = "none" | "cap" | "tophat" | "bandcap";
export type Outfit = "hoodie" | "uniform" | "frock" | "vest" | "tweed" | "cassock" | "band" | "casual";
export type Neck = "none" | "headphones" | "cravat" | "tie" | "clerical" | "collar" | "bowtie";

export type Costume = {
  skin: string;
  skinSh: string;
  hair: string;
  hairStyle: HairStyle;
  hat: Hat;
  hatColor: string;
  outfit: Outfit;
  top: string; // torso main colour
  top2: string; // secondary (lapel, stripe, pocket)
  sleeve: string;
  legs: string;
  shoes: string;
  neck: Neck;
  neckColor: string;
  glasses: boolean;
  sideburns?: boolean;
  blushAmt: number;
};

export type Build = {
  headR: number; // head radius
  torsoW: number;
  torsoH: number;
  upperArm: number;
  foreArm: number;
  thigh: number;
  shin: number;
  limbW: number; // limb thickness
  legW: number;
  hunch: number; // deg extra forward neck angle
  earSize: number; // 1 = normal
};

export type CharDef = { name: string; costume: Costume; build: Build; seed: string };

export type PropRender = (p: { side: "L" | "R" }) => React.ReactNode;
