"""T7 verification: voice alignment, siren/horn pitch-drop frames, per-chapter loudness, sfx-vs-voice levels.
Writes audio_build/verify_report.json and prints a summary."""
import json, os, sys
import numpy as np, soundfile as sf
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, lufs
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
B = os.path.join(ROOT, 'audio_build')
V = json.load(open(os.path.join(ROOT, 'data', 'video.json')))
FPS = V['fps']
rep = {}
v, _ = sf.read(os.path.join(B, 'voice.wav'), dtype='float32')
# 1 voice onset vs first word
env = np.convolve(np.abs(v), np.ones(240) / 240, 'same')
on = np.argmax(env > 0.01) / SR
rep['voice_onset_s'] = round(on, 3); rep['first_word_s'] = V['words'][0]['s'] / FPS if V['words'][0]['s'] > 50 else V['words'][0]['s']
# 2 pitch drop frames: dominant-frequency trajectory of synthesized pass-bys (sfx stem, L+R)
s, _ = sf.read(os.path.join(B, 'sfx.wav'), dtype='float32'); s = s.mean(1)
def drop_frame(key, a, lo, hi):
    """Pitch track of the ISOLATED synthesized clip; pass = where the peak pitch crosses the midpoint
    between its approach and recession values (the stem also holds chuffs/whistles that bias a centroid)."""
    import sfx_bank as SB
    clip, off, _ = SB.make(key, 500, sy)
    x = clip.mean(1)
    f, t, Z = signal.stft(x, SR, nperseg=8192, noverlap=8192 - 400)
    band = (f > lo) & (f < hi)
    P = np.abs(Z[band]); fb = f[band]
    k = np.argmax(P, 0)
    # parabolic peak interpolation for sub-bin pitch
    pk = []
    for j, i in enumerate(k):
        if 0 < i < len(fb) - 1:
            y0, y1, y2 = np.log(P[i - 1, j] + 1e-12), np.log(P[i, j] + 1e-12), np.log(P[i + 1, j] + 1e-12)
            dlt = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-12)
            pk.append(fb[i] + dlt * (fb[1] - fb[0]))
        else:
            pk.append(fb[i])
    pk = np.convolve(np.array(pk), np.ones(9) / 9, 'same')
    n = len(pk); hi_v = np.median(pk[n // 10:n // 4]); lo_v = np.median(pk[-n // 4:-n // 10])
    mid = (hi_v + lo_v) / 2
    j = np.argmax(pk[n // 10:] < mid) + n // 10
    return round(a + (t[j] + off / SR) * FPS, 1), round(float(hi_v), 1), round(float(lo_v), 1)
def factor_frame(key, a):
    """Two-tone sirens alternate pitch, so use the renderer's own received-pitch factor curve:
    the pass is where d(tau)/dt crosses 1.0 (source abeam of the listener)."""
    import sfx_bank as SB, doppler as DP
    cap = {}
    orig = DP.render_pass
    def spy(*aa, **kw):
        st, fac = orig(*aa, **kw); cap['fac'] = fac; return st, fac
    DP.render_pass = spy
    try:
        SB.make(key, 500, sy)
    finally:
        DP.render_pass = orig
    fac = cap['fac']
    j = int(np.argmax(fac < 1.0))
    return round(a + j / SR * FPS, 1), round(float(fac[:j].max()), 4), round(float(fac[j:].min()), 4)
sy = V['sync']
for name, key, a, p, lo, hi in [('siren', 'siren_pass', sy['sirenStart'], sy['sirenPass'], 500, 1100),
                                ('split', 'siren_pass_split', sy['splitStart'], sy['splitPass'], 500, 1100),
                                ('horns', 'horns_pass', sy['hornsStart'], sy['hornsPass'], 330, 460),
                                ('close', 'siren_pass_soft', sy['closeStart'], sy['closePass'], 500, 1100)]:
    try:
        if key.startswith('siren'):
            fr, before, after = factor_frame(key, a)
        else:
            fr, before, after = drop_frame(key, a, lo, hi)
        rep[name] = dict(visual_pass_frame=p, audio_pitch_midpoint_frame=fr, err_frames=round(fr - p, 1), approach=before, recede=after)
    except Exception as e:  # noqa
        rep[name] = dict(error=repr(e))
# 3 per-chapter loudness of the final mix
m, _ = sf.read(os.path.join(ROOT, 'public', 'audio', 'mix.wav'), dtype='float32')
rep['chapters'] = {c['id']: round(lufs(m[int(c['start'] / FPS * SR):int(c['end'] / FPS * SR)]), 1) for c in V['chapters']}
rep['mix_peak_dbfs'] = round(20 * np.log10(np.abs(m).max()), 2)
rep['mix_seconds'] = len(m) / SR; rep['video_seconds'] = V['durationInFrames'] / FPS
# 4 sfx peaks vs voice short-term loudness around each cue
rows = []
for c in V['sfx']:
    i = int(c['f'] / FPS * SR); w = s[i:i + int(0.4 * SR)]
    vw = v[max(0, i - SR):i + SR]
    rows.append((c['f'], c['key'], round(20 * np.log10(np.abs(w).max() + 1e-9), 1), round(20 * np.log10(np.sqrt((vw ** 2).mean()) + 1e-9), 1)))
rep['sfx_peak_over_voice_rms_max'] = max(r[2] - r[3] for r in rows if r[3] > -50)
rep['sfx_cues'] = len(rows)
json.dump(rep, open(os.path.join(B, 'verify_report.json'), 'w'), indent=1, default=float)
print(json.dumps(rep, indent=1, default=float))

# 5 click detector: second-difference spikes far above the local (10 ms) second-difference RMS
mm = m.mean(1)
d2 = np.abs(np.diff(mm, 2))
loc = np.sqrt(np.convolve(d2 ** 2, np.ones(480) / 480, 'same')) + 1e-6
spk = np.nonzero((d2 > 12 * loc) & (d2 > 0.02))[0]
rep['click_candidates'] = [round(i / SR, 3) for i in spk[:20]]
# 6 voice-to-bed ratio per sentence (voice stem vs (final mix - voice) at master gain)
music, _ = sf.read(os.path.join(B, 'music.wav'), dtype='float32'); amb, _ = sf.read(os.path.join(B, 'amb.wav'), dtype='float32')
others = (music.mean(1) * 10 ** (-8 / 20) + amb.mean(1) + s)  # music fully ducked while speaking
ratios = []
for sn in V['sentences']:
    a, b = int(sn['s'] / FPS * SR), int(sn['e'] / FPS * SR)
    if b - a < SR // 2: continue
    vr = np.sqrt((v[a:b] ** 2).mean()); orr = np.sqrt((others[a:b] ** 2).mean()) + 1e-9
    ratios.append((float(round(20 * np.log10(vr / orr), 1)), sn["s"]))
ratios.sort()
rep['voice_to_bed_db_worst5'] = ratios[:5]
rep['voice_to_bed_db_median'] = ratios[len(ratios) // 2][0]
json.dump(rep, open(os.path.join(B, 'verify_report.json'), 'w'), indent=1, default=float)
print('clicks', rep['click_candidates']); print('v2b worst', rep['voice_to_bed_db_worst5'], 'median', rep['voice_to_bed_db_median'])
