<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.5.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.5.0** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: shell command strings. In major-tag-update.yaml, `${{ github.event.release.tag_name }}` is interpolated directly into a git tag message command. In version-bump.yaml, `${{ inputs.release_type }}` is interpolated directly into a pnpm command, and `${{ env.new_version }}` is interpolated directly into multiple shell commands (git checkout -b, git commit -m, git push, gh pr create). Any of these values flow through YAML template substitution before the shell sees them, enabling shell metacharacter injection.

Locations:

- `.github/workflows/major-tag-update.yaml:23`
- `.github/workflows/version-bump.yaml:40`
- `.github/workflows/version-bump.yaml:44`
- `.github/workflows/version-bump.yaml:55`
- `.github/workflows/version-bump.yaml:61`
- `.github/workflows/version-bump.yaml:67`
- `.github/workflows/version-bump.yaml:68`

### unpinned-uses (severity: high)

Multiple uses: references across workflow files and action.yml use mutable tag refs instead of pinned 40-character SHA digests, making the action vulnerable to supply-chain attacks if the referenced tag is moved or compromised. Failing references include: action.yml: actions/setup-node@v4; build.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4; changelog.yaml: actions/checkout@v4, nyaomaru/changelog-bot@v0; major-tag-update.yaml: actions/checkout@v4; npm-publish.yaml: actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4; test.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4; version-bump.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4.

Locations:

- `action.yml:68`
- `.github/workflows/build.yaml:11`
- `.github/workflows/build.yaml:15`
- `.github/workflows/build.yaml:20`
- `.github/workflows/changelog.yaml:72`
- `.github/workflows/changelog.yaml:76`
- `.github/workflows/major-tag-update.yaml:9`
- `.github/workflows/npm-publish.yaml:13`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:23`
- `.github/workflows/npm-publish.yaml:29`
- `.github/workflows/test.yaml:11`
- `.github/workflows/test.yaml:15`
- `.github/workflows/test.yaml:20`
- `.github/workflows/version-bump.yaml:22`
- `.github/workflows/version-bump.yaml:26`
- `.github/workflows/version-bump.yaml:31`

### missing-permissions (severity: medium)

Three workflow files have no top-level permissions: block and no job-level permissions: block on any of their jobs. Without explicit permissions, workflows inherit the repository's default token permissions (which may be write-all), granting unnecessarily broad access. Affected files: build.yaml, test.yaml, and major-tag-update.yaml.

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions

**Notes:**

Fixed all three finding categories:

1. script-injection: In major-tag-update.yaml, moved `github.event.release.tag_name` into an env block (TAG_NAME). In version-bump.yaml, moved `inputs.release_type` into an env block (RELEASE_TYPE) and moved all `env.new_version` references into per-step env blocks (NEW_VERSION). No ${{ }} expressions remain directly in run: shell strings.

2. unpinned-uses: Pinned all action references to full 40-char SHAs with tag comments: actions/checkout@v4→11d5960a..., actions/setup-node@v4→49933ea5..., jdx/mise-action@v2→c37c9329..., actions/cache@v4→0057852b..., nyaomaru/changelog-bot@v0→e34e7889.... Applied across action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, version-bump.yaml.

3. missing-permissions: Added `permissions: contents: read` to build.yaml and test.yaml (read-only for PR checks), and `permissions: contents: write` to major-tag-update.yaml (needed to push the v0 tag).

