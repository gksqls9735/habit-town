#!/usr/bin/env python3
"""Extract a low-resolution growth strip without resampling its native pixels."""

from __future__ import annotations

import argparse
import json
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

from extract_growth_chart import (
    estimate_background,
    parse_box,
    remove_border_background,
)


STAGES = ("baby", "child", "teen", "adult")


def keep_largest_alpha_component(image: Image.Image) -> int:
    """Remove detached separators and debris while preserving the main sprite."""
    alpha = image.getchannel("A")
    pixels = alpha.load()
    width, height = image.size
    remaining = {
        (x, y)
        for y in range(height)
        for x in range(width)
        if pixels[x, y] != 0
    }
    components: list[list[tuple[int, int]]] = []
    while remaining:
        start = remaining.pop()
        queue = deque([start])
        component = [start]
        while queue:
            x, y = queue.popleft()
            for dx, dy in (
                (-1, -1), (0, -1), (1, -1),
                (-1, 0), (1, 0),
                (-1, 1), (0, 1), (1, 1),
            ):
                neighbor = (x + dx, y + dy)
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    queue.append(neighbor)
                    component.append(neighbor)
        components.append(component)
    if not components:
        return 0
    largest = max(components, key=len)
    removed = 0
    rgba = image.load()
    for component in components:
        if component is largest:
            continue
        for x, y in component:
            red, green, blue, _ = rgba[x, y]
            rgba[x, y] = (red, green, blue, 0)
            removed += 1
    return removed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract a four-stage strip on one shared native pixel canvas."
    )
    parser.add_argument("strip", type=Path)
    parser.add_argument("--prefix", required=True)
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=Path("src/assets/growth-pixel-character/raw"),
    )
    parser.add_argument(
        "--clean-dir",
        type=Path,
        default=Path("src/assets/growth-pixel-character/clean"),
    )
    parser.add_argument("--boxes", nargs=4, type=parse_box, required=True)
    parser.add_argument("--background-distance", type=int, default=44)
    parser.add_argument("--padding", type=int, default=6)
    parser.add_argument("--scale", type=int, choices=(1, 2, 3, 4), default=2)
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def next_power_of_two(value: int) -> int:
    return 1 if value <= 1 else 1 << (value - 1).bit_length()


def main() -> int:
    args = parse_args()
    if not args.strip.is_file():
        raise FileNotFoundError(args.strip)
    if not args.prefix or Path(args.prefix).name != args.prefix:
        raise ValueError("--prefix must be a plain filename prefix")
    if not 1 <= args.background_distance <= 160:
        raise ValueError("--background-distance must be between 1 and 160")
    if not 0 <= args.padding <= 64:
        raise ValueError("--padding must be between 0 and 64")

    source = Image.open(args.strip).convert("RGBA")
    sprites: list[Image.Image] = []
    stage_records: list[dict[str, object]] = []
    for stage, box in zip(STAGES, args.boxes):
        if box[0] < 0 or box[1] < 0 or box[2] > source.width or box[3] > source.height:
            raise ValueError(f"Box is outside strip bounds: {box}")
        crop = source.crop(box)
        background = estimate_background(crop)
        removed = remove_border_background(crop, background, args.background_distance)
        debris_removed = keep_largest_alpha_component(crop)
        bounds = crop.getbbox()
        if bounds is None:
            raise ValueError(f"Stage became empty after extraction: {stage}")
        sprite = crop.crop(bounds)
        sprites.append(sprite)
        stage_records.append(
            {
                "stage": stage,
                "box": list(box),
                "background_rgb": list(background),
                "removed_pixels": removed,
                "detached_pixels_removed": debris_removed,
                "content_size": list(sprite.size),
            }
        )

    largest = max(max(sprite.size) for sprite in sprites)
    canvas_size = next_power_of_two(largest + args.padding * 2)
    raw_dir = args.raw_dir.resolve()
    clean_dir = args.clean_dir.resolve()
    raw_dir.mkdir(parents=True, exist_ok=True)
    clean_dir.mkdir(parents=True, exist_ok=True)
    manifest = clean_dir / f"{args.prefix}.native-growth.json"
    preview_path = clean_dir / f"{args.prefix}-preview.png"
    outputs = [
        path
        for stage in STAGES
        for path in (
            raw_dir / f"{args.prefix}-{stage}.png",
            clean_dir / f"{args.prefix}-{stage}.png",
        )
    ]
    existing = [path for path in (*outputs, manifest, preview_path) if path.exists()]
    if existing and not args.force:
        raise FileExistsError(
            "Outputs already exist; use --force only for a reviewed replacement: "
            + ", ".join(str(path) for path in existing)
        )

    output_size = canvas_size * args.scale
    clean_images: list[Image.Image] = []
    for sprite, record in zip(sprites, stage_records):
        stage = str(record["stage"])
        native = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        x = (canvas_size - sprite.width) // 2
        y = canvas_size - args.padding - sprite.height
        native.alpha_composite(sprite, (x, y))
        clean = native.resize(
            (output_size, output_size), Image.Resampling.NEAREST
        )
        raw_path = raw_dir / f"{args.prefix}-{stage}.png"
        clean_path = clean_dir / f"{args.prefix}-{stage}.png"
        native.save(raw_path, "PNG", optimize=True)
        clean.save(clean_path, "PNG", optimize=True)
        clean_images.append(clean)
        alpha = clean.getchannel("A").getextrema()
        if alpha != (0, 255):
            raise ValueError(f"Invalid transparency for {stage}: {alpha}")
        record.update(
            {
                "raw": str(raw_path),
                "clean": str(clean_path),
                "native_canvas": [canvas_size, canvas_size],
                "output_size": [output_size, output_size],
                "scale": args.scale,
                "resampling": "nearest-neighbor",
                "has_transparency": True,
                "grid_aligned": True,
            }
        )
        print(
            f"[Native Growth Success] {stage}: {clean_path} "
            f"({canvas_size}x{canvas_size} -> {output_size}x{output_size})"
        )

    preview = Image.new(
        "RGBA", (output_size * len(clean_images), output_size), (255, 250, 240, 255)
    )
    for index, clean in enumerate(clean_images):
        preview.alpha_composite(clean, (index * output_size, 0))
    preview.save(preview_path, "PNG", optimize=True)

    manifest.write_text(
        json.dumps(
            {
                "version": 1,
                "type": "native-growth-strip",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": str(args.strip.resolve()),
                "source_size": list(source.size),
                "prefix": args.prefix,
                "native_canvas": [canvas_size, canvas_size],
                "output_scale": args.scale,
                "preview": str(preview_path),
                "stages": stage_records,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"[Native Growth Manifest] {manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
