#!/usr/bin/env python3
"""Normalize generated artwork into verified, grid-aligned pixel art."""

from __future__ import annotations

import argparse
import json
import math
import sys
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image


SPECS = {
    "char": {"target": (64, 64), "scale": 4, "colors": 32},
    "object": {"target": (64, 64), "scale": 4, "colors": 40},
    "bg": {"target": (128, 128), "scale": 4, "colors": 72},
    "scene": {"target": (640, 360), "scale": 2, "colors": 128},
    "icon": {"target": (32, 32), "scale": 4, "colors": 16},
}

THEMES = {
    "soft-modern-retro": {
        "rgb": (1.03, 1.01, 0.97),
        "lift": 7,
        "palette_scale": 1.05,
    },
    "fantasy": {"rgb": (1.02, 0.98, 0.92), "lift": 4, "palette_scale": 1.00},
    "sci-fi": {"rgb": (0.90, 1.02, 1.10), "lift": 2, "palette_scale": 1.10},
    "modern": {"rgb": (1.00, 1.00, 1.00), "lift": 4, "palette_scale": 1.00},
    "cute": {"rgb": (1.05, 1.02, 0.98), "lift": 8, "palette_scale": 1.15},
    "horror": {"rgb": (1.00, 0.82, 0.90), "lift": 0, "palette_scale": 0.85},
}

ART_DIRECTION = "expressive-modern-pixel"
PROJECTION = "orthographic-2d"
VIEWS = ("side", "front", "top-down")
DEFAULT_VIEWS = {
    "char": "side",
    "object": "side",
    "bg": "side",
    "scene": "side",
    "icon": "front",
}
DEFAULT_STYLE_PROFILE = "soft-modern-retro.json"
BUNDLED_PROFILE_DIR = Path(__file__).resolve().parent.parent / "references" / "profiles"


def parse_hex_color(value: str) -> tuple[int, int, int]:
    if len(value) != 7 or not value.startswith("#"):
        raise ValueError(f"Invalid style-profile color: {value}")
    try:
        return tuple(int(value[index : index + 2], 16) for index in (1, 3, 5))
    except ValueError as error:
        raise ValueError(f"Invalid style-profile color: {value}") from error


