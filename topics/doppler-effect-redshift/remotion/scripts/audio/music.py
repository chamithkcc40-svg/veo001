"""Procedural score (08 sec. 1): one motif, the two-note falling "siren interval" (A -> F#).

90 BPM => one beat = 20 frames at 30 fps, so every section snaps to a frame grid anchored on a
spoken-word cue from data/video.json. Instruments are small seeded synth models (celesta, pizz,
marimba, piano, cello/strings, brass, tuba, pads, choir, arp, timpani, sub pulse, cymbal swell).
Output: two stereo buses (dry, lush) that the mixer reverberates and ducks.
"""
import numpy as np
from dsp import (SR, lp, hp, bp, white, pink, perc, smoothstep, stereo, note_hz, karplus, formant, rng, smooth_noise)

FPS = 30
BEAT = 20  # frames


def fr2s(f):
    return f / FPS


# ------------------------------------------------------------------ wavetables
_TAB = {}


def table(kind, nh):
    k = (kind, nh)
    if k in _TAB:
        return _TAB[k]
    L = 4096
    ph = np.arange(L) / L * 2 * np.pi
    x = np.zeros(L)
    for h in range(1, nh + 1):
        if kind == 'saw':
            x += np.sin(h * ph) / h
        elif kind == 'sq' and h % 2 == 1:
            x += np.sin(h * ph) / h
        elif kind == 'tri' and h % 2 == 1:
            x += ((-1) ** ((h - 1) // 2)) * np.sin(h * ph) / (h * h)
    x /= np.max(np.abs(x)) + 1e-9
    _TAB[k] = np.append(x, x[0]).astype(np.float32)
    return _TAB[k]


def osc(kind, freq, n, ph0=0.0):
    """freq: scalar or array (Hz)."""
    f = np.broadcast_to(np.asarray(freq, np.float64), (n,))
    fmax = float(np.max(f))
    nh = int(max(1, min(48, 15000 / max(fmax, 20))))
    tab = table(kind, nh)
    ph = (ph0 + np.cumsum(f) / SR) % 1.0
    idx = ph * 4096
    i = idx.astype(np.int32)
    fr = (idx - i).astype(np.float32)
    return tab[i] * (1 - fr) + tab[i + 1] * fr


def env_asr(n, a, r, sr=SR, curve=1.5):
    a_n = max(1, int(a * sr))
    r_n = max(1, int(r * sr))
    e = np.ones(n, np.float32)
    a_n = min(a_n, n)
    e[:a_n] = (np.linspace(0, 1, a_n) ** curve)
    r_n = min(r_n, n)
    e[n - r_n:] *= np.linspace(1, 0, r_n) ** 2
    return e


def vibrato(n, rate=5.2, depth=0.004, delay=0.3, seed=0):
    t = np.arange(n) / SR
    onset = smoothstep((t - delay) / 0.4)
    r = rng(seed)
    return 1 + depth * onset * np.sin(2 * np.pi * rate * t + r.uniform(0, 6))


# ------------------------------------------------------------------ instruments (mono)
def i_celesta(f, dur, vel, seed):
    d = max(dur, 2.4)
    n = int(d * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.9)
         + 0.35 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.35)
         + 0.18 * np.sin(2 * np.pi * f * 4.02 * t) * np.exp(-t / 0.12)
         + 0.1 * np.sin(2 * np.pi * f * 6.9 * t) * np.exp(-t / 0.05))
    x[:96] *= np.linspace(0, 1, 96)
    return (x * vel).astype(np.float32)


def i_pizz(f, dur, vel, seed):
    x = karplus(f, 0.9, seed, 0.988 if f < 200 else 0.982, 0.35)
    x = lp(x, 2600, 2)
    return x * vel * 1.6


def i_marimba(f, dur, vel, seed):
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    tau = 0.42 * (440 / f) ** 0.35
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
         + 0.4 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / (tau / 5))
         + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.01))
    x[:48] *= np.linspace(0, 1, 48)
    return (x * vel).astype(np.float32)


