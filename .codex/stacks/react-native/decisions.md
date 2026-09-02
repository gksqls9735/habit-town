# React Native Frontend Decisions

Use this file when choosing frontend tools for bare React Native projects.


## Default Choices

Use these defaults for new React Native projects unless the user requests otherwise:

- Navigation: React Navigation unless the existing project uses another navigation system.
- Server state and cache: TanStack Query.
- Client global state: Zustand only when global client state is needed.
- Local state: React state, reducer, and local hooks.
- Forms: React Hook Form.
- Styling: React Native StyleSheet with shared design tokens by default.
- Utility styling: NativeWind only when the project already uses it or the user requests a Tailwind-like workflow.
- Icons: Font Awesome with React Native support.
- UI components: React Native Paper when a standard native component library is needed.
- Web-only UI: do not use Ant Design by default.
- CSS-in-JS: avoid styled-components unless the existing project uses it or the user requests it.


## State Management

- Use React local state for component-only behavior.
- Use navigation params for route state.
- Use TanStack Query for server state and caching.
- Use Zustand only for cross-screen client state.
- Avoid Redux Toolkit unless the project already uses Redux or the user explicitly requests it.


## Styling And UI

- Use React Native StyleSheet with shared design tokens by default.
- Use NativeWind only when the project already uses it or the user requests a Tailwind-like workflow.
- Use React Native Paper when a standard native component library is needed.
- Do not use web-only UI libraries such as Ant Design by default.


## Icons

Use Font Awesome for React Native icons.


Recommended packages:

- `@fortawesome/fontawesome-svg-core`
- `@fortawesome/free-solid-svg-icons`
- `@fortawesome/react-native-fontawesome`
- `react-native-svg`


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

Before scaffolding a new React Native project, report:

- Navigation approach
- Styling approach
- UI library
- Server state tool
- Client state tool
- Form library
- Icon library
- Reason for each choice

