#!/usr/bin/env python3
# FR-DEAF-05: Signing onset from the pause cutter's motion curve.
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cut_by_pause import FPS, LEAD_PEAK, PAD, motion_curve, read_frames  # noqa: E402


def auto_threshold(_motion):
    """The cutter's own line between a seated settle and a real sign."""
    return float(LEAD_PEAK)


def onset_seconds(video):
    motion = motion_curve(read_frames(video))
    thr = auto_threshold(motion)
    hits = np.flatnonzero(motion > thr)
    frame = int(hits[0]) if len(hits) else 0
    return max(0.0, frame / FPS - PAD), thr


def main():
    if len(sys.argv) != 2:
        print("usage: sign_onset.py VIDEO", file=sys.stderr)
        return 2
    seconds, thr = onset_seconds(Path(sys.argv[1]))
    print(f"{seconds:.3f}")
    print(f"threshold {thr:.3f}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
