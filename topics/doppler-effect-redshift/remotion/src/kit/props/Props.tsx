// Props.tsx - reusable props drawn once (no outlines; cel shadow + rim + glows).
// All are svg <g> elements with origin noted per prop.
import React from "react";
import { C } from "../../theme";
import { alpha, mix } from "../../util";

/** Generic ambulance (no real-world livery or emblem). Side view facing LEFT (drives R->L by default).
 *  Origin: ground contact centre. Length ~ 520 at scale 1. flash: 0..1 light-bar phase. wheel: rotation deg. */
export const Ambulance: React.FC<{ x?: number; y?: number; scale?: number; flash: number; wheel: number; facing?: -1 | 1; bounce?: number; driver?: React.ReactNode; tilt?: number }> = ({ x = 0, y = 0, scale = 1, flash, wheel, facing = -1, bounce = 0, driver, tilt = 0 }) => {
  const body = C.lilac;
  const bodySh = mix(C.lilac, C.violet, 0.22);
  const stripe = C.red;
  const glass = mix(C.peri, C.night, 0.35);
  const on = Math.sin(flash * Math.PI * 2) > 0;
  const wheelG = (cx: number) => (
    <g transform={`translate(${cx},-34)`}>
      <circle r={44} fill={C.night} />
      <g transform={`rotate(${wheel})`}>
        <circle r={24} fill={mix(C.lilac, C.violet, 0.4)} />
        {[0, 60, 120].map((a) => <rect key={a} x={-3} y={-22} width={6} height={44} rx={3} fill={C.night} transform={`rotate(${a})`} />)}
      </g>
      <circle r={7} fill={C.lilac} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${scale * (facing === -1 ? 1 : -1)},${scale})`}>
      <ellipse cx={0} cy={4} rx={290} ry={22} fill={alpha(C.night, 0.3)} />
      <g transform={`translate(0,${bounce}) rotate(${tilt})`}>
        {/* box body (rear) */}
        <rect x={-110} y={-290} width={370} height={240} rx={34} fill={body} />
        <rect x={-110} y={-120} width={370} height={70} rx={20} fill={bodySh} />
        {/* cab (front, left) */}
        <path d={`M-110,-50 L-110,-230 Q-110,-250 -130,-250 L-180,-250 Q-215,-250 -235,-215 L-265,-150 Q-275,-130 -275,-110 L-275,-70 Q-275,-50 -255,-50 Z`} fill={body} />
        <path d={`M-118,-238 L-176,-238 Q-202,-238 -216,-212 L-240,-160 L-118,-160 Z`} fill={glass} />
        <path d={`M-170,-232 L-196,-170`} stroke={alpha(C.white, 0.35)} strokeWidth={10} strokeLinecap="round" />
        {driver && <g transform="translate(-160,-160)">{driver}</g>}
        {/* stripe */}
        <rect x={-275} y={-138} width={535} height={30} fill={stripe} />
        <rect x={-275} y={-108} width={535} height={8} fill={mix(stripe, C.night, 0.3)} />
        {/* plain cross-free badge: a neutral rounded square with a wave glyph (no emergency emblem) */}
        <rect x={40} y={-250} width={110} height={90} rx={22} fill={alpha(C.red, 0.12)} />
        <path d="M58,-205 q12,-16 24,0 t24,0 t24,0" stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* rear window + door seam */}
        <rect x={190} y={-258} width={50} height={70} rx={12} fill={glass} />
        <rect x={20} y={-280} width={5} height={220} fill={alpha(C.violet, 0.25)} />
        {/* rim light top */}
        <rect x={-100} y={-290} width={350} height={10} rx={5} fill={alpha(C.white, 0.6)} />
        {/* bumper + lamp */}
        <rect x={-285} y={-80} width={40} height={26} rx={10} fill={mix(C.lilac, C.violet, 0.45)} />
        <ellipse cx={-268} cy={-112} rx={10} ry={12} fill={C.sun} />
        <circle cx={-268} cy={-112} r={34} fill={alpha(C.sun, 0.25)} />
        {/* light bar */}
        <rect x={-100} y={-318} width={130} height={28} rx={12} fill={mix(C.lilac, C.violet, 0.3)} />
        <rect x={-92} y={-314} width={52} height={20} rx={8} fill={on ? C.red : mix(C.red, C.night, 0.5)} />
        <rect x={-30} y={-314} width={52} height={20} rx={8} fill={!on ? C.blue : mix(C.blue, C.night, 0.5)} />
        <circle cx={on ? -66 : -4} cy={-304} r={70} fill={alpha(on ? C.red : C.blue, 0.28)} />
        <circle cx={on ? -66 : -4} cy={-304} r={30} fill={alpha(C.white, 0.35)} />
        {/* siren horn (rings emit from here: local (-35,-304)) */}
        {wheelG(-170)}
        {wheelG(170)}
      </g>
    </g>
  );
};
export const AMB_SIREN = { x: -35, y: -304 }; // local siren point (facing -1, scale 1)

/** brass horn held at mouth; origin = mouthpiece. Bell points +x. */
export const Horn: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <path d="M0,-5 L70,-8 Q100,-10 120,-34 L124,36 Q100,10 70,8 L0,5 Z" fill={C.sun} />
    <ellipse cx={122} cy={1} rx={10} ry={36} fill={mix(C.sun, C.plum, 0.35)} />
    <path d="M10,-3 L68,-5" stroke={alpha(C.white, 0.6)} strokeWidth={3} strokeLinecap="round" />
    <circle cx={40} cy={0} r={9} fill={mix(C.sun, C.plum, 0.25)} />
  </g>
);

export const Quill: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale}) rotate(-35)`}>
    <path d="M0,0 L-6,-110 Q10,-150 28,-160 Q20,-110 6,-6 Z" fill={C.lilac} />
    <path d="M-2,-20 L14,-140" stroke={alpha(C.violet, 0.45)} strokeWidth={2} />
    <path d="M-1,0 L1,16 L3,0 Z" fill={C.night} />
  </g>
);

