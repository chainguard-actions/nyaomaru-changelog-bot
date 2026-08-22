<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.11

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.11** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Direct ${{ }} expression interpolation inside run: shell blocks. Sub-rule (a): GitHub Actions expressions are expanded by the template engine before the shell sees them, allowing injection of shell metacharacters.

- major-tag-update.yaml line 25: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` — github context value interpolated directly into a shell string.
- version-bump.yaml line 50: `pnpm version ${{ inputs.release_type }} --no-git-tag-version` — inputs context value interpolated directly into a shell command.
- version-bump.yaml line 55: `git checkout -b "release/${{ env.new_version }}"` — env context value interpolated directly into a shell command.
- version-bump.yaml line 65: `git commit -m "chore(release): bump version to ${{ env.new_version }}"` — env context value interpolated directly into a shell command.
- version-bump.yaml line 68: `git push -u origin "HEAD:release/${{ env.new_version }}"` — env context value interpolated directly into a shell command.
- version-bump.yaml lines 72-76: multiple `${{ env.new_version }}` interpolations in the gh pr create run block.

Locations:

- `.github/workflows/major-tag-update.yaml:25`
- `.github/workflows/version-bump.yaml:50`
- `.github/workflows/version-bump.yaml:55`
- `.github/workflows/version-bump.yaml:65`
- `.github/workflows/version-bump.yaml:68`
- `.github/workflows/version-bump.yaml:72`

### unpinned-uses (severity: high)

Multiple uses: references are pinned to mutable tags or version strings instead of immutable 40-character commit SHAs. A tag can be force-pushed to point to a different (potentially malicious) commit at any time, enabling supply-chain attacks.

Failing references:
- action.yml: actions/setup-node@v4
- .github/workflows/build.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4
- .github/workflows/changelog.yaml: actions/checkout@v4, nyaomaru/changelog-bot@v0
- .github/workflows/major-tag-update.yaml: actions/checkout@v4
- .github/workflows/npm-publish.yaml: actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4
- .github/workflows/test.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4
- .github/workflows/version-bump.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4

Locations:

- `action.yml:68`
- `.github/workflows/build.yaml:11`
- `.github/workflows/build.yaml:14`
- `.github/workflows/build.yaml:19`
- `.github/workflows/changelog.yaml:75`
- `.github/workflows/changelog.yaml:79`
- `.github/workflows/major-tag-update.yaml:10`
- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:17`
- `.github/workflows/npm-publish.yaml:22`
- `.github/workflows/npm-publish.yaml:27`
- `.github/workflows/test.yaml:11`
- `.github/workflows/test.yaml:14`
- `.github/workflows/test.yaml:19`
- `.github/workflows/version-bump.yaml:23`
- `.github/workflows/version-bump.yaml:29`
- `.github/workflows/version-bump.yaml:34`

### missing-permissions (severity: medium)

The following workflow files have no top-level permissions: key and no job-level permissions: key on any of their jobs. Without explicit permissions, workflows inherit the repository's default token permissions, which may be overly broad (write-all by default on many repositories).

- build.yaml: no permissions block at top level or job level
- test.yaml: no permissions block at top level or job level
- major-tag-update.yaml: no permissions block at top level or job level (this workflow pushes tags, so it needs contents: write, but the permission is not explicitly declared)

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions

**Notes:**

Fixed all three findings: (1) script-injection: moved all ${{ }} expressions from run: shell blocks into step env: blocks across major-tag-update.yaml (TAG_NAME) and version-bump.yaml (RELEASE_TYPE, NEW_VERSION); (2) unpinned-uses: pinned all action references to full 40-char SHAs (actions/checkout@11d5960a3, actions/setup-node@49933ea52, jdx/mise-action@c37c93293, actions/cache@0057852bf, nyaomaru/changelog-bot@8d8e260e7) across all 6 workflow files and action.yml; (3) missing-permissions: added permissions: contents: read to build.yaml and test.yaml (PR workflows need only read), and permissions: contents: write to major-tag-update.yaml (needs to push tags).

