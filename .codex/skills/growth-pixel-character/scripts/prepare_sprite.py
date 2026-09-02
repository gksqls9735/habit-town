#!/usr/bin/env python3
"""Normalize a generated growth sprite onto the fixed pixel-pet grid."""

from __future__ import annotations

import argparse
import json
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image


STAGE_HEIGHT_RATIOS = {
    "baby": 0.55,
    "child": 0.72,
    "teen": 0.86,
    "adult": 1.0,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare a generated pixel sprite for grid normalization."
    )
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--light-threshold", type=int, default=235)
    parser.add_argument("--max-chroma", type=int, default=24)
    parser.add_argument("--padding", type=float, default=0.04)
    parser.add_argument("--stage", choices=tuple(STAGE_HEIGHT_RATIOS), default="adult")
    parser.add_argument("--working-size", type=int, default=128)
    parser.add_argument("--scale", type=int, default=2)
    parser.add_argument("--colors", type=int, default=32)
    parser.add_argument("--adult-visible-height", type=int, default=112)
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def remove_connected_light_background(
    image: Image.Image, light_threshold: int, max_chroma: int
) -> int:
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_background(x: int, y: int) -> bool:
        red, green, blue, alpha = pixels[x, y]
        return (
            alpha > 0
            and min(red, green, blue) >= light_threshold
            and max(red, green, blue) - min(red, green, blue) <= max_chroma
        )

    def enqueue(x: int, y: int) -> None:
        offset = y * width + x
        if not visited[offset] and is_background(x, y):
            visited[offset] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    removed = 0
    while queue:
        x, y = queue.popleft()
        red, green, blue, _ = pixels[x, y]
        pixels[x, y] = (red, green, blue, 0)
        removed += 1
        if x > 0:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y > 0:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)
    return removed


def main() -> None:
    args = parse_args()
    if not 0 <= args.light_threshold <= 255:
        raise ValueError("--light-threshold must be between 0 and 255")
    if not 0 <= args.max_chroma <= 255:
        raise ValueError("--max-chroma must be between 0 and 255")
    if not 0 <= args.padding <= 0.5:
        raise ValueError("--padding must be between 0 and 0.5")
    if not 32 <= args.working_size <= 512:
        raise ValueError("--working-size must be between 32 and 512")
    if args.scale not in (1, 2, 4, 8):
        raise ValueError("--scale must be 1, 2, 4, or 8")
    if not 8 <= args.colors <= 64:
        raise ValueError("--colors must be between 8 and 64")
    if not 1 <= args.adult_visible_height <= args.working_size:
        raise ValueError("--adult-visible-height must fit inside the working grid")
    if args.output.suffix.lower() != ".png":
        raise ValueError("Output must be a PNG")

    output = args.output.resolve()
    manifest = output.with_suffix(".sprite.json")
    existing = [path for path in (output, manifest) if path.exists()]
    if existing and not args.force:
        raise FileExistsError("Outputs exist; use --force for a reviewed replacement")

    image = Image.open(args.input).convert("RGBA")
    removed = remove_connected_light_background(
        image, args.light_threshold, args.max_chroma
    )
    bbox = image.getbbox()
    if bbox is None:
        raise ValueError("Background removal left no visible sprite")

    source_sprite = image.crop(bbox)
    margin = max(1, round(args.working_size * args.padding))
    max_width = args.working_size - margin * 2
    target_height = round(
        args.adult_visible_height * STAGE_HEIGHT_RATIOS[args.stage]
    )
    resize_ratio = min(
        target_height / source_sprite.height,
        max_width / source_sprite.width,
    )
    resized_size = (
        max(1, round(source_sprite.width * resize_ratio)),
        max(1, round(source_sprite.height * resize_ratio)),
    )
    sprite = source_sprite.resize(resized_size, Image.Resampling.NEAREST)
    alpha = sprite.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
    rgb = sprite.convert("RGB")
    quantized = rgb.quantize(
        colors=args.colors,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.NONE,
    ).convert("RGB")
    sprite = quantized.convert("RGBA")
    sprite.putalpha(alpha)

    canvas = Image.new(
        "RGBA", (args.working_size, args.working_size), (0, 0, 0, 0)
    )
    x = (args.working_size - sprite.width) // 2
    y = args.working_size - margin - sprite.height
    canvas.alpha_composite(sprite, (x, y))
    final_size = args.working_size * args.scale
    final = canvas.resize((final_size, final_size), Image.Resampling.NEAREST)

    output.parent.mkdir(parents=True, exist_ok=True)
    final.save(output, "PNG", optimize=True)

    for y_pixel in range(final.height):
        for x_pixel in range(final.width):
            expected = canvas.getpixel(
                (x_pixel // args.scale, y_pixel // args.scale)
            )
            if final.getpixel((x_pixel, y_pixel)) != expected:
                raise ValueError(
                    f"Pixel-grid verification failed at {(x_pixel, y_pixel)}"
                )

    visible_bbox = final.getchannel("A").getbbox()
    opaque_colors = {
        pixel[:3]
        for pixel in final.get_flattened_data()
        if pixel[3] > 0
    }
    manifest.write_text(
        json.dumps(
            {
                "version": 1,
                "type": "fixed-grid-growth-sprite",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": str(args.input.resolve()),
                "output": str(output),
                "stage": args.stage,
                "stage_height_ratio": STAGE_HEIGHT_RATIOS[args.stage],
                "working_grid": [args.working_size, args.working_size],
                "output_scale": args.scale,
                "output_size": [final_size, final_size],
                "max_colors": args.colors,
                "opaque_colors": len(opaque_colors),
                "alpha": "binary",
                "grounding": "bottom-center",
                "visible_bbox": list(visible_bbox) if visible_bbox else None,
                "grid_aligned": True,
                "removed_border_pixels": removed,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(
        f"[Sprite Prepared] {output} [{args.stage}] "
        f"({args.working_size}x{args.working_size} -> {final_size}x{final_size}, "
        f"{len(opaque_colors)} opaque colors, removed {removed} border pixels)"
    )


if __name__ == "__main__":
    main()
