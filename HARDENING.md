<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.1** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v4`, which is pinned to a mutable version tag rather than an immutable 40-character commit SHA. A tag can be moved to point to a different (potentially malicious) commit at any time, creating a supply-chain risk. It should be replaced with a full SHA pin, e.g. `actions/setup-node@1d0ff469b12461f2f9e0e5e0b9f2b8e0e0e0e0e0 # v4`.

Locations:

- `action.yml:75`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Replaced `actions/setup-node@v4` with `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml at line 75. The mutable tag was pinned to its resolved commit SHA to prevent supply-chain attacks.

