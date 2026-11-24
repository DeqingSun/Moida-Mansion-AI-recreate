> Historical estimate from the saved EDA project. For the confirmed vendor DXF, use the current [resistance and area analysis](resistance-area/README.txt). This historical capacitance estimate has not been recalculated for the vendor DXF.

# LCD RC diagnostic — 2026-11-20

Source: `eda/exports/Moida-LCD/moida-map.json`, embedded version-12 project, reconstructed with project.js/layoutData and segments-data.js. 150 × 108 mm active rectangle; 780 edited islands. This is a saved design snapshot, not confirmation of the manufactured artwork. The AutoCAD-complete DXF has a different contact layout (BOTTOM contacts on left); confirm the factory file before treating net-specific figures as final.

Assumption: manufacturer’s “30欧” means 30 Ω/square ITO. All 1341 saved trace polylines are approximately 0.12 mm wide, giving 250 Ω/mm. If fabricated at 0.10 mm, resistance is 20% higher.

Areas use polygon shoelace area, subtracting holes, summed by assigned net. They approximate intended overlap; not a conductor-overlap/parasitic extraction. Capacitance examples use 10 pF/mm² (NXP AN11491 example); 30 pF/mm² is an explicit sensitivity assumption, not a measured specification. OFF segments remain capacitive loads.

Trace statistics are NOT pad-to-pixel effective resistance: sumR is the sum over all branches, and maxrun is the largest single saved polyline. Neither accounts for complete series paths, parallel paths, current spreading within islands, contacts or output impedance. Multiplying maxrun by total net capacitance is a deliberately crude shared-trunk load scenario, not an extracted time constant.

| Net | Area mm² | C at 10 pF/mm², nF | Longest saved trace, mm | Its R, kΩ | R × total C, µs |
|---|---:|---:|---:|---:|---:|
| B-W001 | 315.87 | 3.159 | 137.20 | 34.30 | 108.3 |
| B-W002 | 252.16 | 2.522 | 126.94 | 31.74 | 80.0 |
| B-W003 | 473.23 | 4.732 | 114.49 | 28.62 | 135.5 |
| B-W004 | 446.68 | 4.467 | 111.76 | 27.94 | 124.8 |
| B-W005 | 689.76 | 6.898 | 104.94 | 26.24 | 181.0 |
| B-W006 | 641.92 | 6.419 | 103.86 | 25.96 | 166.7 |
| B-W007 | 508.80 | 5.088 | 96.23 | 24.06 | 122.4 |
| B-W008 | 495.51 | 4.955 | 90.03 | 22.51 | 111.5 |
| B-W009 | 447.41 | 4.474 | 92.86 | 23.22 | 103.9 |
| B-W010 | 526.98 | 5.270 | 89.44 | 22.36 | 117.8 |
| B-W011 | 372.58 | 3.726 | 82.32 | 20.58 | 76.7 |
| B-W012 | 127.58 | 1.276 | 67.79 | 16.95 | 21.6 |
| B-W013 | 139.07 | 1.391 | 57.80 | 14.45 | 20.1 |
| B-W014 | 122.06 | 1.221 | 56.71 | 14.18 | 17.3 |
| B-W015 | 176.18 | 1.762 | 94.80 | 23.70 | 41.8 |
| B-W016 | 554.98 | 5.550 | 34.79 | 8.70 | 48.3 |
| T-N001 | 319.94 | 3.199 | 41.22 | 10.31 | 33.0 |
| T-N002 | 192.01 | 1.920 | 42.08 | 10.52 | 20.2 |
| T-N003 | 195.18 | 1.952 | 38.77 | 9.69 | 18.9 |
| T-N004 | 111.89 | 1.119 | 34.58 | 8.64 | 9.7 |
| T-N005 | 122.58 | 1.226 | 31.34 | 7.83 | 9.6 |
| T-N006 | 248.98 | 2.490 | 38.81 | 9.70 | 24.2 |
| T-N007 | 136.27 | 1.363 | 23.20 | 5.80 | 7.9 |
| T-N008 | 106.41 | 1.064 | 30.62 | 7.66 | 8.1 |
| T-N009 | 146.02 | 1.460 | 21.27 | 5.32 | 7.8 |
| T-N010 | 79.45 | 0.794 | 24.94 | 6.23 | 5.0 |
| T-N011 | 92.42 | 0.924 | 23.18 | 5.80 | 5.4 |
| T-N012 | 151.36 | 1.514 | 35.22 | 8.80 | 13.3 |
| T-N013 | 93.96 | 0.940 | 50.20 | 12.55 | 11.8 |
| T-N014 | 122.57 | 1.226 | 39.78 | 9.94 | 12.2 |
| T-N015 | 119.61 | 1.196 | 42.82 | 10.71 | 12.8 |
| T-N016 | 146.55 | 1.466 | 24.35 | 6.09 | 8.9 |
| T-N017 | 79.25 | 0.792 | 37.07 | 9.27 | 7.3 |
| T-N018 | 134.78 | 1.348 | 38.52 | 9.63 | 13.0 |
| T-N019 | 70.97 | 0.710 | 40.96 | 10.24 | 7.3 |
| T-N020 | 219.58 | 2.196 | 43.21 | 10.80 | 23.7 |
| T-N021 | 129.42 | 1.294 | 41.55 | 10.39 | 13.4 |
| T-N022 | 221.96 | 2.220 | 38.35 | 9.59 | 21.3 |
| T-N023 | 12.76 | 0.128 | 36.51 | 9.13 | 1.2 |
| T-N024 | 278.24 | 2.782 | 37.36 | 9.34 | 26.0 |
| T-N025 | 150.71 | 1.507 | 49.83 | 12.46 | 18.8 |
| T-N026 | 69.75 | 0.698 | 31.59 | 7.90 | 5.5 |
| T-N027 | 18.89 | 0.189 | 31.87 | 7.97 | 1.5 |
| T-N028 | 175.03 | 1.750 | 33.71 | 8.43 | 14.7 |
| T-N029 | 123.33 | 1.233 | 31.43 | 7.86 | 9.7 |
| T-N030 | 132.34 | 1.323 | 38.56 | 9.64 | 12.8 |
| T-N031 | 128.46 | 1.285 | 37.86 | 9.47 | 12.2 |
| T-N032 | 11.74 | 0.117 | 39.15 | 9.79 | 1.1 |
| T-N033 | 42.03 | 0.420 | 30.46 | 7.61 | 3.2 |
| T-N034 | 297.80 | 2.978 | 38.66 | 9.67 | 28.8 |
| T-N035 | 14.77 | 0.148 | 39.71 | 9.93 | 1.5 |
| T-N036 | 59.69 | 0.597 | 58.34 | 14.58 | 8.7 |
| T-N037 | 114.54 | 1.145 | 51.40 | 12.85 | 14.7 |
| T-N038 | 162.93 | 1.629 | 26.40 | 6.60 | 10.8 |
| T-N039 | 34.12 | 0.341 | 34.67 | 8.67 | 3.0 |
| T-N040 | 22.19 | 0.222 | 35.87 | 8.97 | 2.0 |
| T-N041 | 125.04 | 1.250 | 37.00 | 9.25 | 11.6 |
| T-N042 | 60.37 | 0.604 | 37.67 | 9.42 | 5.7 |
| T-N043 | 85.83 | 0.858 | 42.05 | 10.51 | 9.0 |
| T-N044 | 69.88 | 0.699 | 44.69 | 11.17 | 7.8 |
| T-N045 | 126.31 | 1.263 | 44.94 | 11.23 | 14.2 |
| T-N046 | 231.97 | 2.320 | 22.12 | 5.53 | 12.8 |
| T-N047 | 273.88 | 2.739 | 10.06 | 2.51 | 6.9 |
| T-N048 | 227.02 | 2.270 | 21.36 | 5.34 | 12.1 |

