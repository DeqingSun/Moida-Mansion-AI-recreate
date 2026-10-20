## Diagnostic walking preview

The live preview now continues past the entrance reveal. Use **West**, **East**, **Upstairs**, and **Downstairs** under “Explore rooms (diagnostic)”. C evaluates the current room’s exits, blocks locked and hidden passages, and renders the destination room and map position. This is a temporary exploration interface, not the original four-button gameplay: movement animation, searching, collecting/using keys, room animation, and encounters remain pending. Inventory stays empty; some rooms are intentionally inaccessible.

Validation: `node 4_game_runtime/test-walk.cjs` checks 10,000 walking attempts across 40 seeds against the original JavaScript’s passage checks and static room rendering, under AddressSanitizer and UndefinedBehaviorSanitizer. It covers missing, open, locked, and hidden passages. The 40 full intro/reveal comparisons still pass. The HTTP regression also checks movement and return to the previous room.

# Original game logic: desktop reference and MCU path

The downloaded `../1_preliminary_routing/source/moida.js` is Nim-generated JavaScript, not a CPU ROM or WebAssembly module. Evidence includes Nim runtime functions (`nimCopy`, `makeNimstrLit`), type descriptors, and surviving module/function names. No original `.nim` files or source maps were found in this repository. The compiler version is not established.

## Structure found in the original code

- `house`, `houseZpuzzle`, `houseZroom`, and related modules build the randomized mansion and manage rooms, keys, puzzles, friends, and locations.
- `game` holds player/monster state and runs three routine runners. Named routines cover intro, movement, searching, room events, and other sequences. This is a state/routine-driven game, not a framebuffer renderer.
- `gameio` handles current and previous button sets (press edges).
- `spritestate` represents the display in 20 32-bit words. Only 631 bits correspond to physical segments: 80 bytes allocated, not the total game RAM.
- `melody` emits beep frequency and duration.
- `device95html` implements browser input, SVG display, timing, and Howler audio.
- `tick__main_u41(input)` calls `step__game_u4201(...)` and returns the hardware-facing output. The observed normal wake delay is 100 ms. The browser can also tick immediately on button presses, so a port must preserve both timer and input wake-ups.

Input buttons: 0 = mode/up, 1 = view/Enter, 2 = left, 3 = right. Exact behavior depends on game state.

Output: segment bitset, beep Hz/duration, button wake mask, timer delay, progress marker.

For the physical display, expand each original segment bit into all of that segment's routed islands and their frozen COM/SEG pairs. Splitting electrodes need not change the game's logic. Electrical LCD multiplexing/bias timing is a separate driver responsibility, not the game's 100 ms update loop.

## Working desktop proof

Run from the repository root:

```sh
node 4_game_runtime/test.cjs
```

`runtime.cjs` reads the original file unchanged. In memory it disables exactly the final browser startup call, supplies inert audio constructors and a null debug-console lookup, and runs the original startup and tick functions in Node's VM. A controlled clock supplies the original random seed. This is a headless reference adapter, not an interactive player or an MCU port.

Verification: two identical 3,000-tick replays, including presses/releases of all four buttons, produced identical output, 53 distinct display states, and 747 beep frames. Output SHA256: `fdc843506266b303e1706f2ea1a964143b4f37491e252fbded2d3bfba54d385e`.

This proves that these exercised game paths can run without a browser. It does not prove all endings, full game coverage, memory limits, or MCU timing. Runtime measurements in Node would not establish embedded RAM needs.

## Fully native decorated-house generation (latest)

The **live preview no longer uses `entrance.room` or original JavaScript**. `native/moida_house.c` generates room kinds, decoration, neighbors' decoration exclusions, door styles, containers, fairy/ghost graphics, friend appearances and room effects after the native puzzle stage. Failed house attempts retry up to 11 times, as in the original startup. `native/house_game.c` runs the generated entrance through the verified intro and reveal.

Start with `python3 4_game_runtime/serve.py`, then open http://127.0.0.1:8767/4_game_runtime/live.html. **New mansion** chooses a new signed 64-bit seed; **Start / Reset** replays the current seed. Press any game button to reveal the entrance. The displayed entrance coordinates and attempt count come from the C process. Random seeds may occasionally exhaust the retry limit; such failures are reported instead of substituted with a fixture.

Validation:

