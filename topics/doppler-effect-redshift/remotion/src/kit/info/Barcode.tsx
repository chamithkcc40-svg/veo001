// Barcode - rainbow strip (violet -> red) with 4 dark absorption lines at fixed lab positions.
// shift in strip-fraction units (+ toward red, - toward blue). Use inside <svg>.
import React from "react";
import { C } from "../../theme";
import { alpha } from "../../util";

export const RAINBOW = ["#6A2BD8", "#3D5BFF", "#2FB6FF", "#29D39A", "#B8E636", "#FFD23D", "#FF8A2B", "#FF3D5A"];
export const LAB_LINES = [0.2, 0.37, 0.58, 0.79];

export const Barcode: React.FC<{
  id: string; x: number; y: number; w: number; h: number; shift?: number; lines?: number[]; label?: string; ghost?: boolean; reveal?: number; lineReveal?: number[];
}> = ({ id, x, y, w, h, shift = 0, lines = LAB_LINES, label, ghost, reveal = 1, lineReveal }) => (
  <g transform={`translate(${x},${y})`} opacity={ghost ? 0.55 : 1}>
    <defs>
      <linearGradient id={`${id}-rb`} x1="0" x2="1" y1="0" y2="0">
        {RAINBOW.map((c, i) => <stop key={i} offset={i / (RAINBOW.length - 1)} stopColor={c} />)}
      </linearGradient>
      <clipPath id={`${id}-clip`}>
        <rect x={0} y={0} width={w * reveal} height={h} rx={h * 0.22} />
      </clipPath>
    </defs>
    <rect x={-8} y={-8} width={w + 16} height={h + 16} rx={h * 0.3} fill={alpha(C.night, 0.6)} />
    <g clipPath={`url(#${id}-clip)`}>
      <rect x={0} y={0} width={w} height={h} rx={h * 0.22} fill={`url(#${id}-rb)`} />
      <rect x={0} y={0} width={w} height={h * 0.35} rx={h * 0.22} fill={alpha(C.white, 0.18)} />
      {lines.map((l, i) => {
        const lx = (l + shift) * w;
        const lr = lineReveal ? lineReveal[i] ?? 1 : 1;
        return <rect key={i} x={lx - 7} y={h * (0.5 - 0.5 * lr)} width={14} height={h * lr} rx={4} fill={C.night} opacity={0.92} />;
      })}
    </g>
    {label && (
      <text x={-24} y={h / 2 + 10} textAnchor="end" fontFamily="Fredoka" fontWeight={600} fontSize={30} fill={C.lilac} letterSpacing="0.06em">{label}</text>
    )}
  </g>
);
