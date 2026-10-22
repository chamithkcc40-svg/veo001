// fx.tsx - grade, grain, vignette, light rays, glow, dust particles, light leak.
// Stack order per scene: env layers -> characters/props -> info/text -> Grade -> Grain+Vignette.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { alpha, rr, noise1 } from "../util";

/** global-frame offset of the current window (set by Film): grain must follow the GLOBAL frame so a
 *  chapter render is pixel-identical to the same frames of Full (seamless concat). */
export const FilmOffset = React.createContext(0);

export const Grade: React.FC<{ tint?: string; amount?: number; top?: number; bottom?: number }> = ({ tint = C.violet, amount = 0.14, top = 0.12, bottom = 0.22 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: tint, mixBlendMode: "soft-light", opacity: amount }} />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${alpha(C.night, top)}, transparent 26%, transparent 70%, ${alpha(C.night, bottom)})` }} />
  </AbsoluteFill>
);

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`;

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const f = useCurrentFrame() + React.useContext(FilmOffset);
  return (
    <AbsoluteFill style={{
      pointerEvents: "none", backgroundImage: NOISE, backgroundSize: "240px",
      backgroundPosition: `${(f * 73) % 240}px ${(f * 131) % 240}px`, opacity, mixBlendMode: "overlay",
    }} />
  );
};

export const Vignette: React.FC<{ amount?: number }> = ({ amount = 0.28 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, ${alpha(C.night, amount)} 100%)` }} />
);

/** Finishing stack: grade + grain + vignette (always last in a scene) */
export const Finish: React.FC<{ tint?: string; grade?: number; grain?: number; vig?: number }> = ({ tint, grade, grain, vig }) => (
  <>
    <Grade tint={tint} amount={grade} />
    <Grain opacity={grain} />
    <Vignette amount={vig} />
  </>
);

/** Soft radial light rays (title/peak moments only) */
export const Rays: React.FC<{ cx: number; cy: number; color?: string; n?: number; opacity?: number; rot?: number; r?: number }> = ({ cx, cy, color = C.sunLt, n = 14, opacity = 0.1, rot = 0, r = 1600 }) => {
  const wedges = Array.from({ length: n }).map((_, i) => {
    const a0 = ((i / n) * 360 + rot) * (Math.PI / 180);
    const a1 = a0 + (Math.PI / n) * 0.75;
    return `M${cx},${cy} L${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} L${cx + Math.cos(a1) * r},${cy + Math.sin(a1) * r} Z`;
  });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity }}>
      <defs>
        <radialGradient id={`rays-${cx}-${cy}`} cx={cx} cy={cy} r={r * 0.7} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={wedges.join(" ")} fill={`url(#rays-${cx}-${cy})`} style={{ filter: "blur(6px)" }} />
    </svg>
  );
};

/** additive glow blob (svg element; use inside an <svg>) */
export const GlowDot: React.FC<{ cx: number; cy: number; r: number; color: string; o?: number; id: string }> = ({ cx, cy, r, color, o = 1, id }) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity={o} />
        <stop offset="0.35" stopColor={color} stopOpacity={o * 0.45} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
  </>
);

/** drifting dust motes / star dust (seeded). Use inside <svg>. */
export const Dust: React.FC<{ n?: number; seed: string; color?: string; area?: [number, number, number, number]; size?: [number, number]; speed?: number; twinkle?: boolean; frame: number; opacity?: number }> = ({ n = 40, seed, color = C.lilac, area = [0, 0, 1920, 1080], size = [1.5, 4], speed = 1, twinkle = true, frame, opacity = 0.6 }) => {
  const [x0, y0, w, h] = area;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const bx = rr(seed + "x" + i, 0, w);
        const by = rr(seed + "y" + i, 0, h);
        const vx = rr(seed + "vx" + i, -0.25, 0.25) * speed;
        const vy = rr(seed + "vy" + i, -0.35, -0.05) * speed;
        const x = x0 + ((((bx + vx * frame + noise1(seed + "nx" + i, frame / 60) * 14) % w) + w) % w);
        const y = y0 + ((((by + vy * frame) % h) + h) % h);
        const s = rr(seed + "s" + i, size[0], size[1]);
        const tw = twinkle ? 0.55 + 0.45 * Math.sin(frame / rr(seed + "t" + i, 8, 22) + i) : 1;
        return <circle key={i} cx={x} cy={y} r={s} fill={color} opacity={opacity * tw} />;
      })}
    </g>
  );
};

/** seeded static starfield with twinkle; parallax via offset */
export const Stars: React.FC<{ n?: number; seed: string; frame: number; ox?: number; oy?: number; w?: number; h?: number; maxR?: number; color?: string; opacity?: number }> = ({ n = 160, seed, frame, ox = 0, oy = 0, w = 1920, h = 1080, maxR = 2.6, color = C.lilac, opacity = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = ((((rr(seed + "x" + i, 0, w) + ox) % w) + w) % w);
      const y = ((((rr(seed + "y" + i, 0, h) + oy) % h) + h) % h);
      const r = rr(seed + "r" + i, 0.6, maxR) ** 1.2;
      const tw = 0.6 + 0.4 * Math.sin(frame / rr(seed + "t" + i, 6, 20) + i * 1.7);
      const big = r > maxR * 0.9;
      return (
        <g key={i} opacity={opacity * tw}>
          <circle cx={x} cy={y} r={r} fill={color} />
          {big && <path d={`M${x - r * 3.5},${y} L${x + r * 3.5},${y} M${x},${y - r * 3.5} L${x},${y + r * 3.5}`} stroke={color} strokeWidth={0.8} opacity={0.6} />}
        </g>
      );
    })}
  </g>
);

/** warm light leak sweeping across (transitions/peaks) */
export const LightLeak: React.FC<{ t: number; color?: string; opacity?: number }> = ({ t, color = C.sun, opacity = 0.35 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: opacity * Math.sin(Math.max(0, Math.min(1, t)) * Math.PI) }}>
    <div style={{ position: "absolute", width: 1400, height: 1400, borderRadius: "50%", left: -700 + t * 2400, top: -300, background: `radial-gradient(circle, ${alpha(color, 0.9)}, transparent 62%)`, filter: "blur(40px)" }} />
  </AbsoluteFill>
);
