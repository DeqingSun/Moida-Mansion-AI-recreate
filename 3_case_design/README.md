# Original case artwork

Extracted from [Moida Mansion by Lucas Pope / dukope](https://dukope.itch.io/moida-mansion),
[public browser build 11926521](https://html-classic.itch.zone/html/11926521/index.html).
Downloaded 2026-10-20. These are original game assets, not reconstructed artwork.

- `source/hardware.jpg`: original `hardware_jpg.jpg?123123`; 1865 × 2740 px case face, red surface, black graphics, bezel, blank screen and resting buttons combined.
- `source/buttons.jpg`: original `buttons_jpg.jpg?2341235`; button-state sprite sheet.
- `source/glass.jpg`: original `glass_jpg.jpg`; screen reflection/texture overlay.
- `source/original-styles.css`: original browser positioning rules from the previously downloaded source.
- `index.html`: case-art preview at its original aspect ratio.

The artwork contains two large lower buttons and two smaller round buttons above.
The source contains raster artwork with shading and texture; it is not a clean
vector print mask or a mechanical case CAD model.

## Original browser coordinates (pixels, origin at top left)

| Element | X | Y | Width | Height |
|---|---:|---:|---:|---:|
| Case image | 0 | 0 | 1865 | 2740 |
| LCD panel container | 195 | 408 | 1476 | 1062 |
| Glass overlay | 133 | 354 | 1600 | 1168 |
| Mode button sprite region | 95 | 1562 | 740 | 319 |
| View button sprite region | 1031 | 1562 | 740 | 319 |
| Deny button sprite region | 95 | 2085 | 740 | 319 |
| Approve button sprite region | 1031 | 2085 | 740 | 319 |

Button sprite rows start at Y=0,320,640,960 respectively. Unpressed state starts
at X=0; pressed state at X=740. Sprite regions include surrounding artwork; these
are not physical button dimensions. The LCD container also has CSS scale(0.99)
with the default center transform origin. Screen coordinates here are CSS layout
references, not manufacturing cutout specifications.
