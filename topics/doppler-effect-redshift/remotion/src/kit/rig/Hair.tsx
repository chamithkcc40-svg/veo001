// Hair.tsx - big simple hair masses with one highlight shape; hats. Back layer sits behind the
// head, front layer (fringe) sits over the forehead. `follow` adds follow-through sway.
import React from "react";
import { C } from "../../theme";
import { alpha, mix } from "../../util";
import { CharDef } from "./types";

type HP = { def: CharDef; r: number; layer: "back" | "front"; col: (c: string) => string; g: (n: string) => string; follow: number; turn: number };

export const Hair: React.FC<HP> = ({ def, r, layer, col, g, follow, turn }) => {
  const K = def.costume;
  const hl = alpha(mix(K.hair, C.white, 0.5), 0.55);
  const tx = turn * r * 0.12;
  const fw = follow; // deg
  switch (K.hairStyle) {
    case "pip":
      // tufty mop with a cowlick that follows through
      return layer === "back" ? (
        <g>
          <ellipse cx={tx * -0.5} cy={-r * 0.25} rx={r * 1.08} ry={r * 0.95} fill={g("hair")} />
        </g>
      ) : (
        <g>
          <path d={`M${-r * 0.98 + tx},${-r * 0.05} Q${-r * 0.9},${-r * 1.05} ${tx},${-r * 1.08} Q${r * 0.95},${-r * 1.05} ${r * 0.98 + tx},${-r * 0.1}
            Q${r * 0.7},${-r * 0.5} ${r * 0.35 + tx},${-r * 0.42} Q${r * 0.2},${-r * 0.62} ${-r * 0.05 + tx},${-r * 0.45} Q${-r * 0.35},${-r * 0.62} ${-r * 0.5 + tx},${-r * 0.4} Q${-r * 0.8},${-r * 0.45} ${-r * 0.98 + tx},${-r * 0.05} Z`} fill={g("hair")} />
          <g transform={`rotate(${fw * 1.5},${tx},${-r})`}>
            <path d={`M${tx - r * 0.1},${-r * 0.98} Q${tx + r * 0.05},${-r * 1.45} ${tx + r * 0.38},${-r * 1.35} Q${tx + r * 0.15},${-r * 1.2} ${tx + r * 0.15},${-r * 0.98} Z`} fill={col(K.hair)} />
          </g>
          <path d={`M${-r * 0.55 + tx},${-r * 0.8} Q${-r * 0.2 + tx},${-r * 0.98} ${r * 0.15 + tx},${-r * 0.88}`} stroke={hl} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
        </g>
      );
    case "nell":
      // short bob under a cap, with a ponytail that follows through
      return layer === "back" ? (
        <g>
          <g transform={`rotate(${fw * 2},${-r * 0.6},${r * 0.1})`}>
            <ellipse cx={-r * 1.05 - tx} cy={r * 0.45} rx={r * 0.28} ry={r * 0.5} fill={g("hair")} />
          </g>
          <path d={`M${-r * 1.02},${r * 0.45} Q${-r * 1.1},${-r * 0.9} 0,${-r * 1.0} Q${r * 1.1},${-r * 0.9} ${r * 1.02},${r * 0.45} L${r * 0.75},${r * 0.5} L${-r * 0.75},${r * 0.5} Z`} fill={g("hair")} />
        </g>
      ) : (
        <g>
          <path d={`M${-r * 0.95 + tx},${-r * 0.2} Q${-r * 0.6 + tx},${-r * 0.75} ${r * 0.2 + tx},${-r * 0.62} Q${r * 0.7 + tx},${-r * 0.55} ${r * 0.95 + tx},${-r * 0.15} Q${r * 0.8},${-r * 0.95} 0,${-r * 0.98} Q${-r * 0.85},${-r * 0.95} ${-r * 0.95 + tx},${-r * 0.2} Z`} fill={g("hair")} />
          <path d={`M${-r * 0.5 + tx},${-r * 0.55} Q${-r * 0.2 + tx},${-r * 0.7} ${r * 0.1 + tx},${-r * 0.63}`} stroke={hl} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
        </g>
      );
    case "doppler":
      // receding, swept-back 1840s hair with side volume + sideburns
      return layer === "back" ? (
        <g>
          <ellipse cx={-r * 0.1 - tx} cy={-r * 0.15} rx={r * 1.08} ry={r * 0.98} fill={g("hair")} />
        </g>
      ) : (
        <g>
          <path d={`M${-r * 1.0 + tx},${r * 0.15} Q${-r * 1.02},${-r * 0.75} ${-r * 0.35 + tx},${-r * 0.92} Q${r * 0.4},${-r * 1.08} ${r * 0.9 + tx},${-r * 0.55} Q${r * 0.55 + tx},${-r * 0.72} ${r * 0.05 + tx},${-r * 0.72} Q${-r * 0.55 + tx},${-r * 0.6} ${-r * 0.8 + tx},${r * 0.15} Z`} fill={g("hair")} />
          {[-1, 1].map((s) => (
            <rect key={s} x={s * r * 0.88 - r * 0.09 + tx * 0.6} y={-r * 0.15} width={r * 0.18} height={r * 0.55} rx={r * 0.09} fill={col(K.hair)} />
          ))}
          <path d={`M${-r * 0.4 + tx},${-r * 0.82} Q${r * 0.1 + tx},${-r * 0.95} ${r * 0.5 + tx},${-r * 0.7}`} stroke={hl} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
        </g>
      );
    case "slick":
      // neat 1910s/1920s side-part slicked
      return layer === "back" ? (
        <ellipse cx={-tx * 0.5} cy={-r * 0.3} rx={r * 1.03} ry={r * 0.85} fill={g("hair")} />
      ) : (
        <g>
          <path d={`M${-r * 0.98 + tx},${-r * 0.05} Q${-r * 0.95},${-r * 1.0} ${-r * 0.1 + tx},${-r * 1.02} Q${r * 0.85},${-r * 1.0} ${r * 0.98 + tx},${-r * 0.1} Q${r * 0.7 + tx},${-r * 0.55} ${-r * 0.25 + tx},${-r * 0.6} Q${-r * 0.75 + tx},${-r * 0.5} ${-r * 0.98 + tx},${-r * 0.05} Z`} fill={g("hair")} />
          <path d={`M${-r * 0.3 + tx},${-r * 0.95} Q${r * 0.2 + tx},${-r * 0.92} ${r * 0.65 + tx},${-r * 0.65}`} stroke={hl} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
        </g>
      );
    case "part":
      // middle-part 1920s with volume
      return layer === "back" ? (
        <ellipse cx={0} cy={-r * 0.28} rx={r * 1.06} ry={r * 0.9} fill={g("hair")} />
      ) : (
        <g>
          <path d={`M${-r + tx},${0} Q${-r * 1.02},${-r * 1.05} ${tx},${-r * 1.03} Q${r * 1.02},${-r * 1.05} ${r + tx},${0} Q${r * 0.75 + tx},${-r * 0.62} ${tx + r * 0.05},${-r * 0.75} Q${-r * 0.75 + tx},${-r * 0.62} ${-r + tx},0 Z`} fill={g("hair")} />
          <path d={`M${-r * 0.6 + tx},${-r * 0.78} Q${-r * 0.3 + tx},${-r * 0.95} ${-r * 0.05 + tx},${-r * 0.88}`} stroke={hl} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
        </g>
      );
    case "short":
      return layer === "back" ? (
        <ellipse cx={0} cy={-r * 0.35} rx={r * 1.02} ry={r * 0.8} fill={g("hair")} />
      ) : (
        <path d={`M${-r * 0.97 + tx},${-r * 0.15} Q${-r * 0.9},${-r * 1.0} ${tx},${-r * 1.02} Q${r * 0.9},${-r * 1.0} ${r * 0.97 + tx},${-r * 0.15} Q${r * 0.5 + tx},${-r * 0.6} ${tx},${-r * 0.62} Q${-r * 0.5 + tx},${-r * 0.6} ${-r * 0.97 + tx},${-r * 0.15} Z`} fill={g("hair")} />
      );
    case "bun":
      return layer === "back" ? (
        <g>
          <circle cx={-tx} cy={-r * 1.0} r={r * 0.42} fill={g("hair")} />
          <ellipse cx={0} cy={-r * 0.25} rx={r * 1.05} ry={r * 0.9} fill={g("hair")} />
        </g>
      ) : (
        <path d={`M${-r + tx},${-r * 0.05} Q${-r},${-r * 1.0} ${tx},${-r * 1.02} Q${r},${-r * 1.0} ${r + tx},${-r * 0.05} Q${r * 0.6 + tx},${-r * 0.65} ${tx},${-r * 0.68} Q${-r * 0.6 + tx},${-r * 0.65} ${-r + tx},${-r * 0.05} Z`} fill={g("hair")} />
      );
    default:
      return null;
  }
};

