// Street.tsx - Sunset Street multiplane kit (cold open, Ch1, close). 6 planes:
//  L0 sky (tall: night at the top for the whip-tilt) + sun + stars   depth 0.08-0.5
//  L1 clouds (drift)                                                 depth 0.15
//  L2 far skyline silhouettes (atmospheric, blur 3)                  depth 0.3
//  L3 rowhouses with flickering windows, birds                       depth 0.55
//  L4 street: far kerb, road, near sidewalk, lamp post (+ glow)     depth 1 (subject plane)
//  L5 foreground hedge silhouettes (blur 8)                          depth 1.6
// Children of `subject` render on the subject plane (characters, vehicles, rings).
import React from "react";
import { C, TOD } from "../../theme";
import { alpha, mix, rr, noise1 } from "../../util";
import { Layer, Svg } from "../camera";
import { Stars } from "../fx";

export type Tod = keyof typeof TOD;
export const STREET = { horizon: 700, roadTop: 735, roadBot: 850, groundY: 862, curbFar: 720 };

const X0 = -2600, X1 = 4600; // world extent so pans never reveal edges

export const StreetSky: React.FC<{ tod: Tod; frame: number; starsO?: number }> = ({ tod, frame, starsO }) => {
  const P = TOD[tod];
  const starA = starsO ?? (tod === "night" ? 1 : tod === "dusk" ? 0.55 : 0);
  return (
    <Svg>
      <defs>
        <linearGradient id={`sky-${tod}`} x1="0" y1="-2600" x2="0" y2="760" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.night} />
          <stop offset="0.45" stopColor={C.night} />
          <stop offset="0.62" stopColor={P.skyTop} />
          <stop offset="0.86" stopColor={P.skyMid} />
          <stop offset="1" stopColor={P.skyLow} />
        </linearGradient>
        <radialGradient id={`sun-${tod}`} cx="0" cy="0" r="1">
          <stop offset="0" stopColor={C.white} stopOpacity={0.95} />
          <stop offset="0.12" stopColor={C.sunLt} stopOpacity={0.9} />
          <stop offset="0.4" stopColor={P.skyLow} stopOpacity={0.45} />
          <stop offset="1" stopColor={P.skyLow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={X0} y={-2600} width={X1 - X0} height={3400} fill={`url(#sky-${tod})`} />
      <g opacity={starA}>
        <Stars seed="streetstars" frame={frame} n={260} oy={-2600} h={2400} w={1920} maxR={2.4} />
      </g>
      {tod !== "night" && (
        <g transform={`translate(1360,${tod === "golden" ? 520 : 640})`}>
          <circle r={520} fill={`url(#sun-${tod})`} transform="scale(1)" style={{ transformBox: "fill-box" }} />
          <circle r={tod === "golden" ? 70 : 84} fill={tod === "golden" ? C.sunLt : mix(C.sun, C.magenta, 0.25)} />
        </g>
      )}
      {tod === "night" && <circle cx={1500} cy={260} r={46} fill={C.lilac} opacity={0.9} />}
    </Svg>
  );
};

const Cloud: React.FC<{ x: number; y: number; s: number; color: string; lit: string }> = ({ x, y, s, color, lit }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-120} y={-10} width={260} height={50} rx={25} fill={color} />
    <circle cx={-40} cy={-6} r={44} fill={color} />
    <circle cx={30} cy={-24} r={56} fill={color} />
    <circle cx={90} cy={0} r={36} fill={color} />
    <path d="M-80,-30 Q-40,-56 0,-62" stroke={lit} strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.7} />
  </g>
);

export const StreetClouds: React.FC<{ tod: Tod; frame: number }> = ({ tod, frame }) => {
  const P = TOD[tod];
  const col = tod === "golden" ? mix(C.white, C.peach, 0.4) : tod === "dusk" ? mix(C.magenta, C.violet, 0.45) : mix(C.violet, C.night, 0.3);
  const lit = tod === "night" ? C.peri : P.rim;
  return (
    <Svg>
      {Array.from({ length: 9 }).map((_, i) => {
        const bx = rr("cl" + i, X0 + 800, X1 - 800);
        const x = bx + frame * rr("clv" + i, 0.15, 0.4);
        return <Cloud key={i} x={x} y={rr("cly" + i, 120, 470)} s={rr("cls" + i, 0.6, 1.3)} color={col} lit={lit} />;
      })}
    </Svg>
  );
};

export const StreetFar: React.FC<{ tod: Tod }> = ({ tod }) => {
  const P = TOD[tod];
  const c = mix(P.bldgSh, P.skyMid, 0.42);
  return (
    <Svg>
      {Array.from({ length: 34 }).map((_, i) => {
        const w = rr("fw" + i, 90, 200);
        const h = rr("fh" + i, 140, 330);
        const x = X0 + i * 210 + rr("fx" + i, -30, 30);
        const kind = Math.floor(rr("fk" + i, 0, 3));
        return (
          <g key={i}>
            <rect x={x} y={STREET.horizon - h} width={w} height={h + 20} rx={kind === 0 ? w / 2.2 : 14} fill={c} />
            {kind === 2 && <rect x={x + w / 2 - 6} y={STREET.horizon - h - 70} width={12} height={80} rx={6} fill={c} />}
          </g>
        );
      })}
      <rect x={X0} y={STREET.horizon - 10} width={X1 - X0} height={60} fill={c} />
    </Svg>
  );
};

