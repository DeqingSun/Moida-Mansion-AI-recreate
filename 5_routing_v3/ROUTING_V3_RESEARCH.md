# Routing tool v3: research and proposed specification

Date: 2026-10-23. Repository inspected at `8cc3219`.

Implementation update: the first mesh-assignment editor is now available in this folder; see [README.md](README.md). The user selected a fresh **60 SEG × 16 COM** planning mesh and a provisional **75 × 54 mm** screen (0.5× both dimensions). Mesh dimensions remain editable. Historical 48 × 16 and 150 × 108 mm values below describe the earlier tool, not v3 defaults.

## Recommendation

Build a separate, self-contained browser routing tool that starts a completely new routing project from the original artwork. Reuse suitable geometry, checking, and export code from the refinement tool, but do not inherit its finished routing or frozen assignments. Add a startup size setup, an editable electrical-topology mesh, clearance-aware interactive routing, optional local inward deformation of segment outlines, and preview-only routing of selected connections.

The most valuable foundation is a shared routing engine that understands the LCD’s two electrode layers. Interactive routing and selective autorouting should use the same constraints. Segment deformation should follow after that engine is reliable because it changes visible artwork and can break existing connections.

### Confirmed direction after research

The user clarified that this tool starts routing **from scratch**. Initialize with original segment artwork, unassigned electrical pairs, and no traces or inherited shape edits. Previous routing is historical reference only. Choose the physical scale at startup, then establish assignments and routes through the new workflow.

The browser tool should provide EDA-quality routing interaction and checks itself. EasyEDA integration is not required for this version and is outside the initial implementation scope. Manufacturing exports remain useful independently of an EDA application. “EDA-quality” is a target to validate through actual routing behavior, not a claim that the current code already meets it.

Build incrementally and add or adjust features while using the tool. The phases below describe dependencies, not a fixed feature set that must all ship before the tool becomes usable.

This document records the research and broader proposed implementation contract. The mesh-first implementation status is tracked in README.md. Proposed defaults below are recommendations, not previously approved requirements.

## What the other agent already did

I inspected the chat **Map Moida Mansion LCD segments**, including its latest routing handoff, and cross-checked the relevant local implementation. The chat produced [ROUTING_HANDOFF.md](../ROUTING_HANDOFF.md), which is the fuller historical record. Older guides sometimes describe superseded behavior.

| Area | Existing work | Implication for v3 |
|---|---|---|
| Preliminary routing | Two-layer manual drawing, assignment, slices, undo, save/load, overlap exceptions, connection checks | Use the manually routed project only as a historical reference |
| Refinement | Frozen nets, geometry overrides, segment movement, individual vertex edits, slice adjustment, trace adjustment | Reusable code; remove frozen-assignment assumptions from the new workflow |
| Scale | `widthMm` setting, native 3000 × 2160 artwork; physical trace widths preserved when size changes | Add a deliberate startup workflow and explicit scaling semantics |
| Grid | Physical snap grid plus a small 5 × 5 viewport into the 48 × 16 electrical matrix | Neither is the requested deformable, assignable mesh |
| Clearance | Polygon-based checks in a worker; manual shape edits reject invalid polygons and insufficient segment spacing | Reuse checks, but current trace drawing does not actively walk around obstacles |
| Push behavior | Manual vertex edits and segment moves | No automatic inward deformation during routing found |
| Autorouting | Historical directional search experiment | Research material only; not an acceptable completed router |
| Exchange | EasyEDA bridge, trace import, SVG/DXF exports | Reuse direct manufacturing exports; EDA exchange is outside initial scope |

### Existing code worth reusing

- [editor.js](../2_refine_routing/editor.js): drawing, selection, undo, autosave, revision tracking. `addDraftPoint` adds manually selected points; `applySettings` preserves physical trace widths.
- [project.js](../2_refine_routing/project.js): validation and version migration, native coordinates, slices, contact layout and geometry reconstruction.
- [frozen-nets.js](../2_refine_routing/frozen-nets.js): stable ownership through slice ancestry.
- [geometry.js](../2_refine_routing/geometry.js) and [check-worker.js](../2_refine_routing/check-worker.js): conductor geometry, physical connectivity, shorts, spacing and unwanted optical overlap.
- [shape-edit.js](../2_refine_routing/shape-edit.js): manual outline editing and before/after visualization. Current edits leave traces fixed; they are not a connection-preserving shove operation.
- [net-grid.js](../2_refine_routing/net-grid.js): electrical-matrix display concepts.
- [dxf.js](../2_refine_routing/dxf.js), [eda-client.js](../2_refine_routing/eda-client.js), and [EDA documentation](../2_refine_routing/eda/README.md): interchange support.

