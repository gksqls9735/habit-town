---
name: icon-image
description: Use only when the user explicitly invokes "/icon-image" or "$icon-image" to create original PNG icon image assets and apply them to the current project instead of using Font Awesome, vector icon libraries, emoji, or text-only placeholders. Do not use for general UI work unless the user asks for generated PNG icons.
---

# Icon Image

Create original PNG icon assets and apply them to the current project.


## Core Rule

When this skill is invoked, create a raster PNG icon asset. Do not satisfy the request by choosing Font Awesome, Lucide, Material Icons, SVG icon libraries, emoji, or text-only placeholders.


## Workflow

1. Understand the requested icon meaning, target screen, and visual tone.
2. Inspect the project for existing asset folders, image import patterns, and design tokens.
3. Choose the output path:
   - Prefer the project's existing icon/image asset folder.
   - For Expo or React Native projects without an existing convention, use `assets/icons/`.
   - For React web projects without an existing convention, use `src/assets/icons/` or `public/icons/` according to the existing build setup.
4. Generate an original PNG icon image with a transparent background unless the user requests a filled tile.
5. Save the file with a kebab-case descriptive name, such as `memo-add.png` or `profile-empty-state.png`.
6. Apply the PNG in the target UI with the project's existing image component or import pattern.
7. Verify that the icon renders at the intended size and does not blur, crop, stretch, or break layout.


## Visual Requirements

- Create an original icon image, not a copied third-party icon.
- Match the project's current design direction.
- Prefer soft, friendly, product-quality visuals.
- Use transparent backgrounds for normal UI icons.
- Keep the silhouette readable at small sizes.
- Avoid tiny text inside the icon unless the requested icon specifically requires it.
- Avoid using trademarked logos or brand marks unless the user explicitly owns or requests them.


## Size Guidance

Prefer generating a larger source PNG and rendering it down in the UI.


Recommended outputs:

- General UI icon source: `512x512` or `1024x1024`
- Small button/icon usage: render at `20`, `24`, `32`, or `40` px
- Empty state or feature illustration icon: render at `80`, `120`, or `160` px
- App launcher icon: follow the active framework's required icon size and config

## Implementation Rules

- Use the available image generation capability to create the PNG when possible.
- If image generation is unavailable, stop and tell the user that a PNG icon cannot be generated in the current environment.
- Do not replace this workflow with an icon font or vector library.
- Do not introduce a new image handling library when the project already has a working image pattern.
- Keep code changes minimal and local to the asset import and target UI.
- If multiple icons are requested, keep naming, size, and style consistent.


## Implementation Reference

For Expo, React Native, React Web examples, accessibility notes, and verification checks, read `references/implementation.md`.