```sh
node 4_game_runtime/recover-decor.cjs  # regenerate static decoration ROM tables if needed
node 4_game_runtime/test-house.cjs
node 4_game_runtime/test-house-game.cjs
```

- 400 house cases, mixing one-attempt builds and 11-attempt retry runs: matching success/failure, attempts, entrance, friend assets/IDs, all room types/names/effects/exits, ordered decorations, entity icon assignments and final PRNG state (349 successful cases).
- 40 independently seeded end-to-end sessions: original startup/welcome choice and every intro/entrance-reveal segment bit and beep match.
- AddressSanitizer/UndefinedBehaviorSanitizer enabled; the previous native core, layout and room-renderer suites still pass.

A subtle original behavior is preserved: the weighted room-kind fallback indexes the last slot of a fixed 12-element temporary array. Unused slots contain zero, which selects the empty-room plan. It is not equivalent to choosing the last eligible candidate.

**Still pending:** movement, searching, inventory interactions, monster/friend gameplay, and the remaining script bodies. The live preview intentionally stops after the generated entrance reveal. The C house keeps per-room entities and full puzzle definitions; the original global flattened entity-list quirks still need consideration when implementing gameplay consumers. This generation milestone is not full-game equivalence or an MCU resource measurement.

Older milestones below are retained as implementation history; their fixture-only limitations have now been superseded for live startup and generation.

## Native puzzle placement (latest)

`native/moida_puzzle.c` continues from the native layout generator's exact PRNG state. It now places the three friends, door-lock keys, tunnel controls, combination locks, fairy groups, gifts, ghosts and their four-room paths, plus four crown buttons. Entity order/IDs, gate kinds and dependencies, optional hints and ghost-reveal references follow the original implementation.

```sh
node 4_game_runtime/test-puzzle.cjs
```

**3,004 attempts** matched the original `build__houseZpuzzle_u3758` exactly, including every entity field, success/failure, partial output on failure, and final random state. 2,749 succeeded; all six entity kinds were exercised. Both AddressSanitizer and UndefinedBehaviorSanitizer were enabled. Tests include signed seed limits and the same weighted-selection quirks as the original.

The seed explorer at http://127.0.0.1:8767/4_game_runtime/layout.html now shows entity markers per room and a table of gate requirements, hints and ghost paths. It displays **one generation attempt**, including failed candidates. Successful puzzle placement is not a claim that room decoration has succeeded: the original house builder performs additional steps and retries.

**Next:** native room-kind selection, decoration and assignment of entity graphics, followed by house-level retries. The decorated entrance preview still uses its fixture until these stages are ported. The full generated puzzle can now be inspected without executing any original JavaScript on the preview server.

## Seeded native layout generation (latest)

The first mansion-generation stage now runs in C (`native/moida_layout.c`). It implements the original weighted entrance selection, horizontal corridor initialization, vertical stair selection, optional extra stair and connectivity-preserving corridor removals, depth-first traversal zones, layout-spec choice and locked-passage candidate selection. It does not choose a pre-recorded layout.

```sh
node 4_game_runtime/test-layout.cjs
python3 4_game_runtime/serve.py
```

Open http://127.0.0.1:8767/4_game_runtime/layout.html to enter a signed 64-bit seed or press **New seed**. The browser draws the native generator's actual graph. Seed values are sent as decimal strings so JavaScript cannot round large 64-bit values.

Verification: **2,004 seeds** (including zero, negative and signed-limit values) matched the original entrance, all 12 exit masks, DFS parent/child/depth data, layout spec, candidate locks, and final 128-bit PRNG state. These produced 92 distinct exit maps and 1,922 successful lock candidates. The remaining candidates failed exactly where the original did; the explorer deliberately shows one attempt rather than implying the full retry pipeline is ported. Sanitizer checks passed.

**Still pending:** room-kind selection, decoration/entity graphics assignment and the house-level retry loop. Puzzle placement was completed in the milestone above. The existing entrance-room game preview still uses its structural fixture. The native map explorer is a separate generation-stage diagnostic, not yet a playable generated mansion. No original JavaScript runs in the layout API.

Original reference stages: `rand__house_u222`, `make__houseZpuzzle_u3762`, `make__houseZpuzzle_u2174`, `make__houseZpuzzle_u4138`. Exact random consumption is preserved so later generation stages can continue from the tested PRNG state.

