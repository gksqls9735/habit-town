---
name: dot-image
description: Explicit-only general pixel-art asset skill. Use only when the user directly names `$dot-image`, asks to use the dot-image skill, or requests the dot-image harness by name. Do not auto-select this skill for Habit Town pet growth stages, pet-room assets, or pet animation work; use `growth-pixel-character` for those.
---

# Dot Image

Use this skill only when the user explicitly asks for `dot-image` or the dot-image harness. For Habit Town pet growth characters, pet-room visuals, and pet animation sprites, use `growth-pixel-character` instead.

Generate a raster asset or animation sheet, apply the selected visual theme, normalize it onto a fixed pixel grid, and deliver verified outputs from the selected image-category `clean/` folder.

Follow `.codex/common/patterns/image-assets.md` before choosing the output root.

## Style Profile

- Load the reusable style profile before composing any generation prompt. Read [references/style-profiles.md](references/style-profiles.md) and the resolved profile JSON.
- `auto` uses a project `.codex/context/dot-style.json` when present, otherwise the bundled `soft-modern-retro` profile.
- Treat the profile as the long-term source of truth for proportions, palette roles, outline language, pixel density, values, materials, and lighting. A background reference is only an optional scene-specific adjustment.
- Pass the resolved profile to the harness with `--style-profile`; omission uses `auto`.

## Asset Specifications

| Type | Working grid | Final size | Required prompt terms |
| --- | --- | --- | --- |
| `char` | 64 x 64 | 256 x 256 | `orthographic 2D side view`, `expressive modern pixel art`, `deliberate pixel clusters`, `solid black background` |
| `object` | 64 x 64 | 256 x 256 | `orthographic 2D side view`, `in-world game object`, `scene-matched palette and lighting`, `grounded silhouette` |
| `bg` | 128 x 128 | 512 x 512 | `orthographic 2D side view`, `layered pixel-art scenery`, `foreground midground background depth` |
| `scene` | 640 x 360 | 1280 x 720 | `orthographic 2D side view`, `cinematic side-scrolling pixel-art scene`, `dense environmental storytelling`, `readable gameplay plane` |
| `icon` | 32 x 32 | 128 x 128 | `orthographic 2D front view`, `distinctive silhouette`, `selective colored outlines`, `transparent alpha` |

The listed final sizes use each asset's default scale: `4x` for `char`, `object`, `bg`, and `icon`, and `2x` for `scene`. Use `--scale 1` when the user requests native working-grid dimensions.

For a supplied portrait or panoramic background whose composition must remain intact, pass `--working-grid WIDTHxHEIGHT` with the source aspect ratio. This override is limited to static `bg` and `scene` assets; it does not change their default grids.

## Viewpoint Standard

- Default every asset to an orthographic 2D projection. Read [references/viewpoints.md](references/viewpoints.md) before generating.
- Use `side` for `char`, `object`, `bg`, and `scene` unless the user explicitly requests another supported 2D view.
- Use `front` for `icon` by default.
- Supported views are `side`, `front`, and `top-down`. Do not silently use isometric, three-quarter perspective, 3D rendering, camera tilt, lens distortion, or vanishing-point depth.
- Pass the selected view to the harness with `--view`. The harness records the projection and view but visual inspection is still required.

## Output Mode

- Use static mode for one character pose, world object, compact background, cinematic scene, or icon. It remains the default and produces one clean PNG.
- Use `scene` for a full-screen or panoramic environment. Read [references/cinematic-scenes.md](references/cinematic-scenes.md) before generating. Keep `bg` for compact backgrounds, textures, and tiles.
- Use animation mode when the user requests motion, states, frames, or a sprite sheet. Read [references/animation.md](references/animation.md) before generating.
- When assets must share one scene or the user requests a combined preview, read [references/scene-integration.md](references/scene-integration.md). Create palette-linked variants and use the deterministic compositor instead of asking image generation to redraw the combined scene.
- When animating an existing asset, provide the clean PNG to the image-generation capability as the visual reference. Preserve its identity, proportions, palette roles, equipment, facing direction, and pixel-cluster language across every frame.
- When animating an existing character, preserve the source sprite's cell size and apparent body scale. Follow the Source Character Size Contract in [references/animation.md](references/animation.md); do not accept sheets where idle-to-animation playback makes the character visibly grow, shrink, flatten, or widen.
- The harness normalizes and validates supplied frames; it does not invent missing motion frames.

