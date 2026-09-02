---
name: read-summary
description: Use only when the user explicitly invokes "/read-summary" or "$read-summary" to read the latest saved summary workflow file and continue from that context. Do not use for general coding tasks.
---

# Read Summary

Read the latest saved summary and continue from that context.


## Source Folder

Read the latest Markdown file from:

```text
.codex/workflow/summary/
```

Prefer newest timestamped filename. If filenames are not timestamped, use most recent modified time.

## Behavior

- Summarize what was loaded.
- Identify goals, decisions, open questions, and next steps.
- Continue the user's requested task from the loaded context.
- If no file exists, say so and suggest `/summary`.

Do not invent missing context.