def i_piano(f, dur, vel, seed):
    d = max(dur + 0.6, 1.8)
    n = int(d * SR)
    t = np.arange(n) / SR
    B = 0.0004
    x = np.zeros(n)
    for k in range(1, 10):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 12000:
            break
        x += np.sin(2 * np.pi * fk * t) * (1 / k ** 1.25) * np.exp(-t / (2.2 / k ** 0.7)) * (1 + 0.6 * vel * (k > 2))
    x += 0.15 * lp(white(n, seed), 3000) * np.exp(-t / 0.01)
    rel = np.ones(n)
    rs = int((dur + 0.05) * SR)
    if rs < n:
        rel[rs:] = np.exp(-(np.arange(n - rs)) / (0.18 * SR))
    x[:48] *= np.linspace(0, 1, 48)
    return (x * rel * vel * 0.6).astype(np.float32)


def i_strings(f, dur, vel, seed, dark=2600, a=0.35, r=0.6, voices=3):
    n = int((dur + r) * SR)
    vib = vibrato(n, 5.0 + seed % 3 * 0.3, 0.0045, 0.25, seed)
    x = np.zeros(n, np.float32)
    rr = rng(seed)
    for v in range(voices):
        det = 1 + (v - (voices - 1) / 2) * 0.0028
        x += osc('saw', f * det * vib, n, rr.uniform())
    x = lp(x / voices, dark, 2)
    x = hp(x, 70, 1)
    return x * env_asr(n, a, r) * vel


def i_cello(f, dur, vel, seed):
    return i_strings(f, dur, vel, seed, dark=1500, a=0.22, r=0.5, voices=2)


def i_brass(f, dur, vel, seed, a=0.07, r=0.25):
    n = int((dur + r) * SR)
    vib = vibrato(n, 5.0, 0.003, 0.35, seed)
    x = osc('saw', f * vib, n, rng(seed).uniform())
    e = env_asr(n, a, r, curve=1.2)
    dark = lp(x, 700, 2)
    bright = lp(x, 3200, 2)
    b = (0.35 + 0.65 * vel) * e
    y = dark * (1 - b) + bright * b
    return (y * e * vel).astype(np.float32)


def i_tuba(f, dur, vel, seed):
    return lp(i_brass(f, dur, vel, seed, 0.03, 0.12), 900, 2)


def i_pad(f, dur, vel, seed, cutoff=1400, a=1.0, r=1.6, glide=None):
    n = int((dur + r) * SR)
    ff = np.full(n, f, np.float64)
    if glide is not None:  # (start_s, dur_s, ratio)
        gs, gd, ratio = glide
        t = np.arange(n) / SR
        ff = f * ratio ** smoothstep((t - gs) / gd)
    x = np.zeros(n, np.float32)
    rr = rng(seed)
    for v in range(5):
        det = 1 + (v - 2) * 0.0035
        x += osc('saw', ff * det, n, rr.uniform())
    x = lp(x / 5, cutoff, 2)
    return x * env_asr(n, a, r, curve=2.0) * vel


def i_choir(f, dur, vel, seed, vowel='a'):
    n = int((dur + 1.2) * SR)
    vib = vibrato(n, 4.6, 0.006, 0.2, seed)
    x = np.zeros(n, np.float32)
    rr = rng(seed)
    for v in range(3):
        x += osc('saw', f * (1 + (v - 1) * 0.004) * vib, n, rr.uniform())
    y = formant(x / 3, vowel) * 0.6 + lp(x / 3, 900) * 0.2
    return y * env_asr(n, 0.7, 1.2, curve=2.0) * vel


def i_arp(f, dur, vel, seed):
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    x = osc('sq', f, n, 0.0) * 0.6 + osc('saw', f * 2.003, n, 0.3) * 0.25
    x = lp(x, 3800, 2) * np.exp(-t / 0.16)
    x[:48] *= np.linspace(0, 1, 48)
    return x * vel


