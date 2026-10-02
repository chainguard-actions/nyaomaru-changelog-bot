<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.7.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.7.0** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v7`, which is pinned to a mutable version tag rather than an immutable 40-character commit SHA. A tag can be moved to point to a different (potentially malicious) commit at any time, enabling a supply-chain attack. It should be replaced with a full SHA pin, e.g. `actions/setup-node@<40-char-sha> # v7`.

Locations:

- `action.yml:84`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Replaced `actions/setup-node@v7` with `actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7` in hardened/action/action.yml at line 84. The SHA was resolved via git ls-remote and the original tag is preserved as a comment for readability.

