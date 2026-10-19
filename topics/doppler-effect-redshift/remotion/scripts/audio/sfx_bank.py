"""SFX bank: one function per cue key -> stereo float32 clip at 48 kHz.

Keys come from data/video.json "sfx". Where the supplied library (resources/SFX) has a good match
it is used (decoded with ffmpeg, trimmed, faded); everything else (siren, water, chalk, steam,
horns, foley) is synthesized here with seeded numpy/scipy. LIB below is the key -> file map that
is also written to audio_build/cues.txt.
"""
import os
import subprocess
import numpy as np
from dsp import (SR, adsr, perc, fade, white, pink, brown, lp, hp, bp, resonator, peak_filter, formant,
                 karplus, stereo, stereo_dyn, smooth_noise, smoothstep, db, note_hz, tv_lowpass, rng)
import doppler as dp

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'resources', 'SFX'))

# key -> (library file, start s, max dur s, rate factor)  rate<1 = pitched down/slower
LIB = {
    'whoosh_fast': ('Whooshes_/Cinematic Fast Normal Whoosh.wav', 0.0, 0.86, 1.0),
    'whoosh_up': ('Whooshes_/High And Fast Whoosh.wav', 0.0, 1.6, 1.0),
    'whoosh_low': ('Whooshes_/Cinematic Low Whoosh.wav', 0.0, 2.2, 1.0),
    'whoosh_mid': ('Whooshes_/Cinematic Mediam Whoosh.wav', 0.0, 2.0, 1.0),
    'whoosh_soft': ('Whooshes_/Simple Whoosh 2.wav', 0.0, 2.0, 1.0),
    'whoosh_rise': ('Risers/Smooth Riser.wav', 0.0, 2.5, 1.0),
    'deep_whoosh': ('Whooshes_/Whoosh Deep Short.wav', 0.0, 2.34, 1.0),
    'pop': ('Pop/Smooth Pop.wav', 0.0, 0.5, 1.0),
    'pop2': ('Pop/Meadia Pop.wav', 0.0, 0.8, 1.0),
    'tick': ('Clicks/High Click.wav', 0.0, 0.148, 1.0),
    'stretch': ('Ui Sound Effects_/Ui stretch.wav', 0.0, 1.83, 1.0),
    'card_slide': ('Whooshes_/Smooth And Fast Whoosh.wav', 0.0, 1.0, 1.25),
}

_cache = {}


def load_lib(rel, start=0.0, maxdur=None, rate=1.0):
    k = (rel, start, maxdur, rate)
    if k in _cache:
        return _cache[k]
    path = os.path.join(RES, rel)
    sr_in = int(SR * rate)  # decode at SR*rate then treat as SR -> pitch/speed factor 1/rate... (rate>1 = faster)
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-i', path]
    if maxdur:
        cmd += ['-t', str(maxdur * rate)]
    cmd += ['-ac', '2', '-ar', str(int(SR / rate)), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    # trim leading silence (> -50 dB) so the hit lands on the cue frame
    a = np.max(np.abs(x), axis=1)
    thr = max(1e-4, a.max() * 0.003)
    nz = np.nonzero(a > thr)[0]
    if len(nz):
        x = x[max(0, nz[0] - 48):]
    x = x / (np.max(np.abs(x)) + 1e-9)
    x[:, 0] = fade(x[:, 0], 0.002, 0.04)
    x[:, 1] = fade(x[:, 1], 0.002, 0.04)
    _cache[k] = x
    return x


def N(d):
    return int(d * SR)


def T(d):
    return np.arange(N(d)) / SR


def norm(x):
    return (x / (np.max(np.abs(x)) + 1e-9)).astype(np.float32)


def mono2(x, pan=0.0, width=0.0, seed=0):
    """mono -> stereo with optional decorrelated width (short delay on one side)."""
    s = stereo(x, pan)
    if width > 0:
        d = int(0.0007 * SR + width * 0.004 * SR)
        s[:, 1] = np.concatenate([np.zeros(d, np.float32), s[:-d, 1]]) * (1 - width * 0.2) + s[:, 1] * width * 0.2
    return s


# ------------------------------------------------------------------ synth building blocks
def bell(freq, dur, seed=0, bright=1.0, decay=1.2):
    t = T(dur)
    parts = [(1, 1, 1), (2.0, 0.45, 0.6), (2.76, 0.35, 0.5), (5.4, 0.2 * bright, 0.25), (8.93, 0.1 * bright, 0.15)]
    x = np.zeros_like(t, dtype=np.float32)
    for r_, a, dk in parts:
        x += (a * np.sin(2 * np.pi * freq * r_ * t) * np.exp(-t / (decay * dk))).astype(np.float32)
    x[:N(0.002)] *= np.linspace(0, 1, N(0.002))
    return x


def chirp(f0, f1, dur, curve=2.0):
    t = T(dur)
    u = (t / dur) ** curve
    f = f0 + (f1 - f0) * u
    return np.sin(2 * np.pi * np.cumsum(f) / SR).astype(np.float32)


def thump(f0=70, dur=0.35, drop=0.5, seed=0):
    t = T(dur)
    f = f0 * (1 + drop * np.exp(-t / 0.03))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dur / 4))
    x += 0.3 * lp(white(len(t), seed), 900) * np.exp(-t / 0.015)
    return x.astype(np.float32)