## Theme Selection

- Apply themes inside the resolved style profile. Themes must not replace its proportions, cluster language, value structure, or base palette family.
- Use `soft-modern-retro` when the user does not specify a theme.
- Built-in themes are `soft-modern-retro`, `fantasy`, `sci-fi`, `modern`, `cute`, and `horror`.
- Use `fantasy` with `--style-profile cinematic-sd.json` when the user explicitly requests the previous cinematic fantasy direction.
- Follow an explicit user choice. Do not silently replace it with the default.
- Read [references/themes.md](references/themes.md) for the selected theme's prompt direction and harness behavior.

## Shared Art Direction

- Use expressive modern pixel art built from chunky, deliberate pixel clusters.
- For cinematic scenes, increase detail density while preserving deliberate clusters, strong value grouping, and a readable gameplay plane.
- Default humanoid characters to a readable SD silhouette around 2.5 to 3 heads tall unless the user requests another proportion. Keep them charming without relying on emoji-like faces or extremely oversized eyes.
- Give characters distinctive silhouettes, readable poses, controlled asymmetry, and personality through posture and small details.
- Make in-world objects share the target scene's palette roles, light direction, outline hues, cluster scale, and material language. Read [references/objects.md](references/objects.md) before generating an `object`.
- Prefer selective deep-colored outlines over uniform pure-black contours.
- Use rich cool shadows and focused warm highlights. Reserve the brightest pixels for focal points.
- Avoid isolated pixel noise, automatic dithering, smooth vector-like curves, glossy mobile-game rendering, blur, and sprite antialiasing.
- Preserve useful transparency. Character and object isolation backgrounds are removed by the harness; background tiles may remain fully opaque where the artwork requires it.
- Read [references/art-direction.md](references/art-direction.md) before generating. Apply the asset-specific rules for characters, objects, environments, or icons.

## Workflow