### What failed before

The [directional-routing report](../1_preliminary_routing/output/orthogonal-routing/README.md) reports 3,047 forbidden overlap regions and 1,615 shorted net pairs in its selected result. It used an older 2,048-pad model, 0.05 mm traces, and 0.05 mm clearance. Its routes reached the pads geometrically but were not electrically valid. These are historical reported results, not measurements rerun for this document.

Do not adapt its scoring by simply giving shorts a larger penalty. For the new router, shorts and forbidden clearance violations must make a candidate invalid; length and bend count should rank only valid candidates.

Prior repairs also exposed lost slices, accidental net reassignment through touching traces, and stale saved-state assumptions. V3 must preserve slice ancestry, explicit ownership, and the selected source snapshot.

## Electrical and geometry constraints

There are 631 original game bits, with islands and sliced pieces beneath them. The working electrical matrix has 48 top nets × 16 bottom nets = 768 possible pairs. Multiple pieces of one original segment may share a pair or use different pairs; two different original segments must not share the same pair.

An assigned pair does not prove a conductive path to the contacts. Show assignment completeness and physical connectivity separately.

Current recorded rules are:

| Constraint | Value |
|---|---:|
| Minimum trace width | 0.12 mm |
| Different-net same-layer trace spacing | 0.12 mm |
| Different-net segment-to-trace spacing | 0.12 mm |
| Segment-to-segment spacing used by manual shape edits | 0.10 mm |
| Opposite-layer trace spacing outside allowed overlap areas | 0.10 mm |
| Pad-to-pad spacing target | 0.10 mm |
| Linear comparison tolerance | 0.0001 mm |
| Ignored individual unwanted-overlap area in existing checker | Below 0.0001 mm² |

There is also a configurable general clearance in the current checker. V3 should consolidate the general and specialized rules into one typed rule table so the router and checker cannot disagree. Same-net attachment is permitted where it establishes the intended connection; opposite-layer behavior still needs LCD-specific evaluation.

Top/bottom overlap inside a segment is intentional. Overlap outside artwork inside the active display can create unwanted visible marks. Ordinary PCB same-layer DRC is insufficient. Existing checks do not establish ITO resistance, optical behavior, or minimum artwork neck width.

## 1. Set size and scaling at the beginning

Start with **New from original artwork**; **Resume v3 project** restores only work saved in this new tool. The setup panel should show physical width, linked height, and scale relative to a clearly stated reference. Use 150 × 108 mm as the scale reference, with the user’s provisional startup default of 75 × 54 mm (s = 0.5).

For scale factor s relative to that reference:

- Width = 150s mm; height = 108s mm.
- Millimetres per native unit = width / 3000.
- Camera zoom remains independent of manufacturing scale.

Preserve physical trace widths, clearance rules, and standard contact dimensions by default. The zebra layout uses 1 × 3 mm contacts at 2 mm pitch; resizing artwork does not mean shrinking these contacts. Explicitly preview how contact positions and saved overrides are treated, since the current model mixes native positions with physical pad dimensions.

For a resumed v3 project, show its stored dimensions first. Changing scale must trigger a full check and identify disconnected contact endpoints or newly blocked channels. Do not silently relocate/reroute saved traces. Save the reference size and scaling policy in the new schema.

Acceptance: choosing s = 0.8 gives 120 × 86.4 mm while a 0.12 mm trace remains 0.12 mm; save/reload reproduces dimensions and contact placement.

## 2. Draggable topology mesh and intersection assignment

Interpret the requested mesh as a deformable overlay of top-net columns and bottom-net rows. Each intersection represents an electrical pair, not a physical copper junction between layers.

Users can show/hide the mesh, drag intersections or control points, pin anchors, and drop an intersection onto a segment, island, or sliced piece. Highlight the affected row/column, display its net names, and show ownership conflicts before committing. Offer local focus so all 768 intersections need not dominate the canvas.

Keep three concepts separate:

