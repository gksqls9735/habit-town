---
name: read-handoff
description: Use only when the user explicitly invokes "/read-handoff" or "$read-handoff" to read the latest saved handoff workflow file and continue work from it. Do not use for general coding tasks.
---

# Read Handoff

Read the latest saved handoff and continue work from that context.


## Source Folder

Read the latest Markdown file from:

```text
.codex/workflow/handoff/
```

Prefer newest timestamped filename. If filenames are not timestamped, use most recent modified time.

## Behavior

- Summarize what was loaded.
- Identify current status, decisions, risks, unresolved questions, and next action.
- Continue the user's requested task from the loaded handoff.
- If no file exists, say so and suggest `/handoff`.

Do not invent missing context.
