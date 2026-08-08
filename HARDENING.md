<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.9

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.9** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: shell commands. In major-tag-update.yaml line 25: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` — attacker-controlled release tag name is interpolated directly into a shell command. In version-bump.yaml: line 47 `pnpm version ${{ inputs.release_type }} --no-git-tag-version` (workflow_dispatch input injected directly); line 52 `git checkout -b "release/${{ env.new_version }}"` (${{ env.new_version }} in shell); line 63 `git commit -m "chore(release): bump version to ${{ env.new_version }}"` (${{ env.new_version }} in shell); line 66 `git push -u origin "HEAD:release/${{ env.new_version }}"` (${{ env.new_version }} in shell); lines 70-74 `gh pr create ... --head "release/${{ env.new_version }}" --title "Release: ${{ env.new_version }}" --body "...version ${{ env.new_version }}"` (multiple ${{ env.new_version }} in shell). All of these bypass shell quoting and allow injection of shell metacharacters before the shell ever sees the value.

Locations:

- `.github/workflows/major-tag-update.yaml:25`
- `.github/workflows/version-bump.yaml:47`
- `.github/workflows/version-bump.yaml:52`
- `.github/workflows/version-bump.yaml:63`
- `.github/workflows/version-bump.yaml:66`
- `.github/workflows/version-bump.yaml:70`

### unpinned-uses (severity: high)

All uses: references across action.yml and every workflow file use mutable tag-based refs instead of immutable 40-character SHA commit digests, making the action vulnerable to supply-chain attacks if any referenced action is compromised or its tag is moved. Failing references include: action.yml: `actions/setup-node@v4`; build.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`; changelog.yaml: `actions/checkout@v4`, `nyaomaru/changelog-bot@v0`; major-tag-update.yaml: `actions/checkout@v4`; npm-publish.yaml: `actions/checkout@v4`, `actions/setup-node@v4`, `jdx/mise-action@v2`, `actions/cache@v4`; test.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`; version-bump.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`.

Locations:

- `action.yml:97`
- `.github/workflows/build.yaml:12`
- `.github/workflows/build.yaml:16`
- `.github/workflows/build.yaml:21`
- `.github/workflows/changelog.yaml:79`
- `.github/workflows/changelog.yaml:83`
- `.github/workflows/major-tag-update.yaml:11`
- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:22`
- `.github/workflows/npm-publish.yaml:28`
- `.github/workflows/test.yaml:12`
- `.github/workflows/test.yaml:16`
- `.github/workflows/test.yaml:21`
- `.github/workflows/version-bump.yaml:23`
- `.github/workflows/version-bump.yaml:30`
- `.github/workflows/version-bump.yaml:35`

### missing-permissions (severity: medium)

Three workflow files have no top-level permissions: key and no job-level permissions: key on any of their jobs. Without explicit permissions, GitHub Actions defaults to the repository's default token permissions (which may be read/write for all scopes depending on org/repo settings), violating the principle of least privilege. Affected files: build.yaml (jobs: lint), test.yaml (jobs: test), major-tag-update.yaml (jobs: move-v0).

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions

**Notes:**

Fixed all three findings across 7 files: (1) Script injection: moved all ${{ github.event.release.tag_name }}, ${{ inputs.release_type }}, and ${{ env.new_version }} expressions from run: shell commands into step env: blocks, referencing them as plain shell variables. (2) Unpinned uses: pinned all 5 distinct action references (actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4, nyaomaru/changelog-bot@v0) to full 40-char commit SHAs with tag comments preserved. (3) Missing permissions: added top-level permissions blocks to build.yaml (contents: read), test.yaml (contents: read), and major-tag-update.yaml (contents: write, needed to push the v0 tag).

