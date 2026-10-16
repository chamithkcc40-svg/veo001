# 09 - Resources checklist: what goes into reference.zip

Build `reference.zip` with this layout. File names must match exactly, because Prompt B reads them by name.

```
reference.zip
├── notes.txt
├── voiceover/
│   ├── vo_part1_coldopen_ch1_ch2.mp3
│   └── vo_part2_ch3_ch4_close.mp3
├── music/
│   └── music_doppler_score_90bpm.wav
├── sfx/
│   └── (the 45 sfx_*.wav files listed in 08-sound-design.md §6)
├── ambience/
│   └── (the 9 amb_*.wav files listed in 08-sound-design.md §6)
└── reference-clips/
    ├── ref1_style_character.mp4
    ├── ref2_wave_motion.mp4
    └── ref3_space_glow.mp4
```

## 1. Voiceover (from 05-voiceover-v4.md)
- [ ] `vo_part1_coldopen_ch1_ch2.mp3`: Part 1 of 2 (1,383 characters, about 88 s)
- [ ] `vo_part2_ch3_ch4_close.mp3`: Part 2 of 2 (1,817 characters, about 108 s)
- [ ] Use the same voice and the same Stability/Similarity settings for both. Use Eleven v4.
- [ ] Listen for the names Slipher (SLY-fer) and Lemaître (luh-MET-ruh). Fix them per the re-generation guide if needed.
- [ ] Normalize both files to the same loudness. Note the real durations in notes.txt.

## 2. Sound effects
- [ ] All 45 `sfx_*.wav` files from 08-sound-design.md §6. Most important: `sfx_siren_doppler_passby_synth.wav` (it must clearly rise and then drop), `sfx_siren_steady_muffled_cab.wav` (constant pitch), `sfx_horns_steady_note_doppler_passby.wav`, `sfx_water_plip_tap.wav`, `sfx_twist_pagecurl_harp.wav`, `sfx_sine_glide_falling_long.wav`.
- [ ] Sources: royalty-free libraries or generated (for example with a sound-effect generator). Keep a license note for each file in notes.txt.

## 3. Ambience
- [ ] The 9 `amb_*.wav` beds (loopable, 30-60 s each).

## 4. Music
- [ ] `music_doppler_score_90bpm.wav`: royalty-free or generated, about 3:30 long, following the brief in 08 §1. If you can't get one continuous track, add 3 stems instead: `music_earth_playful.wav`, `music_space_wonder.wav`, `music_peak_resolve.wav`.

## 5. Reference clips (2-3 short clips, 5-20 s each; style only, never content)
| File | What it should demonstrate |
|---|---|
| `ref1_style_character.mp4` | The **cartoon look**: line weight, flat cel shading, how characters move and emote (squash and stretch, blinks), and the colour mood. Any flat 2D vector explainer style you like. |
| `ref2_wave_motion.mp4` | **Wave/ripple motion grammar**: concentric rings spreading on water, or a clean Doppler ring animation. Shows ring thickness, fade, speed and how a moving source bunches rings. This is the key reference for the pond and siren scenes. |
| `ref3_space_glow.mp4` | **Space scenes**: how glows, stars and a spiral galaxy are rendered, plus parallax camera moves. Used for the blue-to-red glowing galaxy and the expansion pull-back. |

Prompt B takes the grammar of these clips (palette, line, motion, timing), never their characters, logos or compositions.

## 6. notes.txt (template, copy into the zip)
```
TOPIC: doppler-effect-redshift
REPO FOLDER: topics/doppler-effect-redshift/ (branch: main)
FORMAT: 1920x1080, 16:9, YouTube, 30 fps
SCRIPT (source of truth for captions): 03-script.md
VOICEOVER FILES:
  vo_part1_coldopen_ch1_ch2.mp3  real duration: __:__  (Cold open, Ch1, Ch2)
  vo_part2_ch3_ch4_close.mp3     real duration: __:__  (Ch3, Ch4, Close)
VOICE: <voice name / id>, Eleven v4, Stability <value>, Similarity <value>
VISUALS: follow 07-visual-treatment.md beats 1-57; reference clips override art direction only.
MUST-HAVES: pond ripple animations (stationary then moving source); glowing galaxy shifting blue to red with "colours exaggerated" tag; Hubble diagram marked "schematic".
SOUND: 08-sound-design.md; mix about -14 LUFS, voice-forward, music ducked 6-10 dB.
LICENSES: <one line per music/sfx file: source + license>
REFERENCE CLIPS:
  ref1_style_character.mp4 - cartoon look and character motion
  ref2_wave_motion.mp4 - ripple / ring motion
  ref3_space_glow.mp4 - galaxy glow and space camera
```

## Next: make reference.zip, switch skills, and run Prompt B.
