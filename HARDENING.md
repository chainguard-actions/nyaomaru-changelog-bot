<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.9.2

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.9.2** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action step 'Setup Node.js' uses `actions/setup-node@v7`, which is a mutable tag reference rather than a pinned 40-character SHA commit hash. This means the action could be silently updated (or compromised) without the consuming workflow noticing, enabling a supply-chain attack. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b12462b0f186a6e9d0a2b9b5b5b5b5b5 # v7`.

Locations:

- `action.yml:84`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v7` to full commit SHA `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7` in hardened/action/action.yml at line 84. The mutable tag was replaced with the immutable SHA to prevent supply-chain attacks, with the original tag preserved as a comment.

