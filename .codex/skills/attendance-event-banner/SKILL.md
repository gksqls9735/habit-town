---
name: attendance-event-banner
description: Generate or revise attendance-event banner images for the event popup, especially when the user gives a month, season, reward, or short campaign brief.
---

# Attendance Event Banner

Use this skill when generating, revising, or implementing an attendance-event banner image shown inside the Habit Town event popup.

Default to making an image when the user says "make/create a banner" and does not explicitly ask for copy, planning, a prompt, or implementation.

This skill follows the project `dot-image` harness pattern: keep generated source images in `raw/`, normalize and verify runtime-ready outputs into `clean/`, and report both paths.

Do not use a generic polished illustration workflow for final app banners. The finished clean banner must be a dot-image style pixel-art asset processed by `.codex/skills/dot-image/scripts/dot_harness.py`.

## Inputs

Extract the useful event details from the user request. If a detail is missing, choose a sensible default and keep moving unless the missing value would block implementation.

- Month or season, such as March, October, summer, or New Year.
- Year or exact event period, when the request should account for movable holidays.
- Event name, if provided.
- Attendance period and reset cadence, if provided.
- Reward theme, such as coins, food, room items, pet items, or special cosmetics.
- Target surface, such as a generated image, React UI, copy only, design spec, or reusable asset prompt.

When the user only gives a month, infer the intended event year from the current date, check holiday relevance for that inferred year, then generate a complete banner image.

## Holiday-Aware Theme Selection

When a month or event period includes a culturally important holiday, use that holiday as the primary theme only when it is relevant to the requested locale and product tone.

- For Korean events, prefer Seollal when the requested year/period includes Lunar New Year, and Chuseok when it includes Korean Thanksgiving.
- If the user does not provide a year, infer the event year from the current date. Use the current year for the current or upcoming month, and use the next year when the requested month has already passed.
- Example: if today's date is in December and the user asks for a January banner, treat it as next January, not the past January.
- Because Lunar New Year and Chuseok are lunar-calendar holidays and change every year, verify their exact Gregorian dates for the explicit or inferred event year before using them as the theme.
- If the requested month contains Seollal or Chuseok in the explicit or inferred event year, make that holiday the primary visual theme unless the user requested a different theme.
- Keep holiday visuals warm and family-friendly: traditional food, gift pouches, lanterns, hanbok-inspired fabric colors, full moon, harvest table, or lucky motifs. Avoid religious, political, or overly formal ceremonial imagery unless requested.
- Keep the banner still recognizable as an attendance event. The title should remain `{month} 출석이벤트` unless the user requests a holiday-specific title.

## Banner Defaults

Design the banner as a compact promotional unit inside an existing event popup, not as a standalone landing-page hero.

- Match the event list popup slot: `width: 100%` and fixed `height: 92` in a popup with about `326px` usable image width.
- Use a practical 16:5 generation ratio for source assets. Preferred generated source sizes are `1600x500`, `1280x400`, or `960x300`.
- Treat `1280x400` as the default clean output size because the `dot-image` harness can produce it from a `320x100` working grid at `4x` scale.
- Keep all meaningful art inside an inset safe area so the app can crop, pad, or draw borders without cutting off rewards or text.
- Keep the first read simple if text is part of the image: event title, attendance benefit, period or cadence, and one clear action.
- Make the month visible through concrete seasonal cues instead of generic decoration.
- Prefer warm, playful Habit Town language, but keep Korean UI copy short enough for mobile.
- Avoid dense explanatory text. Put details such as reward rules below the banner or in secondary popup content when implementation allows it.
- Include empty, active, completed, and expired states when the task involves UI behavior.

## Image Generation Default

For direct banner requests, use the image generation workflow to produce a raster banner image.

- Treat the output as a finished event popup banner asset, not just a written concept.
- Use `image_gen` by default for image creation.
- Ask for a 16:5 compact horizontal banner unless the user gives a different target size.
- Prompt for true pixel art from the start: `soft modern-retro pixel art`, `orthographic 2D side view`, `fixed side-on camera`, `parallel projection`, `chunky deliberate pixel clusters`, `three to five readable value groups`, `selective deep-colored outlines`, and `crisp edges with no smooth shading or antialiasing`.
- Compose for the existing popup layout: large left text-safe area, small status/reward badge area near the upper-right, and main reward art near the lower-right.
- Do not rely on image generation for Korean title text. Ask the generator to leave the left title-safe area open unless the user explicitly wants experimental in-image lettering.
- After `dot_harness.py` succeeds, apply the required Korean title deterministically with `scripts/apply_banner_title.py`.
- Avoid glossy mobile-game rendering, smooth painted gradients, blur, sprite antialiasing, watermarks, logos, unreadable tiny text, scary horror elements, and cluttered reward grids.
- Save generated source images under `assets/ui/event/attendance-banners/raw/`.
- Run the actual project `dot-image` harness to create the verified app-ready image under `assets/ui/event/attendance-banners/clean/`.

