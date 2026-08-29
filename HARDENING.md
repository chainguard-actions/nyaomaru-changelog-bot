<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.12

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.12** was hardened automatically. 12 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Direct expression interpolation of `${{ github.event.release.tag_name }}` inside a `run:` shell command. The value is passed through YAML template substitution before the shell sees it, allowing an attacker-controlled release tag name to inject arbitrary shell commands. Offending line: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"`

Locations:

- `.github/workflows/major-tag-update.yaml:20`

### script-injection (severity: high)

Sub-rule (a): Multiple direct expression interpolations inside `run:` shell commands in version-bump.yaml. (1) `pnpm version ${{ inputs.release_type }} --no-git-tag-version` — attacker-controlled workflow_dispatch input injected directly into shell. (2) `git checkout -b "release/${{ env.new_version }}"` — env context interpolated directly. (3) `git commit -m "chore(release): bump version to ${{ env.new_version }}"` — env context interpolated directly. (4) `git push -u origin "HEAD:release/${{ env.new_version }}"` — env context interpolated directly. (5) Multiple `gh pr create` arguments (`--head`, `--title`, `--body`) also use `${{ env.new_version }}` directly.

Locations:

- `.github/workflows/version-bump.yaml:47`
- `.github/workflows/version-bump.yaml:53`
- `.github/workflows/version-bump.yaml:63`
- `.github/workflows/version-bump.yaml:65`
- `.github/workflows/version-bump.yaml:70`
- `.github/workflows/version-bump.yaml:71`
- `.github/workflows/version-bump.yaml:72`

### unpinned-uses (severity: high)

action.yml references `actions/setup-node@v7` — a mutable tag, not a pinned 40-character SHA digest. This is vulnerable to supply-chain attacks if the tag is moved.

Locations:

- `action.yml:75`

### unpinned-uses (severity: high)

build.yaml references multiple actions by mutable tags instead of pinned SHA digests: `actions/checkout@v7` (line 12), `jdx/mise-action@v4` (line 16), `actions/cache@v6` (line 34).

Locations:

- `.github/workflows/build.yaml:12`
- `.github/workflows/build.yaml:16`
- `.github/workflows/build.yaml:34`

### unpinned-uses (severity: high)

changelog.yaml references multiple actions by mutable tags instead of pinned SHA digests: `actions/checkout@v7` (line 76) and `nyaomaru/changelog-bot@v0` (line 80). The `@v0` ref is especially risky as it is a major-version floating tag.

Locations:

- `.github/workflows/changelog.yaml:76`
- `.github/workflows/changelog.yaml:80`

### unpinned-uses (severity: high)

major-tag-update.yaml references `actions/checkout@v7` by a mutable tag instead of a pinned SHA digest.

Locations:

- `.github/workflows/major-tag-update.yaml:11`

### unpinned-uses (severity: high)

npm-publish.yaml references multiple actions by mutable tags instead of pinned SHA digests: `actions/checkout@v7` (line 14), `actions/setup-node@v7` (line 17), `jdx/mise-action@v4` (line 22), `actions/cache@v6` (line 38).

Locations:

- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:22`
- `.github/workflows/npm-publish.yaml:38`

### unpinned-uses (severity: high)

test.yaml references multiple actions by mutable tags instead of pinned SHA digests: `actions/checkout@v7` (line 12), `jdx/mise-action@v4` (line 16), `actions/cache@v6` (line 34).

Locations:

- `.github/workflows/test.yaml:12`
- `.github/workflows/test.yaml:16`
- `.github/workflows/test.yaml:34`

### unpinned-uses (severity: high)

version-bump.yaml references multiple actions by mutable tags instead of pinned SHA digests: `actions/checkout@v7` (line 22), `jdx/mise-action@v4` (line 29), `actions/cache@v6` (line 44).

Locations:

- `.github/workflows/version-bump.yaml:22`
- `.github/workflows/version-bump.yaml:29`
- `.github/workflows/version-bump.yaml:44`

### missing-permissions (severity: medium)

build.yaml has no top-level `permissions:` key and no job-level `permissions:` key on any job. Without explicit permissions, the workflow inherits the repository default (typically `write` for all scopes on private repos, or the organization default), granting broader access than necessary.

Locations:

- `.github/workflows/build.yaml:1`

### missing-permissions (severity: medium)

test.yaml has no top-level `permissions:` key and no job-level `permissions:` key on any job. Without explicit permissions, the workflow inherits the repository default, granting broader access than necessary.

Locations:

- `.github/workflows/test.yaml:1`

### missing-permissions (severity: medium)

major-tag-update.yaml has no top-level `permissions:` key and no job-level `permissions:` key on any job. This workflow pushes tags and needs `contents: write`, but without an explicit permissions block all other scopes are also left at their defaults.

Locations:

- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions

**Notes:**

Fixed all 12 findings across 7 files:

**script-injection**:
- major-tag-update.yaml: Moved `${{ github.event.release.tag_name }}` to env var `TAG_NAME`, referenced as `${TAG_NAME}` in shell
- version-bump.yaml: Moved `${{ inputs.release_type }}` to env var `RELEASE_TYPE`; replaced all `${{ env.new_version }}` interpolations with `${new_version}` (already available as shell env var via GITHUB_ENV)

**unpinned-uses** (all pinned to full 40-char SHAs with tag comments):
- action.yml: actions/setup-node@v7 → @820762786026740c76f36085b0efc47a31fe5020
- build.yaml: checkout@v7, mise-action@v4, cache@v6
- changelog.yaml: checkout@v7, nyaomaru/changelog-bot@v0 → @4e1d2d68551a256a35554e3b42b2417e2b608f17
- major-tag-update.yaml: checkout@v7
- npm-publish.yaml: checkout@v7, setup-node@v7, mise-action@v4, cache@v6
- test.yaml: checkout@v7, mise-action@v4, cache@v6
- version-bump.yaml: checkout@v7, mise-action@v4, cache@v6

**missing-permissions**:
- build.yaml: Added `permissions: contents: read`
- test.yaml: Added `permissions: contents: read`
- major-tag-update.yaml: Added `permissions: contents: write` (required for pushing tags)

