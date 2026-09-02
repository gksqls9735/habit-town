# Scene Integration

Use this workflow when characters, creatures, objects, and a background must look like one asset set or when the user requests a combined mood preview.

## Shared Asset-Set Contract

- Apply the resolved reusable style profile to every asset first. Scene integration narrows that shared direction; it does not define it.
- Finish and validate the target background first. It defines the scene palette, shadow temperature, highlight temperature, light direction, outline depth, and pixel-cluster density.
- Process scene-bound characters and objects with `--palette-reference <background.png>`. This builds a compact palette from both the asset and the target background instead of toning each asset in isolation.
- Default humanoid characters to an SD silhouette around 2.5 to 3 heads tall unless the user requests another proportion. Keep the head, hands, footwear, and primary equipment readable at the native grid.
- Judge scale on the background working grid, not on the enlarged PNG. On a 128-pixel-tall side-view background, start humanoid characters around 24 to 32 pixels tall and small resting animals around 10 to 16 pixels tall, then adjust for the intended world scale.
- Use one horizontal ground coordinate for every subject sharing a platform. Record placement from the bottom-center anchor.
- Match native outline thickness and cluster size. A sprite with twice the apparent pixel density of the background must be simplified or reduced before final use.

## Palette-Linked Processing

The palette reference must be a verified PNG in `src/assets/clean/`:

```bash
python .codex/skills/dot-image/scripts/dot_harness.py char hero-scene-set.png --theme fantasy --view side --palette-reference sunset-city.png
```

Use a new filename for a scene-linked variant. Do not overwrite the reusable master sprite merely to match one environment.

Palette linking improves local hue and value cohesion but cannot repair a conflicting light direction, outline language, camera, or material design. Regenerate the source asset from the shared style profile when those visual properties disagree.

## Deterministic Mood Preview

Use the compositor for layout and cohesion previews. It performs nearest-neighbor scaling, binary-alpha placement, one final shared-palette pass, grid validation, and manifest logging without redrawing the supplied assets.

Each `--layer` value is:

```text
filename.png,center_x,ground_y,height
```

All coordinates and heights use background working-grid pixels. `ground_y` is the horizontal surface where the layer's bottom edge rests.

```bash
python .codex/skills/dot-image/scripts/scene_compositor.py sunset-city.png sunset-city-preview.png \
  --layer hero-scene-set.png,76,92,28 \
  --layer sleeping-cat-scene-set.png,55,92,13
```

The compositor writes the preview PNG and a sibling `.composition.json` file in `src/assets/clean/`. It refuses to overwrite an existing preview unless `--force` is explicit.

## Review

- Confirm every foot, paw, wheel, or contact edge rests on the recorded ground line.
- Compare subject height to doors, windows, railings, and platform thickness.
- Inspect the native working grid for outline and cluster-density mismatch.
- Confirm the focal hierarchy still belongs to the gameplay layer rather than the sky or background windows.
- Reject a preview when the shared palette makes skin, markings, equipment, or interactable silhouettes unreadable. Adjust the source art or palette-linked variant instead of painting over the composite.
