Glass resistance and segment area extraction — 2026-11-24

Authoritative geometry: Moida-routing_to_vendor.dxf.
The user confirmed this is the file sent to the manufacturer.
SHA256: 4633f597bd76cf24610a720be6c34838f4a7751a5d0c47e7d57bfc22d9c51d3b
No glass, PCB or firmware files were changed for this extraction.

electrodes.csv: 64 logical electrodes, pad-to-first and pad-to-last island
resistance, endpoint IDs, shortest connected path length, island counts,
occupied electrical-cell counts, and summed visible area.
island-areas.csv: 780 physical visible islands, subtracting holes.
cell-areas.csv: all 768 COM x SEG addresses; 664 occupied and 104 unused.
original-segment-areas.csv: areas regrouped into 631 original game segments.
mesh-verification.csv: 18 endpoint checks on nine electrodes, 25 vs 20 um mesh.
results.json: combined numerical results used to author the Excel workbook.

COM0=B-W001 and SEG0=T-N001, with zero-based logical indices. These are not
necessarily the physical SEG numbers of the replacement LCD controller.

R assumes 30 ohm/square on both ITO layers. The supplier's phrase “30欧”
does not by itself confirm that unit. Values scale linearly with actual Rs.
All COM and SEG contacts are on the bottom edge in the vendor DXF.
Each contact is 1 mm wide and 3 mm long, y=-114.3 to -111.3 mm.
The ideal source clamps the outer 1.5 mm (half) of that contact length.
COM0 contact center is x=10 mm; COM15 is x=40 mm.
COM paths include the long bottom-to-left-edge ITO feeds.
The tested visible island is an equipotential terminal. Every other island
retains its finite sheet resistance. The 2D four-neighbor square-cell network
is solved with 1V between target and contact; R is 1/current, scaled by Rs.
There is no rubber, PCB, driver or capacitance model in these results.

First/last mean shortest/longest contact-to-island geodesic distance over
connected ITO, not direct geometric distance. The shortest path uses eight
grid directions. On a branching electrode, farthest by path length is not
guaranteed to be highest in effective resistance. The specified endpoint
island IDs make each reported resistance unambiguous.

Report mesh is 0.025 mm. The 0.020 mm spot checks changed R by up to 12.35%.
No isolated conductor area was discarded on the report grid. Both the
condensed and full sheet solvers reproduce an analytic uniform-strip case.
Full-sheet first/last values are in full-terminal-grid-0.025mm.json.
resistance-grid-0.025mm.json is an intermediate model that shorts EVERY
visible island, and may substantially underestimate R. Do not use that
intermediate model as the final resistance table.

Total visible area = 6290.76510750877 mm2. COM totals, SEG totals, island
totals and electrical-cell totals reconcile. This is visible SEGMENT area,
not all conductive ITO area or all possible parasitic electrode overlaps.

Reproduce from repository root:
python3 2_refine_routing/analysis/extract-resistance-geometry.py
node 2_refine_routing/analysis/bind-vendor-geometry.cjs
OPENBLAS_NUM_THREADS=1 python3 2_refine_routing/analysis/estimate-electrode-resistance.py --step 0.025
OPENBLAS_NUM_THREADS=1 python3 2_refine_routing/analysis/refine-terminal-resistance.py
OPENBLAS_NUM_THREADS=1 python3 2_refine_routing/analysis/refine-terminal-resistance.py --step 0.02 --nets COM0 COM4 COM6 COM10 COM15 SEG9 SEG12 SEG33 SEG47
python3 2_refine_routing/analysis/package-resistance-area.py

Dependencies: Python numpy/scipy and the repository's bundled Node Clipper.
The workbook contains an editable sheet-resistance input, scaling formulas,
and linked area/count summaries. Its main table uses the full-sheet results.

Corrected COM0: first C02S93_0, R=33.024 kOhm, path=133.966 mm;
last C02S81_2, R=51.567 kOhm, path=264.764 mm (0.025 mm report mesh).
At 0.020 mm, COM0 first=33.566 kOhm and last=51.923 kOhm.
The source correction, not a sheet-resistance change, explains the increase.
