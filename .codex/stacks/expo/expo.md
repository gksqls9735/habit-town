# Expo Rules

Use these rules when working in Expo projects.


## Structure

- Keep screens route-focused.
- Move reusable UI into shared components.
- Move feature-specific logic into `features/<feature-name>/`.
- Keep platform-specific code isolated when behavior differs by platform.


## Mobile Considerations

- Account for safe areas.
- Keep touch targets large enough for mobile use.
- Avoid layouts that rely on desktop-only dimensions.
- Test important flows on the target platform when possible.


## Keyboard Avoidance

Follow `.codex/stacks/expo/expo-keyboard-avoidance.md` when a screen contains `TextInput` or editable form fields.


## App Icons

Follow `.codex/stacks/expo/expo-app-icon.md` when creating or replacing an Expo app icon.


## Web Testing

Configure Expo projects so they can be tested on web when the selected Expo SDK supports it.


For new Expo projects, include a web test path unless the user explicitly requests native-only support.


Prefer:

```bash
npx expo start --web
```

When adding libraries, verify that they support Expo Web or provide a platform-specific fallback.


## Frontend Decisions

Follow `.codex/common/rules/frontend-decisions.md` and `.codex/stacks/expo/decisions.md` before choosing state management, UI libraries, or styling tools.


## Design

Follow `.codex/stacks/expo/design.md` when designing Expo UI.


## Version Selection

Follow `.codex/common/rules/versioning.md` before creating or upgrading an Expo project.

Follow `.codex/stacks/expo/expo-sdk-compatibility.md` before scaffolding or upgrading Expo SDK versions.


For new Expo projects, report the selected Node.js, package manager, Expo SDK, React Native, React, and TypeScript versions before scaffolding.


Use Expo SDK compatibility as the source of truth for React Native and Expo package versions.


## Verification

Run the project's available Expo or React Native checks after changes.


When the project supports web, also verify the web entry point and important flows.

