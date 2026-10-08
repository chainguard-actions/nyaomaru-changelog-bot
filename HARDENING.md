<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.13

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.13** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action step 'Setup Node.js' uses `actions/setup-node@v7`, which is pinned to a mutable version tag rather than an immutable 40-character SHA commit hash. If the tag is moved (e.g., by a supply-chain compromise), the action will silently execute different code. It should be pinned to a full SHA, e.g. `actions/setup-node@<40-hex-char-sha> # v7`.

Locations:

- `action.yml:72`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v7` to its immutable SHA `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7` in hardened/action/action.yml at line 72.