1. Physical snap grid: a placement aid measured in millimetres.
2. Electrical mesh: pair assignments and routing guidance.
3. Routed conductors: geometry that passes checks and reaches contacts.

Mesh edges are suggestions until routed. Preserve row/column identities and adjacency when dragging; flag folds or same-layer crossings rather than treating a deformed mesh as automatically routable.

### Fresh assignment workflow

Start with all pairs unassigned. Dropping an intersection assigns its pair after collision checks. Allow assignment to one piece or all pieces of an original segment through an explicit scope choice. Do not import the old tool’s frozen-net authority or infer assignment merely because a trace touches an island.

Once routes exist, explicit reassignment must preview affected conductors and invalidated connections. Users may lock completed assignments, but locking is a new-project editing control, not an inherited constraint from the old routing.

Repeated islands can share a pair but occupy different physical places. Support multiple physical anchors for a single logical pair; do not require one intersection position to represent every sibling island. Store bindings using stable identity/lineage, not only renumberable `_subN` labels. Splits must transfer bindings deliberately, and conflicting joins must be rejected.

Acceptance: a duplicate pair on different original segments is blocked; sibling reuse works; a mesh-only edit changes neither artwork nor conductive paths; bindings survive repeated slice/save/reload operations.

## 3. EDA-style contour routing with enforced clearance

Select a net and start from its island, pad, or connected trace. Move the pointer to preview a route around nearby contours. Click to anchor waypoints; finish at a compatible target. When no legal path exists, stop at the last valid preview and explain the limiting gap. Never silently reduce width or clearance.

Use free-angle straight polylines for contour following initially, with optional angle constraints. This aligns with current straight-trace interchange and avoids introducing unsupported arc imports.

Proposed engine:

- Build obstacle geometry for the active layer, with the opposite-layer optical exclusions handled separately.
- For a polygon obstacle, offset its filled boundary by half the new trace width plus required clearance. For another trace’s centerline, include both half-widths plus clearance.
- Search legal space around these offsets, using a local visibility graph or adaptive grid with A*. A coarse grid can suggest a corridor, but cannot certify narrow-gap legality.
- Allow controlled entry into compatible same-net targets. Preserve holes and concavities.
- Simplify a candidate only if its swept conductor remains valid; validate the complete proposed delta before commit.

A single 0.12 mm wire between two foreign segment boundaries requires 0.12 + 0.12 + 0.12 = **0.36 mm**. For N such wires, the planning width is `(2N + 1) × 0.12 mm`, before bend and local-shape constraints.

Acceptance: route around convex and concave obstacles, enter a compatible polygon away from a corner, reject a too-small channel, and catch opposite-layer unwanted overlaps. Preview and committed geometry must obey identical rules.

## 4. Optional inward segment deformation during routing

This feature goes beyond ordinary trace shove: the user wants visible segment vertices to retreat inward when a route needs room.

Provide an **Allow segment deformation** toggle, off by default. Keep trace shoving as a separate option so users can independently allow movement of existing wires and changes to artwork. Support locked segments and a bounded editable region.

During routing, preview the original outline, proposed outline, and trace together. The geometry change should be local to the obstruction. Define maximum vertex displacement, maximum area loss, and minimum surviving neck width as explicit settings; acceptable values still need product/factory decisions.

A proposed deformation must:

- Keep the new filled region within the old filled region for inward-only behavior.
- Preserve holes, connectivity, logical bit identity, slice ancestry and assigned pairs.
- Reject self-intersections, collapsed pieces, unintended splits, and thin necks.
- Check both electrode layers because the artwork shape is shared.
- Preserve existing trace attachments or include their validated repair in the same proposal.
- Recalculate allowed optical overlap using the changed artwork: retreating an edge can expose previously allowed trace overlap.

Bound the affected objects and solver effort. If no valid bounded edit is found, leave the project unchanged and show the blockage. Accepting a route and all associated outline/trace changes must be one atomic undo step.

Acceptance: off means no artwork changes; on can open a legal local channel; cancel restores everything; locked geometry never changes; shrinking a segment cannot silently disconnect its other-layer route.

## 5. Autoroute only the requested connection, with confirmation

Select an island/piece and active layer, then a same-net destination such as a connected trace, another island, or a contact. Offer “both layers” only as an explicit choice. Also support completing a selected gap between existing trace endpoints.

