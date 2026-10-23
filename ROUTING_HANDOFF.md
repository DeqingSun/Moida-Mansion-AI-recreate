# Segment routing tools — history and handoff

Updated 2026-10-23. Companion to [HANDOFF.md](HANDOFF.md).
This records the conversation history and current repository structure. Some old
`guide.md` sections predate later changes; current code and saved project are the
source of truth. No routing geometry was changed while writing this document.

## Why there are two versions

1. **Preliminary routing** established that the 631 original game segments could
   be implemented using 48 top and 16 bottom nets. The user did substantial manual
   routing, including splitting islands where wires otherwise could not pass.
2. **Refinement + EDA exchange** starts from that proven routing, freezes segment
   net ownership, and concentrates on manufacturability: widths/clearances,
   moving shapes, editing vertices, adjusting slices, exporting PCB/DXF and routing
   in 嘉立创EDA. It is not intended to rediscover or automatically reassign the nets.

There was an earlier standalone refinement/measurement tool. The user rejected
that direction and asked to rebuild version 2 from the version 1 router. Do not
restore that abandoned tool over the current refinement folder. Old backups and
EDA prototypes were removed; their history is in Git (see EDA README).

## Shared model and terminology

- Original game has **631 independently controlled segment groups**. Visible
  disconnected shapes are not necessarily independently controlled game bits.
- A segment can have multiple **islands**, named with `_0`, `_1`, etc.
- An island can be cut into sub-islands. Displayed names were flattened to
  `_sub0`, `_sub1`, etc. Internal `cutId`/lineage preserves the edit ancestry.
- Separate islands/sub-islands may use different top/bottom pairs and still turn
  on together for the original game bit. Same pair is allowed within one original
  segment, but must not be shared by different original game segments.
- Merely assigning a net name does NOT establish physical connectivity. Each
  island must have a real conductive route to an appropriate edge contact on
  each layer. This distinction caused several confusing early “assigned but
  0 connected” reports.
- Top/bottom conductor overlap inside a segment is intentional. Outside segment
  shapes but inside the active display, overlap creates unwanted visible marks.
  Checks ignore overlap outside the display; intentional exceptions can be drawn.
- Rendered game simulation uses edited segment geometry, not all trace overlaps.

## Version 1: preliminary manual router

Location: `1_preliminary_routing/output/router/index.html`.
Other useful folders: `routing-editor/` saved work, `scripts/`, `tests/`,
`electrode-design/`, `research/`, `output/orthogonal-routing/`.

Serve the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open:
http://127.0.0.1:8765/1_preliminary_routing/output/router/index.html

The URL includes the directory prefix because everything except workingLog was
moved into `1_preliminary_routing`. A server started from a different directory
needs a correspondingly different URL. Earlier 404s were caused by mismatching
server root and URL, not by broken editor code.

### Features developed during routing

- Two-layer segment/island assignment, trace drawing with adjustable physical
  widths, trace erase, save/load JSON, autosave, undo/redo.
- Numerous edge contacts initially; later reduced to 48 top and 16 bottom.
  Contact sizes and offsets were enlarged several times for usability.
- Top red, bottom blue. Odd/even numbered **traces only** have strongly different
  brightness; this alternation was deliberately not applied to segment fills.
- Net dropdown/picking fixed: hover identifies traces even while drawing.
  Pick mode uses left click. Right click finishes the trace like Enter and
  returns to picking; earlier Alt-click-only interaction was too awkward.
- Contacts have default named nets so the user need not type every net.
- Early auto-assignment lets touched features adopt a trace's net when no
  conflicting same-layer trace touches them. Floating-net merging/renaming was
  added, then several bugs exposed the danger of inferring ownership from touch.
- Contacts must keep their identities. A bug gave T42 T44's net and lost T-N042/
  T-N043. A repair operation was added to reassign from connectors rather than
  trust existing net labels. This is historical version 1 behavior; version 2
  instead freezes segment assignments.
- Hover outlines the **whole original segment**, including all its islands,
  in white. Pick mode also outlines same-net objects on the current layer in
  grey and the hovered segment's other-layer network in darker grey.
- Small 5×5 window into the 48×16 electrical grid, showing T/B coordinates and
  animated movement between hovered segments. Previous cross and dot trails
  fade over about three seconds. This helps visualize physical routing as
  “warping a net to the segments.”
- Horizontal/vertical line island-count helper.
- Slice tool: manually draw a gap with width; accept trims leaving only one
  surviving island as well as genuine splits. Right click deselects a slice
  target. Slice edits live in project JSON, not the source artwork.
- Erase can remove slice operations. Multiple cuts and shape overrides make
  this ancestry-sensitive; do not delete arbitrary `_sub` names from JSON.
- Wanted-overlap regions allow intentional overlap to remain.
- Trace fine-tuning moves polyline vertices.
- Statistics expanded to electrical-pair utilization, segment/island assignment
  and physical connection counts. Floating-net assignments should not count as
  properly assigned for completion statistics.

