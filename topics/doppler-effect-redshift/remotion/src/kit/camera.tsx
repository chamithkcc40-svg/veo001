// camera.tsx - Camera transform (push/pull/pan/tilt/rotate + handheld) and multiplane Layer
// with parallax factor and depth-of-field blur. A Layer with depth d moves by (cam * d).
import React, { createContext, useContext } from "react";
import { AbsoluteFill } from "remotion";
import { noise1 } from "../util";

export type Cam = { x: number; y: number; zoom: number; rot: number; shake?: number; frame: number; seed?: string };
const CamCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1, rot: 0, frame: 0 });

/** Wraps a whole scene. Layers inside read the camera via context. */
export const Camera: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <CamCtx.Provider value={cam}>
    <AbsoluteFill style={{ overflow: "hidden" }}>{children}</AbsoluteFill>
  </CamCtx.Provider>
);

export const useCam = () => useContext(CamCtx);

/** One parallax plane. depth: 0 = infinitely far (static), 1 = subject plane, >1 foreground.
 *  zoom affects planes proportionally to depth (far planes zoom less). blur in px. */
export const Layer: React.FC<{ depth: number; blur?: number; children: React.ReactNode; style?: React.CSSProperties; origin?: [number, number] }> = ({ depth, blur = 0, children, style, origin = [960, 540] }) => {
  const cam = useCam();
  const sh = cam.shake ?? 0;
  const hx = sh ? noise1((cam.seed ?? "cam") + "x", cam.frame / 18) * sh : 0;
  const hy = sh ? noise1((cam.seed ?? "cam") + "y", cam.frame / 21) * sh : 0;
  const hr = sh ? noise1((cam.seed ?? "cam") + "r", cam.frame / 25) * sh * 0.05 : 0;
  const z = 1 + (cam.zoom - 1) * Math.max(0.15, depth);
  const tx = -(cam.x * depth) + hx * depth;
  const ty = -(cam.y * depth) + hy * depth;
  return (
    <AbsoluteFill style={{
      transformOrigin: `${origin[0]}px ${origin[1]}px`,
      transform: `translate(${tx}px, ${ty}px) scale(${z}) rotate(${cam.rot * Math.min(1, depth) + hr}deg)`,
      filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
      ...style,
    }}>
      {children}
    </AbsoluteFill>
  );
};

/** svg canvas helper sized 1920x1080 with overflow visible */
export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; w?: number; h?: number }> = ({ children, style, w = 1920, h = 1080 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);
