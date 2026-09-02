#!/usr/bin/env python3
"""Compose four verified growth-stage pixel sprites into a labeled chart."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


STAGES = ("BABY", "CHILD", "TEEN", "ADULT")
HEIGHTS = (34, 43, 52, 61)
BASE_SIZE = 320
CELL_WIDTH = BASE_SIZE // 4
SCALE = 4


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compose baby, child, teen, and adult pixel sprites into a chart."
    )
    parser.add_argument("baby", type=Path)
    parser.add_argument("child", type=Path)
    parser.add_argument("teen", type=Path)
    parser.add_argument("adult", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument(
        "--labels",
        nargs=4,
        default=STAGES,
        metavar=("BABY", "CHILD", "TEEN", "ADULT"),
    )
    return parser.parse_args()


def load_native(path: Path) -> Image.Image:
    if not path.is_file():
        raise FileNotFoundError(path)
    image = Image.open(path).convert("RGBA")
    if image.width != image.height or image.width % 64 != 0:
        raise ValueError(f"Expected a square 64-grid PNG: {path} ({image.size})")
    if image.getbbox() is None:
        raise ValueError(f"Sprite is fully transparent: {path}")
    return image.resize((64, 64), Image.Resampling.NEAREST)


def fit_sprite(image: Image.Image, target_height: int) -> Image.Image:
    bbox = image.getbbox()
    assert bbox is not None
    cropped = image.crop(bbox)
    ratio = target_height / cropped.height
    width = max(1, round(cropped.width * ratio))
    return cropped.resize((width, target_height), Image.Resampling.NEAREST)


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def main() -> None:
    args = parse_args()
    sources = (args.baby, args.child, args.teen, args.adult)
    labels = tuple(str(label).upper() for label in args.labels)
    if any(not label or len(label) > 12 for label in labels):
        raise ValueError("Each label must contain 1 to 12 characters")

    background = "#FFF9E8"
    canvas = Image.new("RGBA", (BASE_SIZE, BASE_SIZE), background)
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    ground_y = 198
    label_y = 220

    for index, (source, label, height) in enumerate(zip(sources, labels, HEIGHTS)):
        sprite = fit_sprite(load_native(source), height)
        center_x = index * CELL_WIDTH + CELL_WIDTH // 2
        canvas.alpha_composite(sprite, (center_x - sprite.width // 2, ground_y - sprite.height))

        text_width, text_height = text_size(draw, label, font)
        box_width = max(42, text_width + 10)
        box_height = 16
        left = center_x - box_width // 2
        top = label_y
        draw.rectangle((left, top, left + box_width, top + box_height), fill="#FFF1CF", outline="#79513E", width=1)
        draw.text(
            (center_x - text_width // 2, top + (box_height - text_height) // 2 - 1),
            label,
            fill="#5D4541",
            font=font,
        )

    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    final = canvas.resize((BASE_SIZE * SCALE, BASE_SIZE * SCALE), Image.Resampling.NEAREST)
    final.save(output)

    manifest = {
        "kind": "growth-pixel-character",
        "stages": [
            {"name": label.lower(), "source": str(source.resolve()), "height": height}
            for source, label, height in zip(sources, labels, HEIGHTS)
        ],
        "base_size": [BASE_SIZE, BASE_SIZE],
        "scale": SCALE,
        "output_size": list(final.size),
        "background": background,
        "resampling": "nearest-neighbor",
    }
    output.with_suffix(".growth.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"[Growth Chart Success] {output} ({final.width}x{final.height})")


if __name__ == "__main__":
    main()
