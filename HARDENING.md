<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.8

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.8** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action step 'Setup Node.js' uses `actions/setup-node@v4`, which is pinned to a mutable version tag rather than an immutable 40-character SHA commit hash. If the tag is moved (e.g., by a supply-chain compromise of the upstream action), the action will silently execute different code. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12462b0e4b4c3c1d6a0f7e3b6e7e8e9 # v4`.

Locations:

- `action.yml:88`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Replaced `actions/setup-node@v4` with `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml at line 88. The mutable tag reference is now pinned to an immutable commit SHA.

