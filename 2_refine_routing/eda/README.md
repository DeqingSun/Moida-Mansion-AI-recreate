# Webpage ↔ 嘉立创EDA

This replaces the previous refinement tool with a copy of the preliminary manual router plus PCB exchange. The default is `Moida-routing.moida-routing_finished.json`: a 150 × 108 mm active display, 780 final islands, 48 top nets and 16 bottom nets. Folder 1 is unchanged. The old refinement tool is backed up under `workingLog/2_refine_routing_backup_20261014_095120`.

## Start

From the repository root:

```sh
python3 2_refine_routing/eda/server.py
```

Open **http://127.0.0.1:8766/2_refine_routing/index.html**. The original static-server URL on port 8765 also works with this bridge running on 8766.

Requires Python 3, Node.js on PATH, and the installed `/Applications/嘉立创EDA(专业版).app`. Tested with JLCEDA Pro 4.1.60.198f38ab. No npm/pip installation is needed.

1. Click **Open in EDA**. A new, timestamped local project is created under `eda/exports/` and opened through the installed CLI.
2. Adjust straight traces, widths, and component positions/rotations in EDA. Each island is a component. Keep edge pads in place.
3. Click **Import from EDA**. The bridge activates the exported PCB, saves it, validates the saved file, and brings the changes back. Undo restores the previous webpage layout.
4. Use **Save JSON** for a portable webpage checkpoint. For another EDA pass after webpage edits, click **Open in EDA** again.

Import stops if the webpage changed after export; it does not merge simultaneous edits. The page has a separate autosave key from the preliminary router. Keep EDA open during exchange. Close unused EDA project windows when finished; the CLI supports at most eight live sessions.

The finished example is `exports/Moida-LCD/Moida-LCD.eprj3`. The extension used by the application is **`.eprj3`**. This is a folder project: retain the entire folder, including `pcb/LCD.epcb2` and `moida-map.json`, when copying it.

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

The full example has **780 components, 3,267 trace sections, 64 connector pads, and 64 nets**. EDA counts **2,498 pads in total**, including electrode polygon pieces. The original 1,562 polylines are split into straight sections on import; their conductive geometry is retained.

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

## Checks performed

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
```

Standalone export (choose a new output folder):

```sh
node 2_refine_routing/eda/convert.cjs \
  2_refine_routing/Moida-routing.moida-routing_finished.json \
  /tmp/Moida-LCD-export
```

Implementation: `convert.cjs` handles files/geometry, `server.py` provides the loopback bridge, `cli.py` wraps the installed executable, and `../eda-client.js` connects the webpage buttons. The CLI integration follows [嘉立创EDA's CLI guide](https://prodocs.lceda.cn/storage/texts/api/guide/cli-for-ai.md), with the installed version's actual API behavior verified during development.