def click(dur=0.03, f=3000, q=6, seed=0, tau=0.004):
    x = white(N(dur), seed) * perc(N(dur), 0.0003, tau)
    return resonator(x, f, q)


def noise_sweep(dur, f0, f1, seed=0, q=3.0, env=None, block=512):
    """band-passed noise whose centre sweeps f0 -> f1 (exponential)."""
    n = N(dur)
    w = white(n, seed)
    out = np.zeros(n, np.float32)
    from scipy import signal
    zi = None
    for s in range(0, n, block):
        e = min(n, s + block)
        u = (s / n)
        fc = f0 * (f1 / f0) ** u
        b, a = signal.iirpeak(min(fc, SR / 2 - 200), q, fs=SR)
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        out[s:e], zi = signal.lfilter(b, a, w[s:e], zi=zi)
    if env is not None:
        out *= env
    return out


# ------------------------------------------------------------------ cue synths
def s_bloom(seed):
    """soft sub 'bloom' on ring birth: low sine swell + airy top."""
    d = 1.6
    t = T(d)
    env = (1 - np.exp(-t / 0.05)) * np.exp(-t / 0.45)
    x = np.sin(2 * np.pi * 58 * t + 0.6 * np.sin(2 * np.pi * 116 * t) * np.exp(-t / 0.2)) * env
    air = bp(pink(len(t), seed), 2000, 7000) * (1 - np.exp(-t / 0.12)) * np.exp(-t / 0.3) * 0.08
    x = x + air + 0.25 * bell(880, d, seed, 0.3, 0.6) * 0.3
    return mono2(norm(x), 0, 0.5)


def siren_pass(seed, dur, t_pass, v=34.0, d=7.0, f_hi=960, f_lo=770, pan_range=(-1, 1), gain_tail=1.0):
    fn = dp.two_tone_phase(f_hi, f_lo, half_period=0.55, glide=0.05, vib=0.002, seed=seed)
    st, fac = dp.render_pass(fn, dp.SIREN_PARTIALS, dur, t_pass, -v, d, ref=d, seed=seed)  # moves R->L
    # electronic horn speaker coloration
    mono = st.sum(axis=1) * 0.5
    col = peak_filter(hp(mono, 400), 1800, 1.5, 4.0)
    # rebuild stereo with original pan curve (ratio)
    l = st[:, 0]; r = st[:, 1]
    tot = np.abs(l) + np.abs(r) + 1e-9
    panL = lp(np.abs(l) / tot, 5)
    out = np.stack([col * panL * 2, col * (1 - panL) * 2], axis=1)
    lo, hi = pan_range
    if (lo, hi) != (-1, 1):
        m = out.sum(axis=1) * 0.5
        p = (1 - 2 * panL)  # -1..1 (L..R)
        p = lo + (p + 1) / 2 * (hi - lo)
        out = stereo_dyn(m, p)
    n = len(out)
    out[:, 0] = fade(out[:, 0], 0.4, 1.2)
    out[:, 1] = fade(out[:, 1], 0.4, 1.2)
    return out / (np.max(np.abs(out)) + 1e-9), fac


