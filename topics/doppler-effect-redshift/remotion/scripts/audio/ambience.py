"""Procedural ambience beds (08 sec. 2). Each bed is rendered only for the spans that need it.

bed(key, dur, seed) -> stereo float32 (n,2), loudness-normalised later by the mixer.
SCENE_AMB maps every scene id to an ambience key (or None = music only) and a level vs voice (dB).
"""
import numpy as np
from dsp import (SR, white, pink, brown, lp, hp, bp, resonator, smooth_noise, smoothstep, stereo, rng, perc, note_hz)

# scene id -> (ambience key, level vs voice dB). None = deep space / graphic: music carries it.
SCENE_AMB = {
    's0_void': (None, 0), 's0_street': ('street', -30), 's0_tilt': ('street', -32), 's0_space': (None, 0),
    's1_cab': ('cab', -28), 's1_roof': ('street_moving', -29), 's1_split': ('split', -29),
    's1_notsiren': ('street', -30), 's1_air': ('street', -30),
    's2_pond': ('pond', -30), 's2_still': ('pond', -30), 's2_swim': ('pond', -30), 's2_compare': ('pond', -32),
    's2_ear': (None, 0), 's2_speed': ('lab', -36), 's2_study': ('study', -32), 's2_suitcase': ('study', -33),
    's2_train': ('railway', -28), 's2_observers': ('railway', -29), 's2_twist': (None, 0), 's2_paper': ('study', -32),
    's3_lab': ('lab', -34), 's3_blue': ('lab', -34), 's3_galaxy': (None, 0), 's3_toosmall': ('study', -32),
    's3_quill': ('study_night', -32), 's3_barcode': ('lab', -34), 's3_dome': ('observatory', -32),
    's3_slipher': ('observatory_in', -32), 's3_andromeda': (None, 0), 's3_map': (None, 0),
    's4_dome': ('observatory', -32), 's4_plate': ('lab', -36), 's4_scale': (None, 0), 's4_tapes': (None, 0),
    's4_chart': ('chalk', -34), 's4_grid': (None, 0), 's4_peak': (None, 0), 's4_lemaitre': ('study', -33),
    's4_twist': (None, 0), 's4_road': ('night_road', -34), 's4_dough': ('kitchen', -32), 's4_ray': (None, 0),
    's5_street': ('street', -30), 's5_sky': ('street_night', -32),
}


def _bird(seed, sr=SR):
    r = rng(seed)
    out = []
    for k in range(r.integers(2, 5)):
        d = r.uniform(0.05, 0.12)
        n = int(d * sr)
        t = np.arange(n) / sr
        f0 = r.uniform(2800, 4200)
        f = f0 * (1 + r.uniform(-0.25, 0.35) * np.sin(np.pi * t / d)) + 300 * np.sin(2 * np.pi * r.uniform(25, 45) * t)
        x = np.sin(2 * np.pi * np.cumsum(f) / sr) * np.sin(np.pi * t / d) ** 2
        out.append(x.astype(np.float32))
        out.append(np.zeros(int(r.uniform(0.04, 0.1) * sr), np.float32))
    return np.concatenate(out)


def _scatter(n, events_per_s, maker, seed, pan_spread=0.8, gain_range=(0.3, 1.0)):
    r = rng(seed)
    out = np.zeros((n, 2), np.float32)
    t = r.exponential(1 / events_per_s)
    k = 0
    while t * SR < n:
        clip = maker(seed * 1000 + k)
        st = stereo(clip, r.uniform(-pan_spread, pan_spread)) * r.uniform(*gain_range)
        s = int(t * SR)
        e = min(n, s + len(st))
        out[s:e] += st[:e - s]
        t += r.exponential(1 / events_per_s)
        k += 1
    return out


def _wide(m1, m2):
    return np.stack([m1, m2], axis=1).astype(np.float32)


