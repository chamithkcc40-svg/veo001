"""Small seeded DSP toolkit for the offline audio build (T7).

Everything is numpy/scipy, float32 where buffers are long, deterministic (seeded RNGs only).
SR is 48 kHz throughout; the final mix is written at 48 kHz.
"""
import numpy as np
from scipy import signal

SR = 48000


def rng(seed):
    return np.random.default_rng(seed)


def t_axis(dur, sr=SR):
    return np.arange(int(round(dur * sr))) / sr


def db(x):
    return 10 ** (x / 20.0)


# ------------------------------------------------------------------ envelopes
def adsr(n, a=0.01, d=0.1, s=0.7, r=0.2, sr=SR):
    """ADSR over n samples; release ends at n."""
    a_n, d_n, r_n = int(a * sr), int(d * sr), int(r * sr)
    s_n = max(0, n - a_n - d_n - r_n)
    env = np.concatenate([
        np.linspace(0, 1, max(a_n, 1), endpoint=False) ** 1.5,
        1 - (1 - s) * (1 - np.exp(-5 * np.linspace(0, 1, max(d_n, 1), endpoint=False))) / (1 - np.exp(-5)),
        np.full(s_n, s),
        s * (np.exp(-5 * np.linspace(0, 1, max(r_n, 1))) - np.exp(-5)) / (1 - np.exp(-5)),
    ])
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n].astype(np.float32)


def perc(n, a=0.002, tau=0.2, sr=SR):
    """percussive: short attack then exponential decay with time constant tau (s)."""
    t = np.arange(n) / sr
    env = np.exp(-t / tau)
    a_n = max(1, int(a * sr))
    env[:a_n] *= np.linspace(0, 1, a_n) ** 0.7
    return env.astype(np.float32)


def fade(x, fi=0.005, fo=0.02, sr=SR):
    x = x.copy()
    a, b = int(fi * sr), int(fo * sr)
    if a > 0:
        x[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if b > 0:
        x[-b:] *= np.cos(np.linspace(0, np.pi / 2, b)) ** 2
    return x


def smoothstep(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


# ------------------------------------------------------------------ oscillators
def phase_from_freq(f, sr=SR):
    """f: array of instantaneous frequency (Hz) -> phase (radians)."""
    return 2 * np.pi * np.cumsum(f) / sr


def saw_blep(phase):
    """band-limited-ish sawtooth from phase via additive (cheap, for low counts use poly-blep)."""
    p = (phase / (2 * np.pi)) % 1.0
    return (2 * p - 1).astype(np.float32)


def additive(phase, partials):
    """partials: list of (ratio, amp)."""
    out = np.zeros_like(phase, dtype=np.float32)
    for r, a in partials:
        out += (a * np.sin(phase * r)).astype(np.float32)
    return out


def supersaw(freq, n, voices=5, detune=0.12, seed=0, sr=SR, harmonics=14):
    """detuned additive saws (band limited by harmonic count; harmonics above 16 kHz dropped)."""
    r = rng(seed)
    out = np.zeros(n, np.float32)
    t = np.arange(n) / sr
    for v in range(voices):
        cents = (v - (voices - 1) / 2) / max(1, (voices - 1) / 2) * detune * 100
        f = freq * 2 ** (cents / 1200)
        ph0 = r.uniform(0, 2 * np.pi)
        for h in range(1, harmonics + 1):
            if f * h > 16000:
                break
            out += (np.sin(2 * np.pi * f * h * t + ph0 * h) / h).astype(np.float32)
    return out / voices


# ------------------------------------------------------------------ noise
def white(n, seed):
    return rng(seed).standard_normal(n).astype(np.float32)


def pink(n, seed):
    w = rng(seed).standard_normal(n)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    p = signal.lfilter(b, a, w)
    return (p / (np.std(p) + 1e-9)).astype(np.float32)


def brown(n, seed):
    w = rng(seed).standard_normal(n)
    b = signal.lfilter([1], [1, -0.995], w)
    b = b - signal.lfilter([1], [1, -0.9999], b) * 0  # keep simple
    hp = signal.butter(1, 15, 'hp', fs=SR, output='sos')
    b = signal.sosfilt(hp, b)
    return (b / (np.std(b) + 1e-9)).astype(np.float32)


def smooth_noise(n, rate_hz, seed, sr=SR):
    """slow random control signal in [-1,1] (cosine-interpolated random points)."""
    r = rng(seed)
    k = max(2, int(n / sr * rate_hz) + 3)
    pts = r.uniform(-1, 1, k)
    x = np.linspace(0, k - 2, n)
    i = np.floor(x).astype(int)
    fr = x - i
    w = (1 - np.cos(fr * np.pi)) / 2
    return (pts[i] * (1 - w) + pts[i + 1] * w).astype(np.float32)


# ------------------------------------------------------------------ filters
def sos(kind, f, order=2, sr=SR):
    return signal.butter(order, f, kind, fs=sr, output='sos')


def lp(x, f, order=2):
    return signal.sosfilt(sos('lowpass', min(f, SR / 2 - 100), order), x).astype(np.float32)


def hp(x, f, order=2):
    return signal.sosfilt(sos('highpass', f, order), x).astype(np.float32)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(sos('bandpass', [lo, min(hi, SR / 2 - 100)], order), x).astype(np.float32)


def peak_filter(x, f, q=8.0, gain_db=12.0):
    """resonant peaking EQ (RBJ)."""
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f / SR
    al = np.sin(w0) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w0), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w0), 1 - al / A]
    return signal.lfilter(b, a, x).astype(np.float32)


