<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.6

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.6** was hardened automatically. 1 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action uses `actions/setup-node@v4`, which is pinned to a mutable tag (`@v4`) rather than an immutable 40-character commit SHA. This means the referenced action could be silently replaced with a different (potentially malicious) version without any change to this file, creating a supply-chain risk.

Locations:

- `action.yml:76`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to its full commit SHA `49933ea5288caeca8642d1e84afbd3f7d6820020` in hardened/action/action.yml (line 76). The original tag is preserved as a trailing comment (`# v4`) for readability.

### Iteration 2

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all 6 workflow files:

1. build.yaml: Pinned actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4 to full SHAs; added `permissions: contents: read`.

2. changelog.yaml: Pinned actions/checkout@v4 and nyaomaru/changelog-bot@v0 to full SHAs.

3. major-tag-update.yaml: Pinned actions/checkout@v4 to full SHA; added `permissions: contents: write`; fixed script injection by moving `github.event.release.tag_name` into step env block as TAG_NAME.

4. npm-publish.yaml: Pinned actions/checkout@v4, actions/setup-node@v4, jdx/mise-action@v2, actions/cache@v4 to full SHAs.

5. test.yaml: Pinned actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4 to full SHAs; added `permissions: contents: read`.

6. version-bump.yaml: Pinned actions/checkout@v4, jdx/mise-action@v2, actions/cache@v4 to full SHAs; fixed all 5 script injection points by moving inputs.release_type and env.new_version into per-step env blocks and referencing them as plain shell variables ($RELEASE_TYPE, $NEW_VERSION).

