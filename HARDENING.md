<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.6

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.6** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action uses `actions/setup-node@v4`, which is a mutable tag reference rather than a pinned full 40-character commit SHA. If the tag is moved (intentionally or via a supply-chain attack), the action will silently execute different code. Pin this to a specific commit SHA, e.g. `actions/setup-node@1d0ff469b12f2e6c5a1aa6f1d4b4c9b8e6a1f2d3 # v4`.

Locations:

- `action.yml:82`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to full commit SHA `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` at line 82 of action.yml.

