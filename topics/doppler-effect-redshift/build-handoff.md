BRANCH: main
Topic: doppler-effect-redshift / framework: remotion / aspect: 16:9 1920x1080 / fps: 30 / target duration: 180 s (script est. 197 s) / final duration: TBD (VO = 185.68 s)

## Task list
- [x] T0 Resources to GitHub + inventory
- [x] T1 Environment and skills
- [ ] T2 Intake and production plan (PRODUCTION_PLAN.md)
- [ ] T3 Style bible (STYLE_BIBLE.md)
- [ ] T4 Voiceover timing
- [ ] T5 Timed storyboard (STORYBOARD.md, data/video.json)
- [ ] T6 Design system and kit
- [ ] T7 Audio build
- [ ] T8.x Chapters (listed after T5)
- [ ] T9 Assembly
- [ ] T10 Final QA
- [ ] T11 Render kit and docs

## Resource inventory
- Location: topics/doppler-effect-redshift/resources/ (from resources.zip, 91 entries)
- Voiceover: voiceover/part_01.mp3 (79.31 s, 44.1 kHz mono; Cold open + Ch1 + Ch2), voiceover/part_02.mp3 (106.37 s, 44.1 kHz mono; Ch3 + Ch4 + Close). Order: part_01 then part_02. Total 185.68 s.
- Reference clips: 1 file, reference/BAACAgQ...PQQ.mp4: 71.91 s, 360x640 (9:16 portrait), 30 fps, stereo 48 kHz audio.
- SFX: 82 files in SFX/ (Camera Shutters 3, Clicks 6, Data Collect 5, Gear 7, Money 4, Pop 6, Risers 5, UI 20 incl. 2 .wma + 1 .xml, Whooshes 19). Generic UI/whoosh library; no siren, water, train, chalk or ambience files.
- Music: none supplied. Ambience: none supplied.
- notes.txt: not supplied (so loudness target comes from 08-sound-design.md: -14 LUFS, TP <= -1 dBTP).

## Environment and tool versions
- Sandbox: 2 vCPU, ~1 GB RAM (low memory: stills with concurrency 1, no full render).
- Node v22.23.2, npm 10.9.8, ffmpeg/ffprobe 7.1.5, Python 3 + numpy 2.3.5, scipy 1.17.1, scikit-learn 1.6.1, opencv 4.11, Pillow 12.3.
- Remotion 4.0.535 pinned exactly for remotion, @remotion/cli, @remotion/bundler, @remotion/renderer, @remotion/google-fonts. React 18.3.1, TypeScript 5.6.3.
- Browser: `npx remotion browser ensure` downloaded chrome-headless-shell into node_modules/.remotion (works).
- Skill: remotion-motion-graphics (SKILL.md, motion-patterns.md, design-rules.md, theme.ts) read from /mnt/skills.
- Transcription: platform audio_transcribe tool (whisper-1, word timestamps) instead of a local model (memory rule).

## Style bible summary (measured numbers)

## Decisions
- Topic folder is topics/doppler-effect-redshift (the prompt said topics/doppler-effect; only the -redshift folder exists and holds the Phase 1 files).
- Resources unzipped to resources/ even though the zip was named resources.zip (prompt mentions reference.zip): same content intent.

## Scores per chapter

## Gaps

## Blockers
- none

## Unverified

## Next action
Run T1: install Remotion project and verify the browser.
