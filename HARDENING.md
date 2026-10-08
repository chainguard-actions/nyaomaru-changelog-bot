<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.7

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.7** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v4`, which is pinned to a mutable version tag rather than an immutable 40-character commit SHA. This means the action could silently change if the tag is moved, enabling a supply-chain attack. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12f2e6c5a1aa6f0e1b2b5e6c7d8f9a0 # v4`.

Locations:

- `action.yml:72`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned actions/setup-node@v4 to its full commit SHA (49933ea5288caeca8642d1e84afbd3f7d6820020) in hardened/action/action.yml line 72. The mutable tag is preserved as an inline comment for readability.

