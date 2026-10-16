// Railway.tsx - Dutch railway 1845, spring field. Planes:
//  L0 spring sky + clouds (0.08) | L1 far hills, atmospheric (0.2, blur 3) | L2 windmill + trees (0.45, blur 1)
//  L3 fields + track (1, subject) | L4 grass tufts foreground (1.6, blur 8)
import React from "react";
import { C } from "../../theme";
import { alpha, mix, rr } from "../../util";
import { Layer, Svg } from "../camera";

export const RAIL = { horizon: 600, track: 820 };
const X0 = -3000, X1 = 6000;

export const RailSky: React.FC<{ frame: number }> = ({ frame }) => (
  <Svg>
    <defs>
      <linearGradient id="railSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.peri} />
        <stop offset="0.65" stopColor={mix(C.peri, C.mint, 0.6)} />
        <stop offset="1" stopColor={C.mint} />
      </linearGradient>
      <radialGradient id="railSun" cx="0" cy="0" r="1">
        <stop offset="0" stopColor={C.white} stopOpacity={0.9} />
        <stop offset="0.25" stopColor={C.sunLt} stopOpacity={0.5} />
        <stop offset="1" stopColor={C.sunLt} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={X0} y={-400} width={X1 - X0} height={1100} fill="url(#railSky)" />
    <circle cx={1500} cy={200} r={300} fill="url(#railSun)" />
    <circle cx={1500} cy={200} r={60} fill={C.sunLt} />
    {Array.from({ length: 10 }).map((_, i) => {
      const x = rr("rcx" + i, X0, X1) + frame * rr("rcv" + i, 0.2, 0.5);
      const y = rr("rcy" + i, 80, 360);
      const s = rr("rcs" + i, 0.6, 1.2);
      return (
        <g key={i} transform={`translate(${x},${y}) scale(${s})`} fill={C.white} opacity={0.85}>
          <rect x={-120} y={-10} width={260} height={50} rx={25} />
          <circle cx={-30} cy={-10} r={46} />
          <circle cx={40} cy={-26} r={54} />
        </g>
      );
    })}
  </Svg>
);

export const RailHills: React.FC = () => (
  <Svg>
    {[0, 1].map((k) => {
      let d = `M${X0},${RAIL.horizon + 40}`;
      for (let x = X0; x <= X1; x += 200) d += ` Q${x + 100},${RAIL.horizon - 70 - rr(`hl${k}${x}`, 0, 70) + k * 40} ${x + 200},${RAIL.horizon - 10 + k * 30}`;
      d += ` V1200 H${X0} Z`;
      return <path key={k} d={d} fill={k === 0 ? C.farHill : mix(C.farHill, C.oliveLt, 0.45)} opacity={k === 0 ? 0.75 : 1} />;
    })}
  </Svg>
);

const Windmill: React.FC<{ x: number; y: number; frame: number; s?: number }> = ({ x, y, frame, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-50,0 L-30,-200 L30,-200 L50,0 Z" fill={C.plum} />
    <path d="M-40,-200 L0,-250 L40,-200 Z" fill={mix(C.plum, C.night, 0.3)} />
    <rect x={-12} y={-40} width={24} height={40} rx={10} fill={mix(C.plum, C.night, 0.4)} />
    <g transform={`translate(0,-205) rotate(${frame * 1.2})`}>
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <rect x={-5} y={-170} width={10} height={170} fill={mix(C.plum, C.night, 0.3)} />
          <rect x={5} y={-160} width={34} height={120} fill={alpha(C.lilac, 0.85)} />
        </g>
      ))}
      <circle r={12} fill={C.sun} />
    </g>
  </g>
);

export const RailMid: React.FC<{ frame: number }> = ({ frame }) => (
  <Svg>
    {Array.from({ length: 24 }).map((_, i) => {
      const x = X0 + i * 380 + rr("tx" + i, -60, 60);
      const s = rr("ts" + i, 0.7, 1.2);
      const sw = Math.sin(frame / 30 + i) * 2;
      return (
        <g key={i} transform={`translate(${x},${RAIL.horizon + 60}) scale(${s})`}>
          <rect x={-8} y={-80} width={16} height={80} fill={C.plum} />
          <ellipse cx={sw} cy={-130} rx={60} ry={70} fill={C.olive} />
          <ellipse cx={-14 + sw} cy={-150} rx={30} ry={30} fill={C.oliveLt} opacity={0.7} />
        </g>
      );
    })}
    <Windmill x={300} y={RAIL.horizon + 70} frame={frame} />
    <Windmill x={2600} y={RAIL.horizon + 60} frame={frame + 40} s={0.8} />
    <Windmill x={-1400} y={RAIL.horizon + 60} frame={frame + 20} s={0.9} />
  </Svg>
);

export const RailGround: React.FC = () => (
  <Svg>
    {[0, 1, 2, 3, 4].map((k) => (
      <rect key={k} x={X0} y={RAIL.horizon + 50 + k * 40} width={X1 - X0} height={600} fill={[C.oliveLt, mix(C.oliveLt, C.olive, 0.4), C.olive, mix(C.oliveLt, C.sun, 0.25), C.olive][k]} />
    ))}
    {/* tulip rows */}
    {Array.from({ length: 140 }).map((_, i) => (
      <circle key={i} cx={X0 + i * 65} cy={RAIL.horizon + 128 + (i % 3) * 8} r={7} fill={[C.red, C.sun, C.pink][i % 3]} />
    ))}
    {/* track bed */}
    <rect x={X0} y={RAIL.track - 18} width={X1 - X0} height={46} fill={mix(C.plum, C.olive, 0.3)} />
    {Array.from({ length: 160 }).map((_, i) => (
      <rect key={i} x={X0 + i * 60} y={RAIL.track - 12} width={30} height={34} rx={4} fill={C.plum} />
    ))}
    <rect x={X0} y={RAIL.track - 16} width={X1 - X0} height={8} rx={4} fill={C.lilac} />
    <rect x={X0} y={RAIL.track + 10} width={X1 - X0} height={8} rx={4} fill={C.lilac} />
    <rect x={X0} y={RAIL.track + 28} width={X1 - X0} height={400} fill={mix(C.olive, C.oliveLt, 0.3)} />
  </Svg>
);

export const RailFore: React.FC<{ frame: number }> = ({ frame }) => (
  <Svg>
    {Array.from({ length: 30 }).map((_, i) => {
      const x = X0 + i * 300 + rr("gx" + i, -80, 80);
      const sw = Math.sin(frame / 18 + i) * 6;
      return (
        <g key={i} transform={`translate(${x},1090)`} fill={mix(C.olive, C.night, 0.35)}>
          {[-30, -10, 10, 30].map((o) => <path key={o} d={`M${o - 8},0 Q${o + sw},-120 ${o + 6 + sw * 1.5},-170 Q${o + 4},-80 ${o + 8},0 Z`} />)}
        </g>
      );
    })}
  </Svg>
);

export const Railway: React.FC<{ frame: number; subject?: React.ReactNode; fore?: boolean }> = ({ frame, subject, fore = true }) => (
  <>
    <Layer depth={0.08}><RailSky frame={frame} /></Layer>
    <Layer depth={0.2} blur={3}><RailHills /></Layer>
    <Layer depth={0.45} blur={1}><RailMid frame={frame} /></Layer>
    <Layer depth={1}><RailGround /></Layer>
    <Layer depth={1}>{subject}</Layer>
    {fore && <Layer depth={1.6} blur={8}><RailFore frame={frame} /></Layer>}
  </>
);
