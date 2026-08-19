<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.2

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.2** was hardened automatically. 12 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

action.yml uses actions/setup-node@v4 — a mutable tag ref instead of a pinned 40-character commit SHA. This is vulnerable to supply-chain attacks if the tag is moved.

Locations:

- `action.yml:76`

### unpinned-uses (severity: high)

build.yaml uses multiple unpinned tag refs: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4. These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/build.yaml:12`
- `.github/workflows/build.yaml:16`
- `.github/workflows/build.yaml:21`

### unpinned-uses (severity: high)

changelog.yaml uses unpinned tag refs: actions/checkout@v4 and nyaomaru/changelog-bot@v0. These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/changelog.yaml:74`
- `.github/workflows/changelog.yaml:77`

### unpinned-uses (severity: high)

major-tag-update.yaml uses unpinned tag ref: actions/checkout@v4. This should be pinned to a full 40-character commit SHA.

Locations:

- `.github/workflows/major-tag-update.yaml:10`

### unpinned-uses (severity: high)

npm-publish.yaml uses multiple unpinned tag refs: actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4. These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:22`
- `.github/workflows/npm-publish.yaml:30`

### unpinned-uses (severity: high)

test.yaml uses multiple unpinned tag refs: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4. These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/test.yaml:12`
- `.github/workflows/test.yaml:16`
- `.github/workflows/test.yaml:21`

### unpinned-uses (severity: high)

version-bump.yaml uses multiple unpinned tag refs: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4. These should be pinned to full 40-character commit SHAs.

Locations:

- `.github/workflows/version-bump.yaml:20`
- `.github/workflows/version-bump.yaml:26`
- `.github/workflows/version-bump.yaml:32`

### script-injection (severity: high)

Sub-rule (a): major-tag-update.yaml interpolates ${{ github.event.release.tag_name }} directly inside a run: shell command string: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"`  — this allows arbitrary shell content to be injected via the release tag name.

Locations:

- `.github/workflows/major-tag-update.yaml:19`

### script-injection (severity: high)

Sub-rule (a): version-bump.yaml interpolates ${{ inputs.release_type }} directly inside a run: shell command string: `pnpm version ${{ inputs.release_type }} --no-git-tag-version`. Additionally, ${{ env.new_version }} is interpolated directly in run: blocks in multiple steps: `git checkout -b "release/${{ env.new_version }}"`, `git commit -m "chore(release): bump version to ${{ env.new_version }}"`, `git push -u origin "HEAD:release/${{ env.new_version }}"`, and in the gh pr create command. All ${{ ... }} expressions in run: blocks are script-injection risks regardless of context.

Locations:

- `.github/workflows/version-bump.yaml:47`
- `.github/workflows/version-bump.yaml:52`
- `.github/workflows/version-bump.yaml:63`
- `.github/workflows/version-bump.yaml:68`
- `.github/workflows/version-bump.yaml:72`
- `.github/workflows/version-bump.yaml:76`
- `.github/workflows/version-bump.yaml:77`

### permissions (severity: medium)

missing-permissions: build.yaml has no top-level permissions: key and the lint job has no job-level permissions: key. Without explicit permissions, the workflow inherits the default (potentially write) token permissions.

Locations:

- `.github/workflows/build.yaml:1`

### permissions (severity: medium)

missing-permissions: test.yaml has no top-level permissions: key and the test job has no job-level permissions: key. Without explicit permissions, the workflow inherits the default (potentially write) token permissions.

Locations:

- `.github/workflows/test.yaml:1`

### permissions (severity: medium)

missing-permissions: major-tag-update.yaml has no top-level permissions: key and the move-v0 job has no job-level permissions: key. Without explicit permissions, the workflow inherits the default (potentially write) token permissions.

Locations:

- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, permissions

**Notes:**

Fixed all findings across 7 files:

1. action.yml: Pinned actions/setup-node@v4 → @49933ea5288caeca8642d1e84afbd3f7d6820020

2. build.yaml: Pinned actions/checkout@v4 → @11d5960a326750d5838078e36cf38b85af677262, jdx/mise-action@v2 → @c37c93293d6b742fc901e1406b8f764f6fb19dac, actions/cache@v4 → @0057852bfaa89a56745cba8c7296529d2fc39830. Added top-level permissions: contents: read.

3. changelog.yaml: Pinned actions/checkout@v4 → @11d5960a326750d5838078e36cf38b85af677262, nyaomaru/changelog-bot@v0 → @e34e7889a572fa36aeb2dc04f53b5c6b2b7a2cea.

4. major-tag-update.yaml: Pinned actions/checkout@v4 → @11d5960a326750d5838078e36cf38b85af677262. Added permissions: contents: write. Fixed script injection: moved ${{ github.event.release.tag_name }} into env: TAG_NAME and used ${TAG_NAME} in the run block.

5. npm-publish.yaml: Pinned all four actions to full SHAs.

6. test.yaml: Pinned all three actions to full SHAs. Added top-level permissions: contents: read.

7. version-bump.yaml: Pinned all three actions to full SHAs. Fixed all script injection issues: ${{ inputs.release_type }} moved to env: RELEASE_TYPE; all ${{ env.new_version }} references moved to per-step env: NEW_VERSION blocks, with shell scripts using ${NEW_VERSION} instead.

### Iteration 2

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `nyaomaru/changelog-bot@v0` to full commit SHA `e34e7889a572fa36aeb2dc04f53b5c6b2b7a2cea` in `.github/workflows/changelog.yaml` line 75. The mutable `v0` tag is preserved as a comment for readability.

