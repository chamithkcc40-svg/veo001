// Face.tsx - solid dark oval eyes with one specular dot, skin lids for blinks,
// pill brows, simple rounded mouths, blush ellipses (STYLE_BIBLE 6).
import React from "react";
import { C } from "../../theme";
import { alpha } from "../../util";
import { Expression } from "./types";

type Spec = {
  eyeH: number; // eye height multiplier (1 = normal)
  lidTop: number; // 0..1 resting upper lid closure
  lidBot: number; // 0..1 lower lid (happy squint)
  browY: number; // brow offset (-up)
  browRot: number; // inner-end rotation (+ = worried/raised inner)
  mouth: "smile" | "open" | "o" | "ooo" | "flat" | "frown" | "grin" | "smirk" | "wavy" | "teeth";
  mouthW: number;
  blushK: number;
};

export const EXPR: Record<Expression, Spec> = {
  neutral: { eyeH: 1, lidTop: 0.08, lidBot: 0, browY: 0, browRot: 0, mouth: "smile", mouthW: 0.8, blushK: 0.8 },
  happy: { eyeH: 1, lidTop: 0.05, lidBot: 0.28, browY: -0.04, browRot: -4, mouth: "grin", mouthW: 1, blushK: 1 },
  joy: { eyeH: 1, lidTop: 0, lidBot: 0.55, browY: -0.08, browRot: -6, mouth: "open", mouthW: 1.15, blushK: 1.2 },
  surprised: { eyeH: 1.2, lidTop: 0, lidBot: 0, browY: -0.14, browRot: 6, mouth: "o", mouthW: 0.8, blushK: 0.7 },
  ooo: { eyeH: 1.12, lidTop: 0, lidBot: 0, browY: -0.1, browRot: 8, mouth: "ooo", mouthW: 0.9, blushK: 0.9 },
  curious: { eyeH: 1.06, lidTop: 0.02, lidBot: 0, browY: -0.07, browRot: -10, mouth: "smirk", mouthW: 0.7, blushK: 0.8 },
  puzzled: { eyeH: 1, lidTop: 0.15, lidBot: 0, browY: -0.02, browRot: 14, mouth: "wavy", mouthW: 0.8, blushK: 0.6 },
  sheepish: { eyeH: 0.95, lidTop: 0.3, lidBot: 0.1, browY: 0.02, browRot: 12, mouth: "teeth", mouthW: 0.9, blushK: 1.4 },
  focused: { eyeH: 0.9, lidTop: 0.32, lidBot: 0.05, browY: 0.04, browRot: -12, mouth: "flat", mouthW: 0.6, blushK: 0.5 },
  sad: { eyeH: 1, lidTop: 0.25, lidBot: 0, browY: 0, browRot: 16, mouth: "frown", mouthW: 0.7, blushK: 0.5 },
  proud: { eyeH: 1, lidTop: 0.38, lidBot: 0.2, browY: -0.05, browRot: -6, mouth: "smile", mouthW: 1, blushK: 1 },
  wince: { eyeH: 0.85, lidTop: 0.55, lidBot: 0.3, browY: 0.05, browRot: 18, mouth: "flat", mouthW: 0.7, blushK: 0.6 },
};

