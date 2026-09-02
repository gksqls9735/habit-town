# Expressive Modern Pixel-Art Direction

Apply the shared principles and then the section matching the requested asset type. Produce an original result; do not copy existing characters, creatures, costumes, logos, interfaces, or identifiable scenes.

## Shared Principles

- Use orthographic 2D projection and the selected view from [viewpoints.md](viewpoints.md).
- Construct forms from deliberate pixel clusters rather than smooth painted transitions.
- Use 3 to 5 clear value groups: deep edge or occlusion shadow, shadow, base color, light, and a small focal highlight.
- Prefer selective outlines. Use deep navy, brown, plum, or a darker local color instead of surrounding every form with pure black.
- Combine rich cool colors such as teal, cobalt, navy, and violet with focused warm accents such as coral, amber, cream, or red-orange.
- Keep silhouettes readable against both bright and dark scenes.
- Use controlled asymmetry and a few irregular details to create personality.
- Avoid random single-pixel noise, automatic dithering, glossy vector-like rendering, photorealistic texture, and uniformly smooth curves.

## Characters

- Default to a clean side-profile sprite suitable for left-right movement.
- Default humanoid characters to SD proportions around 2.5 to 3 heads tall: enlarged head, compact torso, shortened limbs, and slightly oversized hands or footwear. Keep age, role, and anatomy recognizable, and follow an explicit request for different proportions.
- Communicate personality through posture, eyebrows, mouth shape, clothing, equipment, fins, ears, tails, or other silhouette features instead of relying only on very large eyes.
- Keep major facial features and pose readable at native size.
- At a 64 x 64 working grid, use 1 to 2 pixel-wide edge details and remove features that collapse after normalization.
- Reserve the brightest cluster for one or two focal areas such as eyes, wet skin, metal equipment, or facial highlights.
- Avoid perfect bilateral symmetry unless it is essential to the design.

## In-World Objects

- Read [objects.md](objects.md) and apply its scene-matching, grounding, material, and variant-consistency rules.
- Treat an object as part of the environment rather than as a floating catalog illustration or UI badge.
- Match the receiving scene's palette roles, outline hues, light direction, cluster scale, and contrast range.
- Keep a stable bottom-center anchor, readable function, and crisp contact edge at native size.
- Reserve `icon` for inventory, HUD, menu, and ability art.

## Environments

- Build clear foreground, midground, and background layers with distinct value ranges.
- Allow restrained atmospheric lighting, haze, particles, bubbles, light shafts, and color falloff in scenery.
- Keep terrain edges, plants, props, and interactable elements aligned to readable pixel clusters.
- Use dark cool depth colors and brighter warm or cyan focal accents to guide attention.
- Controlled tonal transitions are allowed in environmental atmosphere, but gameplay-relevant silhouettes must remain crisp.
- Avoid uniformly tiled surfaces. Add controlled variation and a few recognizable landmarks while keeping seamless edges when a tileable asset is requested.

## Cinematic Scenes

- Keep architecture and the gameplay plane in orthographic side elevation. Build depth with layered overlap, value, color, and scale groups instead of converging perspective lines.
- Use the dedicated `scene` asset type for full-screen, panoramic, or side-scrolling environments.
- Read [cinematic-scenes.md](cinematic-scenes.md) and apply its composition, lighting, detail-density, and gameplay-readability rules.
- Keep `bg` for compact backgrounds, textures, and seamless tiles.

## Icons

- Use one dominant silhouette and no more than two secondary details.
- Prefer 12 to 20 visible colors at a 32 x 32 working grid.
- Use selective colored outlines and one compact highlight cluster.
- Remove decorative details that cannot be identified at native size.

## Native-Size Review

Reject or regenerate an asset when any of these are true:

- The subject is identifiable only in the enlarged preview.
- Important features merge into the outline at native size.
- Smooth shading or antialiasing survives as noisy clusters after normalization.
- The result resembles a generic glossy mobile icon instead of deliberate pixel art.
- The design depends on copied branding or identifiable proprietary content.
