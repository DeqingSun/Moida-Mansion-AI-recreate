# Moida Mansion — LCD geometry study

The first-stage deliverable reconstructs **631 separately controlled logical segments** directly from the public game's embedded SVG. Original paths, holes, positions, grouping, IDs and game bit order are retained. This is an optical artwork package for review, not a released glass mask or electrode-routing design.

Open [the interactive segment explorer](output/segment-explorer.html) in a browser. Click artwork, search an ID, isolate a segment, step through IDs, zoom, and inspect its bounding box at a selectable physical scale. It works offline.

## Deliverables

- `output/segments.svg`: exact optical master; 3000 × 2160 source units, one named group per logical segment; no synthetic shadows.
- `output/segments-150mm.svg`: same artwork at an **example** 150 × 108 mm canvas size.
- `output/segments-150mm.dxf`: closed contour polylines, one layer per segment ID, millimetres, lower-left Cartesian origin. Contours describe boundaries; SVG remains authoritative for filled regions and holes.
- `output/segment-register.csv`: IDs, zero-based game bit indices, one-based ROM addresses, native bounding boxes, centres, path and contour counts.
- `output/segments.json`: all of the above plus original path strings and coordinate metadata.
- `output/island-register.csv`: disconnected filled pieces grouped by logical ID, for routing review.
- `output/all-segments.png`: all-on optical preview. It shows mutually exclusive game states simultaneously.
- `output/validation.json`, `output/geometry-check.json`: extraction provenance and geometric checks.
- `research/geometry-and-next-steps.md`: findings and the transition to a factory design.

## Reproduce

Run `python3 scripts/extract_segments.py` from any directory. Uses only Python's standard library and the archived `source/moida.js`; no network needed. It also generates the offline HTML explorer from `scripts/viewer-template.html`.

For optional geometric analysis, install Shapely in your own Python environment, then run `python3 scripts/check_geometry.py`. In this session it was installed temporarily under `/tmp/moida-python-deps` and invoked with `PYTHONPATH=/tmp/moida-python-deps`. Raster previews were rendered with Sharp. Browser inspection confirmed 631 selectable groups, 630 dimmed groups when isolating one, and no JavaScript errors.

## Source and attribution

Original game and artwork: **Moida Mansion by dukope (Lucas Pope)**, https://dukope.itch.io/moida-mansion . Public browser build: https://html-classic.itch.zone/html/11926521/index.html . The archived files are reference material extracted at the user's request; no license or manufacturing permission is inferred from their public availability. Before commissioning reproductions, resolve artwork/port permission with the creator.

No game code was executed to extract the SVG. `source/moida.js` is the unchanged downloaded asset. Its SHA-256 is recorded in `output/validation.json`.

Code audit: run `node scripts/audit_original_code.cjs`. Results and qualifications are in `research/code-audit.md`; all 631 one-hot and 631 one-cold renderer tests pass.
