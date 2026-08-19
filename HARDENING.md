<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.4.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.4.1** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple `uses:` references are pinned to mutable tags (e.g. @v4, @v2, @v0) rather than immutable 40-character commit SHAs. This exposes the action to supply-chain attacks if the upstream tag is moved.

action.yml: actions/setup-node@v4
.github/workflows/build.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4
.github/workflows/changelog.yaml: actions/checkout@v4, nyaomaru/changelog-bot@v0
.github/workflows/major-tag-update.yaml: actions/checkout@v4
.github/workflows/npm-publish.yaml: actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4
.github/workflows/test.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4
.github/workflows/version-bump.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4

Locations:

- `action.yml:56`
- `.github/workflows/build.yaml:11`
- `.github/workflows/build.yaml:15`
- `.github/workflows/build.yaml:21`
- `.github/workflows/changelog.yaml:53`
- `.github/workflows/changelog.yaml:57`
- `.github/workflows/major-tag-update.yaml:11`
- `.github/workflows/npm-publish.yaml:13`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:23`
- `.github/workflows/npm-publish.yaml:31`
- `.github/workflows/test.yaml:11`
- `.github/workflows/test.yaml:15`
- `.github/workflows/test.yaml:21`
- `.github/workflows/version-bump.yaml:22`
- `.github/workflows/version-bump.yaml:28`
- `.github/workflows/version-bump.yaml:38`

### script-injection (severity: high)

Rule (a): GitHub Actions expressions (`${{ ... }}`) are interpolated directly inside `run:` shell command strings, allowing an attacker to inject arbitrary shell commands.

1. `.github/workflows/major-tag-update.yaml`: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` — the release tag name is injected directly into a shell command.

2. `.github/workflows/version-bump.yaml`: `pnpm version ${{ inputs.release_type }} --no-git-tag-version` — a workflow_dispatch input is injected directly into a shell command.

3. `.github/workflows/version-bump.yaml`: `git checkout -b "release/${{ env.new_version }}"` — env context injected into shell.

4. `.github/workflows/version-bump.yaml`: `git commit -m "chore(release): bump version to ${{ env.new_version }}"` — env context injected into shell.

5. `.github/workflows/version-bump.yaml`: `git push -u origin "HEAD:release/${{ env.new_version }}"` — env context injected into shell.

6. `.github/workflows/version-bump.yaml`: `gh pr create --head "release/${{ env.new_version }}" --title "Release: ${{ env.new_version }}" --body "..."` — env context injected into shell.

All of these should be moved to `env:` variables and referenced as quoted shell variables (e.g. `"$ENV_VAR"`).

Locations:

- `.github/workflows/major-tag-update.yaml:20`
- `.github/workflows/version-bump.yaml:47`
- `.github/workflows/version-bump.yaml:51`
- `.github/workflows/version-bump.yaml:58`
- `.github/workflows/version-bump.yaml:64`
- `.github/workflows/version-bump.yaml:70`

### missing-permissions (severity: medium)

The following workflow files have no top-level `permissions:` key and no job-level `permissions:` key on any of their jobs. Without explicit permissions, GitHub Actions grants the default token permissions (which may be read/write depending on repository settings), violating the principle of least privilege.

- `.github/workflows/build.yaml`: no permissions declared
- `.github/workflows/test.yaml`: no permissions declared
- `.github/workflows/major-tag-update.yaml`: no permissions declared (this workflow pushes tags and needs write access, making the missing declaration especially risky)

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all three findings:

1. unpinned-uses: Pinned all action references to full 40-char SHAs with tag comments in action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, and version-bump.yaml. SHAs resolved via lookup_action_sha for: actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4, nyaomaru/changelog-bot@v0.

2. script-injection: Moved all ${{ }} expressions out of run: shell strings into env: blocks. In major-tag-update.yaml, github.event.release.tag_name is now in TAG_NAME env var. In version-bump.yaml, inputs.release_type is in RELEASE_TYPE env var, and all env.new_version references are in NEW_VERSION env vars per step.

3. missing-permissions: Added top-level permissions blocks to build.yaml (contents: read), test.yaml (contents: read), and major-tag-update.yaml (contents: write, needed for git push --force on tags).

