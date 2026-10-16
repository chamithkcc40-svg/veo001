// Hand.tsx - rounded mitten hands with a separate thumb. Origin = wrist.
// worldRot counter-rotates so poses like thumbs-up read upright regardless of arm angle.
import React from "react";

export const Hand: React.FC<{
  kind: "open" | "fist" | "point" | "thumb" | "cup";
  r: number; skin: string; shade: string; side: "L" | "R"; worldRot: number;
}> = ({ kind, r, skin, shade, side }) => {
  const s = side === "L" ? -1 : 1;
  switch (kind) {
    case "fist":
      return (
        <g>
          <circle cx={0} cy={r * 0.6} r={r * 0.95} fill={skin} />
          <path d={`M${-r * 0.6},${r * 0.55} h${r * 1.2}`} stroke={shade} strokeWidth={r * 0.18} strokeLinecap="round" />
          <ellipse cx={s * r * 0.75} cy={r * 0.25} rx={r * 0.32} ry={r * 0.45} fill={skin} />
        </g>
      );
    case "point":
      return (
        <g>
          <circle cx={0} cy={r * 0.55} r={r * 0.85} fill={skin} />
          <rect x={-r * 0.22} y={r * 0.6} width={r * 0.44} height={r * 1.6} rx={r * 0.22} fill={skin} />
          <ellipse cx={s * r * 0.7} cy={r * 0.3} rx={r * 0.3} ry={r * 0.42} fill={shade} />
        </g>
      );
    case "thumb":
      return (
        <g>
          <rect x={-r * 0.85} y={r * 0.05} width={r * 1.7} height={r * 1.3} rx={r * 0.6} fill={skin} />
          <path d={`M${-r * 0.5},${r * 0.55} h${r} M${-r * 0.5},${r * 0.9} h${r}`} stroke={shade} strokeWidth={r * 0.14} strokeLinecap="round" />
          {/* thumb sticks out opposite to arm direction = up when arm is raised forward */}
          <rect x={-r * 0.24 + s * r * 0.55} y={-r * 0.95} width={r * 0.48} height={r * 1.15} rx={r * 0.24} fill={skin} />
        </g>
      );
    case "cup":
      return (
        <g>
          <path d={`M${-r * 0.9},${r * 0.1} Q${-r},${r * 1.6} ${0},${r * 1.6} Q${r},${r * 1.6} ${r * 0.9},${r * 0.1} Q0,${r * 0.6} ${-r * 0.9},${r * 0.1} Z`} fill={skin} />
          <path d={`M${-r * 0.55},${r * 0.75} Q0,${r * 1.15} ${r * 0.55},${r * 0.75}`} stroke={shade} strokeWidth={r * 0.14} fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <ellipse cx={0} cy={r * 0.75} rx={r * 0.9} ry={r * 1.05} fill={skin} />
          <ellipse cx={s * r * 0.85} cy={r * 0.35} rx={r * 0.3} ry={r * 0.5} fill={skin} transform={`rotate(${s * -25},${s * r * 0.85},${r * 0.35})`} />
          <path d={`M${-r * 0.35},${r * 1.3} v${r * 0.35} M${r * 0.05},${r * 1.38} v${r * 0.35}`} stroke={shade} strokeWidth={r * 0.12} strokeLinecap="round" />
        </g>
      );
  }
};
