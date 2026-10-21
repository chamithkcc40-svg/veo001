// registry.ts - every scene component, in film order (later entries draw on top during overlaps).
import { scene } from "../data";
import { SceneReg } from "./types";
import { CH0 } from "../scenes/ch0";
import { CH1 } from "../scenes/ch1";
import { CH2 } from "../scenes/ch2";
import { CH2B } from "../scenes/ch2b";
import { CH2C } from "../scenes/ch2c";

export const REGISTRY: SceneReg[] = [...CH0, ...CH1, ...CH2, ...CH2B, ...CH2C];

export const sceneWindow = (r: SceneReg) => ({ start: scene(r.ids[0]).start, end: scene(r.ids[r.ids.length - 1]).end });
