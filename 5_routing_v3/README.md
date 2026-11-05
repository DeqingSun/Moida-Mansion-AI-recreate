# Moida routing v3 — mesh and interactive routing

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

## Interactive routing

1. Click **Route**, then click two individually assigned artwork pieces. Their mesh assignments determine the net: a shared SEG uses the top layer; a shared COM uses the bottom layer. If both match, choose the layer explicitly. Pieces with no common net cannot be connected. Whole-segment highlighting alone does not assign every disconnected piece.
2. Set trace width and clearance in millimeters (defaults: 0.12 mm each; SEG ↔ COM trace clearance defaults to 0.10 mm). The tool previews an automatic path. **Find path** clears manual waypoints and retries automatically.
3. For a preferred path, click inside the desired passages in order after selecting both endpoints. Enable **Live cursor preview** to see a waypoint before clicking to keep it. Add more waypoints as needed; **Remove waypoint** removes the last. Turn guidance off to review the path through your fixed waypoints.
4. Optionally enable **Push nearby artwork inward**. If ordinary routing fails, the solver searches with bounded inward movement, then reshapes only the boundaries near the trace. Amber pieces show proposed changes. The default maximum push is 0.15 mm. If a push splits artwork, it keeps the largest piece and discards small disconnected scraps. The cut and discarded scraps together cannot remove more than 20% of the piece’s area. Mesh contacts, existing trace contacts, and holes remain protected. Thin pieces without a surviving interior are protected. Enable **Push existing traces** to also displace blocking traces. Set a separate maximum trace movement (default 0.30 mm). Endpoints stay fixed; unaffected bends are retained where possible. Amber outlines show moved traces and dashed lines show their previous positions. Both toggles can be enabled together to move traces and trim artwork.
5. Click **Confirm route** to save the trace and its artwork changes together. Previewing never commits. **Cancel preview** or Escape discards the proposal. Undo/Redo includes the whole transaction. **Select trace** lets you click a confirmed trace; the confirmed-routes list is another way to select it. **Remove selected route** removes that trace and restores the geometry derived from the remaining traces. If restoration would invalidate a dependent route, removal is rejected; remove the dependent route first.

Routes are stored in JSON and autosave. Import, assignment edits, slicing, and screen-size changes recheck existing routes; edits that invalidate a saved route are rejected. Remove the affected latest routes before changing their endpoints or assignments.

The solver uses a bounded 8-direction grid search and straight-line shortcuts, with geometric checks on every resulting segment. Search runs in a worker so the interface stays responsive. Failure can mean the search resolution/budget missed a path, not that no route exists. It checks width, clearance from unassigned/foreign-net artwork, foreign-net traces on the same layer, endpoint contact, and the physical screen boundary. Outside same-net artwork, SEG and COM traces must maintain 0.10 mm edge-to-edge spacing across layers, so their exposed portions cannot cross. Their portions inside assigned artwork may overlap as electrode contacts. This separate setting is stored per trace. Legacy traces without it retain their original rule; new routes honor the larger cross-layer clearance of either trace. Artwork push affects the shared displayed shape and protects existing contacts on both layers. Original source artwork is never modified; pushed geometry is derived by replaying saved routes.

This is an initial routing editor, not a complete manufacturing DRC: it does not yet check minimum artwork neck width, contact area, fabrication-specific rules, vias, or full-network connectivity. Review proposed geometry before confirming.

## Change dimensions and save

**Apply size & mesh** changes counts and width. Explicitly dragged points and assignments are preserved; untouched points redistribute across the regular grid. Reducing counts is blocked if it would delete an assigned net. **Reset mesh positions** restores a regular grid without clearing assignments. Width and scale relative to 150 mm are linked; default scale is 0.5.

Edits, resizing, reset, new project, and imports support Undo/Redo. Save JSON for a portable checkpoint; local autosave uses the separate `moida-mesh-v3-v1` key. Autosave is browser- and origin-specific, so keep the same port or load your JSON when changing browsers/ports. The older routing tools’ projects are deliberately not imported. Earlier v3 mesh files (schemas 1 and 2) migrate to schema 3, which also stores automatic-slice anchors and the slice gap; existing dimensions, assignments, and bends are preserved.