def i_timp(f, dur, vel, seed):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    ff = f * (1 + 0.04 * np.exp(-t / 0.05))
    ph = 2 * np.pi * np.cumsum(ff) / SR
    x = np.sin(ph) * np.exp(-t / 0.7) + 0.5 * np.sin(ph * 1.5) * np.exp(-t / 0.35) + 0.25 * np.sin(ph * 1.99) * np.exp(-t / 0.25)
    x += 0.35 * lp(white(n, seed), 1200) * np.exp(-t / 0.02)
    x[:24] *= np.linspace(0, 1, 24)
    return (x * vel).astype(np.float32)


def i_sub(f, dur, vel, seed):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.14) + 0.2 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.05)
    x[:96] *= np.linspace(0, 1, 96)
    return (x * vel).astype(np.float32)


def i_shaker(f, dur, vel, seed):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    x = hp(white(n, seed), 6000) * np.sin(np.pi * t / 0.09) ** 2
    return x * vel * 0.5


def i_cymbal_swell(f, dur, vel, seed):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = hp(white(n, seed), 4500) * 0.5 + bp(white(n, seed + 1), 2500, 9000) * 0.5
    return x * (t / dur) ** 2.5 * vel


def i_cymbal_crash(f, dur, vel, seed):
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    x = hp(white(n, seed), 3000) * np.exp(-t / 0.9) + 0.4 * bp(white(n, seed + 3), 400, 3000) * np.exp(-t / 0.2)
    return x * vel


INST = dict(celesta=i_celesta, pizz=i_pizz, marimba=i_marimba, piano=i_piano, strings=i_strings, cello=i_cello,
            brass=i_brass, tuba=i_tuba, pad=i_pad, choir=i_choir, arp=i_arp, timp=i_timp, sub=i_sub,
            shaker=i_shaker, swell=i_cymbal_swell, crash=i_cymbal_crash)
# bus + default pan per instrument
BUS = dict(celesta=('lush', 0.25), pizz=('dry', -0.2), marimba=('dry', 0.15), piano=('lush', -0.1),
           strings=('lush', 0.0), cello=('lush', -0.35), brass=('lush', 0.3), tuba=('dry', -0.1),
           pad=('lush', 0.0), choir=('lush', 0.0), arp=('lush', 0.0), timp=('dry', 0.0), sub=('dry', 0.0),
           shaker=('dry', 0.4), swell=('lush', 0.0), crash=('lush', 0.0))


class Score:
    def __init__(self, total_frames):
        n = int(total_frames / FPS * SR) + SR * 4
        self.bus = {'dry': np.zeros((n, 2), np.float32), 'lush': np.zeros((n, 2), np.float32)}
        self.count = 0
        self.events = []

    def add(self, inst, frame, dur_frames, note, vel=0.6, pan=None, **kw):
        f = note_hz(note) if isinstance(note, str) else float(note)
        if dur_frames <= 0:
            return
        dur = dur_frames / FPS
        seed = (self.count * 7919 + int(frame)) % 100003
        self.count += 1
        x = INST[inst](f, dur, vel, seed, **kw)
        b, p0 = BUS[inst]
        p = p0 if pan is None else pan
        st = stereo(x, p)
        s = int(round(frame / FPS * SR))
        buf = self.bus[b]
        e = min(len(buf), s + len(st))
        if e > s:
            buf[s:e] += st[:e - s]
        self.events.append((inst, frame))

    def chord(self, inst, frame, dur_frames, notes, vel=0.5, spread=0.5, **kw):
        k = len(notes)
        for i, nt in enumerate(notes):
            pan = (i / max(1, k - 1) - 0.5) * spread if k > 1 else 0
            self.add(inst, frame, dur_frames, nt, vel / np.sqrt(k), pan=pan, **kw)


