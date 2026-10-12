<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.14

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.14** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v7`, which is pinned to a mutable version tag rather than an immutable 40-character commit SHA. This means the action could silently change if the tag is moved, enabling a supply-chain attack. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12462b0f186b8f3f9e0b5e3e3e3e3e3 # v7`.

Locations:

- `action.yml:88`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v7` to the full commit SHA `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7` in hardened/action/action.yml. The SHA was resolved via lookup_action_sha and the original tag is preserved as a comment.

