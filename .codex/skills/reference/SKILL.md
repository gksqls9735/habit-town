---
name: reference
description: Analyze UI design references and convert them into project design context. Use when the user provides a Pinterest URL, image URL, screenshot, moodboard, or visual UI reference and asks Codex to create or update .codex/context/design-description.md for future design work.
---

# Reference

## Overview

Use this skill to turn a visual UI reference into reusable design guidance for the current project.

The output file is `.codex/context/design-description.md`. Future UI work should follow this file when it exists, while still respecting the project's stack, accessibility, responsiveness, and existing component system.

## Workflow

1. Inspect the active project.
   - Read `AGENTS.md` when present and follow its instructions.
   - Read existing `.codex/context/description.md` when present.
   - Read existing `.codex/context/design-description.md` when present.
   - Create `.codex/context/` when it does not exist.

2. Inspect the visual reference.
   - For a Pinterest URL or other web URL, open the URL with the available browser or web tools and inspect the visible UI image.
   - If the URL is inaccessible, blocked, login-gated, or the image cannot be inspected, ask the user for a screenshot or direct image attachment.
   - If multiple images are present, use the image the user clearly referenced; otherwise ask which one to use.

3. Extract transferable design traits.
   - Capture layout structure, spacing rhythm, component density, typography feel, visual hierarchy, surfaces, borders, shadows, navigation, forms, and interaction affordances.
   - Describe color direction as mood and relationships, not exact copying.
   - Do not copy exact hex values, brand palettes, logos, illustrations, copyrighted assets, unique copy, or distinctive proprietary UI details.
   - Adapt the reference to the user's product type and existing project rules.

4. Write or update `.codex/context/design-description.md`.
   - For a new file, write a complete design reference document.
   - For an existing file, update only the relevant sections unless the user asks to replace the design direction.
   - Preserve useful prior design context and note superseded guidance when the reference changes direction.

5. Report the result.
   - Summarize the reference traits captured.
   - Mention any inaccessible parts of the URL or assumptions made.
   - List changed files.

## `design-description.md` Structure

Use this structure when creating the file:

```markdown
# Design Description

## Source Reference

## Product Fit

## Visual Direction

## Layout Principles

## Component Style

## Typography Direction

## Color Direction

## Interaction And States

## Responsive Behavior

## Do Not Copy

## Open Questions
```

## Color Handling

Use the reference color system as inspiration only.

- Describe colors with roles such as background, surface, accent, status, border, and text.
- Prefer softened, adapted, or analogous colors over direct matches.
- Keep enough contrast for accessibility.
- Keep the project's existing brand colors when they exist.
- Avoid making the implementation look like a clone of the reference.

## Design Application Rules

When `.codex/context/design-description.md` exists during future UI work:

- Read it before designing screens or components.
- Follow its layout, density, component, typography, and tone guidance.
- Treat it as project-specific direction layered on top of the common design rules.
- Do not let it override accessibility, responsive behavior, platform conventions, or explicit user requirements.
