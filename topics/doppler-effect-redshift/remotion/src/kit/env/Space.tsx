// Space.tsx - deep space multiplane: L0 night gradient, L1 nebula fog (drifting blobs, blur),
// L2 far star dust (0.15), L3 near stars (0.4), subject plane (galaxies), L5 foreground dust motes (blur).
import React from "react";
import { C } from "../../theme";
import { alpha, mix, rr } from "../../util";
import { Layer, Svg } from "../camera";
import { Dust, Stars } from "../fx";

export const SpaceBg: React.FC<{ frame: number; hue?: string }> = ({ frame, hue = C.violet }) => (
  <Svg>
    <defs>
      <radialGradient id={`spaceBg-${hue}`} cx="960" cy="420" r="1400" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={mix(hue, C.night, 0.35)} />
        <stop offset="1" stopColor={C.night} />
      </radialGradient>
    </defs>
    <rect x={-2000} y={-2000} width={6000} height={5000} fill={`url(#spaceBg-${hue})`} />
  </Svg>
);

export const Nebula: React.FC<{ frame: number; tint?: string; tint2?: string }> = ({ frame, tint = C.magenta, tint2 = C.purple }) => (
  <Svg style={{ filter: "blur(60px)" }}>
    {Array.from({ length: 7 }).map((_, i) => (
      <ellipse key={i}
        cx={rr("nx" + i, -300, 2200) + Math.sin(frame / 120 + i) * 40}
        cy={rr("ny" + i, -100, 1100) + Math.cos(frame / 140 + i) * 30}
        rx={rr("nrx" + i, 300, 650)} ry={rr("nry" + i, 160, 380)}
        fill={i % 2 ? alpha(tint, 0.22) : alpha(tint2, 0.3)} transform={`rotate(${rr("nr" + i, -30, 30)})`} />
    ))}
  </Svg>
);

export const Space: React.FC<{ frame: number; subject?: React.ReactNode; hue?: string; nebula?: [string, string]; dust?: boolean; starO?: number }> = ({ frame, subject, hue, nebula, dust = true, starO = 1 }) => (
  <>
    <Layer depth={0}><SpaceBg frame={frame} hue={hue} /></Layer>
    <Layer depth={0.06}><Nebula frame={frame} tint={nebula?.[0]} tint2={nebula?.[1]} /></Layer>
    <Layer depth={0.15}><Svg><g opacity={starO}><Stars seed="farstars" frame={frame} n={260} w={3200} h={2000} ox={-640} oy={-460} maxR={1.6} opacity={0.7} /></g></Svg></Layer>
    <Layer depth={0.4}><Svg><g opacity={starO}><Stars seed="nearstars" frame={frame} n={90} w={3200} h={2000} ox={-640} oy={-460} maxR={3} /></g></Svg></Layer>
    <Layer depth={1}>{subject}</Layer>
    {dust && <Layer depth={1.7} blur={4}><Svg><Dust seed="spacedust" frame={frame} n={22} area={[-400, -300, 2700, 1700]} size={[2, 5]} color={C.lilac} opacity={0.35} speed={0.8} /></Svg></Layer>}
  </>
);
