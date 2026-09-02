#!/usr/bin/env python3
"""Compose verified pixel assets without generative redesign or soft scaling."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

from dot_harness import load_style_profile, palette_image, select_profile_colors


def plain_png(filename: str, label: str) -> str:
    safe = Path(filename).name
    if safe != filename or Path(safe).suffix.lower() != ".png":
        raise ValueError(f"{label} must be a plain .png filename without directories")
    return safe


def parse_layer(value: str) -> dict[str, int | str]:
    parts = value.split(",")
    if len(parts) != 4:
        raise argparse.ArgumentTypeError(
            "Layer must use filename.png,center_x,ground_y,height"
        )
    filename = plain_png(parts[0], "Layer filename")
    try:
        center_x, ground_y, height = (int(item) for item in parts[1:])
    except ValueError as error:
        raise argparse.ArgumentTypeError(
            "Layer center_x, ground_y, and height must be integers"
        ) from error
    if height < 1:
        raise argparse.ArgumentTypeError("Layer height must be at least 1")
    return {
        "filename": filename,
        "center_x": center_x,
        "ground_y": ground_y,
        "height": height,
    }


def binary_alpha(image: Image.Image) -> Image.Image:
    result = image.convert("RGBA")
    alpha = result.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
    result.putalpha(alpha)
    return result


def crop_visible(image: Image.Image, filename: str) -> Image.Image:
    prepared = binary_alpha(image)
    bounds = prepared.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError(f"Layer is empty after alpha normalization: {filename}")
    return prepared.crop(bounds)


def compact_palette(
    image: Image.Image,
    colors: int,
    profile_palette: list[tuple[int, int, int]] | None,
) -> Image.Image:
    rgba = binary_alpha(image)
    red, green, blue, alpha = rgba.split()
    rgb = Image.merge("RGB", (red, green, blue))
    if profile_palette is None:
        quantized = rgb.quantize(
            colors=colors,
            method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.NONE,
        ).convert("RGBA")
    else:
        selected = select_profile_colors(
            rgb,
            alpha,
            profile_palette,
            colors,
            None,
        )
        quantized = rgb.quantize(
            palette=palette_image(selected),
            dither=Image.Dither.NONE,
        ).convert("RGBA")
    quantized.putalpha(alpha)
    return quantized


def verify_grid(image: Image.Image, working_size: tuple[int, int], scale: int) -> None:
    expected = (working_size[0] * scale, working_size[1] * scale)
    if image.size != expected:
        raise ValueError(f"Unexpected preview size: {image.size}; expected {expected}")
    pixels = image.load()
    for top in range(0, image.height, scale):
        for left in range(0, image.width, scale):
            sample = pixels[left, top]
            for y in range(top, top + scale):
                for x in range(left, left + scale):
                    if pixels[x, y] != sample:
                        raise ValueError(f"Pixel grid verification failed at ({x}, {y})")


def compose(
    project_root: Path,
    background_filename: str,
    output_filename: str,
    layers: list[dict[str, int | str]],
    working_size: tuple[int, int],
    scale: int,
    colors: int,
    force: bool,
    style_profile_requested: str,
) -> Path:
    clean_dir = project_root / "src" / "assets" / "clean"
    background_path = clean_dir / plain_png(background_filename, "Background")
    output_path = clean_dir / plain_png(output_filename, "Output")
    if not background_path.is_file():
        raise FileNotFoundError(f"Clean background not found: {background_path}")
    if output_path == background_path:
        raise ValueError("Output must not overwrite the background")
    if output_path.exists() and not force:
        raise FileExistsError(f"Output already exists; use --force to replace it: {output_path}")
    if not layers:
        raise ValueError("At least one --layer is required")

    style_profile, _ = load_style_profile(project_root, style_profile_requested)

    with Image.open(background_path) as source:
        canvas = source.convert("RGBA").resize(working_size, Image.Resampling.NEAREST)

    layer_records = []
    for layer in layers:
        filename = str(layer["filename"])
        layer_path = clean_dir / filename
        if not layer_path.is_file():
            raise FileNotFoundError(f"Clean layer not found: {layer_path}")
        with Image.open(layer_path) as source:
            sprite = crop_visible(source, filename)

        target_height = int(layer["height"])
        target_width = max(1, round(sprite.width * target_height / sprite.height))
        sprite = sprite.resize(
            (target_width, target_height),
            Image.Resampling.NEAREST,
        )
        sprite = binary_alpha(sprite)

        center_x = int(layer["center_x"])
        ground_y = int(layer["ground_y"])
        left = center_x - target_width // 2
        top = ground_y - target_height
        right = left + target_width
        bottom = top + target_height
        if left < 0 or top < 0 or right > working_size[0] or bottom > working_size[1]:
            raise ValueError(
                f"Layer {filename} exceeds the working grid at {(left, top, right, bottom)}"
            )

        canvas.alpha_composite(sprite, (left, top))
        layer_records.append(
            {
                "file": layer_path.relative_to(project_root).as_posix(),
                "center_x": center_x,
                "ground_y": ground_y,
                "height": target_height,
                "bounds": [left, top, right, bottom],
            }
        )

    normalized = compact_palette(
        canvas,
        colors,
        style_profile.get("palette_rgb") if style_profile is not None else None,
    )
    final = normalized.resize(
        (working_size[0] * scale, working_size[1] * scale),
        Image.Resampling.NEAREST,
    )
    verify_grid(final, working_size, scale)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    final.save(output_path, "PNG", optimize=True)
    manifest_path = output_path.with_suffix(".composition.json")
    manifest = {
        "version": 1,
        "type": "pixel-scene-composition",
        "projection": "orthographic-2d",
        "background": background_path.relative_to(project_root).as_posix(),
        "output": output_path.relative_to(project_root).as_posix(),
        "working_grid": {"width": working_size[0], "height": working_size[1]},
        "output_scale": scale,
        "palette_colors": colors,
        "style_profile": (
            str(style_profile["name"]) if style_profile is not None else None
        ),
        "layers": layer_records,
    }
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    log_path = clean_dir / "dot-harness.log"
    with log_path.open("a", encoding="utf-8", newline="\n") as log_file:
        log_file.write(
            json.dumps(
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "mode": "composition",
                    "projection": "orthographic-2d",
                    "background": background_path.relative_to(project_root).as_posix(),
                    "output": output_path.relative_to(project_root).as_posix(),
                    "manifest": manifest_path.relative_to(project_root).as_posix(),
                    "working_grid": list(working_size),
                    "output_scale": scale,
                    "palette_colors": colors,
                    "style_profile": (
                        str(style_profile["name"])
                        if style_profile is not None
                        else None
                    ),
                    "layer_count": len(layer_records),
                    "grid_aligned": True,
                },
                ensure_ascii=False,
            )
            + "\n"
        )

    print(
        f"[Composition Success] {output_path} "
        f"({working_size[0]}x{working_size[1]} grid, {len(layer_records)} layers; "
        f"manifest: {manifest_path})"
    )
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compose clean pixel assets on one shared grid without redesigning them."
    )
    parser.add_argument("background", help="Clean background PNG filename")
    parser.add_argument("output", help="New clean preview PNG filename")
    parser.add_argument(
        "--layer",
        action="append",
        type=parse_layer,
        default=[],
        metavar="PNG,X,GROUND_Y,HEIGHT",
        help="Clean layer plus bottom-center placement in working-grid pixels",
    )
    parser.add_argument("--width", type=int, default=128, help="Working-grid width")
    parser.add_argument("--height", type=int, default=128, help="Working-grid height")
    parser.add_argument("--scale", type=int, choices=(1, 2, 4), default=4)
    parser.add_argument("--colors", type=int, default=72)
    parser.add_argument("--style-profile", default="auto")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.width < 1 or args.height < 1:
            raise ValueError("Working-grid dimensions must be positive")
        if args.colors < 8 or args.colors > 256:
            raise ValueError("Palette colors must be between 8 and 256")
        compose(
            args.project_root.resolve(),
            args.background,
            args.output,
            args.layer,
            (args.width, args.height),
            args.scale,
            args.colors,
            args.force,
            args.style_profile,
        )
    except (FileExistsError, FileNotFoundError, OSError, ValueError) as error:
        print(f"[Composition Error] {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
