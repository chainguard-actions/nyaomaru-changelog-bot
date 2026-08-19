<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.4.2

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.4.2** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files and action.yml reference Actions using mutable tags instead of pinned 40-character SHA digests, making them vulnerable to supply-chain attacks if the tag is moved.

Failing references:
- action.yml: `actions/setup-node@v4`
- .github/workflows/build.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- .github/workflows/changelog.yaml: `actions/checkout@v4`, `nyaomaru/changelog-bot@v0`
- .github/workflows/major-tag-update.yaml: `actions/checkout@v4`
- .github/workflows/npm-publish.yaml: `actions/checkout@v4`, `actions/setup-node@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- .github/workflows/test.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- .github/workflows/version-bump.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`

Locations:

- `action.yml:56`
- `.github/workflows/build.yaml:11`
- `.github/workflows/build.yaml:15`
- `.github/workflows/build.yaml:20`
- `.github/workflows/changelog.yaml:52`
- `.github/workflows/changelog.yaml:56`
- `.github/workflows/major-tag-update.yaml:11`
- `.github/workflows/npm-publish.yaml:13`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:23`
- `.github/workflows/npm-publish.yaml:29`
- `.github/workflows/test.yaml:11`
- `.github/workflows/test.yaml:15`
- `.github/workflows/test.yaml:20`
- `.github/workflows/version-bump.yaml:23`
- `.github/workflows/version-bump.yaml:30`
- `.github/workflows/version-bump.yaml:37`

### script-injection (severity: high)

Sub-rule (a): GitHub Actions expressions (`${{ ... }}`) are interpolated directly inside `run:` shell command strings, allowing an attacker to inject arbitrary shell commands.

1. `.github/workflows/major-tag-update.yaml` line 25: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` — `github.event.release.tag_name` is interpolated directly into the shell command without going through an `env:` variable.

2. `.github/workflows/version-bump.yaml` line 51: `pnpm version ${{ inputs.release_type }} --no-git-tag-version` — `inputs.release_type` is interpolated directly into the shell command.

3. `.github/workflows/version-bump.yaml` lines 58, 68, 71, 76–79: `${{ env.new_version }}` is interpolated directly into multiple `run:` shell commands (e.g., `git checkout -b "release/${{ env.new_version }}"`, `git commit -m "chore(release): bump version to ${{ env.new_version }}"`, `git push -u origin "HEAD:release/${{ env.new_version }}"`, and `gh pr create` arguments).

Locations:

- `.github/workflows/major-tag-update.yaml:25`
- `.github/workflows/version-bump.yaml:51`
- `.github/workflows/version-bump.yaml:58`
- `.github/workflows/version-bump.yaml:68`
- `.github/workflows/version-bump.yaml:71`
- `.github/workflows/version-bump.yaml:76`
- `.github/workflows/version-bump.yaml:77`
- `.github/workflows/version-bump.yaml:78`
- `.github/workflows/version-bump.yaml:79`

### missing-permissions (severity: medium)

The workflow files `build.yaml` and `test.yaml` have no top-level `permissions:` key and no job-level `permissions:` key on any of their jobs. Without explicit permissions, the default token permissions (which may be broad depending on repository settings) are granted to the GITHUB_TOKEN, violating the principle of least privilege.

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all 17 unpinned action references by pinning to full 40-char SHAs (actions/checkout, actions/setup-node, jdx/mise-action, actions/cache, nyaomaru/changelog-bot). Fixed script injection in major-tag-update.yaml by moving github.event.release.tag_name into an env: block (TAG_NAME). Fixed script injection in version-bump.yaml by moving inputs.release_type into an env: block (RELEASE_TYPE) and replacing all ${{ env.new_version }} run: interpolations with plain shell variable ${new_version} (which is set via GITHUB_ENV). Added 'permissions: contents: read' to build.yaml and test.yaml which had no permissions block.

### Iteration 2

**Fixes applied:** missing-permissions

**Notes:**

Added a top-level `permissions:` block to `.github/workflows/major-tag-update.yaml` with `contents: write` — the minimum permission needed to force-push the v0 tag. All other permissions are implicitly denied.