At 30 pF/mm², multiply capacitances and example time constants by three. A first-order system requires about 3τ to settle to 95%. At 80 Hz and 16 commons, 1/(80×16)=781.25 µs is the nominal per-common period; inversion can introduce shorter intervals, so inspect the actual waveform. This is not an exact waveform simulation.

Largest island: C02S66, 171.435 mm², T-N034/B-W006, estimated 1.714–5.143 nF for the assumed 10–30 pF/mm² range. Total intended area is 6290.77 mm² (62.91–188.72 nF).

## Firmware finding

Both `4_game_runtime/ch32x035_lcd_test/lcd_test/ht16c24a.c` and `4_game_runtime/ch32x035/moida_test/ht16c24a.c` define MODE_1_16_1_5 as 0x0A. The HT16C24A command table assigns Duty1=bit3, Bias1=bit2, Duty0=bit1, Bias0=bit0. Thus 0x0A selects 1/16, 1/3, contrary to the comment. 0x0C selects 1/16, 1/5. Existing `b 2` calls set_bias(2), which correctly sends 0x0C. No firmware or routing was changed by this analysis.

## Recovery sequence

1. On the existing LCD-test firmware: init, then b 2, then compare COM-only, SEG-only, all-on and single-cell patterns. Init resets the bias to the incorrect default.
2. Verify glass-rated operating voltage, duty and bias. Measure VLCD and VDD under load; the documented 1 kΩ VLCD feed may add supply droop. Any change to that feed must follow the actual schematic and voltage rating.
3. Scope differential SEG−COM using ground-referenced channels and subtraction. Compare connector and accessible glass test points, and sparse/dense patterns.
4. Measure capacitance with the driver disconnected using a low-amplitude AC/LCR test; ask the manufacturer for capacitance per area, cell gap, rated voltage and exact sheet-resistance units.
5. HT16C24A only offers 80/160 Hz; 80 is already selected. A different waveform generator/driver with lower frame rate may salvage high-R glass at the cost of flicker; maintain zero DC and all 16 COMs. A stronger driver helps output resistance but does not remove ITO resistance. Do not parallel independent driver outputs.
6. Additional connections help only if the same electrode has a genuinely accessible second contact; an external wire cannot bypass a sealed internal ITO bottleneck.

Sources: https://www.holtek.com/webapi/116711/HT16C24A_AGv100.pdf ; https://www.nxp.com/docs/en/application-note/AN11491.pdf ; https://www.fujipoly.eu/zebra-carbon-connector