def resonator(x, f, q=30.0):
    """2-pole band resonator (unity peak)."""
    b, a = signal.iirpeak(f, q, fs=SR)
    return signal.lfilter(b, a, x).astype(np.float32)


def tv_lowpass(x, cutoff, block=256):
    """time-varying one-pole-ish lowpass (2x cascaded 1-pole) with per-block cutoff array (Hz)."""
    y = np.zeros_like(x, dtype=np.float32)
    z1 = z2 = 0.0
    n = len(x)
    for s in range(0, n, block):
        e = min(n, s + block)
        fc = float(np.mean(cutoff[s:e]))
        a = np.exp(-2 * np.pi * max(fc, 20) / SR)
        b1 = [1 - a]
        a1 = [1, -a]
        seg, zf1 = signal.lfilter(b1, a1, x[s:e], zi=[z1 * a])
        seg, zf2 = signal.lfilter(b1, a1, seg, zi=[z2 * a])
        z1 = zf1[0] / a if a else 0
        z2 = zf2[0] / a if a else 0
        y[s:e] = seg
    return y


def formant(x, vowel='a'):
    F = {'a': [(800, 1.0, 80), (1150, 0.5, 90), (2900, 0.25, 120)],
         'o': [(450, 1.0, 70), (800, 0.4, 80), (2830, 0.12, 100)],
         'u': [(325, 1.0, 50), (700, 0.25, 60), (2530, 0.08, 100)],
         'e': [(400, 1.0, 60), (1600, 0.4, 80), (2700, 0.2, 100)]}[vowel]
    out = np.zeros_like(x)
    for f, g, bw in F:
        out += g * resonator(x, f, f / bw)
    return out


def karplus(freq, dur, seed=0, decay=0.996, bright=0.5, sr=SR):
    """Karplus-Strong plucked string."""
    n = int(dur * sr)
    p = max(2, int(sr / freq))
    r = rng(seed)
    buf = r.uniform(-1, 1, p)
    buf = lp(buf.astype(np.float32), 1500 + 8000 * bright, 1)
    out = np.zeros(n, np.float32)
    b = buf.astype(np.float64).copy()
    idx = 0
    # vectorised in chunks of p
    for s in range(0, n, p):
        e = min(n, s + p)
        out[s:e] = b[: e - s]
        nb = decay * 0.5 * (b + np.roll(b, -1))
        b = nb
        idx += 1
    return out


# ------------------------------------------------------------------ space
def stereo(x, pan=0.0):
    """equal-power pan, pan in [-1,1]; x mono -> (n,2)."""
    th = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)], axis=1).astype(np.float32)


def stereo_dyn(x, pan):
    th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)], axis=1).astype(np.float32)


