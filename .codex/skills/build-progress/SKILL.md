---
name: build-progress
description: Use when the user explicitly invokes "/build-progress" or "$build-progress", or when the user asks to run an app build, release APK/AAB build, Expo/React Native build, Gradle build, or other long-running build while receiving progress reports instead of only seeing that a command is running.
---

# Build Progress

Run long build commands with active progress reporting.

## Goal

Keep the user informed during app builds, especially release APK or AAB builds that can appear stuck while Gradle, Expo, or native tooling is still working.

## Workflow

1. Identify the build command and expected artifact.
2. Report the command before starting it.
3. For Expo release APK/AAB builds, read or create the versioned checklist at `.codex/stacks/expo/test/<app-name>_<app-version>.md` before repeating release-readiness checks.
4. Run the command normally.
5. While it runs, inspect the latest terminal output when available.
6. Report progress about every 30 seconds.
7. Infer the current phase from build output.
8. On completion, report success or failure, artifact path, warnings, and next steps.

## Progress Report Content

Each progress update should include:

- Current build phase
- Last meaningful output line or task name
- Whether the command is still progressing
- Any prompt, warning, or error that needs user attention

For Korean-speaking users, write these updates in Korean.

## Expo And React Native Build Phases

Use these phase names when they match the output:

- Resolving dependencies
- Reading Expo config
- Running prebuild or config plugins
- Configuring Gradle
- Bundling JavaScript
- Processing Android resources
- Compiling Kotlin or Java
- Running `assembleRelease` or `bundleRelease`
- Signing
- Writing APK or AAB artifact

## Expo Release Checklist

For Expo release APK/AAB builds:

- Reuse `o` items from the matching app/version checklist when the evidence still matches current files and config.
- Do not repeat app icon, splash, SDK compatibility, dependency, or release config checks that are already marked `o` for the same app/version.
- Recheck items marked `!` or `x`, items with missing evidence, or items whose source files changed.
- Update the checklist after the build with command result, artifact path, warnings, and install-test status.

## Stalled-Looking Builds

If output does not change:

- Do not claim the build is frozen unless there is evidence.
- Report the last known phase.
- Say that the process is still running if it has not exited.
- Continue waiting unless there is a clear prompt, failure, timeout, or deadlock.

## Safety

- Do not kill a build unless the user asks or the command is clearly blocked.
- Do not restart a build without explaining why.
- Do not hide warnings that may affect the release artifact.
- Do not run destructive cleanup commands as a default recovery step.

## Completion

After the build exits, report:

- Command result
- Artifact path when available
- Important warnings or errors
- Validation that was run
- Recommended next step, such as installing the APK or testing the release build
