#!/usr/bin/env python3
"""Normalize a pixel-pet room to a verified 9:16 nearest-neighbor grid."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image


PRESETS = {
    "premium-detailed": {"working": (288, 512), "scale": 2, "colors": 48},
    "detailed-pixel": {"working": (144, 256), "scale": 4, "colors": 24},
    "clean-strong": {"working": (72, 128), "scale": 8, "colors": 16},
    "balanced": {"working": (144, 256), "scale": 4, "colors": 32},
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare a 9:16 pixel-pet room background.")
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--preset", choices=tuple(PRESETS), default="premium-detailed")
    parser.add_argument("--working-width", type=int, default=None)
    parser.add_argument("--working-height", type=int, default=None)
    parser.add_argument("--scale", type=int, choices=(1, 2, 3, 4, 8), default=None)
    parser.add_argument("--colors", type=int, choices=range(8, 65), default=None)
    parser.add_argument("--force", action="store_true")
    return parser.parse_args()


def center_crop(image: Image.Image, target: tuple[int, int]) -> Image.Image:
    source_ratio = image.width / image.height
    target_ratio = target[0] / target[1]
    if source_ratio > target_ratio:
        width = round(image.height * target_ratio)
        left = (image.width - width) // 2
        return image.crop((left, 0, left + width, image.height))
    if source_ratio < target_ratio:
        height = round(image.width / target_ratio)
        top = (image.height - height) // 2
        return image.crop((0, top, image.width, top + height))
    return image


def main() -> int:
    args = parse_args()
    preset = PRESETS[args.preset]
    working_width = args.working_width or preset["working"][0]
    working_height = args.working_height or preset["working"][1]
    scale = args.scale or preset["scale"]
    colors = args.colors or preset["colors"]
    if not args.source.is_file():
        raise FileNotFoundError(args.source)
    if not 32 <= working_width <= 1024 or not 32 <= working_height <= 1024:
        raise ValueError("Working-grid dimensions must be between 32 and 1024")
    if args.output.suffix.lower() != ".png":
        raise ValueError("Output must be a PNG")
    manifest = args.output.with_suffix(".pet-room.json")
    existing = [path for path in (args.output, manifest) if path.exists()]
    if existing and not args.force:
        raise FileExistsError("Outputs exist; use --force for a reviewed replacement")

    working = (working_width, working_height)
    with Image.open(args.source) as opened:
        source = center_crop(opened.convert("RGB"), working)
    small = source.resize(working, Image.Resampling.NEAREST)
    quantized = small.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    final_size = (working[0] * scale, working[1] * scale)
    final = quantized.resize(final_size, Image.Resampling.NEAREST)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    final.save(args.output, "PNG", optimize=True)
    for y in range(final.height):
        for x in range(final.width):
            if final.getpixel((x, y)) != quantized.getpixel((x // scale, y // scale)):
                raise ValueError(f"Pixel-grid verification failed at {(x, y)}")

    manifest.write_text(
        json.dumps(
            {
                "version": 1,
                "type": "pixel-pet-room",
                "preset": args.preset,
                "finish": "polished-new",
        "detail_contract": "preserve-layered-trim-board-variation-and-fine-texture",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source": str(args.source.resolve()),
                "output": str(args.output.resolve()),
                "working_grid": list(working),
                "output_scale": scale,
                "output_size": list(final_size),
                "colors": len(final.getcolors(maxcolors=1_000_000) or []),
                "opaque": True,
                "grid_aligned": True,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"[Pet Room Success] {args.output} [{args.preset}] ({working[0]}x{working[1]} -> {final_size[0]}x{final_size[1]})")
    print(f"[Pet Room Manifest] {manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