Search only the selected connection and optional corridor. Use the same engine and deformation permissions as interactive routing. Prefer existing connected conductor where legal. Do not reassign nets, reroute unrelated nets, or generate the entire panel by default.

Show proposed routing as a ghost overlay with route length, bends, clearance results, and any changed shapes/traces. Offer **Accept**, **Reject**, and **Try another**. Nothing enters committed project state before the user accepts. Check the project revision again at acceptance; stale proposals must be recomputed.

Rank legal alternatives by length, bends, mesh-guide deviation, and edit cost. Hard constraints must remain hard constraints. A failed search should distinguish a proven local blockage from “no route found within search limits.”

Acceptance: rejecting leaves the saved state unchanged; accepting adds only the selected work and its displayed dependencies; one undo restores the entire operation; partial/both-layer results are clearly identified.

## Architecture and implementation order

Create a separate v3 entry point, project schema, and autosave key. Preserve the original artwork source hash. Start with empty assignments and traces, and support lossless save/resume of v3 work. V2 project migration is not an initial requirement. Keep the current editor available as a historical reference while v3 develops.

Suggested modules are a rule/units layer, mesh model, obstacle builder, routing worker, local deformation solver, proposal validator, and transaction manager. Share geometry and rules across interactive previews, autorouting, final checks, and exports. Reuse the installed Clipper implementation first; a library migration should be a separate evaluated change.

Use spatial indexing and cached obstacle offsets for responsiveness. Rebuild only affected regions during dragging, cancel stale worker searches, and tag results with project revision. Measure preview latency on the actual saved panel; an initial engineering target is under 100 ms for typical local updates, not a measured current capability. A timeout must never turn an unchecked preview into accepted routing.

| Phase | Deliverable | Completion gate |
|---|---|---|
| 1 | Separate v3 shell, fresh artwork, startup scale, save/resume, unified rules | No inherited assignments/traces/edits; v3 round-trip and scaling tests pass |
| 2 | Editable mesh and fresh pair assignment | Stable bindings, pair uniqueness, undo and save/load |
| 3 | Clearance-aware contour engine | Exact geometry checks pass on narrow-gap and two-layer cases |
| 4 | Selected-connection autoroute proposals | Explicit confirmation, rejection and stale-result handling |
| 5 | Optional local outline deformation and trace shove | Bounded edits preserve topology and connectivity on both layers |
| 6 | Full-project performance and manufacturing export checks | Saved v3 project and direct DXF/SVG outputs remain consistent |

Test geometric invariants and representative regressions: repeated slices with local overrides, same-net junctions, hole boundaries, nearly tangent traces, opposite-layer crossings, multiple anchors for one pair, and cancellations. Compare saved/reloaded geometry and ownership, and validate direct manufacturing exports. EDA integration is not needed for this workflow.

## External references and what they establish

- [KiCad interactive router documentation](https://github.com/KiCad/kicad-doc/blob/master/src/pcbnew/pcbnew_interactive_router.adoc) describes walk-around and shove interactions. These are useful UX precedents; they do not establish support for shrinking LCD segment artwork.
- [KiCad PCB Editor documentation](https://docs.kicad.org/7.0/en/pcbnew/pcbnew.html) describes routing individual connections. This supports the selected-connection workflow rather than requiring a full-board autorouter.
- [Clipper2 InflatePaths documentation](https://www.angusj.com/clipper2/Docs/Units/Clipper/Functions/InflatePaths.htm) documents polygon offsetting. Obstacle inflation is a proposed use of this geometric technique, not a complete routing solver supplied by that library.

No new browser interaction tests, routing runs, or manufacturing validation were performed for this documentation task. Findings about current behavior come from source inspection and the other agent’s records; architecture and acceptance criteria are proposals.

## Decisions to settle during implementation

The research can proceed without these decisions, but the implementation should make them explicit:

- Should mesh dragging move only one intersection, deform a row/column region, or offer both? Recommend both with pinned anchors.
- What visual deformation limits are acceptable, especially for small text strokes and holes?
- Should “route this segment” default to the active layer or both? Recommend active layer with an explicit both-layer action.
- Confirm the original artwork source hash for a new project. Later sessions resume the user’s v3 checkpoint, rather than any v1/v2 routing snapshot.
