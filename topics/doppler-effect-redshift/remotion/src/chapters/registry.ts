// registry.ts - every scene component, in film order (later entries draw on top during overlaps).
import { scene } from "../data";
import { SceneReg } from "./types";
import { CH0 } from "../scenes/ch0";
import { CH1 } from "../scenes/ch1";
import { CH2 } from "../scenes/ch2";
import { CH2B } from "../scenes/ch2b";
import { CH2C } from "../scenes/ch2c";
import { CH3 } from "../scenes/ch3";
import { CH3B } from "../scenes/ch3b";
import { CH3C } from "../scenes/ch3c";
import { CH4 } from "../scenes/ch4";
import { CH4B } from "../scenes/ch4b";

export const REGISTRY: SceneReg[] = [...CH0, ...CH1, ...CH2, ...CH2B, ...CH2C, ...CH3, ...CH3B, ...CH3C, ...CH4, ...CH4B];

export const sceneWindow = (r: SceneReg) => ({ start: scene(r.ids[0]).start, end: scene(r.ids[r.ids.length - 1]).end });
