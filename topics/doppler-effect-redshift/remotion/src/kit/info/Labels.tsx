// Labels.tsx - name tags (lower-left third), concept titles, timeline ribbon, chapter cards.
import React from "react";
import { C, ease, F, spr } from "../../theme";
import { alpha, prog, sp, tw } from "../../util";

/** lower-left name tag: pill slides in from left (x + opacity + scale), exits faster */
export const NameTag: React.FC<{ f: number; fps: number; at: number; out: number; name: string; sub: string; x?: number; y?: number; color?: string }> = ({ f, fps, at, out, name, sub, x = 110, y = 742, color = C.sun }) => {
  const p = sp(f, at, fps, spr.snappy);
  const e = prog(f, out - 9, out, ease.in);
  const o = Math.min(p, 1 - e);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translateX(${(1 - p) * -60 - e * 40}px) scale(${0.94 + 0.06 * p})`, transformOrigin: "left center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 18, overflow: "hidden", boxShadow: `0 14px 40px ${alpha(C.night, 0.45)}` }}>
        <div style={{ width: 12, background: color }} />
        <div style={{ background: alpha(C.night, 0.82), padding: "12px 24px 12px 18px" }}>
          <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 36, color: C.white, letterSpacing: "0.01em", lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 24, color: alpha(C.lilac, 0.9), marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </div>
  );
};

/** staggered letters title (concept labels): each letter rises + scales + fades, 2 frame stagger */
export const LetterTitle: React.FC<{ f: number; fps: number; at: number; out?: number; text: string; size?: number; color?: string; glow?: string; x?: number; y?: number; align?: "center" | "left"; spread?: number; stagger?: number; weight?: number }> = ({ f, fps, at, out, text, size = 96, color = C.white, glow, x = 960, y = 540, align = "center", spread = 0, stagger = 2, weight = 700 }) => {
  const e = out ? prog(f, out - 8, out, ease.in) : 0;
  return (
    <div style={{ position: "absolute", left: align === "center" ? 0 : x, width: align === "center" ? 1920 : undefined, top: y - size * 0.6, textAlign: align, opacity: 1 - e, transform: `translateY(${-e * 30}px)` }}>
      <span style={{ fontFamily: F.display, fontWeight: weight, fontSize: size, color, letterSpacing: `${0.04 + spread}em`, whiteSpace: "pre", textShadow: glow ? `0 0 30px ${alpha(glow, 0.7)}, 0 0 80px ${alpha(glow, 0.35)}, 0 6px 0 ${alpha(C.night, 0.35)}` : `0 6px 0 ${alpha(C.night, 0.35)}` }}>
        {text.split("").map((ch, i) => {
          const p = sp(f, at + i * stagger, fps, spr.bouncy);
          return (
            <span key={i} style={{ display: "inline-block", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p})` }}>{ch === " " ? "\u00A0" : ch}</span>
          );
        })}
      </span>
    </div>
  );
};

/** Timeline ribbon (recurring Ch2-Ch4). Marker years from 07 sec. 7. active = year highlighted. */
export const TIMELINE = [
  { y: "1842", k: 1842 }, { y: "1845", k: 1845 }, { y: "1912-1914", k: 1913 }, { y: "1923", k: 1923 }, { y: "1927", k: 1927 }, { y: "1929", k: 1929 },
];
export const Timeline: React.FC<{ f: number; fps: number; at: number; out: number; active: string[]; x?: number; y?: number; w?: number }> = ({ f, fps, at, out, active, x = 520, y = 64, w = 880 }) => {
  const p = sp(f, at, fps, spr.smooth);
  const e = prog(f, out - 10, out, ease.in);
  const o = Math.min(p, 1 - e);
  if (o <= 0.001) return null;
  const pos = (k: number) => ((k - 1838) / (1933 - 1838)) * w;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 90, opacity: o, transform: `translateY(${(1 - p) * -30 - e * 20}px)` }}>
      <svg width={w} height={90} style={{ overflow: "visible" }}>
        <rect x={-30} y={10} width={w + 60} height={64} rx={32} fill={alpha(C.night, 0.66)} />
        <rect x={0} y={40} width={w * tw(f, [at + 4, at + 24], [0, 1], ease.out)} height={4} rx={2} fill={alpha(C.lilac, 0.6)} />
        {TIMELINE.map((m, i) => {
          const isA = active.includes(m.y);
          const mp = sp(f, at + 6 + i * 3, fps, spr.snappy);
          const pulse = isA ? 1 + 0.12 * Math.sin(f / 6) : 1;
          return (
            <g key={m.y} transform={`translate(${pos(m.k)},42) scale(${mp * pulse})`}>
              <circle r={isA ? 11 : 6} fill={isA ? C.sun : C.lilac} opacity={isA ? 1 : 0.6} />
              {isA && <circle r={20} fill="none" stroke={C.sun} strokeWidth={2} opacity={0.5} />}
              <text y={-2 - 18} textAnchor="middle" fontFamily="Fredoka" fontWeight={600} fontSize={isA ? 24 : 18} fill={isA ? C.sun : C.lilac} opacity={isA ? 1 : 0.7} style={{ transform: "translateY(52px)" }}>{m.y}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** small pill label (concept / data tag) */
export const Pill: React.FC<{ f: number; fps: number; at: number; out?: number; text: string; x: number; y: number; color?: string; bg?: string; size?: number; anchor?: "left" | "center" | "right" }> = ({ f, fps, at, out, text, x, y, color = C.white, bg = alpha(C.night, 0.78), size = 30, anchor = "center" }) => {
  const p = sp(f, at, fps, spr.bouncy);
  const e = out ? prog(f, out - 8, out, ease.in) : 0;
  const o = Math.min(Math.min(1, p * 1.5), 1 - e);
  if (o <= 0.001) return null;
  const tx = anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0";
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translate(${tx}, ${(1 - p) * 20 - e * 14}px) scale(${0.7 + 0.3 * p})`, transformOrigin: "center", whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: size, color, background: bg, padding: `${size * 0.28}px ${size * 0.7}px`, borderRadius: 999, letterSpacing: "0.04em", boxShadow: `0 10px 30px ${alpha(C.night, 0.35)}` }}>{text}</div>
    </div>
  );
};
