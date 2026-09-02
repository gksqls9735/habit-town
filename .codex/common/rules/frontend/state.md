# Frontend State Rules

Use these rules when choosing frontend state management tools.


## Existing Projects

Before adding a new state tool, inspect the existing dependencies, component patterns, and state ownership.


Follow the existing state management approach unless there is a clear reason to change it.


## Selection Rules

Choose the smallest state tool that fits the responsibility.


- Component-only state: React `useState`, `useReducer`, or local hooks.
- Route or URL state: router params, search params, or navigation params.
- Server state and caching: TanStack Query when the stack supports it.
- Cross-screen client state: Zustand when global client state is actually needed.
- Large event-heavy application state: Redux Toolkit only when the project already uses Redux or the user explicitly requests it.


## Anti-Patterns

- Do not put server cache into client global state by default.
- Do not introduce Redux Toolkit for small local or feature state.
- Do not use Zustand when route params or local state are enough.

