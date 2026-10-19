// motion.mjs - motion check (T8c): N sample points across a chapter, each a pair of stills 8 frames
// apart at 480x270; a pair "moves" if mean abs luma change > 1.5 (STYLE_BIBLE 1 method).
// usage: BUNDLE=out/bundle node scripts/motion.mjs <CompId> [N=24]  -> out/motion/<CompId>.json
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const [id, nArg] = process.argv.slice(2);
const N = Number(nArg || 24);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const serveUrl = process.env.BUNDLE || path.join(root, "out/bundle");
const browserExecutable = path.join(root, "node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell");
const comp = await selectComposition({ serveUrl, id, browserExecutable, inputProps: {} });
const dir = path.join(root, "out/motion", id);
fs.mkdirSync(dir, { recursive: true });
const D = comp.durationInFrames;
const pts = Array.from({ length: N }, (_, i) => Math.round(((i + 0.5) / N) * (D - 9)));
const res = [];
for (const p of pts) {
  const files = [];
  for (const fr of [p, p + 8]) {
    const out = path.join(dir, `${String(fr).padStart(5, "0")}.png`);
    await renderStill({ composition: comp, serveUrl, output: out, frame: fr, imageFormat: "png", scale: 0.25, browserExecutable, overwrite: true, chromiumOptions: { gl: "swangle" } });
    files.push(out);
  }
  const d = Number(execFileSync("python3", ["-c", `
import sys,numpy as np
from PIL import Image
a=np.asarray(Image.open(sys.argv[1]).convert('L'),float);b=np.asarray(Image.open(sys.argv[2]).convert('L'),float)
print(np.abs(a-b).mean())`, ...files]).toString());
  res.push({ frame: p, diff: +d.toFixed(2), moving: d > 1.5 });
  console.log(p, d.toFixed(2));
}
const share = res.filter((r) => r.moving).length / res.length;
const summary = { id, samples: N, movingShare: +share.toFixed(3), refShare: 0.903, target: +(0.9 * 0.903).toFixed(3), pass: share >= 0.9 * 0.903, res };
fs.writeFileSync(path.join(root, "out/motion", `${id}.json`), JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ id, movingShare: summary.movingShare, target: summary.target, pass: summary.pass }));