## Native room rendering and entrance reveal (latest)

The live preview now transitions into an entrance room when any game button is pressed. Room drawing, gate-dependent entity graphics, collected-fairy suppression, child-icon clearing, room-name rendering, exit/lock checks, map/arrows, and the four-stage reveal animation run in C (`native/moida_room.c`).

**Generation is still a fixture:** `recovered/entrance.room` is a structural room description from original-game seed time `1700000000000`, not a stored rendered bitmap. It contains icon lists, entity/gate definitions and exits. C constructs the segment state from those definitions. No original JavaScript runs in the live host. The initial UI renderer assumes empty inventory and no monster/friend overlays, which matches the entrance state. Full inventory/monster/friend UI remains unported.

Validation:

```sh
node 4_game_runtime/test-room.cjs
node 4_game_runtime/test-reveal.cjs
```

- 1,536 room cases across 16 original-generated mansions, including varied held/used key sets and reveal masking.
- 6,144 directional exit/lock comparisons.
- 128 full intro-to-entrance sequences across eight seeds, four buttons and four press timings, compared against original full-game ticks, including sound.
- AddressSanitizer and UndefinedBehaviorSanitizer enabled.

Regenerate the default structural fixture with `node 4_game_runtime/room-fixture.cjs`. Start the preview with `python3 4_game_runtime/serve.py` and open http://127.0.0.1:8767/4_game_runtime/live.html. Press **Start / Reset**, then any game button. It stops after revealing the entrance, before the main gameplay routine. Movement/search and native mansion generation remain pending.

`native/game_demo.c` is the current live host executable. The earlier intro-only executable and its boundary tests are retained as component tests. The sections below record earlier milestones; their former stopping points have now been extended.

## Live C intro milestone

The native port now runs the opening **and the full scrolling-speech/idle loop**, including the concurrent loop runner, speech beeps, monster animation and input indicator. It preserves the original main-runner wait/input interaction. Two 5,000-frame comparisons (both welcome variants) match the original full game tick exactly: all 20 display words plus beep frequency and duration. The native tests use memory and undefined-behavior sanitizers.

```sh
node 4_game_runtime/test-intro.cjs
python3 4_game_runtime/serve.py
```

Open http://127.0.0.1:8767/4_game_runtime/live.html and press **Start / Reset**. Unlike the earlier recording preview, this sends ticks to a persistent compiled C process. Python only hosts files and relays JSON; it does not simulate game logic. The browser displays segment bits and synthesizes beeps. No Node or original JS is needed to run this live preview, only Python and a C compiler. The original SVG is used for visualization.

The server builds into a temporary directory, binds only to localhost, and cleans up native processes on shutdown. Separate tabs get separate native states; inactive states expire after ten minutes. Use Ctrl-C to stop it. It does not replace the routing server on port 8765.

**Boundary:** any newly pressed game button causes the original to enter routine 3, which needs the generated mansion. The C port reports `MOIDA_INTRO_NEED_HOUSE` there and stops without fabricating a room. All four buttons were checked at six different intro times (24 cases) against that original transition. This is still an intro implementation, not playable mansion exploration. The elapsed display is tick-based simulation time.

Next substantial subsystem is mansion generation and room rendering, followed by movement/search. Remaining routine bodies are not yet ported.

## Opening-animation milestone

`native/moida_text.c` now implements strand lookup/append, whitespace stripping and centering, 13-position LCD text rendering, and the first nine steps of the original intro routine. Font masks, text strings, and theme notes are extracted from the original ROM data.

The opening runs for **161 ticks (16.1 seconds at 100 ms/tick)** and stops before the interactive speech step. Both welcome variants (strand 91 and 92) match the original **full game tick** at every frame: all 20 display words and beep frequency/duration. This is native C execution, not stored original-game frames. The preview JSON is recorded from that native execution after validation.

```sh
node 4_game_runtime/test-opening.cjs --write-preview
```

With a static server running at the repository root, open:

http://127.0.0.1:8765/4_game_runtime/index.html

The preview offers play/pause, restart, frame scrubbing, and optional synthesized sound. The browser plays C-generated recordings; it does not execute the C core live. Its square-wave audio is an approximation of the physical beeper, not the original sampled browser audio. Gameplay buttons are intentionally absent until interactive behavior is ported.

