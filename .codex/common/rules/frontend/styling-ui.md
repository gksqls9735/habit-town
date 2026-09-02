# Frontend Styling And UI Rules

Use these rules when choosing styling systems and UI libraries.


## Existing Projects

Before adding a new styling or UI tool, inspect the existing dependencies, component patterns, and styling conventions.


Follow the existing styling system unless the user explicitly asks to change it.

When the harness is introduced after project code already exists, match the existing design elements instead of applying the default stack choices blindly.


Inspect and reuse:

- Existing design tokens
- Existing shared components
- Existing layout primitives
- Existing form, table, modal, and navigation patterns
- Existing icon style and icon library
- Existing responsive behavior


If the existing project conflicts with the harness default, preserve the existing project choice and mention the conflict in the work report.



## Stack Rules

Use the styling system and UI library defined by the active stack's `decisions.md`.


- React web: `.codex/stacks/react/decisions.md`
- Expo: `.codex/stacks/expo/decisions.md`
- React Native: `.codex/stacks/react-native/decisions.md`


## Responsive CSS

When creating or changing CSS, layout styles, Tailwind classes, styled-components, or inline style objects, follow:

- `.codex/common/rules/frontend/responsive-css.md`


## Calendars And Date Pickers

When creating calendar views, date pickers, date range pickers, scheduling UI, or reminder date selection, follow:

- `.codex/common/rules/frontend/calendar.md`


## CSS-In-JS

Use CSS-in-JS tools such as styled-components only when:

- The existing project already uses styled-components.
- The user explicitly requests CSS-in-JS.
- A third-party integration requires it.


## Web-Only UI

Do not use web-only UI libraries such as Ant Design in Expo or React Native unless a compatible native package is explicitly selected.

