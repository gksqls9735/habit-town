---
name: summary
description: Use only when the user explicitly invokes "/summary" or "$summary" to summarize the current conversation context, decisions, open questions, and next steps. Do not use for general coding tasks.
---

# Summary

Create a concise conversation summary and save it as a new workflow file.


## Output Location

Always create a new Markdown file:

```text
.codex/workflow/summary/YYYYMMDD-HHMMSS-summary.md
```

Do not overwrite existing files.


## Content

Include:

- User goals and preferences
- Decisions made in the conversation
- Completed work
- Open questions
- Next steps

Use only visible context. Do not invent missing decisions, commands, or results.
