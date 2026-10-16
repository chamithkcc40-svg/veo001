// Rig.tsx - the ONE jointed SVG character system (head, torso, two-segment arms with
// hands, two-segment legs with feet, props in hands). Every human character in the film
// is a CharDef rendered by this component; nothing is redrawn per scene.
//
// Angle convention (screen space): limb angle 0 = hanging straight down; positive swings the
// end toward screen-right. Elbow/knee bend b is added relative to the upper segment.
// Root origin = midpoint between the feet on the ground.
import React from "react";
import { C } from "../../theme";
import { alpha, blinkAt, mix } from "../../util";
import { BASE_POSE, CharDef, Expression, Pose } from "./types";
import { Hair, HatShape } from "./Hair";
import { Face } from "./Face";
import { Hand } from "./Hand";
import { Outfit } from "./Outfit";

export type RigProps = {
  def: CharDef;
  pose?: Partial<Pose>;
  expr?: Expression;
  frame: number; // drives idle breathing + blink (any monotonic frame)
  x?: number;
  y?: number;
  scale?: number;
  flip?: boolean;
  light?: -1 | 1; // key light from screen-left (-1) or right (1)
  propL?: React.ReactNode; // rendered in the left hand's local space (upright)
  propR?: React.ReactNode;
  propBehindL?: boolean;
  follow?: number; // follow-through angle for hair/coat tails (deg)
  idle?: number; // breathing amplitude multiplier (default 1)
  blink?: number; // override blink amount 0..1
  uid: string; // unique id prefix for gradients
  sepia?: number; // 0..1 desaturate toward sepia (memory beats)
  silhouette?: string; // draw as flat silhouette in this colour
};

const SH_COOL = C.violet;