export const Face: React.FC<{
  r: number; expr: Expression; blink: number; lookX: number; lookY: number; turn: number;
  skin: string; skinSh: string; blush: number; glasses: boolean; sideburns: boolean; hair: string; uid: string;
}> = ({ uid, r, expr, blink, lookX, lookY, turn, skin, blush, glasses, hair }) => {
  const S = EXPR[expr];
  const cx = turn * r * 0.32;
  const ex = r * 0.36;
  const ey = r * 0.02;
  const eRx = r * 0.13;
  const eRy = r * 0.19 * S.eyeH;
  const px = lookX * r * 0.05;
  const py = lookY * r * 0.04;
  const lid = Math.min(1, S.lidTop + blink * (1 - S.lidTop));
  const eyes = [-1, 1].map((s) => {
    const sx = cx + s * ex * (1 - s * turn * 0.25);
    const fore = 1 - Math.max(0, -s * turn) * 0.3; // far eye narrower
    return (
      <g key={s}>
        <clipPath id={`${uid}-eye${s}`}>
          <ellipse cx={sx + px} cy={ey + py} rx={eRx * fore} ry={eRy} />
        </clipPath>
        <ellipse cx={sx + px} cy={ey + py} rx={eRx * fore} ry={eRy} fill={C.ink} />
        <circle cx={sx + px + eRx * 0.35} cy={ey + py - eRy * 0.42} r={eRx * 0.34} fill={C.white} />
        <circle cx={sx + px - eRx * 0.3} cy={ey + py + eRy * 0.35} r={eRx * 0.14} fill={alpha(C.white, 0.7)} />
        {/* lids */}
        <g clipPath={`url(#${uid}-eye${s})`}>
          <rect x={sx + px - eRx * 1.4} y={ey + py - eRy * 1.2} width={eRx * 2.8} height={eRy * 2.4 * lid} fill={skin} />
          <rect x={sx + px - eRx * 1.4} y={ey + py + eRy * 1.2 - eRy * 2.4 * S.lidBot * (1 - blink)} width={eRx * 2.8} height={eRy * 2.4} fill={skin} />
        </g>
        {lid > 0.85 && <path d={`M${sx + px - eRx},${ey + py + eRy * 0.15} Q${sx + px},${ey + py + eRy * 0.55} ${sx + px + eRx},${ey + py + eRy * 0.15}`} stroke={C.ink} strokeWidth={r * 0.045} fill="none" strokeLinecap="round" />}
        {/* brow */}
        <rect x={sx - eRx * 1.05} y={ey - eRy - r * 0.15 + S.browY * r} width={eRx * 2.1} height={r * 0.07} rx={r * 0.035} fill={hair}
          transform={`rotate(${-s * S.browRot},${sx},${ey - eRy - r * 0.12 + S.browY * r})`} />
        {glasses && (
          <circle cx={sx} cy={ey} r={eRy * 1.35} fill={alpha(C.white, 0.12)} stroke={C.ink} strokeWidth={r * 0.05} />
        )}
      </g>
    );
  });
  const my = r * 0.46;
  const mw = r * 0.24 * S.mouthW;
  const mx = cx;
  let mouth: React.ReactNode = null;
  const mc = C.ink;
  const tongue = "#E2557A";
  switch (S.mouth) {
    case "smile":
      mouth = <path d={`M${mx - mw},${my - r * 0.03} Q${mx},${my + r * 0.13} ${mx + mw},${my - r * 0.03}`} stroke={mc} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />;
      break;
    case "grin":
      mouth = <path d={`M${mx - mw},${my - r * 0.05} Q${mx},${my + r * 0.24} ${mx + mw},${my - r * 0.05} Z`} fill={mc} />;
      break;
    case "open":
      mouth = (
        <g>
          <path d={`M${mx - mw},${my - r * 0.06} Q${mx},${my + r * 0.34} ${mx + mw},${my - r * 0.06} Z`} fill={mc} />
          <ellipse cx={mx} cy={my + r * 0.1} rx={mw * 0.5} ry={r * 0.06} fill={tongue} />
        </g>
      );
      break;
    case "o":
      mouth = <ellipse cx={mx} cy={my + r * 0.04} rx={r * 0.09} ry={r * 0.12} fill={mc} />;
      break;
    case "ooo":
      mouth = (
        <g>
          <ellipse cx={mx} cy={my + r * 0.06} rx={r * 0.12} ry={r * 0.17} fill={mc} />
          <ellipse cx={mx} cy={my + r * 0.15} rx={r * 0.07} ry={r * 0.05} fill={tongue} />
        </g>
      );
      break;
    case "flat":
      mouth = <rect x={mx - mw * 0.8} y={my} width={mw * 1.6} height={r * 0.055} rx={r * 0.03} fill={mc} />;
      break;
    case "frown":
      mouth = <path d={`M${mx - mw},${my + r * 0.08} Q${mx},${my - r * 0.06} ${mx + mw},${my + r * 0.08}`} stroke={mc} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />;
      break;
    case "smirk":
      mouth = <path d={`M${mx - mw},${my + r * 0.02} Q${mx + mw * 0.2},${my + r * 0.08} ${mx + mw},${my - r * 0.06}`} stroke={mc} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />;
      break;
    case "wavy":
      mouth = <path d={`M${mx - mw},${my + r * 0.02} q${mw / 2},${-r * 0.06} ${mw},0 t${mw},0`} stroke={mc} strokeWidth={r * 0.055} fill="none" strokeLinecap="round" />;
      break;
    case "teeth":
      mouth = (
        <g>
          <path d={`M${mx - mw},${my - r * 0.02} Q${mx},${my + r * 0.16} ${mx + mw},${my - r * 0.02} Z`} fill={mc} />
          <rect x={mx - mw * 0.75} y={my - r * 0.015} width={mw * 1.5} height={r * 0.05} rx={r * 0.02} fill={C.white} />
        </g>
      );
      break;
  }
  return (
    <g>
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={cx + s * r * 0.55} cy={r * 0.32} rx={r * 0.15} ry={r * 0.09} fill={alpha(C.blush, 0.45 * blush * S.blushK)} />
      ))}
      {eyes}
      {/* nose: tiny soft shadow nub */}
      <ellipse cx={cx + turn * r * 0.08} cy={r * 0.25} rx={r * 0.07} ry={r * 0.05} fill={alpha(C.plum, 0.25)} />
      {mouth}
    </g>
  );
};
