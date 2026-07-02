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

Add the Meyer For Hire marketplace, then install the plugin.

In Claude Code:

```
/plugin marketplace add Meyer-For-Hire/m4h-marketplace
/plugin install skills4hire@m4h-marketplace
```

Or from the command line:

```bash
claude plugin marketplace add Meyer-For-Hire/m4h-marketplace
claude plugin install skills4hire@m4h-marketplace
```

The first time `/til` runs it adds an `@import` to `~/.claude/CLAUDE.md`; Claude
Code shows a one-time approval dialog — approve it once and global memories load
in every future session.

**Local development / dev-load:** installing from the marketplace clones from
GitHub, so it needs `skills4hire` pushed. To try `/til` from the local checkout
before publishing, symlink the skill into your skills dir and restart:

```bash
mkdir -p ~/.claude/skills
ln -s /Users/jim/work/skills4hire/skills/til ~/.claude/skills/til
```

It then loads next session as `til@skills-dir`. Remove the symlink to undo.
