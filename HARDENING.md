<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.4

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.4** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple `uses:` references are pinned to mutable tags rather than full 40-character SHA commit hashes, making the action vulnerable to supply-chain attacks if the tag is moved. Failing references include: actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4, actions/setup-node@v4, nyaomaru/changelog-bot@v0 (in changelog.yaml), and actions/setup-node@v4 in action.yml.

Locations:

- `.github/workflows/build.yaml:12`
- `.github/workflows/build.yaml:16`
- `.github/workflows/build.yaml:21`
- `.github/workflows/changelog.yaml:76`
- `.github/workflows/changelog.yaml:80`
- `.github/workflows/major-tag-update.yaml:11`
- `.github/workflows/npm-publish.yaml:14`
- `.github/workflows/npm-publish.yaml:18`
- `.github/workflows/npm-publish.yaml:23`
- `.github/workflows/npm-publish.yaml:33`
- `.github/workflows/test.yaml:12`
- `.github/workflows/test.yaml:16`
- `.github/workflows/test.yaml:21`
- `.github/workflows/version-bump.yaml:24`
- `.github/workflows/version-bump.yaml:30`
- `.github/workflows/version-bump.yaml:36`
- `action.yml:76`

### script-injection (severity: high)

Rule (a): GitHub Actions expressions are interpolated directly inside `run:` shell command strings, allowing template substitution to inject shell metacharacters before the shell parses the command.

- major-tag-update.yaml line 25: `git tag -fa v0 -m "Move v0 to ${{ github.event.release.tag_name }}"` — github.event.release.tag_name is attacker-influenced and interpolated directly into a shell string.

- version-bump.yaml line 50: `pnpm version ${{ inputs.release_type }} --no-git-tag-version` — inputs.release_type is a workflow_dispatch input interpolated directly into the shell command (even though it is a choice input, direct interpolation is still a violation).

- version-bump.yaml line 54: `git checkout -b "release/${{ env.new_version }}"` — env context interpolated directly in run:.

- version-bump.yaml line 63: `git commit -m "chore(release): bump version to ${{ env.new_version }}"` — env context interpolated directly in run:.

- version-bump.yaml line 67: `git push -u origin "HEAD:release/${{ env.new_version }}"` — env context interpolated directly in run:.

- version-bump.yaml lines 71-75: `gh pr create` with --head, --title, and --body all containing `${{ env.new_version }}` — env context interpolated directly in run:.

Locations:

- `.github/workflows/major-tag-update.yaml:25`
- `.github/workflows/version-bump.yaml:50`
- `.github/workflows/version-bump.yaml:54`
- `.github/workflows/version-bump.yaml:63`
- `.github/workflows/version-bump.yaml:67`
- `.github/workflows/version-bump.yaml:72`
- `.github/workflows/version-bump.yaml:73`
- `.github/workflows/version-bump.yaml:74`
- `.github/workflows/version-bump.yaml:75`

### missing-permissions (severity: medium)

The following workflow files have no top-level `permissions:` key and no job-level `permissions:` key on any of their jobs. Without explicit permissions, the workflow inherits the repository's default token permissions, which may be overly broad (write-all by default in many repositories).

- build.yaml: triggered on pull_request, no permissions declared.
- test.yaml: triggered on pull_request, no permissions declared.
- major-tag-update.yaml: triggered on release published, performs git tag operations, no permissions declared.

Locations:

- `.github/workflows/build.yaml:1`
- `.github/workflows/test.yaml:1`
- `.github/workflows/major-tag-update.yaml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all findings across 7 files:

**unpinned-uses**: Pinned all action references to full SHAs:
- actions/checkout@v4 → @11d5960a326750d5838078e36cf38b85af677262
- jdx/mise-action@v2 → @c37c93293d6b742fc901e1406b8f764f6fb19dac
- actions/cache@v4 → @0057852bfaa89a56745cba8c7296529d2fc39830
- actions/setup-node@v4 → @49933ea5288caeca8642d1e84afbd3f7d6820020
- nyaomaru/changelog-bot@v0 → @e34e7889a572fa36aeb2dc04f53b5c6b2b7a2cea
Applied in: build.yaml, test.yaml, major-tag-update.yaml, changelog.yaml, npm-publish.yaml, version-bump.yaml, action.yml

**script-injection**: Moved all ${{ }} expressions out of run: blocks into env: blocks:
- major-tag-update.yaml line 25: github.event.release.tag_name → TAG_NAME env var
- version-bump.yaml line 50: inputs.release_type → RELEASE_TYPE env var
- version-bump.yaml lines 54/63/67/72-75: all ${{ env.new_version }} references replaced with ${new_version} shell variable (new_version is set via GITHUB_ENV in the Generate new version step)

**missing-permissions**: Added top-level permissions blocks:
- build.yaml: permissions: contents: read (pull_request workflow, only needs to read code)
- test.yaml: permissions: contents: read (pull_request workflow, only needs to read code)
- major-tag-update.yaml: permissions: contents: write (needs to push git tags)

