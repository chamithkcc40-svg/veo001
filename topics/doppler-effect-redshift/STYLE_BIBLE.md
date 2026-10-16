# Style bible - doppler-effect-redshift

Source: one reference clip (resources/reference/BAACAgQ...mp4, 71.9 s, 360x640, 30 fps, a flat-vector science explainer about caffeine). Frames sampled every 0.5 s (144), 40 on contact sheets in analysis/ref_contact_1.jpg and _2.jpg, palette chip in analysis/ref_palette.png, numbers in analysis/ref_metrics.json (script analysis/measure_ref.py). We copy the GRAMMAR only. None of its characters (the brain, the woman in the gown, the molecules, the gnome), scenes (receptor membrane, kitchen, bed), layouts or wording are reused. No notes.txt was supplied, so nothing overrides the extracted values.

The reference overrides the 07 art-direction proposal where they conflict: the 07 "4 px ink outline" is dropped, because the reference has NO outlines. The 07 colour ROLES (blue = squeezed/approaching, red = stretched/receding, white = stationary rings, navy space, warm Earth) are kept and re-tuned to the reference's saturation.

## 1. Measured numbers (reference)
| Metric | Value | Method |
|---|---|---|
| Duration | 71.9 s | ffprobe |
| Cuts | 16 (13.4 cuts/min) | frame diff spike > 4x local median or 32-bin histogram distance > 0.35; cross-checked with ffmpeg scene > 0.12 (10 strong cuts; others are soft cuts / match cuts) |
| Shot length | mean 4.2 s, median 3.0 s, min 0.33 s, max 9.9 s | from cut list |
| Share of 0.27 s windows with visible motion | **90.3 %** | mean abs luminance change > 1.5 on 270x480 grey frames, pairs 8 frames apart |
| Mean motion | 13.9 (luma units) | same |
| Longest static stretch | **1.33 s** | longest run of non-moving windows |
| Caption size | glyph band 1.7-2.5 % of frame height (x-height to ascender); approx font size 2.6 % of frame height | white-pixel band scan at 7 timestamps |
| Caption position | top of glyphs at 77.5 % of frame height, centred, width 24-46 % of frame | same |
| Words per caption | 1-4 (typically 2-3) | contact sheets |
| Loudness | -12.0 LUFS integrated, LRA 1.5 LU | ffmpeg ebur128 |

Targets for this film (16:9, 185.7 s voice): about 13 cuts/min means about 41 shots minimum (we plan 40-48 including match cuts and cut-like camera moves); moving share >= 0.9 x 90.3 % = 81 % (aim 90 %+); no static stretch longer than 1.33 s anywhere (rings, breathing, drifting dust and camera drift fill holds); shot length median about 3 s, no shot longer than 10 s without a major camera move or new element.

## 2. Palette (k-means, 12 clusters, roles named)
Reference clusters by share: #35188B 12.6 % (deep violet), #220750 12.2 % (night indigo), #1D8AAA 10.3 % (teal), #D80976 10.3 % (magenta), #7E1ABA 10.1 % (purple), #EBD6F2 9.1 % (lilac white), #EE6289 7.2 % (pink), #6788EF 7.0 % (periwinkle), #B5EEB9 6.5 % (mint), #7A255E 6.2 % (plum), #F9BB47 5.9 % (sun yellow), #80990B 2.6 % (olive).