/** rowhouses; windows flicker (seeded) and some are lit by time of day */
export const StreetHouses: React.FC<{ tod: Tod; frame: number; birds?: boolean }> = ({ tod, frame, birds = true }) => {
  const P = TOD[tod];
  const lit = tod === "golden" ? 0.2 : tod === "dusk" ? 0.55 : 0.75;
  const houses = Array.from({ length: 26 }).map((_, i) => {
    const w = rr("hw" + i, 250, 330);
    return { i, w, h: rr("hh" + i, 300, 430), roof: Math.floor(rr("hr" + i, 0, 3)), col: [P.bldg, P.bldgLt, mix(P.bldg, C.plum, 0.4), mix(P.bldg, C.magenta, 0.25)][i % 4] };
  });
  let x = X0;
  return (
    <Svg>
      {houses.map((hs) => {
        const hx = x;
        x += hs.w + 6;
        const top = STREET.curbFar - hs.h;
        const sh = mix(hs.col, P.bldgSh, 0.55);
        const rim = mix(hs.col, P.rim, 0.45);
        const cols = Math.floor((hs.w - 40) / 70);
        const rows = Math.floor((hs.h - 120) / 95);
        return (
          <g key={hs.i}>
            {hs.roof === 0 && <path d={`M${hx - 10},${top + 4} L${hx + hs.w / 2},${top - 90} L${hx + hs.w + 10},${top + 4} Z`} fill={sh} />}
            {hs.roof === 1 && <rect x={hx + hs.w * 0.15} y={top - 60} width={hs.w * 0.7} height={70} rx={35} fill={sh} />}
            {hs.roof === 2 && <rect x={hx + hs.w * 0.7} y={top - 80} width={34} height={90} rx={8} fill={sh} />}
            <rect x={hx} y={top} width={hs.w} height={hs.h + 30} rx={14} fill={hs.col} />
            <rect x={hx + hs.w * 0.8} y={top} width={hs.w * 0.2} height={hs.h + 30} rx={10} fill={sh} />
            <rect x={hx} y={top} width={8} height={hs.h + 30} rx={4} fill={rim} />
            <rect x={hx - 6} y={top - 4} width={hs.w + 12} height={18} rx={9} fill={sh} />
            {Array.from({ length: rows * cols }).map((_, k) => {
              const cx = hx + 34 + (k % cols) * ((hs.w - 68) / Math.max(1, cols - 1 || 1)) - 20;
              const cy = top + 50 + Math.floor(k / cols) * 95;
              const on = rr(`win${hs.i}-${k}`, 0, 1) < lit;
              const flick = on ? 0.82 + 0.18 * noise1(`wf${hs.i}-${k}`, frame / 9) : 0;
              return (
                <g key={k}>
                  <rect x={cx} y={cy} width={44} height={60} rx={12} fill={on ? mix(C.sun, C.white, 0.2) : mix(hs.col, C.night, 0.45)} opacity={on ? flick : 1} />
                  {on && <rect x={cx - 14} y={cy - 14} width={72} height={88} rx={30} fill={alpha(C.sun, 0.12 * flick)} />}
                  <rect x={cx} y={cy + 26} width={44} height={6} fill={mix(hs.col, C.night, 0.3)} />
                </g>
              );
            })}
            <rect x={hx + hs.w * 0.4} y={STREET.curbFar - 110} width={60} height={110} rx={26} fill={mix(hs.col, C.night, 0.4)} />
          </g>
        );
      })}
      {birds && Array.from({ length: 5 }).map((_, i) => {
        const bx = ((rr("bx" + i, 0, 3000) + frame * rr("bv" + i, 1.2, 2.2)) % 3600) - 900;
        const by = rr("by" + i, 160, 330) + Math.sin(frame / 12 + i) * 8;
        const fl = Math.sin(frame / 3 + i * 2) * 10;
        return <path key={i} d={`M${bx - 16},${by + fl * 0.3} Q${bx - 8},${by - 8 - fl} ${bx},${by} Q${bx + 8},${by - 8 - fl} ${bx + 16},${by + fl * 0.3}`} stroke={mix(P.bldgSh, C.night, 0.3)} strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
    </Svg>
  );
};

export const StreetGround: React.FC<{ tod: Tod; frame: number; lampX?: number[] }> = ({ tod, frame, lampX = [430, 1700, 2900, -900] }) => {
  const P = TOD[tod];
  const road = mix(P.bldgSh, C.night, 0.25);
  const side = mix(P.bldg, C.lilac, 0.18);
  const sideSh = mix(side, P.bldgSh, 0.4);
  const lampOn = tod === "golden" ? 0.25 : 1;
  return (
    <Svg>
      {/* far sidewalk */}
      <rect x={X0} y={STREET.curbFar} width={X1 - X0} height={STREET.roadTop - STREET.curbFar} fill={sideSh} />
      <rect x={X0} y={STREET.roadTop - 6} width={X1 - X0} height={8} fill={mix(side, C.white, 0.2)} />
      {/* road with sun reflection sheen */}
      <rect x={X0} y={STREET.roadTop} width={X1 - X0} height={STREET.roadBot - STREET.roadTop} fill={road} />
      <rect x={X0} y={STREET.roadTop} width={X1 - X0} height={20} fill={alpha(P.skyLow, 0.12)} />
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={i} x={X0 + i * 190} y={(STREET.roadTop + STREET.roadBot) / 2 - 4} width={100} height={8} rx={4} fill={alpha(C.lilac, 0.45)} />
      ))}
      {/* near kerb + sidewalk */}
      <rect x={X0} y={STREET.roadBot} width={X1 - X0} height={14} fill={mix(side, C.white, 0.25)} />
      <rect x={X0} y={STREET.roadBot + 14} width={X1 - X0} height={400} fill={side} />
      {Array.from({ length: 50 }).map((_, i) => (
        <rect key={i} x={X0 + i * 150} y={STREET.roadBot + 14} width={4} height={400} fill={alpha(P.bldgSh, 0.18)} />
      ))}
      {/* long dusk shadows to the right */}
      {lampX.map((lx, i) => (
        <g key={i}>
          <path d={`M${lx},${STREET.groundY} L${lx + 260},${STREET.groundY + 30} L${lx + 270},${STREET.groundY + 40} L${lx + 6},${STREET.groundY + 10} Z`} fill={alpha(C.night, 0.18)} />
          <rect x={lx - 9} y={STREET.groundY - 430} width={18} height={430} rx={9} fill={mix(P.bldgSh, C.night, 0.35)} />
          <rect x={lx - 9} y={STREET.groundY - 430} width={6} height={430} rx={3} fill={alpha(P.rim, 0.5)} />
          <path d={`M${lx},${STREET.groundY - 430} Q${lx},${STREET.groundY - 480} ${lx + 60},${STREET.groundY - 480}`} stroke={mix(P.bldgSh, C.night, 0.35)} strokeWidth={14} fill="none" strokeLinecap="round" />
          <rect x={lx + 40} y={STREET.groundY - 486} width={60} height={24} rx={10} fill={mix(P.bldgSh, C.night, 0.35)} />
          <ellipse cx={lx + 70} cy={STREET.groundY - 460} rx={22} ry={10} fill={C.sunLt} opacity={0.5 + 0.5 * lampOn} />
          <circle cx={lx + 70} cy={STREET.groundY - 450} r={140} fill={alpha(C.sun, 0.16 * lampOn * (0.9 + 0.1 * noise1("lamp" + i, frame / 5)))} />
          <ellipse cx={lx + 70} cy={STREET.groundY + 20} rx={170} ry={26} fill={alpha(C.sun, 0.12 * lampOn)} />
        </g>
      ))}
    </Svg>
  );
};

