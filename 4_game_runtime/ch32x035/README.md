# CH32X035

See [optimized build](#optimized-usb-test-build--2026-10-21) for the current result.
The assessment below is the historical pre-optimization baseline.

## Original compile-time assessment — 2026-10-20

**Conclusion: likely adequate CPU, but the current port does not fit safely in
memory. CH32X035 remains a plausible target after memory optimization.**
No hardware was connected or flashed, and gameplay code was not changed.

WCH specifies a 48 MHz QingKe V4C core, 62 KiB flash, 20 KiB SRAM, hardware
multiply/divide, and USB full-speed device/host hardware:
[official product page](https://www.wch-ic.com/products/CH32X035.html).
The installed Arduino package has matching flash/RAM limits and builds for
`rv32imacxw`, `ilp32`. It does not select a hardware floating-point ISA.

## Actual cross-compiled results

Built with the installed **WCH Arduino 26.1.1**, **RISC-V GCC 12.2.0**,
CH32X035G8U, internal 48 MHz clock, Newlib Nano, section garbage collection.
USB measurement uses the installed **SimpleUsbSerial 1.0.0**. No desktop JSON
serializer, Python, browser, bitmap artwork, or test fixtures are included.

| Configuration | Flash image | Static SRAM including alignment | SRAM left before stack/heap/interrupts |
|---|---:|---:|---:|
| Arduino + game/HAL, `-Os` | 75,692 B | 20,044 B | 436 B |
| Same, `-Os -flto` | 63,168 B | 19,752 B | 728 B |
| Game/HAL + USB RX/TX, `-Os -flto` | 65,828 B | 19,944 B | 536 B |
| Chip capacity | **63,488 B** | **20,480 B** | |

**All three builds fail the real linker constraints.**
The LTO build without USB has just 320 bytes of flash spare but overlaps the
default 2,048-byte stack reservation. The USB build exceeds flash by 2,340 bytes
and overlaps the stack too. Static SRAM alone appearing to fit is insufficient.

Flash is measured through the end of the `.data` load image, including vectors,
code, constant tables, USB `.highcode`, constructor arrays and alignment.
Static SRAM is measured through the end of `.bss`; the table excludes the stack.
The real failed-link maps provide these measurements; no memory limits were
artificially increased to obtain a successful build.

The harness consumes input and all output frame bytes so LTO cannot discard the
game. Its USB loop exercises RX/TX library linkage, not a finished USB protocol.
A real transport still needs framing, buffering, disconnect handling, and
nonblocking output. LCD mapping, LCD driver, and physical beeper driver are also
not included. The no-USB baseline uses the same frame checksum but no transport.

## Where RAM goes

These sizes come from **RISC-V object symbols**, not `sizeof` on the Mac:

| Object | Bytes |
|---|---:|
| `MoidaHost` including game | 19,296 |
| `MoidaGame` | 19,272 |
| `MoidaHouse` within game | 14,896 |
| Twelve decorated rooms within house | 12,672 |
| One `MoidaRoomEntity` | 56 |
| Puzzle including 32 entity slots | 1,800 |
| One `MoidaResult` | 816 |
| Output frame | 104 |
| Logical LCD display buffer | 80 |

Room entities reserve **12 × 16 × 56 = 10,752 bytes**, regardless of actual usage.
This is the clearest optimization opportunity. Possible approaches are a shared
entity pool with per-room indices, and validated smaller integer fields. A shared
pool needs a capacity proof across generation paths, not merely observed maxima.
Do not just reduce array limits: that could silently change generated mansions.

There are also three result/animation objects (2,448 bytes combined). Some
backgrounds coexist with the foreground, so blindly putting these in a union
would be unsafe. Room entity storage is a better first target.

## Stack is a separate problem

GCC `-fstack-usage` for the non-LTO `-Os` build reports these **individual frames**:

| Function | Frame |
|---|---:|
| `moida_puzzle_place` | 2,064 B |
| `dress` | 1,456 B |
| `moida_ending_room` | 1,072 B |
| `moida_house_attempt` | 640 B |
| `random_passage` | 592 B |

The puzzle placer alone exceeds the default 2 KiB stack; callers and callees add
more. Layout traversal also recurses through rooms. These numbers are not a
whole-program high-water bound, and LTO changes frames/inlining. Library calls,
USB interrupt preemption, and runtime startup must also be accounted for.

Reduce generation temporaries (six local zones and an oversized decoration
candidate array), then provision and verify stack headroom. A provisional
**4–6 KiB stack allowance** is a planning budget, not a proven bound. Target
static RAM around **14 KiB or less** before declaring the 20 KiB device viable.
Later validate with a stack watermark on hardware during generation, restart,
ghost effects, and USB traffic.

## Flash opportunities

- Keep LTO: it saved **12,524 bytes** in this assessment, including merging
  duplicate constant tables. Confirm behavior with the existing equivalence tests.
- Three coordinate tables use 32-bit entries for 631 coordinates each.
  Their current values fit 16 bits; changing the generated representation could
  save about **3,786 bytes** before alignment, with identical values. Update the
  generator and validate bounds rather than editing only generated output.
- The map retains Arduino `WString` → `atof`/`strtod` and associated numeric
  conversion code even though the game does not parse strings. Investigate the
  core's whole-archive/link behavior or use a smaller board host. This is a
  potential saving, not a measured replacement build.
- Prefer a compact binary USB protocol; do not import the desktop JSON formatter.

Aim below roughly **56 KiB flash** to leave room for actual drivers and protocol
work. These are proposed optimizations; the measurements above use the current
unchanged C game.

## CPU and USB estimate

Normal gameplay updates at 10 Hz: **48 MHz gives 4.8 million CPU cycles per tick**.
The game manipulates an 80-byte segment bitmap and small room/entity lists; it
does not rasterize a full-resolution screen. This makes 48 MHz **likely sufficient
for ordinary play**, including USB I/O, but this is an engineering estimate,
not a measured execution time or worst-case guarantee.

Potential slow paths are house generation (up to 11 attempts), recursive layout
work, software 64-bit random operations, and full-segment animation scans.
Some double-precision runtime code is linked, but the core's beeper frequencies
are table values; linked float support does not imply heavy float work each tick.
Boot/restart latency deserves separate measurement from normal frame deadlines.

At ten updates per second, an 80-byte display plus sound/control metadata is
roughly **1 KiB/s** before framing—very modest for full-speed USB. CPU scheduling,
USB ISR behavior, and library TX blocking still need hardware verification.
Do not serialize raw C structs as the final protocol; define fields and byte order.

This assessment assumes a separate LCD driver or inexpensive display updates.
It does not establish timing for directly generating multiplexed LCD AC waveforms
in software while servicing USB.

## Reproduce

From the repository root:

```sh
python3 4_game_runtime/ch32x035/assess.py
```

The script stages copies in a temporary directory, runs three compile-only builds,
and emits logs, linker maps, target type sizes, GCC stack frames, and `report.json`.
Expected size/stack linker failures are recorded; unrelated errors stop the script.
It never uploads firmware or edits the Arduino installation.
Use `--output /tmp/some-directory` to choose the output folder, or `--cli PATH`
for another Arduino CLI. The default discovery paths target this Mac installation.

`measurement.json` is the compact captured result with source hashes.
`assessment.ino` is the measurement harness, not hardware-ready firmware.

Before hardware testing: compact RAM and ROM, rerun full original/C equivalence,
obtain a successful target link with explicit stack reserve, and implement the
USB adapter. Hardware tests should then measure generation latency, maximum tick
time, USB stability, and stack high-water usage.

## Optimized USB test build — 2026-10-21

**The complete diagnostic sketch now links within CH32X035 limits. It is a tight,
plausible fit, not yet a hardware-validated fit.** The game core is unchanged from
the lossless optimization validated against 49,699 original-game session ticks.

| Build | Flash | Static RAM | RAM before stack/heap |
|---|---:|---:|---:|
| Optimized assessment, LTO, no USB | 59,392 B | 15,144 B | 5,336 B |
| Optimized assessment, LTO + USB | 62,044 B | 15,336 B | 5,144 B |
| New interactive USB test sketch | **60,780 B** | **15,316 B** | **5,164 B** |
| Hardware capacity | 63,488 B | 20,480 B | |

The interactive sketch reserves **4,096 B of stack**, leaving **1,068 B** outside
static allocations and that reserve. Flash margin is **2,708 B**. Flash includes
USB `.highcode`, vectors, tables and the data load image; Arduino's summary omits
some of these. Captured maps, source hashes and comparison results are recorded
in `measurement-optimized.json`; the older `measurement.json` remains historical.

`moida_test/moida_test.ino` supports the same commands as the V307 test firmware:
`t` runs 1,000 deterministic ticks (expected `98D3E4E`), `r` resets/runs, `p` pauses,
`i` reports statistics, `d` returns display words, and `a/f/w/s` supplies buttons.
Every response flushes USB. Use the existing V307 Python serial server and MCU
webpage with the X035 device path to test once hardware is available. The sketch
uses the **internal 48 MHz oscillator**, matching the installed X035 board package,
and includes no physical LCD driver. A bridged piezo driver was added later; see
[Piezo sound](#piezo-sound--2026-10-22).

Build without uploading:

```sh
python3 4_game_runtime/ch32x035/build.py
```

The script copies the canonical core into ignored sketch `src/`, generates the
checksum with a sanitizer-enabled desktop run, and writes ELF/HEX/BIN/map files
under `build/usb-hsi/`. It uses a local linker script and leaves the installed
Arduino package unchanged. `memory.json` captures actual linked memory usage.

To fit the diagnostic features, this build uses a small integer-only output
formatter and links only referenced Arduino archive members. Whole-archive
linking pulled in unused `WString` number-parsing dependencies; the initial direct
V307 port exceeded flash by 704 bytes. Selective linking also exposed competing
weak SysTick handlers: the sketch supplies a strong timer handler that advances
Arduino's millisecond counter, calls its OS hook and clears the interrupt flag.
Disassembly was checked, and the build verifies strong timer and USB handlers.

**Remaining qualification:** no X035 was flashed. The 4 KiB stack reservation is
not a proven high-water bound. Non-LTO analysis still shows a 2,064-byte puzzle
placer frame, 1,456-byte decoration frame and recursive traversal; these frames
are not all concurrent, but callers, library routines and USB interrupts add
usage. Test stack watermarks across generation/restart seeds and gameplay before
committing to this part. The V307's 8 KiB reservation does not fit here. CPU speed
is likely sufficient for 10 Hz play, but X035 lacks the same floating-point
configuration and needs its own timing test. Flash headroom for real LCD/audio
drivers and further protocol features is limited.

## Constant-table follow-up

Byte-sized text codes (0..51), strand indexes (0..100) and strand counts (0..1)
replace 16-bit entries. Recovery validates integer bounds before generating them.
No runtime decompression or additional RAM is needed.

| Target | Previous flash | New flash | Saved | Static RAM |
|---|---:|---:|---:|---:|
| CH32X035 USB diagnostic | 60,780 B | 59,452 B | 1,328 B | 15,316 B |
| CH32V307 USB diagnostic | 66,016 B | 64,688 B | 1,328 B | 17,036 B |

X035 now has 4,036 bytes of flash headroom. RAM and stack budgets are unchanged.
An experiment sharing identical/contained sprite lists reduced 3,727 entries to
3,436, but needed extra per-icon end indexes. That build used 59,564 bytes on
X035, 112 bytes more than text compaction alone, so list sharing was discarded.
The original sprite-list representation remains.

Final text-only change passed 19,320 native/original output comparisons and
49,699 exact ticks across 17 full sessions with sanitizers. Both target builds
succeeded and retain expected checksum `98D3E4E`; neither was uploaded.

## Piezo sound — 2026-10-22

The diagnostic sketch now plays the game's beeper events on a **passive piezo
driven in bridge mode**: TIM1 channel 1 and its complementary output CH1N drive
opposite ends of the element. The piezo sees +VDD then −VDD, twice the swing of a
single pin, roughly 6 dB louder. Target package: **CH32X035G8R6 (QSOP28)**.

| Signal | Pin | QSOP28 pin |
|---|---|---:|
| TIM1_CH1 | PB9 | 24 |
| TIM1_CH1N | PB6 | 21 |

Wiring: PB9 → series resistor → piezo → PB6. Use about 150–220 Ω at 5 V or about
100 Ω at 3.3 V, keeping pin current within the datasheet's 30 mA source / 40 mA
sink absolute maximum. Use a bare passive piezo only. Do not bridge a magnetic or
self-oscillating "active" buzzer. For volume, prefer a disc resonating near the
game's 131–1568 Hz notes.

Why these pins: only TIM1 and TIM2 have complementary outputs with dead time.
TIM1's default mapping needs no AFIO remap. Channels 2 and 3 would take PB10/PB11,
the Arduino `Serial` USART1 pins. Remap 001 moves CH1N to PA7 (SPI MOSI, likely
needed by an LCD driver). Remap 011 uses PC0–PC5, absent on QSOP28. TIM2's
complementary pins on this package fall on PC3 (reset), bonded pin pairs, or
USB/SWD. Keep TIM1 break disabled: its default BKIN pin PB5 is bonded to PB1.

Driver (`moida_test/piezo.c`, beside the sketch; `src/` remains generated):

- 4 MHz timer clock (`PSC=11`), 50% PWM. Periods span 30,579–2,551 ticks.
- About 5.3 µs dead time (`DTG=0xC0`). Both pins are low between edges, so each
  edge charges the piezo by one VDD step instead of two, halving peak current.
- Silence clears `MOE` with `OSSI=1` and idle levels low. Both pins are actively
  held low, so the element has no DC bias and never floats.
- `present()` follows the HAL beeper rules. A nonzero duration starts a note,
  replacing any current one; zero frequency silences. A zero duration leaves the
  current note playing. The existing SysTick handler counts note length, so notes
  end on time even while house generation blocks the main loop.
- `beeper_hz` is converted to fixed point from its IEEE-754 bits, then divided as
  an integer. Ordinary `double` division linked about 4 KB of soft-float routines
  and overflowed flash by 300 bytes. Worst pitch error across the game's notes is
  0.017%.
- Self-test `t` is silent. `r` and `p` stop sound. New command `b` plays 440 Hz for
  500 ms for bring-up.

| Build | Flash | Static RAM | Flash margin |
|---|---:|---:|---:|
| Before piezo | 59,452 B | 15,316 B | 4,036 B |
| With piezo | **59,876 B** | **15,316 B** | **3,612 B** |

The checksum remains `98D3E4E`, and no Arduino `HardwareTimer`/`tone` code links.
Disassembly confirms SysTick writes TIM1 `BDTR` (`0x40012C44`) to silence. The
Arduino board package only lists G8U. G8R6 is the same die and memory, and PB6/PB9
exist on both packages, so the build keeps `pnum=CH32X035G8U`.

**Not yet hardware-tested.** Bring-up: send `b` and check on a scope that PB9 and
PB6 are inverted 440 Hz square waves with a dead-time gap, both low afterwards.
Then run `r` and play through the serial server:

```sh
python3 4_game_runtime/ch32v307/serial_server.py --device /dev/cu.usbmodemCH32X0351
```

## Narrow-field follow-up — 2026-10-22

Puzzle entity enums, coordinates and four path entries now use `uint8_t`;
optional entity IDs and exits use `int8_t` to preserve -1. The generator has
32 entity slots, 12 room coordinates, kinds/contents 0..5 and gates 0..3.
The 64-bit key mask is unchanged. Each puzzle entity shrinks from 56 to 24 B,
saving 1,024 B across 32 slots.

Room-tree parent, depth and four child coordinates now use `int8_t`: the tree
contains 12 rooms, so values are -1..11. Each node shrinks from 24 to 6 B,
saving 216 B across 12 nodes. No capacities, PRNG operations or game rules change.

| Target | Flash before → after | Static RAM before → after |
|---|---:|---:|
| CH32X035 | 59,452 → 59,612 B (+160) | 15,316 → 14,076 B (-1,240) |
| CH32V307 | 64,688 → 64,424 B (-264) | 17,036 → 15,796 B (-1,240) |

X035 has 3,876 B of flash headroom and 2,308 B RAM beyond static allocations
and the unchanged 4,096 B stack reservation. Narrow loads/stores and compiler
choices explain why flash savings differ between targets.

The non-LTO `-Os` RISC-V compiler reports a 768 B individual frame for
`moida_puzzle_place`, previously 2,064 B: its temporary room trees shrink too.
This is not a whole-program or LTO stack high-water measurement; stack reserves
remain unchanged and hardware watermark testing is still required.

Validation passed: 2,004 layout seeds, 3,004 puzzle attempts, 400 mansion cases,
49,699 exact original/C ticks across 17 full sessions (sanitizers enabled), and
HAL instance/reset/timing checks. Both MCU builds succeeded with expected checksum
`98D3E4E`. No firmware was uploaded.

## Ten-bit sprite IDs — 2026-10-22

All 3,727 sprite IDs (range 0..630) are now packed into 4,659 bytes instead of
7,454 bytes. Four IDs occupy five bytes, least-significant bits first. A lookup
uses two byte loads, a shift and a mask, without allocating a decode buffer.
The generator validates every ID and round-trips every packed entry. Original
list offsets, order and duplicates are preserved.

The renderer and decorator explicitly share one packed pool. The first trial
used two static pools; unlike the previous 16-bit arrays, LTO did not merge these
byte arrays, increasing flash. Explicit sharing resolves that dependency on
compiler constant merging.

| Target | Flash before | Flash after | Saved | Static RAM |
|---|---:|---:|---:|---:|
| CH32X035 | 59,612 B | 56,772 B | 2,840 B | 14,076 B |
| CH32V307 | 64,424 B | 61,600 B | 2,824 B | 15,796 B |

X035 flash headroom is now 6,716 bytes; RAM and stack reservations are unchanged.
The final linked saving includes compiler changes as well as the 2,795-byte data
reduction. Decoding adds work per lookup; hardware timing has not been measured.

Final validation passed 19,320 original/native outputs, 400 house-generation
cases, and 49,699 exact ticks across 17 full sessions with sanitizers enabled.
Both firmware builds retain expected checksum `98D3E4E`; nothing was flashed.

## Compact decoration tables — 2026-10-22

Decoration spot masks now use 16 bits (maximum 8,193). Room-plan kind/name,
floor weights and exits use 8 bits. Box definitions use a 16-bit box icon and
8-bit lock/rustle IDs; monster peep spot/exit fields use 8 bits. The recovery
script validates every narrowed value before writing the tables. Ordering,
weights, masks and icon IDs remain exact, with no runtime decompression.

| Target | Flash before | Flash after | Saved | Static RAM |
|---|---:|---:|---:|---:|
| CH32X035 | 56,772 B | 55,660 B | 1,112 B | 14,076 B |
| CH32V307 | 61,600 B | 60,488 B | 1,112 B | 15,796 B |

X035 now has 7,828 bytes of flash headroom. RAM and stack reservations are
unchanged. Both target builds retain expected checksum `98D3E4E`.
Validation passed 400 mansion-generation cases and 49,699 exact original/C ticks
across 17 full sessions with sanitizers enabled. No firmware was uploaded.