def s_siren_steady(seed, dur):
    """constant-pitch siren heard from inside the cab: muffled through the roof + engine bleed."""
    fn = dp.two_tone_phase(960, 770, 0.55, 0.05, 0.002, seed)
    t = T(dur)
    ph = fn(t)
    x = sum(a * np.sin(ph * r_) for r_, a in dp.SIREN_PARTIALS).astype(np.float32)
    x = lp(x, 900, 4) + 0.15 * lp(x, 2500, 2)
    x = fade(x, 0.6, 0.8)
    return mono2(norm(x), -0.15, 0.4)


def s_whistle(seed):
    """steam whistle: three breathy partial-tones, swell then cut."""
    d = 1.9
    t = T(d)
    env = smoothstep(t / 0.18) * (1 - smoothstep((t - 1.3) / 0.5))
    x = np.zeros_like(t, dtype=np.float32)
    for k, f in enumerate([523.0, 659.0, 784.0]):
        fm = f * (1 + 0.006 * smooth_noise(len(t), 6, seed + k))
        tone = np.sin(2 * np.pi * np.cumsum(fm) / SR)
        x += (tone * (0.9 - 0.2 * k)).astype(np.float32)
    breath = bp(white(len(t), seed + 9), 700, 3500) * 0.35
    x = (x + breath) * env
    return mono2(norm(x), -0.3, 0.6)


def horns_pass(seed, dur, t_pass, v=22.0, d=6.0, note='G4'):
    """three horn players hold one steady note on an open car; observers hear it rise then fall."""
    f0 = note_hz(note)
    out = None
    for k, (cents, dly) in enumerate([(-6, 0.0), (0, 0.03), (7, 0.05)]):
        fn = dp.steady_phase(f0 * 2 ** (cents / 1200), vib=0.005, vib_rate=4.8 + k * 0.4, seed=seed + k)
        st, fac = dp.render_pass(fn, dp.BRASS_PARTIALS, dur, t_pass + dly, v, d + k * 0.6, ref=d, seed=seed + k)
        out = st if out is None else out + st
    m = out.sum(axis=1)
    # brass body: lowpass that opens with level + formant
    body = lp(m, 2600, 2) + 0.25 * formant(m, 'o')
    l = out[:, 0]; r = out[:, 1]
    panL = lp(np.abs(l) / (np.abs(l) + np.abs(r) + 1e-9), 5)
    st = np.stack([body * panL * 2, body * (1 - panL) * 2], axis=1)
    for c in range(2):
        st[:, c] = fade(st[:, c], 0.5, 1.0)
    return st / (np.max(np.abs(st)) + 1e-9), fac


def s_shimmer(seed, n_notes=9, d=2.2, base=1568):
    r = rng(seed)
    out = np.zeros((N(d), 2), np.float32)
    scale = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3]
    for k in range(n_notes):
        f = base * scale[r.integers(0, len(scale))]
        at = int((k / n_notes) * 0.9 * SR + r.uniform(0, 0.05) * SR)
        b = bell(f, 1.2, seed + k, 0.6, 0.35) * (0.5 + 0.5 * r.random())
        st = stereo(b, r.uniform(-0.8, 0.8))
        e = min(len(out), at + len(st))
        out[at:e] += st[:e - at]
    air = bp(pink(N(d), seed), 5000, 12000) * smoothstep(T(d) / 0.3) * (1 - smoothstep((T(d) - 0.8) / 1.2)) * 0.05
    out += stereo(air, 0)
    return out / (np.max(np.abs(out)) + 1e-9)


def s_sparkle(seed):
    return s_shimmer(seed, 14, 2.6, 2093)


def s_sign_creak(seed):
    """street-sign creak: stick-slip pulse train with wandering rate through a wooden body."""
    d = 0.9
    t = T(d)
    rate = 55 + 35 * np.sin(np.pi * t / d) + 8 * smooth_noise(len(t), 8, seed)
    ph = np.cumsum(rate) / SR
    pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(np.float32)
    x = resonator(pulses, 420, 12) + 0.6 * resonator(pulses, 1150, 15) + 0.3 * resonator(pulses, 2300, 20)
    x *= np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.7
    # metal chain jingle at the end of the swing
    x += 0.15 * bell(3100, d, seed, 0.5, 0.08) * (t > 0.5)
    return mono2(norm(x), 0.1, 0.3)


