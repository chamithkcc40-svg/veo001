// fk.ts - forward kinematics for the shared Rig: where a hand is in world space for a pose.
// Used for hand-held prop interaction (pick up / set down) so props sit exactly in the hand.
// Mirrors Rig.tsx geometry (shoulder, two-segment arm, lean about the hip, squash, scale, flip);
// ignores the sub-pixel idle breathing/sway.
import { BASE_POSE, CharDef, Pose } from "./types";

const rad = (d: number) => (d * Math.PI) / 180;

export const handPos = (def: CharDef, pose: Partial<Pose>, side: "L" | "R", x: number, y: number, scale = 1, flip = false) => {
  const P: Pose = { ...BASE_POSE, ...pose };
  const B = def.build;
  const hipY = -(B.thigh + B.shin);
  const torsoTop = hipY - B.torsoH;
  const shY = torsoTop + B.torsoH * 0.12;
  const shX = (side === "L" ? -1 : 1) * B.torsoW * 0.42;
  const L = side === "L" ? P.armL : P.armR;
  const ex = shX + Math.sin(rad(L.a)) * B.upperArm;
  const ey = shY + Math.cos(rad(L.a)) * B.upperArm;
  const fl = B.foreArm + B.limbW * 0.25;
  const hx = ex + Math.sin(rad(L.a + L.b)) * fl;
  const hy = ey + Math.cos(rad(L.a + L.b)) * fl;
  // lean: rotate about (0, hipY), SVG clockwise for +deg
  const th = rad(P.lean);
  const rx = Math.cos(th) * hx - Math.sin(th) * (hy - hipY);
  const ry = Math.sin(th) * hx + Math.cos(th) * (hy - hipY) + hipY;
  const sqX = 1 + (1 - P.squash) * 0.7;
  const s = scale;
  return { x: x + (flip ? -1 : 1) * rx * sqX * s, y: y + P.bodyY + ry * P.squash * s };
};
