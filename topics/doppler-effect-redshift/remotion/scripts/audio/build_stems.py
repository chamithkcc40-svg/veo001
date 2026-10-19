"""T7 stem builder. Usage: python build_stems.py voice|music|amb|sfx|all

Writes float WAV stems to remotion/audio_build/ (git-ignored, regenerable) plus cues.txt.
Each stem runs in its own process (run_audio.sh) to stay inside the ~1 GB sandbox.
"""
import json
import os
import subprocess
import sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from dsp import SR, lufs, db, hp, lp, make_ir, reverb, fade, stereo, place  # noqa: E402

ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'audio_build')
RES = os.path.normpath(os.path.join(ROOT, '..', 'resources'))
V = json.load(open(os.path.join(ROOT, 'data', 'video.json')))
FPS = V['fps']
C = V['cues']
TOTAL = V['durationInFrames']
NS = int(TOTAL / FPS * SR)
HEAD = V['head']
VOICE_LUFS = -18.0  # pre-master voice anchor, mono measurement (master gain later moves everything to -14 LUFS)
VOICE_ST = VOICE_LUFS + 3.01  # the same voice heard on both channels (stereo loudness) = reference for beds
os.makedirs(OUT, exist_ok=True)


def f2s(f):
    return int(round(f / FPS * SR))


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def write(name, x):
    sf.write(os.path.join(OUT, name), x.astype(np.float32), SR, subtype='FLOAT')
    print('wrote', name, x.shape, 'LUFS %.1f' % lufs(x), 'peak %.1f dB' % (20 * np.log10(np.max(np.abs(x)) + 1e-9)))


# ------------------------------------------------------------------ voice
def build_voice():
    p1 = decode(os.path.join(RES, 'voiceover', 'part_01.mp3'))
    p2 = decode(os.path.join(RES, 'voiceover', 'part_02.mp3'))
    # 08: normalise both parts to the same loudness before editing
    p1 = p1 * db(VOICE_LUFS - lufs(p1))
    p2 = p2 * db(VOICE_LUFS - lufs(p2))
    v = np.zeros(NS, np.float32)
    s1 = int(round(HEAD * SR))
    s2 = int(round((HEAD + V['voice']['part2StartVoice']) * SR))
    # parts are concatenated with no added gap (T4); 10 ms equal-power seam
    place(v, fade(p1, 0.003, 0.01), s1)
    place(v, fade(p2, 0.01, 0.01), s2)
    v = hp(v, 70, 2)  # rumble guard
    # broadcast voice chain: 3:1 compression on the loud syllables, then a fast peak limiter
    from dsp import compressor, limiter
    v = compressor(v, thresh_db=-22.0, ratio=3.0, attack=0.006, release=0.15)
    v *= db(VOICE_LUFS - lufs(v))
    v2, gr = limiter(np.stack([v, v], axis=1), ceiling_db=-6.0, lookahead=0.003, release=0.05)
    v = v2[:, 0]
    v *= db(VOICE_LUFS - lufs(v))
    print('voice limiter max GR %.1f dB' % (-20 * np.log10(1 - gr + 1e-9)))
    write('voice.wav', v)
    info = dict(part1_start_s=HEAD, part2_start_s=HEAD + V['voice']['part2StartVoice'], part1_len=len(p1) / SR, part2_len=len(p2) / SR)
    json.dump(info, open(os.path.join(OUT, 'voice_info.json'), 'w'), indent=1)


# ------------------------------------------------------------------ music
def build_music():
    import music as M
    S = M.compose(C, TOTAL)
    dry = S.bus['dry'][:NS]
    lush = S.bus['lush'][:NS]
    print('music events', len(S.events))
    del S
    ir_hall = make_ir(2.6, 11, 5500, 0.02)
    lush = reverb(lush, ir_hall, wet=0.55)
    ir_room = make_ir(0.9, 12, 7000, 0.008)
    dry = reverb(dry, ir_room, wet=0.25)
    m = dry + lush
    del dry, lush
    m[:, 0] = hp(m[:, 0], 35, 2)
    m[:, 1] = hp(m[:, 1], 35, 2)
    # master automation (energy curve), cosine-interpolated
    auto = M.automation(C)
    fr = np.array([a for a, _ in auto], float)
    g = np.array([b for _, b in auto], float)
    order = np.argsort(fr, kind='stable')
    fr, g = fr[order], g[order]
    t_fr = np.arange(NS) / SR * FPS
    gain_db = np.interp(t_fr, fr, g)
    m *= db(gain_db).astype(np.float32)[:, None]
    # reference level: music (undiluted) about 12 dB under the voice anchor; ducking adds 8 dB more
    m *= db((VOICE_ST - 14) - lufs(m))
    write('music.wav', m)