Production palette (tokens in src/theme.ts). Saturated, cool-violet shadows, warm light; nothing is grey.
| Token | Hex | Role |
|---|---|---|
| night | #1A0B45 | deepest space / shadow base (from #220750) |
| violet | #35188B | space mid, dusk sky top, cel shadows on cool scenes |
| purple | #7E1ABA | secondary surfaces, drapes, domes, rowhouses |
| plum | #7A255E | warm shadows (wood, study) |
| magenta | #D80976 | warm accent, ambulance stripe glow, sunset horizon |
| pink | #EE6289 | skin shadow, warm highlights |
| lilac | #EBD6F2 | off-white (paper, ambulance body, ring "white") |
| sun | #F9BB47 | light sources, candle, Pip hoodie, gold titles |
| teal | #1D8AAA | pond deep, cab interior, kitchen tiles |
| mint | #B5EEB9 | chart-board chalk tint, pond highlights |
| periwinkle | #6788EF | day-sky top, cool rim light |
| olive | #80990B | grass/reeds/lily pads shadow; light tone #A9C61B |
| BLUE (squeezed) | #3D8BFF | approaching / higher pitch / blueshift. Hero accent |
| RED (stretched) | #FF3D5A | receding / lower pitch / redshift. Hero accent |
| galaxy core | #FFF4D6 | glowing cores |
Rules: 60 % base (violet/indigo family or the scene's environment colour), 30 % surfaces, 10 % accents. BLUE and RED are reserved for ring spacing and shifts (never decoration). One glowing hero element per frame.

Time-of-day palettes:
- Golden afternoon (Ch1 street): sky #6788EF -> #F7A6B8 -> #F9BB47 horizon, buildings #7E1ABA/#9B3FD1 with #35188B cel shadow, sun-side rim #FFD98A.
- Dusk (cold open, close): sky #35188B -> #D80976 -> #F9BB47 band, buildings #4A1F8F, windows lit #F9BB47 (flicker).
- Pond (day): water #1D8AAA -> #45B8CF, caustics #B5EEB9 at 25 %, lily pads #80990B/#A9C61B.
- Candle study: walls #7A255E -> #3A1240, candle pool #F9BB47 radial, window night #1A0B45.
- Spring field (train): sky #6788EF -> #B5EEB9, fields #A9C61B / #80990B bands, far hills #7FA0D8 (atmospheric).
- Light lab: #1A0B45 -> #35188B studio, rainbow strip saturated.
- Space: #1A0B45 base, #35188B nebula fog, star dust lilac.
- Chart room: board #0F5C5A -> #134E57 (teal-green chalkboard), chalk #EBF7EE.
- Kitchen: tiles #1D8AAA, counter #D80976 top / #7A255E front, dough #F6D9A8.

## 3. Shape language
- Everything is built from circles, pills, rounded rectangles (corner radius >= 12 % of the short side) and smooth bezier blobs. No hard corners except tiny sparkle stars and the siren flash.
- NO outlines on characters, props or environments (reference). Separation comes from value contrast and a 2-3 px rim highlight on the light side.
- Rings are the only stroked shapes: 4-8 px glowing strokes with round caps, alpha fading with radius.

## 4. Shading and lighting
- Two-tone cel: base + one shadow tone (base mixed 22 % toward #35188B for cool scenes or toward #7A255E for warm scenes), shadow on the side away from the key light; plus a thin rim light (base mixed 35 % toward the key-light colour) on the lit edge.
- Soft radial glows (screen blend / additive) around light sources: sun, candle, lamp windows, siren light, galaxy cores. Glow radius 2-4x the source.
- Light rays: soft-edged radial wedges (as on the reference title card), low opacity (8-15 %), slowly rotating, used at peak/title moments only.
- Every scene gets a grade overlay (soft-light tint of the time-of-day key colour, 10-18 %), a top/bottom gradient, a vignette (edge darkening 22-30 %) and film grain (procedural fractal noise, 4-6 %, re-seeded per frame by offset).

## 5. Texture
- Fine procedural grain everywhere (see 4). Subtle dotted texture on some big surfaces (pond, dough) drawn with seeded dot patterns at 6-10 % opacity. Paper-like soft noise in the study.

## 6. Character construction (applies to all original rigs)
- Proportions: head about 38-45 % of body height (big-head cartoon, the reference's adults are about 1:3, kids 1:2.3).
- Eyes: solid dark ovals (#1A0B45) with one white specular dot top-right; lids are skin-coloured shapes that close over the eye for blinks (4-frame close, 2 hold, 4 open, every 2.5-4.5 s, seeded). Brows are short rounded pills.
- Mouth: simple rounded shapes (closed smile arc, small "o", open smile with tongue, flat line, frown, wide "ooo"); cheeks have a soft pink blush ellipse (#EE6289 at 45 %).
- Hair: big simple masses with one highlight shape.
- Limbs: tapered pills with an elbow/knee joint (two segments), rounded mitten hands with a separate thumb; hands can hold props (prop rendered inside the hand's group so it follows the arm).
- Idle: breathing = torso scaleY 1 +/- 1.2 % at 0.25 Hz with head bob 2 px lagging 6 frames (follow-through); weight shift sway 1 degree.
- Construction is the same rig code for every character (src/kit/rig): head, torso, two arms (upper, fore, hand), two legs (thigh, shin, foot), props. Costume and proportions are parameters.

## 7. Camera habits (reference -> ours)
- Slow push-ins of 3-8 % over a shot; lateral drifts 20-60 px per second; occasional fast whip/zoom-through as a transition (zooming into a body part at 0:19 in the reference).
- Parallax: 3-4 layers in the reference; we use at least 5 (sky, far, mid, near, foreground silhouette) with speed ratios 0.1 / 0.25 / 0.5 / 1.0 / 1.6.
- Depth of field: far layers blurred 2-6 px, foreground silhouettes blurred 6-10 px.
- Handheld feel: only on the street and observatory shots (2-3 px, low-frequency noise).

## 8. Transitions
- Hard cuts for quick beats (reference 0:04, 0:08). Match cuts that keep a central element while the world changes (reference 0:02-0:03). Zoom-through and radial wipes (0:19, 0:53).
- Ours: ring match-cuts (signature), whip-tilt, push-through-window, twist page-curl (used exactly twice), iris/radial ring wipe, dough-to-space dissolve, hard cuts. Never the same transition more than twice in a row.

## 9. Easing and motion
- Snappy springs with overshoot for entrances (damping 11-14, stiffness 160-180), smooth springs for big moves (damping 20), easeOutExpo for slides, easeInOutQuint for camera moves, easeIn exits about 40 % shorter than entrances. Nothing linear except physically constant things (ring radius growth, which must be constant speed by the physics guardrail; the ring's ALPHA still eases).
- Squash and stretch on landings (Skipper 0.8/1.2), anticipation before every jump or big gesture (3-6 frames counter-move), follow-through on hair, scarves, coat tails, antennae.

## 10. Captions
- Font: Nunito 800 (rounded geometric sans like the reference's caption face), white #FFFFFF, soft dark shadow (0 3px 10px rgba(26,11,69,0.75)) plus a 2 px #1A0B45 at 35 % text-stroke shadow for bright scenes. No box.
- Size: reference about 2.6 % of frame height -> on 1080 p, 46 px font. Position: centred, top of glyphs at about 84 % of frame height (y about 905), within the bottom 18 % band and inside the 5 % title-safe margin (bottom of text at most y 1026).
- Pages: 2-5 words, broken at punctuation and phrase boundaries, one line; each page pops in with scale 0.92 -> 1.0 (snappy spring, 6 frames) + rise 8 px; the active word is full white, already-spoken words stay white, upcoming words in the page are 55 % white (karaoke-lite). Words "blue" / "red" / "redshift" take their accent colours.
- Titles (chapter cards, concept labels): Fredoka 600-700, ALL CAPS, letter spacing +0.04em, white or sun yellow with a soft coloured glow; drawn inside the world where 07 says so.

## 11. Pacing grammar
- HIT -> short hold -> build. A new visual element at least every 3 s (07 says 2-3 s); never more than 1.33 s with no visible motion.
- Something moves in the first 15 frames of every shot.

## 12. Sound grammar
- Reference: bright music bed under a compressed upfront voice, pops on text, whooshes on moves, bubbles/ticks on micro-actions, -12 LUFS overall.
- Ours: -14 LUFS (08-sound-design default for YouTube), voice-forward, music ducked 6-10 dB, SFX 2-3 frames before the visual hit.
