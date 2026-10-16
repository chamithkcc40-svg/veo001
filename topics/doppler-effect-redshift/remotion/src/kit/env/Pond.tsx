// Pond.tsx - top-down pond multiplane: L0 deep water gradient, L1 caustic stripes (animated),
// L2 lily pads (bob), L3 subject (rings, Skipper), L4 drifting leaves, L5 reeds at frame edge (blur).
import React from "react";
import { C } from "../../theme";
import { alpha, mix, rr } from "../../util";
import { Layer, Svg } from "../camera";

const PX0 = -1600, PX1 = 4200;

export const PondWater: React.FC<{ frame: number }> = ({ frame }) => (
  <Svg>
    <defs>
      <radialGradient id="pondDeep" cx="960" cy="540" r="1500" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={C.tealLt} />
        <stop offset="0.55" stopColor={C.teal} />
        <stop offset="1" stopColor={mix(C.teal, C.violet, 0.45)} />
      </radialGradient>
    </defs>
    <rect x={PX0} y={-900} width={PX1 - PX0} height={2900} fill="url(#pondDeep)" />
    {/* seeded dotted texture (6-10 %) */}
    {Array.from({ length: 220 }).map((_, i) => (
      <circle key={i} cx={rr("pd" + i, PX0, PX1)} cy={rr("pdy" + i, -900, 2000)} r={rr("pdr" + i, 2, 5)} fill={alpha(C.mint, 0.08)} />
    ))}
    {/* caustics */}
    {Array.from({ length: 26 }).map((_, i) => {
      const y = -700 + i * 110;
      let d = "";
      for (let k = 0; k <= 48; k++) {
        const x = PX0 + k * 120;
        const yy = y + Math.sin(k * 0.7 + frame / 30 + i) * 18 + Math.sin(k * 0.23 - frame / 45) * 22;
        d += `${k ? "L" : "M"}${x},${yy}`;
      }
      return <path key={i} d={d} stroke={alpha(C.mint, 0.18 + 0.07 * Math.sin(frame / 20 + i))} strokeWidth={rr("cw" + i, 5, 12)} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
  </Svg>
);

const LilyPad: React.FC<{ x: number; y: number; r: number; rot: number; flower?: boolean }> = ({ x, y, r, rot, flower }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <ellipse cx={8} cy={10} rx={r} ry={r * 0.95} fill={alpha(C.night, 0.18)} />
    <path d={`M0,0 L${r},${-r * 0.18} A${r},${r} 0 1 1 ${r},${r * 0.18} Z`} fill={C.olive} />
    <path d={`M0,0 L${r * 0.98},${-r * 0.16} A${r},${r} 0 0 0 ${-r * 0.7},${-r * 0.7} Z`} fill={C.oliveLt} opacity={0.75} />
    {[40, 110, 180, 250, 300].map((a) => (
      <path key={a} d={`M0,0 L${Math.cos((a * Math.PI) / 180) * r * 0.85},${Math.sin((a * Math.PI) / 180) * r * 0.85}`} stroke={alpha(C.night, 0.18)} strokeWidth={3} />
    ))}
    {flower && (
      <g transform={`translate(${-r * 0.3},${r * 0.2})`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx={0} cy={-18} rx={10} ry={20} fill={i % 2 ? C.pink : C.lilac} transform={`rotate(${i * 45})`} />
        ))}
        <circle r={10} fill={C.sun} />
      </g>
    )}
  </g>
);

export const PondPads: React.FC<{ frame: number }> = ({ frame }) => {
  const pads = [
    [120, 140, 120, 20, true], [330, 60, 80, 120], [1720, 180, 130, 200, true], [1840, 420, 90, 60],
    [140, 900, 140, 300], [400, 1010, 90, 160, true], [1650, 960, 120, 260], [1880, 770, 70, 10],
    [-200, 520, 110, 90], [2300, 600, 120, 30, true], [2700, 240, 100, 180], [2900, 900, 130, 330], [3300, 500, 110, 70, true], [2550, 1050, 80, 210],
  ] as [number, number, number, number, boolean?][];
  return (
    <Svg>
      {pads.map(([x, y, r, rot, fl], i) => (
        <LilyPad key={i} x={x + Math.sin(frame / 40 + i) * 4} y={y + Math.cos(frame / 46 + i) * 4} r={r} rot={rot + Math.sin(frame / 60 + i) * 3} flower={fl} />
      ))}
    </Svg>
  );
};

export const PondLeaves: React.FC<{ frame: number }> = ({ frame }) => (
  <Svg>
    {Array.from({ length: 7 }).map((_, i) => {
      const x = rr("lx" + i, -300, 3200) + frame * rr("lv" + i, 0.3, 0.7);
      const y = rr("ly" + i, 80, 1000) + Math.sin(frame / 50 + i) * 20;
      const rot = frame * rr("lr" + i, -0.4, 0.4) + i * 40;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
          <ellipse cx={4} cy={6} rx={34} ry={14} fill={alpha(C.night, 0.15)} />
          <path d="M-34,0 Q0,-22 34,0 Q0,22 -34,0 Z" fill={i % 2 ? C.sun : mix(C.sun, C.magenta, 0.35)} />
          <path d="M-30,0 L30,0" stroke={alpha(C.plum, 0.5)} strokeWidth={2} />
        </g>
      );
    })}
  </Svg>
);

export const PondReeds: React.FC<{ frame: number }> = ({ frame }) => (
  <Svg>
    {Array.from({ length: 40 }).map((_, i) => {
      const edge = i % 4;
      const t = rr("rt" + i, 0, 1);
      const x = edge === 0 ? -40 + rr("re" + i, 0, 80) : edge === 1 ? 1880 + rr("re" + i, 0, 80) : t * 1920;
      const y = edge === 2 ? -30 + rr("re" + i, 0, 60) : edge === 3 ? 1100 + rr("re" + i, 0, 60) : t * 1080;
      const sw = Math.sin(frame / 22 + i) * 6;
      return (
        <g key={i} transform={`translate(${x + sw},${y})`}>
          <ellipse rx={rr("rr" + i, 26, 50)} ry={rr("rr2" + i, 12, 22)} fill={mix(C.olive, C.night, 0.4)} transform={`rotate(${rr("ra" + i, 0, 180)})`} />
          <circle r={rr("rc" + i, 8, 16)} fill={mix(C.plum, C.night, 0.2)} cx={8} cy={-6} />
        </g>
      );
    })}
  </Svg>
);

export const Pond: React.FC<{ frame: number; subject?: React.ReactNode; dof?: number }> = ({ frame, subject, dof = 1 }) => (
  <>
    <Layer depth={0.7}><PondWater frame={frame} /></Layer>
    <Layer depth={0.85}><PondPads frame={frame} /></Layer>
    <Layer depth={1}>{subject}</Layer>
    <Layer depth={1.15}><PondLeaves frame={frame} /></Layer>
    <Layer depth={1.6} blur={9 * dof}><PondReeds frame={frame} /></Layer>
  </>
);
