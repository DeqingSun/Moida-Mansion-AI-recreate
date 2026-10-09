# Moida Mansion — physical LCD recreation

This project investigates recreating **Moida Mansion by dukope (Lucas Pope)** on a physical console with a custom segment LCD. Work so far covers the original display artwork, verification of its segment controls, an experimental two-layer electrode design with an interactive simulator, and a manual browser routing editor. The console hardware and game port have not been implemented.

**Current status:** the original geometry and 631 independently addressable display groups are verified. The electrode-routing candidate is incomplete and is **not ready for fabrication**.

## Preview the work

From the repository root, start a local server:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory output
```

Then open:

- [Manual routing editor](http://127.0.0.1:8765/router/index.html): assign nets, draw and erase traces, save/load projects, undo edits, and check electrode connectivity and overlaps.
- [Segment explorer](http://127.0.0.1:8765/segment-explorer.html): inspect original shapes, IDs, positions and dimensions; isolate groups and adjust the example physical scale.
- [Electrode workbench](http://127.0.0.1:8765/electrodes/index.html): inspect front/rear layers and overlaps, toggle arbitrary segment combinations, change drive phases, scan all 631 groups and run state checks.

Both also work offline: open `output/segment-explorer.html` or `output/electrodes/index.html` directly. Keep the electrode workbench's HTML, `simulator.js` and `design-data.js` together.

## 1. Extracted the original display artwork

The public browser build contains its LCD artwork as an embedded SVG in `moida.js`. We extracted those vectors directly, preserving their original shapes, holes, locations and grouping instead of tracing screenshots. Cosmetic shadows, the glass texture and the plastic enclosure were excluded from the optical master.

| Finding | Result |
|---|---:|
| Native canvas | 3000 × 2160 units; 25:18 aspect ratio |
| Independently addressable logical groups | 631 |
| SVG path elements | 751 |
| Closed contours, including holes | 964 |
| Disconnected filled islands | 769 |
| Logical groups with multiple islands | 61 |
| Text strip | 13 positions × 3 × 5 elements = 195 groups |

**An island is not necessarily an independent segment.** For example, `C02S106` contains 10 disconnected visible islands, but the original game controls the whole group with one bit.

Coordinates use an upper-left origin, X right and Y down. The 150 × 108 mm exports are an example scale, not a recovered original physical dimension. At that scale, one native unit equals 0.05 mm. The artwork canvas is not the outer glass boundary.

Geometric checks found no touching or overlapping groups. The minimum gap between different logical groups is 4 native units, or **0.20 mm at the example scale**. This does not establish that enough space exists for electrode routing.

## 2. Verified the count against the original game code

The audit traced the original segment-ID array, ROM sprite records, bit setters and renderer. We executed the extracted display functions unchanged in an isolated JavaScript VM with mock DOM elements.

- The ID array contains **631 unique IDs**, matching 631 ROM sprite records.
- Each group has its own display-state bit, indexed **0–630**. ROM addresses are **1–631**.
- All **631 one-hot tests** and **631 one-cold tests** passed: switching a bit affected exactly the corresponding group.
- The ROM icon lists reference 630 groups. The remaining group, `C00S01`, is included in the all-on introduction.
- The source prefixes `C00`, `C01` and `C02` are identifiers, not verified physical common-electrode assignments.

The first export incorrectly labeled one-based ordinals as game bit indices. This was corrected: `game_index` is now zero-based, and `rom_address` is separately recorded as one-based. Geometry was unaffected.

This confirms independent renderer addressing, **not the minimum possible hardware control count** after optimizing for reachable gameplay states. No groups have been merged based on assumed co-activation.

See the [code audit](research/code-audit.md), [verbatim display-function excerpts](research/original-display-functions.js) and [machine-readable audit results](output/code-audit.json).

## 3. Built an electrode-routing candidate

Revision 01 explores a static-drive architecture: **631 logical front SEG nets against one rear COM net**, with no vias or insulated same-layer crossovers. The router attempts to connect each original filled island to a perimeter contact. Separate contacts belonging to the same logical group would be tied together on an external PCB.

The rear electrode has cutouts beneath front connecting traces to avoid unwanted visible overlaps. Exact polygon checks confirm that the proposed front/rear overlaps reproduce every original island. However, narrow passages prevent many routes from reaching the perimeter, and the rear pattern has disconnected regions.

| Current candidate result | Count |
|---|---:|
| Valid front routes to contacts | 222 / 769 islands |
| Islands with both front and rear connectivity | 220 / 769 |
| Fully connected logical groups | 165 / 631 |
| Partially connected logical groups | 26 / 631 |
| Groups without a usable island connection | 440 / 631 |
| Rear conductor components | 3; only the main component reaches the rear contact |
| Optical overlap mismatches | 0 |

Several routing passes were tried. The final pass produced 225 paths; three failed clearance checks and were removed. This is a heuristic routing result, **not proof that a complete two-layer design is impossible**.

The candidate assumes a 150 × 108 mm active canvas, 0.05 mm trace width, 0.05 mm front-net clearance and 0.30 mm square contacts. These are provisional assumptions, not supplier-approved manufacturing rules. Glass outline, seal, connector fanout and driver selection remain open.

See the [electrode design notes](electrode-design/design-notes.md) and [routing validation](electrode-design/validation.json). **Do not use these SVGs as released manufacturing masks.**

## 4. Built and tested the electrode simulator

The workbench provides:

- Front, rear, combined-layer and LCD-result views, with zoom and a rear-view mirror option.
- Original segment IDs, game bit indices, island counts and connection status.
- Individual or arbitrary segment selection, all-on/off, inversion, random states and a 631-group scan.
- COM/SEG phase controls, ideal AC-drive voltage and an illustrative switching threshold.
- Downloads of the candidate electrode SVGs, contact register and validation report.

Two modes keep optical correctness separate from wiring:

| Mode | Meaning |
|---|---|
| **Direct electrode probes** | Ideal probes energize every intended conductor piece, bypassing missing routes. All 631 groups can be displayed. |
| **Routed edge contacts** | Only islands with verified front routes and connected rear coverage are displayed. The candidate's missing connections remain visible. |

The ideal static model gives 0 V across an in-phase electrode pair, or alternating +V/−V across an opposite-phase pair. It does not model floating-electrode behavior, parasitic ghosting, ITO resistance/capacitance, fringing fields, material response or manufacturing tolerances.

Browser checks passed for all 631 one-hot states, 631 one-cold states, 64 deterministic random states, and all-on/off. Layer views, phase/voltage controls, filtering, scanning and mobile layout were also checked, with no browser JavaScript errors. These results validate the simulator's ideal model; they do not validate the incomplete routing as a working physical display. The 2^631 possible display images were not exhaustively enumerated.

See [browser test results](output/electrodes/browser-test.json).

## 5. Added a manual routing editor

The [manual editor](output/router/index.html) lets you route the display yourself, starting from the original artwork with no automatic routes or net assignments.

- All **631 segment groups / 769 islands**, with independently assignable top and bottom nets.
- **64 available edge pads**: 48 top-layer pads along the top edge and 16 bottom-layer pads along the left edge. Each has a default net named after its pad ID. Older layouts preserve traces and segment nets, retain previous pad assignments in saved JSON, and show a notice to reconnect routes to the new pads.
- Polyline drawing with configurable physical width, pad/vertex snapping, zoom and pan. Top conductors are red; bottom conductors are blue.
- Finished traces and width edits automatically assign touched segments/pads to the trace net, unless another net’s trace touches that feature on the same layer. Multipart segments are checked across all islands; automatic assignments undo with the trace edit.
- Whole-trace erasing, width editing, undo/redo, validated JSON save/load and local browser autosave.
- Adjustable screen size; trace widths, pad sizes and clearance remain in millimetres when the screen is enlarged.
- Top/bottom conductor SVG export, netlist CSV and downloadable check reports.

The polygon-based checker verifies missing top/bottom assignments, duplicate net pairs, same-layer shorts/clearance, and top/bottom overlap outside the original shapes (including holes). It verifies **every island's actual same-layer path to an assigned edge pad**; disconnected pieces with matching net names do not pass simply because their names match.

Checks run in a background worker, and clicking an issue locates it on the drawing. Numerical geometric checks do not replace factory rules, material characterization or electrical-drive design. The tool is ready for manual layout work; the existing automatic electrode candidate remains incomplete.

See the [full editor guide](routing-editor/guide.md). Application source is in `routing-editor/`; run `python3 scripts/package_router.py` to rebuild `output/router/`. Geometry fixtures are in `tests/router-geometry.cjs`; real browser workflow tests are in `tests/router-browser.cjs`.

## Main files

| File or directory | Purpose |
|---|---|
| [source/](source/) | Archived original browser code/styles and extracted source SVG |
| [Optical master](output/segments.svg) | Exact original vectors, one named group per logical segment |
| [150 mm SVG](output/segments-150mm.svg) | Optical artwork at the example physical scale |
| [150 mm DXF](output/segments-150mm.dxf) | Closed contour polylines, one layer per ID; lower-left Cartesian origin, millimetres |
| [Segment register](output/segment-register.csv) | IDs, bit indices, ROM addresses, bounding boxes and path/contour counts |
| [Segment JSON](output/segments.json) | Metadata and original path strings |
| [Island register](output/island-register.csv) | Disconnected pieces grouped by logical ID |
| [All-on preview](output/all-segments.png) | Every segment shown simultaneously, including mutually exclusive game states |
| [Extraction validation](output/validation.json) | Source provenance, hash and counts |
| [Geometry checks](output/geometry-check.json) | Overlap and spacing results |
| [electrode-design/](electrode-design/) | Candidate conductors, contact register, routing data and design notes |
| [output/electrodes/](output/electrodes/) | Offline simulator and packaged electrode exports |
| [research/](research/) | Code audit, geometry findings and manufacturing next steps |
| [routing-editor/](routing-editor/) | Manual editor source, geometry engine and guide |
| [output/router/](output/router/) | Packaged manual routing editor |
| [scripts/](scripts/) | Reproducible extraction, audits, routing, packaging and browser checks |

The optical SVG is authoritative for filled areas and holes; the DXF represents contour boundaries. The browser's scale control does not rewrite the fixed-size CAD exports.

## Reproduce

Run these commands from the repository root. Extraction uses Python's standard library; the code audit requires Node.js:

```sh
python3 scripts/extract_segments.py
node scripts/audit_original_code.cjs
```

The optional geometry check requires Shapely:

```sh
python3 scripts/check_geometry.py
```

Regenerating the electrode candidate requires Python with NumPy, Pillow and Shapely, plus a C++17 compiler:

```sh
python3 scripts/prepare_routing.py
clang++ -O3 -std=c++17 scripts/route_electrodes.cpp -o /tmp/moida-route
/tmp/moida-route electrode-design
python3 scripts/build_electrodes.py
python3 scripts/package_electrodes.py
```

Generated router binaries are ignored temporary intermediates. Raster previews were produced using Sharp. `scripts/test_electrode_simulator.cjs` uses this workspace's bundled Playwright and installed Chrome; adjust those runtime paths before running it on another machine.

## Next steps

1. Agree on the active display size and obtain a factory's trace, gap, registration, seal and contact rules.
2. Develop a multiplexed topology that co-designs both electrode layers. The text strip is a useful starting point for row/column sharing. A matrix with enough addresses is not sufficient without valid routing.
3. Complete every conductor-to-contact connection and check for shorts, unintended overlaps, disconnected regions and narrow necks. Preserve the original logical IDs through any physical splitting.
4. Select the driver and drive parameters, then define the glass, contacts, external PCB and firmware address mapping.
5. Obtain sample glass and verify individual segments, multipart groups, text and representative game states.

The existing artwork, code audit and simulator provide reference data for that redesign. A complete physical console or game port is beyond the work completed so far.

## Source and attribution

Original game and artwork: **[Moida Mansion by dukope (Lucas Pope)](https://dukope.itch.io/moida-mansion)**. The extraction uses [public browser build 11926521](https://html-classic.itch.zone/html/11926521/index.html).

`source/moida.js` is the unchanged downloaded asset; its SHA-256 is recorded in `output/validation.json`. SVG extraction did not execute the game code. The later renderer audit executed only the extracted display functions in an isolated test harness.

The archived files are reference material extracted for this project. Their public availability does not establish a license or permission to manufacture reproductions; artwork and port permissions remain to be resolved with the creator.

## Directional routing search

A separate Python experiment now tries mostly vertical top traces and mostly horizontal bottom traces. It preserves all 631 logical segments and unique column/row pairs, tries 14 paths per island/layer, and checks the result with the manual editor's polygon engine. The selected run reduced forbidden overlap regions from 3,733 to 3,047 (18.4%) and overlap area from 9.12 to 6.62 mm² (27.5%). Same-layer shorts remain, so this is an experimental layout, not a manufacturing design.

- [Comparison viewer](http://127.0.0.1:8765/orthogonal-routing/index.html)
- [Algorithm, reproduction instructions and limitations](output/orthogonal-routing/README.md)
- [Python router](scripts/route_orthogonal.py)
- [Editable candidate](output/orthogonal-routing/optimized.moida-routing.json)

Your manual layout is not changed by generating or viewing this experiment.
