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
The resistance solver excludes rubber, PCB and driver impedance.
Area-based capacitance estimates are documented in the extension below.

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

Capacitance extension — 2026-11-24

Run: node 2_refine_routing/analysis/estimate-capacitance.cjs
Outputs: capacitance.json, island-capacitances.csv (780 islands),
original-segment-capacitances.csv (631 groups), cell-capacitances.csv
(768 COM x SEG cells), electrode-capacitances.csv (16 COM and 48 SEG).
C estimates are in pF in CSV/JSON. Workbook electrode/cell C is in nF;
island/group C is in pF. All use the confirmed vendor-DXF source hash.

C = area_mm2 x capacitance_density_pF_per_mm2.
Baseline density = 10 pF/mm2; sensitivity = 30 pF/mm2.
Source: NXP AN11491 section 4.3,
https://www.nxp.com/docs/en/application-note/AN11491.pdf
NXP calls 10 pF/mm2 a realistic example, and explains that C depends on
technology, LC liquid, pixel size and ON/OFF state. Neither density is a
measurement of this panel. 30 is an analyst-selected sensitivity, not an
upper bound. No factory cell gap or dielectric data is available.
For a simple parallel plate, density = 8.854 x epsilon_r / gap_um pF/mm2;
alignment layers and LC anisotropy/nonlinearity can modify that model.

Island/group C uses the visible area. Cell/electrode C uses exact polygon
intersection between every TOP and BOTTOM conductor, including routing.
Full overlap = 6290.823814914 mm2; extra beyond visible = 0.058707405 mm2.
Total estimated C = 62.908238149 nF baseline / 188.724714447 nF sensitivity.
This excludes unmodeled fringing, same-layer and external stray capacitance.
Each COM-SEG cell is a mutual capacitor; its opposite terminal is not ground.
Net C sums are the load with the opposing electrodes held at AC ground.
COM-summed and SEG-summed totals refer to the same physical capacitors;
do not add those two totals. OFF segments remain capacitive loads.

For an isolated lumped linear RC, charging follows 1-exp(-t/RC), and
remaining voltage during discharge follows exp(-t/RC). Both have
90%, 95%, 99% settling at 2.303, 2.996, 4.605 times RC, respectively.
This is electrical waveform settling, not the LC optical response time.
For illustration ONLY, COM0 R_last x C_total gives tau about 163 us and
95% settling about 488 us at baseline (three times those at 30 pF/mm2).
That collapses a distributed network to one resistor/capacitor and does
not predict the actual COM0 or pixel charge/discharge time. A subsequent
transient model must keep shared resistive paths, COM-SEG coupling, driver
output impedance, and the actual bias/multiplex waveforms. Do not combine
arbitrary COM and SEG endpoint Rs as though they belong to the same island.

The workbook has editable density inputs Method!B7:B8. All capacitance
columns recalculate from them; R is unchanged. The offline viewer also
has an editable density control, default 10 pF/mm2.