The user completed preliminary routing after substantial manual work. Treat
`1_preliminary_routing/routing-editor/Moida-routing.moida-routing_finished.json`
as the frozen-net starting reference, not necessarily the newest geometry.

An orthogonal auto-router experiment (top vertical, bottom horizontal, minimizing
crossings) also exists. It was exploratory; the final manual routing is the
proven reference. Do not substitute an automated candidate for the manual result.

## Version 2: refinement tool + 嘉立创EDA

Location: `2_refine_routing/index.html`.
Start its bridge from repository root:

```sh
python3 2_refine_routing/eda/server.py
```

Open http://127.0.0.1:8766/2_refine_routing/index.html
A root static server on 8765 also serves the page, with the EDA bridge on 8766.
The EDA server starts/manages a persistent local EDA HTTP API. Prefer this over
repeatedly opening and closing the application for each API call.

Key files:
- `editor.js`: interaction, rendering, undo/autosave, actions.
- `project.js`: schema, slicing/layout reconstruction, assignments and contacts.
- `geometry.js`, `vendor/clipper.js`: geometry and clipping.
- `shape-edit.js`, `measure.js`: move/vertex edits, clearance and distances.
- `frozen-nets.js`: Step 1 net ownership keyed by slice lineage.
- `check-worker.js`: routing/manufacturing checks.
- `dxf.js`, `dxf-template.js`: factory DXF export.
- `eda-client.js`: browser bridge UI.
- `eda/server.py`, `http_api.py`, `convert.cjs`, `rules.cjs`: EDA exchange.
- `segments-data.js`: original segment shapes/bit IDs; don't overwrite with edits.
- `finished-data.js`: initial project for this version, not browser autosave.

### Frozen nets are essential

Use the Step 1 result as net authority. Touching traces must not rename island
nets, because during refinement close or touching wires can give false inferred
assignments. Newly sliced pieces inherit their original ancestor's net ownership.
Merging pieces with different frozen pairs is rejected rather than silently
choosing one. Preserve edits and slices when resolving missing assignments.

The user previously encountered “Assign both island nets before EDA export:
C01S184.” Attempts to repair this exposed lost slices after vertex editing.
Restoration work exists in `restored/`, including C01S184 and final-two-fixes JSONs.
Do not assume reloading the initial finished project is an acceptable repair:
it can throw away hours of moves, vertex changes and slice adjustments.

### Geometry editing and inspection

- Top toolbar for tool selection, similar to version 1.
- Nearest-distance measurement between two islands shows location and mm.
- Wire-count hint uses the user's formula `(2*N + 1) * 0.12 mm`; this is a
  planning helper, not a replacement for geometric clearance checks.
- Moving an island moves **all islands of the same original segment** together.
- Prevent moves violating 0.1 mm island clearance; comparison tolerance handles
  numeric noise. Shift constrains movement to X or Y.
- Vertex editing and corner modifications allow space for routing.
- Original segment artwork is a dark reference shadow; empty areas stay black.
  It must not be rendered as an inverted solid background. This is webpage-only,
  not an extra EDA electrode layer.
- Old slices remain visible, with endpoint and width fine-tuning.
- Erase can restore moves, restore vertex changes and remove slices, respecting
  geometry lineage. The exact hit target matters when edits overlap.
- Optional “Show shape changes” mode (default off) highlights moved segments with
  arrows, altered vertices and slices.
- Segment search was added to locate named problem objects quickly.
- EDA-imported connected straight trace pieces can be treated as continuous
  polylines for adjustment instead of forcing users to move two endpoints.

### Numerical and manufacturing rules

Confirmed user targets:
- Minimum trace width: **0.12 mm**.
- Same-layer trace-to-trace clearance: **0.12 mm** (0.1 was corrected).
- Segment/polygon-to-trace clearance: **0.12 mm**.
- Opposite-layer wire clearance outside intended segment overlaps: **0.1 mm**;
  webpage checker handles this where EDA cannot express it natively.
- Pad-to-pad clearance: **0.1 mm** (1.0 was corrected).
- Via-to-everything and drill-to-everything: **0.1 mm**.
- Default temporary via: **0.12 mm diameter / 0.06 mm hole**.
- Default EDA units: mm.
- Linear comparison tolerance: **0.0001 mm**, so 0.1199996 is accepted as 0.12.
- Tiny overlap-area filtering was separately requested earlier; don't confuse
  area units/thresholds with the linear clearance tolerance. Inspect the checker
  before changing it.

Display width settled at **150 mm**, height 108 mm. Earlier conversation had
ambiguous “10mm/15mm” wording following 10cm discussion; use saved project units.
Trace widths are physical mm; check current resizing semantics rather than
assuming every historical version scaled widths identically.

### Contacts / zebra bar