def _crickets(n, seed, rate=3.2, f=4700, density=1.0):
    """cricket chorus: several insects, each a chirp train (pulses at ~30 Hz inside chirps)."""
    out = np.zeros((n, 2), np.float32)
    t = np.arange(n) / SR
    r = rng(seed)
    for k in range(int(4 * density)):
        fk = f * r.uniform(0.9, 1.12)
        rk = rate * r.uniform(0.8, 1.25)
        ph = r.uniform(0, 1)
        chirp_on = ((t * rk + ph) % 1.0) < 0.28
        pulse = (np.sin(2 * np.pi * 32 * t) > 0.2)
        env = lp((chirp_on & pulse).astype(np.float32), 400, 1)
        tone = np.sin(2 * np.pi * fk * t + r.uniform(0, 6))
        out += stereo((tone * env * r.uniform(0.3, 0.8)).astype(np.float32), r.uniform(-0.9, 0.9))
    return out


def _traffic(n, seed):
    base = lp(brown(n, seed), 220, 2) * 0.8
    swell = np.zeros(n, np.float32)
    r = rng(seed + 1)
    t = 0.0
    tt = np.arange(n) / SR
    while t < n / SR:
        c = t + r.uniform(1.5, 4)
        w = r.uniform(1.2, 2.5)
        swell += np.exp(-((tt - c) / w) ** 2).astype(np.float32) * r.uniform(0.3, 0.9)
        t = c + r.uniform(1, 4)
    car = bp(pink(n, seed + 2), 120, 900) * swell
    return base, car


