# Extracted icon and title previews

Extracted from the existing JPEG resources in `../source/`. No new artwork or replacement font was generated. The source files remain unchanged.

Open `preview.png` to compare each source crop with its isolated black silhouette. Every non-source PNG has a transparent background; white in the preview represents empty space.

- `mode-stairs.png`: the two stairs/arrows together, from `buttons.jpg`.
- `view-magnifier.png`: magnifying glass including its original small highlight mark, from `buttons.jpg`.
- `deny-left-arrow.png` and `approve-right-arrow.png`: lower directional symbols, from `hardware.jpg`.
- `moida-mansion.png`: original stacked lettering, from `hardware.jpg`.
- `moida.png` and `mansion.png`: each word separately.
- `*-source.png`: unmodified rectangular source crops for comparison.
- `extract.py`: reproducible extraction, crop coordinates, and preview generation. Requires Python 3, Pillow, NumPy, and OpenCV.

The source is raster artwork. Dark symbols use a threshold with a narrow transparency transition to remove the red background. Small disconnected debris is excluded. For the red directional arrows, a 13-pixel morphological opening first removes the surrounding checker cells. The measured outline is resampled at one-pixel intervals and locally smoothed with a five-pixel Gaussian kernel, retaining the rounded arrowhead shoulders instead of imposing sharp polygon corners. The PNGs use supersampled antialiasing; the matching SVG files contain closed polygons. These are approximations fitted to the source silhouette, not exact original vector assets. Earlier rough PNG extractions are retained as `*-before.png`.

These files are preview raster masks without physical dimensions. They are not SolidWorks sketches or manufacturing-ready geometry. Once the appearance and intended millimeter sizes are decided, closed DXF contours can be prepared for SolidWorks, preserving holes and reviewing minimum printable feature sizes. The magnifier highlight is a separate island that will need consideration for the chosen printing method.