export const Rig: React.FC<RigProps> = (p) => {
  const { def, frame, uid } = p;
  const pose: Pose = { ...BASE_POSE, ...(p.pose || {}) };
  const B = def.build;
  const K = def.costume;
  const light = p.light ?? -1;
  const idleAmt = p.idle ?? 1;
  const t = frame / 30;

  // breathing (0.25 Hz), head bob lagging 6 frames (follow-through), weight-shift sway
  const breath = Math.sin(2 * Math.PI * 0.25 * t) * 0.012 * idleAmt;
  const headBob = Math.sin(2 * Math.PI * 0.25 * (t - 6 / 30)) * 2 * idleAmt;
  const sway = Math.sin(2 * Math.PI * 0.11 * t + 1.3) * 1 * idleAmt;
  const blink = p.blink ?? blinkAt(frame, def.seed);

  const sil = p.silhouette;
  const sep = p.sepia ?? 0;
  const col = (c: string) => (sil ? sil : sep > 0 ? mix(c, mix(C.sepia, c, 0.35), sep) : c);

  const legLen = B.thigh + B.shin;
  const hipY = -legLen;
  const torsoTop = hipY - B.torsoH;
  const shoulderY = torsoTop + B.torsoH * 0.12;
  const shoulderX = B.torsoW * 0.42;
  const neckY = torsoTop + 2;

  // gradients: hard-stop cel shading with rim on the lit side (no outlines)
  const cel = (name: string, base: string, warm = false) => {
    const b = col(base);
    const sh = sil ? b : mix(b, warm ? C.plum : SH_COOL, warm ? 0.14 : 0.24);
    const so = warm ? 0.74 : 0.66;
    const rim = sil ? b : mix(b, C.sunLt, 0.38);
    const lit = light < 0;
    return (
      <linearGradient id={`${uid}-${name}`} x1={lit ? "0" : "1"} y1="0" x2={lit ? "1" : "0"} y2="0">
        <stop offset="0" stopColor={rim} />
        <stop offset="0.07" stopColor={rim} />
        <stop offset="0.07" stopColor={b} />
        <stop offset={so} stopColor={b} />
        <stop offset={so} stopColor={sh} />
        <stop offset="1" stopColor={sh} />
      </linearGradient>
    );
  };
  const g = (name: string) => `url(#${uid}-${name})`;

  const limb = (len: number, w: number, fill: string) => (
    <rect x={-w / 2} y={-w * 0.15} width={w} height={len + w * 0.3} rx={w / 2} fill={fill} />
  );

  // ARM chain
  const arm = (side: "L" | "R") => {
    const L = side === "L" ? pose.armL : pose.armR;
    const sx = side === "L" ? -shoulderX : shoulderX;
    const hand = side === "L" ? pose.handL : pose.handR;
    const prop = side === "L" ? p.propL : p.propR;
    const total = L.a + L.b;
    return (
      <g transform={`translate(${sx},${shoulderY}) rotate(${-L.a})`}>
        {limb(B.upperArm, B.limbW, g("sleeve"))}
        <g transform={`translate(0,${B.upperArm}) rotate(${-L.b})`}>
          {limb(B.foreArm, B.limbW * 0.92, g("sleeve"))}
          {/* cuff */}
          <rect x={-B.limbW * 0.5} y={B.foreArm - B.limbW * 0.35} width={B.limbW} height={B.limbW * 0.38} rx={B.limbW * 0.19} fill={col(mix(K.sleeve, C.white, 0.12))} />
          <g transform={`translate(0,${B.foreArm + B.limbW * 0.25})`}>
            {prop && p.propBehindL && side === "L" ? <g transform={`rotate(${total})`}>{prop}</g> : null}
            <Hand kind={hand} r={B.limbW * 0.62} skin={col(K.skin)} shade={col(K.skinSh)} side={side} worldRot={total} />
            {prop && !(p.propBehindL && side === "L") ? <g transform={`rotate(${total})`}>{prop}</g> : null}
          </g>
        </g>
      </g>
    );
  };

  const leg = (side: "L" | "R") => {
    const L = side === "L" ? pose.legL : pose.legR;
    const hx = side === "L" ? -B.torsoW * 0.22 : B.torsoW * 0.22;
    const footDir = pose.turn > 0.3 ? 1 : pose.turn < -0.3 ? -1 : side === "L" ? -0.4 : 0.4;
    return (
      <g transform={`translate(${hx},${hipY}) rotate(${-L.a})`}>
        {limb(B.thigh, B.legW, g("legs"))}
        <g transform={`translate(0,${B.thigh}) rotate(${-L.b})`}>
          {limb(B.shin, B.legW * 0.9, g("legs"))}
          <g transform={`translate(0,${B.shin}) rotate(${L.a + L.b})`}>
            <ellipse cx={footDir * B.legW * 0.45} cy={B.legW * 0.12} rx={B.legW * 0.95} ry={B.legW * 0.5} fill={col(K.shoes)} />
            <ellipse cx={footDir * B.legW * 0.45 - light * B.legW * 0.2} cy={-B.legW * 0.05} rx={B.legW * 0.5} ry={B.legW * 0.16} fill={sil ? col(K.shoes) : alpha(C.white, 0.22)} />
          </g>
        </g>
      </g>
    );
  };

  const sq = pose.squash;
  const sqX = 1 + (1 - sq) * 0.7;
  const headR = B.headR;
  const headCY = neckY - headR * 0.82 + headBob * 0.5;

  // which arm is drawn behind the torso: the one on the far side when turned
  const backArm: "L" | "R" = pose.turn > 0.25 ? "L" : pose.turn < -0.25 ? "R" : "L";
  const frontArm: "L" | "R" = backArm === "L" ? "R" : "L";
  const turned = Math.abs(pose.turn) > 0.25;

  return (
    <g transform={`translate(${p.x ?? 0},${(p.y ?? 0) + pose.bodyY}) scale(${(p.flip ? -1 : 1) * (p.scale ?? 1)},${p.scale ?? 1})`}>
      <defs>
        {cel("top", K.top)}
        {cel("top2", K.top2)}
        {cel("sleeve", K.sleeve)}
        {cel("legs", K.legs)}
        {cel("skin", K.skin, true)}
        {cel("hair", K.hair)}
        {cel("hat", K.hatColor)}
      </defs>
      {/* contact shadow */}
      {!sil && <ellipse cx={0} cy={4} rx={B.torsoW * 0.75} ry={B.legW * 0.45} fill={alpha(C.night, 0.28)} />}
      <g transform={`scale(${sqX},${sq})`}>
        {leg("L")}
        {leg("R")}
        <g transform={`rotate(${pose.lean + sway * 0.4},0,${hipY})`}>
          {turned ? arm(backArm) : null}
          {/* torso with breathing */}
          <g transform={`translate(0,${hipY}) scale(1,${1 + breath}) translate(0,${-hipY})`}>
            <Outfit def={def} hipY={hipY} top={torsoTop} g={g} col={col} follow={p.follow ?? 0} turn={pose.turn} light={light} />
          </g>
          {/* neck */}
          <rect x={-headR * 0.2} y={neckY - headR * 0.35} width={headR * 0.4} height={headR * 0.5} rx={headR * 0.18} fill={col(K.skinSh)} />
          {/* head */}
          <g transform={`rotate(${pose.headTilt},0,${neckY})`}>
            <g transform={`translate(${pose.turn * headR * 0.06},${headCY})`}>
              <Hair def={def} r={headR} layer="back" col={col} g={g} follow={p.follow ?? 0} turn={pose.turn} />
              {/* ears */}
              {[-1, 1].map((s) => {
                const vis = s * pose.turn < 0.6;
                if (!vis) return null;
                const ex = s * headR * (0.93 - Math.max(0, s * pose.turn) * 0.25) - pose.turn * headR * 0.15;
                const es = B.earSize;
                return (
                  <g key={s}>
                    <ellipse cx={ex} cy={headR * 0.08} rx={headR * 0.2 * es} ry={headR * 0.28 * es} fill={col(K.skin)} />
                    <ellipse cx={ex + s * headR * 0.02} cy={headR * 0.1} rx={headR * 0.1 * es} ry={headR * 0.16 * es} fill={col(K.skinSh)} />
                  </g>
                );
              })}
              <ellipse cx={0} cy={0} rx={headR} ry={headR * 1.02} fill={g("skin")} />
              {!sil && (
                <Face uid={uid} r={headR} expr={p.expr ?? "neutral"} blink={blink} lookX={pose.lookX} lookY={pose.lookY} turn={pose.turn}
                  skin={col(K.skin)} skinSh={col(K.skinSh)} blush={K.blushAmt} glasses={K.glasses} sideburns={!!K.sideburns} hair={col(K.hair)} />
              )}
              <Hair def={def} r={headR} layer="front" col={col} g={g} follow={p.follow ?? 0} turn={pose.turn} />
              <HatShape def={def} r={headR} col={col} g={g} turn={pose.turn} />
            </g>
          </g>
          {arm(frontArm)}
          {!turned ? arm(backArm) : null}
        </g>
      </g>
    </g>
  );
};
