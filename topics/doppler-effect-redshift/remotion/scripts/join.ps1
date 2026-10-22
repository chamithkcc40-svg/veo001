# join.ps1 - join the six chapter renders without re-encoding video, then mux the master mix once.
# Run from topics/doppler-effect-redshift/remotion after rendering every chapter into out/.
$ErrorActionPreference = "Stop"
$ch = "Ch0-ColdOpen","Ch1-Siren","Ch2-Ripples","Ch3-Light","Ch4-Universe","Ch5-Close"
foreach ($c in $ch) { if (-not (Test-Path "out/$c.mp4")) { throw "missing out/$c.mp4 - render it first" } }
$ch | ForEach-Object { "file '$_.mp4'" } | Set-Content -Encoding ascii out/concat.txt
# 1) video only, stream copy (chapters share codec, size, fps and settings)
ffmpeg -y -v error -f concat -safe 0 -i out/concat.txt -map 0:v -c copy out/_video.mp4
# 2) the one deterministic mix (already -14 LUFS / -1.3 dBTP), encoded once, cut to the video length
ffmpeg -y -v error -i out/_video.mp4 -i public/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart out/doppler-effect-full.mp4
Remove-Item out/_video.mp4
$d = ffprobe -v error -show_entries format=duration -of csv=p=0 out/doppler-effect-full.mp4
Write-Host "out/doppler-effect-full.mp4  duration $d s (expected 193.0)"
