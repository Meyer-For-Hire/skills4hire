# `/til` — Global Developer-Knowledge Memory — Design

**Date:** 2026-07-02
**Status:** Approved design; implementation plan pending
**Repo:** `skills4hire` (new plugin repo, mirrors `agents4hire`)

## Problem

Claude Code's built-in memory is **per-project**. Each working directory gets its
own store at `~/.claude/projects/<path-slug>/memory/`, and a memory saved there
only surfaces when you are back in that same directory.

The automatic memory system is also deliberately narrow about *what* it saves:
who you are (`user`), how to work with you (`feedback`), project facts
(`project`), and external pointers (`reference`). It is explicitly told to skip
general knowledge and "what the repo already records."

The result is a gap. Reusable technical facts that surface in conversation —
"Node.js added a built-in `node:sqlite` module in Node 24," "`git rebase
--update-refs` restacks dependent branches" — are exactly the things a developer
wants in their head across *every* project, and exactly the things the automatic
system never captures. They evaporate at the end of the session.

## Goal

A skill, `/til`, that captures reusable developer knowledge into a **global**
memory store that surfaces in every session regardless of project, and that can
also **promote** an existing project-scoped memory up to that global store.

### Non-goals (v1)

- Automatic web-verification of captured facts.
- Editing or deleting global memories through the skill (do that by hand for now).
- Syncing the store to a dotfiles git repo.
- Replacing or modifying the built-in per-project memory system.

## Architecture

### Store layout

A global store mirrors the per-project layout, one directory up from `projects/`:

```
~/.claude/
  CLAUDE.md                       # user memory; gets a managed block (created if absent)
  memory/                         # THE GLOBAL STORE
    MEMORY.md                     # index: plain markdown links, one bullet per fact
    node-24-native-sqlite.md      # one fact per file
    git-rebase-update-refs.md
  projects/<slug>/memory/         # unchanged built-in per-project stores
```

`~/.claude/memory/` sits outside `~/.claude/projects/<slug>/`, so the built-in
memory framework (which resolves the project-specific path) never touches it.
The two channels are independent.

### Recall mechanism

Global memories surface via a `@import` in `~/.claude/CLAUDE.md`. Confirmed
against the official docs (`code.claude.com/docs/en/memory.md`):

- `@path` imports in `~/.claude/CLAUDE.md` are supported; `~` expands.
- Imported content is **always loaded at launch** (not lazy).
- Imports are **ignored inside code fences** — the import line must be bare.
- Recursive imports are capped at **4 hops**.
- The first time an external import is seen, Claude Code shows a **one-time
  approval dialog**. The user approves once.

The skill maintains a delimited managed block in `~/.claude/CLAUDE.md`:

```
<!-- BEGIN til:global-memory -->
## Global developer knowledge

Cross-project facts and promoted memories. The index below is always loaded;
read a linked file when its hook looks relevant. These are point-in-time claims —
check the Verify line before relying on version/API specifics.

@~/.claude/memory/MEMORY.md
<!-- END til:global-memory -->
```

`MEMORY.md` is the always-loaded index. It links to fact files with **plain
markdown links, not `@imports`** — so only the cheap one-line-per-fact index
loads at launch, and full fact files are read on demand when a hook looks
relevant (the same pattern the built-in `MEMORY.md` uses). Using `@` per fact
would force-load every fact and defeat the cheap index.

```
# Global memory index

- [Node 24 native SQLite](node-24-native-sqlite.md) — built-in `node:sqlite`, no dependency.
```

### File format — the `knowledge` type

Fact files reuse the built-in memory frontmatter shape (so promotion is a clean
copy and recall stays uniform), introducing a new `type: knowledge`:

```markdown
---
name: node-24-native-sqlite
description: "Node.js ships a built-in SQLite module (node:sqlite), added in Node 24."
metadata:
  node_type: memory
  type: knowledge          # new type, alongside user/feedback/project/reference
  scope: global
  captured: 2026-07-02     # date → staleness signal
  originSessionId: <session-id>
---

Node.js has a native SQLite interface via the built-in `node:sqlite` module,
added in Node 24. No third-party dependency needed for basic SQLite use.

