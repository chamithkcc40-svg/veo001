// KitSheet - one composition per kit piece (Kit-<name>), 1920x1080, 120 frames so motion can be
// checked at several frames. Used for the T6 contact sheets.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { Camera, Layer, Svg } from "../kit/camera";
import { Street } from "../kit/env/Street";
import { Pond } from "../kit/env/Pond";
import { Study, WIN } from "../kit/env/Study";
import { Railway, RAIL } from "../kit/env/Railway";
import { Space } from "../kit/env/Space";
import { CabInterior, CabWindow, LabBg, PineHill, Pines, NightSky, DomeInterior, ChartRoom, Kitchen } from "../kit/env/Interiors";
import { Finish } from "../kit/fx";
import { Rings } from "../kit/info/Rings";
import { PitchLine } from "../kit/info/PitchLine";
import { Galaxy, ExaggeratedTag } from "../kit/info/Galaxy";
import { Barcode } from "../kit/info/Barcode";
import { NameTag, Timeline, LetterTitle, Pill } from "../kit/info/Labels";
import { Ambulance, Train, Speedometer, Telescope, StampCheck, SpiralIcon, Magnifier, Suitcase, GlassPlate } from "../kit/props/Props";
import { Rig } from "../kit/rig/Rig";
import { PIP, NELL, DOPPLER, HORN1, HORN2, HORN3, BUYSBALLOT } from "../kit/rig/characters";
import { Skipper } from "../kit/rig/Skipper";
import { POSE, sway } from "../kit/rig/poses";
import { Captions } from "../kit/Captions";

