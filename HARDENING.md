<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.7

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.7** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action uses `actions/setup-node@v4`, which is pinned to a mutable version tag rather than an immutable 40-character commit SHA. This means the referenced action could be silently replaced with a different (potentially malicious) version without any change to this file, creating a supply-chain risk. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12294b4a9e3ea1b8b8e5f4e5e5e5e5e # v4`.

Locations:

- `action.yml:79`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned actions/setup-node@v4 to actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4 in hardened/action/action.yml at line 79. SHA was resolved via the GitHub API.

