> Segment net assignments are frozen from `1_preliminary_routing/routing-editor/Moida-routing.moida-routing_finished.json`, keyed by internal slice lineage in `frozen-nets.js`. Load/export repairs changed or missing segment nets. New slices inherit their Step 1 ancestor; merging pieces with distinct frozen nets is rejected. Trace contact does not rename or assign nets.

> Current import mode: **traces only**. Import from EDA replaces webpage traces (positions, widths, layers and net names), preserving current webpage islands, slices, segment assignments and connector assignments. EDA segment edits and temporary vias/test points are ignored. Arc traces are rejected. Legacy `edaGeometry` overrides are discarded on webpage reload or JSON load so slices define the artwork again. Earlier full-geometry import descriptions below describe the retained converter API, not the current webpage workflow.

# Webpage ↔ 嘉立创EDA

This replaces the previous refinement tool with a copy of the preliminary manual router plus PCB exchange. The default is `Moida-routing.moida-routing_finished.json`: a 150 × 108 mm active display, 780 final islands, 48 top nets and 16 bottom nets. Folder 1 is unchanged. The old refinement tool is backed up under `workingLog/2_refine_routing_backup_20261014_095120`.

## Start

From the repository root:

```sh
python3 2_refine_routing/eda/server.py
```

Open **http://127.0.0.1:8766/2_refine_routing/index.html**. The original static-server URL on port 8765 also works with this bridge running on 8766.

Requires Python 3, Node.js on PATH, and the installed `/Applications/嘉立创EDA(专业版).app`. Tested with JLCEDA Pro 4.1.60 and 4.1.78. No npm/pip installation is needed.

The permanent Git project is **`exports/Moida-LCD/Moida-LCD.eprj3`**. Always edit this project; the tool no longer creates timestamped working copies.

- **Open EDA** opens the existing permanent PCB without exporting or replacing anything.
- **Send to EDA** writes the current webpage layout to that same project. The previous PCB is saved and backed up locally first, then the project is reopened so EDA reads the new files.
- **Import from EDA** reads that same project into the webpage. If it is open, the bridge saves it first; if it is closed, the saved file on disk is read directly. No previous export, browser token or session registry is needed. Undo restores the previous webpage layout, which is also backed up locally.

Import replaces the current webpage layout. Edits made in the webpage while the request is running prevent replacement. Use Save JSON for a portable checkpoint. The page has a separate autosave key from the preliminary router.

The extension used by the application is **`.eprj3`**. It is a folder project: keep these three files together in Git:

```text
exports/Moida-LCD/Moida-LCD.eprj3
exports/Moida-LCD/pcb/LCD.epcb2
exports/Moida-LCD/moida-map.json
```

Native PCB records can contain updates and empty deletion records. Import resolves these records by document, object ID and ticket so deleted wires remain deleted and edited wires are not duplicated. The user's edited 2026-10-14 10:51 project was preserved in the permanent project when migrating away from timestamped copies; its initial migrated trace count is 3,269.

`evidence/`, `backups/`, temporary conversion folders, session state and old timestamped exports are local-only and ignored by Git. Previously tracked evidence logs have been removed from Git tracking; local copies remain available for diagnostics. Close unused EDA windows to stay below the native CLI's session limit.

## Representation

| Webpage object | EDA object |
| --- | --- |
| Final island/sliced piece | One component, with its island ID as designator and `MoidaIsland` metadata |
| Top electrode | Polygon pad(s) on layer 1, pin T, assigned top net |
| Bottom electrode | Identical polygon pad(s) on layer 2, pin B, assigned bottom net |
| Island with holes | Adjacent hole-free polygon pads in the same component; their union preserves the holes |
| Polyline wire | One LINE per nonzero straight section, same net/layer/physical width |
| Edge connector | Single-layer rectangular pad, matching net |
| Display boundary | Locked reference rectangle on the document layer |

Top and bottom pads are not plated through; their nets remain independent. There is no schematic. Coordinates are converted from the front-view artwork to EDA mils with the Y axis inverted. Import reverses this conversion. The mapping file stores source artwork identity, original settings/cuts, and stable object IDs.

The original finished export had **780 components, 3,267 trace sections, 64 connector pads, and 64 nets**. The permanent working PCB can have a different trace count after routing edits. EDA counts **2,498 pads in total**, including electrode polygon pieces. The original 1,562 polylines are split into straight sections on import; their conductive geometry is retained.

Unchanged island artwork is kept exactly from the source rather than repeatedly rounding it through polygon partitioning. A 0.0001 mm geometric envelope distinguishes editor rounding from real changes. Moved/edited shapes use the router's integer geometry resolution (0.00005 mm at 150 mm display width).

## Supported edits and limits