## Current scope

Implemented: configurable mesh, individual intersection deformation, island/whole-segment pair assignments, pair uniqueness, search, pan/zoom, size setup, save/load, autosave, and undo/redo.

Not yet implemented: manual slice drawing, manual row/region deformation controls, general topology repair, fabrication contact design, full-network autorouting. New mesh drags are checked for crossings and folds, but mesh lines are still not fabrication geometry. Assignment statistics do not imply connectivity. No EDA integration is required.

See [research and proposed specification](ROUTING_V3_RESEARCH.md) for the next phases. Fresh project defaults here supersede the older 48 × 16 and 150 mm working reference.

## Verification

```sh
node 5_routing_v3/routing.test.cjs
node 5_routing_v3/routing-browser.test.cjs
node 5_routing_v3/model.test.cjs
node 5_routing_v3/bends.test.cjs
node 5_routing_v3/group.test.cjs
node 5_routing_v3/slices.test.cjs
node 5_routing_v3/slice-browser.test.cjs
node 5_routing_v3/browser.test.cjs
```

The browser test needs the local server above, Playwright (set `PLAYWRIGHT_MODULE` if necessary), and Google Chrome at the path in the test. It uses a fresh temporary browser context and does not modify the user's saved project. Tests cover pair conflicts, sibling reuse, protected resizing, validation, drag assignment, undo/redo, scaling, autosave, JSON round-trip, automatic reshaping, crossing rejection, pinned pairs, and Escape cancellation.

The bend regression uses the saved S3/C16 case: rightward moves that fail with straight edges must pass with bends, preserve all other intersections, survive serialization and subsequent dragging, and still reject coincident pinned nodes.

Confirmed traces hide the corresponding mesh edges between their assigned intersections on that layer. The other layer and the rest of the mesh remain visible. Removing a trace (or undoing its confirmation) restores its guides unless another confirmed trace covers them. The underlying mesh remains intact for editing and topology checks.

Trace clearance applies to path portions outside artwork assigned to the same net on the routing layer. Inside that artwork the trace adds no clearance margin, but its physical width still cannot overlap foreign-net artwork or a foreign-net trace on the same layer. Cross-layer trace spacing compares only exposed portions outside their assigned artwork. Boundary crossings, concave shapes, and holes split the path into inside/outside portions. Push uses the same rule and the preview halo shows the outside clearance.

## Adjust automatic slices

Choose **Edit slices**, then click a cyan divider or choose it from the slice list. Set its gap width in millimeters and use **Apply slice**. Drag either endpoint to adjust position and angle, or enter the two endpoint coordinates in millimeters. The divider extends across the island; its endpoints are line controls rather than a finite cut that could leave pieces connected. Dragging previews the changed artwork; release commits a valid edit, Escape cancels. **Reset automatic** restores the mesh-derived divider.

Edits preserve mesh contacts and revalidate saved routes. Invalid edits are rejected. Adjustments are stored per original island and mesh-point pair, survive save/load and Undo/Redo, and are removed when that pair no longer exists. Moving mesh points can be rejected if a saved divider would no longer separate them; reset that divider first.

Right-panel sections fold automatically when switching tools. Click any section summary to expand it manually.

### Trace push limits

Trace push first attempts ordinary routing. If blocked, it reserves the waypoint-guided path and replans up to eight obstructing traces within their individual movement corridors, trying both processing orders. The complete result is rebuilt from original sliced artwork and rechecked after all trimming. If no valid arrangement is found, the preview cannot be confirmed. This is a bounded local search, not a guarantee that every feasible arrangement will be found. Existing trace endpoints are fixed.

Confirming commits the new route, displaced traces, and artwork trim in one transaction. Undo restores all of them together; Redo reapplies them. Save/load preserves the adjusted routes. Removing just the new route later keeps the confirmed positions of the other traces and rebuilds artwork for those remaining routes.

## Fine-tune a confirmed trace

