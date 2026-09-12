<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.14

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.14** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The action uses `actions/setup-node@v7`, which is a mutable tag reference rather than a pinned 40-character commit SHA. This means the action could silently pull in a different (potentially malicious) version of setup-node if the tag is moved. It should be pinned to a full SHA, e.g. `actions/setup-node@<40-char-sha> # v7`.

Locations:

- `action.yml:72`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v7` to its full commit SHA `820762786026740c76f36085b0efc47a31fe5020` in hardened/action/action.yml (line 72). The original tag is preserved as a comment (`# v7`) for readability.