def make_ir(dur=2.2, seed=7, damp=6000, predelay=0.012, early=True):
    """stereo synthetic reverb IR: decaying noise whose brightness drops over time."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    r = rng(seed)
    out = np.zeros((n, 2), np.float32)
    for ch in range(2):
        w = r.standard_normal(n).astype(np.float32)
        env = np.exp(-6.9 * t / dur)  # -60 dB at dur
        bright = lp(w, damp, 1)
        dark = lp(w, damp / 6, 1)
        mixw = np.clip(t / dur * 1.6, 0, 1)
        sig = (bright * (1 - mixw) + dark * mixw) * env
        pd = int(predelay * SR)
        sig = np.concatenate([np.zeros(pd, np.float32), sig[:-pd] if pd else sig])
        if early:
            for k in range(6):
                d = int(r.uniform(0.004, 0.03) * SR) + pd
                if d < n:
                    sig[d] += r.uniform(0.2, 0.5) * (1 if r.random() > 0.5 else -1)
        out[:, ch] = sig
    out /= np.sqrt(np.sum(out ** 2) / 2) + 1e-9
    return out


def reverb(x2, ir, wet=0.25):
    """x2: (n,2). convolve L with IR L, R with IR R (overlap-add, memory safe)."""
    n = len(x2)
    y = np.zeros_like(x2)
    for ch in range(2):
        y[:, ch] = signal.oaconvolve(x2[:, ch], ir[:, ch], mode='full')[:n].astype(np.float32)
    return (x2 * (1 - wet * 0.5) + y * wet).astype(np.float32)


def delay(x2, t, fb=0.3, mixv=0.25, pingpong=True):
    d = int(t * SR)
    y = x2.copy()
    tap = x2.copy()
    for k in range(1, 6):
        g = fb ** k
        if g < 0.02:
            break
        sh = np.zeros_like(x2)
        sh[d * k:] = tap[:len(x2) - d * k]
        if pingpong and k % 2 == 1:
            sh = sh[:, ::-1]
        y += sh * g * mixv / fb
    return y


# ------------------------------------------------------------------ loudness (ITU-R BS.1770-4)
def k_weight(x, sr=SR):
    # stage 1 high shelf
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    K = np.tan(np.pi * f0 / sr)
    Vh = 10 ** (G / 20)
    Vb = Vh ** 0.4996667741545416
    a0 = 1 + K / Q + K * K
    b = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]
    a = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    y = signal.lfilter(b, a, x, axis=0)
    # stage 2 high pass
    f0, Q = 38.13547087602444, 0.5003270373238773
    K = np.tan(np.pi * f0 / sr)
    a0 = 1 + K / Q + K * K
    b = [1, -2, 1]
    a = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    return signal.lfilter(b, a, y, axis=0)


def _blocks_power(x, sr=SR, win=0.4, hop=0.1):
    if x.ndim == 1:
        x = x[:, None]
    y = k_weight(x.astype(np.float64), sr)
    p = np.sum(y ** 2, axis=1)
    w, h = int(win * sr), int(hop * sr)
    if len(p) < w:
        return np.array([np.mean(p)])
    c = np.concatenate([[0], np.cumsum(p)])
    starts = np.arange(0, len(p) - w + 1, h)
    return (c[starts + w] - c[starts]) / w


def lufs(x, sr=SR):
    z = _blocks_power(x, sr)
    lk = -0.691 + 10 * np.log10(z + 1e-12)
    z1 = z[lk > -70]
    if len(z1) == 0:
        return -70.0
    rel = -0.691 + 10 * np.log10(np.mean(z1)) - 10
    z2 = z1[(-0.691 + 10 * np.log10(z1 + 1e-12)) > rel]
    return float(-0.691 + 10 * np.log10(np.mean(z2) + 1e-12))


def max_momentary(x, sr=SR):
    z = _blocks_power(x, sr)
    return float(-0.691 + 10 * np.log10(np.max(z) + 1e-12))


def true_peak_db(x):
    """4x oversampled peak (dBTP)."""
    if x.ndim == 1:
        x = x[:, None]
    m = 0.0
    for ch in range(x.shape[1]):
        for s in range(0, len(x), SR * 10):
            seg = x[s:s + SR * 10 + 64, ch]
            up = signal.resample_poly(seg, 4, 1)
            m = max(m, float(np.max(np.abs(up))))
    return 20 * np.log10(m + 1e-12)


def limiter(x2, ceiling_db=-1.2, lookahead=0.005, release=0.08):
    """look-ahead peak limiter on 4x-oversampled detection (approx. true-peak safe)."""
    ceil = db(ceiling_db)
    n = len(x2)
    # detection on oversampled abs max, decimated back to sample rate
    det = np.zeros(n, np.float32)
    for ch in range(2):
        for s in range(0, n, SR * 10):
            e = min(n, s + SR * 10)
            seg = x2[max(0, s - 32):e + 32, ch]
            up = np.abs(signal.resample_poly(seg, 4, 1))
            up = up.reshape(-1, 4).max(axis=1) if len(up) % 4 == 0 else np.abs(seg)
            off = s - max(0, s - 32)
            det[s:e] = np.maximum(det[s:e], up[off:off + (e - s)])
    need = np.minimum(1.0, ceil / np.maximum(det, 1e-9))
    la = int(lookahead * SR)
    # min over lookahead window (running min via sliding)
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, size=2 * la + 1, origin=0)
    # smooth: attack instant (already looked ahead), release exponential
    a = np.exp(-1 / (release * SR))
    gs = np.empty_like(g)
    cur = 1.0
    # block-wise recursion in python is slow for 9M samples; use lfilter on inverted gain then max-combine
    inv = 1 - g
    sm = signal.lfilter([1 - a], [1, -a], inv)
    sm = np.maximum(inv, sm)
    gs = 1 - sm
    # second short smoothing to avoid clicks
    k = np.exp(-1 / (0.0015 * SR))
    gs = 1 - signal.lfilter([1 - k], [1, -k], 1 - gs)
    gs = np.minimum(gs, g + 0.0)  # never exceed instantaneous requirement
    return (x2 * gs[:, None]).astype(np.float32), float(1 - gs.min())


def env_follow(x, attack=0.05, release=0.4):
    """RMS-ish envelope follower (mono)."""
    e = np.abs(x).astype(np.float64)
    e = signal.lfilter([1 - np.exp(-1 / (0.01 * SR))], [1, -np.exp(-1 / (0.01 * SR))], e)
    # asymmetric smoothing: attack via max of fast, release via slow
    aa = np.exp(-1 / (attack * SR))
    ra = np.exp(-1 / (release * SR))
    fast = signal.lfilter([1 - aa], [1, -aa], e)
    slow = signal.lfilter([1 - ra], [1, -ra], e)
    return np.maximum(fast, slow).astype(np.float32)


def place(buf, clip, at_sample, gain=1.0):
    """add clip (n,) or (n,2) into buf at sample offset (clipped to buffer)."""
    if at_sample >= len(buf):
        return
    s = max(0, at_sample)
    cs = s - at_sample
    e = min(len(buf), at_sample + len(clip))
    if e <= s:
        return
    buf[s:e] += clip[cs:cs + (e - s)] * gain


def note_hz(name):
    """'A4' / 'F#5' / 'Bb3' -> Hz."""
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    n = names[name[0]]
    i = 1
    if name[1] in '#b':
        n += 1 if name[1] == '#' else -1
        i = 2
    octv = int(name[i:])
    midi = 12 * (octv + 1) + n
    return 440.0 * 2 ** ((midi - 69) / 12)


def compressor(x, thresh_db=-24.0, ratio=3.0, attack=0.008, release=0.12, knee=6.0, makeup=0.0):
    """feed-forward RMS-ish compressor (mono or stereo-linked)."""
    m = x if x.ndim == 1 else np.max(np.abs(x), axis=1)
    lev = env_follow(m, attack, release)
    ldb = 20 * np.log10(lev + 1e-9)
    over = ldb - thresh_db
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio),
                           (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))
    g = db(makeup - gr).astype(np.float32)
    return (x * (g if x.ndim == 1 else g[:, None])).astype(np.float32)
