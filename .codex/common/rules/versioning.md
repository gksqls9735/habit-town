# Version Selection Rules

Use these rules when creating or upgrading projects that depend on framework versions.


## Existing Projects

Preserve the existing major versions unless the user explicitly asks for an upgrade.


Before adding packages, inspect the existing dependency versions in `package.json`, lockfiles, and framework config files.


## Package Compatibility Before Install

Before installing or updating a package, verify the compatible version for the current project stack.


Check compatibility against:

- Existing dependency versions in `package.json` and lockfiles
- Framework versions, such as React, Expo SDK, React Native, Next.js, Vite, or other build tools
- Peer dependencies declared by the package
- Runtime requirements, such as Node.js, TypeScript, Android, iOS, Gradle, or Kotlin versions
- Official framework compatibility tables or official package registry metadata


Do not install the newest package version by default when compatibility is unclear.


Prefer:

- A specific compatible version, such as `npm install package@x.y.z`
- A framework-managed installer, such as `npx expo install package`
- The safest compatible minor or patch version when the existing major version should be preserved


When reporting package installation work, include the selected version, compatibility basis, and reason for the choice.


## New Projects

For new projects, use the latest stable version that is compatible with the requested stack at the time of work.


When exact versions matter, verify them from official documentation or the official package registry before implementation.


## Version Report

Before scaffolding a new React or Expo project, report the selected versions.


Report:

- Runtime version, such as Node.js
- Package manager, such as npm
- Framework version, such as React or Expo SDK
- TypeScript version when it is explicitly selected
- Reason for the selected version


## Compatibility

Prefer versions that are compatible with each other over simply choosing the newest package version.


For Expo projects, follow the Expo SDK compatibility table for React, React Native, and Expo packages.

For Expo projects that will be tested on a mobile Expo app, also follow `.codex/stacks/expo/expo-sdk-compatibility.md` and avoid selecting an SDK newer than the installed mobile app supports.


For React Native projects, follow the React Native compatibility guidance for React, Android, iOS, Gradle, Kotlin, and native dependencies.


For React web projects, prefer the current stable React version and a stable build tool version supported by the project setup.


## Upgrades

When upgrading versions, avoid silent major upgrades.


Major upgrades require:

- A short migration note
- Changed package list
- Commands run
- Verification result

