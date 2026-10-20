# Portable game and platform interface

The same C game runs behind three possible hosts:

| Host | Input and timing | Display and sound |
|---|---|---|
| Computer simulator (implemented) | Browser buttons, HTTP tick requests | Browser segment artwork and beeper |
| MCU with computer I/O (future transport) | USB commands, or MCU clock | Frames sent over USB to a computer |
| Standalone console (future drivers) | GPIO buttons and MCU clock | LCD driver and timer/PWM beeper |

`native/moida_game.c` owns gameplay and deterministic random state.
`native/moida_hal.c` adapts that core to platform callbacks.
`native/house_game.c` is the existing desktop stdin/JSON adapter, now using
the HAL. `serve.py` bridges it to the browser; it does not implement gameplay.

## Interface

Allocate a `MoidaGame` or `MoidaHost` in caller-owned, stable storage. The core
does not allocate heap memory. **Do not copy or relocate an initialized game**:
animation runners contain pointers into its state. Reset it with the init API.
Separate instances can run independently.

`moida_game_init(game, seed)` resets a game.
`moida_game_tick(game, buttons, frame)` advances one 100 ms tick.
The button mask uses 1=Stairs/Exit, 2=Search, 4=Left, 8=Right. Pass the current
held state each tick, including zero for release. The core handles press edges.
The normal API enables all gameplay effects. The diagnostic API exists for
existing fixtures and simulator diagnostic controls.

Each `MoidaFrame` contains:

- `display`: 20 words of logical segment bits. Preserve original segment order;
  only 631 bits correspond to artwork. Reserved bits are retained for comparison.
- `beeper_hz` and `beeper_duration_ms`: a new sound event when duration is nonzero.
  Zero frequency with nonzero duration is a silent note. Zero duration means no
  new event; let the prior note finish.
- `next_tick_ms`: 100 ms, and `cycle`: the automatic restart counter.

The display backend maps logical segments to physical SEG/COM electrodes or
draws the corresponding artwork. Split islands belonging to one logical segment
must follow that segment together. The game does not know electrode addresses.

## Clock-driven hardware example

```c
#include "moida_hal.h"

static MoidaHost host; /* Stable storage, not a small MCU task stack. */

/* Supply these three platform-specific functions. */
uint32_t platform_milliseconds(void *context);
uint8_t platform_buttons(void *context);
void platform_present(void *context, const MoidaFrame *frame);

bool start_game(int64_t seed) {
    MoidaHal hal = {
        .user = NULL,
        .now_ms = platform_milliseconds,
        .read_buttons = platform_buttons,
        .present = platform_present
    };
    return moida_host_init(&host, seed, &hal);
}

int service_game(void) {
    return moida_host_poll(&host);
}
```

Call `service_game` frequently in the main loop. Poll returns 1 for a delivered
tick, 0 when not due, and -1 for an error. The first poll ticks immediately.
The clock uses unsigned millisecond subtraction across rollover. Late polling
advances once and drops the backlog, avoiding bursts of delayed audio; the game
therefore slows when the host cannot keep up.

Callbacks must return promptly. `present` receives a borrowed frame valid only
during the callback; copy it if a DMA or serial transfer will use it later.
Button debouncing and audio scheduling belong to the platform.

## External stepping and future USB

For externally timed operation, only `present` is required in `MoidaHal`.
Call `moida_host_step(&host, buttons)` once per 100 ms of game time. Choose either
polling or external stepping for a run; do not mix their clock ownership.

A future USB adapter can accept a reset seed and numbered step commands,
then return display/audio frames. Sequence numbers and acknowledgements should
prevent retries from advancing twice. Alternatively, let the MCU poll its own
clock and use USB only for button states and output frames. The transport is
not implemented here. It must handle disconnects and release held buttons.
Neither approach requires moving gameplay back to the computer.

## Build and verification

Compile these native sources into a hardware application:
`moida_core.c`, `moida_text.c`, `moida_room.c`, `moida_layout.c`,
`moida_puzzle.c`, `moida_house.c`, `moida_game.c`, and `moida_hal.c`.
Keep their headers and included ROM tables available. Exclude `house_game.c`
and all probe/test entry points; provide your own main and callbacks.

The desktop build reports 19,352 bytes for `MoidaGame`, 19,392 for `MoidaHost`,
and 104 for a frame. These are host ABI sizes, not an MCU RAM budget: measure
stack usage, ROM tables, and target ABI sizes with the actual MCU toolchain.

```sh
node 4_game_runtime/test-hal.cjs
node 4_game_runtime/test-session.cjs
python3 4_game_runtime/test-server.py
python3 4_game_runtime/test-ghost-server.py
```

The HAL test checks instance isolation, reset, direct-core versus callback
output, clock rollover, and delayed polling. The session test compares complete
timed runs against the original JS, including random state and automatic restart.
Both native tests enable AddressSanitizer and UndefinedBehaviorSanitizer.