def load_style_profile(
    project_root: Path,
    requested: str,
) -> tuple[dict[str, object] | None, Path | None]:
    if requested == "none":
        return None, None

    project_profile = project_root / ".codex" / "context" / "dot-style.json"
    if requested == "auto":
        profile_path = (
            project_profile
            if project_profile.is_file()
            else BUNDLED_PROFILE_DIR / DEFAULT_STYLE_PROFILE
        )
    else:
        safe_name = Path(requested).name
        if safe_name != requested or Path(safe_name).suffix.lower() != ".json":
            raise ValueError(
                "Style profile must be auto, none, or a plain .json filename"
            )
        project_candidate = project_root / ".codex" / "context" / safe_name
        bundled_candidate = BUNDLED_PROFILE_DIR / safe_name
        profile_path = (
            project_candidate if project_candidate.is_file() else bundled_candidate
        )

    if not profile_path.is_file():
        raise FileNotFoundError(f"Style profile not found: {profile_path}")
    try:
        profile = json.loads(profile_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ValueError(f"Invalid style-profile JSON: {profile_path}") from error
    if profile.get("version") != 1 or not isinstance(profile.get("name"), str):
        raise ValueError("Style profile requires version 1 and a string name")
    palette = profile.get("palette")
    colors = palette.get("colors") if isinstance(palette, dict) else None
    if not isinstance(colors, list) or not 8 <= len(colors) <= 256:
        raise ValueError("Style profile requires 8 to 256 palette colors")
    profile["palette_rgb"] = [parse_hex_color(str(color)) for color in colors]
    return profile, profile_path


def remove_connected_dark_background(image: Image.Image, threshold: int = 32) -> Image.Image:
    """Clear dark pixels connected to the canvas border without erasing enclosed outlines."""
    result = image.copy()
    pixels = result.load()
    width, height = result.size
    queue: deque[tuple[int, int]] = deque()
    seen: set[tuple[int, int]] = set()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen:
            continue
        seen.add((x, y))

        red, green, blue, alpha = pixels[x, y]
        if alpha == 0 or max(red, green, blue) <= threshold:
            pixels[x, y] = (red, green, blue, 0)
            if x > 0:
                queue.append((x - 1, y))
            if x + 1 < width:
                queue.append((x + 1, y))
            if y > 0:
                queue.append((x, y - 1))
            if y + 1 < height:
                queue.append((x, y + 1))

    return result


def resize_to_target(image: Image.Image, target: tuple[int, int]) -> Image.Image:
    """Center-crop to the target aspect ratio before nearest-neighbor resizing."""
    source_width, source_height = image.size
    target_width, target_height = target
    source_ratio = source_width / source_height
    target_ratio = target_width / target_height

    if source_ratio > target_ratio:
        crop_width = max(1, round(source_height * target_ratio))
        left = (source_width - crop_width) // 2
        image = image.crop((left, 0, left + crop_width, source_height))
    elif source_ratio < target_ratio:
        crop_height = max(1, round(source_width / target_ratio))
        top = (source_height - crop_height) // 2
        image = image.crop((0, top, source_width, top + crop_height))

    return image.resize(target, Image.Resampling.NEAREST)


def parse_working_grid(value: str) -> tuple[int, int]:
    try:
        width, height = (int(part) for part in value.lower().split("x", 1))
    except (TypeError, ValueError) as error:
        raise argparse.ArgumentTypeError("Expected WIDTHxHEIGHT") from error
    if not 32 <= width <= 1024 or not 32 <= height <= 1024:
        raise argparse.ArgumentTypeError("Working-grid dimensions must be 32 to 1024")
    return width, height


def palette_image(colors: list[tuple[int, int, int]]) -> Image.Image:
    if not colors:
        raise ValueError("Palette requires at least one color")
    palette = Image.new("P", (1, 1))
    values = [channel for color in colors for channel in color]
    values.extend(list(colors[-1]) * (256 - len(colors)))
    palette.putpalette(values)
    return palette


def select_profile_colors(
    toned: Image.Image,
    alpha: Image.Image,
    candidates: list[tuple[int, int, int]],
    color_count: int,
    palette_reference: Image.Image | None,
) -> list[tuple[int, int, int]]:
    limit = min(color_count, len(candidates))
    full_palette = palette_image(candidates)
    mapped = toned.quantize(palette=full_palette, dither=Image.Dither.NONE)
    current_counts = [0] * len(candidates)
    for index, alpha_value in zip(mapped.tobytes(), alpha.tobytes()):
        if alpha_value >= 128 and index < len(current_counts):
            current_counts[index] += 1

    reference_counts = [0] * len(candidates)
    if palette_reference is not None:
        reference = palette_reference.convert("RGB").resize(
            toned.size,
            Image.Resampling.NEAREST,
        )
        mapped_reference = reference.quantize(
            palette=full_palette,
            dither=Image.Dither.NONE,
        )
        for index in mapped_reference.tobytes():
            if index < len(reference_counts):
                reference_counts[index] += 1

    current_total = max(1, sum(current_counts))
    reference_total = max(1, sum(reference_counts))
    ranked = sorted(
        range(len(candidates)),
        key=lambda index: (
            current_counts[index] / current_total
            + reference_counts[index] / reference_total,
            -index,
        ),
        reverse=True,
    )
    return [candidates[index] for index in ranked[:limit]]


def normalize_palette(
    image: Image.Image,
    color_count: int,
    rgb_multipliers: tuple[float, float, float],
    brightness_lift: int,
    palette_reference: Image.Image | None = None,
    profile_palette: list[tuple[int, int, int]] | None = None,
    preserve_source_palette: bool = False,
) -> Image.Image:
    """Apply theme toning, a deliberate compact palette, and binary transparency."""
    red, green, blue, alpha = image.split()
    if preserve_source_palette:
        toned = Image.merge("RGB", (red, green, blue))
    else:
        red_scale, green_scale, blue_scale = rgb_multipliers
        red = red.point(lambda value: min(255, round(value * red_scale) + brightness_lift))
        green = green.point(lambda value: min(255, round(value * green_scale) + brightness_lift))
        blue = blue.point(lambda value: min(255, round(value * blue_scale) + brightness_lift))
        toned = Image.merge("RGB", (red, green, blue))
    if preserve_source_palette:
        quantized = toned.quantize(
            colors=color_count,
            method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.NONE,
        ).convert("RGB")
    elif profile_palette is not None:
        selected = select_profile_colors(
            toned,
            alpha,
            profile_palette,
            color_count,
            palette_reference,
        )
        quantized = toned.quantize(
            palette=palette_image(selected),
            dither=Image.Dither.NONE,
        ).convert("RGB")
    elif palette_reference is None:
        quantized = toned.quantize(
            colors=color_count,
            method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.NONE,
        ).convert("RGB")
    else:
        reference = palette_reference.convert("RGB").resize(
            image.size,
            Image.Resampling.NEAREST,
        )
        palette_source = Image.new("RGB", (image.width * 2, image.height))
        palette_source.paste(reference, (0, 0))
        palette_source.paste(toned, (image.width, 0))
        shared_palette = palette_source.quantize(
            colors=color_count,
            method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.NONE,
        )
        quantized = toned.quantize(
            palette=shared_palette,
            dither=Image.Dither.NONE,
        ).convert("RGB")
    binary_alpha = alpha.point(lambda value: 255 if value >= 128 else 0)
    quantized.putalpha(binary_alpha)
    transparent = Image.new("RGBA", image.size, (0, 0, 0, 0))
    return Image.composite(quantized, transparent, binary_alpha)


def verify_output(
    image: Image.Image,
    target: tuple[int, int],
    scale: int,
    max_colors: int,
) -> dict[str, int | bool]:
    expected_size = (target[0] * scale, target[1] * scale)
    if image.size != expected_size:
        raise ValueError(f"Unexpected output size: {image.size}; expected {expected_size}")

    pixels = image.load()
    for top in range(0, image.height, scale):
        for left in range(0, image.width, scale):
            expected = pixels[left, top]
            for y in range(top, top + scale):
                for x in range(left, left + scale):
                    if pixels[x, y] != expected:
                        raise ValueError(f"Pixel grid verification failed at ({x}, {y})")

    alpha_values = set(image.getchannel("A").tobytes())
    if not alpha_values.issubset({0, 255}):
        raise ValueError("Output contains partially transparent antialiased pixels")

    rgba_bytes = image.tobytes()
    colors = {rgba_bytes[index : index + 4] for index in range(0, len(rgba_bytes), 4)}
    visible_colors = len({color for color in colors if color[3] != 0})
    if visible_colors > max_colors:
        raise ValueError(
            f"Visible palette contains {visible_colors} colors; expected at most {max_colors}"
        )

    return {
        "width": image.width,
        "height": image.height,
        "unique_colors": len(colors),
        "visible_colors": visible_colors,
        "has_transparency": 0 in alpha_values,
        "grid_aligned": True,
    }


def split_sheet(
    source: Image.Image,
    frame_count: int,
    columns: int,
) -> tuple[list[Image.Image], int]:
    """Split a gutterless sheet from left to right, then top to bottom."""
    rows = math.ceil(frame_count / columns)
    if source.width % columns != 0 or source.height % rows != 0:
        raise ValueError(
            "Source sheet dimensions must divide evenly into the requested columns and rows"
        )

    cell_width = source.width // columns
    cell_height = source.height // rows
    frames = []
    for index in range(frame_count):
        column = index % columns
        row = index // columns
        left = column * cell_width
        top = row * cell_height
        frames.append(source.crop((left, top, left + cell_width, top + cell_height)))
    return frames, rows


def align_frame(
    frame: Image.Image,
    anchor: str,
    frame_index: int,
) -> tuple[Image.Image, tuple[int, int]]:
    """Align visible pixels without cropping, returning the applied offset."""
    if anchor == "none":
        return frame, (0, 0)

    binary_alpha = frame.getchannel("A").point(
        lambda value: 255 if value >= 128 else 0
    )
    bounds = binary_alpha.getbbox()
    if bounds is None:
        raise ValueError(f"Animation frame {frame_index} is empty after background removal")

    left, top, right, bottom = bounds
    width, height = frame.size
    if anchor == "bottom-center":
        current_x = (left + right - 1) // 2
        current_y = bottom - 1
        desired_x = (width - 1) // 2
        desired_y = max(0, height - 2)
    elif anchor == "center":
        current_x = (left + right - 1) // 2
        current_y = (top + bottom - 1) // 2
        desired_x = (width - 1) // 2
        desired_y = (height - 1) // 2
    else:
        raise ValueError(f"Unknown anchor: {anchor}")

    offset_x = max(-left, min(desired_x - current_x, width - right))
    offset_y = max(-top, min(desired_y - current_y, height - bottom))
    aligned = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    aligned.alpha_composite(frame, (offset_x, offset_y))
    return aligned, (offset_x, offset_y)


def normalize_frames_with_shared_palette(
    frames: list[Image.Image],
    target: tuple[int, int],
    color_count: int,
    theme_spec: dict[str, object],
    palette_reference: Image.Image | None = None,
    profile_palette: list[tuple[int, int, int]] | None = None,
    preserve_source_palette: bool = False,
) -> list[Image.Image]:
    """Quantize all frames together so equivalent colors do not flicker."""
    palette_strip = Image.new(
        "RGBA",
        (target[0] * len(frames), target[1]),
        (0, 0, 0, 0),
    )
    for index, frame in enumerate(frames):
        palette_strip.paste(frame, (index * target[0], 0))

    normalized_strip = normalize_palette(
        palette_strip,
        color_count,
        theme_spec["rgb"],
        theme_spec["lift"],
        palette_reference,
        profile_palette,
        preserve_source_palette,
    )
    return [
        normalized_strip.crop(
            (index * target[0], 0, (index + 1) * target[0], target[1])
        )
        for index in range(len(frames))
    ]


def append_log(clean_dir: Path, record: dict[str, object]) -> None:
    with (clean_dir / "dot-harness.log").open(
        "a",
        encoding="utf-8",
        newline="\n",
    ) as log_file:
        log_file.write(json.dumps(record, ensure_ascii=False) + "\n")


def run_static_harness(
    asset_type: str,
    raw_path: Path,
    clean_path: Path,
    project_root: Path,
    theme: str,
    output_scale: int,
    view: str,
    palette_reference: Image.Image | None = None,
    palette_reference_path: Path | None = None,
    style_profile: dict[str, object] | None = None,
    style_profile_path: Path | None = None,
    working_grid: tuple[int, int] | None = None,
    preserve_source_palette: bool = False,
) -> Path:
    spec = SPECS[asset_type]
    theme_spec = THEMES[theme]
    target = working_grid or spec["target"]
    with Image.open(raw_path) as source:
        small = resize_to_target(source.convert("RGBA"), target)

    if asset_type in {"char", "object"}:
        small = remove_connected_dark_background(small)

    color_count = max(8, round(spec["colors"] * theme_spec["palette_scale"]))
    normalized = normalize_palette(
        small,
        color_count,
        theme_spec["rgb"],
        theme_spec["lift"],
        palette_reference,
        style_profile.get("palette_rgb") if style_profile is not None else None,
        preserve_source_palette,
    )
    final_size = (target[0] * output_scale, target[1] * output_scale)
    final = normalized.resize(final_size, Image.Resampling.NEAREST)
    verification = verify_output(final, target, output_scale, color_count)

    clean_path.parent.mkdir(parents=True, exist_ok=True)
    final.save(clean_path, "PNG", optimize=True)
    append_log(
        clean_path.parent,
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "mode": "static",
            "asset_type": asset_type,
            "theme": theme,
            "projection": PROJECTION,
            "view": view,
            "art_direction": ART_DIRECTION,
            "raw_path": raw_path.relative_to(project_root).as_posix(),
            "clean_path": clean_path.relative_to(project_root).as_posix(),
            "working_grid": list(target),
            "output_scale": output_scale,
            "palette_reference": (
                palette_reference_path.relative_to(project_root).as_posix()
                if palette_reference_path is not None
                else None
            ),
            "style_profile": (
                str(style_profile["name"]) if style_profile is not None else None
            ),
            "style_profile_path": (
                style_profile_path.relative_to(project_root).as_posix()
                if style_profile_path is not None
                and style_profile_path.is_relative_to(project_root)
                else str(style_profile_path) if style_profile_path is not None else None
            ),
            "palette_mode": "source-preserved" if preserve_source_palette else "profile",
            **verification,
        },
    )

    print(
        f"[Harness Success] {ART_DIRECTION}/{PROJECTION}/{view}/{theme}/{asset_type} "
        f"static asset verified: "
        f"{clean_path} ({verification['width']}x{verification['height']}, "
        f"{verification['visible_colors']} visible colors)"
    )
    return clean_path


