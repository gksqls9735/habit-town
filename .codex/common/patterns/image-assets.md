# Image Asset Organization Pattern

Use this pattern when generating, importing, processing, or applying raster image assets.


## Core Principle

Image folders should describe the image's product role, not just whether the file is common or generated.

Keep source, processed, and runtime-ready files separate so generated drafts do not get mistaken for accepted app assets.


## Asset Categories

Choose the folder from the image's intended use:

- `characters`: character sprites, portraits, growth stages, expressions, and animation sheets
- `rooms`: room backgrounds, fixed room layouts, wall and floor scenes
- `furniture`: chairs, desks, beds, shelves, lamps, and other placed room objects
- `decor`: wall items, floor items, collectibles, plants, posters, and nonfunctional props
- `inventory`: item thumbnails, collectible icons, shop item images, and owned-item previews
- `rewards`: coins, gems, treasure boxes, claim effects, badges, and completion visuals
- `tasks`: task category art, empty states, proof placeholders, and task-specific illustrations
- `goals`: goal category art, onboarding illustrations, and goal setup imagery
- `icons`: generated PNG UI icons that are not supplied by the normal icon library
- `backgrounds`: non-room backgrounds, tiles, textures, and environmental backdrops
- `scenes`: composed or panoramic scenes that are used as full visual contexts
- `references`: source references, mood references, user-provided images, and comparison sheets

Do not place feature-owned images into a generic image folder when the product role is clear.


## Folder Structure

Use an existing project convention first when one is already clear. For new generated image assets, prefer:

```text
src/
  assets/
    images/
      <category>/
        raw/
        clean/
        manifests/
        references/
```

For pixel-art harness outputs that need a dedicated pipeline, prefer:

```text
src/
  assets/
    dot-image/
      characters/
        raw/
        clean/
      furniture/
        raw/
        clean/
      rewards/
        raw/
        clean/
      icons/
        raw/
        clean/
```

Use `raw/` for unprocessed generated files, source sheets, and drafts. Use `clean/` only for verified, accepted, app-ready files. Use `references/` for images that guide generation but are not shipped directly. Use `manifests/` for animation metadata, generation metadata, palette notes, or composition records when the tool supports separate metadata.


## Naming

- Use descriptive kebab-case names, such as `hamster-baby-idle.png`, `cozy-bed-level-01.png`, or `coin-reward-large.png`.
- Include the subject, state, stage, variant, or level when it affects runtime selection.
- Keep animation state names in the filename when the file is a sheet, such as `tuxedo-cat-idle-sheet.png`.
- Avoid generic names like `image.png`, `asset.png`, `new-icon.png`, or `generated.png`.
- Do not overwrite an unrelated accepted asset. Create a new versioned or variant filename when the visual meaning changes.


## Placement Rules

- Character growth stages belong under `characters/` or the dedicated growth-character asset root.
- Room backgrounds belong under `rooms/`; non-room environmental art belongs under `backgrounds/` or `scenes/`.
- Furniture and decorative room objects belong under `furniture/` or `decor/`, not under generic objects.
- Reward visuals belong under `rewards/`, including currency, boxes, claim badges, and completion effects.
- Inventory thumbnails may reference the same source asset, but generated inventory-only thumbnails belong under `inventory/`.
- Generated PNG UI icons belong under `icons/` unless they are launcher icons, which follow the active platform's app icon rules.
- User-provided or web-found visual references belong under `references/` and must not be treated as app-ready assets.


## Integration Rules

- Inspect existing imports and asset folders before adding a new root.
- Keep generated source files and verified output files in the same category root whenever the harness supports it.
- Update code imports to use the clean or app-ready path, not the raw path.
- Keep feature-specific images close to their owning asset category; keep code feature folders for behavior and state.
- Report raw path, clean path, category, image role, dimensions, and verification result after generation.
