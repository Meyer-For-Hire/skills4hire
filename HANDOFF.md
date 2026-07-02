# Handoff — building the `/til` skill

Session handoff so this work can resume in a fresh session started **in this
directory** (`/Users/jim/work/skills4hire`).

## Where we are

Brainstorming is **done and the design is approved**. The design spec is written
and committed. Next step is to turn it into an implementation plan, then build.

## How to resume (new session)

1. Read the full design: `docs/specs/2026-07-02-til-global-memory-design.md`.
2. Invoke the **`superpowers:writing-plans`** skill to produce the implementation
   plan from that spec.
3. Then execute the plan (build the plugin + skill).

## What `/til` is (one-liner)

A skill that captures reusable **developer knowledge** into a **global**
`~/.claude/memory/` store that surfaces in *every* session via a `@import` in
`~/.claude/CLAUDE.md` — and can also **promote** an existing per-project memory
up to that global store. Fills the gap where the built-in per-project memory
never captures general technical facts (e.g. "Node 24 added a built-in
`node:sqlite` module").

## Locked decisions

- **Name:** `/til`. **Repo:** `skills4hire`, structured as a Claude Code plugin
  mirroring `agents4hire`. **Skill path:** `skills/til/SKILL.md`.
- **Store:** `~/.claude/memory/` with a `MEMORY.md` index. Index uses **plain
  markdown links** (fact files read on demand), never `@imports`.
- **Recall:** a delimited managed block in `~/.claude/CLAUDE.md` containing a bare
  `@~/.claude/memory/MEMORY.md` line (created if the file is absent; idempotent).
- **New memory type:** `knowledge`. Body convention is **Source:** + **Verify:**
  (not the Why:/How-to-apply: used by feedback/project memories). [D1]
- **Flows:** `/til <fact>` = explicit capture. `/til` (no args) = pick from
  (a) reusable dev facts stated in the current conversation and (b) this
  project's existing memories worth promoting.
- **Promotion:** **copy, not move** (project original stays); add
  `metadata.promotedFrom: <slug>`. Offer to delete the original. [D2]
- **Verify posture:** capture faithfully + flag with a Verify line; **no**
  block-on-verify, **no** auto-web-verify in v1. [D3]

## Verified — do NOT re-check

`~/.claude/CLAUDE.md` `@import` semantics, confirmed against
`code.claude.com/docs/en/memory.md` (Import additional files):
supported in user memory; `~` expands; **always-loaded at launch**; **4-hop**
recursion cap; **ignored inside code fences** (import line must be bare); a
**one-time approval dialog** appears on first external import.

## Deferred — decide during the plan

- **Plugin registration:** add `skills4hire` to `m4h-marketplace`, or install via
  a local plugin path during development.
- **Model-invocation:** default is **user-invoked only**
  (`disable-model-invocation: true`, like `setup-m4h-agents4hire`).

## Scope (v1) / non-goals

- **In:** `knowledge` capture (with-arg + from-conversation), project→global
  promotion, CLAUDE.md recall wiring, `skills4hire` plugin scaffolding.
- **Out:** auto web-verification, edit/delete of global memories via the skill,
  dotfiles git sync.

## Repo state

- `git init` on `main`.
- Commit `b96159a` — the design spec.
- Plus this handoff.
