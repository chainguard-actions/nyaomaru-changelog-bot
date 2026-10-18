<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.9.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.9.1** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action step `uses: actions/setup-node@v7` references a mutable tag (`@v7`) rather than a full 40-character commit SHA. This means the action could be silently updated or replaced by a supply-chain attacker without any change to the workflow file. Pin it to a specific commit SHA, e.g. `actions/setup-node@1d0ff469b12461c3ad2c9b6304e4b3f3fbf7a7a7 # v7`.

Locations:

- `action.yml:76`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v7` to `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7` in hardened/action/action.yml at line 76. SHA was resolved via lookup_action_sha.

