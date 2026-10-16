import React from "react";
import { Composition } from "remotion";
import { V } from "./data";
import { loadFonts } from "./fonts";
import { ModelSheet, SkipperSheet } from "./sheets/ModelSheet";
import { ALL_CHARS } from "./kit/rig/characters";
import { KitSheet, KITS } from "./sheets/KitSheet";

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    {ALL_CHARS.map((c) => (
      <Composition key={c.seed} id={`Sheet-${c.seed}`} component={ModelSheet} defaultProps={{ def: c }} durationInFrames={1} fps={V.fps} width={1920} height={1080} />
    ))}
    {KITS.map((k) => (
      <Composition key={k} id={`Kit-${k}`} component={KitSheet} defaultProps={{ kit: k }} durationInFrames={120} fps={V.fps} width={1920} height={1080} />
    ))}
    <Composition id="Sheet-skipper" component={SkipperSheet} durationInFrames={1} fps={V.fps} width={1920} height={1080} />
  </>
);