/** candle with flame flicker. origin = base. flick = frame */
export const Candle: React.FC<{ frame: number; scale?: number; lit?: number }> = ({ frame, scale = 1, lit = 1 }) => {
  const fl = Math.sin(frame / 2.3) * 0.08 + Math.sin(frame / 5.7) * 0.06;
  return (
    <g transform={`scale(${scale})`}>
      <ellipse cx={0} cy={0} rx={46} ry={10} fill={mix(C.sun, C.plum, 0.5)} />
      <rect x={-18} y={-110} width={36} height={110} rx={8} fill={C.lilac} />
      <rect x={6} y={-110} width={12} height={110} rx={6} fill={mix(C.lilac, C.plum, 0.25)} />
      <path d="M-18,-104 q8,16 4,30 q-3,-12 -4,-30" fill={C.white} opacity={0.8} />
      <rect x={-2} y={-124} width={4} height={14} fill={C.night} />
      <g opacity={lit} transform={`translate(0,-126) scale(${1 + fl},${1 - fl * 1.6})`}>
        <circle r={150} fill={alpha(C.sun, 0.12)} />
        <circle r={60} fill={alpha(C.sun, 0.28)} />
        <path d="M0,-46 Q16,-14 10,0 Q0,8 -10,0 Q-16,-14 0,-46 Z" fill={C.sun} />
        <path d="M0,-24 Q7,-6 4,0 Q0,4 -4,0 Q-7,-6 0,-24 Z" fill={C.white} />
      </g>
    </g>
  );
};

