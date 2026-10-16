// Interiors.tsx - Cab, Light Lab, Lowell-style dome (exterior + interior), Mount Wilson-style
// dome, Chart Room, Kitchen. Each is a set of planes (Layer depths noted).
import React from "react";
import { C } from "../../theme";
import { alpha, mix, rr, noise1 } from "../../util";
import { Layer, Svg } from "../camera";
import { Dust, Stars } from "../fx";
import { RAINBOW } from "../info/Barcode";

// ---------------- CAB (Ch1) ----------------
/** windshield view: 3 parallax bands streaming past (the street rushing toward/past). */
export const CabWindow: React.FC<{ frame: number; speed?: number }> = ({ frame, speed = 1 }) => {
  const bands = [
    { y: 300, h: 260, v: 3 * speed, c: mix(C.peri, C.peach, 0.5), item: "far" },
    { y: 400, h: 260, v: 9 * speed, c: C.purple, item: "house" },
    { y: 560, h: 140, v: 22 * speed, c: mix(C.violet, C.night, 0.3), item: "post" },
  ];
  return (
    <Svg>
      <defs>
        <linearGradient id="cabSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.peri} />
          <stop offset="0.7" stopColor={C.peach} />
          <stop offset="1" stopColor={C.sun} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={760} fill="url(#cabSky)" />
      {bands.map((b, j) => (
        <g key={j}>
          {Array.from({ length: 16 }).map((_, i) => {
            const x = ((((i * 260 - frame * b.v) % 4160) + 4160) % 4160) - 600;
            if (b.item === "far") return <rect key={i} x={x} y={b.y + 60 - rr("cf" + i, 0, 100)} width={180} height={300} rx={20} fill={alpha(C.purple, 0.45)} />;
            if (b.item === "house") return <g key={i}><rect x={x} y={b.y - rr("chh" + i, 0, 80)} width={220} height={400} rx={16} fill={[C.purple, C.purpleLt, C.magenta][i % 3]} /><rect x={x + 40} y={b.y + 40} width={40} height={56} rx={10} fill={C.sunLt} opacity={0.7} /></g>;
            return <rect key={i} x={x * 1.3} y={b.y - 200} width={22} height={420} rx={11} fill={b.c} />;
          })}
        </g>
      ))}
      <rect x={0} y={640} width={1920} height={200} fill={mix(C.violet, C.night, 0.25)} />
      {Array.from({ length: 10 }).map((_, i) => {
        const x = ((((i * 420 - frame * 40 * speed) % 4200) + 4200) % 4200) - 400;
        return <rect key={i} x={x} y={700} width={200} height={10} rx={5} fill={alpha(C.lilac, 0.6)} />;
      })}
    </Svg>
  );
};

export const CabInterior: React.FC<{ frame: number; tagSwing?: number }> = ({ frame, tagSwing = 0 }) => (
  <Svg>
    {/* frame around the windshield (evenodd) */}
    <path fillRule="evenodd" d="M-200,-200 H2200 V1400 H-200 Z M240,150 Q260,90 340,90 H1580 Q1660,90 1680,150 L1760,560 Q1770,620 1700,620 H220 Q150,620 160,560 Z" fill={C.teal} />
    <path d="M240,150 Q260,90 340,90 H1580 Q1660,90 1680,150" stroke={alpha(C.white, 0.25)} strokeWidth={10} fill="none" />
    {/* glass reflection streak */}
    <path d={`M${500 + Math.sin(frame / 40) * 20},110 L${380 + Math.sin(frame / 40) * 20},600`} stroke={alpha(C.white, 0.12)} strokeWidth={60} />
    {/* dashboard */}
    <path d="M-200,640 Q960,560 2200,640 V1400 H-200 Z" fill={mix(C.teal, C.night, 0.45)} />
    <path d="M-200,640 Q960,560 2200,640" stroke={alpha(C.mint, 0.4)} strokeWidth={8} fill="none" />
    {[1300, 1440].map((x, i) => (
      <g key={x} transform={`translate(${x},740)`}>
        <circle r={54} fill={C.night} />
        <circle r={44} fill={mix(C.teal, C.night, 0.3)} />
        <rect x={-3} y={-38} width={6} height={38} rx={3} fill={i ? C.sun : C.red} transform={`rotate(${-60 + Math.sin(frame / 15 + i) * 20 + i * 50})`} />
      </g>
    ))}
    {/* rear-view mirror + dangling tag (swings) */}
    <rect x={900} y={92} width={10} height={50} fill={C.night} />
    <rect x={820} y={136} width={170} height={56} rx={20} fill={C.night} />
    <rect x={832} y={146} width={146} height={36} rx={14} fill={alpha(C.peri, 0.5)} />
    <g transform={`translate(905,192) rotate(${tagSwing})`}>
      <rect x={-2} y={0} width={4} height={70} fill={C.lilac} />
      <rect x={-24} y={68} width={48} height={60} rx={14} fill={C.sun} />
      <circle cx={0} cy={98} r={10} fill={C.magenta} />
    </g>
  </Svg>
);

