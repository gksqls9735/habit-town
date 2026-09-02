---
name: expo-release-test
description: Use only when the user explicitly invokes "/expo-release-test" or "$expo-release-test", or explicitly asks to test whether an Expo app is ready for release. Inspect Expo release readiness and write or update a versioned checklist report at .codex/stacks/expo/test/<app-name>_<app-version>.md using o, !, and x markers.
---

# Expo Release Test

Check whether an Expo app is ready for release and save the tested items as a versioned checklist report.

## Report Output

Create the report directory if it does not exist:

```text
.codex/stacks/expo/test/
```

Write or update this file:

```text
.codex/stacks/expo/test/<app-name>_<app-version>.md
```

Choose `<app-name>` from `expo.name`, then `expo.slug`, then `package.json` `name`, then `expo-app`.

Choose `<app-version>` from `expo.version`, then `package.json` `version`, then Android `versionCode` or iOS `buildNumber`, then `unknown-version`.

Sanitize both parts for filenames by trimming whitespace, replacing spaces with hyphens, and removing characters that are invalid on Windows.

If the same app/version report already exists, read it first and update that file instead of creating a duplicate.

## Marker Legend

- `o`: checked and passed
- `!`: caution, warning, partial result, or needs user review
- `x`: missing, not configured, not applicable, or not run because no matching script/tool exists

## Workflow

1. Read project context, Expo stack rules, SDK compatibility rules, app icon rules, splash rules, and build progress rules before running checks.
2. Inspect `package.json`, Expo config (`app.json`, `app.config.*`), `eas.json`, lockfiles, asset folders, and existing scripts.
3. Identify the app name, package identifiers, Expo SDK version, target platforms, release command candidates, and available validation scripts.
4. Run non-destructive checks that are available in the project, such as typecheck, lint, tests, `npx expo config`, `npx expo doctor`, or `npx expo install --check`.
5. Before repeating expensive or visual checks, read the existing app/version report and reuse items marked `o` when the evidence still matches the current project files.
6. Do not rerun app icon, splash, SDK compatibility, dependency, or release config checks that are already marked `o` for the same app/version unless the related source files changed.
7. Do not run a release APK/AAB build unless the user requested a build or release artifact. If a long build is run, follow the build progress reporting rules.
8. Check release readiness areas and record each item with `o`, `!`, or `x`.
9. Save the report and summarize the most important blockers or cautions to the user in Korean when the user is working in Korean.

## Release APK Checklist Reuse

When the user asks to create a release APK or AAB for an Expo project:

1. Locate the app/version report before starting the build.
2. If the report exists, treat it as the current release checklist.
3. Skip checks already marked `o` when their evidence still points to the same files, config values, package versions, or asset paths.
4. Recheck an item if the relevant file changed, the evidence is missing, the previous mark is `!` or `x`, or the build output contradicts the previous result.
5. Update the checklist with build command, result, artifact path, warnings, and install-test status after the build.
6. Keep one report per app/version so repeated release APK builds refine the same checklist instead of creating daily duplicates.

## Required Checklist Areas

Include these areas in the report:

- Project metadata: app name, slug, version, package identifiers, orientation, owner if present.
- Expo SDK compatibility: installed SDK, requested mobile Expo Go SDK compatibility, and package compatibility status.
- App assets: icon, adaptive icon foreground/background, splash image/background, favicon when web is enabled.
- Icon safety: verify launcher icon has safe padding and is not likely to look zoomed or cropped in APK installs.
- Permissions and native config: Android permissions, iOS info plist, plugins, scheme, deep links, notification setup when present.
- Environment and secrets: `.env` usage, public versus secret values, EAS secret dependency, and missing required variables.
- Dependencies: lockfile presence, package-manager consistency, Expo-compatible package versions, and suspicious native dependency mismatches.
- Quality gates: TypeScript, lint, unit tests, smoke tests, and Expo web test availability when relevant.
- Release config: `eas.json`, Android build profile, signing expectations, version code/build number, package output type, and store readiness.
- Build status: whether a release APK/AAB build was requested, command used, result, artifact path, or reason it was not run.
- Manual testing: install test, login/core flow, offline/error states, keyboard avoidance for `TextInput` screens, and device coverage.

## Report Template

Use this structure:

```markdown
# Expo Release Test: <App Name>

- Date: <YYYY-MM-DD>
- Project: <absolute project path>
- App Version: <detected version or x>
- Expo SDK: <detected SDK or x>
- Target: <android/ios/web or unknown>
- Build requested: <yes/no>
- Checklist key: <app-name>_<app-version>

## Legend

- o: checked and passed
- !: caution, warning, partial result, or needs review
- x: missing, not configured, not applicable, or not run

## Checklist

| Mark | Area | Item | Result | Evidence |
| --- | --- | --- | --- | --- |
| o | Metadata | App name detected | Ready | `expo.name`: ... |
| ! | Assets | Splash image | Needs review | ... |
| x | Build | Release APK build | Not run | User did not request build |

## Commands Run

| Command | Result | Notes |
| --- | --- | --- |
| `npm run typecheck` | o | ... |

## Blockers

- ...

## Cautions

- ...

## Next Steps

- ...
```

## Safety

- Do not upload builds to app stores.
- Do not create, print, or modify secrets silently.
- Do not remove project files as part of release testing.
- Do not rewrite app configuration beyond small, explicitly requested fixes.
- Do not mark an item `o` unless it was actually checked or directly verified from project files.