Use **Select trace** (or the confirmed-routes list), then **Edit selected route**. Drag an existing bend, or double-click a trace segment to insert a bend. Single-clicking or dragging an unmarked section does not add points. You can also drag either endpoint within its original assigned artwork piece. The piece and net stay fixed; endpoints outside the piece cannot be confirmed. Dragging and release show an unchecked wire-width and clearance-band preview without running the router. Press Enter or Confirm changes to check and save the exact path. The edited trace never gains automatic bends; invalid paths remain uncommitted. Enable **Push existing traces** and/or **Push nearby artwork inward** if you want those adjustments included. The existing movement and trim limits apply.

Press **Enter** or **Confirm changes** to replace the selected trace in place. No duplicate trace is added. Escape cancels the edit. Undo/Redo covers the edited trace, any displaced neighbors, and artwork restoration together. Edits survive autosave and JSON save/load.

Each edit rebuilds artwork from the original geometry plus current automatic/manual slices and the revised routes. Trim abandoned by the edited trace restores automatically; cuts still needed by other confirmed traces remain. The preview reports how many pieces regained artwork. If restoring or rerouting would break another trace's clearance/contact and no valid push arrangement is found, the edit is rejected.

Routing disconnected sibling pieces: an unassigned piece can inherit its original segment’s unique assigned SEG/COM pair when selected as a routing endpoint. The assignment is staged with the preview and saved only on confirmation; Cancel leaves it unchanged and Undo restores both assignment and route. When both SEG and COM are shared, choose the desired layer explicitly. Segments with multiple assigned pairs and unassigned automatic slice regions require explicit mesh assignment first.

### Manual artwork editing

**Move segment** drags all islands of the selected original segment together. Hold Shift to constrain the move horizontally or vertically. Anchored mesh points, adjusted slice endpoints, and attached trace endpoints follow. **Edit vertices** selects an island and shows square handles for its original outline, including hole boundaries; drag a handle to reshape it. Automatic slice boundaries remain editable with **Edit slices**. Dragging only updates the visual outline and handles; geometry, contact, and routing checks run on release. Release applies a valid edit; Escape cancels. Both tools support Undo/Redo and JSON/autosave persistence.

Manual geometry is stored before automatic slicing and trace trimming, so removing or adjusting traces restores artwork to the manually edited outline. Existing routing/trace-edit push controls remain available. Shape edits recheck existing trace clearance and contacts and retain their paths except for attached endpoints following segment movement; an edit that cannot preserve those checks is blocked. Move the obstructing trace with **Edit selected route** and its push controls before retrying. Crossing polygon edges, lost holes, offscreen artwork, and reduced artwork spacing below 0.10 mm are blocked (pre-existing smaller gaps may remain unchanged).

Enable **Original shadow** to show a faint fill and dashed outline of the source artwork behind edited shapes. In **Edit vertices**, click a handle to select it (cyan outline), then press **Delete/Backspace** or **Reset selected vertex** to remove that vertex’s displacement. The vertex itself is retained; other vertex edits and segment movement remain. Reset is checked before applying and supports Undo. New edits save segment offsets explicitly; older shape saves infer translation from the median vertex displacement. The overlay and handle previews perform no validation while dragging.

The manual trace clearance band shows the configured same-layer spacing along the full path as a visual guide; the final check applies the artwork-interior exemption and separate SEG/COM clearance rule. Enabled neighboring-trace pushing and artwork trimming run on confirmation.

Slice endpoint dragging uses cached divider geometry and updates only the guide line and handles. Slicing, artwork validation, and route checks run on release, not on pointer movement. Invalid releases leave the project unchanged; Escape cancels the preview.

Discarded push fragments are derived from the route, not permanently erased from the source artwork. Removing or moving the route restores them wherever remaining routes no longer require the cut.

### Local validation and full checks

Route replay, trace-edit confirmation, and artwork/slice changes reuse validation results for unchanged trace neighborhoods. Each trace checks nearby artwork and traces within conservative width/clearance bounds; its cache key includes local geometry, assignments, mesh contacts, existing endpoint contacts, scale, and trace settings. Changed geometry or contacts invalidate reuse, including changes caused by other routes. Global path searches can still explore beyond a neighborhood, and broad edits may invalidate many neighborhoods. **Check workspace** additionally bypasses local reuse and validates all trace geometry and mesh topology from scratch.

