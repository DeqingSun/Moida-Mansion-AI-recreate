# Moida Mansion recreation — session handoff

Updated 2026-10-23 (America/New_York). This is the starting point for a new session.
Repository: `/Users/deqinguser/Documents/GitHub/Moida-Mansion-AI-recreate`.
At handoff, the existing work was committed through `1d838a6` (`add hardware test for LUT`).
This document summarizes observed results; older READMEs contain historical numbers.

## Goal and current state

Recreate Moida Mansion as a physical segmented-LCD handheld, using a portable C
port of the original browser game's logic. The original is Nim-generated JS,
retained locally as an oracle. User does not want to contact the original author
at this stage. Preserve game behavior, random sequences, timing and artwork IDs.

The C game, computer simulator, USB MCU simulator, edited display artwork and
logical LCD mapping are implemented. CH32X035 now fits and has passed the user's
1,000-tick hardware test with both game-display and LCD-mapping hashes matching.
Actual LCD driver integration awaits the manufactured LCD and driver details.
Do not mistake a compiled build or desktop checksum for a hardware measurement.

## Repository map

- `1_preliminary_routing/`: original source/assets and preliminary manual routing.
  `source/moida.js` is the original game oracle; `source/panel.svg` original artwork.
- `2_refine_routing/`: current browser routing tool and EasyEDA interchange.
  Supports moved islands, vertex edits, slices, frozen net assignments, contacts,
  trace adjustment, DXF export and manufacturing checks.
- `3_case_design/`: extracted case-design assets/work.
- `4_game_runtime/native/`: canonical portable C core, HAL, desktop probes.
- `4_game_runtime/recover*.cjs`: regenerate constant tables from original JS.
- `4_game_runtime/live.html`, `live.js`, `serve.py`: computer simulator.
- `4_game_runtime/mcu.html`, `mcu.js`, `ch32v307/serial_server.py`: MCU simulator.
- `4_game_runtime/ch32x035/`, `ch32v307/`: Arduino sketches, build scripts and notes.
- `4_game_runtime/lcd/`: generated electrical LUT, JSON/CSV mapping, tests, notes.
- `workingLog/`: historical working material; don't assume it is authoritative.

## C architecture and invariants

`moida_game.c` owns gameplay and PRNG state; `moida_hal.c` adapts it to callbacks.
`house_game.c` is the desktop stdin/JSON adapter. Python only bridges it to HTTP;
the browser displays frames, supplies buttons and plays sounds. No game logic is
implemented in Python or the simulator renderer.

- Allocate `MoidaHost`/`MoidaGame` at a stable address. Do NOT copy or relocate an
  initialized instance: runners contain pointers into its own state.
- Game tick interval is 100 ms (10 Hz).
- Button bits: 1=Stairs/Exit, 2=Search, 4=Left, 8=Right. Core handles press edges.
- `MoidaFrame.display.data`: twenty uint32 words; 631 game bits, 9 unused bits.
- `recovered/segment-ids.json` maps bit indexes to original artwork IDs.
- Sound is frequency + duration; duration zero means no new event, whereas a
  zero-frequency event can be a silent note. Preserve this distinction.
- No heap allocation in the portable game core. Capacity reductions require proof.
- Core includes encounters, search timing/target switching, items, keys, ghost
  progression, friends, Dot, endings, original controls/tutorial exceptions and
  automatic restart. Full-session tests cover interactions, but are not exhaustive
  over every input sequence or seed.

## Last user-reported real CH32X035 measurement

48 MHz internal oscillator, 1,000-tick test:

```text
PASS expected=98D3E4E
ready=1 clock_hz=48000000 host_bytes=13448 init_us=74127 ticks=1000 max_tick_us=6167 lut_last_us=816 lut_max_us=839 lut_hash=3E37DCCC frame_hash=98D3E4E
```

Interpretation:
- Initialization: 74.127 ms for this seed/run.
- Slowest complete tick: 6.167 ms, including mapping and instrumentation.
- Slowest measured LUT conversion: 0.839 ms; last conversion 0.816 ms.
- Frame budget: 100 ms. Observed worst tick used 6.17% of that budget.
- Both checksums matched. Not a whole-program timing/stack proof.
- LCD transfer and physical multiplex driving are not included.
- The X035 self-test currently silences piezo while it runs; it does not qualify
  combined live audio/display/USB operation under every game state.

Earlier V307 hardware test at 144 MHz, before LUT integration, reported 6.932 ms
initialization and 433 us maximum tick, with `frame_hash=98D3E4E`.

## Memory and optimization findings

Last recorded comparison with LUT + benchmark included
(`lcd/mcu-measurement.json`; rebuild if source/flags have changed):

| Target | Flash load image | Static RAM | Reserved stack |
|---|---:|---:|---:|
| CH32X035 | 57,508 B / 63,488 B | 14,188 B / 20,480 B | 4,096 B |
| CH32V307 | 62,376 B | 15,892 B | 8,192 B |

