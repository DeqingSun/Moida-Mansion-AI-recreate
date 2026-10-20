## Full-session comparison and automatic restart

The live C game now restarts after the original ending/retry dialogue is acknowledged. It generates a **new mansion using the continuing PRNG state**, clears inventory, friends, monsters, search state and statistics, and returns to the intro. Start / Reset still explicitly starts a new session from the seed field. The browser keeps ticking through automatic restarts and displays the mansion number.

Run the uninterrupted comparison:

```sh
node 4_game_runtime/test-session.cjs
```

The test calls the original `tick__main_u41` without replacing any game routines, outcomes, random calls, or restart behavior. An oracle-side player chooses legal button presses; that exact timed button stream is replayed into the compiled C executable with all effects enabled. Every tick compares all 20 display words, beep frequency/duration, room coordinate, inventory, used keys, move/search/attack statistics, and both 64-bit PRNG words. C runs with AddressSanitizer and UndefinedBehaviorSanitizer.

Current result: **49,699 matching ticks across 17 sessions**, with sanitizers enabled.

Coverage includes complete escape and restart, Dot collection and escape, the ghost-dependent fairy/latch/final-friend route, tutorials and spider collection, death/restart/further play, and 12 seeded runs of varied timing with held and simultaneous buttons. Successful runs also wait at the entrance for the escape prompt and continue through the next intro/room reveal. Individual scenarios can be run by name: `escape`, `dot-escape`, `ghost-escape`, `tutorial-spider-escape`, `death-restart`, or `timed-inputs`.

This comparison fixed handoff delays, early random consumption, lost melody tails, interrupted warning loops, search-target memory when revisiting a room, idle muting, ambient redraws, queued death timing, and the ending slideshow's starting room. Debug random/stat fields are emitted only when `MOIDA_SESSION_TRACE` is set; normal HTTP responses include a `cycle` counter for restarts.

These are exact matches for the tested sessions, not a proof over every possible seed and input stream. MCU integration remains separate work. Earlier sections below record historical milestones and their limitations.

## Original controls and tutorial/safety behavior

The live player now uses the original four actions: **Left**, **Right**, **Search**, and **Stairs/Exit**. Keyboard: ← / →, Enter, and ↑ or Space. Stairs chooses upstairs before downstairs; at an eligible entrance it exits. The old directional controls remain under Diagnostic controls.

The C host detects newly pressed buttons: holding a button does not repeat or queue movement across an animation. Simultaneous presses follow original left/right/stairs/search priority. Search can be interrupted by movement or another search; dialogue acknowledgements do not also move the player. Browser clicks insert a release between repeated presses.

Before the first friend is rescued, every second empty search plays the original two-part search tutorial (routine 43). Leaving that friend's room plays the two-note rustling reminder (routine 13) before the movement wipe. The original does not provide blanket invulnerability before the first rescue: monster safety checks exempt void rooms and apply only to open passages. Attempting a blocked/locked passage cannot trigger a guarded-exit attack. A second guarded attempt during the quick warning proceeds to death without counting another attack. Search statistics now increment when the actual normal search begins, rather than during target preparation.

Validation: `test-results.cjs` compares **3,101 display/audio frames** with the original, now including tutorial and rustling routines. `test-server.py` checks raw button holds, stairs, search cancellation, first-friend departure, alternating tutorial triggers, dialogue acknowledgement, and the existing full rescue/escape/monster regressions. `test-search-animation.cjs` and `test-search-interrupt.cjs` cover normal search and interrupted target switching.

The full-session comparison above now covers integrated scheduler/random-state behavior. MCU-facing API and hardware adaptation remain. The component tests described here still use substituted restoration boundaries; the new session tests do not.

## Ghost encounters and revealed-item progression

Ghosts are now enabled in the live preview. The first eligible ghost uses the original prerequisite and collected-item checks, four-room path, directional animation selection, and wrong-turn reset. Checks run after movement and after the post-search monster appearance, preserving monster-before-ghost ordering. Completing the trail flashes the reward's container, with the original randomized ghost-erasure effect. The ghost does not grant the item or invent an extra gate: the player searches that container, and collecting the reward suppresses further ghost appearances.