# ------------------------------------------------------------------ harmony
D_MAJ = {'D': ['D3', 'F#3', 'A3'], 'Bm': ['B2', 'D3', 'F#3'], 'G': ['G2', 'B2', 'D3'], 'A': ['A2', 'C#3', 'E3'],
         'Em': ['E3', 'G3', 'B3'], 'F#m': ['F#3', 'A3', 'C#4'], 'Dsus': ['D3', 'G3', 'A3'], 'Asus': ['A2', 'D3', 'E3']}
D_MIN = {'Dm': ['D3', 'F3', 'A3'], 'Bb': ['Bb2', 'D3', 'F3'], 'Gm': ['G2', 'Bb2', 'D3'], 'A': ['A2', 'C#3', 'E3'],
         'F': ['F2', 'A2', 'C3'], 'C': ['C3', 'E3', 'G3'], 'Asus': ['A2', 'D3', 'E3'], 'Dsus2': ['D3', 'E3', 'A3']}
ROOT = {'D': 'D2', 'Bm': 'B1', 'G': 'G1', 'A': 'A1', 'Em': 'E2', 'F#m': 'F#2', 'Dsus': 'D2', 'Asus': 'A1',
        'Dm': 'D2', 'Bb': 'Bb1', 'Gm': 'G1', 'F': 'F2', 'C': 'C2', 'Dsus2': 'D2'}


def up(note, octs):
    name = note[:-1]
    return name + str(int(note[-1]) + octs)


def chord_notes(name):
    return D_MAJ.get(name) or D_MIN[name]


def grid(start, end, step):
    f = start
    while f < end:
        yield f
        f += step


