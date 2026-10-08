<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.4

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.4** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action step 'Setup Node.js' uses `actions/setup-node@v4`, which is a mutable tag reference rather than a pinned 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to this file, creating a supply-chain risk. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12f2e6c5a1aa9a8e9f5e5e5e5e5e5e5 # v4`.

Locations:

- `action.yml:89`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to its full commit SHA `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml line 89. The mutable tag reference has been replaced with an immutable SHA while preserving the tag as a comment for readability.

