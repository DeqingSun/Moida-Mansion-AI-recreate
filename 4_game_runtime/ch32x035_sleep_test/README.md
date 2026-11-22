# CH32X035 sleep / wake test

LED on + USB alive for ~5 s (upload window), then LED off, USB deinit, STOP
(DCDC stays on). Wake on a real button press, reset, window again.

## Pins

| Signal | Pin | Notes |
| --- | --- | --- |
| LED | PC3 | Active-high; on during 5 s window |
| Buttons | PA0–PA3 | To GND, internal pull-up |
| EN_DCDC | PB12 | Stays high during STOP |
| USB | PC16/PC17 | CDC for ~5 s, then shut down before STOP |

## Expected

1. Power-on / reset: LED on, USB enumerates  
2. Serial prints `awake 5s (upload window)` — flash now if needed  
3. After ~5 s: LED off, prints `sleeping`, USB disconnects, STOP  
4. **Release**, then press any button: reset and the 5 s window repeats  

Spurious instant wakes (USB leftovers) are ignored unless a button is still low.

## Build / flash

```sh
python3 4_game_runtime/ch32x035_sleep_test/build.py
```

Compile only. Flash over USB during the 5 s LED-on window after reset.
