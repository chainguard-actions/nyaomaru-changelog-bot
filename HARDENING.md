<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.5.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **nyaomaru--changelog-bot/v0.5.1** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action uses `actions/setup-node@v4`, which is pinned to a mutable tag rather than an immutable 40-character commit SHA. If the tag is moved (e.g., by a supply-chain compromise of the upstream action), the action will silently execute different code. It should be pinned to a full SHA, e.g., `actions/setup-node@1d0ff469b12462b0f186a6e9d7b28e4f8b0e7a1a # v4`.

Locations:

- `action.yml:72`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned actions/setup-node@v4 to its full commit SHA (49933ea5288caeca8642d1e84afbd3f7d6820020) in action.yml line 72. The original tag is preserved as a comment: `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4`.