**Source:** surfaced in conversation, 2026-07-02 (not independently verified).
**Verify:** confirm the introducing version + stability at nodejs.org/api/sqlite.html.
```

Knowledge bodies use **Source:** (provenance) + **Verify:** (how to confirm /
staleness) — chosen over the **Why:/How to apply:** convention that
feedback/project memories use, because knowledge needs provenance and a
verification path more than rationale and application. [Decision D1]

## Behavior — the `/til` flows

The skill is prompt-driven (explore → confirm → write), matching the other
`*4hire` skills — not a rigid script.

### `/til <fact>` — explicit capture

1. Treat the argument text, plus relevant conversation context, as the fact.
2. Derive a kebab-case `name` and a one-line `description`.
3. Write `~/.claude/memory/<name>.md` as `type: knowledge`, with today's
   `captured` date, the session id, and a **Verify** line. If the claim is
   obviously version/API-specific and confidence is low, say so in **Verify**.
4. Add the index bullet to `MEMORY.md`.
5. Bootstrap the CLAUDE.md managed block if this is the first run.
6. Report what was saved (path + one-liner).

### `/til` (no args) — candidate picker

Gathers candidates from two sources and lets the user pick any subset to save
globally:

- **From this conversation:** notable, reusable dev facts stated in the session
  that are not already saved (the `node:sqlite` inspiration).
- **From this project's memory:** files under `~/.claude/projects/<slug>/memory/`
  worth promoting.

Selected conversation facts are written as new `knowledge` memories; selected
project memories are promoted (see below).

## Promotion mechanics

- **Copy, not move** (non-destructive). The project memory stays in place; a copy
  lands in `~/.claude/memory/` with `metadata.promotedFrom: <project-slug>` added
  and the original `originSessionId` preserved. [Decision D2]
- Because the original remains, a promoted memory can surface both via project
  recall (when in that repo) and via the global index. The skill notes this and
  offers to delete the project original if the user wants it gone.

## Staleness & verification posture

- Every `knowledge` fact carries a `captured` date and a **Verify** line; the
  CLAUDE.md block header repeats the "check before relying" caveat. This mirrors
  the built-in memory system's own "true when written" caveat.
- Default is **capture faithfully + flag for verification** — not block-on-verify
  and not auto-web-verify. `/til` never stalls to fact-check. [Decision D3]

## Bootstrap, idempotency & edge cases

- **First run** creates `~/.claude/memory/`, an empty-with-header `MEMORY.md`,
  and the CLAUDE.md managed block. The one-time import-approval dialog appears —
  expected.
- **Managed block** is located by its `BEGIN til:global-memory` marker, refreshed
  in place, never duplicated; the rest of `~/.claude/CLAUDE.md` is left untouched.
- **Dedup on capture:** before writing, check for an existing global memory on the
  same topic and update it rather than create a duplicate (the rule the memory
  framework already uses). Slug collisions for distinct facts are disambiguated.

## Repo & distribution — the `skills4hire` plugin

- New git repo at `/Users/jim/work/skills4hire`, structured as a Claude Code
  plugin mirroring `agents4hire`:

  ```
  skills4hire/
    .claude-plugin/plugin.json
    skills/til/SKILL.md
    docs/specs/2026-07-02-til-global-memory-design.md
  ```

- Loaded into sessions via plugin registration (a marketplace entry such as
  `m4h-marketplace`, or a local plugin path during development). Exact
  install/registration path is an implementation detail for the plan.
- Rationale: matches the established `agents4hire` pattern and makes `/til`
  versioned and shareable from the start.

## Scope guardrail (v1)

In scope: `knowledge` capture (with-arg and from-conversation) plus
project→global promotion, the CLAUDE.md recall wiring, and the `skills4hire`
plugin scaffolding. Everything under **Non-goals** is deferred.

## Verification notes

- CLAUDE.md `@import` semantics confirmed against
  `https://code.claude.com/docs/en/memory.md` (Import additional files section):
  user-level imports supported, `~` expansion, always-loaded at launch, 4-hop
  cap, ignored inside code fences, one-time external-import approval dialog.
