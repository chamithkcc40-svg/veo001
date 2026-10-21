BRANCH: main
Topic: doppler-effect-redshift / framework: remotion / aspect: 16:9 1920x1080 / fps: 30 / target duration: 180 s (script est. 197 s) / final duration: 193.0 s (5790 frames; VO 185.68 s + 0.5 s head + 6.8 s end-screen tail)

## Task list
- [x] T0 Resources to GitHub + inventory
- [x] T1 Environment and skills
- [x] T2 Intake and production plan (PRODUCTION_PLAN.md)
- [x] T3 Style bible (STYLE_BIBLE.md)
- [x] T4 Voiceover timing
- [x] T5 Timed storyboard (STORYBOARD.md, data/video.json: 45 scenes, 6 chapters, 160+ caption pages, 60 sfx cues)
- [x] T6 Design system and kit (src/theme.ts, src/kit/*: 1 jointed rig + 12 chars + Skipper, 12 expressions, walk/gesture/sway/scribble cycles, 10 environments, Rings/PitchLine/Galaxy/Barcode/Timeline/NameTag, fx, Captions; sheets in remotion/review/)
- [x] T7 Audio build (public/audio/mix.wav 48 kHz 16-bit, -14.0 LUFS / -1.3 dBTP; 153 sfx cues in remotion/data/audio/cues.txt; deterministic rebuild via scripts/audio/run_audio.sh)
- [x] T8.0 Cold open (Ch0-ColdOpen, f0-339, 4 scenes; review/ch0/)
- [x] T8.1 Chapter 1 One Siren, Two Sounds (Ch1-Siren, f339-869, 5 scenes; review/ch1/)
- [~] T8.2 Chapter 2 Ripples (Ch2-Ripples, f869-2387, 12 scenes) STOPPED AT: chat 3 start, kit helpers + ch2.tsx being written
- [ ] T8.3 Chapter 3 Light Has a Siren Too (Ch3-Light, f2387-3830, 10 scenes)
- [ ] T8.4 Chapter 4 The Running Universe (Ch4-Universe, f3830-5334, 12 scenes)
- [ ] T8.5 Close (Ch5-Close, f5334-5790, 2 scenes)
- [ ] T9 Assembly
- [ ] T10 Final QA
- [ ] T11 Render kit and docs

## Resource inventory
- VO timing (T4): parts concatenated with no gap (part_01 0.000-79.308 s, part_02 starts at 79.307771 s; total 185.678 s). Global timeline adds a 0.5 s head before "Listen." -> last word ends at 185.71 s global; end-screen tail to 193.0 s (5790 frames).
- Transcript (whisper-1 word timings, remotion/data/transcript/) vs 03-script.md: 492/492 words aligned; only difference is "Slipher's" heard as "sliphers" (apostrophe/respelling only). Numbers (1842, 1910s, 300, 1923, 1929) were transcribed as digits and expanded back. No real word differences.
- Location: topics/doppler-effect-redshift/resources/ (from resources.zip, 91 entries)
- Voiceover: voiceover/part_01.mp3 (79.31 s, 44.1 kHz mono; Cold open + Ch1 + Ch2), voiceover/part_02.mp3 (106.37 s, 44.1 kHz mono; Ch3 + Ch4 + Close). Order: part_01 then part_02. Total 185.68 s.
- Reference clips: 1 file, reference/BAACAgQ...PQQ.mp4: 71.91 s, 360x640 (9:16 portrait), 30 fps, stereo 48 kHz audio.
- SFX: 82 files in SFX/ (Camera Shutters 3, Clicks 6, Data Collect 5, Gear 7, Money 4, Pop 6, Risers 5, UI 20 incl. 2 .wma + 1 .xml, Whooshes 19). Generic UI/whoosh library; no siren, water, train, chalk or ambience files.
- Music: none supplied. Ambience: none supplied.
- notes.txt: not supplied (so loudness target comes from 08-sound-design.md: -14 LUFS, TP <= -1 dBTP).

## Environment and tool versions
- Audio: python soundfile 0.13.1; stems in remotion/audio_build/ (git-ignored), reports copied to remotion/data/audio/.
- Sandbox: 2 vCPU, ~1 GB RAM (low memory: stills with concurrency 1, no full render).
- Node v22.23.2, npm 10.9.8, ffmpeg/ffprobe 7.1.5, Python 3 + numpy 2.3.5, scipy 1.17.1, scikit-learn 1.6.1, opencv 4.11, Pillow 12.3.
- Fonts: Nunito + Fredoka variable latin woff2 downloaded into remotion/public/fonts (both exist in @remotion/google-fonts 4.0.535; loaded via FontFace + staticFile for offline renders).
- Remotion 4.0.535 pinned exactly for remotion, @remotion/cli, @remotion/bundler, @remotion/renderer, @remotion/google-fonts. React 18.3.1, TypeScript 5.6.3.
- Browser: `npx remotion browser ensure` downloaded chrome-headless-shell into node_modules/.remotion (works).
- Skill: remotion-motion-graphics (SKILL.md, motion-patterns.md, design-rules.md, theme.ts) read from /mnt/skills.
- Transcription: platform audio_transcribe tool (whisper-1, word timestamps) instead of a local model (memory rule).

## Style bible summary (measured numbers)
- Reference (1 clip, 71.9 s, 9:16): 13.4 cuts/min (16 cuts), shot mean 4.2 s / median 3.0 s / max 9.9 s; motion share 90.3 % of 0.27 s windows (threshold 1.5 luma); longest static 1.33 s; captions ~2.6 % of frame height at 77.5 % height, 1-4 words; -12.0 LUFS.
- Look: flat vector, NO outlines, two-tone cel + rim light + soft glows, saturated violet/magenta/teal/yellow palette, grain + vignette.
- Our targets: motion share >= 81 % (aim 90 %), static <= 1.33 s, about 41+ shots, captions Nunito 800 46 px at ~84 % height.

## Decisions
- s1_roof keeps the ambulance fixed on screen while the street scrolls (vehicle-follow): this IS Nell's frame, so her rings are even and white, which teaches the point visually.
- Chapter title cards are drawn as in-world objects per 07 (street sign swings in on chains with a damped pendulum) rather than generic overlays.
- Chapters are windows onto one global Film component (src/chapters/Film.tsx + registry.ts); scenes get the global frame: per-chapter renders concatenate exactly into Full and all cue data stays global.
- One <Audio> per composition playing public/audio/mix.wav with trimBefore=chapter start: one deterministic mix, per-chapter renders stay in sync.
- Cold open s0_street and s0_tilt drawn as one continuous component: the whip-tilt is a single camera move, not a cut.
- T7 voice anchor -18 LUFS pre-master, music -14 dB under voice + 8 dB sidechain duck (50/400 ms), ambience 28-36 dB under voice, one -14 LUFS normalisation + 4x true-peak limiter at -1.2 dBFS: 08 targets, one deterministic mix.
- T7 siren, horn and close pass-bys are rendered by a physical moving-source model (retarded time, 1/r, air absorption, pan) instead of a pitch-bend: the drop lands exactly on the visual pass frame (verified 0.6/0.7/1.1/2.0 frames).
- T7 only 17 of 82 supplied SFX are used (whooshes, pops, clicks, riser, stretch); siren, water, chalk, steam, horns, foley, ambience and score are synthesized (seeded numpy/scipy): the library has no matching sounds.
- T7 audio QC by measurement (click detector, voice-to-bed ratio per sentence, per-chapter LUFS, pitch-pass frames) because the media-analysis tool could not listen to audio.
- One shared Rig component (src/kit/rig/Rig.tsx) drives every human character; costumes/builds are data in characters.ts: guarantees consistency, no per-scene redraws.
- Cel shading via hard-stop gradients (rim/base/shadow) instead of outlines: matches the reference's no-outline flat look.
- Rings engine throws if source speed >= ring speed: enforces the 07 no-shock-cone guardrail at render time.
- Timeline markers evenly spaced rather than to-scale: to-scale 1923/1927/1929 labels overlapped and were unreadable.
- Stills script (scripts/stills.mjs) bundles once and renders with the local chrome-headless-shell at concurrency 1: low-memory sandbox.
- 45 scenes (about 14 cuts/min over 193 s) to match the reference's 13.4 cuts/min.
- Caption pages split by a small phrase-aware DP (2-4 words, never ending on 'the/a/of...'), never across sentences: reads like the reference's 1-4 word captions.
- Tail of 6.8 s after the last word: end-screen hold that 06-metadata/07 ask for (not padding: the crane-up continues).
- Dropped the 07 proposal's 4 px ink outline: the reference has no outlines and the reference overrides art direction (07 says so).
- Only one reference clip was supplied (not the three 09 asked for); the style bible uses it for every scene type and keeps 07's colour roles for waves/space.
- Six chapter compositions (cold open and close get their own) plus Full: keeps each per-chapter render short and the join points at natural pauses.
- Chapters drawn on the global frame timeline: per-chapter renders concatenate exactly into Full.
- Topic folder is topics/doppler-effect-redshift (the prompt said topics/doppler-effect; only the -redshift folder exists and holds the Phase 1 files).
- Resources unzipped to resources/ even though the zip was named resources.zip (prompt mentions reference.zip): same content intent.

## Scores per chapter
- Ch0 Cold open (1 loop of rework: void layout, ambulance scale, tilt distance, ring->star dots, caption clearance): story 9, staging 8, character 8, motion 9, depth/light 9, style 9, captions 9, audio sync 9 (siren pass 0.6 f off visual pass), pacing/variety 9. Motion check 95.8 % moving (24 pairs; target 81.3 %). tsc OK, asset audit OK.
- Ch1 One Siren, Two Sounds (1 rework loop: Nell MS scale, sign layout, split-wipe push, roof framing): story 9, staging 8, character 8, motion 9, depth/light 8, style 9, captions 9, audio sync 9 (split pass 0.7 f), pacing/variety 9. Motion 100 % (24 pairs). tsc OK, audit OK.

## Gaps

## Blockers
- none

## Unverified
- T7 mix not auditioned by a human ear (sandbox has no playback; the AI listening tool refused audio). Objective checks passed: 0 click candidates, voice-to-bed >= 7.6 dB on every sentence (median 18.1 dB), chapters -13.6..-14.4 LUFS.

## Next action
T8.2: write src/scenes/ch2.tsx (12 scenes s2_pond ... s2_paper; ripple-ring title, Skipper pond rings A/B, compare split, ear tick bar, speedometers, Doppler study + suitcase memory, railway horns pass at sync.hornsPass, twist page-curl, title-page push through window), register CH2, then stills + motion check.
