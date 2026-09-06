# Habit Town Calendar

Read this before changing the calendar popup, home entry point, day styling, or task-history integration. This records the user-approved design and policies. Apply alongside `.codex/common/rules/frontend/calendar.md`, responsive CSS rules, and Expo design rules. User instructions take precedence.

## Current Scope

- Entry: the calendar button in `app/index.tsx`.
- Component: `src/features/calendar/components/CalendarModal.tsx`.
- Library: `react-native-calendars`, using the version pinned in `package.json`.
- Implemented: month navigation, selection, today action, date-based completion counts, full-completion marks, task details, and completion toggles for today.
- The calendar consumes the home planner dailyPlans and toggleTask callback. Loading and error messages must remain distinct from empty history. Existing generatedAt represents the assigned date; no database migration is required for same-day generation.
- Aggregation lives in src/features/calendar/calendarHistory.ts. Completion uses the shared planner persistence path. Do not create a separate calendar task store.

## Approved Design

- Preserve the pixel-room style and Galmuri11 font.
- Use a cream panel (`#fff8ea`), sand header (`#f2dfb6`), dark brown 4px frame (`#3d2d28`), square corners, and a restrained offset shadow.
- Preserve the hierarchy: title and close button; caption and today action; month navigation; weekday labels and dates; state legend; selected-date detail.
- Follow the current component's Korean copy and spacing when extending the feature.
- Use Korean month/day labels and Sunday-first weeks. Color Sunday headers and dates muted red, Saturday headers and dates muted blue.
- Today uses a brown outline and small dot. Selection uses pale green fill and a green outline. Keep the today dot when today is selected.
- Show an empty state only after loading and when the selected day has no tasks. Do not present fabricated counts as real history.
- Center the safe-area-aware popup, with horizontal margins, full available width up to 390px, and bounded height. Scroll content on short screens and keep closing reachable.

## Interaction And Architecture

- Opening selects today and shows the current local month.
- Month arrows change the visible month. Date selection updates the highlight and detail date. The today action resets both visible month and selection.
- Past dates remain selectable for viewing; selection does not authorize editing.
- Support closing through the close button, backdrop, and Android back action.
- Keep grid and month calculation in the library; customize through supported theme and day rendering APIs, without forking internals.
- Keep feature UI under `src/features/calendar`; the home screen connects its entry point. Keep future history aggregation outside presentation.
- Preserve accessible date labels, selected state, button names, and keyboard and touch behavior. Do not rely on color alone for important states.

## Task Policy

- Group tasks by their assigned calendar date, not completion timestamp. Generation date can represent assignment while tasks are only generated for the same day; use a stable assignment date when scheduling is added.
- Apply the existing local calendar-day policy consistently with task expiry. Avoid UTC conversions that shift records to another day. Make later timezone-policy changes explicit.
- Past dates are read-only. canEditPlan checks local assignment date and expiry in both the calendar UI and shared toggleTask mutation. Refresh the calendar clock at midnight and on app resume; generation/loading also blocks toggles.
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

## Task Integration Verification

- Date aggregation, extra rounds, replacements, empty/full days, local midnight, and past/future edit protection passed isolated checks.
- An in-memory, nonpersistent browser fixture verified count updates from 1/3 through 3/3 and disabled past-date checkboxes. The temporary fixture and compiled checks were removed afterward.
- Mobile task rows were checked at 320px for wrapping and scrolling. Native-device persistence has not been tested.
- Metro includes WASM support and development cross-origin isolation headers for Expo SQLite web. A production web host must provide the same COOP/COEP headers. The CommonJS Metro file is a runtime configuration wrapper; application logic remains TypeScript.
