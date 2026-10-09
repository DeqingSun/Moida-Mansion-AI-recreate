# Geometry findings and sample-development plan

## Confirmed from the public game asset

The [itch.io game page](https://dukope.itch.io/moida-mansion) embeds [browser build 11926521](https://html-classic.itch.zone/html/11926521/index.html). Its [moida.js](https://html-classic.itch.zone/html/11926521/moida.js) includes an SVG panel and a 631-entry segment ID array. The reconstruction extracts that literal SVG rather than tracing a screenshot.

| Item | Result |
|---|---:|
| Native canvas | 3000 × 2160 units |
| Aspect ratio | 25:18 |
| Independently addressed logical groups | 631 |
| Original SVG path elements | 751 |
| Closed path contours | 964 |
| Disconnected filled islands, after nonzero fill and unions | 769 |
| Logical groups containing multiple filled islands | 61 |
| Source bank C00 | 255 IDs, C00S01–C00S255 |
| Source bank C01 | 256 IDs, C01S00–C01S255 |
| Source bank C02 | 120 IDs, C02S00–C02S119 |

The three source banks are sequential identifiers. There is **no evidence that C00/C01/C02 are physical LCD common electrodes**. Preserve them as stable references, not as a proposed pinout.

The renderer `run__device95html_u798` creates one entry for each ID. `apply__device95html_u344` reads the corresponding one-based sprite-state bit; `onHEX3D__device95html_u67` switches the segment and its shadow together. The SVG shadow layer repeats the same paths with an (8,8) offset; it is excluded from manufacturing artwork. The `unwired` SVG group is empty. The glass texture and plastic enclosure are not LCD segments.

Every named group must preserve its original paths and holes. Multiple contours do not necessarily mean multiple electrodes: some are holes, some are disconnected pieces, some touch. The island register uses filled geometry to distinguish these cases. No attempt has been made to merge logical IDs based on apparent co-activation or to claim that every bit combination is reachable in gameplay.

Visually, the bottom text strip contains 13 character positions, each with a 3 × 5 pattern: **195 logical elements**. Their bounding boxes fall within x=862–2139, y=1835–1986. This spatial classification leaves 436 logical segments for the scene, map, controls and characters. Semantic names for these remaining groups are not yet reverse-mapped from gameplay; original IDs and exact positions are already available.

## Coordinates and size

The authoritative SVG and register use an upper-left origin, X right, Y down. All paths use straight M/L/Z commands; no tracing, smoothing, or curve approximation is involved. Artwork extends to the top and left canvas boundaries; the canvas is **not the outside edge of the glass**.

For a chosen canvas width W millimetres:

- height = 0.72 W;
- millimetres per native unit = W / 3000;
- SVG coordinate to millimetres: x_mm = x × W/3000, y_mm = y × W/3000;
- DXF uses x_mm = x × 0.05 and y_mm = (2160 − y) × 0.05 for the example 150 mm export.

150 × 108 mm is an engineering example, not a recovered original dimension or approved enclosure size. The viewer allows other sizes without changing the source geometry. Changing the viewer's width does not rewrite the fixed 150 mm CAD exports.

## Geometry checks

Polygonization applies the SVG default nonzero winding rule, then unions shapes within each logical ID. Checks found **zero touching pairs and zero positive-area overlaps between different IDs**. The global minimum distance is **4 native units**, including C00S11 ↔ C00S24.

| Canvas size | Minimum inter-group gap |
|---|---:|
| 100 × 72 mm | 0.1333 mm |
| 120 × 86.4 mm | 0.1600 mm |
| 150 × 108 mm | 0.2000 mm |

This checks optical separation, not minimum stroke widths, internal holes, electrode routing, isolation gaps along traces, parasitic activation, or tolerances. Disconnected pieces belonging to the same ID were unioned and excluded from inter-ID spacing checks.

[Focus LCDs' spacing guide](https://focuslcds.com/journals/minimum-spacing-for-a-segmented-lcd-display/) recommends at least 0.05 mm between segments and a 1.5–2.0 mm buffer between active segments and glass edge. These are one supplier's guidelines, not manufacturing acceptance for this artwork. The chosen factory must specify its own rules, especially for fine holes, narrow strokes, and routes.

## Connection plan: requirements before pin assignment

Retain 631 logical control bits in the firmware interface. This is the logical requirement, not a guarantee of 631 physically routable electrode regions. There are 769 disconnected visible islands. For each multipart ID, the factory must determine whether invisible ITO routing can join its pieces without causing unwanted visible shapes, or whether several physical addresses must be driven in lockstep.

Capacity lower bounds, assuming each logical group can occupy one address:

| Multiplex scheme | Minimum SEG outputs | COM outputs | Total glass drive lines | Address capacity |
|---|---:|---:|---:|---:|
| 1/4 duty | 158 | 4 | 162 | 632 |
| 1/8 duty | 79 | 8 | 87 | 632 |

These are arithmetic capacity examples, **not a routed COM/SEG map or selected driver**. More addresses may be needed for disconnected pieces. Selection must also account for contrast, duty/bias, voltage, electrode resistance, capacitance, synchronization if multiple drivers are used, and physical contact pitch. The [NXP PCF8545 datasheet](https://www.nxp.com/docs/en/data-sheet/PCF8545.pdf) is a useful example of the COM/SEG model, but [NXP marks that product End of Life](https://www.nxp.com/products/no-longer-manufactured/universal-lcd-driver-for-multiplex-rates-up-to-1-8:PCF8545); it is not a BOM recommendation.

## Next revision toward sample fabrication

1. Review the interactive map and choose the physical active canvas width and viewing orientation. Preserve this exact vector master as revision 0.
2. Give the SVG, register and island register to a segment-LCD factory for a manufacturability review. Request minimum gap, minimum stroke, minimum hole, seal margin and allowable contact pitch. Ask specifically about the 61 multipart logical IDs and the 195-element text strip.
3. With the factory, choose reflective/transflective construction, LCD technology, viewing direction, temperature range and drive scheme. Agree on glass outline, seal boundary, contact ledge and connector arrangement.
4. Produce front/back ITO routing and a physical address table. Every source ID must map to one or more physical COM/SEG addresses; multiple pieces of one logical segment switch together. Preserve a separate explicit pin-to-address table.
5. Apply any required optical changes to a new revision and provide before/after overlays for review. Do not silently simplify small details or add visible bridges to the original artwork.
6. Release the agreed masks and connection drawing for samples. Validate each ID individually, all-on/all-off states, multipart IDs, text patterns, and representative gameplay frames on the physical samples.

The current package is ready for **geometry review and preliminary factory feasibility discussion**. Final ITO masks, physical pin numbers, electrical specifications and glass dimensions remain open.
