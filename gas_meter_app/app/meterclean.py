"""Plausibility of a step of the meter reading. A G4 gas meter passes at most about 6 m3 per hour, so a larger jump
between two readings is not gas: a restart of the counter or an old retained value on the broker."""
MAX_M3H = 8.0


def step_ok(delta, seconds):
    return 0.0 <= delta <= MAX_M3H * max(seconds, 3600.0) / 3600.0 + 1.0
