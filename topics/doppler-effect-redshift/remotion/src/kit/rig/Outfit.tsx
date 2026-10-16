// Outfit.tsx - torso shapes per costume. Coats get tails with follow-through.
import React from "react";
import { C } from "../../theme";
import { alpha, mix } from "../../util";
import { CharDef } from "./types";

type OP = { def: CharDef; hipY: number; top: number; g: (n: string) => string; col: (c: string) => string; follow: number; turn: number; light: number };

export const Outfit: React.FC<OP> = ({ def, hipY, top, g, col, follow, turn }) => {
  const B = def.build;
  const K = def.costume;
  const w = B.torsoW;
  const h = B.torsoH;
  const tx = turn * w * 0.08;
  // generic rounded torso (pear-ish)
  const body = (wTop: number, wBot: number, extra = 0) =>
    `M${-wTop / 2},${top + h * 0.12} Q${-wTop / 2},${top} ${-wTop / 2 + h * 0.15},${top} L${wTop / 2 - h * 0.15},${top} Q${wTop / 2},${top} ${wTop / 2},${top + h * 0.12}
     L${wBot / 2},${hipY + extra - h * 0.1} Q${wBot / 2},${hipY + extra} ${wBot / 2 - h * 0.12},${hipY + extra} L${-wBot / 2 + h * 0.12},${hipY + extra} Q${-wBot / 2},${hipY + extra} ${-wBot / 2},${hipY + extra - h * 0.1} Z`;

  const neckPiece = () => {
    switch (K.neck) {
      case "headphones":
        return (
          <g>
            <path d={`M${-w * 0.36},${top + h * 0.02} Q0,${top + h * 0.34} ${w * 0.36},${top + h * 0.02}`} stroke={col(C.night)} strokeWidth={w * 0.06} fill="none" strokeLinecap="round" />
            {[-1, 1].map((s) => (
              <g key={s}>
                <ellipse cx={s * w * 0.36} cy={top + h * 0.04} rx={w * 0.13} ry={w * 0.16} fill={col(K.neckColor)} />
                <ellipse cx={s * w * 0.36 - s * w * 0.03} cy={top + h * 0.02} rx={w * 0.06} ry={w * 0.08} fill={col(mix(K.neckColor, C.white, 0.45))} />
              </g>
            ))}
          </g>
        );
      case "cravat":
        return (
          <g>
            <path d={`M${-w * 0.16 + tx},${top + 2} L${w * 0.16 + tx},${top + 2} L${tx},${top + h * 0.3} Z`} fill={col(C.lilac)} />
            <ellipse cx={tx} cy={top + h * 0.08} rx={w * 0.12} ry={h * 0.07} fill={col(K.neckColor)} />
            <path d={`M${tx - w * 0.08},${top + h * 0.12} L${tx - w * 0.12},${top + h * 0.32} L${tx},${top + h * 0.2} L${tx + w * 0.12},${top + h * 0.32} L${tx + w * 0.08},${top + h * 0.12} Z`} fill={col(K.neckColor)} />
          </g>
        );
      case "tie":
        return (
          <g>
            <path d={`M${-w * 0.15 + tx},${top + 2} L${w * 0.15 + tx},${top + 2} L${tx},${top + h * 0.22} Z`} fill={col(C.lilac)} />
            <path d={`M${tx - w * 0.05},${top + h * 0.08} L${tx + w * 0.05},${top + h * 0.08} L${tx + w * 0.08},${top + h * 0.62} L${tx},${top + h * 0.72} L${tx - w * 0.08},${top + h * 0.62} Z`} fill={col(K.neckColor)} />
          </g>
        );
      case "bowtie":
        return (
          <g>
            <path d={`M${tx},${top + h * 0.1} L${tx - w * 0.16},${top + h * 0.02} L${tx - w * 0.16},${top + h * 0.2} Z M${tx},${top + h * 0.1} L${tx + w * 0.16},${top + h * 0.02} L${tx + w * 0.16},${top + h * 0.2} Z`} fill={col(K.neckColor)} />
            <circle cx={tx} cy={top + h * 0.1} r={w * 0.05} fill={col(mix(K.neckColor, C.night, 0.3))} />
          </g>
        );
      case "clerical":
        return <rect x={-w * 0.2 + tx} y={top + 1} width={w * 0.4} height={h * 0.09} rx={h * 0.04} fill={col(C.white)} />;
      case "collar":
        return (
          <path d={`M${-w * 0.28 + tx},${top + 1} L${tx},${top + h * 0.18} L${w * 0.28 + tx},${top + 1} L${w * 0.18 + tx},${top + h * 0.2} L${tx},${top + h * 0.12} L${-w * 0.18 + tx},${top + h * 0.2} Z`} fill={col(K.neckColor)} />
        );
      default:
        return null;
    }
  };

  const tails = (len: number, color: string) => (
    <g transform={`rotate(${follow},0,${hipY - h * 0.1})`}>
      <path d={`M${-w * 0.5},${hipY - h * 0.15} L${-w * 0.56},${hipY + len} Q${-w * 0.3},${hipY + len * 1.05} ${-w * 0.05},${hipY + len * 0.85} L${-w * 0.02},${hipY - h * 0.1} Z
                M${w * 0.5},${hipY - h * 0.15} L${w * 0.56},${hipY + len} Q${w * 0.3},${hipY + len * 1.05} ${w * 0.05},${hipY + len * 0.85} L${w * 0.02},${hipY - h * 0.1} Z`} fill={color} />
    </g>
  );

  switch (K.outfit) {
    case "hoodie":
      return (
        <g>
          {/* hood bunched behind neck */}
          <ellipse cx={0} cy={top + h * 0.05} rx={w * 0.42} ry={h * 0.16} fill={col(mix(K.top, C.plum, 0.25))} />
          <path d={body(w * 0.98, w * 1.04, h * 0.06)} fill={g("top")} />
          {/* pocket */}
          <path d={`M${-w * 0.3 + tx},${hipY - h * 0.38} L${w * 0.3 + tx},${hipY - h * 0.38} L${w * 0.36 + tx},${hipY - h * 0.08} L${-w * 0.36 + tx},${hipY - h * 0.08} Z`} fill={col(mix(K.top, C.plum, 0.18))} />
          {/* drawstrings */}
          {[-1, 1].map((s) => (
            <rect key={s} x={tx + s * w * 0.1 - 2} y={top + h * 0.12} width={4} height={h * 0.26} rx={2} fill={col(C.lilac)} />
          ))}
          {/* waistband */}
          <rect x={-w * 0.52} y={hipY - h * 0.02} width={w * 1.04} height={h * 0.1} rx={h * 0.05} fill={col(mix(K.top, C.plum, 0.25))} />
          {neckPiece()}
        </g>
      );
    case "uniform":
      return (
        <g>
          <path d={body(w, w * 0.96, h * 0.04)} fill={g("top")} />
          <rect x={tx - 2} y={top + h * 0.2} width={4} height={h * 0.8} fill={col(mix(K.top, C.night, 0.35))} />
          {[0.35, 0.55, 0.75].map((k) => (
            <circle key={k} cx={tx + w * 0.06} cy={top + h * k} r={w * 0.025} fill={col(C.lilac)} />
          ))}
          {/* plain patch (no insignia) */}
          <rect x={-w * 0.38 + tx} y={top + h * 0.3} width={w * 0.18} height={h * 0.1} rx={4} fill={col(K.top2)} />
          <rect x={-w * 0.52} y={hipY - h * 0.08} width={w * 1.04} height={h * 0.1} rx={h * 0.05} fill={col(C.night)} />
          {neckPiece()}
        </g>
      );
    case "frock":
      return (
        <g>
          {tails(h * 0.75, col(mix(K.top, C.night, 0.15)))}
          <path d={body(w * 0.92, w * 1.0)} fill={g("top")} />
          {/* waistcoat V */}
          <path d={`M${-w * 0.2 + tx},${top + 2} L${w * 0.2 + tx},${top + 2} L${w * 0.16 + tx},${hipY - h * 0.05} L${-w * 0.16 + tx},${hipY - h * 0.05} Z`} fill={col(K.top2)} />
          {/* lapels */}
          <path d={`M${-w * 0.2 + tx},${top + 2} L${-w * 0.36 + tx},${top + h * 0.35} L${-w * 0.14 + tx},${top + h * 0.55} Z M${w * 0.2 + tx},${top + 2} L${w * 0.36 + tx},${top + h * 0.35} L${w * 0.14 + tx},${top + h * 0.55} Z`} fill={col(mix(K.top, C.white, 0.1))} />
          {[0.6, 0.75].map((k) => (
            <circle key={k} cx={tx} cy={top + h * k} r={w * 0.022} fill={col(C.sun)} />
          ))}
          {neckPiece()}
        </g>
      );
    case "vest":
      return (
        <g>
          <path d={body(w * 0.94, w * 0.98)} fill={col(C.lilac)} />
          <path d={`M${-w * 0.47},${top + h * 0.12} L${-w * 0.12 + tx},${top + h * 0.15} L${-w * 0.06 + tx},${hipY + h * 0.02} L${-w * 0.48},${hipY + h * 0.02} Z M${w * 0.47},${top + h * 0.12} L${w * 0.12 + tx},${top + h * 0.15} L${w * 0.06 + tx},${hipY + h * 0.02} L${w * 0.48},${hipY + h * 0.02} Z`} fill={g("top")} />
          {[0.45, 0.62, 0.79].map((k) => (
            <circle key={k} cx={tx + w * 0.1} cy={top + h * k} r={w * 0.02} fill={col(K.top2)} />
          ))}
          {neckPiece()}
        </g>
      );
    case "tweed":
      return (
        <g>
          <path d={body(w, w * 1.0, h * 0.08)} fill={g("top")} />
          {/* tweed texture dots */}
          {Array.from({ length: 18 }).map((_, i) => (
            <circle key={i} cx={-w * 0.4 + ((i * 37) % 80) / 100 * w} cy={top + h * 0.2 + ((i * 53) % 70) / 100 * h} r={1.6} fill={alpha(C.night, 0.18)} />
          ))}
          <path d={`M${-w * 0.16 + tx},${top + 2} L${w * 0.16 + tx},${top + 2} L${tx},${top + h * 0.55} Z`} fill={col(C.lilac)} />
          <path d={`M${-w * 0.16 + tx},${top + 2} L${-w * 0.34 + tx},${top + h * 0.3} L${-w * 0.06 + tx},${top + h * 0.6} Z M${w * 0.16 + tx},${top + 2} L${w * 0.34 + tx},${top + h * 0.3} L${w * 0.06 + tx},${top + h * 0.6} Z`} fill={col(K.top2)} />
          <rect x={w * 0.18 + tx} y={top + h * 0.28} width={w * 0.16} height={h * 0.04} rx={2} fill={col(mix(K.top, C.night, 0.3))} />
          {neckPiece()}
        </g>
      );
    case "cassock":
      return (
        <g>
          <path d={body(w * 0.94, w * 1.12, h * 0.3)} fill={g("top")} />
          {[0.25, 0.4, 0.55, 0.7, 0.85, 1.0].map((k) => (
            <circle key={k} cx={tx} cy={top + h * k} r={w * 0.017} fill={col(mix(K.top, C.white, 0.25))} />
          ))}
          {neckPiece()}
        </g>
      );
    case "band":
      return (
        <g>
          <path d={body(w * 1.02, w * 1.1, h * 0.05)} fill={g("top")} />
          {[0.3, 0.48, 0.66].map((k) => (
            <rect key={k} x={-w * 0.3 + tx} y={top + h * k} width={w * 0.6} height={h * 0.04} rx={2} fill={col(C.sun)} />
          ))}
          <rect x={-w * 0.55} y={hipY - h * 0.06} width={w * 1.1} height={h * 0.1} rx={h * 0.05} fill={col(C.night)} />
          {neckPiece()}
        </g>
      );
    default:
      return (
        <g>
          <path d={body(w, w)} fill={g("top")} />
          {neckPiece()}
        </g>
      );
  }
};
