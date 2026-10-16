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
