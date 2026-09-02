# Component Separation Pattern

Use this pattern when organizing React or Expo projects.


## Core Principle

Each component should have one clear responsibility.


Separate full screens from reusable UI pieces and feature-specific logic.


## Recommended Layers

- `screen` or `page`: route-level screens
- `component`: reusable UI pieces
- `feature`: domain-specific UI and logic
- `hook`: stateful or reusable logic
- `service` or `api`: server communication
- `constant`: options, menus, and configuration values
- `type`: shared data shapes


## Structure Choice

Prefer a layer-first structure for small apps, prototypes, or apps with one primary feature.

Use this shape when most screens share the same small set of components, hooks, services, and types:

```text
src/
  screens/
  components/
  hooks/
  services/
  types/
  constants/
```

Prefer a feature-first structure when the app has multiple independent domains, or when one domain owns several screens, components, hooks, services, and types.

Use this shape when keeping domain code together makes navigation and ownership clearer:

```text
src/
  features/
    reminders/
      screens/
      components/
      hooks/
      services/
      types/
```

Do not introduce a feature folder for a single simple screen unless the feature is expected to grow or already contains meaningful domain logic.

When in doubt, start layer-first and move to feature-first only when the code shows real domain boundaries.


## When To Split

Consider splitting when:

1. JSX becomes long or hard to scan.
2. The same UI structure appears more than once.
3. A section owns meaningful local state.
4. A section should be testable in isolation.
5. A popup, modal, list card, filter, search header, or input area is self-contained.
6. A screen handles API calls, state management, and UI rendering in one file.
7. A file grows beyond roughly 200 to 300 lines.


## Example Structure

```text
src/
  app/ or screens/
    HomeScreen.tsx

  features/
    memo/
      components/
        MemoList.tsx
        MemoCard.tsx
        MemoEditor.tsx
      hooks/
        useMemoList.ts
      services/
        memoService.ts
      constants/
        memo.constants.ts
      types/
        memo.types.ts

  components/
    common/
      Button.tsx
      Modal.tsx
      EmptyState.tsx
    layout/
      Header.tsx
      ScreenContainer.tsx

  hooks/
  services/
  constants/
  types/
```
