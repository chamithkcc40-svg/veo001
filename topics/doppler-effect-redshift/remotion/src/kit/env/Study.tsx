// Study.tsx - Prague study 1842, candle-warm. Planes:
//  L0 night window view (spires, stars, optional ship / double stars)  depth 0.15
//  L1 back wall + window frame + shelves with books                     depth 0.5
//  L2 desk + candle + papers (subject plane)                            depth 1
//  L3 foreground papers / quill pot silhouette (blur)                   depth 1.5
//  + candle light pool radial (screen) and dust in the light.
import React from "react";
import { C } from "../../theme";
import { alpha, mix, rr, noise1 } from "../../util";
import { Layer, Svg } from "../camera";
import { Candle, Ship } from "../props/Props";
import { Dust, Stars } from "../fx";

export const WIN = { x: 1180, y: 150, w: 520, h: 470 };

export const StudyWindowView: React.FC<{ frame: number; ship?: number; starPair?: number; starScale?: number; trueScale?: boolean }> = ({ frame, ship = 0, starPair = 0, starScale = 1 }) => (
  <Svg>
    <defs>
      <linearGradient id="studySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.night} />
        <stop offset="1" stopColor={C.violet} />
      </linearGradient>
    </defs>
    <rect x={WIN.x - 400} y={WIN.y - 300} width={WIN.w + 800} height={WIN.h + 600} fill="url(#studySky)" />
    <g transform={`translate(${WIN.x - 400},${WIN.y - 300})`}>
      <Stars seed="studystars" frame={frame} n={70} w={WIN.w + 800} h={WIN.h + 300} maxR={2.2} />
    </g>
    {/* Prague-style generic spires & rooftops */}
    <g fill={mix(C.violet, C.night, 0.55)}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const x = WIN.x - 120 + i * 120;
        const h = [140, 220, 120, 300, 160, 200, 130][i];
        return (
          <g key={i}>
            <rect x={x} y={WIN.y + WIN.h - h} width={100} height={h + 50} rx={8} />
            {i % 2 === 1 && <path d={`M${x + 20},${WIN.y + WIN.h - h} L${x + 50},${WIN.y + WIN.h - h - 140} L${x + 80},${WIN.y + WIN.h - h} Z`} />}
            {i % 2 === 1 && <circle cx={x + 50} cy={WIN.y + WIN.h - h - 150} r={8} />}
            <rect x={x + 30} y={WIN.y + WIN.h - h + 40} width={18} height={24} rx={5} fill={alpha(C.sun, 0.55 + 0.25 * noise1("sw" + i, frame / 12))} />
          </g>
        );
      })}
    </g>
    {ship > 0 && (
      <g transform={`translate(${WIN.x + 120 + ship * 40},${WIN.y + WIN.h - 30})`} opacity={ship}>
        <rect x={-300} y={6} width={1000} height={60} fill={mix(C.violet, C.night, 0.3)} />
        <Ship scale={0.9} color={mix(C.violet, C.night, 0.7)} />
      </g>
    )}
    {starPair > 0 && (
      <g opacity={starPair}>
        {[[WIN.x + 210, WIN.y + 130, C.blue], [WIN.x + 300, WIN.y + 160, C.red]].map(([x, y, c], i) => {
          const tw = 0.8 + 0.2 * Math.sin(frame / 5 + i * 2);
          return (
            <g key={i} transform={`translate(${x},${y}) scale(${starScale * tw})`}>
              <circle r={44} fill={alpha(c as string, 0.25)} />
              <circle r={14} fill={mix(c as string, C.white, 0.55)} />
              <path d="M-36,0 L36,0 M0,-36 L0,36" stroke={mix(c as string, C.white, 0.5)} strokeWidth={3} strokeLinecap="round" />
            </g>
          );
        })}
      </g>
    )}
  </Svg>
);

