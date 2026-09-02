# Component Separation Pattern

Use this pattern when organizing React or Expo projects.


## Core Principle

Each component should have one clear responsibility.


Separate full screens from reusable UI pieces, screen sections, and feature-specific logic.

Folder structure should reflect both what the user sees on a screen and which product feature owns the behavior. Do not split only generic/common components while leaving large route screens full of unrelated sections.


## Recommended Layers

- `screen` or `page`: route-level screens
- `screen component`: screen-owned sections that are not shared outside one route
- `component`: reusable UI pieces shared across screens or features
- `feature`: domain-specific UI, state, and logic
- `hook`: stateful or reusable logic
- `service` or `api`: server communication
- `constant`: options, menus, and configuration values
- `type`: shared data shapes


## Screen And Feature Boundaries

Start by identifying the route-level screen and its visible areas. A route screen should mostly compose named sections, connect navigation, and pass data into feature-owned components.

Create screen-local components when a visible section belongs only to one screen:

```text
src/
  app/
    home.tsx
  screens/
    home/
      HomeScreen.tsx
      components/
        HomeStatusBar.tsx
        HomeRoomScene.tsx
        HomeActionRail.tsx
        HomeRewardFloatingLayer.tsx
```

Create feature folders when a domain owns behavior, state, rules, data access, or multiple UI pieces. Feature folders should be named after product domains, not generic UI nouns:

```text
src/
  features/
    goals/
      components/
      hooks/
      services/
      constants/
      types/
    tasks/
      components/
      hooks/
      services/
      constants/
      types/
    rewards/
      components/
      hooks/
      services/
      constants/
      types/
```

For this project, expected feature boundaries include `goals`, `tasks`, `rewards`, `character`, `room`, `inventory`, `wallet`, `progress`, and `notifications` when those areas have meaningful code.

Use shared `components/` only for UI that is genuinely reusable across domains, such as buttons, modals, layout shells, HUD counters, empty states, badges, icons, and form controls.

Avoid putting feature-specific components into shared `components/` just because they are visually small. A task card belongs in `features/tasks/components/` unless it is truly domain-neutral.


## Structure Choice

Prefer a screen-first plus feature-first structure for product apps with multiple screens or gameplay/productivity domains.

Use this shape when screens have clear visual sections and features own domain behavior:

```text
src/
  app/
  screens/
    home/
      HomeScreen.tsx
      components/
  features/
    tasks/
      components/
      hooks/
      services/
      types/
  components/
    common/
    layout/
```

Prefer a simple layer-first structure only for small apps, prototypes, or apps with one primary feature.

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

Do not introduce a feature folder for a single simple screen unless the feature is expected to grow or already contains meaningful domain logic. Do introduce a screen folder when a route has several visible sections even if those sections are not reusable elsewhere.

When in doubt, keep route files thin, place one-screen-only sections under `screens/<screen-name>/components/`, and move behavior-owned code into `features/<feature-name>/` once the domain boundary is visible.


## When To Split

Consider splitting when:

1. JSX becomes long or hard to scan.
2. A route screen contains multiple named visual sections, such as header, scene, action rail, task list, reward layer, form, or footer.
3. The same UI structure appears more than once.
4. A section owns meaningful local state.
5. A section should be testable in isolation.
6. A popup, modal, list card, filter, search header, or input area is self-contained.
7. A screen handles API calls, state management, and UI rendering in one file.
8. A file grows beyond roughly 200 to 300 lines.
9. A feature contains its own data model, reward rule, generation rule, persistence behavior, or cross-screen state.


## Placement Rules

- Keep Expo Router route files thin. Route files may import `HomeScreen` or another screen component and define route metadata, but should not contain large JSX trees.
- Put screen-only layout sections in `screens/<screen-name>/components/`.
- Put domain-owned UI in `features/<feature-name>/components/`.
- Put domain hooks in `features/<feature-name>/hooks/` when they depend on that feature's state, services, or types.
- Put feature data access and calculations in `features/<feature-name>/services/` or clearly named utility files inside the feature.
- Put app-wide visual primitives in `components/common/` or `components/layout/`.
- Keep imports flowing from screens to features and shared components. Shared components should not import feature modules.
- Avoid circular ownership, such as `features/tasks` importing `features/rewards` UI directly. Share data through types, service results, or a parent screen composition when needed.


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
