#!/apps/crm/vms-package/usr/bin/python3

import sys
import wave
import contextlib

fname = sys.argv[1]
with contextlib.closing(wave.open(fname,'r')) as f:
    frames = f.getnframes()
    rate = f.getframerate()
    duration = frames / float(rate)
    print(duration)
