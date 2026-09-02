# Calendar And Date Picker Rules

Use these rules when creating calendar views, date pickers, date range pickers, scheduling UI, reminder date selection, recurrence UI, or any feature that displays or edits dates on a calendar.


## Core Rule

Use a proven calendar or date picker library instead of hand-building calendar behavior.

Do not implement calendar grid generation, month navigation, date range selection, keyboard navigation, recurrence behavior, or locale-sensitive date logic from scratch unless the user explicitly asks for a custom implementation and accepts the maintenance cost.


## Before Choosing A Library

Inspect the existing project first:

- Existing UI library and component system
- Existing date, time, calendar, or picker packages
- Existing form library and validation pattern
- Existing locale, timezone, and formatting utilities
- Target platforms: React web, Expo, bare React Native, or web/native hybrid

Prefer the calendar/date picker component that already matches the project's UI library.


## Library Selection

Choose a library that fits the active stack and use case.

- React web admin or form-heavy UI: prefer the active UI library's date picker or calendar components, such as Ant Design when the project uses Ant Design.
- React web custom UI: choose a maintained React calendar/date picker library that supports accessibility, controlled values, range selection when needed, and styling customization.
- Expo or React Native: choose an Expo/React Native compatible date picker or calendar package; verify native and web compatibility when Expo Web support is required.
- Scheduling or resource calendars: choose a library designed for calendar events, drag/drop, recurrence display, or multi-view scheduling instead of adapting a simple date picker.

Follow `.codex/common/rules/versioning.md` before installing a package. Do not install the newest package by default when compatibility is unclear.


## Implementation Rules

- Keep date values controlled and typed.
- Normalize API payloads at service boundaries.
- Keep display formatting separate from stored values.
- Handle empty, invalid, disabled, min/max, unavailable, and loading states.
- Use Korean as the default calendar language and locale unless the product requirements specify another locale.
- Support timezone requirements explicitly when they matter.
- Visually distinguish weekends by default: Saturdays should use blue treatment and Sundays should use red treatment.
- Apply weekend colors through the library's supported theme, token, class, render, or day-prop APIs.
- Preserve keyboard, screen reader, and touch behavior provided by the library.
- Style the library through supported theme, token, class, or wrapper APIs instead of forking its internals.


## Reporting

When adding or changing a calendar/date picker library, report:

- Existing calendar/date tooling found
- Selected library or existing component reused
- Compatibility basis for the active stack
- Known limitations such as native-only behavior, missing web support, timezone assumptions, or recurrence limits
