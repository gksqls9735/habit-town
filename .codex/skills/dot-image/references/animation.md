# Pixel Animation Direction

Read this reference only when creating animation frames or sprite sheets.

## User Requirements Priority

- Treat explicit user requirements for animation edits as the primary acceptance criteria. Apply those requirements before default harness preferences, recommended timing ranges, cleanup behavior, palette normalization, or stylistic defaults.
- When a user requirement conflicts with an automated harness result, revise the source or processed frames manually as needed, then verify the result against the user's requirement instead of accepting the harness output unchanged.
- Preserve the harness's mechanical checks where they still support the request, but document any intentional deviation from the default rules in the work report.

## Source Sheet Contract

- Generate one PNG containing equal-size cells with no gutters, labels, borders, guide lines, or frame numbers.
- Arrange frames left to right, then top to bottom. Keep every frame fully inside its cell.
- Use transparent alpha when reliable. A solid black isolation background is acceptable for `char` sheets because the harness removes border-connected dark pixels per frame.
- Keep the subject at a consistent scale, facing direction, camera angle, lighting direction, costume, equipment, and palette role.
- Choose one source-facing direction before drawing frames and keep every source cell facing that direction. A frame fails when only its face points correctly but its torso, hips, near and far limbs, or tail base are horizontally reversed.
- Never mirror an individual frame to create an alternating pose. Alternate limbs by redrawing or moving the intended near or far limb while preserving the same anatomical orientation. Mirror only the complete sprite sheet or complete rendered character at runtime when movement in the opposite world direction is required.
- Keep one fixed orthographic 2D view across every frame. Never rotate, tilt, zoom, or orbit the camera during an animation.
- Leave enough empty space for moving ears, tails, weapons, splashes, particles, and anticipation poses.
- Describe distinct key poses in the generation prompt. Do not ask only for several nearly identical copies.
- Do not leave white, cream, pale gray, or neutral-gray outline fringe pixels on the transparent silhouette edge. Bright edge pixels must either belong to the character's intentional interior fur/highlight area or be removed or replaced with the sprite's dark outline color by the harness.

## Source Character Size Contract

Use this contract whenever animating an existing character image.

- Preserve the source image's cell size unless the user explicitly asks for a new runtime grid. If the source character is `156 x 156`, each animation frame cell must also be `156 x 156`.
- When the source cell size is not the default harness grid, pass `--working-grid WIDTHxHEIGHT --scale 1` in animation mode so the harness validates and writes the app-sized cells directly.
- Treat apparent runtime size as the highest-priority acceptance criterion. Matching the cell size is not enough: if the visible character pixels shrink, grow, flatten, or widen during playback, the animation is not acceptable.
- Measure the source character's visible alpha bounding box before processing. Each frame should keep the visible body height, head size, torso volume, eye size, ear height, paw size, and tail thickness close to the source.
- Measure each finished frame's visible alpha bounding box and compare it to the idle/source frame and, when available, the accepted walk sheet. A frame that has the same canvas size but a much smaller visible bbox will still look wrong in-app.
- For generated or extracted sheets, preserve the accepted pose design first, then correct runtime display scale per frame when one pose naturally has a smaller bbox. Do not destructively resize the source art if that changes the accepted design.
- Record any required per-frame display scale in the animation manifest or integration code. For example, a belly-up roll frame may need a slightly larger display scale even though the PNG cell remains unchanged.
- When a source pet still sprite exists, pass it with `--size-reference`. If the accepted animation still appears smaller during playback, run the harness with `--scale-to-reference` so each frame is scaled against the original pet's visible alpha bounds while preserving the frame cell size.
- Do not fit oversized generated frames into the source cell by non-uniform scaling, vertical compression, horizontal stretching, or automatic contain-style resizing. Regenerate or rebuild the frames instead.
- Prefer source-preserving motion edits for small pet animations: move paws, tail, ears, cheeks, body offset, and shadow by a few pixels while keeping the main body mass unchanged.
- For walk cycles, the feet and paws should change visibly between frames, but the standing height should remain stable. Body bounce can be 1 to 3 pixels only.
- For rolling, jumping, or lying actions, rotation or pose changes may alter the alpha bounding box, but the character must not look resized. Keep the same pixel density and apparent mass; if the pose reads correctly but looks smaller, prefer a runtime scale compensation over repainting the accepted frame.
- Anchor character frames at bottom-center by default. Use the original sprite's ground contact line as the baseline unless the animation intentionally leaves the ground.
- If a generated sheet changes the character size, rebuild the sheet from the accepted source sprite or regenerate with an explicit "same cell size and same apparent height" constraint.
- Before accepting a sheet, compare a still frame against the source sprite at the runtime display size. Reject it if switching from idle to animation makes the pet visibly grow, shrink, flatten, or widen.

## Facing And Outline Preservation Contract

Use this contract for every animation derived from an accepted pet sprite.