# ------------------------------------------------------------------ composition
def compose(C, total):
    S = Score(total)
    B = BEAT
    bar = 4 * B

    def motif(f, octave=5, inst='celesta', vel=0.5, gap=12):
        S.add(inst, f, gap, 'A%d' % octave, vel)
        S.add(inst, f + gap, 30, 'F#%d' % octave, vel * 0.85)

    # ---------- Cold open: silence, a single celesta siren interval, low pad swell on "universe"
    motif(C['listen'] + 16, 5, vel=0.42, gap=14)
    S.chord('pad', C['universe0'] - 10, (C['ch1'] + 40) - (C['universe0'] - 10), ['D2', 'A2', 'D3', 'F#3', 'A3'], 0.55, a=1.6, r=1.2, cutoff=900)
    S.add('swell', C['growing0'] - 40, 40, 'A4', 0.18)
    S.chord('celesta', C['growing0'], 40, ['D5', 'F#5', 'A5'], 0.35)

    # ---------- Ch1: pizzicato + celesta, 90 BPM from ch1; stop-time on "Same siren. / Two sounds."
    prog = ['D', 'Bm', 'G', 'A']
    s0 = C['ch1']
    stop_a, stop_b = C['sameSiren'] - 8, C['bothRight']
    for k, f in enumerate(grid(s0, C['whatChanged'], bar)):
        ch = prog[k % 4]
        for b in range(4):
            fb = f + b * B
            if stop_a <= fb < stop_b or fb >= C['whatChanged']:
                continue
            if b in (0, 2):
                S.add('pizz', fb, 10, ROOT[ch] if b == 0 else up(ROOT[ch], 1), 0.55 if b == 0 else 0.4)
            else:
                S.chord('pizz', fb, 10, [up(n, 1) for n in chord_notes(ch)], 0.35)
                S.chord('pizz', fb + 10, 10, [up(n, 1) for n in chord_notes(ch)], 0.22)
        if k % 2 == 1 and not (stop_a <= f < stop_b):
            motif(f + 2 * B, 5, vel=0.25, gap=10)
    # stop-time hits
    for hf in (C['sameSiren'], C['twoSounds']):
        S.chord('pizz', hf, 10, ['D3', 'A3', 'D4', 'F#4'], 0.7)
        S.add('pizz', hf, 10, 'D2', 0.6)
        S.add('celesta', hf, 20, 'A5' if hf == C['sameSiren'] else 'F#5', 0.4)
    S.chord('celesta', C['bothRight'] + 4, 40, ['D5', 'F#5', 'A5', 'D6'], 0.45)
    S.chord('strings', C['bothRight'], C['whatChanged'] - C['bothRight'], ['D3', 'A3', 'F#4'], 0.22, a=0.3, r=0.8)
    # "So what changed?" hush -> pad; "Something in the air" airy rise into Ch2
    S.chord('pad', C['whatChanged'], C['ch2'] + 20 - C['whatChanged'], ['B2', 'F#3', 'D4'], 0.3, a=0.8, r=1.0, cutoff=1000)
    for k, f in enumerate(grid(C['something'], C['ch2'], 10)):
        S.add('celesta', f, 10, ['D6', 'A5', 'F#5', 'E5', 'D5', 'A4'][k % 6], 0.12 + 0.01 * k)

    # ---------- Ch2 pond: marimba eighth ostinato ("tapping"), layer added when the bug swims
    s0 = C['ch2']
    prog2 = ['D', 'G', 'Bm', 'A']
    m_end = C['squeezedWaves'] - 4
    for k, f in enumerate(grid(s0, m_end, bar)):
        ch = prog2[k % 4]
        nts = chord_notes(ch)
        patt = [up(nts[0], 1), up(nts[2], 1), up(nts[1], 1), up(nts[2], 1)] * 2
        for j, fb in enumerate(grid(f, min(f + bar, m_end), 10)):
            S.add('marimba', fb, 10, patt[j], 0.32 if j % 2 == 0 else 0.22)
        S.add('pizz', f, 20, ROOT[ch], 0.35)
        if f >= C['swims']:
            # counter line: offbeat high marimba + shaker
            for j, fb in enumerate(grid(f + 5, min(f + bar, m_end), 20)):
                S.add('marimba', fb, 10, up(nts[(j + 1) % 3], 2), 0.16, pan=0.5)
            for fb in grid(f, min(f + bar, m_end), 10):
                S.add('shaker', fb, 5, 'A4', 0.12)
            S.add('pizz', f + 2 * B, 20, up(ROOT[ch], 1), 0.28)
    # ear section: clicks need space -> sustained pad + soft bass only
    S.chord('pad', C['squeezedWaves'] - 6, C['neverSpeed'] - C['squeezedWaves'] + 6, ['D3', 'A3', 'E4'], 0.26, a=0.5, r=0.8, cutoff=1100)
    S.add('pizz', C['squeezedWaves'], 20, 'D2', 0.4)
    S.add('pizz', C['stretchedWaves'], 20, 'A1', 0.4)
    # "never speed up / only spacing": sparse marimba quarters, thinning
    for k, f in enumerate(grid(C['neverSpeed'], C['y1842'] - 10, B)):
        S.add('marimba', f, 10, ['D5', 'A4', 'F#4', 'A4'][k % 4], 0.22 - 0.008 * k)

    # ---------- Doppler 1842: solo piano + cello, tender
    s0 = C['y1842'] - 6
    prog3 = ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'A']
    end3 = C['threeYears'] - 8
    mel = ['F#4', 'E4', 'D4', 'C#4', 'D4', 'B3', 'E4', 'C#4']
    for k, f in enumerate(grid(s0, end3, bar)):
        ch = prog3[k % len(prog3)]
        nts = chord_notes(ch)
        S.add('piano', f, bar, up(ROOT[ch], 1), 0.45)
        for j, b in enumerate((1, 2, 3)):
            if f + b * B < end3:
                S.add('piano', f + b * B, B, up(nts[j % 3], 1), 0.3)
        dur = min(bar, end3 - f)
        S.add('cello', f, dur, up(mel[k % len(mel)], -1), 0.33)

    # ---------- Train 1845: brass-band oom-pah (thins while the horn car passes)
    s0 = C['threeYears']
    end4 = C['twist1'] - 6
    prog4 = ['D', 'A', 'D', 'G', 'D', 'A', 'D', 'D']
    for k, f in enumerate(grid(s0, end4, bar)):
        ch = prog4[k % len(prog4)]
        thin = f >= C['people'] - 24  # leave room for the horn-car pass-by
        for b in range(4):
            fb = f + b * B
            if fb >= end4:
                break
            if b in (0, 2):
                S.add('tuba', fb, 14, ROOT[ch] if b == 0 else up(chord_notes(ch)[2], -1), 0.45 if not thin else 0.25)
            elif not thin:
                S.chord('brass', fb, 10, [up(n, 1) for n in chord_notes(ch)], 0.32)
        if not thin and k % 2 == 0:
            motif(f + 2 * B, 4, inst='brass', vel=0.22, gap=10)

    # ---------- Twist: music drops out, one high celesta note rings
    S.add('celesta', C['twist1'] + 14, 60, 'A6', 0.35)
    S.add('celesta', C['twist1'] + 14, 60, 'A5', 0.15)
    # paper: soft pad and a quiet celesta motif under "colored light of stars", swell into Ch3
    S.chord('pad', C['didnt'] - 6, C['ch3'] + 30 - C['didnt'], ['D3', 'A3', 'E4', 'A4'], 0.3, a=1.2, r=1.2, cutoff=1200)
    motif(C['heNamed'] + 10, 6, vel=0.2, gap=12)
    S.add('swell', C['ch2End'] - 30, 36, 'A4', 0.12)

    # ---------- Ch3 light: shimmering synth arpeggio + soft choir; brighter on "They did."
    s0 = C['ch3']
    prog5 = ['Dsus2', 'Bb', 'Gm', 'Asus']
    end5 = C['tens'] - 4
    for k, f in enumerate(grid(s0, end5, 2 * bar)):
        ch = prog5[k % 4]
        nts = chord_notes(ch)
        dur = min(2 * bar, end5 - f)
        bright = f >= C['theyDid'] - 4
        S.chord('choir', f, dur, [up(n, 1) for n in nts], 0.24 if not bright else 0.3, vowel='a' if k % 2 else 'o')
        S.add('pad', f, dur, ROOT[ch], 0.28, cutoff=600, a=0.8, r=1.0)
        arp = [up(nts[0], 2), up(nts[1], 2), up(nts[2], 2), up(nts[1], 2)]
        if bright:
            arp = arp + [up(nts[0], 3), up(nts[2], 2), up(nts[1], 3), up(nts[2], 2)]
        for j, fb in enumerate(grid(f, f + dur, 5)):
            if C['twist1'] <= fb < C['didnt']:
                continue
            S.add('arp', fb, 5, arp[j % len(arp)], (0.16 if not bright else 0.2) * (1.0 if j % 4 == 0 else 0.7), pan=0.45 * np.sin(j * 0.7))
    S.chord('celesta', C['theyDid'], 40, ['D6', 'A6'], 0.3)

    # ---------- Slipher: low pulse + rising string ostinato -> held suspended chord on "Why..."
    s0 = C['tens']
    hold = C['why'] - 4
    scale = ['D3', 'E3', 'F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4']
    prog6 = ['Dm', 'Bb', 'Gm', 'A']
    for k, f in enumerate(grid(s0, hold, bar)):
        ch = prog6[k % 4]
        for fb in grid(f, min(f + bar, hold), 10):
            S.add('sub', fb, 10, ROOT[ch], 0.35 + 0.02 * k)
        for j, fb in enumerate(grid(f, min(f + bar, hold), 10)):
            S.add('strings', fb, 9, scale[min(len(scale) - 1, (k * 2 + j // 2) % len(scale))], 0.14 + 0.012 * k, a=0.03, r=0.12, dark=3200)
        S.chord('strings', f, min(bar, hold - f), [up(n, 0) for n in chord_notes(ch)], 0.18 + 0.02 * k, a=0.4, r=0.5)
    S.chord('strings', hold, C['flee'] + 20 - hold, ['A2', 'D3', 'E3', 'A3', 'D4'], 0.4, a=0.3, r=0.6)
    S.chord('pad', hold, C['flee'] + 10 - hold, ['A2', 'E3', 'D4'], 0.22, a=0.3, r=0.5, cutoff=1500)
    # (0.5 s breath between ch3End and the timpani)

    # ---------- Ch4 Hubble: timpani roll, pulse doubles, orchestra swell 7 -> 9
    roll0, roll1 = C['enter'] - 2, C['hubble']
    for k, f in enumerate(grid(roll0, roll1, 2)):
        S.add('timp', f, 2, 'D2', 0.15 + 0.5 * k / max(1, (roll1 - roll0) / 2))
    S.add('timp', C['hubble'], 20, 'D2', 0.8)
    S.add('crash', C['hubble'], 40, 'A4', 0.12)
    s0 = C['hubble']
    end7 = C['expanding'] - 2
    prog7 = ['Dm', 'Bb', 'F', 'C', 'Gm', 'Bb', 'Asus', 'A']
    for k, f in enumerate(grid(s0, end7, bar)):
        ch = prog7[k % len(prog7)]
        nts = chord_notes(ch)
        build = (f - s0) / (end7 - s0)
        step = 10 if f < C['y1923'] else 5
        for fb in grid(f, min(f + bar, end7), step):
            S.add('sub', fb, step, ROOT[ch], 0.28 + 0.15 * build)
        dur = min(bar, end7 - f)
        S.chord('strings', f, dur, [up(n, 0) for n in nts] + [up(nts[0], 1)], 0.26 + 0.2 * build, a=0.25, r=0.4)
        S.add('cello', f, dur, ROOT[ch].replace('1', '2') if ROOT[ch][-1] == '1' else ROOT[ch], 0.3 + 0.1 * build)
        if build > 0.35:
            S.chord('brass', f, dur, [up(n, 0) for n in nts], 0.12 + 0.25 * build, a=0.25, r=0.3)
        if k % 2 == 0:
            S.add('timp', f, 20, ROOT[ch], 0.25 + 0.3 * build)
    # crescendo into the peak
    for k, f in enumerate(grid(C['notJust'], C['expanding'] - 2, 3)):
        S.add('timp', f, 3, 'A1', 0.12 + 0.45 * k / ((C['expanding'] - C['notJust']) / 3))
    S.add('swell', C['notJust'], C['expanding'] - C['notJust'], 'A4', 0.25)
    # ---------- PEAK on "The universe is expanding.": full D major, siren interval in the horns
    pk = C['expanding']
    S.chord('strings', pk, 70, ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4', 'F#4', 'A4'], 0.85, a=0.03, r=1.6)
    S.chord('brass', pk, 70, ['D3', 'F#3', 'A3', 'D4'], 0.7, a=0.04, r=1.0)
    S.add('brass', pk, 14, 'A4', 0.55)
    S.add('brass', pk + 14, 50, 'F#4', 0.5)
    S.chord('choir', pk, 70, ['D4', 'F#4', 'A4'], 0.5, vowel='a')
    S.add('timp', pk, 20, 'D2', 1.0)
    S.add('crash', pk, 60, 'A4', 0.3)
    S.chord('celesta', pk + 28, 40, ['A6', 'F#6'], 0.25)

    # ---------- Lemaitre: pulled back to strings, steady and fair
    s0 = C['belgian'] - 6
    end8 = C['twist2'] - 6
    prog8 = ['G', 'D', 'Em', 'A']
    for k, f in enumerate(grid(s0, end8, bar)):
        ch = prog8[k % 4]
        dur = min(bar, end8 - f)
        S.chord('strings', f, dur, [up(n, 0) for n in chord_notes(ch)] + [up(chord_notes(ch)[0], 1)], 0.32, a=0.5, r=0.6)
        S.add('cello', f, dur, ROOT[ch].replace('1', '2'), 0.28)
        for b in (0, 2):
            if f + b * B < end8:
                S.add('pizz', f + b * B, 10, ROOT[ch], 0.3)

    # ---------- last twist: drop to soft pad; slow-blooming swell; glide down on "toward red"
    tw = C['twist2']
    S.add('celesta', tw + 40, 60, 'E6', 0.25)
    sw0 = C['farGalaxies'] - 10
    ray = C['towardRed2']
    end9 = C['ch5'] + 10
    glide = (fr2s(ray - sw0), 1.0, 2 ** (-2 / 12))
    for nt in ['D3', 'A3', 'E4']:
        S.add('pad', tw - 4, sw0 - tw + 20, nt, 0.18, a=0.6, r=1.0, cutoff=900)
    for i, nt in enumerate(['D2', 'A2', 'D3', 'E3', 'A3', 'D4']):
        S.add('pad', sw0, end9 - sw0, nt, 0.12 + 0.02 * i, a=6.0, r=1.4, cutoff=1300, glide=glide)
    S.chord('choir', C['spaceItself'], ray - C['spaceItself'], ['D4', 'E4', 'A4'], 0.22, vowel='o')
    S.add('swell', C['spaceItself'] + 40, ray - C['spaceItself'] - 40, 'A4', 0.12)

    # ---------- Close: celesta siren interval returns over warm strings, resolves in D major
    s0 = C['ch5']
    prog10 = [('G', 2), ('A', 2), ('Bm', 2), ('G', 1), ('A', 1)]
    f = s0
    for ch, nb in prog10:
        dur = nb * bar
        S.chord('strings', f, dur, [up(n, 0) for n in chord_notes(ch)] + [up(chord_notes(ch)[1], 1)], 0.3, a=0.8, r=0.8)
        S.add('cello', f, dur, ROOT[ch].replace('1', '2'), 0.25)
        f += dur
    motif(C['listen2'] + 8, 5, vel=0.4, gap=14)
    fin = max(f, C['lastWord'] + 6)
    S.chord('strings', fin, C['end'] - fin - 10, ['D3', 'A3', 'D4', 'F#4', 'A4'], 0.36, a=0.8, r=1.8)
    S.add('cello', fin, C['end'] - fin - 10, 'D2', 0.3)
    S.chord('celesta', fin + 20, 60, ['D5', 'F#5', 'A5', 'D6'], 0.32)
    motif(fin + 100, 6, vel=0.22, gap=16)
    S.chord('celesta', fin + 190, 60, ['D6', 'A6'], 0.18)
    return S


# music master gain automation (frame, dB) following the 08 energy curve; mixer interpolates
def automation(C):
    return [
        (0, -60), (C['listen'] + 10, -6), (C['universe0'] - 10, -6), (C['growing0'], -2), (C['ch1'], -3),
        (C['sameSiren'] - 10, -2), (C['whatChanged'], -5), (C['ch2'], -4), (C['swims'], -3), (C['squeezedWaves'], -5),
        (C['y1842'], -5), (C['threeYears'], -3), (C['people'], -6), (C['twist1'] - 6, -4), (C['twist1'] + 4, -9),
        (C['didnt'], -7), (C['ch3'], -4), (C['theyDid'], -2.5), (C['tens'], -4), (C['why'], -1.5), (C['flee'] + 14, -6),
        (C['ch3End'] + 8, -14), (C['enter'], -2), (C['y1923'], -3), (C['y1929'], -2.5), (C['notJust'], -1),
        (C['expanding'], 0), (C['expanding'] + 60, -1), (C['belgian'], -5), (C['twist2'], -7), (C['farGalaxies'], -6),
        (C['towardRed2'], -2.5), (C['ch5'], -4), (C['lastWord'], -2), (C['end'] - 40, -4), (C['end'] - 2, -40),
    ]
