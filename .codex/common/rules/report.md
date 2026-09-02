# Report Rules

Use these rules when reporting work to the user.

## Language

Write harness documents and repository Markdown instructions in English.

When reporting progress, completion results, blockers, or options to a Korean-speaking user, respond in Korean.

Use Korean for user-facing choices, approval questions, summaries, and final reports when the conversation is in Korean.

## Start Of Work

Before making changes, report:

- Task summary
- Referenced rules or documents
- Files expected to change


Example:

```text
Task: Split the memo screen into smaller components.

References:
- .codex/common/patterns/component.md

Planned changes:
- MemoScreen.tsx
- MemoList.tsx
```

## During Work

When a decision is based on a rule, mention the rule or file that supports it.

For long-running builds and release commands, follow `.codex/common/rules/build-progress.md` and report progress periodically instead of only saying the command is running.


Example:

```text
Reference:
- .codex/common/patterns/component.md

The list area is being separated into its own component because it is a reusable UI section.
```

## Completion

At the end of work, report:

- Referenced rules
- Changed files
- Main changes
- Commands run
- Result


Example:

```text
References:
- .codex/common/patterns/component.md

Changed:
- MemoScreen.tsx

Commands:
- npm run lint

Result:
- Passed
```
