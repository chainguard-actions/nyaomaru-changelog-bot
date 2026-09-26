<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.10

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.10** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v4`, which is pinned to a mutable tag (`@v4`) rather than an immutable 40-character commit SHA. This means the referenced action could be silently replaced with malicious code via a tag update, enabling a supply-chain attack. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12462b0f186a6757d1b4e4a7e5e4e3e # v4`.

Locations:

- `action.yml:90`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned actions/setup-node@v4 to actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4 in hardened/action/action.yml at line 90. The full commit SHA was resolved via lookup_action_sha and the original tag is preserved as a comment for readability.

