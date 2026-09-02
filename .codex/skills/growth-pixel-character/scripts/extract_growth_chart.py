#!/usr/bin/env python3
"""Extract four transparent, square-padded sprites from a growth chart."""

from __future__ import annotations

import argparse
import json
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from statistics import median

from PIL import Image


STAGES = ("baby", "child", "teen", "adult")


def parse_box(value: str) -> tuple[int, int, int, int]:
    try:
        box = tuple(int(part) for part in value.split(","))
    except ValueError as error:
        raise argparse.ArgumentTypeError(f"Invalid box: {value}") from error
    if len(box) != 4 or box[2] <= box[0] or box[3] <= box[1]:
        raise argparse.ArgumentTypeError(f"Expected x1,y1,x2,y2: {value}")
    return box


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract baby, child, teen, and adult sprites from a chart."
    )
    parser.add_argument("chart", type=Path)
    parser.add_argument("--prefix", required=True)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("src/assets/growth-pixel-character/raw"),
    )
    parser.add_argument("--boxes", nargs=4, type=parse_box, required=True)
    parser.add_argument("--background-distance", type=int, default=54)
    parser.add_argument("--padding", type=float, default=0.08)
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace outputs for the same prefix after a reviewed crop correction",
    )
    return parser.parse_args()


def estimate_background(image: Image.Image) -> tuple[int, int, int]:
    width, height = image.size
    patch = max(1, min(width, height) // 20)
    samples: list[tuple[int, int, int]] = []
    for left, top in (
        (0, 0),
        (width - patch, 0),
        (0, height - patch),
        (width - patch, height - patch),
    ):
        for red, green, blue, alpha in image.crop(
            (left, top, left + patch, top + patch)
        ).get_flattened_data():
            if alpha:
                samples.append((red, green, blue))
    if not samples:
        return 255, 255, 255
    return tuple(round(median(channel)) for channel in zip(*samples))


def remove_border_background(
    image: Image.Image,
    background: tuple[int, int, int],
    distance: int,
) -> int:
    pixels = image.load()
    width, height = image.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    limit = distance * distance

    def matches(x: int, y: int) -> bool:
        red, green, blue, alpha = pixels[x, y]
        if alpha == 0:
            return True
        return (
            (red - background[0]) ** 2
            + (green - background[1]) ** 2
            + (blue - background[2]) ** 2
            <= limit
        )

    def enqueue(x: int, y: int) -> None:
        offset = y * width + x
        if not visited[offset] and matches(x, y):
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
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)
    return removed


def square_pad(image: Image.Image, padding: float) -> Image.Image:
    bounds = image.getbbox()
    if bounds is None:
        raise ValueError("Extraction produced an empty sprite")
    sprite = image.crop(bounds)
    margin = max(2, round(max(sprite.size) * padding))
    side = max(sprite.size) + margin * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    x = (side - sprite.width) // 2
    y = side - margin - sprite.height
    canvas.alpha_composite(sprite, (x, y))
    return canvas


def main() -> int:
    args = parse_args()
    if not args.chart.is_file():
        raise FileNotFoundError(args.chart)
    if not 1 <= args.background_distance <= 160:
        raise ValueError("--background-distance must be between 1 and 160")
    if not 0 <= args.padding <= 0.5:
        raise ValueError("--padding must be between 0 and 0.5")
    if not args.prefix or Path(args.prefix).name != args.prefix:
        raise ValueError("--prefix must be a plain filename prefix")

    source = Image.open(args.chart).convert("RGBA")
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    expected_outputs = [
        output_dir / f"{args.prefix}-{stage}.png" for stage in STAGES
    ]
    manifest = output_dir / f"{args.prefix}.growth-extraction.json"
    existing = [path for path in (*expected_outputs, manifest) if path.exists()]
    if existing and not args.force:
        raise FileExistsError(
            "Outputs already exist; review the new boxes and rerun with --force: "
            + ", ".join(str(path) for path in existing)
        )
    records = []

    for stage, box in zip(STAGES, args.boxes):
        if box[0] < 0 or box[1] < 0 or box[2] > source.width or box[3] > source.height:
            raise ValueError(f"Box is outside chart bounds: {box}")
        crop = source.crop(box)
        background = estimate_background(crop)
        removed = remove_border_background(crop, background, args.background_distance)
        prepared = square_pad(crop, args.padding)
        output = output_dir / f"{args.prefix}-{stage}.png"
        prepared.save(output, "PNG", optimize=True)
        records.append(
            {
                "stage": stage,
                "box": list(box),
                "background_rgb": list(background),
                "removed_pixels": removed,
                "output": str(output),
                "size": list(prepared.size),
                "has_transparency": prepared.getchannel("A").getextrema()[0] == 0,
            }
        )
        print(f"[Growth Extract] {stage}: {output} ({prepared.width}x{prepared.height})")

    manifest.write_text(
        json.dumps(
            {
                "version": 1,
                "type": "growth-chart-extraction",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": str(args.chart.resolve()),
                "source_size": list(source.size),
                "prefix": args.prefix,
                "stages": records,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"[Growth Extract Success] manifest: {manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
