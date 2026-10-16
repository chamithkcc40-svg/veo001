// Skipper - water-strider rig (top-down three-quarter view). Oval body, head with big eyes,
// four long two-segment legs (one can tap), two antennae with dots (follow-through), red scarf
// whose tail flutters (overlapping action). Origin = body centre.
import React from "react";
import { C } from "../../theme";
import { alpha, blinkAt, mix } from "../../util";

export type SkipperPose = {
  tapLeg: number; // 0..1 front-right leg tap (1 = touching water)
  stroke: number; // swim stroke phase (radians) for the rowing legs
  swimAmt: number; // 0..1 how much the legs row
  lookBack: number; // 0..1 head turns back
  squash: number; // 1 = none (landing squash 0.8)
  scarf: number; // flutter phase
  scarfAmt: number; // flutter amplitude
  antenna: number; // follow-through deg
  expr: "happy" | "proud" | "focused" | "surprised";
  bow: number; // 0..1 bow
};

export const SKIP_BASE: SkipperPose = { tapLeg: 0, stroke: 0, swimAmt: 0, lookBack: 0, squash: 1, scarf: 0, scarfAmt: 0.3, antenna: 0, expr: "happy", bow: 0 };

export const Skipper: React.FC<{ pose?: Partial<SkipperPose>; frame: number; x?: number; y?: number; scale?: number; rot?: number; uid: string; shadow?: boolean }> = (p) => {
  const P = { ...SKIP_BASE, ...(p.pose || {}) };
  const f = p.frame;
  const blink = blinkAt(f, "skipper");
  const body = "#4A2A8A";
  const bodyLt = mix(body, C.peri, 0.45);
  const belly = mix(body, C.pink, 0.35);
  const legC = "#2A1466";
  const sx = 1 + (1 - P.squash) * 0.8;

  const legSeg = (x0: number, y0: number, a1: number, l1: number, a2: number, l2: number, key: string, foot = true) => {
    const r1 = (a1 * Math.PI) / 180;
    const x1 = x0 + Math.cos(r1) * l1, y1 = y0 + Math.sin(r1) * l1;
    const r2 = ((a1 + a2) * Math.PI) / 180;
    const x2 = x1 + Math.cos(r2) * l2, y2 = y1 + Math.sin(r2) * l2;
    return (
      <g key={key}>
        <path d={`M${x0},${y0} L${x1},${y1} L${x2},${y2}`} stroke={legC} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x1} cy={y1} r={4.5} fill={bodyLt} />
        {foot && <ellipse cx={x2} cy={y2} rx={9} ry={5} fill={alpha(C.white, 0.6)} transform={`rotate(${a1 + a2},${x2},${y2})`} />}
      </g>
    );
  };

  const row = Math.sin(P.stroke) * 22 * P.swimAmt;
  const tapA = -28 + P.tapLeg * 18;
  const tapB = -40 + P.tapLeg * 34;
  const headX = 46 - P.lookBack * 6;
  const headRot = P.lookBack * 155;
  const bowK = P.bow;

  return (
    <g transform={`translate(${p.x ?? 0},${p.y ?? 0}) rotate(${p.rot ?? 0}) scale(${(p.scale ?? 1) * sx},${(p.scale ?? 1) * P.squash})`}>
      {p.shadow !== false && <ellipse cx={8} cy={14} rx={70} ry={26} fill={alpha(C.night, 0.18)} />}
      {/* rear legs (long rowers) */}
      {legSeg(-10, 8, 150 + row, 70, -35, 70, "rl")}
      {legSeg(-10, -8, -150 - row, 70, 35, 70, "rr")}
      {/* middle legs */}
      {legSeg(4, 10, 110 - row * 0.6, 54, -55, 60, "ml")}
      {legSeg(4, -10, -110 + row * 0.6, 54, 55, 60, "mr")}
      {/* front legs: left normal, right = tapper */}
      {legSeg(26, 10, 60, 34, 30, 34, "fl")}
      {legSeg(26, -10, tapA, 34, tapB, 36, "fr")}
      {P.tapLeg > 0.85 && <circle cx={26 + 60} cy={-10 - 44} r={10 * P.tapLeg} fill="none" stroke={alpha(C.white, 0.8)} strokeWidth={3} />}
      {/* body */}
      <ellipse cx={-6} cy={0} rx={48} ry={22} fill={body} />
      <ellipse cx={-10} cy={-6} rx={36} ry={10} fill={bodyLt} />
      <ellipse cx={-22} cy={6} rx={22} ry={8} fill={belly} />
      {/* scarf tail: overlapping action */}
      <g transform={`translate(26,0)`}>
        {(() => {
          const a = Math.sin(P.scarf) * 18 * P.scarfAmt;
          const b = Math.sin(P.scarf - 0.9) * 26 * P.scarfAmt;
          return (
            <path d={`M0,-6 C-20,${-10 + a * 0.3} -34,${a} -52,${b} L-46,${b + 12} C-30,${a + 12} -16,6 0,8 Z`} fill={C.red} />
          );
        })()}
        <ellipse cx={0} cy={0} rx={10} ry={20} fill={mix(C.red, C.night, 0.15)} />
      </g>
      {/* head */}
      <g transform={`translate(${headX},0) rotate(${headRot * 0.25 + bowK * -10}) scale(1,${1 - bowK * 0.2})`}>
        {/* antennae with follow-through */}
        {[-1, 1].map((s) => {
          const a = P.antenna * s * 0.5 + P.antenna;
          return (
            <g key={s} transform={`rotate(${a},10,${s * 8})`}>
              <path d={`M10,${s * 8} Q34,${s * 18} 46,${s * 34}`} stroke={legC} strokeWidth={4} fill="none" strokeLinecap="round" />
              <circle cx={46} cy={s * 34} r={6} fill={C.sun} />
            </g>
          );
        })}
        <circle cx={0} cy={0} r={22} fill={body} />
        <circle cx={-4} cy={-6} r={12} fill={alpha(bodyLt, 0.7)} />
        {/* eyes (looking forward = +x) */}
        {[-1, 1].map((s) => {
          const ex = 10 - P.lookBack * 16;
          const ey = s * 9;
          const open = 1 - blink;
          return (
            <g key={s}>
              <ellipse cx={ex} cy={ey} rx={9} ry={9} fill={C.white} />
              <ellipse cx={ex + 2} cy={ey} rx={5.5} ry={5.5 * Math.max(0.12, open * (P.expr === "focused" ? 0.6 : 1))} fill={C.ink} />
              <circle cx={ex + 4} cy={ey - 2} r={1.8} fill={C.white} />
            </g>
          );
        })}
        {P.expr === "proud" || P.expr === "happy" ? (
          <path d={`M16,-5 Q22,0 16,5`} stroke={C.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        ) : P.expr === "surprised" ? (
          <circle cx={18} cy={0} r={3} fill={C.ink} />
        ) : null}
        <ellipse cx={8} cy={-14} rx={4} ry={3} fill={alpha(C.pink, 0.6)} />
        <ellipse cx={8} cy={14} rx={4} ry={3} fill={alpha(C.pink, 0.6)} />
      </g>
    </g>
  );
};
