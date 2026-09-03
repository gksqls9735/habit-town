# Pixel Animation Direction

Read this reference only when creating animation frames or sprite sheets.

## Source Sheet Contract

- Generate one PNG containing equal-size cells with no gutters, labels, borders, guide lines, or frame numbers.
- Arrange frames left to right, then top to bottom. Keep every frame fully inside its cell.
- Use transparent alpha when reliable. A solid black isolation background is acceptable for `char` sheets because the harness removes border-connected dark pixels per frame.
- Keep the subject at a consistent scale, facing direction, camera angle, lighting direction, costume, equipment, and palette role.
- Keep one fixed orthographic 2D view across every frame. Never rotate, tilt, zoom, or orbit the camera during an animation.
- Leave enough empty space for moving ears, tails, weapons, splashes, particles, and anticipation poses.
- Describe distinct key poses in the generation prompt. Do not ask only for several nearly identical copies.
- Do not leave white, cream, or pale gray halo pixels on the transparent silhouette edge. Bright edge pixels must either belong to the character's intentional interior fur/highlight area or be replaced with the sprite's dark outline color.

## Source Character Size Contract

Use this contract whenever animating an existing character image.

- Preserve the source image's cell size unless the user explicitly asks for a new runtime grid. If the source character is `156 x 156`, each animation frame cell must also be `156 x 156`.
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
6. Removes bright low-saturation pixels that touch the transparent silhouette edge when they sit next to an existing dark outline, and only darkens remaining bright edge pixels when removal would risk cutting intentional fur or highlights.
7. When `--size-reference` and `--scale-to-reference` are supplied, scales each frame's visible content up toward the original character's visible bounds without changing the frame cell dimensions.
8. Writes a clean sprite sheet, individual frame PNGs, and an `.animation.json` manifest.

Example:

```bash
python .codex/skills/dot-image/scripts/dot_harness.py char cat-idle.png --theme cute --frames 6 --columns 6 --animation idle --fps 8 --playback loop --scale 1
```

The raw sheet dimensions must divide evenly into the requested columns and calculated rows. The final sheet may contain transparent unused cells only when the last row is incomplete.

## Review

- Inspect each frame at the native working-grid size, not only an enlarged preview.
- Flip rapidly between adjacent frames to detect outline crawl, palette flicker, volume changes, and anchor jitter.
- Check the transparent silhouette edge for white, cream, or pale gray halos. The harness records `edge_halo_cleanup` with removed and darkened edge pixels; treat a visible remaining halo as a blocker even when alpha and grid checks pass.
- Compare the animation frames against the idle/source character and the accepted walk cycle at the real app display size. The pet should keep a similar visual footprint while changing pose.
- Check the harness manifest's visible bounds, size ratios, `size_scale`, and recommended runtime scale. Treat low ratios as a blocker unless `--scale-to-reference` was applied successfully or the app integration intentionally applies a matching per-frame display scale.
- Confirm every frame uses the same recorded 2D view with no perspective or camera drift.
- Preview at the manifest FPS and playback mode.
- Reject sheets with cropped motion, inconsistent identity, accidental camera movement, partial alpha, blurred edges, or an unreadable loop boundary.