def s_ding(seed):
    x = bell(1760, 1.4, seed, 0.8, 0.5) + 0.5 * bell(2637, 1.4, seed + 1, 0.5, 0.35)
    return mono2(norm(x), 0.15, 0.5)


def s_question(seed):
    """curious 'hm?' : two soft marimba-ish notes rising."""
    d = 0.8
    out = np.zeros(N(d), np.float32)
    for k, (f, at) in enumerate([(note_hz('A5'), 0.0), (note_hz('E6'), 0.16)]):
        n = N(0.6)
        t = np.arange(n) / SR
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.03)) * np.exp(-t / 0.18)
        s = N(at)
        out[s:s + n] += x[:len(out) - s]
    return mono2(norm(out), 0.0, 0.4)


def s_bonk(seed):
    """cartoon bonk: hollow wood knock + boing spring that bends down."""
    d = 0.7
    t = T(d)
    knock = resonator(white(len(t), seed) * perc(len(t), 0.0005, 0.006), 330, 14) * 1.5
    knock += resonator(white(len(t), seed + 1) * perc(len(t), 0.0005, 0.004), 880, 10)
    f = 260 * np.exp(-t / 0.5) + 120
    boing = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.08 * np.sin(2 * np.pi * 14 * t))) / SR) * np.exp(-t / 0.18) * 0.6
    return mono2(norm(knock + boing), 0.2, 0.2)


def s_water_bloop(seed):
    """bubble 'bloop': sine with rising pitch (Minnaert resonance), plus a droplet tick."""
    d = 0.5
    t = T(d)
    f = 380 * (1 + 2.2 * (t / 0.08) ** 1.0)
    f = np.minimum(f, 1250)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07) * smoothstep(t / 0.004)
    x2 = np.sin(2 * np.pi * np.cumsum(np.minimum(900 * (1 + 3 * t / 0.05), 2600)) / SR) * np.exp(-np.maximum(t - 0.12, 0) / 0.03) * (t > 0.12) * 0.45
    return mono2(norm(x + x2), 0, 0.5)


def s_plip(seed):
    """soft leg tap on water: tiny droplet + short low 'tup'."""
    r = rng(seed)
    d = 0.35
    t = T(d)
    f0 = r.uniform(900, 1300)
    f = np.minimum(f0 * (1 + 1.8 * t / 0.04), f0 * 2.6)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) * smoothstep(t / 0.002)
    x += 0.5 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03)
    return mono2(norm(x), r.uniform(-0.2, 0.2), 0.3)


def s_skitter(seed):
    """tiny skitter: rapid irregular light ticks on the water film."""
    r = rng(seed)
    d = 0.8
    out = np.zeros(N(d), np.float32)
    tt = 0.0
    while tt < 0.6:
        n = N(0.03)
        c = click(0.03, r.uniform(2500, 5000), 5, int(r.integers(1e6)), 0.003) * r.uniform(0.4, 1.0)
        s = N(tt)
        out[s:s + n] += c[:len(out) - s]
        tt += r.uniform(0.025, 0.06)
    out *= np.exp(-T(d) / 0.5)
    return mono2(norm(out), 0.1, 0.4)


def s_needle(seed):
    out = np.zeros(N(0.4), np.float32)
    for k, at in enumerate([0.0, 0.11]):
        c = click(0.05, 2400 + 600 * k, 9, seed + k, 0.008)
        c += 0.5 * resonator(white(N(0.05), seed + 5 + k) * perc(N(0.05), 0.0003, 0.01), 900, 5)
        s = N(at)
        out[s:s + len(c)] += c
    return mono2(norm(out), 0, 0.3)


def s_match(seed):
    """match strike: scratchy scrape, ignition puff, soft flame hiss."""
    d = 1.4
    t = T(d)
    scrape = bp(white(len(t), seed), 1500, 7000) * np.exp(-((t - 0.07) / 0.05) ** 2)
    scrape *= 1 + 0.8 * (smooth_noise(len(t), 400, seed + 1) > 0.3)
    puff = lp(white(len(t), seed + 2), 1800) * np.exp(-np.maximum(t - 0.12, 0) / 0.08) * (t > 0.12) * 1.3
    hiss = bp(pink(len(t), seed + 3), 800, 4000) * smoothstep((t - 0.15) / 0.2) * np.exp(-np.maximum(t - 0.3, 0) / 0.6) * 0.25
    return mono2(norm(scrape + puff + hiss), -0.1, 0.4)


