# Expo SDK Compatibility Rules

Use these rules when creating or upgrading Expo projects that will be tested on a mobile Expo app, Expo Go, or a development build.


## Default Mobile Test SDK

The current default mobile test environment uses Expo SDK 56.


For new Expo projects, target Expo SDK 56 unless the user explicitly confirms a different installed mobile SDK or a custom development build target.


## Do Not Blindly Use Latest

Do not scaffold or upgrade an Expo project with the latest SDK when that version may be newer than the installed mobile Expo app supports.


Before scaffolding, confirm:

- Target mobile test app SDK version
- Expo SDK selected for the project
- React Native version compatible with that Expo SDK
- React version compatible with that Expo SDK
- Expo package versions installed through Expo-compatible commands


## New Project Rule

When creating a new Expo project:

1. Report that Expo SDK 56 is the default target.
2. Avoid templates or commands that silently create a newer SDK project.
3. If the scaffold command creates a different SDK, stop and report the mismatch before continuing.
4. Install Expo packages with `npx expo install` so versions follow the selected SDK.
5. Keep Expo Web available when the selected SDK supports it.


## Existing Project Rule

For existing Expo projects:

- Read `package.json`, lockfiles, and app config before changing SDK versions.
- Preserve the current Expo SDK unless the user asks for an upgrade or downgrade.
- If the project SDK does not match the mobile test SDK, report the mismatch and options.
- Do not silently upgrade Expo SDK to fix package conflicts.


## Mismatch Options

When the project SDK and mobile test SDK differ, choose only after reporting the tradeoff:

- Align project to mobile SDK 56.
- Update the mobile Expo app if a newer SDK is required.
- Use a custom development build that matches the project SDK.
- Keep the project SDK and test through web only when native testing is not required.


## Verification

After setup or dependency changes:

- Check `package.json` for the selected `expo` SDK-compatible version.
- Run the project's available Expo check command when available.
- Prefer `npx expo install --check` or `npx expo doctor` when available in the project.
- Report the selected SDK and why it matches the mobile test environment.

