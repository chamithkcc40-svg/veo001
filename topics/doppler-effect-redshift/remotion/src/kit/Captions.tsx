// Captions - word-synced pages from data/video.json (STYLE_BIBLE 10). Nunito 800 46 px, white,
// soft dark shadow, centred, glyph top ~y 905 (inside the bottom 18 % band, 5 % title-safe).
// Page pops in (scale 0.92->1 + rise 8 px, snappy spring); spoken words full white, upcoming 55 %.
// "blue" / "red" / "redshift" take their accent colours. Works on the GLOBAL frame.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { V } from "../data";
import { C, F, SAFE, spr } from "../theme";
import { alpha, sp } from "../util";

const accent = (w: string) => {
  const k = w.toLowerCase().replace(/[^a-z]/g, "");
  if (k === "blue") return C.blue;
  if (k === "red" || k === "redshift") return C.red;
  return null;
};

export const Captions: React.FC<{ offset?: number; hidden?: (f: number) => boolean; yFor?: (f: number) => number }> = ({ offset = 0, hidden, yFor }) => {
  const local = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = local + offset; // global frame
  if (hidden && hidden(f)) return null;
  const page = V.pages.find((p) => f >= p.s && f < p.e);
  if (!page) return null;
  const pin = sp(f, page.s, fps, spr.snappy, 8);
  // exit: last 4 frames of a page only if the next page does not start immediately (sentence end)
  const next = V.pages.find((p) => p.s >= page.e - 1 && p.s <= page.e + 1);
  const ex = next ? 0 : Math.max(0, Math.min(1, (f - (page.e - 5)) / 5));
  const top = yFor ? yFor(f) : SAFE.capTop - 8;
  return (
    <div style={{ position: "absolute", left: 0, top, width: 1920, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        display: "flex", gap: 14, fontFamily: F.body, fontWeight: 800, fontSize: 46, lineHeight: 1.2,
        transform: `translateY(${(1 - pin) * 8 + ex * 6}px) scale(${0.92 + 0.08 * pin})`, opacity: Math.min(1, pin * 1.6) * (1 - ex),
        textShadow: `0 3px 10px ${alpha(C.night, 0.75)}, 0 0 2px ${alpha(C.night, 0.35)}`,
        padding: "4px 22px", maxWidth: 1920 - 2 * SAFE.x,
      }}>
        {page.w.map((wi) => {
          const w = V.words[wi];
          const spoken = f >= w.s;
          const ac = accent(w.text);
          return (
            <span key={wi} style={{ color: ac ?? C.white, opacity: spoken ? 1 : 0.55, transform: `translateY(${spoken ? 0 : 2}px)`, display: "inline-block" }}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
};
