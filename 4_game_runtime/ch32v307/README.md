# CH32V307 game-core hardware test

Compile-tested with the user's WCH Arduino package 26.1.1 and supplied Arduino
CLI. No board was flashed or tested yet. Default target: **CH32V307VCT6**, normal
256 KiB flash / 64 KiB RAM mapping. Check the marking on your board before flashing.
This is a serial diagnostic sketch, not yet the browser-to-MCU USB bridge.

## Build

From the repository root:

```sh
# 8 MHz external crystal → 144 MHz CPU via PLL, native USB serial
python3 4_game_runtime/ch32v307/build.py
```

The script uses the CLI at the supplied CH32V003-Automatic-Test-Tool path. Override
with `--cli PATH`. It copies the current canonical C core into `moida_test/src`,
generates the desktop reference checksum with ASan/UBSan, and builds the sketch.
Generated sources and build outputs are ignored by Git. Generated table includes
are renamed to `.h` because this Arduino CLI does not copy `.inc` files under src.

The build uses a **local linker-script copy with an 8 KiB stack reservation**.
It does not change the WCH installation or chip option bytes. Use this build script;
a plain Arduino IDE compile would revert to the package's insufficient 2 KiB stack.
8 KiB is a provisional reserve, not a measured stack high-water mark.

Firmware files:

- `build/usb-hse/moida_test.ino.hex` / `.bin`

Use your normal WCH-Link flashing tool with the matching chip/flash configuration.
Nothing in build.py uploads. Do not apply the other controller project's 192 KiB
RAM configuration: that custom configuration is not used here.

## Native USB test

The installed `SimpleUsbSerial` library **requires 144MHz_HSE** on CH32V30x and
selects HSE as the USB PHY PLL reference. Its configuration assumes **8 MHz HSE**.
Use a board with that crystal and the native **USBHS** connector (not USBFS or the
programmer's USB connector). Check the board schematic to identify the connector.
Open the enumerated serial port; 115200 is fine (CDC is not limited to UART baud).

This limitation is in the installed library/configuration: we have not established
that crystal-free native USB is supported reliably on the intended smaller part.
Moving to a CH32V305FBP6 still requires its own pin/clock/linker setup; do not flash
this V307 image on the V305. In particular, the installed V305CCT6 entry has a
custom 192 KiB RAM setting and is not a suitable FBP6 profile.

## Commands

The sketch starts paused, does not wait for a terminal, and accepts single ASCII
characters. Newlines are ignored. Each complete response explicitly calls
`SerialUSB.flush()` so a partial USB packet is sent without waiting for the buffer
to fill. Send `h` if you missed the startup banner.

| Command | Action |
|---|---|
| `t` | Reset seed 1700000000000, run 1,000 deterministic ticks, compare display hash, pause |
| `i` | Print ready state, core clock, host size, generation time, tick count, maximum tick duration, hash |
| `r` | Reset to the same seed and start ticking every 100 ms |
| `p` | Pause/resume |
| `a`, `f`, `w`, `s` | Queue Left, Right, Stairs/Exit, Search for one tick |
| `d` | Dump all 20 display words in hexadecimal |
| `h` | Help |

Send **t** first. Expected result for the current source:

```text
PASS expected=98D3E4E
ready=1 clock_hz=144000000 ... ticks=1000 ... frame_hash=98D3E4E
```

The reference hash is regenerated on every build from the desktop C core using
identical input. It covers all display words in explicit little-endian byte order;
it is a smoke test for cross-target behavior, not exhaustive equivalence or an
audio test. The existing full-session original/C tests remain separate.
`init_us` measures mansion generation/init; `max_tick_us` measures the slowest tick
in this test including the output callback. Neither includes serial reporting.
Compare tick time with the 100,000 us frame budget. USB interrupts can contribute
to elapsed time. Timing depends on the clock being configured correctly.
No physical LCD, LED, or beeper pins are driven by this sketch.

## Compile results (2026-10-21)

| Mode | Flash load image through .data | Static RAM incl. alignment | Stack reserved |
|---|---:|---:|---:|
| External + USB | 69,848 B | 21,644 B | 8,192 B |

The external-clock USB build links successfully for V307. Flash measurements include vectors and the USB
`.highcode` section, which the Arduino summary does not fully count. The actual
USB image plus reserved stack would consume about 29.8 KiB of RAM, suggesting
that 32 KiB V305 remains plausible but needs its own build and runtime validation.
The reserve is not proof of safe stack depth; hardware testing must include
multiple seeds, ending/restart, USB traffic, and eventual stack watermarking.

## Timing correction after first hardware run

The board passed the 1,000-tick checksum (`98D3E4E`), but reported
`max_tick_us=4294967273` (unsigned -23). Installed WCH 26.1.1 `getCurrentMicros()`
subtracts CNT from the period despite the configured upward-counting SysTick.
The sketch now uses a local upward-counter conversion with retry on millisecond
rollover or a pending SysTick interrupt. It requires main-loop context with
interrupts enabled. The installed core is unchanged. Reflash and rerun `t`;
previous `init_us` and `max_tick_us` values must not be used as benchmarks.

## Play in the browser using the current firmware

```sh
python3 4_game_runtime/ch32v307/serial_server.py
```

Open http://127.0.0.1:8768/4_game_runtime/mcu.html and press Start / Reset.
Close other serial monitors first. Override `--device` if the port name changes.
Requires Python `pyserial`. This bridge uses the existing `r/p/a/f/w/s/d/i`
commands, so no additional flashing is needed. It does not run a desktop game:
the MCU keeps its own 100 ms clock, and the browser polls its 20 LCD words.

Current diagnostic-firmware limitations: seed is fixed at 1700000000000, no audio
stream, and fast button commands before the next MCU tick can replace one another.
Use one browser tab. Closing the page stops polling but does not pause the MCU;
press Pause first if desired. After unplug/replug or a board reset, press Start / Reset. It closes the stale
USB handle and opens a fresh connection, starting a new game. The server can also
start with the board unplugged; reconnect it before pressing Start / Reset. This is an initial interactive hardware test, not the final USB protocol.