export const StudyRoom: React.FC<{ frame: number }> = ({ frame }) => {
  const wall = C.plum;
  const wallDk = C.plumDk;
  return (
    <Svg>
      <defs>
        <linearGradient id="studyWall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={wallDk} />
          <stop offset="0.45" stopColor={wall} />
          <stop offset="1" stopColor={wallDk} />
        </linearGradient>
      </defs>
      {/* wall with window hole via path evenodd */}
      <path fillRule="evenodd" d={`M-600,-400 H2600 V1500 H-600 Z M${WIN.x},${WIN.y + 60} Q${WIN.x},${WIN.y} ${WIN.x + 60},${WIN.y} H${WIN.x + WIN.w - 60} Q${WIN.x + WIN.w},${WIN.y} ${WIN.x + WIN.w},${WIN.y + 60} V${WIN.y + WIN.h} H${WIN.x} Z`} fill="url(#studyWall)" />
      {/* wallpaper stripes */}
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={-600 + i * 110} y={-400} width={36} height={1900} fill={alpha(C.pink, 0.05)} />
      ))}
      {/* window frame + mullions + sill */}
      <g fill={mix(C.plum, C.sun, 0.2)}>
        <rect x={WIN.x - 26} y={WIN.y + WIN.h} width={WIN.w + 52} height={30} rx={10} />
        <rect x={WIN.x + WIN.w / 2 - 8} y={WIN.y} width={16} height={WIN.h} />
        <rect x={WIN.x} y={WIN.y + WIN.h * 0.45} width={WIN.w} height={14} />
      </g>
      <path d={`M${WIN.x},${WIN.y + 60} Q${WIN.x},${WIN.y} ${WIN.x + 60},${WIN.y} H${WIN.x + WIN.w - 60} Q${WIN.x + WIN.w},${WIN.y} ${WIN.x + WIN.w},${WIN.y + 60} V${WIN.y + WIN.h} H${WIN.x} Z`} fill="none" stroke={mix(C.plum, C.sun, 0.25)} strokeWidth={22} />
      {/* curtain with gentle sway */}
      <path d={`M${WIN.x - 70},${WIN.y - 40} Q${WIN.x - 20 + Math.sin(frame / 30) * 8},${WIN.y + 260} ${WIN.x - 60},${WIN.y + WIN.h + 40} L${WIN.x - 150},${WIN.y + WIN.h + 40} L${WIN.x - 150},${WIN.y - 40} Z`} fill={C.magenta} opacity={0.85} />
      <path d={`M${WIN.x - 100},${WIN.y - 40} Q${WIN.x - 80},${WIN.y + 260} ${WIN.x - 110},${WIN.y + WIN.h + 40}`} stroke={alpha(C.night, 0.25)} strokeWidth={10} fill="none" />
      {/* shelves with books */}
      {[220, 400].map((sy, j) => (
        <g key={sy}>
          <rect x={60} y={sy} width={620} height={22} rx={8} fill={mix(C.plum, C.sun, 0.18)} />
          {Array.from({ length: 13 }).map((_, i) => {
            const h = rr(`bk${j}-${i}`, 90, 140);
            const w = rr(`bkw${j}-${i}`, 30, 46);
            const x = 80 + i * 45;
            const col = [C.magenta, C.teal, C.sun, C.violet, C.pink, C.olive][(i + j) % 6];
            const lean = i === 9 ? -12 : 0;
            return (
              <g key={i} transform={`rotate(${lean},${x},${sy})`}>
                <rect x={x} y={sy - h} width={w} height={h} rx={6} fill={mix(col, C.plum, 0.35)} />
                <rect x={x + 5} y={sy - h + 18} width={w - 10} height={6} rx={3} fill={alpha(C.sunLt, 0.5)} />
              </g>
            );
          })}
        </g>
      ))}
      {/* framed chart on wall */}
      <rect x={760} y={190} width={240} height={180} rx={14} fill={mix(C.plum, C.sun, 0.3)} />
      <rect x={776} y={206} width={208} height={148} rx={8} fill={C.dough} />
      {[0, 1, 2, 3].map((k) => <circle key={k} cx={880} cy={280} r={20 + k * 18} fill="none" stroke={alpha(C.plum, 0.5)} strokeWidth={3} />)}
    </Svg>
  );
};

