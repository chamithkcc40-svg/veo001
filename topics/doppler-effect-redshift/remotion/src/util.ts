import { interpolate, spring, random } from "remotion";
import { ease } from "./theme";

type EaseFn = (t: number) => number;

/** clamped interpolate with mandatory easing (never linear) */
export const tw = (f: number, inp: number[], out: number[], e: EaseFn = ease.inOut) =>
  interpolate(f, inp, out, { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** clamped 0..1 progress between a and b */
export const prog = (f: number, a: number, b: number, e: EaseFn = ease.inOut) => tw(f, [a, b], [0, 1], e);

/** spring from frame `at` */
export const sp = (f: number, at: number, fps: number, cfg: { damping: number; stiffness: number; mass: number }, dur?: number) =>
  spring({ frame: f - at, fps, config: cfg, durationInFrames: dur });

/** physically constant (ring growth) - the only allowed linear mapping, see STYLE_BIBLE 9 */
export const lin = (f: number, a: number, b: number, o0: number, o1: number) =>
  interpolate(f, [a, b], [o0, o1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const rnd = (seed: string | number) => random(seed);
export const rr = (seed: string | number, a: number, b: number) => a + (b - a) * random(seed);

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

/** smooth seeded value noise, period-free (for handheld, flicker) */
export const noise1 = (seed: string, t: number) => {
  const i = Math.floor(t);
  const fr = t - i;
  const a = random(seed + ":" + i) * 2 - 1;
  const b = random(seed + ":" + (i + 1)) * 2 - 1;
  const s = fr * fr * (3 - 2 * fr);
  return a + (b - a) * s;
};

/** hex mixing for cel shadows / rims */
const hex = (h: string) => {
  const x = h.replace("#", "");
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
};
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
};
export const alpha = (h: string, a: number) => {
  const [r, g, b] = hex(h);
  return `rgba(${r},${g},${b},${a})`;
};
/** colour along BLUE - cream - RED (t: -1 blue .. 0 neutral .. 1 red) */
export const shiftColor = (t: number, blue: string, mid: string, red: string) =>
  t < 0 ? mix(mid, blue, Math.min(1, -t)) : mix(mid, red, Math.min(1, t));

/** blink amount 0..1 for a seeded character (4 close, 2 hold, 4 open, every 2.5-4.5 s) */
export const blinkAt = (f: number, seed: string, fps = 30) => {
  let t = 0;
  let k = 0;
  while (t < f + 20 && k < 400) {
    const gap = Math.round(fps * (2.5 + 2 * random(seed + "b" + k)));
    const start = t + gap;
    if (f >= start && f < start + 10) {
      const d = f - start;
      if (d < 4) return d / 4;
      if (d < 6) return 1;
      return 1 - (d - 6) / 4;
    }
    t = start;
    k++;
  }
  return 0;
};

export const deg = (d: number) => (d * Math.PI) / 180;
