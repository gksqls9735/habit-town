---
name: git
description: Use only when the user explicitly invokes "/git" or "$git" to synchronize the current repository with its connected remote by pulling, committing current work, and pushing the current branch. Do not use for general coding tasks or when the user only asks a git question.
---

# Git Sync

Synchronize the current repository with its connected remote.


## Scope

This skill is for an explicit repository sync workflow:

1. Inspect the current git state.
2. Pull from the current upstream.
3. Stage and commit current work when changes exist.
4. Push the current branch to the connected remote.


## Safety Rules

- Do not run `git reset --hard`, `git clean`, force push, or destructive checkout commands.
- Do not overwrite conflict files automatically.
- Stop and report when merge or rebase conflicts occur.
- Stop and ask when the repository has no remote or no clear upstream and `origin` cannot be inferred.
- Do not commit ignored files.
- Do not commit generated `.codex/workflow/**/*.md` files.
- If changes look unrelated, sensitive, or risky, report the files and ask before committing.


## Workflow

Run these checks first:

```bash
git status --short
git branch --show-current
git branch -vv
git remote -v
```


Pull before committing:

- If the working tree is clean, run `git pull --rebase`.
- If local changes exist, run `git pull --rebase --autostash`.
- If pull fails or reports conflicts, stop and summarize the conflict state.


Stage and commit:

- If the user provided a commit message, use it.
- Otherwise generate a concise commit message from the changed files and diff summary.
- Stage current non-ignored changes with `git add -A` unless the user requested a narrower scope.
- Run `git status --short` after staging.
- If there are staged changes, commit them.
- If there are no changes after pull, skip the commit.


Push:

- Prefer `git push` when the current branch already has an upstream.
- If there is no upstream but `origin` exists, use `git push -u origin <current-branch>`.
- Do not use `--force` or `--force-with-lease`.


## Verification

After push, report:

- Current branch
- Commit hash when a commit was created
- Pull result
- Push result
- Remaining `git status --short`


## Failure Handling

If any step fails:

- Stop the workflow.
- Report the failed command and important output.
- Show the current `git status --short`.
- Do not attempt unrelated recovery commands.

