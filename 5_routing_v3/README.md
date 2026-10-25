# Moida routing v3 — mesh assignment

A fresh browser tool for planning LCD electrical pairs. Starts from the original artwork, with **60 SEG × 16 COM**, **75 × 54 mm**, and no inherited routing or assignments. This is half the previous width and height, one quarter of the area. Screen scale does not establish routing feasibility or scale down physical clearance requirements.

## Open

From the repository root:

```sh
python3 -m http.server 8773 --bind 127.0.0.1
```

Open [the mesh editor](http://127.0.0.1:8773/5_routing_v3/). It reads the original artwork from `../2_refine_routing/segments-data.js`; no EDA app or bridge is needed.

## Assign nets

1. Choose the screen width and SEG/COM count in the startup panel. Height follows the original 25:18 aspect ratio.
2. In **Drag mesh**, drag an intersection onto an island. Its column is the SEG/top net; its row is the COM/bottom net. Dropping over empty space moves only the guide.
3. Enable **Assign all islands of this segment** to apply a pair to every original island belonging to that game bit. Otherwise only the dropped-on island is assigned.
4. Alternatively, use **Select artwork** or search an island ID, choose SEG and COM numbers, click **Select intersection**, then **Assign selected artwork**. This is also useful for assigning the same pair to disconnected sibling islands without relocating its main mesh point.
5. Use **Clear assignment** with the same single-island/whole-segment scope. Dropping an assigned intersection onto another original segment, or using **Assign selected artwork**, transfers the pair: all previous-owner islands using that pair become unassigned. Other pairs are unaffected. Undo restores the whole transfer. Different original segments cannot own the same pair simultaneously. Different pieces of one original segment may share it or use different pairs.

Dragging first tries moving only the selected intersection. If straight connections would cross, the tool tries bending the mesh edges while keeping every other intersection fixed. Connections are adaptively sampled polylines, and the checker tests the actual bent edges and cell boundaries. If that local bend search fails, it tries reshaping surrounding unassigned points, keeping assigned pairs fixed. Legitimate shared endpoints are allowed; other crossings, touches, overlaps, and collapsed/folded cells are rejected. If no valid shape is found, conflicting edges turn red and a live warning explains the failure. Releasing an invalid preview cancels the entire drag; Escape also cancels. A successful drag, its bends, and any automatic neighbor movements form one undo step. After each valid drag, the complete mesh is optimized to a stable result. It tries joint straightening, repeated individual straightening, adjacent-pair straightening, and shortcuts within necessary detours. Changes are validated against the whole mesh; a second optimization should make no further change. This is a topology-safe shortcut optimizer, not a proof of the globally shortest layout. Full optimization runs on release rather than each pointer event. Existing saved projects are simplified when resumed or loaded; **Optimize all connections** also runs this check manually. Automatic simplification on resume is undoable. Bends survive autosave, JSON save/load, and subsequent drags. Reset mesh positions clears bends as well as moved points.

The local bend search is bounded (500 native units per proposal, 240 integration steps, and a saved-geometry budget); larger or obstructed moves may need smaller drags. This is a bounded reshaping heuristic: failure means it did not find a valid arrangement, not that every possible arrangement is impossible. Older saved meshes with crossings can still load and display a warning; reset mesh positions or repair them before proceeding.

The active row and column are highlighted. Assigned artwork is green; selected artwork is gold. Dashed guides show the active pair’s island anchors. Wheel zooms, Space-drag or middle-drag pans, and **Fit screen** restores the overview. Escape cancels an in-progress mesh drag.

## Move a group of mesh points

Choose **Box select mesh**, then drag a rectangle in either direction. Selected points turn cyan. Drag any highlighted point to translate the group; Shift-drag a new box to add points. **Clear selection** clears the group. Escape cancels an active move or box.

Group movement preserves relative point positions; on drop, moved points update their island placements and automatic slices. Unselected intersections stay fixed. Existing bends follow their endpoints; successful moves optimize connections and save as one Undo step. Group drops now assign the moved points to artwork underneath them and split islands when multiple points land on one island. Crossings show a warning and are cancelled on release. Mesh points and bends may extend outside the screen for temporary staging; this does not enlarge the physical LCD. **Fit mesh** shows all parked points and the screen together, while **Fit screen** focuses on the artwork. Off-screen positions survive save/load. Unlike individual-point dragging, group moves currently do not automatically deform neighboring intersections to make space.

## Automatic slices

When two or more deliberately placed mesh points occupy the same original island, the editor divides the artwork into regions nearest each point, separated by a **0.10 mm gap**. Each resulting piece gets that point’s SEG/COM pair and retains the original game bit. The original artwork is never overwritten. Concave artwork may create additional disconnected pieces sharing a pair.

Moving points within the island updates its slices. Moving a point away, or clearing its assignment, removes that anchor and recomputes the pieces. One remaining point restores the entire original island with that pair; zero restores it unassigned. Adding points again creates fresh slices, rather than stacking cuts on top of older cuts. Points merely present in the initial regular grid do not count as intentional placements. Legacy assigned points physically on an island are adopted when editing placements.

Single-point drops and box-group drops use the same rules. If the gap would erase a contact area or the points are too close, the entire drop is rejected and the prior geometry is preserved. Slices, assignments, and mesh movement are one Undo/Redo transaction and survive save/load. This is geometric segmentation, not proof of conductive routing or manufacturability.

## Change dimensions and save

**Apply size & mesh** changes counts and width. Explicitly dragged points and assignments are preserved; untouched points redistribute across the regular grid. Reducing counts is blocked if it would delete an assigned net. **Reset mesh positions** restores a regular grid without clearing assignments. Width and scale relative to 150 mm are linked; default scale is 0.5.

Edits, resizing, reset, new project, and imports support Undo/Redo. Save JSON for a portable checkpoint; local autosave uses the separate `moida-mesh-v3-v1` key. Autosave is browser- and origin-specific, so keep the same port or load your JSON when changing browsers/ports. The older routing tools’ projects are deliberately not imported. Earlier v3 mesh files (schemas 1 and 2) migrate to schema 3, which also stores automatic-slice anchors and the slice gap; existing dimensions, assignments, and bends are preserved.

## Current scope

Implemented: configurable mesh, individual intersection deformation, island/whole-segment pair assignments, pair uniqueness, search, pan/zoom, size setup, save/load, autosave, and undo/redo.

Not yet implemented: manual slice drawing, manual row/region deformation controls, general topology repair, physical contacts, conductive traces, clearance-aware routing, segment push, or selective autorouting. New mesh drags are checked for crossings and folds, but mesh lines are still not fabrication geometry. Assignment statistics do not imply connectivity. No EDA integration is required.

See [research and proposed specification](ROUTING_V3_RESEARCH.md) for the next phases. Fresh project defaults here supersede the older 48 × 16 and 150 mm working reference.

## Verification

```sh
node 5_routing_v3/model.test.cjs
node 5_routing_v3/bends.test.cjs
node 5_routing_v3/group.test.cjs
node 5_routing_v3/slices.test.cjs
node 5_routing_v3/slice-browser.test.cjs
node 5_routing_v3/browser.test.cjs
```

The browser test needs the local server above, Playwright (set `PLAYWRIGHT_MODULE` if necessary), and Google Chrome at the path in the test. It uses a fresh temporary browser context and does not modify the user's saved project. Tests cover pair conflicts, sibling reuse, protected resizing, validation, drag assignment, undo/redo, scaling, autosave, JSON round-trip, automatic reshaping, crossing rejection, pinned pairs, and Escape cancellation.

The bend regression uses the saved S3/C16 case: rightward moves that fail with straight edges must pass with bends, preserve all other intersections, survive serialization and subsequent dragging, and still reject coincident pinned nodes.