export const KitSheet: React.FC<{ kit: string }> = ({ kit }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = { x: f * 2, y: 0, zoom: 1 + f * 0.0005, rot: 0, frame: f, shake: 2, seed: kit };
  switch (kit) {
    case "street": {
      const amb = (t: number) => ({ x: 1800 - t * 9, y: 862 });
      return (
        <AbsoluteFill>
          <Camera cam={cam}>
            <Street tod="dusk" frame={f} subject={
              <Svg>
                <Rings id="kr" frame={f} path={(t) => ({ x: amb(t).x - 35 * 0.55, y: 862 - 304 * 0.55 })} start={0} period={7} c={16} maxR={900} tint />
                <Ambulance x={amb(f).x} y={862} scale={0.55} flash={f / 8} wheel={-f * 12} />
                <Rig uid="pip" def={PIP} frame={f} x={520} y={900} scale={1.05} pose={{ ...POSE.cupEars, turn: 0.5, lookX: 1 }} expr="ooo" />
                <PitchLine x={520} y={470} frame={f} pitch={0} step={1} />
              </Svg>
            } />
          </Camera>
          <Finish tint={C.magenta} />
        </AbsoluteFill>
      );
    }
    case "street-golden":
      return (
        <AbsoluteFill>
          <Camera cam={cam}><Street tod="golden" frame={f} subject={<Svg><Rig uid="nell" def={NELL} frame={f} x={900} y={900} pose={POSE.thumbsUpR} expr="happy" /></Svg>} /></Camera>
          <Finish tint={C.sun} />
        </AbsoluteFill>
      );
    case "pond": {
      const sk = (t: number) => ({ x: 700 + Math.max(0, t - 20) * 3.2, y: 540 });
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: f * 1.5, shake: 0 }}>
            <Pond frame={f} subject={
              <Svg>
                <Rings id="pr" frame={f} path={sk} start={0} period={14} c={6} maxR={700} tint width={7} />
                <Skipper uid="sk" frame={f} x={sk(f).x} y={540} scale={1.1} pose={{ swimAmt: 1, stroke: f / 3, scarf: f / 3, scarfAmt: 1, tapLeg: (f % 14) < 3 ? 1 : 0 }} />
              </Svg>
            } />
          </Camera>
          <Finish tint={C.teal} />
        </AbsoluteFill>
      );
    }
    case "study":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: f * 0.6, shake: 0 }}>
            <Study frame={f} starPair={1} subject={<Svg><Rig uid="dop" def={DOPPLER} frame={f} x={1000} y={1000} scale={1.25} pose={{ ...POSE.write, turn: 0.5 }} expr="focused" /></Svg>} />
          </Camera>
          <Finish tint={C.sun} />
          <NameTag f={f} fps={fps} at={10} out={999} name="Christian Doppler" sub="Prague · 1842" />
          <Timeline f={f} fps={fps} at={5} out={999} active={["1842"]} />
        </AbsoluteFill>
      );
    case "rail": {
      const tx = 200 + f * 6;
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: f * 5 }}>
            <Railway frame={f} subject={
              <Svg>
                <g transform={`translate(${tx},${RAIL.track + 18})`}>
                  <Train wheel={f * 6} car={
                    <g>
                      <Rig uid="h1" def={HORN1} frame={f} x={-130} y={0} scale={0.62} pose={{ ...POSE.hornPlay, ...sway(f, 0) }} expr="joy" />
                      <Rig uid="h2" def={HORN2} frame={f} x={0} y={0} scale={0.62} pose={{ ...POSE.hornPlay, ...sway(f, 1.2) }} expr="happy" />
                      <Rig uid="h3" def={HORN3} frame={f} x={130} y={0} scale={0.62} pose={{ ...POSE.hornPlay, ...sway(f, 2.1) }} expr="joy" />
                    </g>
                  } />
                </g>
                <Rig uid="bb" def={BUYSBALLOT} frame={f} x={1300 + f * 5} y={RAIL.track + 160} scale={0.9} pose={POSE.flagUp} expr="focused" />
              </Svg>
            } />
          </Camera>
          <Finish tint={C.oliveLt} />
        </AbsoluteFill>
      );
    }
    case "space":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, shake: 0 }}>
            <Space frame={f} subject={
              <Svg>
                <Galaxy id="g1" x={1250} y={480} r={190} frame={f} shift={Math.sin(f / 20)} />
                <Galaxy id="g2" x={420} y={300} r={70} frame={f} shift={0.6} tilt={0.5} />
                <Galaxy id="g3" x={700} y={760} r={50} frame={f} shift={0.9} tilt={0.3} />
              </Svg>
            } />
          </Camera>
          <Finish tint={C.violet} />
          <ExaggeratedTag />
        </AbsoluteFill>
      );
    case "cab":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: 0, zoom: 1.02, shake: 3 }}>
            <Layer depth={0.3}><CabWindow frame={f} /></Layer>
            <Layer depth={1}><CabInterior frame={f} tagSwing={Math.sin(f / 8) * 14} /></Layer>
            <Layer depth={1}><Svg><Rig uid="nell" def={NELL} frame={f} x={960} y={1300} scale={1.6} pose={POSE.handsOnWheel} expr="neutral" /></Svg></Layer>
          </Camera>
          <Finish tint={C.teal} />
        </AbsoluteFill>
      );
    case "lab":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: 0, shake: 0 }}>
            <Layer depth={0.2}><LabBg frame={f} /></Layer>
            <Layer depth={1}><Svg>
              <Rings id="lr" frame={f} path={(t) => ({ x: 900 + t * 2, y: 520 })} start={0} period={10} c={6} maxR={600} tint wavy={6} />
              <Barcode id="lab" x={460} y={700} w={1000} h={60} label="LAB" ghost />
              <Barcode id="obs" x={460} y={800} w={1000} h={60} shift={0.06 * Math.min(1, f / 60)} />
            </Svg></Layer>
          </Camera>
          <Finish tint={C.violet} />
        </AbsoluteFill>
      );
    case "domes":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: 0, y: -f * 0.6, shake: 0 }}>
            <Layer depth={0.05}><NightSky frame={f} /></Layer>
            <Layer depth={0.25} blur={3}><Pines seed="far" n={30} y={760} scale={[0.4, 0.6]} color={"#2A1066"} frame={f} /></Layer>
            <Layer depth={0.6}><PineHill frame={f} slit={Math.min(1, f / 60)} /></Layer>
            <Layer depth={1}><Pines seed="mid" n={12} y={900} scale={[0.8, 1.1]} color={"#1F0A4F"} frame={f} /></Layer>
            <Layer depth={1.6} blur={8}><Pines seed="near" n={5} y={1180} scale={[1.6, 2.2]} color={C.night} frame={f} /></Layer>
          </Camera>
          <Finish tint={C.violet} />
        </AbsoluteFill>
      );
    case "dome-in":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: 0, shake: 0 }}><Layer depth={0.6}><DomeInterior frame={f} /></Layer></Camera>
          <Finish tint={C.plum} />
        </AbsoluteFill>
      );
    case "chart":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: 0, shake: 0 }}><Layer depth={0.8}><ChartRoom frame={f} /></Layer></Camera>
          <Finish tint={C.board} />
        </AbsoluteFill>
      );
    case "kitchen":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, x: 0, shake: 0 }}><Layer depth={0.8}><Kitchen frame={f} /></Layer></Camera>
          <Finish tint={C.sun} />
        </AbsoluteFill>
      );
    case "props":
      return (
        <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.violet}, ${C.night})` }}>
          <Svg>
            <g transform="translate(260,300)"><Speedometer value={0.62} label="SPEED" /></g>
            <g transform="translate(560,330)"><Telescope scale={0.7} /></g>
            <g transform="translate(860,280)"><StampCheck size={90} /></g>
            <g transform="translate(1120,280)"><SpiralIcon r={70} /></g>
            <g transform="translate(1400,280)"><Magnifier id="mg" r={90}><circle r={10} fill={C.blue} /></Magnifier></g>
            <g transform="translate(1700,380)"><Suitcase scale={0.8} open={0.6} /></g>
            <g transform="translate(300,700)"><GlassPlate><Galaxy id="pg" x={0} y={0} r={30} frame={f} /></GlassPlate></g>
            <g transform="translate(900,900)"><Ambulance flash={0.3} wheel={0} scale={0.6} /></g>
            <g transform="translate(1600,900)"><Ambulance flash={0.7} wheel={0} scale={0.4} facing={1} /></g>
          </Svg>
          <LetterTitle f={f} fps={fps} at={0} text="REDSHIFT" size={80} color={C.red} glow={C.red} y={620} />
          <Pill f={f} fps={fps} at={0} text="SAME SPEED · DIFFERENT SPACING" x={1300} y={680} />
          <Finish />
        </AbsoluteFill>
      );
    case "captions":
      return (
        <AbsoluteFill>
          <Camera cam={{ ...cam, shake: 0 }}><Street tod="golden" frame={f} /></Camera>
          <Finish tint={C.sun} />
          <Captions offset={2700} />
        </AbsoluteFill>
      );
    default:
      return <AbsoluteFill style={{ background: C.night }} />;
  }
};

export const KITS = ["street", "street-golden", "pond", "study", "rail", "space", "cab", "lab", "domes", "dome-in", "chart", "kitchen", "props", "captions"];
