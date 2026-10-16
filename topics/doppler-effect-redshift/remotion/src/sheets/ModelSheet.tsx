// ModelSheet - contact sheet per character: 6+ expressions, turnaround, key poses, walk frames.
// Composition "Sheet-<name>" (frame selects nothing; 1 frame). Used to keep rigs consistent.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { Rig } from "../kit/rig/Rig";
import { CharDef, Expression } from "../kit/rig/types";
import { POSE, walk, merge, P } from "../kit/rig/poses";
import { Skipper } from "../kit/rig/Skipper";
import { Horn, Notebook, Quill, Flag, GlassPlate } from "../kit/props/Props";
import { Finish } from "../kit/fx";

const EXPRS: Expression[] = ["neutral", "happy", "joy", "surprised", "ooo", "curious", "puzzled", "sheepish", "focused", "sad", "proud", "wince"];

const Cell: React.FC<{ x: number; y: number; label: string; children: React.ReactNode }> = ({ x, y, label, children }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-70} y={-150} width={140} height={175} rx={18} fill="rgba(255,255,255,0.06)" />
    {children}
    <text y={18} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={15} fill={C.lilac}>{label}</text>
  </g>
);

export const ModelSheet: React.FC<{ def: CharDef; propR?: string }> = ({ def }) => {
  const H = def.build.thigh + def.build.shin + def.build.torsoH + def.build.headR * 2.2;
  const sHead = 0.95;
  const poseScale = Math.min(1, 300 / H);
  const propFor = (k: string) => {
    if (k === "horn") return <g transform="rotate(-90)"><Horn scale={0.9} /></g>;
    if (k === "quill") return <Quill scale={0.6} />;
    if (k === "flag") return <g transform="rotate(180)"><Flag frame={10} /></g>;
    if (k === "plate") return <g transform="translate(0,40)"><GlassPlate w={90} h={64} /></g>;
    if (k === "notebook") return <Notebook />;
    return null;
  };
  const keyPoses: [string, P, Expression, string?][] = [
    ["stand", POSE.stand, "neutral"],
    ["cup ears", POSE.cupEars, "ooo"],
    ["thumbs up", POSE.thumbsUpR, "happy"],
    ["point up", POSE.pointUpR, "curious"],
    ["shrug", POSE.shrug, "sheepish"],
    ["write", POSE.write, "focused", "quill"],
    ["hold up", POSE.holdUp, "surprised", "plate"],
    ["arms wide", POSE.armsWide, "joy"],
  ];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.violet}, ${C.night})` }}>
      <svg width={1920} height={1080}>
        <text x={60} y={70} fontFamily={F.display} fontWeight={700} fontSize={48} fill={C.sun}>{def.name.toUpperCase()} · MODEL SHEET</text>
        <text x={60} y={104} fontFamily={F.body} fontWeight={700} fontSize={20} fill={C.lilac}>one rig (src/kit/rig) · 12 expressions · turnaround · key poses · walk cycle (6 of 24 frames) · prop hold</text>
        {/* expressions: head-only crops via clip */}
        {EXPRS.map((e, i) => (
          <Cell key={e} x={110 + (i % 12) * 150} y={300} label={e}>
            <g transform={`translate(0,${-def.build.headR * 0.2})`}>
              <clipPath id={`clip-${e}`}><rect x={-70} y={-150} width={140} height={160} rx={18} /></clipPath>
              <g clipPath={`url(#clip-${e})`}>
                <Rig uid={`ex-${e}`} def={def} frame={0} expr={e} blink={0} idle={0}
                  x={0} y={(def.build.thigh + def.build.shin + def.build.torsoH) * sHead - 30 + def.build.headR * 0.9} scale={sHead} />
              </g>
            </g>
          </Cell>
        ))}
        {/* turnaround */}
        {[-1, -0.5, 0, 0.5, 1].map((t, i) => (
          <g key={t}>
            <Rig uid={`turn-${i}`} def={def} frame={0} pose={{ turn: t, lookX: t }} idle={0} blink={0} x={140 + i * 170} y={720} scale={poseScale} />
            <text x={140 + i * 170} y={750} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={15} fill={C.lilac}>turn {t}</text>
          </g>
        ))}
        {/* key poses */}
        {keyPoses.map(([n, p, e, prop], i) => (
          <g key={n}>
            <Rig uid={`kp-${i}`} def={def} frame={i * 7} pose={p} expr={e} idle={0} blink={0} x={1000 + (i % 4) * 230} y={i < 4 ? 690 : 1050} scale={poseScale * 0.92}
              propR={prop ? propFor(prop) : undefined} />
            <text x={1000 + (i % 4) * 230} y={i < 4 ? 718 : 1074} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={15} fill={C.lilac}>{n}</text>
          </g>
        ))}
        {/* walk cycle */}
        {[0, 4, 8, 12, 16, 20].map((fr, i) => (
          <g key={fr}>
            <Rig uid={`wk-${i}`} def={def} frame={fr} pose={merge(walk(fr), { turn: 0.6, lookX: 0.8 })} idle={0} blink={0} x={110 + i * 140} y={1040} scale={poseScale * 0.8} />
          </g>
        ))}
        <text x={60} y={810} fontFamily={F.body} fontWeight={800} fontSize={16} fill={C.lilac}>walk cycle f0-f20 →</text>
      </svg>
      <Finish grain={0.04} vig={0.2} />
    </AbsoluteFill>
  );
};

export const SkipperSheet: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.teal}, #135E78)` }}>
    <svg width={1920} height={1080}>
      <text x={60} y={70} fontFamily={F.display} fontWeight={700} fontSize={48} fill={C.sun}>SKIPPER · MODEL SHEET</text>
      {[
        ["idle", {}], ["tap down", { tapLeg: 1 }], ["swim A", { swimAmt: 1, stroke: 0, scarfAmt: 1, scarf: 1 }], ["swim B", { swimAmt: 1, stroke: Math.PI / 2, scarfAmt: 1, scarf: 2.4 }],
        ["look back", { lookBack: 1, expr: "surprised" }], ["landing squash", { squash: 0.8 }], ["proud bow", { bow: 1, expr: "proud" }], ["focused", { expr: "focused", antenna: 12 }],
      ].map(([n, p], i) => (
        <g key={n as string}>
          <Skipper uid={`sk${i}`} frame={i * 5} pose={p as object} x={260 + (i % 4) * 440} y={i < 4 ? 340 : 760} scale={1.5} />
          <text x={260 + (i % 4) * 440} y={i < 4 ? 520 : 940} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={22} fill={C.white}>{n as string}</text>
        </g>
      ))}
    </svg>
    <Finish grain={0.04} vig={0.2} />
  </AbsoluteFill>
);