Native routines 65–85 cover the initial appearance, left/right/stair transitions, reveal, and wild loop. Routine 85 consumes the original random rectangle coordinates and erases only matching ghost-mask sprites. The live page sends `ghosts: true`; diagnostic API callers opt in independently of monster/spider settings.

Validation:
- `test-ghost.cjs`: 14,400 original/native activation, path-step, wrong-room reset, and collected-reward decisions across 60 houses, including all-friends prerequisite combinations.
- `test-results.cjs`: 3,016 frames total, including all finite ghost routines and the nested random wild loop, against original display/audio/wait scheduling. The usual room-redraw/post-result boundaries are fixture substitutions.
- `test-ghost-server.py`: seed **1700001234567**, natural navigation and searches only. Rescue the first friend, collect three fairy code fragments, rescue the second friend, test a wrong turn, follow rooms **11 → 10 → 9 → 8**, search the indicated object (icon 1), collect the latch, descend through the revealed tunnel, and rescue the final friend (icon 260). Also verifies the monster-peep animation precedes the ghost when both are triggered and that collecting the reward stops the ghost. Monster encounters are toggled for that ordering check; no inventory or position injection is used.
- Existing full HTTP regression continues to cover rescue/crown/escape, monster attack/escape/death, and spider persistence.

See the current status above for remaining work.

## Spider behavior now playable

The live page now enables the original spider behavior independently of the monster diagnostic toggle. After each successful move, an unsearched spider has a 10% chance to appear in a non-void room. The probability function is not called after the spider has been searched or when entering a void room, preserving the original PRNG consumption rules. The spider is drawn during normal room rendering and appended after the room's ordinary search targets; selecting past it wraps back to the first target.

Completing its search plays routine 49, marks the spider searched, removes its room artwork, and prevents future appearances for the session. The escaped-spider icon is then included in routine 90. Reset starts fresh. Diagnostic API callers opt in with `spiders: true` per tick; the live page always sends it.

Verification: `test-spider.cjs` compares 23,904 spawn decisions, PRNG states, and search-order outputs against the original across 12 houses, including cycling after the spider target. The full HTTP regression checks natural appearance, target selection, result 49, and persistence across 30 subsequent moves. The 2,420-frame result suite now includes spider artwork in the escape fixture. Existing encounter/crown/rescue/endgame checks pass.

Current major gaps: ghost encounters and their revealed-item progression; complete original input mapping; tutorial and first-friend safety exceptions; remaining full-session animation/random-state parity. MCU integration still needs a public game-state API independent of the diagnostic stdin/stdout executable and a hardware input/display/sound adapter.

## Spider-found result (small incremental port)

Routine 49 now displays the original spider-ran text (strand 100), plays notes 19/40/61, and waits 30 ticks before the post-result boundary. `test-results.cjs` verifies its 32 frames against the original, bringing the suite to 2,420 matching frames. Spider appearance/search selection and persistent spider state are still pending, so this routine is not yet reachable in the live preview. No server restart is needed for this isolated addition.

## Live monster encounters

The preview now enables **Monster encounters** by default. The checkbox is a diagnostic option; API callers opt in with `encounters: true` on ticks, preserving the established encounter-free routing regression.

Post-search results bring out the monster with its original peep animation and a three-move pursuit countdown. Searching while it occupies the room runs the original attacked-search beginning and warning. Guarded exits trigger the quick warning; trying a guarded exit again during that quick warning leads to death. Open unguarded exits permit movement during the warning; walls cannot cancel an attack. Once death begins, movement is locked. Void rooms retain the original exemption from attacks/countdown decrement.

Native routines 26/28, 30–37 (excluding unused 38), 39, 63 and 64 provide attacked-search setup, ordinary/quick warnings, death artwork/music/text, and peep/hide animations. The death artwork uses the containing room object, matching original selection. At the final try-again acknowledgement, the preview stays on a game-over screen until Start / Reset, analogous to its completed ending screen. Attack counts feed ending statistics.

Verification: 2,388 result animation frames match the original test fixtures, including warning/death/peep/hide routines. The HTTP regression separately checks monster appearance, attacked searching, escape via an unguarded exit, fatal waiting, and blocked movement during death; the full encounter-free rescue/crown/escape route also passes. This is not full-game parity: ghost follow-ups, spider behavior, introductory safety/tutorial exceptions, and original keyboard/button input integration remain pending. Monster encounter visuals are now live; the earlier sections describe historical states.

