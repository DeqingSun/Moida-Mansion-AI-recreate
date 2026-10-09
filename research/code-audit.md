# Original-code audit of the segment count

**Confirmed: 631 independently addressable renderer segments, already grouping islands by their original segment ID.** This is not a proof that 631 is the minimum possible control count after optimizing for reachable gameplay states.

The audit reads the archived original `source/moida.js`. It extracts the original sprite setters, bit readers and display application functions, then executes them unchanged in an isolated JavaScript VM with fake DOM elements. It does not launch the game or substitute a rewritten renderer.

## Evidence chain

1. `segIds_721420499` contains 631 distinct IDs.
2. `romData_1409288915.sprites` contains 631 sprite records, with addresses 1–631.
3. `run__device95html_u798` loops over those IDs, creating one renderer entry for each. Each entry points to `seg_ID`, its matching `shad_ID`, and an optional `unwired_ID` (none present).
4. `showSprite__spritestate_u16` calls `set__spritestate_u20`. The latter changes exactly one bit at `data[floor(index/32)]`, position `index % 32`.
5. `apply__device95html_u344` starts `n=-1`, increments it before reading, and therefore maps renderer entries to bits **0–630**, not 1–631.
6. `onHEX3D__device95html_u67` shows/hides the entire SVG use element for that ID and its cosmetic shadow. All paths/islands in its referenced definition move together.

The automated audit checks all 631 one-hot states (exactly one bit on), then all 631 one-cold states (exactly one bit off). Every case controls precisely its corresponding renderer group. Shadow visibility also follows the selected group in the one-hot tests.

## Islands are already grouped

For example, `C02S106` has **10 disconnected filled islands**, but the original renderer gives the entire group **one state bit, index 617** (ROM address 618). It counts as **one of the 631**, not ten.

Across the panel, 769 filled islands are assigned to 631 logical groups. Of those groups, 61 have multiple islands. SVG path count (751) and contour count (964) are not logical segment counts; contours can describe holes.

## Gameplay-use qualification

The ROM contains 352 icon records. Their `spriteIndexes` collectively reference **630 distinct bits**. The only absent bit is **0 / C00S01**: a small isolated shape at native x=2805–2823, y=2003–2020. It is nonetheless a valid independent renderer segment, and the introductory `show_all__game_u432` uses `flood__game_u434` to turn all 20 state words on, including this bit. The next introductory step clears the display.

Thus:

- **631** is the exact source renderer segment count, including the all-on intro.
- **630** are referenced by the ROM's icon lists; this alone does not prove all 630 are required or mutually independent in normal gameplay.
- A smaller electrically tied design would require additional gameplay-state analysis. Shared icon membership alone is insufficient because reveal/erase routines also manipulate individual bits using spatial bounds.
- Preserve all 631 for a faithful baseline. If optimizing hardware, review C00S01 separately and prove any proposed tying of other groups before changing the artwork or address mapping.

The text icon table (IDs 246–258) confirms 13 positions with 15 distinct bits each: 195 text elements total.

## Correction to the first package

The initial register mislabeled one-based ordinals as game bit indices. The geometry and grouping were correct; the firmware index label was off by one. `game_index` is now the actual **zero-based** state bit, and a separate `rom_address` field preserves the **one-based** ROM address. The CSV, JSON, explorer and documentation were regenerated accordingly.

## Reproduce and inspect

Run `node scripts/audit_original_code.cjs`. See `output/code-audit.json` for results and `research/original-display-functions.js` for verbatim extracted functions. Source provenance remains in `output/validation.json`.
