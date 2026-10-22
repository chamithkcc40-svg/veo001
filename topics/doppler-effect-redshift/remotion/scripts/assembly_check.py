"""assembly_check.py (T9): timeline integrity checks on data/video.json + public/audio/mix.wav.
usage: python3 scripts/assembly_check.py   -> prints a report, exits 1 on any failure."""
import json, subprocess, sys, re, os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(root, 'data/video.json')))
fails = []
ok = lambda c, m: print(('OK   ' if c else 'FAIL ') + m) or (None if c else fails.append(m))

ch, sc, P, W = V['chapters'], V['scenes'], V['pages'], V['words']
ok(ch[0]['start'] == 0 and ch[-1]['end'] == V['durationInFrames'], f"chapters span 0-{V['durationInFrames']}")
ok(all(a['end'] == b['start'] for a, b in zip(ch, ch[1:])), 'chapters contiguous (no gap/overlap)')
ok(all(a['end'] == b['start'] for a, b in zip(sc, sc[1:])), f'{len(sc)} scenes contiguous')
ok(all(any(c['start'] <= s['start'] and s['end'] <= c['end'] for c in ch) for s in sc), 'every scene inside one chapter')
ok(all(a['e'] <= b['s'] for a, b in zip(P, P[1:])), f'{len(P)} caption pages never overlap')
ok(min(p['e'] - p['s'] for p in P) >= 12, 'every caption page >= 0.4 s on screen')
ok(all(any(p['s'] <= w['s'] < p['e'] for p in P) for w in W), f'all {len(W)} words covered by a page')
ok(max(w['e'] for w in W) < V['durationInFrames'], 'last word ends before the last frame')

# registry covers every scene id exactly
src = ''.join(open(os.path.join(root, 'src/scenes', f)).read() for f in os.listdir(os.path.join(root, 'src/scenes')))
reg = set(re.findall(r'"(s\d_[a-z0-9_]+)"', ''.join(re.findall(r'ids: \[[^\]]*\]', src))))
ok(reg == {s['id'] for s in sc}, 'registry covers every scene id')

dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0',
                                     os.path.join(root, 'public/audio/mix.wav')]).decode())
ok(abs(dur - V['durationInFrames'] / V['fps']) < 1 / V['fps'], f"mix.wav {dur:.3f} s == {V['durationInFrames'] / V['fps']:.3f} s")
lo = subprocess.run(['ffmpeg', '-nostats', '-i', os.path.join(root, 'public/audio/mix.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                    capture_output=True, text=True).stderr
I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', lo)[-1]); pk = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', lo)[-1])
ok(abs(I + 14) <= 0.5, f'integrated loudness {I} LUFS (target -14 +/- 0.5)')
ok(pk <= -1.0, f'true peak {pk} dBFS (<= -1.0)')
print('RESULT', 'PASS' if not fails else f'FAIL ({len(fails)})')
sys.exit(1 if fails else 0)