// ---------------- LIGHT LAB (Ch3) ----------------
export const LabBg: React.FC<{ frame: number; strip?: number }> = ({ frame, strip = 1 }) => (
  <Svg>
    <defs>
      <radialGradient id="labBg" cx="960" cy="440" r="1300" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={C.violet} />
        <stop offset="1" stopColor={C.night} />
      </radialGradient>
      <linearGradient id="labStrip" x1="0" x2="1" y1="0" y2="0">
        {RAINBOW.map((c, i) => <stop key={i} offset={i / (RAINBOW.length - 1)} stopColor={c} />)}
      </linearGradient>
      <radialGradient id="labFloor" cx="960" cy="1000" r="900" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={C.purple} stopOpacity={0.6} />
        <stop offset="1" stopColor={C.purple} stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-1000} y={-800} width={4000} height={2800} fill="url(#labBg)" />
    {/* studio cyclorama curve */}
    <path d="M-1000,860 Q960,780 3000,860 V2000 H-1000 Z" fill={mix(C.violet, C.night, 0.4)} />
    <ellipse cx={960} cy={980} rx={1100} ry={200} fill="url(#labFloor)" />
    {/* grid on floor */}
    {Array.from({ length: 22 }).map((_, i) => (
      <path key={i} d={`M${960 + (i - 11) * 60},${830} L${960 + (i - 11) * 260},${1200}`} stroke={alpha(C.peri, 0.12)} strokeWidth={2} />
    ))}
    {/* floating rainbow strip (ambient, top) */}
    <g opacity={strip} transform={`translate(0,${Math.sin(frame / 40) * 6})`}>
      <rect x={360} y={120} width={1200} height={26} rx={13} fill="url(#labStrip)" opacity={0.85} />
      <rect x={360} y={120} width={1200} height={26} rx={13} fill="url(#labStrip)" style={{ filter: "blur(18px)" }} opacity={0.6} />
    </g>
    <Dust seed="labdust" frame={frame} n={40} color={C.lilac} opacity={0.4} size={[1.5, 3]} speed={0.5} />
  </Svg>
);

// ---------------- DOMES ----------------
export const PineHill: React.FC<{ frame: number; slit?: number; near?: boolean }> = ({ frame, slit = 0 }) => (
  <Svg>
    {/* hill */}
    <path d="M-800,820 Q600,560 960,600 Q1400,640 2800,820 V1500 H-800 Z" fill={mix(C.violet, C.night, 0.55)} />
    {/* dome building */}
    <g transform="translate(980,620)">
      <rect x={-170} y={-120} width={340} height={140} rx={10} fill={mix(C.lilac, C.violet, 0.55)} />
      <path d="M-190,-110 A190,190 0 0 1 190,-110 Z" fill={mix(C.lilac, C.violet, 0.4)} />
      <path d="M-190,-110 A190,190 0 0 1 -40,-292 L-40,-110 Z" fill={alpha(C.white, 0.12)} />
      {/* slit */}
      <rect x={-24 * (1 + slit)} y={-300} width={48 * (1 + slit)} height={190} rx={12} fill={C.night} />
      {slit > 0.2 && <rect x={-12} y={-300} width={24} height={190} fill={alpha(C.sun, 0.25 * slit)} />}
      <rect x={-34} y={-60} width={68} height={80} rx={26} fill={mix(C.violet, C.night, 0.5)} />
      <rect x={-26} y={-54} width={52} height={64} rx={20} fill={alpha(C.sun, 0.55 + 0.1 * noise1("door", frame / 8))} />
    </g>
  </Svg>
);

