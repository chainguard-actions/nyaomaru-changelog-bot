<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.8

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.8** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple `uses:` references across action.yml and workflow files are pinned to mutable tags instead of full 40-character SHA digests, making them vulnerable to supply-chain attacks if the tag is moved.

action.yml:
- uses: actions/setup-node@v4

.github/workflows/build.yaml:
- uses: actions/checkout@v4
- uses: jdx/mise-action@v2
- uses: actions/cache@v4

.github/workflows/changelog.yaml:
- uses: actions/checkout@v4
- uses: nyaomaru/changelog-bot@v0

.github/workflows/major-tag-update.yaml:
- uses: actions/checkout@v4

.github/workflows/npm-publish.yaml:
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- uses: jdx/mise-action@v2
- uses: actions/cache@v4

.github/workflows/test.yaml:
- uses: actions/checkout@v4
- uses: jdx/mise-action@v2
- uses: actions/cache@v4

.github/workflows/version-bump.yaml:
- uses: actions/checkout@v4
- uses: jdx/mise-action@v2
- uses: actions/cache@v4

Locations:

- `action.yml:88`
- `.github/workflows/build.yaml:11`
- `.github/workflows/changelog.yaml:73`
- `.github/workflows/major-tag-update.yaml:10`
- `.github/workflows/npm-publish.yaml:13`
- `.github/workflows/test.yaml:11`
- `.github/workflows/version-bump.yaml:22`

### script-injection (severity: high)

GitHub Actions expressions are interpolated directly inside `run:` shell command strings, enabling script injection.

(a) major-tag-update.yaml line 25: `${{ github.event.release.tag_name }}` is embedded directly in a git tag message string inside a `run:` block. An attacker who controls the release tag name could inject shell metacharacters.

(a) version-bump.yaml line 50: `${{ inputs.release_type }}` is passed directly as an argument to `pnpm version` in a `run:` block. Although this is a `workflow_dispatch` choice input (restricted to patch/minor/major), it still flows through YAML template substitution before the shell sees it.

(a) version-bump.yaml lines 55, 65, 68, 72–76: `${{ env.new_version }}` is interpolated directly into multiple `run:` shell commands (branch checkout, git commit message, git push ref, and gh pr create arguments). The `env.*` context is a workflow-controllable value and must not appear directly in `run:` blocks.

Locations:

- `.github/workflows/major-tag-update.yaml:25`
- `.github/workflows/version-bump.yaml:50`
- `.github/workflows/version-bump.yaml:55`
- `.github/workflows/version-bump.yaml:65`
- `.github/workflows/version-bump.yaml:68`
- `.github/workflows/version-bump.yaml:72`

### missing-permissions (severity: medium)

The following workflow files have no top-level `permissions:` block and no job-level `permissions:` block on any of their jobs. Without explicit permissions, GitHub Actions grants the default token permissions (which may be read/write depending on repository settings), violating the principle of least privilege.

- build.yaml: no permissions declared at top-level or job level
- test.yaml: no permissions declared at top-level or job level
- major-tag-update.yaml: no permissions declared at top-level or job level (this workflow pushes tags and should declare `contents: write` explicitly)

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all three findings:

1. unpinned-uses: Pinned all uses: references to full 40-char SHAs in action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, and version-bump.yaml. Actions pinned: actions/checkout@11d5960a, actions/setup-node@49933ea5, actions/cache@0057852b, jdx/mise-action@c37c9329, nyaomaru/changelog-bot@c0ad0317.

2. script-injection: In major-tag-update.yaml, moved ${{ github.event.release.tag_name }} into a TAG_NAME env var. In version-bump.yaml, moved ${{ inputs.release_type }} into a RELEASE_TYPE env var, and replaced all ${{ env.new_version }} interpolations in run: blocks with plain shell variable ${new_version} (the value is set via $GITHUB_ENV in the version step and available as a shell env var in subsequent steps).

3. missing-permissions: Added top-level permissions blocks to build.yaml (contents: read), test.yaml (contents: read), and major-tag-update.yaml (contents: write, required for pushing tags).

