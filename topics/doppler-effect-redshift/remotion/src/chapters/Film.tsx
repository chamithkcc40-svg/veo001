// Film.tsx - the global-timeline renderer shared by every chapter composition and "Full".
// A chapter composition is just a window [from, to) onto the same film, so per-chapter renders
// concatenate exactly into Full. Scenes receive the GLOBAL frame `f` (all cue/sync data is global).
// Audio: the single offline mix (public/audio/mix.wav) trimmed to the window start.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Captions } from "../kit/Captions";
import { FilmOffset } from "../kit/fx";
import { REGISTRY, sceneWindow } from "./registry";

export const Film: React.FC<{ from: number; to: number; audio?: boolean }> = ({ from, audio = true }) => {
  const local = useCurrentFrame();
  const f = from + local;
  const active = REGISTRY.filter((r) => {
    const w = sceneWindow(r);
    return f >= w.start - (r.pre ?? 0) && f < w.end + (r.post ?? 0);
  });
  const hide = active.some((r) => r.hideCaptions?.(f));
  return (
    <FilmOffset.Provider value={from}>
    <AbsoluteFill style={{ backgroundColor: C.night, overflow: "hidden" }}>
      {active.map((r) => {
        const w = sceneWindow(r);
        const S = r.C;
        return <S key={r.ids.join("+")} f={f} start={w.start} end={w.end} />;
      })}
      {!hide && <Captions offset={from} />}
      {audio && <Audio src={staticFile("audio/mix.wav")} trimBefore={from} />}
    </AbsoluteFill>
    </FilmOffset.Provider>
  );
};
