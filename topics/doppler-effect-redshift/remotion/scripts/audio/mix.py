"""T7 offline mix: voice + ducked music + ambience + sfx -> public/audio/mix.wav

- Ducking: sidechain from the voice envelope (attack 50 ms, release 400 ms), music -8 dB and
  ambience -2 dB while the voice speaks (08 sec. 5: 6-10 dB).
- One loudness normalisation of the summed mix to -14 LUFS integrated (08 default; no notes.txt),
  then a 4x-oversampled look-ahead limiter at -1.2 dBFS so true peak stays <= -1 dBTP.
- Verified with this module's BS.1770 meter and with ffmpeg ebur128 (report in audio_build/mix_report.json).
"""
import json
import os
import subprocess
import sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from dsp import SR, lufs, db, env_follow, limiter, true_peak_db, smoothstep, max_momentary  # noqa: E402

ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
B = os.path.join(ROOT, 'audio_build')
OUTDIR = os.path.join(ROOT, 'public', 'audio')
TARGET = -14.0
CEIL = -1.2
DUCK_MUSIC = 8.0
DUCK_AMB = 2.0
os.makedirs(OUTDIR, exist_ok=True)


def rd(name):
    x, sr = sf.read(os.path.join(B, name), dtype='float32', always_2d=False)
    assert sr == SR
    return x


def main():
    v = rd('voice.wav')
    n = len(v)
    # sidechain key: voice envelope -> 0..1 "speaking" amount
    e = env_follow(v, attack=0.05, release=0.4)
    edb = 20 * np.log10(e + 1e-9)
    act = smoothstep((edb + 40) / 10).astype(np.float32)  # -40 dB -> 0, -30 dB -> 1
    # final smoothing so the duck itself never clicks (attack ~50 ms, release ~400 ms)
    from scipy import signal
    ka, kr = np.exp(-1 / (0.05 * SR)), np.exp(-1 / (0.4 * SR))
    fast = signal.lfilter([1 - ka], [1, -ka], act)
    slow = signal.lfilter([1 - kr], [1, -kr], act)
    duck = np.maximum(fast, slow).astype(np.float32)
    duck = np.clip(duck, 0, 1)
    del fast, slow, act, e, edb

    mix = np.zeros((n, 2), np.float32)
    mix += v[:, None]
    m = rd('music.wav')[:n]
    mix += m * db(-DUCK_MUSIC * duck)[:, None]
    del m
    a = rd('amb.wav')[:n]
    mix += a * db(-DUCK_AMB * duck)[:, None]
    del a
    s = rd('sfx.wav')[:n]
    mix += s
    del s

    pre = lufs(mix)
    mix *= db(TARGET - pre)
    mix, gr = limiter(mix, ceiling_db=CEIL, lookahead=0.005, release=0.08)
    post = lufs(mix)
    # tiny trim if the limiter pulled integrated loudness down (re-limit once)
    if abs(post - TARGET) > 0.2:
        mix *= db(TARGET - post)
        mix, gr2 = limiter(mix, ceiling_db=CEIL, lookahead=0.005, release=0.08)
        gr = max(gr, gr2)
        post = lufs(mix)
    tp = true_peak_db(mix)
    # 16-bit TPDF dither
    r = np.random.default_rng(2026)
    d = (r.random(mix.shape) - r.random(mix.shape)).astype(np.float32) / 32768.0
    out = np.clip(mix + d, -1, 1)
    path = os.path.join(OUTDIR, 'mix.wav')
    sf.write(path, out, SR, subtype='PCM_16')
    # ducking stats
    rep = dict(file='public/audio/mix.wav', sr=SR, seconds=n / SR, pre_norm_lufs=round(pre, 2),
               integrated_lufs_internal=round(post, 2), true_peak_dbtp_internal=round(tp, 2),
               limiter_max_gr_db=round(-20 * np.log10(max(1e-9, 1 - gr)), 2),
               max_momentary_lufs=round(max_momentary(mix), 2), duck_music_db=DUCK_MUSIC, duck_amb_db=DUCK_AMB,
               voice_active_share=round(float(np.mean(duck > 0.5)), 3))
    # independent check with ffmpeg ebur128 (true peak)
    p = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    summ = p[p.rfind('Summary:'):]
    import re
    I = re.search(r'I:\s+(-?[\d.]+) LUFS', summ)
    LRA = re.search(r'LRA:\s+(-?[\d.]+) LU', summ)
    TP = re.search(r'Peak:\s+(-?[\d.]+) dBFS', summ)
    rep['ffmpeg_integrated_lufs'] = float(I.group(1)) if I else None
    rep['ffmpeg_lra_lu'] = float(LRA.group(1)) if LRA else None
    rep['ffmpeg_true_peak_dbfs'] = float(TP.group(1)) if TP else None
    json.dump(rep, open(os.path.join(B, 'mix_report.json'), 'w'), indent=1)
    print(json.dumps(rep, indent=1))


if __name__ == '__main__':
    main()
