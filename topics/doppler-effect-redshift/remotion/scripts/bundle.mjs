// bundle once to out/bundle (reuse with BUNDLE=out/bundle for stills.mjs / motion.mjs)
import { bundle } from "@remotion/bundler";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public"), outDir: path.join(root, "out/bundle") });
console.log(out);
