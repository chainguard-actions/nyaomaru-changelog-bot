<!-- markdownlint-disable -->

# Hardening Report: nyaomaru--changelog-bot/v0.6.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **nyaomaru--changelog-bot/v0.6.1** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The composite action uses `actions/setup-node@v4`, which is a mutable tag reference rather than a pinned 40-character SHA commit hash. This means the action could silently pull in a different (potentially malicious) version if the tag is moved. It should be pinned to a full SHA, e.g. `actions/setup-node@1d0ff469b4a71a8d521edb6bbb10d6ad5e6a3a3c # v4`.

Locations:

- `action.yml:75`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses

**Notes:**

Pinned `actions/setup-node@v4` to full commit SHA `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in hardened/action/action.yml line 75. SHA was resolved via lookup_action_sha.

