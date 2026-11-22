# CH32X035 sleep / wake test

Minimal sketch: blink LED, turn DCDC off, enter STOP, wake on any button,
restore DCDC, reset, blink again. No USB serial, no game code.

## Pins

| Signal | Pin | Notes |
| --- | --- | --- |
| LED | PC3 | Active-high |
| Buttons | PA0–PA3 | To GND, internal pull-up |
| EN_DCDC | PB12 | High while running; low during STOP |

## Expected

1. Power-on / reset: DCDC on, LED on ~50 ms, then off  
2. Buttons released → DCDC EN low → STOP sleep  
3. Press any button: wake, DCDC on, `SystemReset`  
4. LED blinks again  

If wake fails after this change, button levels may depend on the boost rail
(external pull-ups). Internal pull-ups alone should still make a falling edge.

## Build / flash

```sh
python3 4_game_runtime/ch32x035_sleep_test/build.py
```

Compile only. Flash the HEX with the USB bootloader (same as other X035 sketches).
