<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.5.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.5.1** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Every `uses:` reference across all workflow files and action.yml uses a mutable version tag instead of a pinned 40-character SHA digest, making the action vulnerable to supply-chain attacks if any upstream action is compromised or its tag is moved.

Failing references:
- action.yml: `actions/setup-node@v4`
- build.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- changelog.yaml: `actions/checkout@v4`, `nyaomaru/changelog-bot@v0`
- major-tag-update.yaml: `actions/checkout@v4`
- npm-publish.yaml: `actions/checkout@v4`, `actions/setup-node@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- test.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`
- version-bump.yaml: `actions/checkout@v4`, `jdx/mise-action@v2`, `actions/cache@v4`

Locations:

- `action.yml:63`
- `.github/workflows/build.yaml:12`
- `.github/workflows/build.yaml:16`
- `.github/workflows/build.yaml:21`
- `.github/workflows/changelog.yaml:68`
- `.github/workflows/changelog.yaml:72`
- `.github/workflows/major-tag-update.yaml:10`
- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:22`
- `.github/workflows/npm-publish.yaml:28`
- `.github/workflows/test.yaml:12`
- `.github/workflows/test.yaml:16`
- `.github/workflows/test.yaml:21`
- `.github/workflows/version-bump.yaml:24`
- `.github/workflows/version-bump.yaml:30`
- `.github/workflows/version-bump.yaml:35`

### missing-permissions (severity: medium)

Three workflow files have no top-level `permissions:` block and no job-level `permissions:` block on any of their jobs. Without explicit permissions, the GITHUB_TOKEN is granted default (potentially broad) permissions, violating the principle of least privilege.

- build.yaml: no permissions block at any level
- test.yaml: no permissions block at any level
- major-tag-update.yaml: no permissions block at any level

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

### script-injection (severity: high)

Multiple `run:` blocks directly interpolate `${{ }}` expressions into shell commands (rule a), allowing an attacker to inject arbitrary shell commands.

1. `.github/workflows/major-tag-update.yaml` — `${{ github.event.release.tag_name }}` is interpolated directly into a `git tag` shell command: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"`

2. `.github/workflows/version-bump.yaml` — `${{ inputs.release_type }}` is interpolated directly into a `pnpm version` shell command: `pnpm version ${{ inputs.release_type }} --no-git-tag-version`. Even though the input is a constrained `choice` type, direct expression interpolation in a `run:` block is a script-injection finding.

3. `.github/workflows/version-bump.yaml` — `${{ env.new_version }}` is interpolated directly into multiple shell commands:
   - `git checkout -b "release/${{ env.new_version }}"`
   - `git commit -m "chore(release): bump version to ${{ env.new_version }}"`
   - `git push -u origin "HEAD:release/${{ env.new_version }}"`
   - `gh pr create --head "release/${{ env.new_version }}" --title "Release: ${{ env.new_version }}" --body "Auto-generated release PR for version ${{ env.new_version }}"`

Locations:

- `.github/workflows/major-tag-update.yaml:22`
- `.github/workflows/version-bump.yaml:49`
- `.github/workflows/version-bump.yaml:53`
- `.github/workflows/version-bump.yaml:65`
- `.github/workflows/version-bump.yaml:68`
- `.github/workflows/version-bump.yaml:72`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions, script-injection

**Notes:**

1. Pinned all uses: references to full 40-char SHAs with tag comments: actions/checkout@v4→34e114876b0b11c390a56381ad16ebd13914f8d5, actions/setup-node@v4→49933ea5288caeca8642d1e84afbd3f7d6820020, jdx/mise-action@v2→c37c93293d6b742fc901e1406b8f764f6fb19dac, actions/cache@v4→0057852bfaa89a56745cba8c7296529d2fc39830, nyaomaru/changelog-bot@v0→e34e7889a572fa36aeb2dc04f53b5c6b2b7a2cea. 2. Added permissions blocks: build.yaml and test.yaml got 'contents: read'; major-tag-update.yaml got 'contents: write' (needed to push tags). 3. Fixed script injection in major-tag-update.yaml by moving github.event.release.tag_name into an env: block (TAG_NAME); fixed version-bump.yaml by moving inputs.release_type into env: block (RELEASE_TYPE) and moving all env.new_version references into per-step env: blocks (NEW_VERSION) for the branch creation, commit, push, and PR creation steps.