Example harness command from the project root:

```bash
python .codex/skills/dot-image/scripts/dot_harness.py scene october-attendance-event.png --asset-root assets/ui/event/attendance-banners --style-profile auto --theme cute --view side --working-grid 320x100 --scale 4
```

The harness normalizes the raw image onto a fixed `320x100` pixel-art working grid, outputs a `1280x400` clean PNG, validates the dot-image rules, and appends a record to `assets/ui/event/attendance-banners/clean/dot-harness.log`.

Then apply the Korean title to the clean PNG:

```bash
python .codex/skills/attendance-event-banner/scripts/apply_banner_title.py assets/ui/event/attendance-banners/clean/october-attendance-event.png "10월 출석이벤트"
```

The title script composites text on the `320x100` working grid with `assets/fonts/Galmuri11.ttf`, then scales back to `1280x400` with nearest-neighbor sampling so the title remains crisp.

Visually inspect the clean output after title overlay. If the title is missing, garbled, too faint, or overlaps the reward art, rerun `apply_banner_title.py` with adjusted `--x`, `--y`, `--font-size`, or colors before accepting the banner.

Do not use or integrate the raw generated image directly when a dot-harness clean output exists. If the clean output still reads as a smooth illustration that was merely pixelated afterward, regenerate the raw image with stronger pixel-art prompt terms and rerun the harness. If the title is missing or garbled, fix it with `apply_banner_title.py` rather than regenerating only to chase text fidelity.

## Monthly Theme Guide

Use these as starting points, adapting to the user's explicit direction when given.

- January: New Year reset, first steps, lucky pouch, fresh calendar.
- February: hearts, cozy friendship, chocolate, warm gifts.
- March: spring start, sprouts, school or routine restart, fresh green.
- April: blossoms, picnic, rain drops, pastel reward stamps.
- May: family, flowers, sunny walks, gratitude gifts.
- June: early summer, blue sky, lemonade, cool check-in rewards.
- July: vacation, beach, fireworks, tropical fruit.
- August: late summer, shade, night breeze, festival tickets.
- September: autumn routine, books, acorns, harvest basket.
- October: Halloween, pumpkins, candy, costume pieces.
- November: gratitude, warm meals, golden leaves, cozy room items.
- December: holidays, snow, gifts, year-end countdown.

## Copy Pattern

For Korean banners, generate copy in this shape unless the existing UI has a stronger pattern:

- Title: `{month} 출석 이벤트` or a short themed event name.
- Subtitle: `매일 접속하고 {reward}을 받아요`.
- Badge: `D-{n}`, `매일 보상`, `누적 출석`, or `한정`.
- CTA: `출석하기`, `보상 받기`, or `이벤트 보기`.

Use natural Korean. Do not invent garbled Korean text or preserve corrupted text.

## Visual Direction

When producing an art prompt or UI spec, include:

- Aspect ratio or target dimensions, defaulting to a 16:5 popup-slot banner with a `320x100` working grid and `1280x400` clean output.
- Background color family, accent colors, and contrast requirements.
- Main object or character cue.
- Reward icon placement.
- Text hierarchy and safe text area.
- How the banner fits inside the existing event popup.

For app UI implementation, follow existing project components, spacing, tokens, and responsive rules before introducing new styling.

## Output

Match the deliverable to the request:

- For ordinary banner creation requests, generate a dot-image style source image, save the raw file, run `dot_harness.py`, apply the title with `apply_banner_title.py`, and show/report the clean file.
- For planning or copy requests, return a concise banner brief with text, visual theme, and states.
- For asset generation prompts, return a production-ready prompt plus exact text to place outside or inside the image.
- For implementation requests, edit the relevant app files and verify with the project's normal checks.

Always report the raw path, clean path, working grid, clean size, slot ratio, `dot_harness.py` command/result, title overlay command/result, theme, view, style profile, and any visual inspection notes after creating an app-ready banner.