export const StudyDesk: React.FC<{ frame: number; candleLit?: number; children?: React.ReactNode; candleX?: number }> = ({ frame, candleLit = 1, children, candleX = 1460 }) => (
  <Svg>
    {/* desk */}
    <rect x={-200} y={760} width={2400} height={60} rx={20} fill={mix(C.plum, C.sun, 0.32)} />
    <rect x={-200} y={790} width={2400} height={400} fill={mix(C.plum, C.night, 0.25)} />
    <rect x={-200} y={760} width={2400} height={10} rx={5} fill={alpha(C.sunLt, 0.45)} />
    {/* papers */}
    {[[820, 742, -6], [960, 748, 4], [1080, 740, -2]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
        <rect x={-90} y={-14} width={180} height={28} rx={6} fill={mix(C.dough, C.white, 0.3)} />
        <rect x={-70} y={-6} width={120} height={4} rx={2} fill={alpha(C.plum, 0.4)} />
      </g>
    ))}
    {/* ink pot */}
    <g transform="translate(1220,760)">
      <rect x={-34} y={-56} width={68} height={56} rx={16} fill={C.night} />
      <rect x={-18} y={-70} width={36} height={18} rx={6} fill={mix(C.night, C.violet, 0.5)} />
      <rect x={-24} y={-50} width={10} height={40} rx={5} fill={alpha(C.peri, 0.35)} />
    </g>
    {children}
    <g transform={`translate(${candleX},760)`}><Candle frame={frame} lit={candleLit} /></g>
  </Svg>
);

export const StudyLight: React.FC<{ frame: number; lit?: number; cx?: number; cy?: number }> = ({ frame, lit = 1, cx = 1460, cy = 634 }) => {
  const fl = 0.9 + 0.1 * noise1("candle", frame / 4);
  return (
    <Svg style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id="candlePool" cx={cx} cy={cy} r={900} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.sun} stopOpacity={0.42 * lit * fl} />
          <stop offset="0.4" stopColor={C.sun} stopOpacity={0.12 * lit * fl} />
          <stop offset="1" stopColor={C.sun} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-600} y={-400} width={3200} height={1900} fill="url(#candlePool)" />
      <g opacity={lit}>
        <Dust seed="studydust" frame={frame} n={36} area={[cx - 500, cy - 450, 1000, 700]} color={C.sunLt} size={[1.5, 3.5]} speed={0.6} opacity={0.6} />
      </g>
    </Svg>
  );
};

export const StudyFore: React.FC = () => (
  <Svg>
    <g transform="translate(150,1040) rotate(-8)">
      <rect x={-200} y={-60} width={420} height={120} rx={14} fill={mix(C.dough, C.plum, 0.25)} />
      <rect x={-160} y={-80} width={380} height={110} rx={14} fill={mix(C.dough, C.plum, 0.12)} />
    </g>
    <g transform="translate(1850,980)">
      <rect x={-60} y={-160} width={120} height={200} rx={30} fill={mix(C.plum, C.night, 0.5)} />
    </g>
  </Svg>
);

export const Study: React.FC<{ frame: number; subject?: React.ReactNode; deskChildren?: React.ReactNode; ship?: number; starPair?: number; starScale?: number; candleLit?: number; fore?: boolean }> = ({ frame, subject, deskChildren, ship, starPair, starScale, candleLit = 1, fore = true }) => (
  <>
    <Layer depth={0.15} blur={1}><StudyWindowView frame={frame} ship={ship} starPair={starPair} starScale={starScale} /></Layer>
    <Layer depth={0.5} blur={1.2}><StudyRoom frame={frame} /></Layer>
    <Layer depth={1}>{subject}</Layer>
    <Layer depth={1}><StudyDesk frame={frame} candleLit={candleLit}>{deskChildren}</StudyDesk></Layer>
    <Layer depth={1}><StudyLight frame={frame} lit={candleLit} /></Layer>
    {fore && <Layer depth={1.5} blur={9}><StudyFore /></Layer>}
  </>
);
