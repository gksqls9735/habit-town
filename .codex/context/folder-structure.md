# Folder Structure Guide

Use this guide before adding new app code, moving code, or creating a new screen/component/feature folder.

## Core Rule

Keep Expo Router route files thin. Route files in `app/` should import a screen component and export it. Do not put large JSX trees, feature logic, local UI sections, or screen-specific styles directly in route files.

## Current Home Screen Shape

The home route is split like this:

```text
app/
  index.tsx

src/
  screens/
    home/
      HomeScreen.tsx
      homeData.ts
      homeUtils.ts
      types.ts
      components/
        HomeActionRail.tsx
        LocalDevControls.tsx
        PetCareOverlay.tsx
        PetRoomPopup.tsx
        StaticPet.tsx
```

Follow these ownership boundaries:

- `app/index.tsx`: route entry only.
- `src/screens/home/HomeScreen.tsx`: home screen composition, modal wiring, and screen-level state coordination.
- `src/screens/home/components/`: UI sections that belong only to the home screen.
- `src/screens/home/homeData.ts`: static home screen data such as rail actions and pet definitions.
- `src/screens/home/homeUtils.ts`: small home-screen utilities such as sizing helpers and local environment checks.
- `src/screens/home/types.ts`: home-screen data shapes shared by home screen components.

## Where New Code Goes

- Add new route screens under `src/screens/<screen-name>/`, then keep the matching `app/` route file as a thin entry.
- Add UI that is only used by one screen under `src/screens/<screen-name>/components/`.
- Add domain behavior, persistence, service calls, hooks, and reusable feature UI under `src/features/<feature-name>/`.
- Add app-wide reusable primitives under `src/components/common/` or `src/components/layout/` only when they are truly domain-neutral.
- Keep image and sprite assets in the existing asset category folder. Generated pixel-pet assets with raw/clean validation should stay under their dedicated harness root.

## Feature Boundaries

Use domain folders when behavior belongs to a product area:

- `src/features/goals/`: yearly goals, daily plans, AI task generation, and goal persistence.
- `src/features/rewards/`: reward rules, pet growth reward progress, and reward calculations.
- `src/features/inventory/`: inventory catalog, persistence, and inventory UI.
- `src/features/calendar/`: calendar history and calendar UI.

Do not put feature-owned rules or data access in `src/screens`. Screens should compose feature hooks/components and pass data down.

## Split Triggers

Create or move a component when:

- A file grows beyond roughly 200 to 300 lines.
- A route screen contains multiple visible sections.
- A popup, rail, HUD, modal body, or repeated item can be named clearly.
- A section owns local state or should be testable in isolation.
- Static data, environment checks, or sizing helpers make a screen file harder to scan.

## Import Direction

Keep imports flowing in this direction:

```text
app route -> screen -> screen components -> feature/shared types
screen -> feature hooks/components/services
shared components -> no feature imports
```

Avoid circular ownership between features. Share through typed values, service results, or parent screen composition.
