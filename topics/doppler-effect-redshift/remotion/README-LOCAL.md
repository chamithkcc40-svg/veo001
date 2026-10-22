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
