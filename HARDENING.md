<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.5.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **nyaomaru--changelog-bot/v0.5.0** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v4`, which is a mutable tag reference rather than a pinned 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to this file, creating a supply-chain risk. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b4a3d2f5b32d7d2b9b9b9b9b9b9b9b9b # v4`.

Locations:

- `action.yml:72`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to its full commit SHA `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in action.yml at line 72. The SHA was resolved via lookup_action_sha and the human-readable tag is preserved as a comment.

