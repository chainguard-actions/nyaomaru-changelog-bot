<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.5

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.5** was hardened automatically. 1 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action step 'Setup Node.js' references `actions/setup-node@v4`, which uses a mutable version tag instead of a pinned 40-character commit SHA. A tag can be moved to point to a different (potentially malicious) commit at any time, enabling supply-chain attacks. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12f8a4f9e4a4b3f5d7c8e9f0a1b2c3d # v4`.

Locations:

- `action.yml:84`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to full commit SHA `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml at line 84. The original tag is preserved as a comment for readability.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses, missing-permissions

**Notes:**

Fixed all findings across 6 workflow files:

1. **script-injection** (major-tag-update.yaml): Moved `${{ github.event.release.tag_name }}` into the step's `env:` block as `TAG_NAME` and referenced it as `$TAG_NAME` in the shell script.

2. **script-injection** (version-bump.yaml): Moved `${{ inputs.release_type }}` into an `env:` block as `RELEASE_TYPE`. Moved all `${{ env.new_version }}` references into per-step `env:` blocks as `NEW_VERSION` for the branch creation, commit, push, and PR creation steps.

3. **unpinned-uses**: Pinned all action references to full 40-character commit SHAs across all 6 workflow files: actions/checkout@v4→11d5960a..., jdx/mise-action@v2→c37c9329..., actions/cache@v4→0057852b..., nyaomaru/changelog-bot@v0→e34e7889..., actions/setup-node@v4→49933ea5...

4. **missing-permissions**: Added `permissions: contents: read` to build.yaml and test.yaml (read-only for PR checks). Added `permissions: contents: write, pull-requests: write` at top level to changelog.yaml (matching its existing job-level permissions). Added job-level `permissions: contents: write` to major-tag-update.yaml since it pushes tags.