- Add/delete/move straight trace sections and change their widths or nets.
- Move or rotate whole island components. Their matching top/bottom electrode geometry moves together.
- Edit polygon electrode shapes if the top and bottom unions remain identical. Preserve the island metadata and embedded footprint.
- Projects save as JSON version 12 (older versions remain loadable). Imported geometry is stored in JSON as `edaGeometry`, keyed by internal slice IDs. Webpage rendering, checks, SVG export, undo/redo, and subsequent slices use that geometry.
- Erasing an older slice restores its earlier parent shape and drops overrides on the removed descendants, as with undoing that cut.
- Vias, curved traces, copper pours/regions, new unrelated components, deleted islands, moved/resized edge pads, and mismatched top/bottom island shapes are rejected on import. They are not silently omitted.
- Keep the `.eprj3` folder structure and `moida-map.json`. This is an exchange format for these generated projects, not a general importer for arbitrary PCB files.
- The webpage remains responsible for LCD-specific overlap and address checks. Native PCB DRC does not check unwanted top/bottom LCD activation. The initial routing and default PCB rules produce native DRC violations; this conversion does not claim fabrication clearance compliance.

## Initial conversion checks

- Opened the complete PCB in the actual installed EDA application; verified component, line, pad and net counts, PCB-only project metadata, and rendered artwork.
- Saved the full PCB through the native API and re-imported it: zero changed island shapes/positions and zero changed net pairs. All 780 islands still connect to their edge pads on both layers, with zero same-layer shorts. The same 50 existing LCD-check issues remain (48 clearance findings and 2 overlap findings); see `verification.json`.
- Changed a real prototype component by +0.254 mm X / −0.127 mm display Y and a trace to 0.12 mm through EDA; both changes imported correctly.
- Automated converter tests cover full geometry/net preservation, movement, width changes, subsequent slicing of moved artwork, and rejection of unsupported/missing objects.
- Browser end-to-end test passed: real export/open/save/import, undo/redo, and no JavaScript errors.
- All 2,434 native electrode pads were checked against their assigned island top/bottom nets: zero mismatches (`net-audit.json`).
- Native CLI responses are recorded under `evidence/`; `drc-readback.json` records the native DRC findings.

Run converter tests:

```sh
node 2_refine_routing/eda/test.cjs
python3 2_refine_routing/eda/test_server.py
```

Standalone export (choose a new output folder):

```sh
node 2_refine_routing/eda/convert.cjs \
  2_refine_routing/Moida-routing.moida-routing_finished.json \
  /tmp/Moida-LCD-export
```

Implementation: `convert.cjs` handles files/geometry, `server.py` provides the loopback bridge, `cli.py` wraps the installed executable, and `../eda-client.js` connects the webpage buttons. The CLI integration follows [嘉立创EDA's CLI guide](https://prodocs.lceda.cn/storage/texts/api/guide/cli-for-ai.md), with the installed version's actual API behavior verified during development.

## Stable-project regression checks

Tests cover native empty deletion records, repeated object updates, imports without a prior browser export, stable-path sends with backups, and failed conversions leaving the PCB unchanged. The browser test reads the current working PCB, checks import/undo/redo, opens the permanent project, and verifies native save/import.

## LCD manufacturing rules

Each export sets the native canvas unit to **mm**, new-route/default width to **0.12 mm**, minimum trace width to **0.12 mm**, different-net trace/trace clearance to **0.12 mm**, and SMD polygon pad/trace clearance to **0.12 mm**. The fill-region/trace and copper-region/trace cells are also set to 0.12 mm. The rules apply on both copper layers. Existing wires retain their widths and are flagged if too narrow; exporting does not widen them or move routes.

The native file stores distances in mils even when its display unit is mm. `rules.cjs` converts the physical limits before writing the native TRACK and SAFE rule tables. The native matrix order was verified against the installed editor's source. See [EDA design rules](https://prodocs.lceda.cn/cn/pcb/design-design-rule/).

Exports also set trace-to-single-layer (SMD) test-point clearance to **0.10 mm**, for manually placed temporary routing obstacles in EDA. This does not change trace-to-trace or segment-pad clearances.

The webpage also checks width and different-net same-layer spacing. Segment-to-trace checks exclude same-net connections. The general clearance setting retains a 0.10 mm floor for other same-layer conductor pairs. Trace-to-trace and segment-to-trace checks independently enforce 0.12 mm; raising the general setting can add a stricter requirement.

For LCD-specific projected top/bottom trace spacing, the webpage requires **0.10 mm edge-to-edge**, inside the active display and outside intended island shapes and wanted-overlap areas. Only trace portions outside those exempt areas participate. This is a separate `cross-layer-clearance` check, alongside the existing unwanted-overlap check; EDA's normal same-layer copper rules cannot express this LCD artwork exemption. Select the new issue filter to isolate/highlight these regions, then click an issue to zoom to it. Areas outside the active display remain exempt.

Run `node 2_refine_routing/eda/test-rules.cjs` for native-value and geometric boundary tests.

Exports set trace-to-via clearance to **0.10 mm** and default via diameter/hole to **0.12/0.06 mm**. Via minimum sizes are lowered as needed to allow those defaults. Existing vias are not resized.

All via-to-object and drill-to-object clearance pairs are **0.10 mm** on export, including via-to-via, via-to-drill and drill-to-drill. Other clearance pairs retain their existing rules.

Exported segment components and their top/bottom polygon pads are locked to prevent accidental movement in EDA. Traces remain unlocked for routing adjustments.
