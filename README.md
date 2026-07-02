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

**Local development.** Two ways to exercise the work before publishing:

- **Test the helper directly** — its commands are plain Node and honor
  `CLAUDE_CONFIG_DIR`, so you can drive them against a throwaway store without
  installing anything:

  ```bash
  CLAUDE_CONFIG_DIR=$(mktemp -d) node skills/til/scripts/til-store.mjs ensure-recall
  ```

  Run the test suite with `node --test 'skills/til/scripts/*.test.mjs'` (use the
  glob form — the bare-directory form is unreliable on Node 26.x).

- **Exercise the real `/til` slash command** — this needs a full plugin install
  so that `${CLAUDE_PLUGIN_ROOT}` resolves, since `SKILL.md` invokes the helper
  through that variable. It is **not** set for a bare `~/.claude/skills` symlink
  (`@skills-dir` load), so that shortcut leaves `/til`'s commands unresolved.
  Install via the marketplace once the repo is pushed:
  `/plugin install skills4hire@m4h-marketplace`.
