# SMR badge spin animation

Round SMR badge (words ring + gradient light) as a seamless loop.
`python3 render.py --help` for options (loop length, words, web address, size, fps, --transparent).

Loop rule: every motion does a whole number of cycles per loop (ring = 1 full turn,
gradient light = 4 turns, glow = 8 pulses) and the last frame is never a copy of the
first, so the file loops forever on a screen with no jump. Change speed with --loop only.
Dots between words are drawn circles (not a bullet character), centred in equal gaps.
