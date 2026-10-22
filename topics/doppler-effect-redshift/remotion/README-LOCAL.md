# Doppler Effect - local render kit (Windows)

Animated documentary, Remotion 4.0.535, 1920x1080, 30 fps, 5790 frames = **193.0 s**.
Six chapter compositions + `Full`. Audio is ONE pre-mixed file (`public/audio/mix.wav`,
-14 LUFS / -1.3 dBTP), so chapter renders join with no audio drift.

## 1. Install once
1. Node.js 22 LTS: https://nodejs.org (or `winget install OpenJS.NodeJS.LTS -e`).
2. FFmpeg: `winget install --id Gyan.FFmpeg -e`, then **open a new terminal**.
3. Check: `node -v` (v22+), `ffmpeg -version`, `ffprobe -version`.

## 2. Install the project
```powershell
git clone https://github.com/chamithkcc40-svg/veo001.git
cd veo001\topics\doppler-effect-redshift\remotion
npm ci
npx remotion browser ensure
npx tsc --noEmit
```
Do not upgrade packages: every `remotion` / `@remotion/*` package is pinned to 4.0.535.

## 3. Preview
```powershell
npx remotion studio src/index.ts
```

## 4. Render per chapter (recommended)
Each chapter is a window onto one global timeline, so the six files join frame-exactly.
Same encoder settings for every chapter are REQUIRED for the stream-copy join below.
```powershell
mkdir out -Force
$ch = "Ch0-ColdOpen","Ch1-Siren","Ch2-Ripples","Ch3-Light","Ch4-Universe","Ch5-Close"
foreach ($c in $ch) {
  npx remotion render src/index.ts $c "out/$c.mp4" --codec h264 --crf 17 --audio-codec aac --audio-bitrate 320k --concurrency 2
}
```
| Composition | Frames (global) | Length |
|---|---|---|
| Ch0-ColdOpen | 0-339 | 11.30 s |
| Ch1-Siren | 339-869 | 17.67 s |
| Ch2-Ripples | 869-2387 | 50.60 s |
| Ch3-Light | 2387-3830 | 48.10 s |
| Ch4-Universe | 3830-5334 | 50.13 s |
| Ch5-Close | 5334-5790 | 15.20 s |

Low RAM? use `--concurrency 1`. Render a single chapter again after an edit; the rest stay valid.
Or render everything in one go: `npx remotion render src/index.ts Full out/full.mp4 --codec h264 --crf 17 --audio-codec aac --audio-bitrate 320k`.