X035: 5,980 B flash headroom and 2,196 B RAM beyond static allocations + reserved
stack. Arduino's displayed sketch size omits some sections: use `.bin` size and
linker maps, including `.highcode` and `.data` load image. ELF/HEX file sizes are
not flash usage. Host size differs between Mac and MCU due to ABI/pointer layout.

Lossless optimizations retained:
1. Sprite coordinates int32 -> int16, exact values with generator range checks.
2. Room entity fields compacted/reordered: 56 -> 32 bytes; 4,608 B static RAM saved.
3. Text codes/strand metadata uint16 -> uint8: 1,328 B flash saved.
4. Puzzle entities 56 -> 24 bytes and tree nodes 24 -> 6 bytes: 1,240 B RAM saved.
   Non-LTO puzzle-placement stack frame fell 2,064 -> 768 B. This is an individual
   frame measurement, NOT whole-program stack high-water.
5. 3,727 sprite IDs packed into 4,659 bytes at 10 bits each; explicit shared pool
   for rendering and decoration. About 2.8 KB final flash saved, no decode buffer.
6. Decoration masks/plan/box/peep fields narrowed: 1,112 B flash saved.
7. X035 build links referenced Arduino archive members rather than whole-archive,
   excluding unused dependencies. Small integer-only diagnostic formatting.

Rejected experiment: sharing repeated/contained sprite lists required extra
indexes and made the image 112 B larger than text compaction alone; reverted.

Floating-point review before piezo changes found 624 B of note constants and a
108 B comparison helper, not a large math library. Most core work copies exact
precomputed frequencies. Rounding frequencies or converting doubles to floats is
not strictly lossless. Current piezo code may change linked numeric helpers;
inspect current ELF before reusing old dependency claims. Note IDs internally
could be evaluated later, but preserving exact output remains the requirement.

## Building and running

From repository root:

```sh
python3 4_game_runtime/ch32x035/build.py
python3 4_game_runtime/ch32v307/build.py
python3 4_game_runtime/serve.py --port 8767
```

Computer page: http://127.0.0.1:8767/4_game_runtime/live.html

```sh
python3 4_game_runtime/ch32v307/serial_server.py --device /dev/cu.YOUR_DEVICE
```

MCU page: http://127.0.0.1:8768/4_game_runtime/mcu.html
Default device is `/dev/cu.usbmodemCH32V30x1`; enumerate actual device after replug.
Close other serial monitors. Start/Reset reconnects a stale USB handle. Do not
assume servers or browser sessions from prior work are still running.

Build scripts copy canonical core into ignored `moida_test/src/`, regenerate
expected hashes with sanitizer-enabled desktop C, and compile only (no upload).
Artifacts: `TARGET/build/usb-hsi/` for X035, `usb-hse/` for V307.
Do not hand-edit generated src copies. A normal Arduino IDE build does NOT apply
our linker overrides and can overflow flash; use build.py for measured results.

Installed CLI default:
`~/Documents/GitHub/CH32V003-Automatic-Test-Tool/controllerCode/ch32v305_controller/build/arduino_cli/bin/arduino-cli`
Installed package: `~/Library/Arduino15/packages/WCH/hardware/ch32v/26.1.1`.
WCH toolchain under `packages/WCH/tools/riscv-none-embed-gcc/`.

- X035 target CH32X035G8U, internal 48 MHz, `-Os -flto`.
- V307 target CH32V307VCT6, external **8 MHz crystal**, 144 MHz system clock.
- Local linker copies reserve stacks; installed Arduino package is not modified.
- Strong X035 SysTick handler is essential: selective archive linking otherwise
  chose startup's weak infinite-loop handler instead of Arduino's weak handler.
- Local `measurementMicros()` accounts for upward-counting SysTick. Installed
  WCH `micros()` previously produced wrapped timing values. Preserve the fix.
- USB responses MUST call flush(), otherwise partial packets can remain buffered.

USB commands: `t` checksum/timing test, `r` reset/run, `p` pause/resume, `i` status,
`d` twenty display words, `a/f/w/s` left/right/stairs/search, `h` help.
X035 also has `b` piezo test tone. Fixed seed 1700000000000; one pending button slot
can overwrite very fast inputs. This is diagnostic transport, not final protocol.
Current X035 piezo uses TIM1 complementary PB9/PB6, stops both pins low and services
note duration from SysTick. Read `piezo.h/.c` before changing timer/pin allocation.

## Routed artwork and electrical LUT

Simulator snapshot came from:
`/Users/deqinguser/Downloads/Moida-routing.moida-routing (1).json`
SHA256: `39174c89bc7e2efb770bcfbdadfa52e0afc20ca8c01268ce0d246006a8a0175f`.
This external file might later disappear; generated SVG and mapping are in Git.
Do not substitute the older finished preliminary-routing JSON silently.

