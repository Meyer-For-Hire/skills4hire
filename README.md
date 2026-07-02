# skills4hire

Skills for capturing and recalling reusable developer knowledge across projects.

## Skills

### til

Capture a reusable developer fact ("today I learned…") into a **global** memory
store at `~/.claude/memory/` that surfaces in *every* Claude Code session — or
promote an existing project-scoped memory up to that global store.

**Invoke:** `/skills4hire:til` or `/til`

**What it does:**
- `/til <fact>` — captures the fact as a global `knowledge` memory.
- `/til` (no args) — offers candidates from the current conversation and this
  project's memories, and saves the ones you pick.
- Wires recall into `~/.claude/CLAUDE.md` via an always-loaded index (`MEMORY.md`).

## Installation

<!-- filled in Task 7 -->
