// registry.ts - every scene component, in film order (later entries draw on top during overlaps).
import { scene } from "../data";
import { SceneReg } from "./types";
import { CH0 } from "../scenes/ch0";

export const REGISTRY: SceneReg[] = [...CH0];

export const sceneWindow = (r: SceneReg) => ({ start: scene(r.ids[0]).start, end: scene(r.ids[r.ids.length - 1]).end });
