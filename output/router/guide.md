# Manual LCD routing editor

This is a browser-based manual editor for the **631 original Moida Mansion segment groups**. It starts without traces or segment assignments. Every edge pad has its own default net, named after its ID (for example `T-N001` or `B-W016`). Pick a pad’s net and draw without typing. The 769 filled islands retain their original shapes and positions.

## Open

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory output
```

Open [the routing editor](http://127.0.0.1:8765/router/index.html). Keep this folder's HTML, scripts, segment data and `vendor` directory together. The tool uses no hosted service or external requests. Opening `index.html` directly is also supported; where browser security blocks workers, checks fall back to the main thread.

## Route a segment

1. Select a shape, or find its original ID in the inspector. Shift-click adds/removes segments from the selection. All islands of a group share its assignments.
2. Enter a **top net** and **bottom net**, then apply. Names are case-sensitive and scoped by layer: top `1` and bottom `1` are different electrical networks. Net names use letters, numbers, `_`, `-` and `.`; maximum length is 32 characters.
3. Choose the active layer, select an existing routing net from the dropdown or type a new name, and set trace width in millimetres. Hover shows trace nets even while drawing. Use Pick net and left-click (or Alt/Option-click) a trace, assigned segment or pad to pick its net on the active layer, or use **Pick net** and click. Picking does not add a trace point. Right-click finishes a trace like Enter and returns to Pick net mode. With no unfinished trace, right-click switches to Pick net mode. Finish or cancel an unfinished trace before changing its net.
4. Choose **Draw trace**. Click to place the starting point and bends. Double-click, right-click or press Enter to finish. Escape cancels the unfinished trace.
5. Snap helps place endpoints on edge pads and existing trace vertices. To branch elsewhere along a trace, draw overlapping conductor geometry and verify it with the checker. A trace can have any number of straight polyline sections, with round joins and caps.
6. When a trace is finished or its width edited, every segment and pad touched by its full width receives its net, including previously assigned features. If any trace of another net on the same layer touches that feature, its assignment is preserved and a message reports the conflict. For multipart segments, this guard checks every island. Opposite-layer traces do not block assignment. The trace and automatic assignments undo together. A named but isolated island is not connected merely because another island has the same net name.
7. Use **Check layout**, or leave Auto-check enabled. Click an issue to select its segment(s) and zoom to the affected region.

Top is **red** and bottom is **blue**. Top and bottom shapes are shown in registered **front-view coordinates**. The viewer does not mirror the rear layer. Both SVG exports use this same convention.

## Edge pads

There are **64 available pads**, evenly spaced along two edges:

- **48 top-layer pads**, across the top edge: `T-N001`–`T-N048`.
- **16 bottom-layer pads**, down the left edge: `B-W001`–`B-W016`.

Every pad starts with a net matching its ID. Pick its net and draw without typing. Use “Find an edge pad” to locate a particular point, assign its net, or mark it unused. Pads with no trace are allowed. Named pads are conductive polygons in checks and exports; clearing a pad to “Unused” omits it.

Version-3 projects store this 48-top / 16-left arrangement. Loading a version-1 or version-2 project preserves all trace coordinates and segment net assignments, creates the 64 default pad nets, and retains the former pad assignments in `previousPadLayout` in the saved JSON. Even reused pad IDs refer to new positions, so old contact names are not silently mapped onto them. A visible conversion notice tells you to reconnect the old routes to the new pads. On first autosave recovery of an old layout, the original browser snapshot is backed up under `moida-manual-routing-v1-before-64-pads`. Clearing pads in version 3 survives save/load.

Several pads may have the same net name. The tool assumes those pads will be tied to that net externally. Every visible island still needs a continuous same-layer conductor path to at least one such pad. This allows separate islands of one logical group to use separate edge contacts without inventing an invisible connection on the glass.

## Editing

- **Erase** removes a whole trace on the active layer. It does not erase the fixed original artwork. Alternatively, select a trace and press Delete or use the inspector.
- Trace width can be changed in the inspector after drawing.
- Undo/redo covers net assignment, trace creation/deletion/width, pad assignment, physical settings, project loading and New.
- Up to 100 prior snapshots are retained in memory, subject to a roughly 20 MB history budget. History is not included in saved JSON or preserved on reload.
- Loading a project and starting a new one are undoable.
- Wheel zooms at the pointer. Pan tool, Space-drag or middle-drag moves the view. Fit restores the whole drawing.

Keyboard shortcuts: **V** select, **R** route, **E** erase, **H** pan, **Enter** finish, **Escape** cancel, **Delete** remove a selected trace, **Ctrl/Cmd Z** undo, **Ctrl/Cmd Shift Z** or **Ctrl Y** redo, **Ctrl/Cmd S** save, **Ctrl/Cmd O** load. Text fields retain their normal text-editing shortcuts.

## Screen size and widths

The artwork uses its original 3000 × 2160 coordinate system. The active screen width sets its physical scale; height is always 72% of width. The default is 150 × 108 mm.

**Trace widths, pad sizes and minimum clearance are stored in millimetres.** Enlarging the screen scales artwork, trace centerlines and pad positions, while preserving those physical widths and sizes. This creates more relative routing space. Re-run checks after resizing. The default trace width is 0.10 mm, pad size 1.80 mm, and same-layer clearance 0.05 mm. These defaults are not factory-approved specifications.

The grid setting controls snapping. Grid display may omit intermediate lines when zoomed out; snapping still uses the configured spacing.

## Checks

The geometry engine uses locally bundled Clipper 6.4.2, not screen pixels. It expands traces to actual filled conductor polygons, including their selected widths, and uses polygon union, intersection and difference.

| Check | What it verifies |
|---|---|
| Missing assignments | All 631 original groups have both a top and bottom net. |
| Duplicate pair | No two different groups share the same ordered `(top net, bottom net)` pair. Multipart islands of one group are allowed to share that pair. |
| Pad connectivity | Each island on each layer is covered by a connected component of its assigned net that reaches a same-layer pad assigned to that net. Merely using the same name in disconnected locations does not pass. |
| Unwanted overlap | The intersection of all top and bottom conductors, minus the original filled segment artwork, must be empty. Original holes are not allowed display area. This rule is applied throughout the drawn layout, including the margins. |
| Same-layer short | Different nets on one layer may not overlap or touch. |
| Same-layer clearance | Different nets must respect the configured physical clearance. |
| Floating trace warning | A trace-only net component without an edge pad is reported as a warning. |

Unused edge pads are allowed. Each check report lists all issues and per-segment island connectivity. The sidebar shows up to 150 issues per category; download JSON for the full report. Results are marked out of date as soon as the layout changes. Background check completion does not overwrite in-progress net-name edits.

Coordinates are quantized to **0.001 source units** for clipping. Round caps and joins use a polygon approximation with 0.002-source-unit arc tolerance. Contacts within 0.001 source units are conservatively treated as touching. At a 150 mm width, these correspond to 0.00005 mm and 0.0001 mm respectively. This is numerical precision, not a claim about fabrication accuracy.

These are geometric checks. They do **not** validate liquid-crystal drive waveforms, contrast, capacitive coupling, ITO resistance, minimum conductor neck width, etch/registration tolerances, seal layout, pin assembly or a factory's process limits. A passing layout still requires engineering and supplier review.

## Save, load and export

- **Save JSON** downloads the editable project: assignments, pad nets, trace centerlines and widths, physical settings, name, format version and source-artwork hash. Only finished traces are saved.
- **Load JSON** validates the format and artwork hash before changing the current project. Invalid files leave the current work untouched.
- **Local autosave** stores the latest committed state in this browser's local storage. Recovery happens automatically on opening the editor. This is not a substitute for downloaded backups, and does not sync between browsers or computers.
- **Top SVG / Bottom SVG** export the assigned conductor polygons grouped by net, with millimetre dimensions and the same front-view coordinate system. Unassigned artwork and unused pads are omitted. Export does not mean the layout passed checks.
- **Netlist CSV** exports original segment pairs, assigned pad coordinates and trace net/width records.
- **Check report JSON** exports the current validation results. Stale results cannot be downloaded from the button.

Project files do not embed the original artwork. Keep the compatible editor/data package with saved projects. This tool rejects a project whose recorded source hash does not match its artwork.

## Source, implementation and tests

- Editable application source: `routing-editor/`.
- Packaged browser application: `output/router/`.
- Rebuild with `python3 scripts/package_router.py` (requires Shapely for the existing geometry-extraction pipeline).
- Run geometry tests with `node tests/router-geometry.cjs` and automatic-assignment tests with `node tests/router-auto-assignment.cjs`.
- `tests/router-browser.cjs` exercises real drawing, width edits, deletion, undo/redo, file download/load, autosave recovery, physical resizing, checks and SVG export. Its Playwright/Chrome paths are specific to this workspace.

The polygon engine is [Clipper 6.4.2](https://github.com/junmer/clipper-lib), pinned and bundled locally under the Boost Software License. See `vendor/LICENSE-clipper.txt` and the source header for attribution. Original game/artwork attribution and project-wide findings are in the repository README.

Version 4 triples pad side lengths when loading older projects (0.30 mm becomes 0.90 mm), without moving pad centers. This happens only once; saved version-4 projects retain their chosen pad size. Trace widths are unchanged.

Version 5 doubles pad side lengths again (0.90 mm becomes 1.80 mm). Loading versions 1–3 applies both size updates once; loading version 4 applies only this doubling. Version-5 saves retain the chosen size. Pad centers and traces stay fixed.
