# Build Progress Reporting Rules

Use these rules when running long-running build, release, packaging, deployment, or install commands.

## Core Rule

Do not leave the user with only a generic "command is running" status during app builds.

If a command is expected to run longer than 30 seconds, report progress periodically using the latest available terminal output.

## When This Applies

Apply this rule for:

- Release APK builds
- AAB builds
- Expo, React Native, Gradle, EAS, Xcode, or native mobile builds
- Web production builds
- Long package installs or dependency resolution
- Deployment commands
- Any command that appears stalled but is still running

## Progress Update Cadence

- Send an initial update before starting the command.
- If the command is still running after roughly 30 seconds, report progress.
- Continue reporting about every 30 seconds while meaningful work is still happening.
- If there is no new output, say that the command is still running and include the last known phase.
- Avoid excessive updates when the command is producing rapid visible output and the user already has enough signal.

## What To Report

Report concise, useful status:

- Command being run
- Current phase inferred from output
- Last meaningful log line or task name
- Whether work is still progressing or appears stalled
- Any warning that may matter after completion
- Expected next phase when it is clear

For Korean-speaking users, write progress updates in Korean.

## Mobile Build Phase Hints

For Expo or React Native release builds, infer phases from logs:

- Dependency install or version resolution
- Expo config resolution
- Native prebuild or config plugin execution
- Gradle configuration
- JavaScript bundle creation
- Resource processing
- Kotlin or Java compilation
- `assembleRelease`, `bundleRelease`, APK, or AAB packaging
- Signing
- Artifact generation

## Expo Release Checklist Reuse

For Expo release APK/AAB builds, use the versioned Expo checklist when present:

```text
.codex/stacks/expo/test/<app-name>_<app-version>.md
```

- Read the checklist before repeating release-readiness checks.
- Skip items already marked `o` when their evidence still matches current project files and config.
- Recheck items marked `!` or `x`, items without evidence, and items whose related files changed.
- Update the checklist after the build with the build command, result, artifact path, warnings, and install-test status.

## Stalled Output Handling

If output has not changed for a while:

- Do not assume failure.
- Report the last known phase.
- Check whether the process is still running when tooling allows it.
- Wait unless there is a clear error, timeout, prompt, or deadlock.

## Completion Report

When the command completes, report:

- Success or failure
- Command exit status when available
- Artifact path when produced
- Important warnings
- Follow-up command or install/test step when relevant
