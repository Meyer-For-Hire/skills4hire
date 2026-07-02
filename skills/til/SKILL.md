---
name: til
description: Capture a reusable developer fact ("today I learned…") into your global cross-project memory, or promote a project memory up to global. For general technical knowledge that should surface in every session — not project-specific facts (those belong in the built-in per-project memory).
disable-model-invocation: true
---

# til — capture global developer knowledge

Save reusable technical knowledge into a **global** store at `~/.claude/memory/`
that surfaces in *every* Claude Code session, regardless of project. This fills
the gap the built-in per-project memory leaves: general facts like "Node 24 added
a built-in `node:sqlite` module" or "`git rebase --update-refs` restacks dependent
branches" — true everywhere, captured nowhere.

This is a **prompt-driven** skill: explore → present → confirm → write. It is not
a rigid script. All file mutations go through the helper so the user's
`~/.claude/CLAUDE.md` and index are edited safely and idempotently.

## When to use / not

- **Use** for reusable, cross-project technical facts (language/tooling/API
  behavior, durable how-tos).
- **Don't use** for project-specific facts, personal preferences, or how-to-work-
  with-me guidance — those are the built-in per-project memory's job.

## The store

- `~/.claude/memory/` — the global store (one fact per file).
- `~/.claude/memory/MEMORY.md` — always-loaded index (plain markdown links).
- `~/.claude/CLAUDE.md` — carries a managed recall block (bootstrapped on first run).

The helper resolves the config dir from `CLAUDE_CONFIG_DIR`, else `$HOME/.claude`.
Invoke it as: `node "${CLAUDE_PLUGIN_ROOT}/skills/til/scripts/til-store.mjs" <command>`.

## Always first: bootstrap recall

Before writing anything, run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/til/scripts/til-store.mjs" ensure-recall
```

This creates the store, the `MEMORY.md` header, and the managed block in
`~/.claude/CLAUDE.md` if absent, and refreshes the block in place otherwise. It is
idempotent — safe to run every invocation. On the very first run, Claude Code
shows a one-time import-approval dialog for the new `@import`; that is expected.

## Flow A — `/til <fact>` (explicit capture)

1. Treat the argument text plus relevant conversation context as the fact.
2. Derive a kebab-case `name` (the slug) and a one-line `description`.
3. **Dedup check** before writing:
   - `… til-store.mjs find-dupe --slug <slug>` — exact slug already taken?
   - `… til-store.mjs list` — scan slugs+descriptions for the *same topic* under a
     different slug. If you find one, update that file instead of creating a
     duplicate. If the slug is taken by a *different* topic, pick a more specific slug.
4. Write `~/.claude/memory/<slug>.md` from the template below. Fill `captured` with
   today's date and `originSessionId` with the current session id if known.
5. `… til-store.mjs index-add --name <slug> --title "<Title>" --hook "<one-liner>"`
6. Report what was saved: the path + the one-line description.

## Flow B — `/til` (no args) — candidate picker

Gather candidates from two sources, present them, let the user pick any subset:

- **From this conversation:** notable, reusable dev facts stated in the session
  that aren't already saved (run `list` to check).
- **From this project's memory:** files under
  `~/.claude/projects/<project-slug>/memory/` worth promoting. (The project slug is
  this working directory with `/` replaced by `-`.)

For each **conversation fact** the user picks: capture it as in Flow A.
For each **project memory** the user picks: promote it (below).

## The `knowledge` file template

```markdown
---
name: <slug>
description: "<one-line summary — used for recall relevance>"
metadata:
  node_type: memory
  type: knowledge
  scope: global
  captured: <YYYY-MM-DD>
  originSessionId: <current session id, if known>
---

<the fact, in prose>

**Source:** <where it came from — e.g. "surfaced in conversation, <date> (not independently verified)">.
**Verify:** <how to confirm / staleness signal — e.g. "confirm the introducing version at nodejs.org/api/sqlite.html">.
```

`knowledge` bodies use **Source:** (provenance) + **Verify:** (how to confirm),
*not* the Why:/How-to-apply: convention of feedback/project memories. If a claim
is version/API-specific and your confidence is low, say so in **Verify**. Capture
faithfully and flag — never stall to fact-check, and never auto-web-verify.

## Promotion (project memory → global)

Copy, don't move:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/til/scripts/til-store.mjs" promote \
  --from ~/.claude/projects/<project-slug>/memory/<file>.md
```

This writes a global copy with `metadata.scope: global` and
`metadata.promotedFrom: <project-slug>` added and `originSessionId` preserved, adds
the index bullet, and **leaves the project original in place**. If the slug clashes
with a different global memory, the helper stops and asks you to pass `--as <slug>`.
After promoting, tell the user the original still exists and offer to delete it if
they want it gone (you delete it only on their say-so).

## Report

After capture/promotion, summarize: which files were written under
`~/.claude/memory/`, their one-line descriptions, and a reminder that the facts
will load in every new session (check the Verify line before relying on
version/API specifics).
