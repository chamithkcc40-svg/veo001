import video from "../data/video.json";

export type Scene = { id: string; chapter: number; start: number; end: number; beats: string; shot: string; env: string; camera: string; transitionIn: string };
export type Word = { i: number; text: string; s: number; e: number; ch: number };
export type Page = { w: number[]; s: number; e: number; ch: number; text: string };
export type Chapter = { id: string; title: string; start: number; end: number };

export const V = video as unknown as {
  fps: number; width: number; height: number; durationInFrames: number;
  voice: { file: string };
  chapters: Chapter[]; cues: Record<string, number>; scenes: Scene[]; words: Word[]; pages: Page[];
  sfx: { f: number; key: string; db: number }[];
  sync: Record<string, number | number[] | null>;
};

export const cue = (k: string): number => {
  const v = V.cues[k];
  if (v === undefined) throw new Error("missing cue " + k);
  return v;
};
export const scene = (id: string): Scene => {
  const s = V.scenes.find((x) => x.id === id);
  if (!s) throw new Error("missing scene " + id);
  return s;
};

/** audio-visual sync point shared with the offline mix (scripts/audio): pass frames, rhythm starts */
export const sync = (k: string): number => {
  const v = V.sync[k];
  if (typeof v !== "number") throw new Error("missing sync " + k);
  return v;
};
export const syncList = (k: string): number[] => {
  const v = V.sync[k];
  if (!Array.isArray(v)) throw new Error("missing sync list " + k);
  return v;
};
