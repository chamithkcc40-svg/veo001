// theme.ts - single source of truth (STYLE_BIBLE.md). Never inline hex/easing in components.
import { Easing } from "remotion";

export const C = {
  night: "#1A0B45",
  violet: "#35188B",
  purple: "#7E1ABA",
  purpleLt: "#9B3FD1",
  plum: "#7A255E",
  plumDk: "#3A1240",
  magenta: "#D80976",
  pink: "#EE6289",
  blush: "#EE6289",
  lilac: "#EBD6F2",
  sun: "#F9BB47",
  sunLt: "#FFD98A",
  teal: "#1D8AAA",
  tealLt: "#45B8CF",
  mint: "#B5EEB9",
  peri: "#6788EF",
  olive: "#80990B",
  oliveLt: "#A9C61B",
  blue: "#3D8BFF",
  red: "#FF3D5A",
  core: "#FFF4D6",
  white: "#FFFFFF",
  ink: "#1A0B45",
  skin: "#F6C7A6",
  skinShadow: "#E89A8A",
  skinDk: "#C9876A",
  peach: "#F7A6B8",
  board: "#0F5C5A",
  boardDk: "#134E57",
  chalk: "#EBF7EE",
  dough: "#F6D9A8",
  sepia: "#C89B6A",
  farHill: "#7FA0D8",
} as const;

// Time-of-day palettes (STYLE_BIBLE 2)
export const TOD = {
  golden: { skyTop: C.peri, skyMid: C.peach, skyLow: C.sun, bldg: C.purple, bldgLt: C.purpleLt, bldgSh: C.violet, rim: C.sunLt, key: C.sun },
  dusk: { skyTop: C.violet, skyMid: C.magenta, skyLow: C.sun, bldg: "#4A1F8F", bldgLt: "#5E2AA8", bldgSh: "#2A1066", rim: C.pink, key: C.magenta },
  night: { skyTop: C.night, skyMid: C.violet, skyLow: "#4A1F8F", bldg: "#2A1066", bldgLt: "#3A1A80", bldgSh: "#160838", rim: C.peri, key: C.violet },
} as const;

export const F = {
  display: "Fredoka",
  body: "Nunito",
  period: "IM Fell DW Pica", // in-world 19th/early-20th c. documents only (title pages, plates)
} as const;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo - entrances / slides
  inOut: Easing.bezier(0.83, 0, 0.17, 1), // easeInOutQuint - camera moves
  inOutSine: Easing.bezier(0.37, 0, 0.63, 1), // gentle drifts
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot pops
  in: Easing.bezier(0.7, 0, 0.84, 0), // exits only
  outCubic: Easing.bezier(0.33, 1, 0.68, 1),
} as const;

export const spr = {
  snappy: { damping: 14, stiffness: 160, mass: 0.6 },
  smooth: { damping: 20, stiffness: 90, mass: 1 },
  bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  heavy: { damping: 18, stiffness: 60, mass: 1.4 },
} as const;

export const SAFE = { x: 96, y: 54, capTop: 905, capBottom: 1026 } as const;
export const W = 1920;
export const H = 1080;
