# Local Preview Rules

Use these rules whenever a task would normally involve a local preview, dev server, emulator-backed web view, browser inspection, or localhost-based visual verification.

## Core Rule

Codex must not start local development or preview servers for verification.

This includes commands such as:

- `npm run dev`
- `npm run web`
- `npm run preview`
- `npx expo start --web`
- `npx vite --host`
- Any other command whose purpose is to launch a localhost server for Codex to inspect

## Browser Inspection

Do not open or inspect `localhost`, `127.0.0.1`, or LAN preview URLs in a browser unless the user has already started that server and explicitly asks Codex to inspect that running URL.

If visual verification would normally require a local server, report that the behavior is unverified by live preview and provide the exact command the user can run themselves.

## Allowed Checks

Codex may still run non-server verification commands, such as:

- TypeScript checks
- Linters
- Unit tests that do not launch a localhost app server
- Static build commands, when they do not leave a preview server running
- `git diff --check`

## Existing Servers

If a server is already running, do not assume it is available for Codex inspection. Use it only when the user provides the URL or explicitly asks Codex to inspect the running local preview.
