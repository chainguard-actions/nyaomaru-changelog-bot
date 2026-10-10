<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.8.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.8.0** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action uses `actions/setup-node@v7` with a mutable tag reference (`v7`) instead of a pinned full 40-character commit SHA. This means the action could be silently updated to a different (potentially malicious) version without any change to the workflow, creating a supply-chain attack risk.

Locations:

- `action.yml:83`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Replaced `actions/setup-node@v7` with the pinned full commit SHA `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7` in hardened/action/action.yml line 83. The original tag is preserved as a comment for readability.