## Monster placement and original ending-room cycle

Monster peep eligibility and seeded placement are now native C. The selection checks artwork sprite coverage, guarded exits, and the original strict-subset escape-route rule before drawing from eligible peeps in original order. This provides the face, hiding-spot icon, and guarded-exit mask for future encounter integration.

The congratulations screen now runs routine 91, cycling rooms and placing the monster rather than using the previous static backdrop. It skips void rooms when advancing the cycle. Ending-room rendering restores original gate definitions and collected fairy artwork because the original ending draws with empty have/used sets. Runtime progression is not changed by this restoration.

`test-monster.cjs` verifies 1,920 eligible-mask/seeded-room snapshots across 40 houses, including after native runtime gate and fairy state has changed. `test-results.cjs` separately verifies the ending-loop timing/text using matched synthetic backgrounds; the 1,640 result-frame comparisons and full HTTP route through escape pass. Random placement matches for identical PRNG state; full-session random parity still depends on porting the missing gameplay encounters.

Attacks remain disabled in live play until warning/death routines and their movement/search transitions are implemented. Remaining major work: monster encounters, ghost encounters, spider behavior, and original input integration.

## Escape and ending now playable

At the entrance, all three friends must be rescued and none may be assigned to a button. The crown is optional, matching `canEscape` in the original. Eligible rooms run the original flashing exit prompt (routine 18). The preview exposes **Leave mansion**; the original button-0 input also starts escape.

Routine 90 now plays the original escape music/announcement, rescue/crown indicators, and move/search/attack statistics, followed by the congratulations text and input acknowledgement. Move totals count successful movements. Search totals increment at the original ordinary/fairy/locked search routine steps, including searches later interrupted. Attacks remain zero until encounters are ported. The completed preview stays on the ending screen until Start / Reset rather than automatically generating a new session.

Known difference: final congratulations uses speech loop 92 on a static backdrop instead of routine 91's cycling rooms/monster. This keeps the ending usable while the monster rendering/state dependency is unfinished. The ending test substitutes the same speech loop in the original oracle, so its frame parity does not cover that missing background. Spider escape artwork also awaits spider-state support.

Validation: 1,640 result/ending frames and 1,500 ambient frames match the original under the documented boundaries. The full HTTP regression reaches the ending through ordinary rescue/key/code/crown gameplay, verifies escape eligibility without a crown, verifies assigned helpers block escape, and verifies the final screen remains stable. Player-facing messages now refer to Dot rather than calling the turtle a crown button; internal routine names retain original identifiers.

Remaining work: monster/ghost encounters and attacks, spider behavior, original end-screen room cycling, and complete original input/animation integration.

## Playable crown-button puzzle

Crown-button state is now connected to live searches. Rescued friends can hold buttons, searching an occupied button releases its helper, and holding the other three buttons activates the fourth. Routines 50–60 now provide the original feedback, speech, warp effects, crown reveal, inventory flashing, and escape guidance. Crown possession changes at routine 53 step 22, not at the beginning of the animation. Repeated searches after acquisition return the original nothing-new result.

A helper assigned to a button disappears from the available-friend status display. In that room, routine 61 flashes the helper face and button with original timing and takes priority over the previous ambient effects. Assignments persist across room changes; crown acquisition clears them and restores the available faces. Continue dialogue advances the hold/release and final conversations.

Validation:
- `test-results.cjs`: 1,403 frames against original routines, including crown award timing, text, sounds, waits, loops, and input acknowledgement. Room redraw/post-found boundaries use the established fixture restoration instead of encounters.
- `test-crown.cjs`: 6,400 state transitions against original logic.
- `test-ambient.cjs`: 1,200 ambient frames including button-holder animation.
- `test-server.py`: normal API navigation through key/code collection, all three friend rescues, assigning three helpers, releasing/reassigning one, fourth-button crown acquisition, and repeat searching. No inventory injection or debug teleports.

The actual escape/endgame sequence, monsters and ghost encounters remain unfinished. The preview does not yet finish the game when returning to the entrance. Earlier sections below describe historical milestones.

## Crown-button state logic (not yet connected to live play)

