<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.10

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.10** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Direct ${{ }} expression interpolation inside run: shell blocks. Rule (a) violation: the expression is substituted into the shell command string before the shell parses it, enabling command injection.

- major-tag-update.yaml: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` — github.event.release.tag_name is interpolated directly into a shell string.
- version-bump.yaml: `pnpm version ${{ inputs.release_type }} --no-git-tag-version` — inputs.release_type is interpolated directly (though constrained to a choice list, it is still a ${{ }} in a run: block).
- version-bump.yaml: `git checkout -b "release/${{ env.new_version }}"` — env.new_version is interpolated directly.
- version-bump.yaml: `git commit -m "chore(release): bump version to ${{ env.new_version }}"` — env.new_version is interpolated directly.
- version-bump.yaml: `--head "release/${{ env.new_version }}"`, `--title "Release: ${{ env.new_version }}"`, `--body "Auto-generated release PR for version ${{ env.new_version }}"` — env.new_version is interpolated directly in multiple gh pr create arguments.

Fix: move values into env: variables and reference them as quoted shell variables (e.g. "$ENV_VAR").

Locations:

- `.github/workflows/major-tag-update.yaml:20`
- `.github/workflows/version-bump.yaml:48`
- `.github/workflows/version-bump.yaml:52`
- `.github/workflows/version-bump.yaml:63`
- `.github/workflows/version-bump.yaml:68`

### missing-permissions (severity: medium)

Workflow files have no top-level `permissions:` key and no job-level `permissions:` key on any job. Without explicit permissions, the GITHUB_TOKEN is granted its default (potentially broad) permissions, violating the principle of least privilege.

- build.yaml: no permissions declared at top level or job level.
- test.yaml: no permissions declared at top level or job level.
- major-tag-update.yaml: no permissions declared at top level or job level (the workflow pushes tags and needs contents:write, but no permissions block is present to scope this explicitly).

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

### unpinned-uses (severity: high)

All `uses:` references across action.yml and every workflow file use mutable tag-based refs (e.g. @v4, @v2, @v0) rather than immutable 40-character commit SHA digests. A compromised or malicious tag update could silently inject arbitrary code into the action.

Failing references:
- action.yml: `actions/setup-node@v4`
- build.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- changelog.yaml: `actions/checkout@v4`, `nyaomaru/changelog-bot@v0`
- major-tag-update.yaml: `actions/checkout@v4`
- npm-publish.yaml: `actions/checkout@v4`, `actions/setup-node@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- test.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- version-bump.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`

Fix: pin every `uses:` to a full 40-character commit SHA, e.g. `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`.

Locations:

- `action.yml:63`
- `.github/workflows/build.yaml:10`
- `.github/workflows/build.yaml:14`
- `.github/workflows/build.yaml:19`
- `.github/workflows/changelog.yaml:72`
- `.github/workflows/changelog.yaml:76`
- `.github/workflows/major-tag-update.yaml:10`
- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:18`
- `.github/workflows/npm-publish.yaml:23`
- `.github/workflows/npm-publish.yaml:28`
- `.github/workflows/test.yaml:10`
- `.github/workflows/test.yaml:14`
- `.github/workflows/test.yaml:19`
- `.github/workflows/version-bump.yaml:22`
- `.github/workflows/version-bump.yaml:27`
- `.github/workflows/version-bump.yaml:33`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, missing-permissions, unpinned-uses

**Notes:**

Fixed all three findings:

1. script-injection: In major-tag-update.yaml, moved `github.event.release.tag_name` into a `TAG_NAME` env var. In version-bump.yaml, moved `inputs.release_type` into `RELEASE_TYPE` env var, and moved all `env.new_version` references into `NEW_VERSION` env vars on each step that uses them (Create new branch, Commit & Push changes, Create Pull Request).

2. missing-permissions: Added `permissions: contents: read` to build.yaml and test.yaml (read-only for PR checks). Added `permissions: contents: write` to major-tag-update.yaml (needs to push tags). version-bump.yaml already had appropriate permissions.

3. unpinned-uses: Pinned all action references to full 40-character commit SHAs with tag comments: actions/checkout@v4→11d5960a..., actions/setup-node@v4→49933ea5..., jdx/mise-action@v2→c37c9329..., actions/cache@v4→0057852b..., nyaomaru/changelog-bot@v0→f5440fb8... Applied across action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, and version-bump.yaml.

