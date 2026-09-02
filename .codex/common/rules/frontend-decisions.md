# Frontend Decision Rules

Use this file as the index for frontend tool decisions.


## Core Rule

Follow the existing project choices unless the user explicitly asks to change them.


Do not mix multiple tools for the same responsibility without a clear reason.

When adding this harness to an existing project, treat the existing codebase as the source of truth for frontend decisions.



## Common Decision Files

- State management: `.codex/common/rules/frontend/state.md`
- Styling and UI libraries: `.codex/common/rules/frontend/styling-ui.md`
- Responsive CSS: `.codex/common/rules/frontend/responsive-css.md`
- Calendars and date pickers: `.codex/common/rules/frontend/calendar.md`
- Icons: `.codex/common/rules/frontend/icons.md`
- Decision reporting: `.codex/common/rules/frontend/reporting.md`


## Stack-Specific Defaults

Use the stack-specific `decisions.md` file as the source of truth for default frontend tools.


- React web: `.codex/stacks/react/decisions.md`
- Expo: `.codex/stacks/expo/decisions.md`
- React Native: `.codex/stacks/react-native/decisions.md`
