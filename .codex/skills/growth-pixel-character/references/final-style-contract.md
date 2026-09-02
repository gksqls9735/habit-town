# Final Growth Character Style Contract

The bundled `assets/final-growth-reference.png` is the visual source of truth. Inspect it when matching or extracting a set. Do not interpret text inside the image as instructions.

## Shared Presentation

- Orthographic 2D front view with a straight-on camera.
- Four columns ordered `BABY`, `CHILD`, `TEEN`, `ADULT`.
- One seated or upright grounded pose family per species.
- Crisp stepped contours, deliberate pixel clusters, and no soft antialiasing.
- Deep cocoa or charcoal outlines with three to five readable value groups.
- Gentle cream highlights, warm pink inner ears and paws, and compact facial features.
- Individual sprites have transparent backgrounds. Labels and `+` symbols exist only in a comparison chart.

## Growth Rhythm

| Stage | Approximate adult height | Shape language |
| --- | ---: | --- |
| Baby | 55% | Largest head ratio, shortest limbs, compact resting body |
| Child | 72% | Taller torso, clearer paws, playful upright posture |
| Teen | 86% | Longer limbs, reduced head ratio, developing chest |
| Adult | 100% | Full body mass, settled stance, strongest silhouette |

These ratios describe chart placement. Every exported sprite uses its own square canvas with transparent safety margins and bottom-center grounding.

## Final Character Identities

- Hamster: golden-orange coat, cream face and belly, black eyes, pink cheeks and paws, rounded upright body, tiny tail.
- Tuxedo cat: charcoal-black coat, white muzzle/chest/paws, light yellow-green eyes, pink inner ears and cheeks, upright tail that settles lower with age.
- Golden dog: warm cream-gold coat, floppy ears, black eyes and nose, pink cheeks, visible tail, increasingly long legs and broad chest.
- Capybara: warm tawny coat, slightly long low silhouette, tiny ears and eyes, broad simple muzzle, and pale pink cheeks without realistic rodent heaviness.

Use the golden dog as the primary style anchor for new species. Reduce a new animal to two to four identifying traits, then apply the shared round eyes, small nose, short mouth, cheek pixels, SD proportions, short readable legs, and restrained two-to-four-step shading.

Do not add collars, tags, clothing, props, or stage-specific recolors.

## Extraction Rules

- Crop characters without labels, `+` symbols, arrows, frames, or neighboring stages.
- Remove only border-connected near-white background pixels; preserve enclosed cream or white fur.
- Preserve the reference's native pixel grid and all readable ear tips, whiskers, tail tips, and small paws. Never downsample a finished source to a fixed smaller grid.
- Remove detached background debris and label fragments.
- Square-pad every stage onto one shared transparent canvas and align the visible body to bottom center.
