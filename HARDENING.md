<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.9.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.9.0** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v7`, which is a mutable tag reference rather than a pinned full 40-character SHA commit hash. A tag can be moved to point to a different (potentially malicious) commit at any time, enabling supply-chain attacks. It should be replaced with a full SHA pin, e.g. `actions/setup-node@<40-char-sha> # v7`.

Locations:

- `action.yml:68`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Replaced `actions/setup-node@v7` with the pinned full SHA reference `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7` in hardened/action/action.yml at line 68. The SHA was resolved via lookup_action_sha.

