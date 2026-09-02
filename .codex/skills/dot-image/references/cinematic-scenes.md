# Cinematic Pixel-Art Scenes

Use this reference for full-screen or panoramic `scene` assets. Create an original environment from visual properties only; never reproduce a reference image's branding, text, identifiable layout, or proprietary characters.

## Composition

- Build four readable depth bands: near-black foreground framing, the gameplay plane, a detailed midground, and a quieter background.
- Use a fixed orthographic side-on camera. Keep the gameplay plane and primary architecture parallel to the canvas with no vanishing-point convergence.
- Use foreground cables, beams, foliage, masonry, or other silhouettes to frame the scene without obscuring the playable route.
- Keep the gameplay plane continuous and readable. Props, plants, reflections, and debris may enrich it but must not hide traversal edges.
- Favor controlled asymmetry and clusters of detail separated by calmer areas. Avoid evenly distributing objects across the canvas.
- Use small characters and props to establish scale. The environment should carry most of the visual storytelling.

## Environment Detail

- Suggest lived-in history through utilities, repairs, vents, pipes, awnings, furniture, plants, signage shapes, waterlines, and weathering.
- Repeat structural motifs with variation instead of cloning identical tiles.
- Give foreground, midground, and background different value ranges and edge density.
- Keep interactable objects more distinct than decorative objects through contrast, silhouette, or accent color.
- Leave generated signs blank or abstract unless the user provides exact required text.

## Color And Lighting

- Establish one scene-wide color script appropriate to the requested time and weather.
- Day scenes may combine sand, khaki, olive, and weathered concrete with deep navy or teal shadows and sparse cyan, coral, or amber accents.
- Night scenes may use magenta, red-orange, or sodium light against navy, petrol blue, and green-black shadows.
- Reserve the brightest values and highest chroma for focal lights, interactable objects, and small narrative accents.
- Use colored light as clustered bands and stepped value changes, not airbrushed glow.
- Water and reflective surfaces should echo the scene palette in broken horizontal clusters rather than smooth mirror gradients.

## Pixel Treatment

- Work at the `640x360` scene grid and review both native size and the default `1280x720` nearest-neighbor output.
- Use high-density but intentional pixel clusters. Fine detail should support material, depth, navigation, or story.
- Controlled ordered dithering is allowed only for broad atmosphere, water, and light falloff. Do not use automatic dithering, random noise, or dithered gameplay silhouettes.
- Prefer local-color edge separation over uniform black outlines. Near-black is most useful for occlusion and foreground framing.
- Preserve hard edges around the gameplay plane, characters, props, architecture, and foliage.

## Prompt Requirements

Include the requested setting plus:

- `cinematic side-scrolling pixel-art scene`
- `dense environmental storytelling`
- `deep foreground framing`
- `clear layered depth`
- `readable gameplay plane`
- `hard pixel clusters`
- `no logos, no watermark, no copied signage`

Describe the lighting palette directly. Do not ask the generator to copy a named game, storefront, promotional banner, or screenshot.

## Review

Reject or regenerate the scene when:

- The gameplay path disappears into decoration or shadow.
- Foreground framing covers important traversal space.
- Detail is evenly noisy instead of clustered into readable areas.
- Lighting becomes smooth painted glow rather than stepped pixel clusters.
- Architecture, roads, or the gameplay plane drift into isometric or perspective projection.
- Text, logos, or reference-specific arrangements appear.
- The scene only reads when enlarged and collapses at the `640x360` working grid.
