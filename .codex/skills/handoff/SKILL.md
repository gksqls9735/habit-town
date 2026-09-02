---
name: handoff
description: Use only when the user explicitly invokes "/handoff" or "$handoff" to create a handoff summary that another Codex session can continue from. Do not use for general coding tasks.
---

# Handoff

Create a continuation-focused handoff summary and save it as a new workflow file.


## Output Location

Always create a new Markdown file:

```text
.codex/workflow/handoff/YYYYMMDD-HHMMSS-handoff.md
```

Do not overwrite existing files.


## Content

Include:

- Goal and current status
- Important decisions already made
- Files changed or likely relevant
- Commands already run and their results
- Known risks or unresolved questions
- Next recommended action

Optimize for a fresh Codex session. Prefer concrete file paths, commands, commit hashes, and exact status.
