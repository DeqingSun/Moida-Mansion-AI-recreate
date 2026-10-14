# Current scale: 150 × 108 mm

The tool now opens at 150 mm wide. Existing 100 mm refinement autosaves and imported files are validated and uniformly scaled by 1.5, preserving net assignments, island edits and slice-removal history. Native geometry coordinates stay unchanged; wire widths, pads and snap spacing scale physically. A separate 150 mm autosave preserves the old 100 mm backup. Exports are named `Moida-refinement-150mm.json`. The bundled 100 mm source is retained as the migration baseline. Design rules remain 0.12 mm width/same-layer clearance and 0.10 mm opposite-layer/island movement clearance.

The following notes document the initial 100 mm version and subsequent features.

# Routing refinement — 100 mm

Open `http://127.0.0.1:8765/2_refine_routing/index.html` when serving the repository root.

This tool starts from `../1_preliminary_routing/routing-editor/Moida-routing.moida-routing_finished.json`, with 780 current islands/pieces and 1,562 traces. The original file and preliminary tool remain unchanged. Island and connector nets, cuts, display dimensions and wanted-overlap areas are frozen. Wires can be edited; there is no matrix widget. Refinement autosave uses its own browser storage, separate from the preliminary tool.

The finished design is uniformly scaled from 150 mm to 100 mm wide (100 × 72 mm active area). All physical dimensions scale by 2/3: 0.1 mm traces become 0.0666667 mm and 1.8 mm pads become 1.2 mm. Settings for clearance and snap spacing scale too. Artwork coordinates, trace centerlines, cuts and wanted-overlap rectangles retain native coordinates; their physical scale is set by widthMm, so their physical sizes also shrink by 2/3. The starting design has no widened or rerouted wires. The scaled widths are below the vendor's 0.12 mm track-width figure in the root notes; resizing alone is not manufacturing refinement.

Click two islands (or choose their IDs) to find the minimum Euclidean distance between the final polygon shapes. The tool highlights both shapes, marks the closest points, draws the measurement line, and reports millimetres, micrometres and endpoint coordinates measured from the display's top-left corner. Holes and trimmed/sliced shapes are included. Touching, intersecting or contained filled shapes have zero separation. Traces/pads are excluded from this island-only measurement. Multiple equally close locations may exist; one minimizing pair is shown.

Wheel zooms around the cursor. Right/middle drag or Space + left drag pans. Zoom to pair frames the nearest points. Top/bottom trace visibility can be toggled independently. Save 100 mm JSON downloads the scaled design, for this refinement tool (island edits are not supported by the preliminary tool). `routing-100mm.json` is the same design on disk; `starting-project.js` bundles it for the page without fetching.

Verification: `cd 2_refine_routing && node test.cjs`. Checks known parallel/diagonal distances, touching, containment, holes and proportional scaling while preserving nets and native geometry. Browser checked selection, measured coordinates and zoom-to-pair rendering.

## Wire editing

Choose the active layer and an existing net. **Add wire** places a vertex on each click; Enter or Finish wire commits it, and Escape cancels. **Modify wire points** selects a wire, then lets you drag its vertex handles. Change its width and click Apply width to resize it. **Delete wire** removes the clicked wire; Delete selected also works. The selected wire keeps its net and layer. Snapping targets pad centers, existing wire vertices and the scaled grid; hold Alt to bypass it.

Undo/Redo covers committed edits and loads. Save JSON exports the current design; Load JSON accepts only designs with the same frozen assignments, pads, settings, cuts and wanted-overlap regions. Existing original wire IDs cannot change net or layer. Autosave restores edits on this browser origin; export JSON for a portable backup.

A background checker compares each net's connected groups of islands and edge pads with the original finished routing. Splits, merges, floating wire groups and changed same-layer shorts cause a warning. Temporary topology changes are allowed so a route can be rebuilt; undo or repair until the checker reports preserved topology. The baseline is always the bundled finished routing, not the latest loaded file. Clearance and unwanted-overlap findings are reported separately, including pre-existing issues in the scaled design. A preserved-topology result is not manufacturing approval.

Additional verification: `node test-topology.cjs` checks disconnection, preserved connectivity after a bend, shorts, floating wires and rejection of frozen-net changes.

## Island geometry and clearance rules

Top-bar **Move island** drags one island, identically on both electrodes. Wires do not follow. **Edit island vertices** selects an island and exposes its vertices: drag a handle to reshape it. Click a vertex, enter a corner setback in millimetres, then **Cut selected corner** replaces a convex corner with a bevel; the setback is measured along each adjacent edge. **Remove selected vertex** joins its neighbors directly. Invalid, empty, crossing or disconnected shapes are rejected. Nets and island identities remain fixed; connectivity changes still warn.

Edits participate in undo/redo, autosave and JSON save/load as `islandEdits`, applied after the original cuts. Use this refinement tool to reopen these exports: the preliminary editor does not understand this extension.

Checks use 0.12 mm minimum wire width, 0.12 mm separation between different same-layer nets, and 0.10 mm opposite-layer separation inside the display, outside island shapes and wanted-overlap regions. Spacing is edge-to-edge. Same-net conductors may join. Existing wire widths are retained and flagged; new wires default to 0.12 mm. These are the requested project rules, not independently confirmed vendor specifications. Opposite-layer clearance uses polygon expansion and reports the violation region; geometry rounding uses the existing precision. Run `node test-shapes.cjs` for translation, corner, persistence and rule-threshold checks.

## Removing original slices

All remaining original slices are always drawn as dashed magenta centerlines with a faint band showing their cut width, at their original artwork coordinates. Use **Remove slice** in the top bar to select one on the canvas, or choose it in the Original slices list. **Remove selected slice** restores the unsliced shape and removes dependent child cuts. Undo/redo, autosave and JSON export include removal history (`removedSlices`, indexed against the bundled baseline).

Removal preserves frozen nets: it is rejected when merged pieces have different top or bottom assignments. It is also rejected if it would discard geometry edits on affected pieces; unrelated edits are remapped by their internal cut identity. Connectivity and clearance are checked after removal. Run `node test-slices.cjs` to verify restoration and these protections.

The original unsliced artwork is always rendered behind the current layout in muted gray with dashed outlines. This reference stays fixed through island movement, vertex edits and slice removal; it is visual only and does not participate in selection, measurement, topology or clearance checks.

Move island has a “Keep ≥ 0.10 mm from other islands” checkbox (on by default). It checks edge-to-edge distance against current islands, including same-net islands, and retains the last allowed preview position when blocked. It checks placements, not a swept collision path. Existing close positions are not automatically fixed; disable the option to place freely. Wires, pads and original background artwork are excluded from this movement constraint; the normal routing checks still run.

**Widen to 0.12 mm** in the top bar raises a clicked wire on the active layer to 0.12 mm. Already wider wires are left unchanged. Each change is undoable, autosaved, and checked for connectivity and clearance.
