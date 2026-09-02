# TypeScript Rules

All code should be written in TypeScript by default.


## Required Standard

- Use `.ts` for non-UI source files.
- Use `.tsx` for files that contain JSX.
- Prefer explicit domain types for API responses, service inputs, and shared data shapes.
- Avoid adding new JavaScript source files unless the runtime explicitly requires JavaScript.
- When JavaScript is unavoidable, keep it as a thin runtime wrapper and place implementation logic in TypeScript where possible.


## Type Safety

- Do not use `any` unless there is a clear boundary reason.
- Prefer `unknown` plus narrowing for untrusted input.
- Define reusable types in a `types/` area when they are shared across modules.
- Keep API DTOs, domain models, and UI view models separate when their responsibilities differ.


## Validation Boundary

Validate data at the UI boundary first and validate it again in the service or backend boundary.


Use this pattern for user input, API payloads, permissions, and destructive actions.

