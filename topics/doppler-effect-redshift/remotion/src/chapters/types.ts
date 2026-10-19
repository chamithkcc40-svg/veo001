import React from "react";

/** props every scene component receives: global frame + its window (from data/video.json) */
export type SceneProps = { f: number; start: number; end: number };

export type SceneReg = {
  ids: string[]; // one or more consecutive storyboard scene ids drawn by this component
  C: React.FC<SceneProps>;
  pre?: number; // frames rendered before the window (overlapping transitions)
  post?: number; // frames rendered after the window
  hideCaptions?: (f: number) => boolean;
};