Adjusted slices now use finite, flat-ended cuts: the handles set the actual cut extent. A short cut that leaves both mesh contacts in one connected region is rejected on release instead of being extended. Existing saved slice edits retain their previous behavior until a divider on that source island is adjusted; the island then uses finite cuts. Original automatic slicing remains unchanged until adjustment.

A same-parent group sharing one mesh pair and connected only by internal sibling traces can be reassigned together. Moving its mesh anchor off artwork retains the group's electrical assignment until a new mesh pair is placed on a member. Both SEG/COM internal route nets then follow the new pair while paths remain unchanged. External connections, multiple original pairs, other active anchors, and final clearance/contact checks prevent incompatible reassignment.

### Bottom electrode contacts

Choose **Bottom electrodes → Add bottom electrodes** to add the centered contact row to an existing project. Left to right: COM 1–16 (bottom layer), one empty position, SEG 1–60 (top layer). The 77 positions have 1 mm pitch, 0.5 mm contact width, 0.5 mm edge gaps, and 3 mm length. The 76.5 mm outer span is centered on the screen; at 75 mm screen width it overhangs each side by 0.75 mm. Initial gap below the screen is 3 mm, matching the previous tool.

Drag any contact in Bottom electrodes mode to move the group vertically, or enter its gap below the screen (0–100 mm). Horizontal centering is fixed. Dragging only previews; release validates the change. Attached trace endpoints follow, and invalid movements are rejected. Undo/redo and JSON preserve the row. Use Route to connect assigned artwork to the matching contact; the layer is inferred from that contact. Contacts have fixed nets and cannot be trimmed by artwork push. The routing area and Fit screen include the contact row.

### Measure passage capacity

Choose **Measure gap**, then click two pieces. The gold line marks their nearest edges, using current slices and pushed geometry. The panel and canvas show millimetres and estimated trace capacity. Enable **Measure whole original segments** to include every island of each selected original segment. A third click starts a new pair; Clear measurement clears the selection. Measuring does not modify the project.

The rule matches the previous tool: 0.12 mm trace width, 0.12 mm between traces, and 0.12 mm to each artwork edge. Capacity is `max(0, floor((gap − 0.12) / 0.24))`; one trace needs 0.36 mm and two need 0.60 mm. This is geometric capacity between the selected shapes, not a routing guarantee or a count of free lanes after existing traces and other obstacles.

### Walk around wires while editing

Select a trace, choose **Edit selected route**, then enable **Walk around wires when dragging a section**. Drag the middle of a line section. Pointer motion is a lightweight preview; release runs a local worker search along clearance-offset contours and adds bends around obstructions. Contacts remain fixed and neighboring wires do not move. The contour includes a 0.005 mm numerical margin beyond the applicable clearance. Both same-layer and SEG/COM spacing are checked against the resulting geometry before confirmation.

The result remains a preview: Enter confirms, Escape cancels. Drag handles to refine it, double-click a line to insert a bend, right-click a bend to remove it, or select a bend and press Delete/Backspace. Endpoints cannot be removed. With no bend selected, Delete removes the last waypoint. Walk-around is opt-in; ordinary manual editing does not insert points automatically. Search is bounded to nearby contours (2 mm around each affected leg); excessively dense or blocked passages produce an error and retain the draft instead of saving an invalid route.

### Play the edited artwork in the simulator

Use **Export simulator JSON** to save `Moida-v3-simulator.json`. It contains the current moved, vertex-edited, sliced, and route-trimmed artwork with the original game-bit mapping. It excludes mesh guides, traces, and connector pads. Keep **Save JSON** for the separate editable routing project.

Run `python3 4_game_runtime/serve.py --port 8767`, open `http://127.0.0.1:8767/4_game_runtime/live.html`, and choose **Load routed artwork**. Load the simulator JSON, then Start / Reset. All pieces of an original segment follow its game bit. Show all segments provides an all-on visual inspection; uncheck it to return to gameplay. Restore default artwork switches back without restarting the game. Imported artwork is kept for the current page session; reload it after a page refresh.

This is an optical preview of shapes and animation, not an electrical connectivity or multiplexing simulation. Unwired pieces still follow their original game bit. The loader validates geometry and all 631 original bit mappings before replacing the display; invalid imports leave the existing artwork intact.
