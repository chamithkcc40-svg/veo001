import React from "react";
import { Composition } from "remotion";
import { V } from "./data";
import { loadFonts } from "./fonts";
import { ModelSheet, SkipperSheet } from "./sheets/ModelSheet";
import { ALL_CHARS } from "./kit/rig/characters";
import { KitSheet, KITS } from "./sheets/KitSheet";
import { Film } from "./chapters/Film";

loadFonts();

const common = { fps: V.fps, width: V.width, height: V.height } as const;

export const RemotionRoot: React.FC = () => (
  <>
    {/* one composition per chapter (windows onto the global film) + Full */}
    {V.chapters.map((c) => (
      <Composition key={c.id} id={c.id} component={Film} defaultProps={{ from: c.start, to: c.end, audio: true }} durationInFrames={c.end - c.start} {...common} />
    ))}
    <Composition id="Full" component={Film} defaultProps={{ from: 0, to: V.durationInFrames, audio: true }} durationInFrames={V.durationInFrames} {...common} />
    {/* model sheets and kit sheets (review only) */}
    {ALL_CHARS.map((c) => (
      <Composition key={c.seed} id={`Sheet-${c.seed}`} component={ModelSheet} defaultProps={{ def: c }} durationInFrames={1} fps={V.fps} width={1920} height={1080} />
    ))}
    {KITS.map((k) => (
      <Composition key={k} id={`Kit-${k}`} component={KitSheet} defaultProps={{ kit: k }} durationInFrames={120} fps={V.fps} width={1920} height={1080} />
    ))}
    <Composition id="Sheet-skipper" component={SkipperSheet} durationInFrames={1} fps={V.fps} width={1920} height={1080} />
  </>
);
