<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.13

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.13** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple `uses:` references across action.yml and all workflow files are pinned to mutable tags rather than immutable 40-character SHA digests, making them vulnerable to supply-chain attacks if the upstream tag is moved. Failing references include: action.yml: `actions/setup-node@v7`; build.yaml: `actions/checkout@v7`, `jdx/mise-action@v4`, `actions/cache@v6`; changelog.yaml: `actions/checkout@v7`, `nyaomaru/changelog-bot@v0`; major-tag-update.yaml: `actions/checkout@v7`; npm-publish.yaml: `actions/checkout@v7`, `actions/setup-node@v7`, `jdx/mise-action@v4`, `actions/cache@v6`; test.yaml: `actions/checkout@v7`, `jdx/mise-action@v4`, `actions/cache@v6`; version-bump.yaml: `actions/checkout@v7`, `jdx/mise-action@v4`, `actions/cache@v6`.

Locations:

- `action.yml:73`
- `.github/workflows/build.yaml:12`
- `.github/workflows/build.yaml:16`
- `.github/workflows/build.yaml:34`
- `.github/workflows/changelog.yaml:72`
- `.github/workflows/changelog.yaml:77`
- `.github/workflows/major-tag-update.yaml:11`
- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:22`
- `.github/workflows/npm-publish.yaml:36`
- `.github/workflows/test.yaml:12`
- `.github/workflows/test.yaml:16`
- `.github/workflows/test.yaml:34`
- `.github/workflows/version-bump.yaml:24`
- `.github/workflows/version-bump.yaml:30`
- `.github/workflows/version-bump.yaml:50`

### script-injection (severity: high)

GitHub Actions expressions are interpolated directly inside `run:` shell command strings, violating sub-rule (a). (1) major-tag-update.yaml: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` — the release tag name is injected directly into a shell command. (2) version-bump.yaml: `pnpm version ${{ inputs.release_type }} --no-git-tag-version` — a workflow_dispatch input is injected directly into a shell command. (3) version-bump.yaml: `${{ env.new_version }}` is interpolated directly in multiple run: blocks (git checkout -b, git commit -m, git push, gh pr create), allowing the env context value to be parsed by the shell before quoting can protect it.

Locations:

- `.github/workflows/major-tag-update.yaml:21`
- `.github/workflows/version-bump.yaml:60`
- `.github/workflows/version-bump.yaml:65`
- `.github/workflows/version-bump.yaml:79`
- `.github/workflows/version-bump.yaml:81`
- `.github/workflows/version-bump.yaml:86`
- `.github/workflows/version-bump.yaml:87`
- `.github/workflows/version-bump.yaml:88`
- `.github/workflows/version-bump.yaml:89`

### missing-permissions (severity: medium)

The workflow files `build.yaml` and `test.yaml` have no top-level `permissions:` key and no job-level `permissions:` key on any of their jobs. Without explicit permissions, the GITHUB_TOKEN is granted its default (potentially broad) permissions, violating the principle of least privilege.

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all three findings:

1. unpinned-uses: Pinned all action references to full 40-char SHAs with tag comments preserved:
   - actions/checkout@v7 → @3d3c42e5aac5ba805825da76410c181273ba90b1
   - actions/setup-node@v7 → @820762786026740c76f36085b0efc47a31fe5020
   - jdx/mise-action@v4 → @c2a87611a18de5b3828c5652fe268e992400cb5c
   - actions/cache@v6 → @55cc8345863c7cc4c66a329aec7e433d2d1c52a9
   - nyaomaru/changelog-bot@v0 → @1312c1cebb3ea9e7336f851dcd40a08b09950db4
   Applied in: action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, version-bump.yaml

2. script-injection: Moved all ${{ }} expressions out of run: blocks into env: blocks:
   - major-tag-update.yaml: github.event.release.tag_name → TAG_NAME env var
   - version-bump.yaml: inputs.release_type → RELEASE_TYPE env var; env.new_version → NEW_VERSION env var in each affected step (Create new branch, Commit & Push, Create Pull Request)

3. missing-permissions: Added 'permissions: contents: read' to build.yaml and test.yaml which had no permissions block.

### Iteration 2

**Fixes applied:** missing-permissions

**Notes:**

Added `permissions: contents: write` at the top level of `.github/workflows/major-tag-update.yaml`. This is the minimal permission required for the workflow's only operation: force-pushing the `v0` tag to the repository. All other default token permissions are now explicitly excluded.