Final contact arrangement moves both COM and SEG contacts below the display:
- 16 COM, then two empty positions, then 48 SEG.
- 1 mm contact width, 1 mm gap, 3 mm length, 2 mm pitch.
- 66 positions centered on the screen.
- Move contacts together using the segment-move tool, not a separate tool.
- Shift locks movement to one axis.

Saved per-contact positions allow the group to be moved. Changing contacts does
not reroute traces automatically; the user explicitly planned to repair wires.
Logical naming: bottom `B-W001..016` = COM, top `T-N001..048` = SEG, even though
both sets of physical contacts now sit below the display.

## EDA exchange: important operational lessons

Application: `/Applications/嘉立创EDA(专业版).app`.
Permanent project: `2_refine_routing/eda/exports/Moida-LCD/Moida-LCD.eprj3`.
No schematic is required. Keep the permanent EDA project in Git; don't replace
it with a procession of timestamped working projects.

- **Open EDA** opens the permanent project without exporting new geometry.
- **Send to EDA** backs up/saves prior work, exports current webpage state to the
  permanent project, and reopens as needed to load changed files.
- **Import from EDA** saves open EDA work first, then brings back **traces only**:
  position, width, net and layer. Preserve webpage slices, shapes, assignments
  and contacts. Ignore temporary vias/test points and EDA segment edits.
- Converter internals retain older full-geometry capabilities. Do not confuse
  that API with the deliberately restricted current webpage workflow.
- Segment/island components export locked to prevent accidental movement.
- EDA selection filters should allow traces and vias, with visibility retained.
  Free-angle routing was requested; inspect current API/settings implementation
  before claiming a particular EDA version honors it.
- Polygon electrodes should retain island IDs for round-trip reference, with
  same-shape top/bottom electrodes and distinct assigned nets.
- Arc traces are rejected on import; error reports include coordinates so the
  user can find and convert them to straight traces.
- Replacing `LCD.epcb2` while a project is open does not immediately update EDA:
  it caches document state until close/reopen. Don't overwrite live unsaved work.
- Evidence dumps and automatic backups are local artifacts, excluded from Git.
  Read `.gitignore` before adding generated directories wholesale.
- Full conductor continuity and driver-specific behavior remain distinct from
  successful file conversion or EDA DRC.

Two historical problems to remember:
1. EDA routing wanted to jump to a corner instead of entering a polygon electrode.
   This prompted investigation of how custom pad/polygon geometry is represented.
   Don't infer physical disconnection merely from the interactive router's choice.
2. Large electrodes had thin seams/splits when exported from EDA to DXF. Direct
   webpage DXF export was developed for edited geometry and factory previews.
   Do not claim that all EDA polygon decomposition is eliminated without checking
   the current exporter/project.

## DXF and factory preview

Webpage exports selectable TOP, BOTTOM and SEGMENT layers, singly or together.
SEGMENT uses edited geometry, including moves, vertex changes and slices.
Top/bottom are registered front-view coordinates, not a mirrored bottom artwork.
Current export uses closed outlines and solid fills with holes handled.

AutoCAD Web initially rejected DXFs as invalid/incomplete. A more complete DXF
structure/template was introduced; use current `dxf.js`/`dxf-template.js`, not an
older minimal writer. The user asked about DWG; direct native DWG capability was
not established here. DXF is the supported interchange output.

Factory comparison files previously supplied:
`Moida-routing 完成出线 COM层.dxf` and `Moida-routing 完成出线 SEG层.dxf` in Downloads.
A one-off bitmap comparison against the webpage was requested; it was explicitly
not required to become a permanent tool. Do not invent a fresh verification result
without rerunning on the exact exported revisions.

## Saved state, latest snapshot and handoff safety

Browser autosave is origin-specific. Version 2 uses `moida-eda-routing-v1` and
stores `{savedAt, project}`; another port/browser can show a different state.
A checked-in initial JSON is not automatically newer than browser autosave or a
recent downloaded checkpoint. Save JSON before major interchange operations.

The runtime preview/LUT currently use the Oct 19-era saved snapshot:
`/Users/deqinguser/Downloads/Moida-routing.moida-routing (1).json`.
Its SHA256 is recorded in `4_game_runtime/recovered/routed-panel.json` and
`4_game_runtime/lcd/mapping.json`. It has 12 cuts, 148 local geometry overrides,
780 routed islands, 631 original game bits and 664 unique assigned electrode pairs.
This was the latest matching saved file found when integrating the simulator;
check with current saved/browser state before calling it the newest future edit.

`localGeometry`, `cuts`, internal cut ancestry, `parentId` and `bit` must survive
save/load and regeneration. User-visible `_subN` names alone are not sufficient
for matching successive cuts. The simulation and LUT use original game bits so
all sub-islands activate together, independent of their electrical pair.

Tests live in `2_refine_routing/eda/test*.cjs` and Python test files. Select tests
for the feature changed (slices, restored geometry, joined traces, zebra, rules,
DXF, HTTP API); do not regenerate/export over a user's project just to inspect it.
