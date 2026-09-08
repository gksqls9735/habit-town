---
name: git
description: Use when the user asks to git sync, push, pull, commit-and-push, or otherwise synchronize the current repository with its connected remote. Also use when the user explicitly invokes "/git" or "$git". Do not use for general coding tasks or when the user only asks a git question.
---

# Git Sync

Synchronize the current repository with its connected remote.

In addition to moving commits, this harness records and reports enough change
context for a user to understand what was added or modified during sync.


## Scope

This skill is for a repository sync workflow. Use it when the user explicitly
asks to synchronize git state, including requests such as `git sync`, `push`,
`push 해줘`, `pull 받아줘`, `commit and push`, `/git`, or `$git`.

The standard full-sync workflow is:

1. Inspect the current git state.
2. Pull from the current upstream.
3. Stage and commit current work when changes exist.
4. Push the current branch to the connected remote.
5. Report inbound and outbound change history in user-readable terms.


## Safety Rules

- Do not run `git reset --hard`, `git clean`, force push, or destructive checkout commands.
- Do not overwrite conflict files automatically.
- Stop and report when merge or rebase conflicts occur.
- Stop and ask when the repository has no remote or no clear upstream and `origin` cannot be inferred.
- Do not commit ignored files.
- Do not commit generated `.codex/workflow/**/*.md` files.
- If changes look unrelated, sensitive, or risky, report the files and ask before committing.
- Do not invent change history. Base all added/modified/deleted summaries on
  `git status`, `git diff --stat`, `git diff --name-status`, commit messages,
  and commit bodies.


## Workflow

Run these checks first:

```bash
git status --short
git branch --show-current
git branch -vv
git remote -v
```

Capture the starting remote position before pull when an upstream exists:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git rev-parse HEAD
git rev-parse @{u}
```

If no upstream exists but `origin` exists, use the current branch and `origin`
for push as described below. In that case, skip upstream-only history checks
until after the branch has been pushed with `-u`.

Pull before committing:

- If the working tree is clean, run `git pull --rebase`.
- If local changes exist, run `git pull --rebase --autostash`.
- If pull fails or reports conflicts, stop and summarize the conflict state.
- After a successful pull, compare the pre-pull HEAD with the new HEAD. If new
  commits were received, collect their dates, subjects, authors, and changed
  files:

```bash
git log --date=iso --name-status --format="commit %H%nDate: %ad%nAuthor: %an%nSubject: %s%nBody:%n%b" <old-head>..HEAD
```

- If inbound commits contain a `Sync Summary:` section in the body, prefer that
  as the user's explanation. Otherwise summarize from the commit subject and
  `--name-status` output. Use concrete dates from the log.


Stage and commit:

- If the user provided a commit message, use it.
- Otherwise generate a concise commit message from the changed files and diff summary.
- Stage current non-ignored changes with `git add -A` unless the user requested a narrower scope.
- Run `git status --short` after staging.
- If there are staged changes, inspect and summarize them before committing:

```bash
git diff --cached --stat
git diff --cached --name-status
```

- Commit with a subject plus a structured body. The body must include:
  - `Sync Summary:` one to three bullets describing user-visible changes.
  - `Files:` bullets grouped by added, modified, deleted, or renamed files.
  - `Verification:` commands or checks run, or `Not run` with a short reason.

Example:

```text
Add animal rescue delivery reward popup

Sync Summary:
- Added a tappable animal-rescue parcel reward flow on the home screen.
- Added random delivery rewards for coins and inventory items.

Files:
- Added: src/features/rewards/eventRewards.ts
- Added: src/screens/home/components/DeliveryRewardPopup.tsx
- Modified: src/screens/home/HomeScreen.tsx

Verification:
- npx tsc --noEmit
```

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
- Inbound changes from pull, including commit date, commit subject, and what was added or modified
- Outbound changes pushed, including commit date, commit subject, and what was added or modified
- Push result
- Remaining `git status --short`

When reporting inbound or outbound changes, keep the summary concise and
chronological. Say `No inbound changes` or `No outbound changes` when
applicable. If a commit lacks a structured body, state that the detail was
inferred from changed files.


## Failure Handling

If any step fails:

- Stop the workflow.
- Report the failed command and important output.
- Show the current `git status --short`.
- Do not attempt unrelated recovery commands.