def s_cough(seed):
    """two soft muffled coughs (frail professor): formant-filtered noise bursts."""
    d = 0.9
    out = np.zeros(N(d), np.float32)
    for k, (at, a) in enumerate([(0.0, 1.0), (0.32, 0.7)]):
        n = N(0.22)
        t = np.arange(n) / SR
        env = smoothstep(t / 0.012) * np.exp(-t / 0.06)
        x = formant(white(n, seed + k), 'a') * env + 0.4 * np.sin(2 * np.pi * 140 * t) * env
        s = N(at)
        out[s:s + n] += x * a
    out = lp(out, 2200, 2)
    return mono2(norm(out), -0.2, 0.3)


def s_latch(seed):
    """suitcase brass latch: two metallic clicks."""
    out = np.zeros(N(0.4), np.float32)
    for k, at in enumerate([0.0, 0.07]):
        c = click(0.08, 3200 - 500 * k, 18, seed + k, 0.012) + 0.5 * click(0.08, 5400, 25, seed + 3 + k, 0.01)
        s = N(at)
        out[s:s + len(c)] += c
    return mono2(norm(out), 0.1, 0.3)


def s_thud(seed):
    x = thump(85, 0.5, 0.6, seed) + 0.3 * resonator(white(N(0.5), seed + 1) * perc(N(0.5), 0.001, 0.02), 240, 4)
    return mono2(norm(x), 0.05, 0.2)


def s_chuff(seed):
    """steam locomotive chuff: noise burst with a low body, distant."""
    r = rng(seed)
    d = 0.32
    t = T(d)
    env = smoothstep(t / 0.01) * np.exp(-t / 0.07)
    x = bp(white(len(t), seed), 250, 2400) * env + 0.5 * lp(white(len(t), seed + 1), 300) * env
    return mono2(norm(x) * r.uniform(0.75, 1.0), -0.2, 0.5)


def s_twist(seed):
    """page-curl 'fwip' then a little harp glissando up."""
    d = 1.6
    out = np.zeros(N(d), np.float32)
    env = np.sin(np.pi * np.clip(T(0.32) / 0.32, 0, 1)) ** 2
    fw = noise_sweep(0.32, 800, 6000, seed, 2.0, env)
    out[:len(fw)] += fw * 1.2
    notes = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6']
    for k, nm in enumerate(notes):
        s = N(0.22 + k * 0.045)
        pl = karplus(note_hz(nm), 1.2, seed + k, 0.9985, 0.6) * (0.6 + 0.05 * k)
        e = min(len(out), s + len(pl))
        out[s:e] += pl[:e - s]
    return mono2(norm(out), 0, 0.6)


def s_glass_shimmer(seed):
    d = 2.0
    out = np.zeros(N(d), np.float32)
    r = rng(seed)
    for k in range(7):
        f = r.uniform(2400, 6200)
        s = N(k * 0.09 + r.uniform(0, 0.03))
        b = bell(f, 1.2, seed + k, 1.2, 0.25) * 0.7
        out[s:s + len(b)] += b[:len(out) - s]
    out += bp(pink(N(d), seed), 6000, 14000) * np.exp(-T(d) / 0.6) * 0.1
    return mono2(norm(out), 0, 0.8)


def s_neon(seed):
    """neon tube buzz-on: flickery 120 Hz harmonic buzz with ignition ticks, then steady and fade."""
    d = 1.3
    t = T(d)
    hum = sum(np.sin(2 * np.pi * 120 * k * t) / k for k in range(1, 18)).astype(np.float32)
    hum = bp(hum, 150, 6000)
    flick = np.zeros_like(t)
    r = rng(seed)
    for (a, b_) in [(0.0, 0.06), (0.12, 0.16), (0.22, 0.33), (0.4, 1.3)]:
        flick += ((t >= a) & (t < b_)).astype(np.float32)
    flick = lp(flick.astype(np.float32), 120, 1)
    x = hum * flick * (1 - smoothstep((t - 0.8) / 0.5) * 0.7)
    for a in [0.0, 0.12, 0.22, 0.4]:
        c = click(0.02, 4000, 4, int(a * 1000) + seed, 0.002)
        s = N(a)
        x[s:s + len(c)] += c * 0.8
    return mono2(norm(x), 0.1, 0.4)


