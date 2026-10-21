// bundle.mjs - bundle once into out/bundle (reused by stills.mjs / motion.mjs via BUNDLE=out/bundle)
import { bundle } from "@remotion/bundler";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const u = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public"), outDir: path.join(root, "out/bundle") });
console.log("bundled", u);
