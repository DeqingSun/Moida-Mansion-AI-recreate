# CH32X035 compile-time assessment — 2026-10-20

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
