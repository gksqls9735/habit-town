#!/usr/bin/env python3
"""Apply a crisp Korean title to a clean attendance banner."""

from __future__ import annotations

import argparse
from pathlib import Path


DEFAULT_FONT_CANDIDATES = [
    "C:/Windows/Fonts/malgunbd.ttf",
    "C:/Windows/Fonts/Hancom Gothic Bold.ttf",
    "assets/fonts/Galmuri11.ttf",
]
DEFAULT_OUTPUT_SIZE = (1280, 400)
WORKING_GRID = (320, 100)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Composite a pixel-crisp title onto a 16:5 clean attendance banner."
    )
    parser.add_argument("image", help="Clean banner PNG path")
    parser.add_argument("title", help="Title text to draw, such as '9월 출석이벤트'")
    parser.add_argument("--output", help="Output PNG path. Defaults to overwriting the input.")
    parser.add_argument("--font", help="Optional TTF font path. Defaults to a bold Korean font when available.")
    parser.add_argument("--x", type=int, default=22, help="Title x-position on the 320x100 working grid")
    parser.add_argument("--y", type=int, default=30, help="Title y-position on the 320x100 working grid")
    parser.add_argument("--font-size", type=int, default=20, help="Font size on the 320x100 working grid")
    parser.add_argument("--fill", default="#b95743", help="Title fill color")
    parser.add_argument("--accent", default="#d88a32", help="Number/accent fill color")
    parser.add_argument("--outline", default="#fff4d9", help="Light outline color")
    parser.add_argument("--shadow", default="#4c3027", help="Drop shadow color")
    parser.add_argument("--stroke-width", type=int, default=2, help="Light outline width on the working grid")
    parser.add_argument("--shadow-offset", type=int, default=2, help="Shadow offset on the working grid")
    parser.add_argument("--weight", type=int, default=2, help="Extra pixel thickening applied to the glyph fill")
    args = parser.parse_args()

    try:
        from PIL import Image, ImageDraw, ImageFont
    except ModuleNotFoundError:
        parser.error("Pillow is required. Use the bundled Codex Python runtime or install Pillow.")

    image_path = Path(args.image)
    font_candidates = [args.font] if args.font else DEFAULT_FONT_CANDIDATES
    font_path = next((Path(candidate) for candidate in font_candidates if Path(candidate).exists()), None)
    output_path = Path(args.output) if args.output else image_path

    if not image_path.exists():
        parser.error(f"image not found: {image_path}")
    if font_path is None:
        parser.error("font not found. Provide --font or add assets/fonts/Galmuri11.ttf")

    with Image.open(image_path) as source:
        clean = source.convert("RGBA")
        if clean.size != DEFAULT_OUTPUT_SIZE:
            parser.error(f"expected 1280x400 clean banner, got {clean.size[0]}x{clean.size[1]}")

        working = clean.resize(WORKING_GRID, Image.Resampling.NEAREST)
        draw = ImageDraw.Draw(working)
        font = ImageFont.truetype(str(font_path), args.font_size)

        x = args.x
        y = args.y
        text = args.title
        split_index = 0
        while split_index < len(text) and (text[split_index].isdigit() or text[split_index] == "월"):
            split_index += 1
        accent_text = text[:split_index]
        rest_text = text[split_index:].lstrip()

        def draw_text(position: tuple[int, int], value: str, fill: str) -> None:
            px, py = position

            draw.text(
                (px + args.shadow_offset, py + args.shadow_offset),
                value,
                font=font,
                fill=args.shadow,
                stroke_width=args.stroke_width,
                stroke_fill=args.shadow,
            )

            draw.text(
                position,
                value,
                font=font,
                fill=args.outline,
                stroke_width=args.stroke_width,
                stroke_fill=args.outline,
            )

            offsets = [(0, 0)]
            for distance in range(1, args.weight + 1):
                offsets.extend(
                    [
                        (-distance, 0),
                        (distance, 0),
                        (0, -distance),
                        (0, distance),
                    ]
                )

            for ox, oy in offsets:
                draw.text((px + ox, py + oy), value, font=font, fill=fill)

        draw_text((x, y), accent_text, args.accent)
        accent_bbox = draw.textbbox((x, y), accent_text, font=font)
        rest_x = accent_bbox[2] + 7
        draw_text((rest_x, y), rest_text, args.fill)

        output = working.resize(DEFAULT_OUTPUT_SIZE, Image.Resampling.NEAREST)
        output.save(output_path)

    print(f"Applied title '{args.title}' to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
