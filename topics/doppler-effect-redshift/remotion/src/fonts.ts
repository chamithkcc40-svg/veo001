// Local copies of Google Fonts (Nunito, Fredoka; both exist in @remotion/google-fonts 4.0.535)
// loaded from public/ so rendering works offline.
import { continueRender, delayRender, staticFile } from "remotion";
import { F } from "./theme";

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fonts");
  const faces = [
    new FontFace(F.body, `url(${staticFile("fonts/Nunito-latin-var.woff2")}) format("woff2")`, { weight: "200 1000" }),
    new FontFace(F.display, `url(${staticFile("fonts/Fredoka-latin-var.woff2")}) format("woff2")`, { weight: "300 700" }),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((fs) => { fs.forEach((f) => (document.fonts as unknown as { add: (x: FontFace) => void }).add(f)); continueRender(handle); })
    .catch((e) => { console.error(e); continueRender(handle); });
};
