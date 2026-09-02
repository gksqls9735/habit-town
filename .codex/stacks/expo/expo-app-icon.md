# Expo App Icon Rules

Use these rules when creating, replacing, or updating an Expo app icon.


## Core Rule

When the task is to create or replace an Expo app icon, do not stop after generating the image file. Apply it to the Expo project configuration as part of the same task.


## What To Inspect

Before editing:

- Check whether the project uses `app.json`, `app.config.js`, or `app.config.ts`.
- Check current `expo.icon`, `expo.android.icon`, `expo.ios.icon`, `expo.web.favicon`, and adaptive icon settings.
- Check existing asset folders such as `assets/`, `assets/images/`, or `assets/icons/`.
- Check whether the project already has icon naming conventions.


## Asset Generation

Create or place the app icon asset in the project asset folder.


Default recommendations:

- Main app icon: `assets/icon.png`
- Android adaptive foreground: `assets/adaptive-icon.png`
- Android adaptive background: set a solid color in config unless the project already uses an image
- Web favicon: `assets/favicon.png`

Use project conventions if they already differ from these defaults.


## Image Requirements

- Use PNG.
- Prefer a square source image.
- For the main app icon, use `1024x1024` when generating a new asset.
- Keep the design readable at small launcher sizes.
- Avoid important details near the outer edge.
- Do not fill the entire canvas with the logo or main symbol.
- Keep generous safe padding so the installed APK launcher icon does not look zoomed, cropped, or oversized.
- For Android adaptive foreground images, keep the main symbol inside the central safe area and leave transparent padding around it.
- Prefer a smaller centered foreground symbol over an edge-to-edge symbol.
- Use enough contrast against the intended background.
- If adaptive icon is needed, keep the foreground centered with safe padding.


## Expo Config Application

After creating or replacing the icon file, update Expo configuration.


Read `.codex/stacks/expo/expo-app-icon-implementation.md` for config examples and verification details.


## Automatic Application Rule

When the user asks to make or change an Expo app icon:

1. Create or update the PNG icon asset.
2. Update the Expo config to point to the new asset.
3. Update Android adaptive icon settings when present or appropriate.
4. Update web favicon when the project supports web.
5. Preserve unrelated app config fields.
6. Report changed files and paths.


## Exceptions

Do not modify app icon config when:

- The user only asks for a concept image and explicitly says not to apply it.
- The project is not an Expo project.
- The config is generated externally and must not be edited directly.
- The icon asset requires manual designer approval before application.

