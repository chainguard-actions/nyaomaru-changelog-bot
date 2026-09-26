<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.11

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.11** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action step 'Setup Node.js' references `actions/setup-node@v4`, which uses a mutable version tag instead of a pinned 40-character commit SHA. A tag can be moved to point to a different (potentially malicious) commit at any time, enabling supply-chain attacks. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12f2e6c5a1e9f2b7d5e6f7a8b9c0d1e # v4`.

Locations:

- `action.yml:80`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to full commit SHA `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml at line 80. SHA was resolved via lookup_action_sha.

