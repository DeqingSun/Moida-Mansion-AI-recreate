# CH32X035 sleep / wake test

Minimal sketch: blink LED, enter STOP, wake on any button, reset, blink again.
No USB serial, no game code.

## Pins

| Signal | Pin | Notes |
| --- | --- | --- |
| LED | PC3 | Active-high |
| Buttons | PA0–PA3 | To GND, internal pull-up |
| EN_DCDC | PB12 | Held high |

## Expected

1. Power-on / reset: LED on ~50 ms, then off  
2. MCU in STOP sleep  
3. Press any button: `SystemReset`  
4. LED blinks again  

## Build / flash

```sh
python3 4_game_runtime/ch32x035_sleep_test/build.py
```

Compile only. Flash the HEX with the USB bootloader (same as other X035 sketches).
