<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.4.2

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **nyaomaru--changelog-bot/v0.4.2** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v4`, which is pinned to a mutable version tag rather than an immutable 40-character commit SHA. This means the action could silently change if the tag is moved, enabling a supply-chain attack. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12462b0e4b0b3c8fe7e7e0ae7b8b4e5 # v4`.

Locations:

- `action.yml:64`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned actions/setup-node@v4 to actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4 in action.yml at line 64. The full commit SHA was resolved via lookup_action_sha and replaces the mutable v4 tag to prevent supply-chain attacks.

