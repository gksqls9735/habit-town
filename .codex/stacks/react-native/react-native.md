# React Native Rules

Use these rules when working in React Native projects that are not managed primarily by Expo.


## Structure

- Keep screens focused on navigation and composition.
- Move reusable UI into shared components.
- Move feature-specific UI, hooks, services, constants, and types into `features/<feature-name>/`.
- Keep native module setup separate from screen and UI logic.
- Isolate platform-specific behavior with explicit platform files or platform checks.


## TypeScript

Follow `.codex/common/rules/typescript.md`.


Use `.tsx` for components and `.ts` for hooks, services, constants, utilities, and types.


## Version Selection

Follow `.codex/common/rules/versioning.md` before creating or upgrading a React Native project.


For new React Native projects, report the selected Node.js, package manager, React Native, React, TypeScript, Android Gradle Plugin, Gradle, Kotlin, and Xcode/iOS target versions when relevant.


Prefer the React Native version compatibility guidance over independently upgrading React, Gradle, Kotlin, or native platform packages.


## Mobile Considerations

- Account for safe areas.
- Keep touch targets large enough for mobile use.
- Avoid layouts that depend on desktop-only dimensions.
- Handle Android back behavior intentionally.
- Keep permissions, deep links, push notifications, and native config changes explicit.


## Frontend Decisions

Follow `.codex/common/rules/frontend-decisions.md` and `.codex/stacks/react-native/decisions.md` before choosing state management, UI libraries, or styling tools.


## Design

Follow `.codex/stacks/react-native/design.md` when designing React Native UI.


## Verification

Run the project's available React Native checks after changes.


When native files or dependencies change, verify the relevant Android or iOS build when the environment supports it.

