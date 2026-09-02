# Expo Frontend Decisions

Use this file when choosing frontend tools for Expo projects.


## Default Choices

Use these defaults for new Expo projects unless the user requests otherwise:

- Expo SDK: target SDK 56 by default to match the current installed mobile Expo app.
- Navigation: Expo Router for new route-based apps.
- Web test path: include Expo Web support unless the user requests native-only support.
- Server state and cache: TanStack Query.
- Client global state: Zustand only when global client state is needed.
- Local state: React state, reducer, and local hooks.
- Forms: React Hook Form.
- Styling: NativeWind when a Tailwind-like workflow is desired; otherwise React Native StyleSheet with shared tokens.
- Icons: Font Awesome with React Native support.
- UI components: React Native Paper for standard mobile UI when a component library is needed.
- Web-only UI: do not use Ant Design by default.
- CSS-in-JS: avoid styled-components unless the existing project uses it or the user requests it.


## State Management

- Use React local state for component-only behavior.
- Use navigation or router params for route state.
- Use TanStack Query for server state and caching.
- Use Zustand only for cross-screen client state.
- Avoid Redux Toolkit unless the project already uses Redux or the user explicitly requests it.


## Styling And UI

- Use NativeWind only when a Tailwind-like workflow is desired.
- Use React Native StyleSheet with shared tokens when the UI should stay closer to native primitives.
- Use React Native Paper when a standard mobile component library is needed.
- Do not use web-only UI libraries such as Ant Design by default.
- Prefer UI and styling choices that can render on Expo Web when web testing is required.


## Web Support

For new Expo projects, keep web execution available by default.


Use Expo-compatible packages and check web compatibility before adding native-only modules.


If a feature must use native-only APIs, provide a web fallback, guard, or explicit unsupported state.


## Icons

Use Font Awesome for Expo icons.


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

Before scaffolding a new Expo project, report:

- Navigation approach
- Web testing approach
- Styling approach
- UI library
- Server state tool
- Client state tool
- Form library
- Icon library
- Reason for each choice

