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
6. Writes a clean sprite sheet, individual frame PNGs, and an `.animation.json` manifest.

Example:

```bash
python .codex/skills/dot-image/scripts/dot_harness.py char cat-idle.png --theme cute --frames 6 --columns 6 --animation idle --fps 8 --playback loop --scale 1
```

The raw sheet dimensions must divide evenly into the requested columns and calculated rows. The final sheet may contain transparent unused cells only when the last row is incomplete.

## Review

- Inspect each frame at the native working-grid size, not only an enlarged preview.
- Flip rapidly between adjacent frames to detect outline crawl, palette flicker, volume changes, and anchor jitter.
- Confirm every frame uses the same recorded 2D view with no perspective or camera drift.
- Preview at the manifest FPS and playback mode.
- Reject sheets with cropped motion, inconsistent identity, accidental camera movement, partial alpha, blurred edges, or an unreadable loop boundary.