Snapshot: 12 cuts, 148 geometry overrides, 780 routed islands for 631 game bits.
`build-routed-panel.cjs` reuses the editor's `layoutData` pipeline for slices,
moves, vertices and holes. Both live and MCU pages load `recovered/routed-panel.svg`.
All sub-islands of an original segment switch with that original game bit.
EDA geometry is ignored, matching the editor's traces-only EDA import policy.
The preview is segment artwork, not a simulation of unintended trace overlaps.

`build-lcd-lut.cjs` reads exactly the same snapshot (hash checked) and uses saved
net assignments, never inferred trace contacts. Outputs under `lcd/`:
- `mapping.csv`/`mapping.json`: bit, original segment, island, word/mask,
  SEG/COM index, contact ID, zebra slot; JSON includes contact coordinates.
- `moida_lcd_lut.h`: 768 uint16 cell-to-game-bit entries, 1,536 B of flash.
- `test-lut.py`: sanitizer test for each game bit, padding bits, all-on/all-off.

664/768 electrode pairs used, 104 unused; no conflicting original bits on a pair.
Several islands of one original segment may share a pair or occupy distinct pairs.
The C map scans 768 cells directly, not island names. Caller provides 96 bytes:
`uint8_t cells[16][6]`, COM-major, SEG bit order least-significant first.
SEG0=T-N001, COM0=B-W001. In the saved front-view zebra layout, one-based slots
1..16 are COM, 17..18 empty, 19..66 SEG. Confirm supplier orientation/numbering;
these are logical electrode labels, NOT MCU pins or LCD-driver register addresses.

Both MCU present callbacks map every frame, hash the result and time conversion.
Expected hashes: game `98D3E4E`, mapped LCD `3E37DCCC`. Checksums consume all mapped
bytes to prevent LTO eliminating conversion; hashing is outside the LUT timer.
Mapping benchmark + LUT costs ~1.85–1.89 KB flash and 96–112 B static RAM.
The lookup generator verifies assignment consistency, not physical continuity.

## Verification commands

```sh
node 4_game_runtime/test-native.cjs
node 4_game_runtime/test-layout.cjs
node 4_game_runtime/test-puzzle.cjs
node 4_game_runtime/test-house.cjs
node 4_game_runtime/test-session.cjs
node 4_game_runtime/test-hal.cjs
python3 4_game_runtime/lcd/test-lut.py
```

Latest relevant recorded passes: 19,320 native outputs; 2,004 layout seeds;
3,004 puzzle attempts; 400 mansion cases; 49,699 exact ticks across 17 timed
sessions, with sanitizers. Run targeted suites for new changes; the full-session
suite compares display/audio and other state to the original JS. MCU self-test
hashes display and mapped cells, not audio or every possible gameplay state.

## Remaining work / next decisions

1. **Measure real stack high-water** across seeds, generation retries, endings,
   restart, live audio and USB. 4 KiB is a reserved budget, not enforced protection.
   Never shrink it just to claim RAM savings. Stack overflow can corrupt globals.
2. **Actual LCD HAL:** confirm glass contact orientation and driver specifications;
   map logical SEG/COM to driver RAM, implement transfers and initialization.
   LUT emits ON/OFF states, not multiplexed AC waveforms. Determine driver bias,
   multiplex duty, voltage and timing from actual hardware specifications.
3. **Hardware gameplay validation:** longer sessions/multiple seeds, supply and
   oscillator conditions, buttons/debounce, audio, disconnect/reconnect and sleep.
4. **Final host controls/protocol:** configurable seeds, robust input buffering,
   physical buttons, production USB behavior. Current bridge is sufficient for
   interactive testing but has fixed seed and last-button-wins limitations.
5. **Manufacturing check:** reconcile generated artwork/LUT with final factory
   geometry/netlist and confirm contact numbering. Regenerate both from one source
   if routing changes; review physical continuity separately from logical LUT.
6. **Optional optimization:** shared room entity pool (prove capacity first),
   other temporary arrays, note-ID representation, production diagnostics option.
   Current X035 performance fits; avoid risky changes without a measured benefit.
7. **Docs cleanup:** historical READMEs/HAL notes may call implemented USB features
   future work. This handoff and current source supersede such historical prose.

## Collaboration preferences

User prefers action, substantial tested progress and concise measured comparisons.
Don't repeatedly ask permission for ordinary reversible edits. Don't silently
replace routed geometry, freeze/reassign nets, or discard slices/vertex changes.
Keep original JS as oracle. Show before/after exact flash/static RAM, separate
stack from globals, state whether results were compiled, simulated or measured on
hardware. Build/upload are separate: do not claim flashing unless performed.

## Routing-tool history

See [ROUTING_HANDOFF.md](ROUTING_HANDOFF.md) for both routing-tool versions,
interaction history, frozen-net/geometry rules, EDA exchange, manufacturing
constraints, zebra contacts, DXF lessons and saved-state caveats.
