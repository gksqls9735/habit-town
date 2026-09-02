# In-World Object Direction

Use these rules for props, furniture, pickups, plants, containers, fixtures, machinery, and environmental interactables that must belong inside the same scene as the other assets.

## Match the Asset Family

- Reuse the target scene's palette roles rather than inventing a separate palette: deep ambient shadow, local midtone, material highlight, and one restrained focal accent.
- Match the scene's light direction, shadow temperature, outline hues, pixel-cluster scale, and contrast range.
- Keep three to five readable value groups. Use the brightest pixels only on functional or story-relevant details.
- Build the silhouette from chunky, intentional clusters. Avoid isolated texture pixels, uniform noise, automatic dithering, and smooth vector-like curves.
- When a reference scene or existing asset set is available, derive visual rules from it without copying proprietary objects, logos, or recognizable designs.

## Preserve Approved Colors

- Treat the generated source palette as locked after visual approval.
- Run the harness with `--preserve-source-palette` so normalization cannot replace approved cream, cocoa, coral, shadow, or highlight colors with fixed-profile candidates.
- Color-count reduction may merge nearly identical source shades, but it must not apply theme RGB multipliers, brightness lifts, a profile palette, or a palette reference.
- Reject the clean output when a material changes color family, warmth, saturation role, or focal accent relative to the approved source.

## Composition and Camera

- Default to an orthographic 2D side view with no perspective convergence, camera tilt, lens distortion, or three-quarter rendering.
- Ground the object on a stable bottom-center anchor so it can be placed on the gameplay plane without visual jumping.
- Keep the full object inside the canvas with a small transparent safety margin. Aim for roughly 70–90% occupancy unless gameplay scale requires otherwise.
- Do not add a catalog pedestal, decorative frame, full background, or baked cast shadow. Contact pixels may suggest weight, but the scene should provide the environmental shadow.
- Preserve a consistent canvas size, anchor, visual scale, outline thickness, and light direction across object variants and animation frames.

## Material Language

- Wood: broad warm clusters, dark seams, sparse edge wear; avoid thin repeated grain lines.
- Metal: cool body shadows, compact hard highlights, selective warm reflections; avoid full-length glossy gradients.
- Stone: large planar value breaks and restrained chips; avoid speckled noise.
- Cloth: stepped folds made from grouped shapes; avoid soft airbrushed shading.
- Glass and liquid: limited transparent or bright clusters with a strong silhouette; avoid smooth opacity gradients.
- Plants: group leaves into masses with a few readable tips; avoid drawing every leaf as an isolated pixel.

## Object vs Icon

- Use `object` when the asset physically occupies the game world and must align to terrain, characters, or scene lighting.
- Use `icon` when the asset appears in inventory, HUD, menus, or ability UI. Icons may use stronger front-facing readability and higher contrast than their world counterpart.
- If both are requested, generate them as separate assets. Do not reuse a world object PNG as its UI icon without an explicit readability pass.

## Prompt Requirements

Include the subject and function, `orthographic 2D side view`, `in-world game object`, `scene-matched palette and lighting`, `grounded bottom-center silhouette`, `deliberate pixel clusters`, the selected theme, and either `transparent background` or `solid black isolation background`.

Reject and regenerate outputs with isometric or three-quarter perspective, unrelated palette accents, conflicting light direction, excessive micro-noise, soft shading, floating bases, inconsistent scale, cropped silhouettes, or a baked scenic backdrop.