def run_animation_harness(
    asset_type: str,
    raw_path: Path,
    clean_path: Path,
    project_root: Path,
    theme: str,
    output_scale: int,
    frame_count: int,
    columns: int,
    animation_name: str,
    fps: int,
    anchor: str,
    playback: str,
    view: str,
    palette_reference: Image.Image | None = None,
    palette_reference_path: Path | None = None,
    style_profile: dict[str, object] | None = None,
    style_profile_path: Path | None = None,
    preserve_source_palette: bool = False,
) -> Path:
    spec = SPECS[asset_type]
    theme_spec = THEMES[theme]
    target = spec["target"]
    color_count = max(8, round(spec["colors"] * theme_spec["palette_scale"]))

    with Image.open(raw_path) as source:
        source_frames, rows = split_sheet(source.convert("RGBA"), frame_count, columns)

    prepared_frames = []
    offsets = []
    for index, source_frame in enumerate(source_frames):
        frame = resize_to_target(source_frame, target)
        if asset_type in {"char", "object"}:
            frame = remove_connected_dark_background(frame)
        frame, offset = align_frame(frame, anchor, index)
        prepared_frames.append(frame)
        offsets.append({"x": offset[0], "y": offset[1]})

    normalized_frames = normalize_frames_with_shared_palette(
        prepared_frames,
        target,
        color_count,
        theme_spec,
        palette_reference,
        style_profile.get("palette_rgb") if style_profile is not None else None,
        preserve_source_palette,
    )
    final_size = (target[0] * output_scale, target[1] * output_scale)
    final_frames = []
    verifications = []
    for frame in normalized_frames:
        final_frame = frame.resize(final_size, Image.Resampling.NEAREST)
        verifications.append(
            verify_output(final_frame, target, output_scale, color_count)
        )
        final_frames.append(final_frame)

    clean_dir = clean_path.parent
    frame_dir = clean_dir / clean_path.stem
    expected_names = {f"frame-{index:03d}.png" for index in range(frame_count)}
    if frame_dir.exists():
        stale_frames = sorted(
            path.name
            for path in frame_dir.glob("frame-*.png")
            if path.name not in expected_names
        )
        if stale_frames:
            raise ValueError(
                f"Frame directory contains stale harness outputs: {', '.join(stale_frames)}"
            )

    clean_dir.mkdir(parents=True, exist_ok=True)
    frame_dir.mkdir(parents=True, exist_ok=True)
    sheet = Image.new(
        "RGBA",
        (final_size[0] * columns, final_size[1] * rows),
        (0, 0, 0, 0),
    )
    frame_records = []
    duration_ms = round(1000 / fps)
    for index, frame in enumerate(final_frames):
        column = index % columns
        row = index // columns
        sheet.paste(frame, (column * final_size[0], row * final_size[1]))
        frame_path = frame_dir / f"frame-{index:03d}.png"
        frame.save(frame_path, "PNG", optimize=True)
        frame_records.append(
            {
                "index": index,
                "file": frame_path.relative_to(project_root).as_posix(),
                "duration_ms": duration_ms,
                "offset": offsets[index],
            }
        )

    sheet.save(clean_path, "PNG", optimize=True)
    manifest_path = clean_dir / f"{clean_path.stem}.animation.json"
    manifest = {
        "version": 1,
        "type": "sprite-animation",
        "name": animation_name,
        "asset_type": asset_type,
        "theme": theme,
        "projection": PROJECTION,
        "view": view,
        "art_direction": ART_DIRECTION,
        "fps": fps,
        "playback": playback,
        "frame_count": frame_count,
        "working_grid": {"width": target[0], "height": target[1]},
        "output_scale": output_scale,
        "anchor": anchor,
        "palette_reference": (
            palette_reference_path.relative_to(project_root).as_posix()
            if palette_reference_path is not None
            else None
        ),
        "style_profile": (
            str(style_profile["name"]) if style_profile is not None else None
        ),
        "palette_mode": "source-preserved" if preserve_source_palette else "profile",
        "layout": {
            "columns": columns,
            "rows": rows,
            "frame_width": final_size[0],
            "frame_height": final_size[1],
        },
        "sheet": clean_path.relative_to(project_root).as_posix(),
        "frames": frame_records,
    }
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    append_log(
        clean_dir,
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "mode": "animation",
            "asset_type": asset_type,
            "theme": theme,
            "projection": PROJECTION,
            "view": view,
            "art_direction": ART_DIRECTION,
            "animation": animation_name,
            "fps": fps,
            "playback": playback,
            "frame_count": frame_count,
            "columns": columns,
            "rows": rows,
            "anchor": anchor,
            "working_grid": list(target),
            "output_scale": output_scale,
            "palette_reference": (
                palette_reference_path.relative_to(project_root).as_posix()
                if palette_reference_path is not None
                else None
            ),
            "style_profile": (
                str(style_profile["name"]) if style_profile is not None else None
            ),
            "palette_mode": "source-preserved" if preserve_source_palette else "profile",
            "raw_path": raw_path.relative_to(project_root).as_posix(),
            "clean_path": clean_path.relative_to(project_root).as_posix(),
            "manifest_path": manifest_path.relative_to(project_root).as_posix(),
            "frame_width": final_size[0],
            "frame_height": final_size[1],
            "visible_colors": max(item["visible_colors"] for item in verifications),
            "has_transparency": any(
                item["has_transparency"] for item in verifications
            ),
            "grid_aligned": True,
        },
    )
    print(
        f"[Harness Success] {ART_DIRECTION}/{PROJECTION}/{view}/{theme}/{asset_type} "
        f"animation verified: "
        f"{clean_path} ({frame_count} frames, {final_size[0]}x{final_size[1]} each, "
        f"{fps} fps; manifest: {manifest_path})"
    )
    return clean_path


