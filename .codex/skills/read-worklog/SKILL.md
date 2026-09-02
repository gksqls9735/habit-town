---
name: read-worklog
description: Use only when the user explicitly invokes "/read-worklog" or "$read-worklog" to read the latest saved worklog workflow file and continue from repository work state. Do not use for general coding tasks.
---

# Read Worklog

Read the latest saved worklog and continue from that repository state.


## Source Folder

Read the latest Markdown file from:

```text
.codex/workflow/worklog/
```

Prefer newest timestamped filename. If filenames are not timestamped, use most recent modified time.

## Behavior

- Summarize what was loaded.
- Identify branch, changed files, commits, validation, and pending work.
- Continue the user's requested task from the loaded worklog.
- If no file exists, say so and suggest `/worklog`.

Do not invent missing repository facts.