`MoidaCrown` and `moida_crown_search` now implement the original search-outcome state changes for crown buttons: mark the button found, assign the first available rescued friend, release a friend already holding that button, detect three friends holding the other buttons, and return the original routine IDs (52, 59, 60, 53, or 42). Fourth-button activation clears the assignments but does not prematurely mark the crown collected; that happens later in the original animation.

`node 4_game_runtime/test-crown.cjs` checks 6,400 transitions against the original `apply_search_found` across 20 houses, all eight friend-inventory subsets, five assignment patterns, four buttons, and both crown possession states. It compares selected outcome, inventory, and all three assignments under AddressSanitizer and UndefinedBehaviorSanitizer. The live preview still uses the previous rescue implementation: crown animations, room friend overlays, and the later crown-award step must be implemented before integrating this state logic.

## Follow-up rescue hints and gifts

Routines 87–89 and hint loop 93 are now ported. After the thank-you message, the rescued friend names the next friend who needs help and provides the original scrolling hint, with the relevant object flashing. Gift branches grant the original key/code entity at the original animation step. When the original hint lookup returns no next hint, the escape-guidance conversation plays. Each speech waits for **Continue dialogue** after its initial reading delay. This does not yet implement the actual escape sequence, crown/button interactions, or encounters.

Hint selection follows original puzzle order and friend asset mapping. `test-hints.cjs` verifies 800 selections across 100 generated houses and all subsets of collected friends. `test-results.cjs` verifies 751 frames across the existing result animations and rescue routines 86–89, including scrolling, input waits, hint blinking, gift timing, and sound. Post-found encounters/tutorial routing is still substituted with room restoration. The HTTP regression covers free and code-locked rescue through multi-part conversation completion.

## Rescue announcement and thank-you dialogue

Routine 86 now runs in C: the original border collapse preserves the searched object, a friend-specific rescue announcement appears with face blinking and melodies, then routine 92 animates the talking face and thank-you text. The dialogue waits for input after its initial reading delay. The live page exposes **Continue dialogue**; keyboard gameplay buttons also continue. After acknowledgement the room returns with the rescued face in inventory. Follow-up next-friend hints, gift handling, and escape guidance (87–89) remain unported; this is not yet the full rescue conversation.

`node 4_game_runtime/test-results.cjs` now compares 286 original/native frames, including 82 rescue/dialogue frames and a scheduled acknowledgement, with AddressSanitizer and UndefinedBehaviorSanitizer. The original and C implementations substitute restoration at the subsequent-dialogue boundary. The HTTP regression passes both free-friend and code-locked-friend rescue, including dialogue continuation. Reset the live session to use the updated executable.

## Code-locked searches

Locked search targets now play original routine 29 (lock/code prompt and beeps). With all required code bits collected, searching consumes those bits, updates satisfied gates, plays routine 27, and continues into the search. Target switching is disabled during unlocking and enabled again during the subsequent search, matching the original input rules. Eligible locked friends can then be rescued; their conversation/hints remain unported.

Validation: `node 4_game_runtime/test-locked-search.cjs` compares 178 animations / 11,214 frames against the original scheduler, display, and sounds. Outcome boundaries substitute room restoration. The normal-search regression still passes 371 searches / 23,002 frames. `python3 4_game_runtime/test-server.py` additionally tests the full seed-1700000000000 flow: search locked friend icon 36 in room 1 without a code, collect code icon 62 in room 11, return, unlock, and rescue. It checks that target switching cannot interrupt unlocking. This extends the existing key, door, latch, idle, and rescue HTTP tests.

## Eligible friend rescue state

Searching an ungated friend now marks the friend found and rescued, records the original have/used bits, shows their asset-mapped face in the status area, and stops their rustling. State persists across rooms until Reset. Other gates can observe the same bits. This implements state changes, not the original rescue conversation: the browser reports the rescue while spoken/scrolling hints and next-friend guidance remain unported. Locked-friend search/unlock sequences are implemented as described above.

`test-friends.cjs` compares 312 eligible/repeated rescue state changes with the original across 40 houses, including satisfied prerequisite sets. The HTTP regression rescues the first friend in seed 1700000000000 (West, second search target, icon 327), checks persistent inventory/status display, and confirms rustle sound stops. Lighting is allowed to take over afterward according to the existing priority rules.

## Latch keys and hidden passages