1. Identify the asset type as `char`, `object`, `bg`, `scene`, or `icon`. Use `object` for props, furniture, plants, pickups, containers, fixtures, and environmental interactables; reserve `icon` for UI inventory or HUD art. If the request is ambiguous, infer it from the intended game use when safe.
2. Select the theme. Use the user's explicit choice or `soft-modern-retro` when omitted.
3. Select the supported 2D view. Use the asset default unless the user explicitly requests `side`, `front`, or `top-down`.
4. Inspect the project for existing naming and asset conventions. Choose an image-category root from `.codex/common/patterns/image-assets.md`, such as `src/assets/dot-image/characters/`, `src/assets/dot-image/furniture/`, `src/assets/dot-image/rewards/`, or `src/assets/dot-image/icons/`. Use a descriptive kebab-case PNG filename.
5. Build the generation prompt from the user's subject, the resolved reusable style profile, the orthographic 2D viewpoint, the selected theme, the relevant asset-specific rules, and every required prompt term for the selected asset type. Describe visual properties directly; do not request a copy of an existing game's characters, UI, logo, or proprietary assets.
6. Generate one raster PNG with the available image-generation capability. For animation mode, generate one evenly divided sprite sheet following [references/animation.md](references/animation.md). When the animation is derived from an existing character, lock the frame cell dimensions to the source sprite and preserve the source alpha bounding box scale as closely as the motion allows. Prefer `$generate2dsprite` when it is installed. Do not substitute SVG, CSS, emoji, or an icon library.
7. Save the unprocessed static image or sprite sheet to `<asset-root>/raw/<filename>.png`. Create the directory when needed.
8. Run the bundled harness from the project root with the same `<asset-root>`. The `--asset-root` option should point to the category folder that contains `raw/` and `clean/`. The `--theme` option may be omitted only for the default `soft-modern-retro` theme. The `--view` option may be omitted only when the asset default is intended:

   ```bash
   python .codex/skills/dot-image/scripts/dot_harness.py <char|object|bg|scene|icon> <filename>.png --asset-root <asset-root> --style-profile auto --theme <theme> --view <side|front|top-down>
   ```

   Once a generated image's colors have been accepted, always add `--preserve-source-palette` for that image and every derivative. This skips theme toning and fixed-profile RGB remapping while retaining the asset color cap, binary transparency, nearest-neighbor grid, and all verification checks. Do not use a palette reference or profile remapping to alter an accepted source palette unless the user explicitly requests recoloring.

   For an asset that belongs to a specific scene, preserve the reusable master and process a scene-linked variant with the verified background palette:

   ```bash
   python .codex/skills/dot-image/scripts/dot_harness.py char <variant>.png --asset-root <asset-root> --theme <theme> --view side --palette-reference <clean-background>.png
   ```

   For animation mode, declare the exact frame count and sheet columns:

   ```bash
   python .codex/skills/dot-image/scripts/dot_harness.py char <filename>.png --asset-root <asset-root> --theme <theme> --view side --frames 6 --columns 6 --animation idle --fps 8 --anchor bottom-center --scale 1
   ```

   When animating an existing pet or character, pass the original still sprite as the apparent-size reference. Add `--scale-to-reference` only after the animation poses are accepted and the remaining issue is that playback looks smaller than the original pet:

   ```bash
   python .codex/skills/dot-image/scripts/dot_harness.py char <filename>.png --asset-root <asset-root> --theme <theme> --view side --frames 4 --columns 4 --animation roll --fps 8 --anchor bottom-center --scale 1 --size-reference assets/pets/cat-baby.png --scale-to-reference
   ```

9. Treat a nonzero exit code or a failed verification as a blocking failure. Correct the input or regenerate it, then rerun the harness. Do not copy an unchecked raw image into the clean directory.
10. Inspect the clean PNG at native size and enlarged nearest-neighbor size. Confirm the selected 2D view, parallel projection, silhouette, focal pixels, selective outlines, transparency, and theme remain legible without perspective drift, noise, cropping, or distortion. For animation, also inspect the individual frame sequence, loop continuity, bottom-center anchoring, and source-size consistency. Compare at least one idle/source frame with the animated frames at the intended runtime display size before accepting the sheet. Treat visible-size consistency as the top priority for character animation: if the harness reports a low visible-bounds ratio, either rebuild the frame or keep the accepted design and record a matching per-frame runtime scale in the app integration.
11. Report the asset category, raw path, clean path, style profile, asset type, theme, 2D view, dimensions, palette reference when used, harness result, and any visible-size warnings. Animation mode additionally produces `<asset-root>/clean/<stem>/frame-###.png` and `<asset-root>/clean/<stem>.animation.json`, including per-frame visible bounds and recommended runtime scale. Composition mode produces a sibling `.composition.json`. The harness appends a machine-readable record to `<asset-root>/clean/dot-harness.log`.

## Operational Boundaries

- Always keep generated source images in the chosen category's `raw/` folder and processed results in the matching `clean/` folder.
- Do not collapse characters, furniture, rewards, icons, backgrounds, and scenes into one generic generated folder when their product roles are known.
- Never edit or overwrite a different existing asset to satisfy a new request.
- If Pillow or image generation is unavailable, stop and state the missing dependency or capability instead of fabricating a result.
- Keep implementation changes outside the asset folders scoped to what the user explicitly requested.
