# Expo Keyboard Avoidance Rules

Use these rules when modifying Expo or React Native screens that contain text input.


## Decision Criteria

Apply keyboard avoidance only when a `TextInput` can realistically be covered by the software keyboard.


Check:

- Whether the screen contains `TextInput`, multiline text input, search input, chat input, or form fields.
- Whether the input sits near the lower half of the screen, inside a form, modal, bottom sheet, footer, or fixed action area.
- Whether focusing the input can hide the field itself, helper text, validation text, submit button, or important next action.
- Whether the screen already uses `KeyboardAvoidingView`, keyboard-aware scroll utilities, or a shared layout that handles keyboard avoidance.
- Whether behavior differs on iOS and Android.


## When To Apply

Apply keyboard avoidance when:

- A focused input can be hidden by the keyboard.
- The submit or next action can be hidden while typing.
- A scrollable form needs to keep the focused field visible.
- A chat or comment composer is placed near the bottom of the screen.
- A modal or bottom sheet contains editable fields.


## When Not To Apply

Do not add keyboard avoidance when:

- The screen has no `TextInput`.
- The input is already safely visible above the keyboard.
- The screen already has a shared keyboard avoidance wrapper.
- The change would add duplicate keyboard handling.
- The layout is static and cannot be affected by the keyboard.


## Implementation Rules

- Do not wrap every screen with `KeyboardAvoidingView` by default.
- Preserve the existing layout as much as possible.
- Prefer the smallest code change that fixes the keyboard overlap.
- Reuse existing project keyboard avoidance utilities before adding a new one.
- Do not create multiple different keyboard avoidance patterns in the same project.
- Consider both iOS and Android behavior.
- Keep scroll position, safe area, headers, tab bars, and bottom actions stable.


## Implementation Reference

For implementation patterns, code examples, Android notes, and verification checks, read `.codex/stacks/expo/expo-keyboard-avoidance-patterns.md`.


## Exceptions

Keyboard avoidance may be skipped when:

- The input is only used on web and cannot be covered by a mobile keyboard.
- The input is in a header or top area that remains visible.
- The project uses a proven shared screen layout that already handles keyboard behavior.
- The user explicitly requests no keyboard avoidance for that screen.

