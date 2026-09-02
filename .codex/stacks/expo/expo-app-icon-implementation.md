# Expo App Icon Implementation

Use this reference after `.codex/stacks/expo/expo-app-icon.md` decides an Expo app icon should be applied.


## app.json Example

For `app.json`, update paths similar to:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F7F4FF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Dynamic Config

For `app.config.js` or `app.config.ts`, preserve existing dynamic config logic and update only the relevant icon fields.

## Android Launcher Safe Area

Android launchers can mask or scale adaptive icons differently. Prevent the APK-installed icon from looking zoomed by keeping the foreground artwork smaller than the full canvas.

Recommended approach:

- Use a `1024x1024` PNG canvas for generated source assets.
- Keep the main foreground symbol centered.
- Leave roughly 20% to 30% transparent padding around the foreground symbol for `adaptive-icon.png`.
- Do not place meaningful details near the canvas edge.
- Use `backgroundColor` for the adaptive icon background instead of baking a full-bleed background into the foreground image.
- If an installed APK preview looks zoomed or cropped, regenerate the foreground with more padding before considering the icon complete.


## Verification

After applying:

- Confirm the referenced icon files exist.
- Confirm config paths are relative and valid from the config file.
- Run available project checks when practical.
- For Expo projects, prefer `npx expo config` when available to validate config resolution.
- If web is supported, verify favicon path is configured.
- When APK testing is available, install the APK and confirm the launcher icon is not zoomed, cropped, or visually oversized.

