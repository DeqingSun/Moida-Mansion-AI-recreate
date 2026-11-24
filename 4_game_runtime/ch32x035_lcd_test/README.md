# CH32X035 LCD drive test

Sibling of `ch32x035`. Standalone sketch that drives an HT16C24A over I2C so you
can check whether the glass lights with serial commands. No game core.

## Pins

| Signal | Pin |
| --- | --- |
| USB D- / D+ | PC16 / PC17 |
| I2C SDA / SCL | PC18 / PC19 (remap 011; SWD off after init) |
| HT16C24A address | `0x3D` |

VLCD is external through a **1K resistor to VDD**. Init sets IVA to
`DE=0, VE=0, DA=0000` so the internal follower stays off (datasheet requirement
when VLCD is tied to VDD).

## Drive defaults

- Duty / bias: **1/16 + 1/5**
- Frame rate: 80 Hz
- Oscillator and display on after `i`
- Blink off

Logical glass electrodes: 16 COM × 48 SEG. In 1/16 mode the Holtek uses
SEG12..SEG71 as segment drivers; this sketch maps SEG0..47 → SEG12..SEG59
(RAM `0x00..0x5F`) and clears the rest of the 120-byte window.

Logical SEG/COM index order versus zebra contact orientation still needs a
visual check on the factory glass.

## Build and flash

```sh
python3 4_game_runtime/ch32x035_lcd_test/build.py
```

Compile only; flash the HEX over USB the same way as the other X035 sketch.
After `i2c_init()`, SWD is off — use USB bootloader for further updates.

## Serial commands

Open the USB serial port (`/dev/cu.usbmodemCH32X0351` or similar), then:

| Command | Action |
| --- | --- |
| `h` | Help |
| `p` | Probe address `0x3D` |
| `i` | Init (mode, IVA, frame, clear RAM, display on) |
| `o` / `z` | Display on / off (oscillator stays on) |
| `a` | All pixels on |
| `c` | All clear |
| `m` | Checkerboard |
| `C n` | Light only common `n` (0..15), all SEGs |
| `D n` | COM `n` with **even** SEGs only (half load, RC check) |
| `S n` | Light only segment `n` (0..47), all COMs |
| `T n` | SEG `n` with **even** COMs only (half load, RC check) |
| `b n` | Bias: `0`=1/3, `1`=1/4, `2`=1/5 (duty stays 1/16) |
| `v n` | IVA control byte 0..63 (DE/VE/DA) |
| `r` | Dump first 8 RAM bytes |

Primary path: `p` → `i` → `a` → `c` → `C 0` / `S 0` walking lines. Compare
`D n` / `T n` against full `C` / `S` if RC ghosting is suspected. Use `b` / `v`
if contrast looks wrong before changing the 1K.
