<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.0** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple `uses:` references across action.yml and workflow files are pinned to mutable tags instead of full 40-character SHA commit hashes, making them vulnerable to supply-chain attacks if the tag is moved.

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

- `action.yml:79`
- `.github/workflows/build.yaml:11`
- `.github/workflows/build.yaml:14`
- `.github/workflows/build.yaml:19`
- `.github/workflows/changelog.yaml:72`
- `.github/workflows/changelog.yaml:78`
- `.github/workflows/major-tag-update.yaml:10`
- `.github/workflows/npm-publish.yaml:13`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:23`
- `.github/workflows/npm-publish.yaml:31`
- `.github/workflows/test.yaml:11`
- `.github/workflows/test.yaml:14`
- `.github/workflows/test.yaml:19`
- `.github/workflows/version-bump.yaml:24`
- `.github/workflows/version-bump.yaml:30`
- `.github/workflows/version-bump.yaml:40`

### script-injection (severity: high)

GitHub Actions expressions are interpolated directly inside `run:` shell command strings, violating sub-rule (a). This allows YAML template substitution to inject arbitrary shell metacharacters before the shell parses the command.

1. `.github/workflows/major-tag-update.yaml` — `${{ github.event.release.tag_name }}` is embedded directly in a `git tag` command:
   `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"`

2. `.github/workflows/version-bump.yaml` — `${{ inputs.release_type }}` is embedded directly in a `pnpm version` command:
   `pnpm version ${{ inputs.release_type }} --no-git-tag-version`

3. `.github/workflows/version-bump.yaml` — `${{ env.new_version }}` is embedded directly in multiple `run:` blocks:
   `git checkout -b "release/${{ env.new_version }}"`
   `git commit -m "chore(release): bump version to ${{ env.new_version }}"`
   `git push -u origin "HEAD:release/${{ env.new_version }}"`
   `--head "release/${{ env.new_version }}"`
   `--title "Release: ${{ env.new_version }}"`
   `--body "Auto-generated release PR for version ${{ env.new_version }}"`

Locations:

- `.github/workflows/major-tag-update.yaml:22`
- `.github/workflows/version-bump.yaml:47`
- `.github/workflows/version-bump.yaml:52`
- `.github/workflows/version-bump.yaml:63`
- `.github/workflows/version-bump.yaml:68`
- `.github/workflows/version-bump.yaml:73`
- `.github/workflows/version-bump.yaml:77`
- `.github/workflows/version-bump.yaml:78`

### missing-permissions (severity: medium)

The following workflow files have no top-level `permissions:` key and no job-level `permissions:` key on any job. Without explicit permissions, workflows inherit the repository's default token permissions (which may be `write-all`), violating the principle of least privilege.

- `.github/workflows/build.yaml`: No permissions defined at top-level or job level.
- `.github/workflows/major-tag-update.yaml`: No permissions defined at top-level or job level.
- `.github/workflows/test.yaml`: No permissions defined at top-level or job level.

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`
- `.github/workflows/test.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

1. unpinned-uses: Pinned all `uses:` references to full SHA hashes: actions/checkout@v4→34e114876b0b11c390a56381ad16ebd13914f8d5, actions/setup-node@v4→49933ea5288caeca8642d1e84afbd3f7d6820020, jdx/mise-action@v2→c37c93293d6b742fc901e1406b8f764f6fb19dac, actions/cache@v4→0057852bfaa89a56745cba8c7296529d2fc39830, nyaomaru/changelog-bot@v0→e34e7889a572fa36aeb2dc04f53b5c6b2b7a2cea. Applied across action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, and version-bump.yaml.
2. script-injection: In major-tag-update.yaml, moved `github.event.release.tag_name` into an `env: TAG_NAME` block and referenced as `$TAG_NAME` in the shell. In version-bump.yaml, moved `inputs.release_type` into `env: RELEASE_TYPE` and replaced all `${{ env.new_version }}` in run blocks with plain `${new_version}` (the value is set via $GITHUB_ENV and is a regular shell env var in subsequent steps).
3. missing-permissions: Added `permissions: contents: read` to build.yaml and test.yaml (read-only workflows), and `permissions: contents: write` to major-tag-update.yaml (needs to push tags).

### Iteration 2

**Fixes applied:** unpinned-uses

**Notes:**

Pinned all three unpinned action references to full commit SHAs: (1) nyaomaru/changelog-bot@v0 → @e34e7889a572fa36aeb2dc04f53b5c6b2b7a2cea in changelog.yaml; (2) jdx/mise-action@v2 → @c37c93293d6b742fc901e1406b8f764f6fb19dac in npm-publish.yaml; (3) actions/cache@v4 → @0057852bfaa89a56745cba8c7296529d2fc39830 in npm-publish.yaml. All original tag names preserved as inline comments for readability.

