<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.12

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.12** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action uses `actions/setup-node@v7` which is pinned to a mutable tag (`v7`) rather than a full 40-character commit SHA. This means the referenced action could be silently updated or replaced, creating a supply-chain attack vector. It should be pinned to a specific commit SHA (e.g., `actions/setup-node@1d0ff469b18977b7e4f2f5c5c2a9e3e5b3e5b3e5 # v7`).

Locations:

- `action.yml:68`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned actions/setup-node@v7 to actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7 in hardened/action/action.yml at line 68. The full 40-character commit SHA was resolved via the GitHub API and the original tag is preserved as a comment.

