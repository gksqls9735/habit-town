---
name: worklog
description: Use only when the user explicitly invokes "/worklog" or "$worklog" to summarize current repository work state using git status, diffs, recent commits, and validation commands. Do not use for general coding tasks.
---

# Worklog

Create a repository worklog and save it as a new workflow file.


## Output Location

Always create a new Markdown file:

```text
.codex/workflow/worklog/YYYYMMDD-HHMMSS-worklog.md
```

Do not overwrite existing files.


## Repository Inspection

Use available repository facts. Prefer:

```bash
git status --short
git log --oneline --decorate -5
git diff --stat
git diff --cached --stat
```

## Content

Include:

- Current branch and upstream when available
- Working tree status
- Staged and unstaged changes
- Recent commits
- Commands run and results
- Files that still need commit, review, or follow-up

Do not invent commands, test results, commits, or file changes.
