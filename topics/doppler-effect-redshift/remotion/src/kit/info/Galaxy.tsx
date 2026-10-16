// Galaxy - the Glowing Galaxy (07 sec. 4): soft two-arm spiral with a cream core.
// shift: -1 blue (approaching) .. 0 cream .. +1 red (receding) tints the OUTER glow.
// Spiral arms are dotted star-clouds placed along logarithmic spirals (seeded), rotating slowly.
import React from "react";
import { C } from "../../theme";
import { alpha, mix, rr, shiftColor } from "../../util";

export const Galaxy: React.FC<{
  id: string; x: number; y: number; r: number; frame: number; shift?: number; tilt?: number; // tilt: 0 face-on .. 0.8 edge-ish
  rot?: number; spin?: number; arms?: number; glow?: number; opacity?: number; dots?: number; armColor?: string;
}> = ({ id, x, y, r, frame, shift = 0, tilt = 0.25, rot = 0, spin = 0.08, arms = 2, glow = 1, opacity = 1, dots = 70, armColor }) => {
  const outer = shiftColor(shift, C.blue, mix(C.core, C.peri, 0.35), C.red);
  const armC = armColor ?? mix(C.lilac, outer, 0.45);
  const sy = 1 - tilt;
  const ang = rot + frame * spin;
  const pts: React.ReactNode[] = [];
  for (let a = 0; a < arms; a++) {
    for (let i = 0; i < dots; i++) {
      const u = i / dots;
      const th = u * Math.PI * 2.6 + (a * Math.PI * 2) / arms;
      const rad = r * (0.12 + u * 0.88);
      const jitter = rr(`${id}j${a}-${i}`, -0.09, 0.09) * r;
      const px = Math.cos(th) * (rad + jitter);
      const py = Math.sin(th) * (rad + jitter);
      const s = rr(`${id}s${a}-${i}`, 0.8, 2.4) * (r / 120) * (1 - u * 0.5);
      pts.push(<circle key={`${a}-${i}`} cx={px} cy={py} r={Math.max(0.6, s * 2.2)} fill={i % 7 === 0 ? C.white : armC} opacity={0.35 + (1 - u) * 0.5} />);
    }
  }
  // smooth arm ribbons
  const ribbons = Array.from({ length: arms }).map((_, a) => {
    let d = "";
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const th = u * Math.PI * 2.6 + (a * Math.PI * 2) / arms;
      const rad = r * (0.12 + u * 0.88);
      d += `${i ? "L" : "M"}${Math.cos(th) * rad},${Math.sin(th) * rad}`;
    }
    return <path key={a} d={d} stroke={armC} strokeWidth={r * 0.16} strokeLinecap="round" fill="none" opacity={0.28} style={{ filter: `blur(${r * 0.05}px)` }} />;
  });
  return (
    <g transform={`translate(${x},${y})`} opacity={opacity}>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={outer} stopOpacity={0.55 * glow} />
          <stop offset="0.45" stopColor={outer} stopOpacity={0.22 * glow} />
          <stop offset="1" stopColor={outer} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-core`}>
          <stop offset="0" stopColor={C.white} stopOpacity={1} />
          <stop offset="0.3" stopColor={C.core} stopOpacity={0.95} />
          <stop offset="1" stopColor={C.core} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={0} rx={r * 2.1} ry={r * 2.1 * Math.max(0.45, sy)} fill={`url(#${id}-halo)`} />
      <g transform={`scale(1,${sy}) rotate(${ang})`}>
        {ribbons}
        {pts}
      </g>
      <ellipse cx={0} cy={0} rx={r * 0.42} ry={r * 0.42 * Math.max(0.5, sy)} fill={`url(#${id}-core)`} />
      <circle cx={0} cy={0} r={r * 0.08} fill={C.white} />
    </g>
  );
};

/** tiny "colours exaggerated" honesty tag */
export const ExaggeratedTag: React.FC<{ opacity?: number; x?: number; y?: number; text?: string }> = ({ opacity = 1, x = 1824, y = 860, text = "colours exaggerated" }) => (
  <div style={{
    position: "absolute", right: 1920 - x, top: y, opacity, fontFamily: "Nunito", fontWeight: 700, fontSize: 22,
    color: alpha(C.lilac, 0.92), letterSpacing: "0.02em", padding: "6px 14px", borderRadius: 999,
    background: alpha(C.night, 0.55), fontStyle: "italic",
  }}>{text}</div>
);