# ------------------------------------------------------------------ ambience
def build_amb():
    import ambience as A
    out = np.zeros((NS, 2), np.float32)
    runs = []
    for sc in V['scenes']:
        key, lvl = A.SCENE_AMB[sc['id']]
        if runs and runs[-1][0] == key and runs[-1][3] == lvl:
            runs[-1][2] = sc['end']
        else:
            runs.append([key, sc['start'], sc['end'], lvl])
    XF = 0.5  # crossfade seconds
    log = []
    for i, (key, a, b, lvl) in enumerate(runs):
        if key is None:
            continue
        s = max(0, f2s(a) - int(XF / 2 * SR))
        e = min(NS, f2s(b) + int(XF / 2 * SR))
        x = A.bed(key, (e - s) / SR, seed=101 + i)
        x = x[:e - s]
        x *= db((VOICE_ST + lvl) - lufs(x))
        n = len(x)
        w = int(XF * SR)
        ramp = np.sin(np.linspace(0, np.pi / 2, w)) ** 2
        if s > 0:
            x[:w] *= ramp[:, None]
        if e < NS:
            x[-w:] *= ramp[::-1, None]
        out[s:s + n] += x
        log.append('%5d-%5d  %-16s %d dB' % (a, b, key, lvl))
    # cold-open head: ambience only for the first 0.5 s (08 silence moment 1) is handled by the street run
    write('amb.wav', out)
    open(os.path.join(OUT, 'amb_runs.txt'), 'w').write('\n'.join(log) + '\n')


# ------------------------------------------------------------------ sfx
KEY_WORDS = ['drops', 'squeezed', 'stretched', 'redshift', 'expanding']


def build_sfx():
    import sfx_bank as B
    sync = V['sync']
    out = np.zeros((NS, 2), np.float32)
    # voice-forward rule: no sfx transient within 2 frames of a key word onset; nudge up to 4 frames
    key_frames = [w['s'] for w in V['words'] if w['text'].lower().strip('.,!?"') in KEY_WORDS]
    lines = ['# frame  time_s   gain_dB  key                 source', '# (frame = 30 fps global timeline; sync points: %s)' % json.dumps({k: v for k, v in sync.items() if not isinstance(v, list)})]
    cache = {}
    for i, cue in enumerate(V['sfx']):
        f = cue['f']
        nudged = ''
        for kf in key_frames:
            if abs(f - kf) <= 2 and not cue['key'].startswith(('siren', 'horns')):
                nf = kf - 4 if f <= kf else kf + 4
                nudged = ' (nudged %+d f off key word @%d)' % (nf - f, kf)
                f = nf
        ck = cue['key']
        reuse = ck in ('plip', 'chuff', 'earclick', 'earclick_low', 'blip', 'zip', 'skitter', 'tick', 'pop', 'shimmer', 'sparkle', 'whoosh_soft', 'whoosh_fast', 'twist', 'bloom')
        seed = 500 + (0 if reuse else i) + (i % 5 if ck in ('plip', 'chuff') else 0)
        cid = (ck, seed)
        if cid not in cache:
            cache[cid] = B.make(ck, seed, sync)
        clip, off, src = cache[cid]
        place(out, clip, f2s(f) + off, db(cue['db']))
        lines.append('%6d  %7.3f  %6.1f   %-18s  %s%s' % (f, f / FPS, cue['db'], ck, src, nudged))
    write('sfx.wav', out)
    open(os.path.join(OUT, 'cues.txt'), 'w').write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    for w in (['voice', 'music', 'amb', 'sfx'] if what == 'all' else [what]):
        {'voice': build_voice, 'music': build_music, 'amb': build_amb, 'sfx': build_sfx}[w]()
