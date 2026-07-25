<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.7

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.7** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): Direct ${{ }} expression interpolation inside run: shell commands. In major-tag-update.yaml, `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` interpolates a GitHub context value directly into the shell command — an attacker who controls the release tag name could inject shell metacharacters. In version-bump.yaml, multiple run: blocks interpolate expressions directly: `pnpm version ${{ inputs.release_type }} --no-git-tag-version` (workflow_dispatch input), `git checkout -b "release/${{ env.new_version }}"`, `git commit -m "chore(release): bump version to ${{ env.new_version }}"`, `git push -u origin "HEAD:release/${{ env.new_version }}"`, and `gh pr create --head "release/${{ env.new_version }}" --title "Release: ${{ env.new_version }}" --body "..."`. All of these should be moved to env: variables and referenced as quoted shell variables (e.g., "$NEW_VERSION").

Locations:

- `.github/workflows/major-tag-update.yaml:24`
- `.github/workflows/version-bump.yaml:44`
- `.github/workflows/version-bump.yaml:49`
- `.github/workflows/version-bump.yaml:57`
- `.github/workflows/version-bump.yaml:62`
- `.github/workflows/version-bump.yaml:67`

### unpinned-uses (severity: high)

All `uses:` references across workflow files and action.yml use mutable tag-based refs instead of pinned 40-character SHA commit hashes, making the action vulnerable to supply-chain attacks if any referenced action is compromised or its tag is moved. Failing references include: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4, actions/setup-node@v4, nyaomaru/changelog-bot@v0 (in changelog.yaml), and actions/setup-node@v4 (in action.yml).

Locations:

- `action.yml:76`
- `.github/workflows/build.yaml:10`
- `.github/workflows/build.yaml:14`
- `.github/workflows/build.yaml:19`
- `.github/workflows/changelog.yaml:79`
- `.github/workflows/changelog.yaml:83`
- `.github/workflows/major-tag-update.yaml:10`
- `.github/workflows/npm-publish.yaml:16`
- `.github/workflows/npm-publish.yaml:20`
- `.github/workflows/npm-publish.yaml:27`
- `.github/workflows/npm-publish.yaml:35`
- `.github/workflows/test.yaml:10`
- `.github/workflows/test.yaml:14`
- `.github/workflows/test.yaml:19`
- `.github/workflows/version-bump.yaml:20`
- `.github/workflows/version-bump.yaml:26`
- `.github/workflows/version-bump.yaml:33`

### missing-permissions (severity: medium)

These workflow files have no top-level `permissions:` key and no job-level `permissions:` key on any of their jobs, meaning the GITHUB_TOKEN is granted its default (potentially broad) permissions. Each file should declare minimal explicit permissions. Affected files: build.yaml, major-tag-update.yaml, test.yaml.

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`
- `.github/workflows/test.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions

**Notes:**

Fixed all three findings: (1) Script injection in major-tag-update.yaml (moved github.event.release.tag_name to TAG_NAME env var) and version-bump.yaml (moved inputs.release_type to RELEASE_TYPE env var, and all env.new_version references to NEW_VERSION env vars per step). (2) Pinned all unpinned uses: references to full 40-char SHAs across action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, and version-bump.yaml. (3) Added minimal permissions blocks to build.yaml (contents: read), major-tag-update.yaml (contents: write), and test.yaml (contents: read).

