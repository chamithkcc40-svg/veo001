// stills.mjs - bundle ONCE, render many stills (concurrency 1, low memory).
// usage: node scripts/stills.mjs out/dir "CompId:frame[,frame...]" ["CompId:frame" ...] [--scale=0.5]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const args = process.argv.slice(2);
const outDir = args[0];
const scaleArg = args.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? Number(scaleArg.split("=")[1]) : 0.5;
const jobs = args.slice(1).filter((a) => !a.startsWith("--"));
fs.mkdirSync(outDir, { recursive: true });
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const serveUrl = process.env.BUNDLE || (await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") }));
const browserExecutable = path.join(root, "node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell");
const comps = {};
for (const j of jobs) {
  const [id, fr] = j.split(":");
  if (!comps[id]) comps[id] = await selectComposition({ serveUrl, id, browserExecutable, inputProps: {} });
  for (const f of (fr || "0").split(",").map(Number)) {
    const output = path.join(outDir, `${id}_${String(f).padStart(5, "0")}.jpg`);
    await renderStill({ composition: comps[id], serveUrl, output, frame: f, imageFormat: "jpeg", jpegQuality: 82, scale, browserExecutable, overwrite: true, chromiumOptions: { gl: "swangle" } });
    console.log("ok", output);
  }
}
