# Directional routing experiment

This is a separate generated candidate. It does not replace the manual editor's saved layout. This historical experiment retains its original 2,048-pad model through `scripts/orthogonal-project-v2.cjs`. The manual editor now uses 48 top pads and 16 left pads; importing this candidate there preserves traces but converts pad assignments and requires rerouting to the new contacts.

Open `index.html` through the existing local server at http://127.0.0.1:8765/orthogonal-routing/index.html. The viewer compares the baseline and optimized layouts, and toggles top, bottom and exact error highlights. Download `optimized.moida-routing.json` and use **Load JSON** in the routing editor to inspect/edit it; save your manual project first if you intend to switch projects.

## Result

| Exact check | Baseline | Selected search result |
|---|---:|---:|
| Forbidden top/bottom overlap regions | 3,733 | 3,047 |
| Forbidden overlap area | 9.1208 mm² | 6.6154 mm² |
| Same-layer shorted net pairs | 1,615 | 1,615 |
| Same-layer clearance violations | 20 | 12 |
| Segments with both island-to-pad paths | 631 | 631 |
| Trace length in preferred direction | 98.18% | 96.49% |

The result reduces overlap regions by 18.4% and overlap area by 27.5%. It is **not electrically valid or fabrication-ready**: shorted nets destroy independent control even though the geometric paths reach pads. An overlap region is a connected polygon outside the original artwork, not necessarily one pair of crossing trace centerlines. A short is counted per pair of different nets, not per intersection point.

## How it works

1. Read all 631 groups / 769 islands from the normalized original SVG data.
2. Choose the nearest available ordered column/row pair to each segment's area-weighted center. Preserve one assignment for all islands of a logical segment; prohibit duplicate pairs. Different segments may share a column or row independently.
3. Top nets use north/south pads; bottom nets use west/east pads. Both electrodes contain each original segment shape. Every island receives a route on each layer (1,538 routes total).
4. Form 14 Manhattan candidates per island/layer: two exit directions × seven trunk offsets. Top trunks run vertically; bottom trunks horizontally. Short transverse sections attach islands and reach pad centers. The baseline uses the shortest zero-offset candidate.
5. Seeded coordinate descent removes a route, scores the alternatives against the current grid, and replaces it if its local score improves. Score counts cells touching foreign same-layer conductors, cells overlapping opposite-layer conductors outside artwork, and a small length penalty. Nets without trace routes are not needed in this output; only used contacts are exported.
6. Independently validate filled conductor polygons with the manual editor's Clipper engine, including trace widths, pad geometry, shorts, clearance, pair uniqueness, unwanted overlaps, and all island-to-pad paths. Export both masks as draft SVGs.

The selected run uses seed 17, ten passes, 3-source-unit grid (0.15 mm at the 150 mm screen width), 0.05 mm traces, 0.3 mm pads and 0.05 mm clearance. Final cross-layer weight is 1000 and same-layer weight is 100: experiments with shorts prioritized reduced shorts but increased visible overlaps. Four experiment summaries are retained in `experiments.json`; selected settings are in `search.json`.

## Reproduce

From the repository root, with Python 3 and Node.js installed:

```sh
python3 -m venv /tmp/moida-routing-venv
/tmp/moida-routing-venv/bin/pip install -r scripts/requirements-routing.txt
/tmp/moida-routing-venv/bin/python scripts/route_orthogonal.py
node tests/orthogonal-routing.cjs
```

`--help` lists parameters. Use `--output` to keep another run, `--seed` for another update order, `--passes` for longer search, and `--grid` for different search resolution. `--short-weight` and `--cross-weight` change the tradeoff. Use `--node /absolute/path/to/node` if necessary.

The grid search is approximate: narrow traces, small gaps, pad geometry and exact artwork boundaries are not fully modeled in its cost. A lower local raster score does not guarantee a lower exact overlap count or globally lower score after subsequent updates. Always compare the exact checks. The algorithm does not reassign column/row pairs during routing, use unrestricted maze paths, model LCD waveforms, or prove a global minimum. Unequal column density alone does not prove that a crossing-free design is impossible.

Contacts sharing one net name on opposite edges must be tied to that same electrical signal externally. Hardware drive architecture remains a separate design decision.