export const HatShape: React.FC<{ def: CharDef; r: number; col: (c: string) => string; g: (n: string) => string; turn: number }> = ({ def, r, col, g, turn }) => {
  const K = def.costume;
  const tx = turn * r * 0.15;
  switch (K.hat) {
    case "cap":
      return (
        <g>
          <path d={`M${-r * 1.0},${-r * 0.38} Q${-r * 0.95},${-r * 1.18} 0,${-r * 1.2} Q${r * 0.95},${-r * 1.18} ${r * 1.0},${-r * 0.38} Z`} fill={g("hat")} />
          <path d={`M${-r * 0.2 + tx * 2},${-r * 0.42} Q${r * 0.9 + tx * 3},${-r * 0.5} ${r * 1.45 + tx * 3},${-r * 0.3} Q${r * 0.9 + tx * 3},${-r * 0.2} ${-r * 0.2 + tx * 2},${-r * 0.3} Z`} fill={col(mix(K.hatColor, C.night, 0.25))} />
          <rect x={-r * 1.0} y={-r * 0.5} width={r * 2.0} height={r * 0.14} rx={r * 0.07} fill={col(mix(K.hatColor, C.white, 0.25))} />
          <circle cx={tx} cy={-r * 0.85} r={r * 0.12} fill={col(C.lilac)} />
        </g>
      );
    case "tophat":
      return (
        <g transform={`rotate(-6,0,${-r})`}>
          <ellipse cx={tx} cy={-r * 0.72} rx={r * 1.25} ry={r * 0.2} fill={col(mix(K.hatColor, C.night, 0.2))} />
          <rect x={-r * 0.72 + tx} y={-r * 2.05} width={r * 1.44} height={r * 1.35} rx={r * 0.18} fill={g("hat")} />
          <rect x={-r * 0.72 + tx} y={-r * 1.0} width={r * 1.44} height={r * 0.22} fill={col(C.plum)} />
          <ellipse cx={tx} cy={-r * 2.05} rx={r * 0.72} ry={r * 0.12} fill={col(mix(K.hatColor, C.white, 0.15))} />
        </g>
      );
    case "bandcap":
      return (
        <g>
          <rect x={-r * 0.85} y={-r * 1.38} width={r * 1.7} height={r * 0.72} rx={r * 0.2} fill={g("hat")} />
          <rect x={-r * 0.9} y={-r * 0.78} width={r * 1.8} height={r * 0.16} rx={r * 0.08} fill={col(C.sun)} />
          <path d={`M${-r * 0.1 + tx},${-r * 0.66} Q${r * 0.6 + tx * 2},${-r * 0.6} ${r * 1.0 + tx * 2},${-r * 0.42} L${-r * 0.1 + tx},${-r * 0.5} Z`} fill={col(C.night)} />
          <circle cx={tx} cy={-r * 1.05} r={r * 0.13} fill={col(C.sun)} />
        </g>
      );
    default:
      return null;
  }
};
