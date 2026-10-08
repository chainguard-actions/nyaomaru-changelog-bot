<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.5.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.5.0** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action step 'Setup Node.js' uses `actions/setup-node@v4`, which is pinned to a mutable version tag rather than an immutable 40-character SHA commit hash. A tag can be moved to point to a different (potentially malicious) commit at any time, enabling a supply-chain attack. It should be replaced with a full SHA pin, e.g. `actions/setup-node@1d0ff469b12294b4f0f8b0dca4e5b3d5b3e5b3e5 # v4`.

Locations:

- `action.yml:68`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to its full commit SHA `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml at line 68. The original tag is preserved as a comment for readability.