def s_sweep(seed):
    """blue -> red: synth sweep that rises then falls (formant-ish saw), 1.6 s."""
    d = 1.6
    t = T(d)
    f = 300 + 900 * np.sin(np.pi * np.clip(t / d, 0, 1) * 0.8) ** 1.5
    f = np.where(t > 0.55 * d, 300 + (f - 300) * np.exp(-(t - 0.55 * d) / 0.3), f)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(ph * k) / k for k in range(1, 9)).astype(np.float32)
    cutoff = 800 + 3500 * np.sin(np.pi * np.clip(t / d, 0, 1))
    x = tv_lowpass(x, cutoff)
    x *= smoothstep(t / 0.08) * (1 - smoothstep((t - d + 0.4) / 0.4))
    return mono2(norm(x), 0, 0.7)


def s_squeak(seed):
    d = 0.25
    t = T(d)
    f = 1800 + 900 * np.sin(np.pi * t / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
    x += 0.2 * np.sin(2 * 2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
    return mono2(norm(x), 0.2, 0.2)


def s_stamp(seed):
    """rubber stamp thunk: low wooden thud + paper slap."""
    x = thump(110, 0.4, 0.8, seed) + 0.6 * bp(white(N(0.4), seed + 1), 1500, 6000) * perc(N(0.4), 0.0005, 0.012)
    x += 0.4 * resonator(white(N(0.4), seed + 2) * perc(N(0.4), 0.0005, 0.01), 520, 8)
    return mono2(norm(x), 0, 0.2)


def s_slide(seed):
    """soft slide 'shhk' (barcode sliding toward red)."""
    d = 0.75
    env = smoothstep(T(d) / 0.1) * (1 - smoothstep((T(d) - 0.45) / 0.25))
    x = noise_sweep(d, 2500, 1200, seed, 1.5, env)
    return mono2(norm(x), -0.1, 0.5)


def s_clink(seed):
    """glass plate clink: inharmonic high modes, quick decay."""
    d = 0.9
    t = T(d)
    x = np.zeros_like(t, dtype=np.float32)
    for f, a, tau in [(2210, 1, 0.25), (3870, 0.6, 0.16), (5530, 0.4, 0.1), (7010, 0.25, 0.07)]:
        x += (a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)).astype(np.float32)
    x[:N(0.001)] *= np.linspace(0, 1, N(0.001))
    return mono2(norm(x), 0.1, 0.4)


def s_whoosh_out(seed):
    """galaxies flee: many soft outward whooshes, staggered, spreading left/right."""
    base = load_lib('Whooshes_/Smooth And Fast Whoosh.wav')
    d = 3.0
    out = np.zeros((N(d), 2), np.float32)
    r = rng(seed)
    from scipy import signal
    for k in range(6):
        rate = r.uniform(0.85, 1.25)
        m = base.mean(axis=1)
        m = signal.resample(m, int(len(m) / rate)).astype(np.float32)
        st = stereo(m, (-1 if k % 2 else 1) * r.uniform(0.3, 0.9))
        s = N(k * 0.28 + r.uniform(0, 0.06))
        e = min(len(out), s + len(st))
        out[s:e] += st[:e - s] * (0.9 - 0.08 * k)
    return out / (np.max(np.abs(out)) + 1e-9)


def s_rumble(seed):
    """dome slit opening: heavy rumble + motor whir + gear clatter, ~3 s."""
    d = 3.2
    t = T(d)
    env = smoothstep(t / 0.4) * (1 - smoothstep((t - 2.4) / 0.8))
    rum = lp(brown(len(t), seed), 140, 2) * 1.2
    whir_f = 95 + 25 * smoothstep(t / 0.8)
    whir = sum(np.sin(2 * np.pi * np.cumsum(whir_f * k) / SR) / k for k in range(1, 7)).astype(np.float32) * 0.35
    clat = np.zeros_like(t, dtype=np.float32)
    r = rng(seed)
    tt = 0.2
    while tt < d - 0.4:
        c = click(0.05, r.uniform(700, 1500), 6, int(r.integers(1e6)), 0.01)
        s = N(tt)
        clat[s:s + len(c)] += c[:len(clat) - s] * 0.25
        tt += r.uniform(0.09, 0.16)
    x = (rum + whir + clat) * env
    return mono2(norm(x), 0, 0.6)


def s_blip(seed):
    d = 0.22
    t = T(d)
    x = np.sin(2 * np.pi * 1320 * t) * np.exp(-t / 0.05) * smoothstep(t / 0.003)
    x += 0.3 * np.sin(2 * np.pi * 2640 * t) * np.exp(-t / 0.03)
    return mono2(norm(x), 0, 0.3)


def s_zip(seed):
    """measuring-tape extend 'zzzip': fast ratchet clicks rising in rate."""
    d = 0.55
    t = T(d)
    rate = 60 + 260 * (t / d)
    ph = np.cumsum(rate) / SR
    pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(np.float32)
    x = resonator(pulses, 2600, 6) + 0.5 * resonator(pulses, 5200, 9)
    x += 0.2 * bp(white(len(t), seed), 3000, 9000) * np.sin(np.pi * t / d)
    x *= np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.5
    return mono2(norm(x), 0, 0.4)


def s_chalk_tap(seed, k):
    """chalk dot tap, pitch rising with dot index k (0..23)."""
    d = 0.12
    t = T(d)
    f = 1400 * 2 ** (k / 24 * 1.0)
    x = resonator(white(len(t), seed + k) * perc(len(t), 0.0003, 0.004), f, 5) + 0.4 * click(d, f * 2.3, 4, seed + 50 + k, 0.003)
    x += 0.4 * resonator(white(len(t), seed + 90 + k) * perc(len(t), 0.0003, 0.006), 300, 3)
    return mono2(norm(x), -0.4 + 0.8 * k / 23, 0.2)


def s_chalk_line(seed):
    """chalk line draw: squeaky scratchy stroke ~1.2 s."""
    d = 1.2
    t = T(d)
    env = smoothstep(t / 0.06) * (1 - smoothstep((t - 1.0) / 0.2))
    grit = bp(white(len(t), seed), 2000, 8000) * (0.6 + 0.4 * smooth_noise(len(t), 30, seed + 1))
    sq = np.sin(2 * np.pi * np.cumsum(2900 + 300 * smooth_noise(len(t), 3, seed + 2)) / SR) * 0.15 * (smooth_noise(len(t), 5, seed + 3) > 0.4)
    return mono2(norm((grit + sq) * env), 0, 0.3)


def s_siren_blip(seed):
    """short muted siren blip from the tiny ambulance (one hi-lo, filtered)."""
    fn = dp.two_tone_phase(960, 770, 0.18, 0.03, 0, seed)
    t = T(0.42)
    ph = fn(t)
    x = sum(a * np.sin(ph * r_) for r_, a in dp.SIREN_PARTIALS).astype(np.float32)
    x = lp(x, 1400, 2) * smoothstep(t / 0.02) * (1 - smoothstep((t - 0.32) / 0.1))
    return mono2(norm(x), 0.2, 0.3)


def s_nope(seed):
    """soft 'nope' buzz: two short low square-ish buzzes."""
    out = np.zeros(N(0.55), np.float32)
    for k, at in enumerate([0.0, 0.2]):
        n = N(0.16)
        t = np.arange(n) / SR
        x = np.tanh(3 * np.sin(2 * np.pi * 150 * t)) * smoothstep(t / 0.01) * (1 - smoothstep((t - 0.12) / 0.04))
        s = N(at)
        out[s:s + n] += lp(x.astype(np.float32), 1500)
    return mono2(norm(out), 0, 0.2)


def s_dough(seed):
    """dough rising: slow bubbling (low bubbles) + soft stretch, ~4 s."""
    d = 4.0
    out = np.zeros(N(d), np.float32)
    r = rng(seed)
    tt = 0.1
    while tt < d - 0.4:
        n = N(0.25)
        t = np.arange(n) / SR
        f0 = r.uniform(140, 320)
        x = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.2 * t / 0.12)) / SR) * np.exp(-t / 0.06) * smoothstep(t / 0.005)
        s = N(tt)
        out[s:s + n] += x[:len(out) - s] * r.uniform(0.3, 0.8)
        tt += r.uniform(0.15, 0.4)
    t = T(d)
    stretch = lp(pink(len(t), seed + 5), 500) * smoothstep(t / 1.0) * (1 - smoothstep((t - 3.0) / 1.0)) * 0.35
    return mono2(norm(out + stretch), 0, 0.5)


