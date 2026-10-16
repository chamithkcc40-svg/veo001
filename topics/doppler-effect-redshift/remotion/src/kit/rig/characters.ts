// characters.ts - every character is defined ONCE here (costume + build). Scenes import these.
import { C } from "../../theme";
import { Build, CharDef } from "./types";

const kid: Build = { headR: 62, torsoW: 92, torsoH: 92, upperArm: 46, foreArm: 42, thigh: 40, shin: 38, limbW: 24, legW: 27, hunch: 0, earSize: 1.25 };
const adult: Build = { headR: 58, torsoW: 104, torsoH: 132, upperArm: 64, foreArm: 58, thigh: 68, shin: 64, limbW: 24, legW: 28, hunch: 0, earSize: 1 };
const tall: Build = { ...adult, headR: 56, torsoW: 100, torsoH: 146, upperArm: 70, foreArm: 64, thigh: 78, shin: 74 };
const chubby: Build = { ...adult, headR: 60, torsoW: 128, torsoH: 120, upperArm: 56, foreArm: 52, thigh: 56, shin: 52, limbW: 27, legW: 31 };

export const PIP: CharDef = {
  name: "Pip", seed: "pip",
  build: kid,
  costume: {
    skin: "#F3BE98", skinSh: "#DE9585", hair: "#3A1A55", hairStyle: "pip", hat: "none", hatColor: C.sun,
    outfit: "hoodie", top: C.sun, top2: C.sunLt, sleeve: C.sun, legs: C.teal, shoes: C.red,
    neck: "headphones", neckColor: C.violet, glasses: false, blushAmt: 1,
  },
};

export const NELL: CharDef = {
  name: "Nell", seed: "nell",
  build: { ...adult, headR: 56 },
  costume: {
    skin: "#C98A66", skinSh: "#A86A55", hair: "#24103F", hairStyle: "nell", hat: "cap", hatColor: "#2B2F7A",
    outfit: "uniform", top: "#2B2F7A", top2: C.lilac, sleeve: "#2B2F7A", legs: "#22235E", shoes: C.night,
    neck: "collar", neckColor: C.white, glasses: false, blushAmt: 0.8,
  },
};

export const DOPPLER: CharDef = {
  name: "Christian Doppler", seed: "doppler",
  build: { ...tall, torsoW: 92, hunch: 8, limbW: 21, legW: 24 },
  costume: {
    skin: "#EFC3A4", skinSh: "#D29A88", hair: "#5A3A2A", hairStyle: "doppler", hat: "none", hatColor: C.night,
    outfit: "frock", top: "#2A2350", top2: C.plum, sleeve: "#2A2350", legs: "#3A3060", shoes: C.night,
    neck: "cravat", neckColor: C.night, glasses: false, sideburns: true, blushAmt: 0.45,
  },
};

export const BUYSBALLOT: CharDef = {
  name: "Buys Ballot", seed: "ballot",
  build: { ...adult, torsoW: 108 },
  costume: {
    skin: "#F0C2A0", skinSh: "#D49786", hair: "#7A4A30", hairStyle: "short", hat: "tophat", hatColor: "#24183F",
    outfit: "frock", top: "#3B2A70", top2: C.sun, sleeve: "#3B2A70", legs: "#2A2050", shoes: C.night,
    neck: "bowtie", neckColor: C.magenta, glasses: false, sideburns: true, blushAmt: 0.7,
  },
};

const hornCostume = (skin: string, skinSh: string, hair: string) => ({
  skin, skinSh, hair, hairStyle: "short" as const, hat: "bandcap" as const, hatColor: C.magenta,
  outfit: "band" as const, top: C.magenta, top2: C.sun, sleeve: C.magenta, legs: C.night, shoes: C.night,
  neck: "none" as const, neckColor: C.sun, glasses: false, blushAmt: 1.3,
});
export const HORN1: CharDef = { name: "Horn player 1", seed: "horn1", build: chubby, costume: hornCostume("#F2BC98", "#D99184", "#5B3A28") };
export const HORN2: CharDef = { name: "Horn player 2", seed: "horn2", build: { ...chubby, headR: 56, torsoW: 118 }, costume: hornCostume("#B97A58", "#9A604A", "#24103F") };
export const HORN3: CharDef = { name: "Horn player 3", seed: "horn3", build: { ...chubby, headR: 62, torsoW: 134 }, costume: hornCostume("#E8B08C", "#CC8A78", "#A0522D") };

export const SLIPHER: CharDef = {
  name: "Vesto Slipher", seed: "slipher",
  build: { ...tall, torsoW: 94, limbW: 22, legW: 25 },
  costume: {
    skin: "#EDC1A2", skinSh: "#D09886", hair: "#4A2E22", hairStyle: "slick", hat: "none", hatColor: C.night,
    outfit: "vest", top: "#4A2A6A", top2: C.sun, sleeve: C.lilac, legs: "#3A2F5A", shoes: C.night,
    neck: "tie", neckColor: C.teal, glasses: true, blushAmt: 0.6,
  },
};

export const HUBBLE: CharDef = {
  name: "Edwin Hubble", seed: "hubble",
  build: { ...tall, headR: 58, torsoW: 110, torsoH: 150 },
  costume: {
    skin: "#EEC09E", skinSh: "#D19585", hair: "#3C2A22", hairStyle: "part", hat: "none", hatColor: C.night,
    outfit: "tweed", top: "#8A5A3A", top2: "#6E4630", sleeve: "#8A5A3A", legs: "#4A3A5A", shoes: "#2A1A20",
    neck: "tie", neckColor: C.magenta, glasses: false, blushAmt: 0.55,
  },
};

export const LEMAITRE: CharDef = {
  name: "Georges Lemaitre", seed: "lemaitre",
  build: { ...adult, torsoW: 112 },
  costume: {
    skin: "#F0C4A6", skinSh: "#D49A8A", hair: "#6A6070", hairStyle: "short", hat: "none", hatColor: C.night,
    outfit: "cassock", top: "#201A38", top2: C.white, sleeve: "#201A38", legs: "#201A38", shoes: C.night,
    neck: "clerical", neckColor: C.white, glasses: true, blushAmt: 0.8,
  },
};

export const OBSERVER_A: CharDef = {
  name: "Observer A", seed: "obsA", build: { ...adult, torsoW: 112, torsoH: 118 },
  costume: {
    skin: "#E9B894", skinSh: "#CF9080", hair: "#C77A3A", hairStyle: "bun", hat: "none", hatColor: C.night,
    outfit: "casual", top: C.teal, top2: C.mint, sleeve: C.teal, legs: C.plum, shoes: C.night,
    neck: "collar", neckColor: C.lilac, glasses: false, blushAmt: 1,
  },
};
export const OBSERVER_B: CharDef = {
  name: "Observer B", seed: "obsB", build: { ...adult, headR: 54 },
  costume: {
    skin: "#A86E50", skinSh: "#8C5844", hair: "#20103A", hairStyle: "short", hat: "none", hatColor: C.night,
    outfit: "frock", top: C.olive, top2: C.sunLt, sleeve: C.olive, legs: "#3A3060", shoes: C.night,
    neck: "cravat", neckColor: C.lilac, glasses: false, blushAmt: 0.8,
  },
};

export const ALL_CHARS = [PIP, NELL, DOPPLER, BUYSBALLOT, HORN1, HORN2, HORN3, SLIPHER, HUBBLE, LEMAITRE, OBSERVER_A, OBSERVER_B];