The native comparison suite also checks text append, center, and rendering for all 101 strand IDs with five offsets, including empty/truncated strings. Its total is now 19,320 matching outputs.

## Native C port (current direction)

We are reverse engineering the downloaded JavaScript directly, without contacting the developer or requiring the original Nim source. The target is portable C11, with the original JavaScript retained only as a desktop test oracle.

Implemented in `native/moida_core.c` and `native/moida_core.h`:

- Exact 64-bit random generator, seed initialization, jump, inclusive bounded sampling and probability checks.
- 20-word LCD bitset, set/clear/fill, and all 352 original icon-to-segment mappings.
- 128-note melody queue and all 78 original frequency entries.
- Four-button press-edge detection.
- Routine scheduler: 20-entry stack, nested routines, restart of an already stacked routine, queued transitions, delays, and input waits. Script bodies are supplied through callbacks.

These components have no JavaScript, browser, heap allocation, or OS dependency. The desktop probe and test runner are separate. Frequency lookup currently uses `double`; the final hardware adapter can convert Hz into timer settings. No MCU memory/timing claim is made yet.

### Run the C comparison test

Requires Node and a C compiler (`cc`, or set `CC`). From the repository root:

```sh
node 4_game_runtime/recover.cjs
node 4_game_runtime/test-native.cjs
node 4_game_runtime/test.cjs
```

The first command regenerates recovered scripts and C ROM tables. The second compiles C with AddressSanitizer and UndefinedBehaviorSanitizer into a temporary directory, then compares 19,320 outputs across 27,306 operations against the actual original functions. It covers signed seed boundaries, random bounds/rejection paths, every allocated display bit, every icon, melody truncation/exhaustion, all four-button current/previous combinations, and scheduler transitions/stack limits. Scheduler callbacks in this test are synthetic; the scheduler itself is compared to the original implementation. The third command checks that the existing full-JS replay remains unchanged.

The original has some unusual semantics deliberately preserved in C: `prob(0)` can succeed, a random bound of zero consumes no random value, and display flood sets all 640 storage bits even though only 631 are visible. These matter for faithful replay.

To compile the standalone portable component without the test harness:

```sh
cc -std=c11 -Wall -Wextra -Werror -c 4_game_runtime/native/moida_core.c -o /tmp/moida_core.o
```

### Recovered scripts and remaining work

`recovered/routines.md` and `recovered/routines.json` contain the 94 routine names and 642 original step descriptions embedded in the compiled file. These are verbatim metadata, not reconstructed complete Nim source. They make the high-level sequences readable, but their helper functions contain substantial additional logic.

**This is a partial native port, not a playable C game.** The native scheduler is implemented, with the opening and intro-idle routines translated so far; the house transition is still pending. Missing subsystems include mansion/puzzle construction, room rendering, additional text operations (numeric/right-aligned text), inventory/friends/monster behavior, complete game-level state and the final tick function. ROM tables now include icon mappings, note frequencies, font masks, strands and theme notes.

Next steps:

1. Port room/display helpers and the intro-to-house transition; the speech/idle portion is now verified.
2. Port house construction and puzzle placement using the verified PRNG; compare generated room graphs for many seeds.
3. Port movement, search, inventory, monster and friend rules and remaining scripts; compare full-game traces against the reference.
4. Add a desktop player using the C core, then the MCU button/timer/LCD/audio adapters. Keep the hardware mapping for sliced electrodes separate from game logic.

The long-term acceptance test is identical original segment bits and audio events for identical seeds and timed inputs, followed by measurements on the selected MCU. Unit comparisons alone do not prove full-game equivalence.

## References

- Original game: https://dukope.itch.io/moida-mansion
- Nim backends: https://nim-lang.org/2.0.8/backends.html
- Nim compiler: https://nim-lang.org/docs/nimc.html
- QuickJS runtime: https://www.bellard.org/quickjs/quickjs.html

### Preview-server freeze regression

The host now handles connections concurrently so an idle browser preconnect cannot block page loads or game ticks. Successful per-tick access logging is suppressed to avoid filling captured process-output pipes. Browser API requests time out after five seconds; native replies have a two-second timeout. Session operations are serialized to keep native stdin/stdout requests paired.

Run `python3 4_game_runtime/test-server.py` to exercise an idle connection plus 1,500 ticks with undrained server logs, button handling, and reset. This test binds an ephemeral localhost port.