export const Pines: React.FC<{ seed: string; n: number; y: number; scale: [number, number]; color: string; x0?: number; x1?: number; frame: number }> = ({ seed, n, y, scale, color, x0 = -600, x1 = 2600, frame }) => (
  <Svg>
    {Array.from({ length: n }).map((_, i) => {
      const x = x0 + (i / n) * (x1 - x0) + rr(seed + "x" + i, -40, 40);
      const s = rr(seed + "s" + i, scale[0], scale[1]);
      const sw = Math.sin(frame / 35 + i) * 1.5;
      return (
        <g key={i} transform={`translate(${x},${y + rr(seed + "y" + i, -20, 30)}) scale(${s}) rotate(${sw})`} fill={color}>
          <rect x={-8} y={-30} width={16} height={40} />
          <path d="M0,-260 L70,-60 L-70,-60 Z" />
          <path d="M0,-200 L90,-10 L-90,-10 Z" />
          <path d="M0,-300 L50,-140 L-50,-140 Z" />
        </g>
      );
    })}
  </Svg>
);

export const NightSky: React.FC<{ frame: number; seed?: string }> = ({ frame, seed = "nightsky" }) => (
  <Svg>
    <defs>
      <linearGradient id={`ns-${seed}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.night} />
        <stop offset="0.7" stopColor={C.violet} />
        <stop offset="1" stopColor={mix(C.violet, C.magenta, 0.35)} />
      </linearGradient>
    </defs>
    <rect x={-1000} y={-800} width={4000} height={2400} fill={`url(#ns-${seed})`} />
    <Stars seed={seed} frame={frame} n={200} w={2800} h={900} ox={-400} oy={-100} maxR={2.6} />
    <path d="M-200,-100 Q900,300 2200,120" stroke={alpha(C.lilac, 0.06)} strokeWidth={180} fill="none" style={{ filter: "blur(30px)" }} />
  </Svg>
);

/** Dome interior: red lamp, curved dome wall, giant telescope silhouette */
export const DomeInterior: React.FC<{ frame: number; slit?: number; red?: boolean; scopeAngle?: number }> = ({ frame, slit = 1, red = true, scopeAngle = -32 }) => {
  const wall = red ? mix(C.plum, C.night, 0.35) : mix(C.violet, C.night, 0.4);
  return (
    <Svg>
      <rect x={-800} y={-800} width={3600} height={2600} fill={wall} />
      {/* dome ribs */}
      {Array.from({ length: 11 }).map((_, i) => (
        <path key={i} d={`M${960 + (i - 5) * 220},1100 Q${960 + (i - 5) * 120},200 960,-160`} stroke={alpha(C.night, 0.35)} strokeWidth={16} fill="none" />
      ))}
      {/* slit with stars */}
      <g>
        <clipPath id="slitClip"><rect x={960 - 140 * slit} y={-200} width={280 * slit} height={760} rx={20} /></clipPath>
        <rect x={960 - 140 * slit} y={-200} width={280 * slit} height={760} rx={20} fill={C.night} />
        <g clipPath="url(#slitClip)"><Stars seed="slit" frame={frame} n={50} w={400} h={760} ox={760} oy={-200} maxR={2.4} /></g>
      </g>
      {/* telescope (big) */}
      <g transform={`translate(960,900) rotate(${scopeAngle})`}>
        <rect x={-120} y={-760} width={240} height={900} rx={60} fill={mix(C.lilac, C.violet, 0.55)} />
        <rect x={-120} y={-760} width={60} height={900} rx={30} fill={alpha(C.white, 0.12)} />
        {[-600, -300, 0].map((y) => <rect key={y} x={-132} y={y} width={264} height={40} rx={12} fill={mix(C.lilac, C.violet, 0.7)} />)}
      </g>
      <path d="M700,1100 L960,820 L1220,1100 Z" fill={mix(C.violet, C.night, 0.6)} />
      {/* floor */}
      <rect x={-800} y={960} width={3600} height={600} fill={mix(wall, C.night, 0.5)} />
      {red && (
        <g>
          <circle cx={360} cy={560} r={300} fill={alpha(C.red, 0.16 + 0.03 * noise1("redlamp", frame / 6))} />
          <rect x={340} y={520} width={40} height={60} rx={14} fill={C.red} />
        </g>
      )}
    </Svg>
  );
};

// ---------------- CHART ROOM (Ch4) ----------------
export const ChartRoom: React.FC<{ frame: number }> = ({ frame }) => (
  <Svg>
    <rect x={-800} y={-600} width={3600} height={2400} fill={mix(C.plum, C.night, 0.35)} />
    {Array.from({ length: 30 }).map((_, i) => (
      <rect key={i} x={-800 + i * 130} y={-600} width={40} height={2400} fill={alpha(C.pink, 0.04)} />
    ))}
    {/* board frame */}
    <rect x={150} y={90} width={1620} height={760} rx={30} fill={mix(C.plum, C.sun, 0.25)} />
    <defs>
      <linearGradient id="boardG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.board} />
        <stop offset="1" stopColor={C.boardDk} />
      </linearGradient>
    </defs>
    <rect x={180} y={120} width={1560} height={700} rx={18} fill="url(#boardG)" />
    {/* chalk smudges */}
    {Array.from({ length: 10 }).map((_, i) => (
      <ellipse key={i} cx={rr("sm" + i, 260, 1660)} cy={rr("smy" + i, 160, 780)} rx={rr("smr" + i, 60, 160)} ry={rr("smr2" + i, 20, 50)} fill={alpha(C.chalk, 0.04)} />
    ))}
    <rect x={200} y={840} width={1520} height={26} rx={10} fill={mix(C.plum, C.sun, 0.35)} />
    {[400, 470].map((x) => <rect key={x} x={x} y={826} width={46} height={16} rx={6} fill={C.chalk} />)}
    {/* desk lamp glow */}
    <circle cx={1800} cy={60} r={420} fill={alpha(C.sun, 0.08 + 0.01 * Math.sin(frame / 9))} />
    <rect x={-800} y={900} width={3600} height={800} fill={mix(C.plum, C.night, 0.55)} />
  </Svg>
);

// ---------------- KITCHEN (Ch4) ----------------
export const Kitchen: React.FC<{ frame: number }> = ({ frame }) => (
  <Svg>
    <rect x={-800} y={-600} width={3600} height={2400} fill={C.teal} />
    {Array.from({ length: 22 }).map((_, i) => Array.from({ length: 10 }).map((__, j) => (
      <rect key={`${i}-${j}`} x={-400 + i * 140} y={-200 + j * 110} width={130} height={100} rx={16} fill={(i + j) % 2 ? mix(C.teal, C.tealLt, 0.25) : mix(C.teal, C.violet, 0.12)} />
    )))}
    {/* window */}
    <g transform="translate(1320,120)">
      <rect x={0} y={0} width={420} height={330} rx={30} fill={mix(C.plum, C.sun, 0.25)} />
      <rect x={20} y={20} width={380} height={290} rx={20} fill={mix(C.violet, C.night, 0.2)} />
      <Stars seed="kitchenwin" frame={frame} n={22} w={380} h={290} ox={20} oy={20} maxR={2} />
      <circle cx={300} cy={90} r={30} fill={C.lilac} opacity={0.85} />
      <rect x={205} y={20} width={10} height={290} fill={mix(C.plum, C.sun, 0.25)} />
    </g>
    {/* shelves */}
    <rect x={160} y={300} width={600} height={20} rx={10} fill={C.magenta} />
    {[200, 300, 420, 540, 650].map((x, i) => (
      <g key={x}>
        <rect x={x} y={220} width={70} height={80} rx={14} fill={[C.sun, C.pink, C.lilac, C.sun, C.purple][i]} />
        <rect x={x + 10} y={234} width={50} height={14} rx={7} fill={alpha(C.white, 0.35)} />
      </g>
    ))}
    {/* counter */}
    <rect x={-800} y={760} width={3600} height={50} rx={12} fill={C.magenta} />
    <rect x={-800} y={800} width={3600} height={800} fill={C.plum} />
    <rect x={-800} y={760} width={3600} height={10} rx={5} fill={alpha(C.white, 0.3)} />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={-600 + i * 320} y={850} width={280} height={300} rx={20} fill={mix(C.plum, C.night, 0.2)} />
    ))}
    <circle cx={1500} cy={300} r={500} fill={alpha(C.sun, 0.07)} />
  </Svg>
);
