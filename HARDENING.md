<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.1** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple `uses:` references are pinned to mutable tags instead of immutable 40-character commit SHAs, making the action vulnerable to supply-chain attacks if the tag is moved.

action.yml:
- `actions/setup-node@v4`

.github/workflows/build.yaml:
- `actions/checkout@v4`
- `jdx/mise-action@v2`
- `actions/cache@v4`

.github/workflows/changelog.yaml:
- `actions/checkout@v4`
- `nyaomaru/changelog-bot@v0`

.github/workflows/major-tag-update.yaml:
- `actions/checkout@v4`

.github/workflows/npm-publish.yaml:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `jdx/mise-action@v2`
- `actions/cache@v4`

.github/workflows/test.yaml:
- `actions/checkout@v4`
- `jdx/mise-action@v2`
- `actions/cache@v4`

.github/workflows/version-bump.yaml:
- `actions/checkout@v4`
- `jdx/mise-action@v2`
- `actions/cache@v4`

Locations:

- `action.yml:76`
- `.github/workflows/build.yaml:11`
- `.github/workflows/build.yaml:14`
- `.github/workflows/build.yaml:20`
- `.github/workflows/changelog.yaml:73`
- `.github/workflows/changelog.yaml:76`
- `.github/workflows/major-tag-update.yaml:11`
- `.github/workflows/npm-publish.yaml:13`
- `.github/workflows/npm-publish.yaml:16`
- `.github/workflows/npm-publish.yaml:21`
- `.github/workflows/npm-publish.yaml:26`
- `.github/workflows/test.yaml:11`
- `.github/workflows/test.yaml:14`
- `.github/workflows/test.yaml:20`
- `.github/workflows/version-bump.yaml:23`
- `.github/workflows/version-bump.yaml:29`
- `.github/workflows/version-bump.yaml:36`

### script-injection (severity: high)

GitHub Actions expressions (`${{ ... }}`) are interpolated directly inside `run:` shell command strings, violating sub-rule (a). This allows an attacker to inject arbitrary shell commands.

**major-tag-update.yaml** (line 25): `${{ github.event.release.tag_name }}` is interpolated directly into a `git tag` message inside a `run:` block. A crafted release tag name could inject shell metacharacters.
```
git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"
```

**version-bump.yaml** (line 44): `${{ inputs.release_type }}` is interpolated directly into a `pnpm version` command. Even though it is a `choice` input, any expression in a `run:` block is a script-injection risk.
```
pnpm version ${{ inputs.release_type }} --no-git-tag-version
```

**version-bump.yaml** (lines 48, 57, 61, 65–69): `${{ env.new_version }}` is interpolated directly into multiple `run:` blocks (git checkout, git commit, git push, gh pr create). The `env` context flows through YAML template substitution before the shell sees it.
```
git checkout -b "release/${{ env.new_version }}"
git commit -m "chore(release): bump version to ${{ env.new_version }}"
git push -u origin "HEAD:release/${{ env.new_version }}"
gh pr create --head "release/${{ env.new_version }}" --title "Release: ${{ env.new_version }}" ...
```

Locations:

- `.github/workflows/major-tag-update.yaml:25`
- `.github/workflows/version-bump.yaml:44`
- `.github/workflows/version-bump.yaml:48`
- `.github/workflows/version-bump.yaml:57`
- `.github/workflows/version-bump.yaml:61`
- `.github/workflows/version-bump.yaml:65`

### missing-permissions (severity: medium)

The following workflow files have no top-level `permissions:` key and no job-level `permissions:` key on any of their jobs. Without explicit permissions, the workflow inherits the repository's default token permissions, which may be overly broad (write-all by default for many repositories).

- `.github/workflows/build.yaml`: triggered on `pull_request`, no permissions declared
- `.github/workflows/test.yaml`: triggered on `pull_request`, no permissions declared
- `.github/workflows/major-tag-update.yaml`: triggered on `release`, no permissions declared (this workflow pushes tags and needs `contents: write`, but all other permissions should be explicitly denied)

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all three finding categories. (1) unpinned-uses: Pinned all uses: references to full 40-char commit SHAs in action.yml, build.yaml, changelog.yaml, major-tag-update.yaml, npm-publish.yaml, test.yaml, and version-bump.yaml using resolved SHAs for actions/checkout, actions/setup-node, actions/cache, jdx/mise-action, and nyaomaru/changelog-bot. (2) script-injection: Moved all ${{ }} expressions out of run: blocks into env: blocks. In major-tag-update.yaml: github.event.release.tag_name moved to TAG_NAME env var. In version-bump.yaml: inputs.release_type moved to RELEASE_TYPE env var; env.new_version moved to NEW_VERSION env var in each affected step (Create new branch, Commit & Push, Create Pull Request). (3) missing-permissions: Added permissions: contents: read to build.yaml and test.yaml (PR workflows needing only read access), and permissions: contents: write to major-tag-update.yaml (needs write to push tags, all other permissions implicitly denied).