Latch outcome 48 now plays its original object flash, bottom-up tunnel reveal, melodies, and passage text. At the original step 21 it marks the held latch key used, clears the pending latch, and updates satisfied gates. The passage remains open from both sides. The end of the animation redraws the newly opened room.

Verification: result comparisons now cover 204 frames including latch reveals against the original routine on a base with the tunnel initially absent. The HTTP regression uses seed 1700002469134: enter, West, Upstairs, search the fourth target (icon 61), wait for completion, then cross East and return West. It verifies the formerly hidden exit changes from kind 3 to kind 1 on both sides. Search/key/unlock/idle regressions also pass. Friend rescue, special friend interactions, and encounters remain pending.

## Fairy search and collection

Active fairy targets now use routines 25/24 rather than ordinary object searching. Collection adds the fairy entity to inventory, removes its room sprite, stops its idle animation, and shows the original code-part result (47). The third collected fairy chooses the full-code result (46). Code-fragment indicators 268–270 reflect the collected fairy IDs. Fairy appearance still obeys the original prerequisites; the preview does not expose gated fairies for testing. Some prerequisites depend on unfinished friend interactions.

Validation: `test-fairy-animation.cjs` compares 371 animations / 6,307 frames with the original scheduler and sounds, substituting room restoration at the outcome boundary. `test-collect.cjs` now checks 15,232 ordinary/fairy outcomes, including full/mixed inventory and used gates. `test-results.cjs` covers 143 frames including code-part text, blink and melody. HTTP search/key/unlock regression passes. Monster-interrupted fairy searches, friend rescue, and latch reveals remain pending.

## Idle lighting effects

Room light flicker (routine 11) now runs in C using the original fixture/child-icon rules. Active fairies take priority, then undiscovered-friend rustling, then the room lighting effect. For seed 1700000000000, enter, go East then Downstairs, and wait.

`test-ambient.cjs` verifies 900 looping frames across fairy, flicker, and rustle routines. `test-ambient-selection.cjs` verifies 1,440 selections across 40 generated houses and empty/full/mixed found-item sets, covering all three effects and no-animation rooms. This selection test excludes rescued-friend button and escape states. HTTP tests verify silent lighting changes and rustle frames, alongside the key/unlock regression.

## Room idle clues

The live browser now continues ticking while idle. Hidden-friend rustling (routine 12) and active-fairy blinking (routine 10) run in C, with fairy priority matching the original initial room-animation selection. Rustling uses the first eligible room entity whose friend has not been found. These clues do not mark ordinary hidden keys. For seed 1700000000000, enter and move West, then wait a few seconds.

Animations stop during actions and restart on return to idle. Pause/Resume works while idle. Diagnostic native/API callers opt in using `idleAnimation: true` (protocol bit 512), preserving deterministic static-room probes. `test-ambient.cjs` checks 600 looping frames against original routines; HTTP tests check rustle sound and changing segments. Rescued-friend/button states, escape animation, and special rustle-before-movement sequences are still unported.

## Door unlocking with collected keys

A matching collected key now starts the original unlock flash/melody (routine 41), marks the key used, and updates satisfied gates in the runtime room copies. Unlocking stays in the current room; press the direction again to pass through. Both sides remain open for the session. Reset restores the original puzzle state. Ordinary inventory indicators omit used keys. Latch-key tunnels, code-locked search objects, and special outcomes are separate and remain pending.

Validation: `test-unlock.cjs` compares 3,840 combinations of required/held/used key sets against original door-attempt logic. `test-results.cjs` includes the unlock animation, now 112 frames total. The HTTP regression walks to room 11 in seed 1700000000000, collects the key at icon 28, returns to the room-6 east door, unlocks it without moving, then walks through and back. All pass.

## Locked-door feedback

Trying a locked passage now plays original routine 40: centered warning text, flashing door lock, and low warning beeps. The room is restored without moving. Seed `1700000000000`: enter, walk East once, then try East again. Direction arrows intentionally remain visible for locked doors. Consuming keys and opening doors are still unported.

`test-results.cjs` now includes this routine (97 total result frames). `test-server.py` checks the locked-door state, unchanged location, and full restoration over HTTP.

## LCD result screens

