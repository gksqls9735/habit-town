# Habit Town Calendar

Read this before changing the calendar popup, home entry point, day styling, or task-history integration. This records the user-approved design and policies. Apply alongside `.codex/common/rules/frontend/calendar.md`, responsive CSS rules, and Expo design rules. User instructions take precedence.

## Current Scope

- Entry: the calendar button in `app/index.tsx`.
- Component: `src/features/calendar/components/CalendarModal.tsx`.
- Library: `react-native-calendars`, using the version pinned in `package.json`.
- Implemented: month navigation, date selection, today highlighting and return-to-today action, and an empty selected-date detail area.
- This is a design preview. It does not read task history, display real completion counts, or edit tasks. Its empty state is not evidence that no stored tasks exist.
- Task integration is subsequent work, not implicitly authorized by a design adjustment or maintenance of this document.

## Approved Design

- Preserve the pixel-room style and Galmuri11 font.
- Use a cream panel (`#fff8ea`), sand header (`#f2dfb6`), dark brown 4px frame (`#3d2d28`), square corners, and a restrained offset shadow.
- Preserve the hierarchy: title and close button; caption and today action; month navigation; weekday labels and dates; state legend; selected-date detail.
- Follow the current component's Korean copy and spacing when extending the feature.
- Use Korean month/day labels and Sunday-first weeks. Color Sunday headers and dates muted red, Saturday headers and dates muted blue.
- Today uses a brown outline and small dot. Selection uses pale green fill and a green outline. Keep the today dot when today is selected.
- Preserve the simple empty state until data is connected. Do not present fabricated counts as real history.
- Center the safe-area-aware popup, with horizontal margins, full available width up to 390px, and bounded height. Scroll content on short screens and keep closing reachable.

## Interaction And Architecture

- Opening selects today and shows the current local month.
- Month arrows change the visible month. Date selection updates the highlight and detail date. The today action resets both visible month and selection.
- Past dates remain selectable for viewing; selection does not authorize editing.
- Support closing through the close button, backdrop, and Android back action.
- Keep grid and month calculation in the library; customize through supported theme and day rendering APIs, without forking internals.
- Keep feature UI under `src/features/calendar`; the home screen connects its entry point. Keep future history aggregation outside presentation.
- Preserve accessible date labels, selected state, button names, and keyboard and touch behavior. Do not rely on color alone for important states.

## Agreed Future Task Policy

- Group tasks by their assigned calendar date, not completion timestamp. Generation date can represent assignment while tasks are only generated for the same day; use a stable assignment date when scheduling is added.
- Apply the existing local calendar-day policy consistently with task expiry. Avoid UTC conversions that shift records to another day. Make later timezone-policy changes explicit.
- Past dates are read-only. Enforce this in mutation logic as well as UI controls.
- Display completed count / total assigned count, for example `2/3`.
- Additional tasks count toward the day's total. A replacement must not count both original and replacement tasks.
- Days without tasks have no count or completion mark. Mark full completion only when the total is greater than zero and all tasks are complete.
- Full-completion styling must coexist with today, selection, and weekend styling.

## Verification

- For code changes, run `npx tsc --noEmit` and check the Expo Web entry point.
- Check opening/closing, month and year boundaries, selection, past-date viewing, and return to today. Report native and web checks separately.
- Inspect 320px and 390px mobile, 768px tablet, and 1280px desktop widths, including short-screen scrolling and six-row months.
- When connecting history, check empty days, partial/full completion, additions, replacements, local midnight boundaries, and blocked past-date mutations.
- Documentation-only changes need link and UTF-8 checks and `git diff --check`, not an app build.

## Preview Verification Record

- TypeScript passed. Web layouts were visually inspected at 320px, 390px, 768px, and 1280px widths.
- Date selection, next-month navigation, and return to today were checked on web.
- Native-device behavior, real task integration, and full accessibility testing have not been verified. These notes are not permanent test passes.
