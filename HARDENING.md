<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.6

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.6** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action uses `actions/setup-node@v4`, which is pinned to a mutable tag rather than a full 40-character SHA commit hash. This is a supply-chain risk: if the tag is moved to a different commit (maliciously or accidentally), the action will silently execute different code. It should be pinned to a specific commit SHA, e.g. `actions/setup-node@1d0ff469b4a3d2f5b32d7d2b9b9b9b9b9b9b9b9b # v4`.

Locations:

- `action.yml:76`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Replaced `actions/setup-node@v4` with `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml at line 76. The full 40-character commit SHA was resolved via the GitHub API and the mutable tag is preserved as a comment for readability.