def bed(key, dur, seed=1):
    n = int(dur * SR)
    if n <= 0:
        return np.zeros((0, 2), np.float32)
    tt = np.arange(n) / SR
    if key in ('street', 'street_moving', 'street_night'):
        base, car = _traffic(n, seed)
        wind = bp(pink(n, seed + 3), 250, 1400) * (0.5 + 0.5 * smooth_noise(n, 0.3, seed + 4)) * 0.35
        x = _wide(base + car * 0.9 + wind, lp(brown(n, seed + 5), 220, 2) * 0.8 + car * 0.7 + bp(pink(n, seed + 6), 250, 1400) * 0.3)
        if key != 'street_night':
            x += _scatter(n, 0.6, _bird, seed + 7, 0.9, (0.04, 0.12))
        else:
            x = x * 0.55 + _crickets(n, seed + 8, 2.6, 4300, 0.8) * 0.05
        if key == 'street_moving':
            road = lp(pink(n, seed + 9), 700, 2) * 0.6
            x += stereo(road, 0)
        return x
    if key == 'cab':
        f = 36 * (1 + 0.03 * smooth_noise(n, 0.4, seed))
        ph = 2 * np.pi * np.cumsum(f) / SR
        eng = sum(np.sin(ph * k) / (k ** 1.2) for k in (1, 2, 3, 4, 6)).astype(np.float32)
        road = lp(pink(n, seed + 1), 400, 3) * 0.9
        bumps = np.zeros(n, np.float32)
        r = rng(seed + 2)
        for c in np.cumsum(r.uniform(0.6, 1.6, int(dur) + 2)):
            s = int(c * SR)
            if s < n - 4800:
                bumps[s:s + 4800] += (np.sin(2 * np.pi * 55 * np.arange(4800) / SR) * np.exp(-np.arange(4800) / 900)).astype(np.float32) * r.uniform(0.2, 0.6)
        m = lp(eng * 0.6 + road + bumps, 1200, 2)
        return _wide(m, lp(eng * 0.6 + lp(pink(n, seed + 3), 400, 3) * 0.9 + bumps, 1200, 2))
    if key == 'split':
        a = bed('cab', dur, seed)
        b = bed('street', dur, seed + 50)
        return (a * np.array([0.9, 0.25], np.float32) + b * np.array([0.25, 0.9], np.float32))
    if key == 'pond':
        lap_env = 0.5 + 0.5 * np.sin(2 * np.pi * 0.37 * tt + 2 * smooth_noise(n, 0.2, seed))
        lap = lp(pink(n, seed + 1), 600, 2) * lap_env * 0.7
        lap2 = lp(pink(n, seed + 2), 600, 2) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.29 * tt + 1.3)) * 0.7

        def gl(s):
            r = rng(s)
            d = r.uniform(0.04, 0.09)
            m = int(d * SR)
            t = np.arange(m) / SR
            f = r.uniform(500, 1100) * (1 + 1.5 * t / d)
            return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d / 3))).astype(np.float32)
        x = _wide(lap, lap2) + _scatter(n, 1.5, gl, seed + 3, 0.7, (0.05, 0.18))
        x += _crickets(n, seed + 4, 3.0, 4800, 1.0) * 0.07
        x += stereo(bp(pink(n, seed + 5), 1500, 6000) * (0.5 + 0.5 * smooth_noise(n, 0.25, seed + 6)) * 0.12, 0.2)
        return x
    if key in ('study', 'study_night'):
        room = lp(pink(n, seed), 350, 2) * 0.5

        def crackle(s):
            r = rng(s)
            m = int(0.012 * SR)
            return (resonator(white(m, s) * perc(m, 0.0002, 0.0015), r.uniform(1500, 4000), 3)).astype(np.float32)
        x = stereo(room, 0) + _scatter(n, 4.0, crackle, seed + 1, 0.3, (0.05, 0.25))
        flame = bp(pink(n, seed + 2), 300, 1800) * (0.6 + 0.4 * smooth_noise(n, 2.0, seed + 3)) * 0.08
        x += stereo(flame, -0.1)
        if key == 'study_night':
            x += _crickets(n, seed + 4, 2.4, 4400, 0.6) * 0.04
        return x
    if key == 'railway':
        wind = bp(pink(n, seed), 200, 1800) * (0.55 + 0.45 * smooth_noise(n, 0.35, seed + 1)) * 0.55
        wind2 = bp(pink(n, seed + 2), 200, 1800) * (0.55 + 0.45 * smooth_noise(n, 0.35, seed + 3)) * 0.55
        grass = hp(pink(n, seed + 4), 3000) * (0.5 + 0.5 * smooth_noise(n, 0.5, seed + 5)) * 0.12
        rumble = lp(brown(n, seed + 6), 120, 2) * 0.35
        x = _wide(wind + grass + rumble, wind2 + grass * 0.8 + rumble)
        x += _scatter(n, 0.5, _bird, seed + 7, 0.9, (0.03, 0.1))
        return x
    if key == 'lab':
        hum = sum(np.sin(2 * np.pi * 60 * k * tt) / k ** 1.5 for k in (1, 2, 3, 5)).astype(np.float32) * 0.35
        fan = lp(pink(n, seed), 900, 2) * 0.5
        x = _wide(hum + fan, hum + lp(pink(n, seed + 1), 900, 2) * 0.5)
        return x
    if key in ('observatory', 'observatory_in'):
        wind = bp(pink(n, seed), 150, 900) * (0.5 + 0.5 * smooth_noise(n, 0.2, seed + 1)) * 0.5
        x = stereo(wind, 0) + _crickets(n, seed + 2, 2.2, 4200, 1.2) * (0.06 if key == 'observatory' else 0.025)
        if key == 'observatory_in':
            x = x * 0.6 + stereo(lp(pink(n, seed + 3), 300, 2) * 0.4, 0)
        return x
    if key == 'night_road':
        wind = bp(pink(n, seed), 150, 1200) * (0.5 + 0.5 * smooth_noise(n, 0.25, seed + 1)) * 0.5
        return stereo(wind, 0) + _crickets(n, seed + 2, 2.0, 4000, 0.5) * 0.04
    if key == 'chalk':
        room = lp(pink(n, seed), 400, 2) * 0.5

        def tick(s):
            m = int(0.02 * SR)
            return resonator(white(m, s) * perc(m, 0.0002, 0.002), 2200, 8).astype(np.float32)
        x = stereo(room, 0)
        # wall clock: one tick per second, alternating pitch
        for k in range(int(dur)):
            c = tick(seed + k) * (0.12 if k % 2 else 0.09)
            s = int((k + 0.3) * SR)
            if s + len(c) < n:
                x[s:s + len(c)] += stereo(c, 0.6)
        return x
    if key == 'kitchen':
        room = lp(pink(n, seed), 500, 2) * 0.5
        hum = np.sin(2 * np.pi * 50 * tt).astype(np.float32) * 0.05
        x = stereo(room + hum, 0)
        for k in range(int(dur / 0.95)):
            m = int(0.02 * SR)
            c = resonator(white(m, seed + k) * perc(m, 0.0002, 0.002), 3100, 10).astype(np.float32) * 0.1
            s = int((k * 0.95 + 0.2) * SR)
            if s + m < n:
                x[s:s + m] += stereo(c, -0.5)
        return x
    raise SystemExit('unknown ambience ' + key)
