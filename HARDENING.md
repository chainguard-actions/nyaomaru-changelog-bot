<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot--/v0.6.4

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **nyaomaru--changelog-bot--/v0.6.4** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple files reference GitHub Actions using mutable tag/branch refs instead of pinned full-length SHA commits, making them vulnerable to supply-chain attacks. Failing references: action.yml: actions/setup-node@v4; build.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4; changelog.yaml: actions/checkout@v4, nyaomaru/changelog-bot@v0; major-tag-update.yaml: actions/checkout@v4; npm-publish.yaml: actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4; test.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4; version-bump.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4.

Locations:

- `action.yml:63`
- `.github/workflows/build.yaml:12`
- `.github/workflows/build.yaml:16`
- `.github/workflows/build.yaml:21`
- `.github/workflows/changelog.yaml:75`
- `.github/workflows/changelog.yaml:79`
- `.github/workflows/major-tag-update.yaml:11`
- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:22`
- `.github/workflows/npm-publish.yaml:27`
- `.github/workflows/test.yaml:12`
- `.github/workflows/test.yaml:16`
- `.github/workflows/test.yaml:21`
- `.github/workflows/version-bump.yaml:22`
- `.github/workflows/version-bump.yaml:29`
- `.github/workflows/version-bump.yaml:34`

### script-injection (severity: high)

Rule (a): ${{ }} expressions are directly interpolated inside run: shell command strings, allowing template substitution before the shell parses the command. In major-tag-update.yaml line 24: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` — github context injected directly into a shell string. In version-bump.yaml line 48: `pnpm version ${{ inputs.release_type }} --no-git-tag-version` — inputs context injected directly. In version-bump.yaml lines 52, 63, 67, 71-75: `${{ env.new_version }}` injected directly into git checkout, git commit, git push, and gh pr create run: commands.

Locations:

- `.github/workflows/major-tag-update.yaml:24`
- `.github/workflows/version-bump.yaml:48`
- `.github/workflows/version-bump.yaml:52`
- `.github/workflows/version-bump.yaml:63`
- `.github/workflows/version-bump.yaml:67`
- `.github/workflows/version-bump.yaml:71`

### missing-permissions (severity: medium)

The following workflow files have no top-level permissions: key and no job-level permissions: key on any job, meaning they run with the default (potentially broad) token permissions: build.yaml, test.yaml, and major-tag-update.yaml.

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all findings across action.yml and .github/workflows/*.yaml files:

1. unpinned-uses: Pinned all action refs to full commit SHAs:
   - actions/checkout@v4 → @34e114876b0b11c390a56381ad16ebd13914f8d5
   - actions/setup-node@v4 → @49933ea5288caeca8642d1e84afbd3f7d6820020
   - actions/cache@v4 → @0057852bfaa89a56745cba8c7296529d2fc39830
   - jdx/mise-action@v2 → @c37c93293d6b742fc901e1406b8f764f6fb19dac
   - nyaomaru/changelog-bot@v0 → @99b9bdd9f68e10a1c3def5f7dc05d2c114a5d682

2. script-injection: Moved all ${{ }} expressions out of run: blocks into env: blocks:
   - major-tag-update.yaml: moved github.event.release.tag_name into TAG_NAME env var
   - version-bump.yaml: moved inputs.release_type into RELEASE_TYPE env var; replaced all ${{ env.new_version }} references in run: blocks with plain shell ${new_version} (set via $GITHUB_ENV)

3. missing-permissions: Added top-level permissions blocks:
   - build.yaml: permissions: contents: read
   - test.yaml: permissions: contents: read
   - major-tag-update.yaml: permissions: contents: write (needed for git push --force)