- Treat the original pet PNG as the source of truth for facing direction and silhouette construction. Record whether it faces left, right, or front before editing, then compare every frame against that same orientation.
- Check more than the eyes and muzzle. Ear overlap, cheek placement, shoulder and chest turn, torso taper, hip placement, near and far paw order, and tail attachment must all agree with the source-facing direction.
- Keep near-side and far-side limbs semantically stable throughout the cycle. A raised opposite paw must be a new pose in the same view, not a horizontally mirrored body or a rear leg substituted for a front paw.
- Preserve the original outline palette. Reuse the source pet's exact black, charcoal, cocoa, or other deep outline colors; do not introduce pure black when the source uses a tinted dark color, and do not lighten a black outline into fur shading.
- Preserve outline topology at the native pixel grid: thickness, connected contour runs, stepped diagonals, intentional corner pixels, and the separation between overlapping body parts. Reject gaps, spikes, isolated dark pixels, doubled contour rows, softened diagonals, or transparent pinholes.
- When a processed sheet has excessive black contour pixels touching the external transparent background, lower only those external-edge contour pixels toward the source pet's outline palette. Remove messy outline burrs, spurs, and unsupported protruding edge pixels while preserving interior eye, mouth, fur, and limb-detail pixels.
- When changing a paw, ear, tail, or body segment, rebuild the exposed silhouette with source pixels from the nearest matching contour. Do not paint over the contour with interior fur colors or use antialiasing, blur, feathering, subpixel transforms, or noninteger scaling.
- `--preserve-source-palette` protects colors but does not prove that the outline shape is intact. Native-size visual comparison against the original pet remains mandatory after the harness runs.
- Alpha and halo checks are separate from outline integrity. A frame with binary alpha can still fail when its dark contour is broken, uneven, or inconsistent with the original pet.

## Motion Design

- Start from readable key poses: contact, recoil, passing, apex, impact, or recovery as appropriate to the motion.
- Preserve overall mass and volume. Squash and stretch may clarify soft creatures, but it must return to the base silhouette at the loop boundary.
- Use secondary motion for hair, ears, tails, cloth, fins, droplets, and accessories after the primary body motion is clear.
- Keep feet or the contact surface stable for grounded motion. The default character anchor is `bottom-center` to reduce positional jitter.
- Make the last frame transition cleanly back to the first for `loop` playback. Do not duplicate the first frame as the last unless the timing specifically needs a held pose.

Recommended starting points:

| State | Frames | FPS | Playback |
| --- | ---: | ---: | --- |
| Idle or breathing | 4-6 | 6-8 | `loop` |
| Walk, run, or swim | 6-8 | 8-12 | `loop` |
| Attack or interaction | 6-10 | 10-14 | `once` |
| Hurt or reaction | 3-4 | 8-12 | `once` |
| Defeat or transformation | 6-10 | 8-12 | `once` |

Use the user's requested timing when provided. These ranges are defaults, not fixed limits.

## Harness Behavior

Animation mode is enabled by `--frames` greater than 1. The harness:

1. Divides the raw sheet using `--columns` and the calculated row count.
2. Resizes every cell to the asset working grid with nearest-neighbor sampling.
3. Removes a connected dark isolation background from each character frame.
4. Aligns visible content using `--anchor`; `auto` resolves to `bottom-center` for characters and `none` for other asset types.
5. Quantizes all frames together with one shared palette to reduce color flicker.
6. Removes only near-white or neutral-gray fringe pixels that have strong transparent-edge contact, and darkens remaining bright edge pixels when removal would risk cutting intentional fur or highlights.
7. When `--size-reference` and `--scale-to-reference` are supplied, scales each frame's visible content up toward the original character's visible bounds without changing the frame cell dimensions.
8. Writes a clean sprite sheet, individual frame PNGs, and an `.animation.json` manifest.

Facing direction and outline topology require reference-aware visual review; they are not proven by grid, palette, alpha, or visible-bounds checks alone. Do not mark an animation accepted only because the automated harness exits successfully.

Example:

```bash
python .codex/skills/dot-image/scripts/dot_harness.py char cat-idle.png --theme cute --frames 6 --columns 6 --animation idle --fps 8 --playback loop --scale 1
```

Existing app-sized sprite example:

```bash
python .codex/skills/dot-image/scripts/dot_harness.py char hamster-baby-roll-spritesheet.png --asset-root assets/pets/animations --theme soft-modern-retro --view front --frames 4 --columns 4 --animation roll --fps 8 --anchor bottom-center --scale 1 --working-grid 158x158 --size-reference assets/pets/hamster-baby.png --preserve-source-palette
```

The raw sheet dimensions must divide evenly into the requested columns and calculated rows. The final sheet may contain transparent unused cells only when the last row is incomplete.

## Review

- Inspect each frame at the native working-grid size, not only an enlarged preview.
- Flip rapidly between adjacent frames to detect outline crawl, palette flicker, volume changes, and anchor jitter.
- Compare frame 0 and every following frame side by side. Confirm that head, torso, hips, limb depth order, and tail base retain one facing direction; reject a single reversed body part or mirrored frame.
- Overlay each frame with the original pet at native scale and inspect the full silhouette. Confirm that the source outline colors, contour thickness, stepped clusters, and limb-separation pixels remain connected and deliberate.
- Check the transparent silhouette edge for white, cream, pale gray, or neutral-gray outline fringe pixels. The harness records `edge_halo_cleanup` with removed and darkened edge pixels; treat any visible remaining light fringe as a blocker even when alpha and grid checks pass.
- Check external-background-touching black contour pixels against the source pet's outline palette. Treat heavy black edge buildup, noisy burrs, unsupported protrusions, and sticker-like contour edges as blockers; fix only the external edge unless the user's request explicitly asks for interior line edits.
- Compare the animation frames against the idle/source character and the accepted walk cycle at the real app display size. The pet should keep a similar visual footprint while changing pose.
- Check the harness manifest's visible bounds, size ratios, `size_scale`, and recommended runtime scale. Treat low ratios as a blocker unless `--scale-to-reference` was applied successfully or the app integration intentionally applies a matching per-frame display scale.
- Confirm every frame uses the same recorded 2D view with no perspective or camera drift.
- Preview at the manifest FPS and playback mode.
- Reject sheets with cropped motion, inconsistent identity, mixed facing directions, mirrored individual frames, broken or recolored outlines, accidental camera movement, partial alpha, blurred edges, or an unreadable loop boundary.
