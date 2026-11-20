# Final DXF RC review — 2026-11-20

This supersedes the saved-EDA-project trace-length estimates in RC-diagnostic-30ohm.md.

## Input and extraction

Authoritative file: `2_refine_routing/exports/Moida-routing-AutoCAD-complete.dxf`. SHA256: `73eec976a6ad6df66238746234f0678fa0b810aad3ffeca7241e986d6dd0f66b`. Units interpreted as mm, consistent with the 150 × 108 mm active artwork. Read HATCH boundary loops, including holes; ignore duplicate LWPOLYLINE outlines. Extracted 48 TOP conductor regions, 16 BOTTOM regions, and 780 SEGMENT regions. Each TOP region reaches the bottom contact row; each BOTTOM region reaches the left contact row. Net IDs inferred from contact positions using original 48/16 pad pitch; physical connector numbering may differ. No extra disconnected conductor regions occur in these exported HATCH entities. This is not a complete manufacturing DRC.

Actual TOP/BOTTOM overlap is 6290.824 mm². This agrees with the preceding intended-segment area estimate (6290.765 mm²) within 0.001%. Horizontal parallel-edge measurements contain 77 TOP and 36 BOTTOM long edge pairs spaced 0.12 mm; thus final artwork confirms 0.12 mm routing in these sampled runs. At 30 Ω/square that is 250 Ω/mm. Assumed sheet resistance must be confirmed as Ω/square by the factory.

## Model

Rasterize each selected complete conductive region as a 2-D sheet-resistor grid. Adjacent square cells have resistance 30 Ω. Capacitance is placed only on geometric TOP/BOTTOM overlap, at an assumed 10 pF/mm². Treat the opposite electrode as an ideal voltage clamp. Fix the entire accessible pad region at ideal source voltage. Solve G*m=C to obtain the first moment of the step response (integral of normalized step error), which has units of time. This includes branches, broad conductive shapes, shared paths and parallel paths. It is not a single-trace-length multiplication.

This is an independent-electrode model, not a coupled 64-electrode transient or RMS optical simulation. It excludes driver output impedance, bias-rail movement, zebra contact resistance, fringing capacitance, LC state-dependent permittivity and temperature. It cannot predict brightness or guarantee operation. A distributed first moment is not an exact 63% settling time; multiplying it by three is only a single-pole analogy.

| Electrode | Actual overlap mm² | Assumed C nF | Worst local mean delay µs, 0.05 mm grid | Same, 0.025 mm grid |
|---|---:|---:|---:|---:|
| B-W001 | 315.87 | 3.159 | 48.6 | 49.1 |
| B-W005 | 689.76 | 6.898 | 179.9 | 188.8 |
| B-W006 | 641.92 | 6.419 | 129.2 | 132.6 |
| B-W016 | 554.98 | 5.550 | 100.2 | 109.8 |
| T-N034 | 297.80 | 2.978 | 53.3 | 53.4 |

All selected fine-grid conductors remain connected to their pad. Coarse grids lose small conductor slivers; fine-grid results are preferred. Raster overlap area is within about 0.7–1.2% of analytic overlap for these nets. Mesh refinement changes results by approximately 0.3–9.6%; these are engineering estimates, not converged exact solutions. Capacitance is the larger uncertainty: 30 pF/mm² would triple all delays. NXP AN11491 gives 10 pF/mm² as an example, not a specification for this glass.

At 80 Hz and 16 commons, nominal frame/16 = 781.25 µs. Polarity inversion may create shorter waveform plateaus. B-W005 has a 189 µs mean-delay metric even with ideal driver and opposite electrode; its one-pole 95% settling analogy is 566 µs at 10 pF/mm², or 1.70 ms at 30 pF/mm². This is substantial relative to scan timing. The final glass is plausibly RC-limited, but measurements are needed to separate this from bias/supply/contact errors. OFF segments still contribute capacitive load.

## Reuse with a custom driver

A custom controller/board is technically feasible; an ASIC is unnecessary. It cannot eliminate resistance sealed inside the glass. Main useful degrees of freedom are scan timing, output impedance and bias-supply stability. Prototype before a 64-channel board.

Suggested architecture: timer/DMA-driven MCU or FPGA; adjustable LCD supply within glass ratings; six buffered voltage levels for 1/5 bias (0, V/5, 2V/5, 3V/5, 4V/5, V); 64 independently controlled analog output selectors (16 COM and 48 SEG); low-impedance bidirectional output paths. Use proper passive-matrix selection and polarity inversion, deterministic timing, and a shutdown state that places all electrodes at the same potential. Ordinary binary GPIO drive is not a substitute for a multiplex LCD waveform. Rails must both source and sink transition charge. Analog-mux voltage range, injection, break-before-make behavior, and rail settling must be evaluated.

Prototype adjustable frame rate, for example 80, 60, 40 and 20 Hz, with explicit polarity-frame convention, at approved glass voltage. These are experiments, not guaranteed safe operating specifications; manufacturer frequency limits govern prolonged operation. Lower rates provide longer charging time but may produce flicker and crosstalk or alter apparent contrast. Recalculate RMS ON/OFF voltages and keep each cell zero-DC over the complete inversion cycle. Faster charging/brief overdrive is not the first approach: different near/far segments share electrodes, and glass voltage limits must be respected.

A simple high-current replacement at the same scan rate may give limited improvement because the ideal-driver model already has substantial delay. Buffering a selected COM while retaining HT16C24A timing is a useful diagnostic but cannot test lower scan rates. Do not tie new outputs to active Holtek outputs; isolate them. Keeping only 4 or 8 commons active in software does not convert this 16-common glass to a lower-multiplex independent display.

First try correct bias (`i` then `b 2` on existing test firmware), measure VDD/VLCD under patterns, and confirm rated Vop and capacitance with factory. The existing default constant 0x0A is 1/16 + 1/3, whereas 0x0C is 1/16 + 1/5. Bias correction does not guarantee recovery. Obtain sparse/dense differential SEG−COM waveforms, then test a programmable slow waveform before committing to full custom hardware.

## Reproduction

From repository root: `python3 2_refine_routing/analysis/estimate-final-dxf.py 0.05` and `python3 2_refine_routing/analysis/estimate-final-dxf.py 0.025`. Requires Python numpy/scipy/Pillow and Node; uses the repository Clipper library. Default selection is B-W001/B-W005/B-W006/B-W016/T-N034; supply net names after grid size to change it. Intermediate geometry is written under /tmp. No routing or firmware was changed.

Sources: [NXP AN11491](https://www.nxp.com/docs/en/application-note/AN11491.pdf), sections 4.2–4.4; [Holtek HT16C24A datasheet](https://www.holtek.com/webapi/116711/HT16C24A_AGv100.pdf).
