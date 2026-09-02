# React Frontend Decisions

Use this file when choosing frontend tools for React web projects.


## Default Choices

Use these defaults for new React web projects unless the user requests otherwise:

- Server state and cache: TanStack Query.
- Client global state: Zustand only when global client state is needed.
- Local state: React state, reducer, and local hooks.
- Forms: React Hook Form.
- Styling: Tailwind CSS.
- Icons: Font Awesome with React bindings.
- Admin, dashboard, CRUD, table-heavy, or form-heavy UI: Ant Design.
- Highly custom consumer-facing UI: Tailwind CSS with project-specific components.
- CSS-in-JS: avoid styled-components unless the existing project uses it or the user requests it.


## State Management

- Use React local state for component-only behavior.
- Use router search params for URL state.
- Use TanStack Query for server state and caching.
- Use Zustand only for cross-screen client state.
- Use Redux Toolkit only when the project already uses Redux or the user explicitly requests it.


## Styling And UI

- Use Tailwind CSS as the default styling system.
- Use Ant Design for admin, dashboard, CRUD, table-heavy, and form-heavy applications.
- Do not force Ant Design on highly custom consumer-facing UI.
- Use styled-components only when the existing project already uses it or the user explicitly requests CSS-in-JS.


## Icons

Use Font Awesome for React web icons.


Recommended packages:

- `@fortawesome/fontawesome-svg-core`
- `@fortawesome/free-solid-svg-icons`
- `@fortawesome/react-fontawesome`


Button icons should match the button action:

- Add or create: `faPlus`
- Save: `faFloppyDisk`
- Edit: `faPenToSquare`
- Delete: `faTrash`
- Search: `faMagnifyingGlass`
- Filter: `faFilter`
- Download: `faDownload`
- Upload: `faUpload`
- Settings: `faGear`
- Close or cancel: `faXmark`
- Back or previous: `faArrowLeft`
- Next or forward: `faArrowRight`


## Decision Report

Before scaffolding a new React web project, report:

- Styling approach
- UI library
- Server state tool
- Client state tool
- Form library
- Icon library
- Reason for each choice

