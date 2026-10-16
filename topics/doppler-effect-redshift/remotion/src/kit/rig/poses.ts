// poses.ts - pose library + cycles (walk, gesture, write, wave, cup-ears, thumbs-up, shrug).
// All functions are pure in the frame number. blendPose eases between poses with anticipation.
import { ease } from "../../theme";
import { prog } from "../../util";
import { BASE_POSE, Limb, Pose } from "./types";

export type P = Partial<Pose>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpLimb = (a: Limb, b: Limb, t: number): Limb => ({ a: lerp(a.a, b.a, t), b: lerp(a.b, b.b, t) });

export const full = (p: P): Pose => ({ ...BASE_POSE, ...p });

export const blend = (A: P, B: P, t: number): Pose => {
  const a = full(A), b = full(B);
  return {
    armL: lerpLimb(a.armL, b.armL, t), armR: lerpLimb(a.armR, b.armR, t),
    legL: lerpLimb(a.legL, b.legL, t), legR: lerpLimb(a.legR, b.legR, t),
    lean: lerp(a.lean, b.lean, t), headTilt: lerp(a.headTilt, b.headTilt, t),
    lookX: lerp(a.lookX, b.lookX, t), lookY: lerp(a.lookY, b.lookY, t), turn: lerp(a.turn, b.turn, t),
    bodyY: lerp(a.bodyY, b.bodyY, t), squash: lerp(a.squash, b.squash, t),
    handL: t < 0.5 ? a.handL : b.handL, handR: t < 0.5 ? a.handR : b.handR,
  };
};

/** keyframed pose track: [[frame, pose], ...] with easeInOut between keys and a small
 *  anticipation dip (squash + counter-lean) at the start of every transition. */
export const track = (f: number, keys: [number, P][], dur = 10): Pose => {
  if (f <= keys[0][0]) return full(keys[0][1]);
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, p0] = keys[i];
    const [f1, p1] = keys[i + 1];
    const start = f1 - dur;
    if (f < start) return full(p0);
    if (f <= f1) {
      const t = prog(f, start, f1, ease.inOut);
      const b = blend(p0, p1, t);
      const antic = Math.sin(Math.min(1, t * 2.2) * Math.PI) * (t < 0.45 ? 1 : 0);
      b.squash *= 1 - 0.025 * antic;
      b.bodyY += 3 * antic;
      return b;
    }
    if (i === keys.length - 2) return full(p1);
  }
  return full(keys[keys.length - 1][1]);
};

// ---------- named poses ----------
export const POSE = {
  stand: {} as P,
  cupEars: { armL: { a: -120, b: -80 }, armR: { a: 120, b: 80 }, handL: "cup", handR: "cup" } as P,
  thumbsUpR: { armR: { a: 70, b: 70 }, handR: "thumb" } as P,
  thumbsUpL: { armL: { a: -70, b: -70 }, handL: "thumb" } as P,
  pointUpR: { armR: { a: 150, b: 10 }, handR: "point", lookY: -1, headTilt: -6 } as P,
  pointR: { armR: { a: 95, b: 5 }, handR: "point" } as P,
  lookUp: { headTilt: -10, lookY: -1 } as P,
  shrug: { armL: { a: -45, b: -95 }, armR: { a: 45, b: 95 }, headTilt: 8 } as P,
  handsOnWheel: { armL: { a: 55, b: 55 }, armR: { a: 40, b: 70 }, handL: "fist", handR: "fist" } as P,
  write: { armR: { a: 35, b: 80 }, armL: { a: 20, b: 60 }, handR: "fist", lean: 6, headTilt: 12, lookY: 1 } as P,
  holdUp: { armR: { a: 125, b: 30 }, handR: "fist", lookX: 0.6, lookY: -0.6 } as P,
  offer: { armR: { a: 80, b: 20 }, armL: { a: -30, b: -30 }, handR: "open" } as P,
  hornPlay: { armL: { a: 55, b: 95 }, armR: { a: 35, b: 95 }, handL: "fist", handR: "fist" } as P,
  flagUp: { armR: { a: 160, b: 5 }, handR: "fist" } as P,
  handOnChin: { armR: { a: 30, b: 140 }, handR: "fist", headTilt: 6 } as P,
  armsWide: { armL: { a: -110, b: -20 }, armR: { a: 110, b: 20 }, handL: "open", handR: "open" } as P,
  notebook: { armL: { a: 35, b: 80 }, armR: { a: 20, b: 85 }, handL: "open", handR: "fist", lookY: 1, headTilt: 8 } as P,
} as const;

// ---------- cycles ----------
/** walk cycle: period frames, phase in frames; arms swing opposite to legs; body bobs twice per cycle */
export const walk = (f: number, period = 24, amp = 1): P => {
  const ph = (f / period) * Math.PI * 2;
  const s = Math.sin(ph);
  const legA = 24 * s * amp;
  const kneeL = Math.max(0, -Math.cos(ph)) * 34 * amp;
  const kneeR = Math.max(0, Math.cos(ph)) * 34 * amp;
  return {
    legL: { a: legA, b: -kneeL }, legR: { a: -legA, b: -kneeR },
    armL: { a: -6 - 20 * s * amp, b: 14 }, armR: { a: 6 + 20 * s * amp, b: -14 },
    bodyY: -Math.abs(Math.cos(ph)) * 5 * amp, lean: 3 * amp,
  };
};

/** sway for horn players / idle crowds */
export const sway = (f: number, seed: number, amt = 1): P => ({
  lean: Math.sin(f / 14 + seed) * 4 * amt,
  headTilt: Math.sin(f / 14 + seed - 0.6) * 5 * amt,
  bodyY: Math.abs(Math.sin(f / 14 + seed)) * -4 * amt,
});

/** writing micro-cycle (hand scribbles) */
export const scribble = (f: number): P => ({
  armR: { a: 35 + Math.sin(f / 2.2) * 5, b: 80 + Math.cos(f / 3.1) * 7 },
});

/** gesture cycle: talking-hands beat every `period` frames */
export const gesture = (f: number, period = 36): P => {
  const s = Math.sin((f / period) * Math.PI * 2);
  return { armR: { a: 45 + 20 * s, b: 60 + 15 * s }, armL: { a: -15 - 6 * s, b: -20 }, headTilt: 3 * s };
};

/** merge partial poses (later wins, but bodyY adds) */
export const merge = (...ps: P[]): P => {
  const out: P = {};
  let by = 0;
  for (const p of ps) {
    Object.assign(out, p);
    if (p.bodyY) by += p.bodyY;
  }
  out.bodyY = by;
  return out;
};