Nothing-found, ordinary key, and ordinary code searches now run native result routines 42/44/46. The LCD displays centered original text; keys/codes flash and play their discovery melody. The result completes automatically and restores the room. Searching is unavailable during these result routines, as in the original cancelable-routine list.

`node 4_game_runtime/test-results.cjs` compares all 84 frames of these three routines with the original scheduler, text, flashing, waits and melodies using an identical synthetic display base. Post-result tutorials/encounters are replaced with room restoration. The original code routine starts from the prior search display; this preview starts from the restored inventory display. Latch-key reveals remain pending. Interrupted-search tests now stop at the result boundary.

## Ordinary search outcomes and inventory

Normal searches now collect ordinary keys, codes, and latch keys. Inventory persists across rooms until Reset; duplicate searches return nothing new. Key/code indicators appear on the display. Latch-key identity is retained, but opening its tunnel is not implemented. Result text currently appears below the LCD; original found-item celebration routines remain unported. Locked objects and special outcomes are reported without granting their rewards.

`node 4_game_runtime/test-collect.cjs` checks 11,365 cases against `apply_search_found`, comparing outcome routine, inventory bits and latch state across 24 houses and repeated/used-key variants. Special outcomes are excluded. Existing wipe/search animation comparisons cover empty inventory; inventory indicators during animations currently use a preview overlay rather than a fully ported inventory-aware renderer.

Earlier sections below describe incremental milestones and may mention outcomes as pending; the scope above supersedes those notes.

## Switching search targets during animation

The original cancelable-routine list includes all normal-search routines (22, 20, 19, 21), so another search press may switch targets throughout the normal animation. The preview keeps **Search next object (restart)** available while searching. A press advances the target and restarts the normal sequence; direction controls remain disabled in this diagnostic interface. Search presses arriving during an HTTP request are retained for the next request (multiple presses within that request coalesce).

`node 4_game_runtime/test-search-interrupt.cjs` verifies 52 interruption sequences / 5,544 frames against original input eligibility, target selection, restart timing, segments and sound. It covers early and late interruptions and presses after completion. Outcomes still stop at room restoration.

## Timed normal-search animation

**Search next object** now starts the native normal-search sequence (routines 22, 20, 19, 21). It alternates target visibility, draws the original searching text, waits the original tick counts, and emits the original beeps. Search remains available during the sequence to switch targets. On completion the room is restored, including the searched object.

This preview stops at the outcome boundary: it does not yet collect items or run special locked/fairy/monster searches. `test-search-animation.cjs` compares 371 normal searches (23,002 frames) with the original scheduler. Both test implementations replace the outcome handler with room restoration; the comparison does not claim outcome equivalence. The HTTP regression checks completion and restored segment bits.

## Search target selection

The earlier diagnostic **Next search target** control cycled through the current room's searchable artwork in the original order, wrapping at the end. The chosen icon is temporarily hidden to identify it; the next selection redraws the previous target. This is a diagnostic selection control, not a completed search: it does not collect items, spend keys, rescue friends, or trigger encounters. Room movement resets the selection.

Native APIs `moida_search_next` and `moida_search_entity` reproduce target ordering, fairy eligibility, and hidden-entity filtering. `node 4_game_runtime/test-search.cjs` compares all 352 icon IDs across all rooms in 12 houses and four inventory/used-key states against the original JavaScript. The game-level spider target and search outcome routines remain pending.

## Directional movement transitions

Live exploration now plays the original left/right/up/down segment wipes and three movement beeps in C. The seven drawing steps reproduce routines 5–8, followed by the handoff frame and static destination render. Further post-move encounters are not implemented. The temporary directional controls remain; this is not yet full original gameplay.

`node 4_game_runtime/test-movement.cjs` compares animation frames and sound against direct execution of the original routine steps on generated rooms. This checks drawing and beep equivalence, not the complete original input/scheduler/encounter pipeline. The existing nonanimated walking test remains useful for passage rules.

## Diagnostic walking preview

The live preview now continues past the entrance reveal. Use **West**, **East**, **Upstairs**, and **Downstairs** under “Explore rooms (diagnostic)”. C evaluates the current room’s exits, blocks locked and hidden passages, and renders the destination room and map position. This is a temporary exploration interface, not the original four-button gameplay: searching, collecting/using keys, room animation, and encounters remain pending. Inventory stays empty; some rooms are intentionally inaccessible.

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
