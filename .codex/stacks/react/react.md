# React Rules

Use these rules when working in React projects.


## Structure

- Keep route-level screens separate from reusable components.
- Move repeated UI into `components/`.
- Move feature-specific UI, hooks, services, constants, and types into `features/<feature-name>/`.
- Keep API calls outside presentational components.


## Components

- Prefer small components with clear inputs and outputs.
- Keep business logic in hooks or services when possible.
- Avoid mixing data fetching, state orchestration, and large JSX in one component.


## Frontend Decisions

Follow `.codex/common/rules/frontend-decisions.md` and `.codex/stacks/react/decisions.md` before choosing state management, UI libraries, or styling tools.


## Design

Follow `.codex/stacks/react/design.md` when designing React web UI.


## Version Selection

Follow `.codex/common/rules/versioning.md` before creating or upgrading a React project.


For new React web projects, report the selected Node.js, package manager, React, TypeScript, and build tool versions before scaffolding.


## Verification

Run the project's available checks after changes.

