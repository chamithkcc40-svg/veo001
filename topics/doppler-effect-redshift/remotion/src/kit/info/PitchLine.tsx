// PitchLine - small wavy line in a speech-bubble shape (07 sec. 4). wiggles per width = pitch.
// `hi` 0..1 morphs from low (wide slow wiggles, RED) to high (tight fast, BLUE); `neutral` = white flat steady.
// Phase scrolls with frame so it always reads as sound. Use inside <svg>.
import React from "react";
import { C } from "../../theme";
import { alpha, mix } from "../../util";

export const PitchLine: React.FC<{
  x: number; y: number; w?: number; frame: number; pitch: number; // pitch: -1 low .. 0 steady .. +1 high
  neutral?: boolean; scale?: number; opacity?: number; tail?: "left" | "right" | "down"; step?: number; // step: 0..1 draws a downward step (drop) across the line
}> = ({ x, y, w = 220, frame, pitch, neutral, scale = 1, opacity = 1, tail = "down", step = 0 }) => {
  const h = 86;
  const cycles = neutral ? 6 : 6 + pitch * 4.2; // 1.8 .. 10.2 cycles across
  const amp = neutral ? 13 : 13 + -pitch * 5;
  const color = neutral ? C.white : pitch > 0 ? mix(C.white, C.blue, Math.min(1, pitch * 1.4)) : mix(C.white, C.red, Math.min(1, -pitch * 1.4));
  const n = 90;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const px = -w / 2 + 22 + u * (w - 44);
    const drop = step > 0 ? (u > 0.5 ? 16 * step : 0) - 8 * step : 0;
    const localCycles = step > 0 ? (u < 0.5 ? 9 : 3.5) : cycles;
    const ph = u * localCycles * Math.PI * 2 - frame * 0.35;
    const py = Math.sin(ph) * amp * Math.sin(u * Math.PI) ** 0.4 + drop;
    d += `${i ? "L" : "M"}${px},${py}`;
  }
  const lineColor = step > 0 ? `url(#pl-step-${Math.round(x)}-${Math.round(y)})` : color;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      {step > 0 && (
        <defs>
          <linearGradient id={`pl-step-${Math.round(x)}-${Math.round(y)}`} x1={-w / 2} x2={w / 2} y1={0} y2={0} gradientUnits="userSpaceOnUse">
            <stop offset="0.45" stopColor={C.blue} />
            <stop offset="0.55" stopColor={C.red} />
          </linearGradient>
        </defs>
      )}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={alpha(C.night, 0.72)} />
      {tail === "down" && <path d={`M-14,${h / 2 - 2} L0,${h / 2 + 18} L14,${h / 2 - 2} Z`} fill={alpha(C.night, 0.72)} />}
      {tail === "left" && <path d={`M${-w / 2 + 4},-12 L${-w / 2 - 18},6 L${-w / 2 + 4},12 Z`} fill={alpha(C.night, 0.72)} />}
      {tail === "right" && <path d={`M${w / 2 - 4},-12 L${w / 2 + 18},6 L${w / 2 - 4},12 Z`} fill={alpha(C.night, 0.72)} />}
      <path d={d} stroke={lineColor} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${alpha(neutral ? C.white : color, 0.6)})` }} />
    </g>
  );
};
