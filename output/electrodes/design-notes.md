# Electrode candidate revision 01

**Incomplete routing study, not a manufacturing release.** The browser can reproduce all 631 groups with ideal probes. The exported two-layer candidate cannot reproduce them all through its edge contacts.

## Architecture and pattern construction

This candidate deliberately uses static drive: **631 logical front SEG nets and one rear COM net**. It does not pretend that an arbitrary 8 × 79 bit assignment is a physically routed display. No vias or same-layer insulated crossovers are assumed.

Each of the 769 original filled islands is retained on the front. A grid-based router attempts an independent connection from each island to a contact on one of the four edges. Contacts of the same original segment ID are intended to be tied on an external PCB; that PCB and its fanout are not designed here. A fully routed version of this particular strategy could require up to 769 front contacts plus a rear contact, despite having only 631 logical SEG signals.

The rear starts as a broad COM electrode. Cutouts beneath the front traces remove unwanted overlap. Those cutouts exclude the original visible artwork, keeping COM coverage under every desired shape. The cutout margin is **0.0125 mm per side** at the example scale; this is a nominal geometry assumption, not an approved registration tolerance. A rear tab is included in the upper-left margin. Both SVG exports use the front-view coordinate system. The simulator's mirror option changes viewing direction only; do not mirror an export again without agreeing on the factory's convention.

The working optical canvas is 150 × 108 mm. A 6 mm margin on each side gives a 162 × 120 mm drawing envelope. The margin is routing workspace, not a complete glass/seal/contact specification. The proposed routing assumptions are 0.05 mm trace width, 0.05 mm minimum clearance to other front nets, 0.30 mm square contacts, and a nominal 0.50 mm contact grid. All require supplier review.

## Actual result

| Check | Result |
|---|---:|
| Original logical groups retained | 631 |
| Original filled islands retained | 769 |
| Valid front routes/contact connections | 222 |
| Islands with both front and rear connectivity | 220 |
| Fully connected logical groups | 165 |
| Partially connected logical groups | 26 |
| Logical groups without a usable island connection | 440 |
| Rear conductor components | 3 (only the main component reaches the proposed rear contact) |
| Optical overlap mismatches | 0 |

The two small disconnected rear regions are not counted as physically driven. Three candidate front paths failed the geometric clearance check and were removed. An unconnected original shape is left in the front SVG as an **isolated conductor**, not silently treated as a wired segment. The contact CSV and SVG attributes identify these cases.

A first deepest-first routing pass found 219 raw paths; an outside-first pass found 208. Refining the obstacle raster and contact keepouts produced 225 raw paths, of which 222 passed the geometric checks. This is a heuristic result, **not a mathematical proof that no two-layer solution exists**. It demonstrates that this static-drive routing strategy is insufficient at the assumed geometry and process rules.

## Geometry versus electrical connectivity

For each island, the generator constructs its front polygon, including any accepted trace and contact. It intersects that polygon with the rear electrode and the active canvas, and compares the result with the original filled island. The symmetric-difference area is zero for every island. Thus, when ideal probes independently drive all conductor pieces, unions of selected overlaps reproduce arbitrary combinations of the original 631 logical groups. This is a geometry result, not a statement that those probes can be replaced by the candidate edge connections.

The simulator has two explicit modes:

- **Direct electrode probes:** assumes each front island and each rear component receives its intended signal, even if isolated. Use this to select every original group and inspect the overlap geometry.
- **Routed edge contacts:** shows only islands having an accepted front route and complete coverage by the contact-connected rear component. Floating electrodes are omitted from the image rather than modeled electrostatically. Real floating regions could exhibit capacitive coupling and ghosting.

Separate front nets are checked against foreign source shapes and other accepted traces. This is not a complete LCD design-rule check: narrow necks, sheet resistance, parasitic capacitance, seal construction, polarizer arrangement, alignment error, etch bias, contact assembly and fluid response remain unmodeled.

## AC model

COM and each SEG are ideal equal-amplitude square waves with either equal or opposite phase. Same phase gives 0 V across the cell. Opposite phase gives alternating +V and −V, RMS V, and zero mean DC. The default 3 V drive and 1.5 V switching threshold are illustrative controls, not a material specification. The displayed waveforms represent nominal 60 Hz operation; liquid-crystal response times and contrast are not simulated.

Changing COM phase inverts which fixed SEG phases request illumination. “All on” sets all SEG phases opposite to the current COM; “all off” sets them equal. In edge-contact mode, a request cannot illuminate an island lacking a connection.

The browser tests 631 one-hot states, 631 one-cold states, all-on/off, and 64 deterministic random states. It does not enumerate 2^631 possible images. The exact geometric independence test is what supports arbitrary subsets in the ideal-probe model.

## Files

- `front-electrodes.svg`: actual proposed front conductor polygons, including routed traces and isolated shapes. `data-net` identifies logical nets; `data-routed` marks each island's route status.
- `rear-electrode.svg`: actual rear conductor geometry; one intended net but currently three disconnected pieces.
- `contact-register.csv`: original ID, bit index, island index, intended net pair, routing/continuity state, contact coordinates and trace length. No external connector pin numbers are assigned.
- `validation.json`: generated geometry and routing results.
- `design-data.js`: all geometry and connectivity consumed by the browser; works offline beside the HTML and JS files.
- `browser-test.json`: UI and logical-state test results.

## Next engineering step

Do not send this candidate for tooling. The next topology should **partition the scene and text into multiplexed electrode networks** and co-design the front and rear routes, rather than extending this high-pin-count static layout. The 13 × 3 × 5 text strip is an obvious place to investigate row/column sharing. A nominal matrix capacity such as 8 COM × 79 SEG is not enough by itself: every net must have a real connection, and all unintended overlaps must be evaluated. Any design that splits an original group across addresses must keep those addresses synchronized in firmware.

The final design also needs an agreed active size, supplier trace/gap/registration rules, contact arrangement, drive duty/bias and an available driver. The source artwork and this simulator remain useful as regression references for that redesign.

## References

- [Original public game](https://dukope.itch.io/moida-mansion) and the archived `source/moida.js` in this repository.
- [NXP AN3219: LCD drive principles](https://www.nxp.com/docs/en/application-note/AN3219.pdf), including static and multiplexed operation.
- [Silicon Labs segment-LCD application note](https://www.silabs.com/documents/public/application-notes/an0057.2-series2-segment-lcd.pdf), explaining the LCD cell and drive.
- [Focus LCDs FAQ](https://focuslcds.com/frequently-asked-questions/): its spacing guidance explicitly distinguishes layouts with and without traces between segments. Factory routing rules must be obtained for this artwork.
