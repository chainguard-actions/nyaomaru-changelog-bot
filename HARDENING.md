<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.5

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **nyaomaru--changelog-bot/v0.6.5** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple workflow files and action.yml use mutable tag-based refs instead of pinned 40-character SHA digests, making them vulnerable to supply-chain attacks. Failing references include: action.yml: actions/setup-node@v4; build.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4; changelog.yaml: actions/checkout@v4, nyaomaru/changelog-bot@v0; major-tag-update.yaml: actions/checkout@v4; npm-publish.yaml: actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4; test.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4; version-bump.yaml: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4.

Locations:

- `action.yml:76`
- `.github/workflows/build.yaml:12`
- `.github/workflows/changelog.yaml:68`
- `.github/workflows/major-tag-update.yaml:11`
- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/test.yaml:12`
- `.github/workflows/version-bump.yaml:24`

### script-injection (severity: high)

Direct ${{ }} expression interpolation inside run: shell command strings (rule a). In major-tag-update.yaml, github.event.release.tag_name is interpolated directly: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"`  In version-bump.yaml, inputs.release_type is interpolated directly: `pnpm version ${{ inputs.release_type }} --no-git-tag-version`; and env.new_version is interpolated in multiple run: blocks: `git checkout -b "release/${{ env.new_version }}"`, `git commit -m "chore(release): bump version to ${{ env.new_version }}"`, `git push -u origin "HEAD:release/${{ env.new_version }}"`, and in the gh pr create command.

Locations:

- `.github/workflows/major-tag-update.yaml:25`
- `.github/workflows/version-bump.yaml:49`
- `.github/workflows/version-bump.yaml:54`
- `.github/workflows/version-bump.yaml:66`
- `.github/workflows/version-bump.yaml:69`
- `.github/workflows/version-bump.yaml:73`

### missing-permissions (severity: medium)

Workflow files have no top-level permissions: key and no job-level permissions: key on any job, granting the default (potentially broad) token permissions. build.yaml, test.yaml, and major-tag-update.yaml all lack any permissions declaration.

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all three findings: (1) Pinned all mutable tag-based action refs to full 40-char SHAs across action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, and version-bump.yaml using verified SHAs from lookup_action_sha. (2) Fixed script injection in major-tag-update.yaml by moving github.event.release.tag_name into an env: block (TAG_NAME), and in version-bump.yaml by moving inputs.release_type into an env: block (RELEASE_TYPE); the env.new_version references were already shell env vars set via GITHUB_ENV so they are referenced as ${new_version} without ${{ }} interpolation. (3) Added top-level permissions blocks to build.yaml (contents: read), test.yaml (contents: read), and major-tag-update.yaml (contents: write, needed for git push of tags).