export const StreetHedges: React.FC<{ tod: Tod; frame: number }> = ({ tod, frame }) => {
  const P = TOD[tod];
  const c = mix(P.bldgSh, C.night, 0.45);
  return (
    <Svg>
      {Array.from({ length: 22 }).map((_, i) => {
        const x = X0 + i * 340 + rr("hx" + i, -60, 60);
        const s = rr("hs" + i, 0.8, 1.4);
        const wob = Math.sin(frame / 25 + i) * 3;
        return (
          <g key={i} transform={`translate(${x},${1120 + wob}) scale(${s})`}>
            <circle cx={0} cy={0} r={110} fill={c} />
            <circle cx={110} cy={20} r={90} fill={c} />
            <circle cx={-100} cy={30} r={80} fill={c} />
          </g>
        );
      })}
    </Svg>
  );
};

/** full street stack; `subject` renders on the depth-1 plane above the ground */
export const Street: React.FC<{ tod: Tod; frame: number; subject?: React.ReactNode; front?: React.ReactNode; hedges?: boolean; starsO?: number; birds?: boolean; dof?: number }> = ({ tod, frame, subject, front, hedges = true, starsO, birds, dof = 1 }) => (
  <>
    <Layer depth={0.08}><StreetSky tod={tod} frame={frame} starsO={starsO} /></Layer>
    <Layer depth={0.15} blur={1.5 * dof}><StreetClouds tod={tod} frame={frame} /></Layer>
    <Layer depth={0.3} blur={3 * dof}><StreetFar tod={tod} /></Layer>
    <Layer depth={0.55} blur={1.2 * dof}><StreetHouses tod={tod} frame={frame} birds={birds} /></Layer>
    <Layer depth={1}><StreetGround tod={tod} frame={frame} /></Layer>
    <Layer depth={1}>{subject}</Layer>
    {hedges && <Layer depth={1.6} blur={8 * dof}><StreetHedges tod={tod} frame={frame} /></Layer>}
    {front && <Layer depth={1}>{front}</Layer>}
  </>
);
