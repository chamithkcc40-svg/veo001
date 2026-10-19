"""Physically based moving-source renderer (used for the siren and the horn-car pass-bys).

The listener is at the origin. The source follows a straight line x(tau) = v*(tau - t_pass), y = d.
The sound heard at time t was emitted at tau where tau + r(tau)/c = t (retarded time). We solve that
on a fine grid, then read the emitted phase at tau(t). That gives the true Doppler pitch curve
(high on approach, falling through the pass, low on recession), 1/r spreading, air absorption
(distance low-pass) and a pan that follows the source side. Because v < c the arrival map is
monotonic (no shock cone, same guardrail as the Rings engine).
"""
import numpy as np
from dsp import SR, lp, stereo_dyn, tv_lowpass

C_SOUND = 343.0


def retarded_time(t_out, v, d, t_pass):
    """tau(t) for received times t_out."""
    assert abs(v) < C_SOUND
    lo, hi = t_out[0] - 3.0, t_out[-1] + 0.5
    tau = np.arange(lo, hi, 0.0005)
    x = v * (tau - t_pass)
    r = np.sqrt(x * x + d * d)
    arr = tau + r / C_SOUND
    assert np.all(np.diff(arr) > 0)
    return np.interp(t_out, arr, tau)


def render_pass(emit_phase_fn, partials, dur, t_pass, v, d, ref=6.0, seed=0, absorb=True):
    """emit_phase_fn(tau_array) -> emitted phase (radians), defined for any tau.
    partials: [(ratio, amp)] harmonic recipe applied to the retarded phase.
    Returns stereo (n,2) and the (approx.) observed fundamental factor curve for logging."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    tau = retarded_time(t, v, d, t_pass)
    ph = emit_phase_fn(tau)
    sig = np.zeros(n, np.float32)
    for r_, a in partials:
        sig += (a * np.sin(ph * r_)).astype(np.float32)
    x = v * (tau - t_pass)
    r = np.sqrt(x * x + d * d)
    amp = (ref / np.maximum(r, ref * 0.5)).astype(np.float32)
    if absorb:
        cutoff = np.clip(14000 * (ref / np.maximum(r, 1.0)) ** 0.8, 1800, 14000)
        sig = tv_lowpass(sig, cutoff)
    sig *= amp
    pan = np.clip(x / np.maximum(r, 1e-3), -1, 1) * 0.85
    # pitch factor actually heard (d tau / dt)
    factor = np.gradient(tau, 1.0 / SR)
    return stereo_dyn(sig, pan), factor


def two_tone_phase(f_hi, f_lo, half_period=0.55, glide=0.04, vib=0.0, seed=0):
    """phase function for a neutral two-tone (hi-lo) siren, defined analytically on any tau grid."""
    def fn(tau):
        # build on a dense uniform grid covering tau, integrate, then interpolate
        g0, g1 = tau.min() - 0.01, tau.max() + 0.01
        grid = np.arange(g0, g1, 1.0 / SR)
        cyc = ((grid - g0) / half_period)
        k = np.floor(cyc).astype(int)
        fr = cyc - k
        hi = (k % 2 == 0)
        # short glide at each switch
        sw = np.clip(fr * half_period / glide, 0, 1)
        sw = sw * sw * (3 - 2 * sw)
        f_prev = np.where(hi, f_lo, f_hi)
        f_cur = np.where(hi, f_hi, f_lo)
        f = f_prev + (f_cur - f_prev) * sw
        if vib:
            f = f * (1 + vib * np.sin(2 * np.pi * 5.5 * grid))
        phase = 2 * np.pi * np.cumsum(f) / SR
        return np.interp(tau, grid, phase)
    return fn


def steady_phase(f0, vib=0.004, vib_rate=5.0, seed=0, drift=0.0):
    rng = np.random.default_rng(seed)
    ph0 = rng.uniform(0, 2 * np.pi)

    def fn(tau):
        g0, g1 = tau.min() - 0.01, tau.max() + 0.01
        grid = np.arange(g0, g1, 1.0 / SR)
        vib_on = np.clip((grid - g0) / 0.6, 0, 1)
        f = f0 * (1 + vib * vib_on * np.sin(2 * np.pi * vib_rate * grid + ph0) + drift * np.sin(2 * np.pi * 0.3 * grid))
        phase = 2 * np.pi * np.cumsum(f) / SR + ph0
        return np.interp(tau, grid, phase)
    return fn


SIREN_PARTIALS = [(1, 1.0), (2, 0.35), (3, 0.55), (4, 0.18), (5, 0.3), (6, 0.08), (7, 0.16), (9, 0.08), (11, 0.04)]
BRASS_PARTIALS = [(1, 1.0), (2, 0.8), (3, 0.62), (4, 0.45), (5, 0.32), (6, 0.22), (7, 0.15), (8, 0.1), (9, 0.06), (10, 0.04)]
