---
name: semantic-release-commits
description: Use when creating a HabitMaker commit, choosing a Conventional Commit message, or preparing a release-triggering change. Aligns commit types with this repository's semantic-release rules.
---

# HabitMaker Semantic-Release Commits

Use this skill when the user explicitly asks to commit changes, prepare a commit, or choose a commit message for this repository. Follow the repository's `AGENTS.md` and the active task instructions.

## Repository release behavior

- `.releaserc.json` runs semantic-release on `main` after the CI job succeeds.
- Commit messages are analyzed using the default Angular/Conventional Commits rules.
- A release updates the root `package.json` and `package-lock.json`, generates `CHANGELOG.md`, and creates a GitHub Release. The private package is not published to npm.
- The generated release commit is `chore(release): <version> [skip ci]`; do not create or imitate it manually.
- Only commits since the previous release tag are considered. A change merged without a release-triggering commit will not produce a release.

## Select the accurate release impact

Use the actual change to choose the type; never label work `feat` or `fix` just to force a release.

- `feat`: minor release for a new user-facing or API capability.
- `fix`: patch release for a bug fix.
- `perf`: patch release for a performance improvement.
- `revert`: patch release when reverting a prior change.
- Any type with `!` or a `BREAKING CHANGE:` footer: major release for an incompatible behavior or API change.
- `docs`, `test`, `build`, `ci`, `chore`, `refactor`, `style`: no release by default for maintenance that does not change behavior.

Breaking changes must be real and described clearly in a `BREAKING CHANGE:` footer. A `!` in the header can also mark the breaking change; prefer including the explanatory footer as well.

## Message format

Use the Conventional Commits form below. The scope is optional; when present, use parentheses. Add `!` immediately before the colon only for a genuine breaking change:

```text
<type>(<scope>): <short imperative description>
<type>(<scope>)!: <short imperative description>  # breaking change
<type>: <short imperative description>             # scope omitted

[optional explanation]

[optional footer, e.g. BREAKING CHANGE: ...]
```

- Keep the subject concise, specific, and in English, matching the repository's existing commit history.
- Use a scope only when it clarifies the affected area; use a relevant project area such as `app`, `api`, `ui`, `auth`, or `habits`. Do not invent a scope.
- Keep one logical change per commit. Put rationale or context in the body when the subject alone is insufficient.
- Examples:

  ```text
  feat(auth): add password visibility toggle
  fix(api): prevent duplicate habit completions
  perf(habits): reduce calendar query work
  docs(readme): explain local setup
  feat(api)!: require an access token for habit endpoints

  BREAKING CHANGE: clients must send a valid bearer token.
  ```

## Commit workflow

1. Commit only when the user explicitly requests it. If the request is to prepare a message only, do not create the commit.
2. Inspect `git status --short`, `git diff --stat`, and the full relevant diff, including untracked files. Identify pre-existing user changes and keep them out of the commit.
3. Choose the smallest accurate Conventional Commit type and optional scope based on the change. If it is maintenance-only, explain that it will not trigger a semantic release unless it contains a genuine breaking change.
4. Run the relevant checks for the change. Do not claim checks passed unless they were run.
5. Stage only files belonging to the requested change; never stage everything blindly or include secrets and local environment files. Review the staged content with `git diff --cached` and `git diff --cached --check`.
6. Create the commit with the selected message only after the user requested a commit. Do not amend, rewrite, or commit other work without explicit instruction.
7. Report the commit hash/message and the release impact (`major`, `minor`, `patch`, or no release).

If the change includes independent concerns, keep them in separate commits only when that separation is clear and each commit has a truthful message. If a squash merge is used, ensure its final commit title follows Conventional Commits so semantic-release can analyze it.
