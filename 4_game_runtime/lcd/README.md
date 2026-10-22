# Routed LCD mapping

This maps the exact routing snapshot used by the simulation (see source SHA256
in `mapping.json`) to the C game's `MoidaFrame.display.data` bitmap.

- `mapping.csv`: one row per routed island, with original segment ID, C bit,
  word/mask, top/bottom net, contact, logical SEG/COM index and zebra slot.
- `mapping.json`: the same mapping plus physical contact coordinates in mm.
- `moida_lcd_lut.h`: 1,536-byte constant table and an allocation-free mapper.
  Both MCU test sketches now include it in the HAL display callback.

631 original game bits control 780 islands through 664 unique electrode pairs.
104 pairs are unused. Multiple islands belonging to the same original segment
can share a pair or use different pairs. All associated pairs turn on together.
Moves and vertex edits preserve identity; slices inherit the original game bit.
The generator rejects missing nets, ambiguous pad mappings and different game
bits assigned to the same pair. It uses saved assignments without inferring new
nets from trace contact. This is not a physical continuity/clearance verification.

## HAL use

```c
#include "moida_lcd_lut.h"
static uint8_t lcd_cells[16][6];
/* In the HAL present callback: */
moida_lcd_map(frame->display.data, lcd_cells);
/* Translate logical rows/columns to the actual LCD driver's RAM here. */
```

SEG and COM indexes are zero-based: SEG0 = T-N001, COM0 = B-W001.
C bit `b` is `data[b >> 5] & (UINT32_C(1) << (b & 31))`.
Output is COM-major: `lcd_cells[com][seg >> 3]`, bit `seg & 7`.
Each call replaces the entire output, including clearing unused pairs.
Output needs 96 bytes of caller storage and must not alias input.

For the saved zebra design, front-view left-to-right one-based slots are:
COM1..COM16 at 1..16, empty slots 17..18, SEG1..SEG48 at 19..66.
Contact coordinates are also included so orientation can be checked against
the factory drawing. This is NOT a promise about the supplier's pin numbering,
rear-view orientation or driver RAM order. Confirm those on the actual LCD.
The mapping expresses logical on/off states only; the LCD driver must supply
appropriate AC drive, bias and multiplex timing.

## Regenerate and test

From the repository root, using the same saved routing JSON as the simulator:

```sh
node 4_game_runtime/build-routed-panel.cjs /path/to/routing.json
node 4_game_runtime/build-lcd-lut.cjs /path/to/routing.json
python3 4_game_runtime/lcd/test-lut.py
```

The test checks every game bit individually, padding bits 631..639, all-on and
all-off against the island manifest, with C address/undefined-behavior sanitizers.

## MCU benchmark

Both CH32X035 and CH32V307 test builds now convert every presented frame into
`lcdCells[16][6]`. This is a bounded scan of 768 cells, not a search over islands.
The mapper clears 96 bytes, reads one bit index per cell, and sets the output
bit when needed. No dynamic allocation or island-name matching occurs on MCU.

Rebuild with the target's `build.py`, flash the generated HEX, then send `t`.
Expected results: `PASS`, `frame_hash=98D3E4E`, `lut_hash=3E37DCCC`.
PASS now requires both hashes to match over the same 1,000 frames.
`lut_last_us` and `lut_max_us` measure the conversion interval; checksum calculation
is outside that interval. Timer-reading overhead and interrupt preemption can be
included. `max_tick_us` includes the game, mapping and checksum instrumentation.
Send `i` during interactive play for the latest/max values since reset.
All serial responses are flushed. The standalone C LUT tests still check each
bit and unused cells against the island manifest with sanitizers enabled.

This turn compiled both targets but did not flash a device or measure MCU timing.
Current measured image costs are saved in `mcu-measurement.json`; these include
LUT, mapping, timing reports and checksum validation, not just the table itself.
The reserved stack sizes remain unchanged. Physical LCD driving is still pending.