def s_glide(seed):
    """long falling-pitch sine glide (light ray stretching toward red), 2.6 s."""
    d = 2.6
    t = T(d)
    f = 1200 * (260 / 1200) ** smoothstep(t / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(2 * 2 * np.pi * np.cumsum(f) / SR)
    x *= smoothstep(t / 0.2) * (1 - smoothstep((t - d + 0.6) / 0.6))
    return mono2(norm(x.astype(np.float32)), 0, 0.7)


def s_earclick(seed, low=False):
    d = 0.06
    f = 1500 if low else 2400
    x = click(d, f, 7, seed, 0.005) + 0.3 * click(d, f * 2.1, 9, seed + 1, 0.003)
    return mono2(norm(x), 0.35, 0.1)


def s_stretch_lib(seed):
    return load_lib(*LIB['stretch'])


# ------------------------------------------------------------------ dispatch
def make(key, seed, sync):
    """returns (stereo clip, offset_samples, info). offset shifts the clip so its sync point lands on the cue."""
    if key in LIB:
        return load_lib(*LIB[key]), 0, 'lib:' + LIB[key][0]
    fps = 30
    if key == 'siren_pass':
        start, pas = sync['sirenStart'], sync['sirenPass']
        t_pass = (pas - start) / fps
        clip, fac = siren_pass(seed, t_pass + 3.2, t_pass, v=34.0, d=7.0)
        return clip, 0, 'synth doppler v=34 m/s d=7 m, pass @%d' % pas
    if key == 'siren_pass_split':
        start, pas = sync['splitStart'], sync['splitPass']
        t_pass = (pas - start) / fps
        clip, fac = siren_pass(seed, t_pass + 2.6, t_pass, v=30.0, d=8.0, pan_range=(0.15, 0.95))
        return clip, 0, 'synth doppler (right half) pass @%d' % pas
    if key == 'siren_pass_soft':
        start, pas = sync['closeStart'], sync['closePass']
        t_pass = (pas - start) / fps
        clip, fac = siren_pass(seed, t_pass + 3.0, t_pass, v=30.0, d=12.0)
        return clip, 0, 'synth doppler soft pass @%d' % pas
    if key == 'siren_steady':
        dur = (sync['steadyEnd'] - sync['steadyStart']) / fps
        return s_siren_steady(seed, dur), 0, 'synth steady muffled'
    if key == 'horns_pass':
        start, pas = sync['hornsStart'], sync['hornsPass']
        t_pass = (pas - start) / fps
        clip, fac = horns_pass(seed, t_pass + 2.6, t_pass)
        return clip, 0, 'synth 3 horns G4 doppler v=22 pass @%d' % pas
    if key.startswith('chalk_tap_'):
        return s_chalk_tap(seed, int(key[-2:])), 0, 'synth chalk tap'
    table = {
        'bloom': s_bloom, 'shimmer': s_shimmer, 'sparkle': s_sparkle, 'sign_creak': s_sign_creak,
        'ding': s_ding, 'question': s_question, 'bonk': s_bonk, 'water_bloop': s_water_bloop,
        'plip': s_plip, 'skitter': s_skitter, 'needle': s_needle, 'match': s_match, 'cough': s_cough,
        'latch': s_latch, 'thud': s_thud, 'whistle': s_whistle, 'chuff': s_chuff, 'twist': s_twist,
        'glass_shimmer': s_glass_shimmer, 'neon': s_neon, 'sweep': s_sweep, 'squeak': s_squeak,
        'stamp': s_stamp, 'slide': s_slide, 'clink': s_clink, 'whoosh_out': s_whoosh_out,
        'rumble': s_rumble, 'blip': s_blip, 'zip': s_zip, 'chalk_line': s_chalk_line,
        'siren_blip': s_siren_blip, 'nope': s_nope, 'dough': s_dough, 'glide': s_glide,
        'earclick': lambda s: s_earclick(s, False), 'earclick_low': lambda s: s_earclick(s, True),
    }
    if key not in table:
        raise SystemExit('no sfx for key ' + key)
    return table[key](seed), 0, 'synth'