/** suitcase; origin bottom-centre; open: 0 closed .. 1 lid open */
export const Suitcase: React.FC<{ open?: number; scale?: number }> = ({ open = 0, scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <rect x={-120} y={-150} width={240} height={150} rx={18} fill={C.plum} />
    <rect x={-120} y={-150} width={240} height={30} rx={12} fill={mix(C.plum, C.sun, 0.25)} />
    <rect x={-120} y={-40} width={240} height={40} rx={12} fill={mix(C.plum, C.night, 0.3)} />
    {[-70, 70].map((x) => <rect key={x} x={x - 8} y={-150} width={16} height={150} fill={mix(C.plum, C.night, 0.4)} />)}
    <g transform={`rotate(${-open * 70},-120,-150)`}>
      <rect x={-120} y={-170} width={240} height={26} rx={12} fill={mix(C.plum, C.sun, 0.15)} />
    </g>
    <rect x={-40} y={-196} width={80} height={36} rx={14} fill="none" stroke={C.night} strokeWidth={10} />
    {[-20, 20].map((x) => <rect key={x} x={x - 9} y={-160} width={18} height={18} rx={4} fill={C.sun} />)}
  </g>
);

/** glass photographic plate; origin centre */
export const GlassPlate: React.FC<{ w?: number; h?: number; children?: React.ReactNode; glow?: number }> = ({ w = 170, h = 120, children, glow = 0 }) => (
  <g>
    {glow > 0 && <rect x={-w / 2 - 20} y={-h / 2 - 20} width={w + 40} height={h + 40} rx={24} fill={alpha(C.peri, 0.25 * glow)} />}
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={alpha(C.night, 0.82)} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="none" stroke={alpha(C.lilac, 0.75)} strokeWidth={4} />
    {children}
    <path d={`M${-w / 2 + 12},${-h / 2 + 10} L${-w / 2 + 50},${-h / 2 + 10}`} stroke={alpha(C.white, 0.6)} strokeWidth={5} strokeLinecap="round" />
  </g>
);

export const Magnifier: React.FC<{ r?: number; children?: React.ReactNode; id: string }> = ({ r = 90, children, id }) => (
  <g>
    <defs><clipPath id={id}><circle r={r} /></clipPath></defs>
    <rect x={r * 0.62} y={r * 0.62} width={r * 0.3} height={r * 1.1} rx={r * 0.15} fill={C.plum} transform={`rotate(-45,${r * 0.77},${r * 0.77})`} />
    <circle r={r} fill={alpha(C.peri, 0.2)} />
    <g clipPath={`url(#${id})`}>{children}</g>
    <circle r={r} fill="none" stroke={C.sun} strokeWidth={r * 0.14} />
    <path d={`M${-r * 0.55},${-r * 0.3} A${r * 0.65},${r * 0.65} 0 0 1 ${-r * 0.2},${-r * 0.62}`} stroke={alpha(C.white, 0.7)} strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />
  </g>
);

/** waving flag on a stick: origin = grip; wave phase = frame */
export const Flag: React.FC<{ frame: number; color?: string }> = ({ frame, color = C.red }) => {
  const a = Math.sin(frame / 3.5) * 10;
  const b = Math.sin(frame / 3.5 - 1.2) * 14;
  return (
    <g>
      <rect x={-4} y={-150} width={8} height={170} rx={4} fill={C.plum} />
      <path d={`M4,-148 C40,${-160 + a} 70,${-140 + b} 104,${-150 + b} L104,${-90 + b} C70,${-80 + b} 40,${-100 + a} 4,-90 Z`} fill={color} />
    </g>
  );
};

export const Notebook: React.FC = () => (
  <g transform="rotate(-10)">
    <rect x={-40} y={-60} width={80} height={100} rx={8} fill={C.lilac} />
    <rect x={-40} y={-60} width={12} height={100} rx={4} fill={C.plum} />
    {[-40, -24, -8, 8, 24].map((y) => <rect key={y} x={-20} y={y} width={50} height={4} rx={2} fill={alpha(C.violet, 0.4)} />)}
  </g>
);

/** big refracting telescope icon/prop; origin = mount base */
export const Telescope: React.FC<{ angle?: number; scale?: number; color?: string }> = ({ angle = -35, scale = 1, color = C.lilac }) => (
  <g transform={`scale(${scale})`}>
    <path d="M-60,0 L0,-90 L60,0" stroke={mix(color, C.violet, 0.4)} strokeWidth={14} fill="none" strokeLinecap="round" />
    <g transform={`translate(0,-96) rotate(${angle})`}>
      <rect x={-150} y={-26} width={300} height={52} rx={26} fill={color} />
      <rect x={-150} y={-26} width={300} height={16} rx={8} fill={alpha(C.white, 0.35)} />
      <rect x={130} y={-36} width={40} height={72} rx={14} fill={mix(color, C.violet, 0.25)} />
      <rect x={-180} y={-14} width={40} height={28} rx={8} fill={mix(color, C.violet, 0.4)} />
    </g>
    <circle cy={-96} r={16} fill={C.sun} />
  </g>
);

/** steam locomotive + open flatcar (side view, facing right). origin: ground under the loco centre */
export const Train: React.FC<{ wheel: number; scale?: number; car?: React.ReactNode; smoke?: number }> = ({ wheel, scale = 1, car }) => {
  const w = (cx: number, r: number) => (
    <g transform={`translate(${cx},${-r})`}>
      <circle r={r} fill={C.night} />
      <g transform={`rotate(${wheel})`}>
        <circle r={r * 0.6} fill={C.magenta} />
        {[0, 45, 90, 135].map((a) => <rect key={a} x={-2.5} y={-r * 0.85} width={5} height={r * 1.7} fill={C.night} transform={`rotate(${a})`} />)}
      </g>
      <circle r={r * 0.15} fill={C.sun} />
    </g>
  );
  return (
    <g transform={`scale(${scale})`}>
      {/* flatcar (behind, to the left) */}
      <g transform="translate(-520,0)">
        <rect x={-230} y={-96} width={460} height={34} rx={10} fill={C.plum} />
        <rect x={-230} y={-104} width={460} height={12} rx={6} fill={mix(C.plum, C.sun, 0.3)} />
        {[-150, 150].map((x) => <g key={x}>{w(x, 34)}</g>)}
        <g transform="translate(0,-104)">{car}</g>
      </g>
      <rect x={-300} y={-80} width={90} height={10} rx={5} fill={C.night} />
      {/* loco */}
      <rect x={-220} y={-250} width={150} height={180} rx={18} fill={C.violet} />
      <rect x={-205} y={-232} width={60} height={60} rx={10} fill={C.sun} opacity={0.85} />
      <rect x={-240} y={-268} width={190} height={30} rx={12} fill={C.night} />
      <rect x={-80} y={-190} width={300} height={120} rx={58} fill={C.purple} />
      <rect x={-80} y={-190} width={300} height={22} rx={11} fill={alpha(C.white, 0.22)} />
      <rect x={130} y={-290} width={44} height={110} rx={10} fill={C.night} />
      <rect x={118} y={-300} width={68} height={22} rx={10} fill={C.night} />
      <circle cx={40} cy={-196} r={22} fill={C.sun} />
      <path d="M220,-90 L270,-60 L220,-60 Z" fill={C.magenta} />
      {[-150, -10, 120].map((x) => <g key={x}>{w(x, x === -10 ? 56 : 42)}</g>)}
    </g>
  );
};
export const TRAIN_STACK = { x: 152, y: -300 };

export const Ship: React.FC<{ scale?: number; color?: string }> = ({ scale = 1, color = C.night }) => (
  <g transform={`scale(${scale})`} fill={color}>
    <path d="M-90,0 L90,0 L70,26 L-74,26 Z" />
    <rect x={-6} y={-110} width={6} height={110} />
    <rect x={40} y={-90} width={5} height={90} />
    <path d="M0,-104 L60,-40 L0,-30 Z" />
    <path d="M-6,-100 L-70,-30 L-6,-26 Z" />
  </g>
);

/** stamp check mark */
export const StampCheck: React.FC<{ color?: string; size?: number }> = ({ color = C.mint, size = 120 }) => (
  <g>
    <circle r={size} fill="none" stroke={color} strokeWidth={size * 0.12} />
    <circle r={size * 0.82} fill={alpha(color, 0.12)} />
    <path d={`M${-size * 0.45},0 L${-size * 0.12},${size * 0.32} L${size * 0.5},${-size * 0.35}`} stroke={color} strokeWidth={size * 0.18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** big friendly X */
export const BigX: React.FC<{ size?: number; color?: string; p?: number }> = ({ size = 160, color = C.red, p = 1 }) => (
  <g>
    <path d={`M${-size},${-size} L${-size + 2 * size * Math.min(1, p * 2)},${-size + 2 * size * Math.min(1, p * 2)}`} stroke={color} strokeWidth={size * 0.28} strokeLinecap="round" />
    {p > 0.5 && <path d={`M${size},${-size} L${size - 2 * size * Math.min(1, (p - 0.5) * 2)},${-size + 2 * size * Math.min(1, (p - 0.5) * 2)}`} stroke={color} strokeWidth={size * 0.28} strokeLinecap="round" />}
  </g>
);

/** small spiral icon (twist sting) */
export const SpiralIcon: React.FC<{ r?: number; color?: string; rot?: number }> = ({ r = 60, color = C.sun, rot = 0 }) => {
  let d = "";
  for (let i = 0; i <= 80; i++) {
    const th = (i / 80) * Math.PI * 5;
    const rad = (i / 80) * r;
    d += `${i ? "L" : "M"}${Math.cos(th) * rad},${Math.sin(th) * rad}`;
  }
  return <path d={d} stroke={color} strokeWidth={r * 0.14} fill="none" strokeLinecap="round" transform={`rotate(${rot})`} />;
};

/** steering wheel; origin centre */
export const SteeringWheel: React.FC<{ r?: number; rot?: number }> = ({ r = 120, rot = 0 }) => (
  <g transform={`rotate(${rot})`}>
    <circle r={r} fill="none" stroke={C.night} strokeWidth={r * 0.18} />
    <circle r={r} fill="none" stroke={alpha(C.lilac, 0.25)} strokeWidth={r * 0.04} transform="translate(-2,-3)" />
    {[90, 210, 330].map((a) => <rect key={a} x={-r * 0.06} y={0} width={r * 0.12} height={r * 0.9} rx={r * 0.05} fill={C.night} transform={`rotate(${a})`} />)}
    <circle r={r * 0.24} fill={C.violet} />
  </g>
);

/** gauge / speedometer; origin centre. value 0..1 */
export const Speedometer: React.FC<{ value: number; r?: number; color?: string; label?: string }> = ({ value, r = 110, color = C.white, label }) => {
  const a0 = -210, a1 = 30;
  const a = a0 + (a1 - a0) * value;
  const arc = (from: number, to: number, rad: number) => {
    const p0 = [Math.cos((from * Math.PI) / 180) * rad, Math.sin((from * Math.PI) / 180) * rad];
    const p1 = [Math.cos((to * Math.PI) / 180) * rad, Math.sin((to * Math.PI) / 180) * rad];
    return `M${p0[0]},${p0[1]} A${rad},${rad} 0 ${to - from > 180 ? 1 : 0} 1 ${p1[0]},${p1[1]}`;
  };
  return (
    <g>
      <circle r={r} fill={alpha(C.night, 0.8)} />
      <path d={arc(a0, a1, r * 0.78)} stroke={alpha(C.lilac, 0.3)} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
      <path d={arc(a0, a, r * 0.78)} stroke={color} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
      {Array.from({ length: 9 }).map((_, i) => {
        const t = a0 + ((a1 - a0) * i) / 8;
        return <rect key={i} x={r * 0.55} y={-2} width={r * 0.1} height={4} rx={2} fill={alpha(C.lilac, 0.6)} transform={`rotate(${t})`} />;
      })}
      <g transform={`rotate(${a})`}>
        <rect x={0} y={-r * 0.04} width={r * 0.68} height={r * 0.08} rx={r * 0.04} fill={C.sun} />
      </g>
      <circle r={r * 0.12} fill={C.sun} />
      {label && <text y={r * 0.55} textAnchor="middle" fontFamily="Fredoka" fontWeight={600} fontSize={r * 0.2} fill={C.lilac}>{label}</text>}
    </g>
  );
};
