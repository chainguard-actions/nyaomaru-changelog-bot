<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.4

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.4** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action.yml references `actions/setup-node@v4`, which uses a mutable tag (`@v4`) rather than a pinned 40-character commit SHA. This means the action could silently change if the tag is moved, enabling a supply-chain attack. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b18977b4dc9a1d7a1b5e6a4e69b3c5a2 # v4`.

Locations:

- `action.yml:73`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to full commit SHA `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml at line 73. SHA was resolved via lookup_action_sha.