def run_harness(
    asset_type: str,
    filename: str,
    project_root: Path,
    theme: str = "soft-modern-retro",
    output_scale: int | None = None,
    frame_count: int = 1,
    columns: int | None = None,
    animation_name: str = "animation",
    fps: int = 8,
    anchor: str = "auto",
    playback: str = "loop",
    view: str = "auto",
    palette_reference_filename: str | None = None,
    style_profile_requested: str = "auto",
    working_grid: tuple[int, int] | None = None,
    preserve_source_palette: bool = False,
) -> Path:
    if asset_type not in SPECS:
        raise ValueError(f"Unknown asset type: {asset_type}")
    if theme not in THEMES:
        raise ValueError(f"Unknown theme: {theme}")
    if view != "auto" and view not in VIEWS:
        raise ValueError(f"Unknown 2D view: {view}")
    if frame_count < 1:
        raise ValueError("Frame count must be at least 1")
    if fps < 1 or fps > 60:
        raise ValueError("FPS must be between 1 and 60")
    if working_grid is not None and asset_type not in {"bg", "scene"}:
        raise ValueError("Custom working grids are supported only for bg and scene")
    if working_grid is not None and frame_count != 1:
        raise ValueError("Custom working grids are supported only in static mode")

    style_profile, style_profile_path = load_style_profile(
        project_root,
        style_profile_requested,
    )

    safe_filename = Path(filename).name
    if safe_filename != filename or Path(safe_filename).suffix.lower() != ".png":
        raise ValueError("Filename must be a plain .png filename without directories")

    raw_path = project_root / "src" / "assets" / "raw" / safe_filename
    clean_path = project_root / "src" / "assets" / "clean" / safe_filename
    if not raw_path.is_file():
        raise FileNotFoundError(f"Raw image not found: {raw_path}")

    palette_reference_path = None
    palette_reference = None
    if palette_reference_filename is not None:
        safe_reference = Path(palette_reference_filename).name
        if (
            safe_reference != palette_reference_filename
            or Path(safe_reference).suffix.lower() != ".png"
        ):
            raise ValueError(
                "Palette reference must be a plain .png filename without directories"
            )
        palette_reference_path = (
            project_root / "src" / "assets" / "clean" / safe_reference
        )
        if not palette_reference_path.is_file():
            raise FileNotFoundError(
                f"Clean palette reference not found: {palette_reference_path}"
            )
        with Image.open(palette_reference_path) as reference_source:
            palette_reference = reference_source.convert("RGBA")

    scale = output_scale or SPECS[asset_type]["scale"]
    resolved_view = DEFAULT_VIEWS[asset_type] if view == "auto" else view
    if frame_count == 1:
        return run_static_harness(
            asset_type,
            raw_path,
            clean_path,
            project_root,
            theme,
            scale,
            resolved_view,
            palette_reference,
            palette_reference_path,
            style_profile,
            style_profile_path,
            working_grid,
            preserve_source_palette,
        )

    resolved_columns = columns or frame_count
    if resolved_columns < 1 or resolved_columns > frame_count:
        raise ValueError("Columns must be between 1 and the frame count")
    resolved_anchor = (
        "bottom-center"
        if anchor == "auto" and asset_type in {"char", "object"}
        else anchor
    )
    if resolved_anchor == "auto":
        resolved_anchor = "none"
    return run_animation_harness(
        asset_type,
        raw_path,
        clean_path,
        project_root,
        theme,
        scale,
        frame_count,
        resolved_columns,
        animation_name,
        fps,
        resolved_anchor,
        playback,
        resolved_view,
        palette_reference,
        palette_reference_path,
        style_profile,
        style_profile_path,
        preserve_source_palette,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Normalize a raw image or sprite sheet into verified pixel art."
    )
    parser.add_argument("asset_type", choices=sorted(SPECS))
    parser.add_argument("filename", help="PNG filename located in src/assets/raw/")
    parser.add_argument(
        "--theme",
        choices=sorted(THEMES),
        default="soft-modern-retro",
        help="Visual theme preset (default: soft-modern-retro)",
    )
    parser.add_argument(
        "--view",
        choices=("auto", *VIEWS),
        default="auto",
        help="Orthographic 2D view; auto uses side except front-facing icons",
    )
    parser.add_argument(
        "--palette-reference",
        default=None,
        help=(
            "Clean PNG filename whose colors should influence the asset palette; "
            "use the target background for scene-bound characters and objects"
        ),
    )
    parser.add_argument(
        "--style-profile",
        default="auto",
        help=(
            "Style profile name from .codex/context or the bundled profiles; "
            "auto uses project dot-style.json then soft-modern-retro.json, and none disables it"
        ),
    )
    parser.add_argument(
        "--scale",
        type=int,
        choices=(1, 2, 4),
        default=None,
        help="Output scale from the working grid (default: asset specification)",
    )
    parser.add_argument(
        "--working-grid",
        type=parse_working_grid,
        default=None,
        help="Optional WIDTHxHEIGHT grid for static bg or scene assets",
    )
    parser.add_argument(
        "--preserve-source-palette",
        action="store_true",
        help=(
            "Keep source RGB values as the quantization basis while still enforcing "
            "the asset color limit, binary transparency, and integer pixel grid"
        ),
    )
    parser.add_argument(
        "--frames",
        type=int,
        default=1,
        help="Frame count; values above 1 enable animation mode",
    )
    parser.add_argument(
        "--columns",
        type=int,
        default=None,
        help="Source sheet columns (default: frame count)",
    )
    parser.add_argument(
        "--animation",
        default="animation",
        help="Animation state name written to the manifest",
    )
    parser.add_argument(
        "--fps",
        type=int,
        default=8,
        help="Playback frames per second written to the manifest",
    )
    parser.add_argument(
        "--anchor",
        choices=("auto", "bottom-center", "center", "none"),
        default="auto",
        help="Auto uses bottom-center for characters and objects, and none otherwise",
    )
    parser.add_argument(
        "--playback",
        choices=("loop", "once", "ping-pong"),
        default="loop",
        help="Playback behavior written to the manifest",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
        help="Project root containing src/assets/ (default: current directory)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        run_harness(
            args.asset_type,
            args.filename,
            args.project_root.resolve(),
            args.theme,
            args.scale,
            args.frames,
            args.columns,
            args.animation,
            args.fps,
            args.anchor,
            args.playback,
            args.view,
            args.palette_reference,
            args.style_profile,
            args.working_grid,
            args.preserve_source_palette,
        )
    except (FileNotFoundError, OSError, ValueError) as error:
        print(f"[Harness Error] {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
