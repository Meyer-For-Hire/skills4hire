# `/til` — Global Developer-Knowledge Memory — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `skills4hire` Claude Code plugin whose `/til` skill captures reusable developer knowledge into a global `~/.claude/memory/` store that surfaces in every session, and can promote a project memory up to that store.

**Architecture:** A prose-driven `SKILL.md` handles judgment (deriving names/descriptions, picking candidates, phrasing Verify lines) and delegates every deterministic, file-mutating operation to a zero-dependency Node helper, `til-store.mjs`. The helper owns the two highest-stakes operations — idempotently maintaining a delimited managed block in the user's `~/.claude/CLAUDE.md`, and maintaining the `MEMORY.md` index — plus promotion-copy and dedup lookups. The helper is unit-tested with Node's built-in test runner against a temp config dir; the skill's prose orchestrates the helper.

**Tech Stack:** Node.js (ESM `.mjs`, no npm dependencies), Node built-in `node:test` + `node:assert/strict` runner, Claude Code plugin format (`.claude-plugin/plugin.json`, `skills/<name>/SKILL.md`), `m4h-marketplace` for distribution.

## Global Constraints

Every task's requirements implicitly include these (values copied verbatim from the approved design, `docs/specs/2026-07-02-til-global-memory-design.md`, and `HANDOFF.md`):

- **Store location:** `~/.claude/memory/` — sits *outside* `~/.claude/projects/<slug>/`, so the built-in per-project memory framework never touches it.
- **Index:** `~/.claude/memory/MEMORY.md` uses **plain markdown links** (`- [Title](slug.md) — hook`), one bullet per fact — **never `@imports`** (only the cheap one-line index is force-loaded; fact files are read on demand).
- **Recall:** a single delimited managed block in `~/.claude/CLAUDE.md` containing a **bare** `@~/.claude/memory/MEMORY.md` line. Created if the file is absent. Located by its `BEGIN til:global-memory` marker, refreshed in place, never duplicated; the rest of `CLAUDE.md` is untouched. The import line must be bare (imports inside code fences are ignored).
- **Managed block markers:** `<!-- BEGIN til:global-memory -->` … `<!-- END til:global-memory -->`.
- **Memory type:** new `type: knowledge`. Body convention is **Source:** (provenance) + **Verify:** (how to confirm / staleness) — *not* the Why:/How to apply: convention feedback/project memories use. [D1]
- **Frontmatter shape** (reuses the built-in memory shape so promotion is a clean copy): `name`, `description`, then `metadata:` with `node_type: memory`, `type: knowledge`, `scope: global`, `captured: YYYY-MM-DD`, `originSessionId`.
- **Promotion:** **copy, not move** — project original stays; global copy adds `metadata.promotedFrom: <project-slug>` and preserves `originSessionId`. Offer to delete the original; never delete it automatically. [D2]
- **Verify posture:** capture faithfully + flag with a Verify line. **No** block-on-verify, **no** auto-web-verify in v1. `/til` never stalls to fact-check. [D3]
- **Invocation:** user-invoked only — `disable-model-invocation: true` (mirrors `setup-m4h-agents4hire`).
- **Helper base dir:** resolved from `CLAUDE_CONFIG_DIR` if set, else `$HOME/.claude`. Tests set `CLAUDE_CONFIG_DIR` to a temp dir so they never touch the real config.
- **Import-line rule:** when the config dir is the default `$HOME/.claude`, emit `@~/.claude/memory/MEMORY.md`; otherwise emit an absolute `@<configdir>/memory/MEMORY.md`.
- **Zero runtime dependencies.** No npm install; only Node built-ins.
- **Plugin identity:** name `skills4hire`, author `{ "name": "Meyer For Hire Consulting, LLC" }`, version `0.1.0` — mirrors `agents4hire`.
- **Repo:** `/Users/jim/work/skills4hire`, git on `main`, **no remote yet**.

---

## File Structure

```
skills4hire/
  .claude-plugin/plugin.json              # Task 1 — plugin manifest
  README.md                               # Task 1 (+ install section in Task 7)
  .gitignore                              # Task 1
  LICENSE                                 # Task 1
  skills/til/
    SKILL.md                              # Task 6 — prose orchestration
    scripts/
      til-store.mjs                       # Tasks 2–5 — deterministic helper
      til-store.test.mjs                  # Tasks 2–5 — unit tests
      til-store.integration.test.mjs      # Task 6 — end-to-end composition test
  docs/
    specs/2026-07-02-til-global-memory-design.md   # exists
    plans/2026-07-02-til-global-memory-plan.md     # this file

m4h-marketplace/.claude-plugin/marketplace.json    # Task 7 — add skills4hire entry
```

`til-store.mjs` responsibilities (one command each): `ensure-recall` (block + store bootstrap/refresh), `index-add` (MEMORY.md bullet upsert), `list` + `find-dupe` (dedup support), `promote` (project→global copy). Judgment stays in `SKILL.md`.

---

### Task 1: Plugin scaffold

Create the plugin skeleton so the repo is a valid Claude Code plugin. Deliverable: `claude plugin validate` passes.

**Files:**
- Create: `/Users/jim/work/skills4hire/.claude-plugin/plugin.json`
- Create: `/Users/jim/work/skills4hire/README.md`
- Create: `/Users/jim/work/skills4hire/.gitignore`
- Create: `/Users/jim/work/skills4hire/LICENSE`

**Interfaces:**
- Consumes: nothing.
- Produces: a validatable plugin root at `/Users/jim/work/skills4hire`.

- [ ] **Step 1: Write `plugin.json`**

`/Users/jim/work/skills4hire/.claude-plugin/plugin.json`:

```json
{
  "name": "skills4hire",
  "description": "Skills for capturing and recalling reusable developer knowledge across projects.",
  "version": "0.1.0",
  "author": {
    "name": "Meyer For Hire Consulting, LLC"
  },
  "keywords": ["skills", "memory", "knowledge", "til", "developer-knowledge", "global-memory"]
}
```

- [ ] **Step 2: Write `.gitignore`**

`/Users/jim/work/skills4hire/.gitignore`:

```
.DS_Store
node_modules/
```

- [ ] **Step 3: Write `LICENSE`**

Copy the license text from the sibling repo verbatim (same owner):

Run: `cp /Users/jim/work/agents4hire/LICENSE /Users/jim/work/skills4hire/LICENSE`
Expected: file exists; `head -1 /Users/jim/work/skills4hire/LICENSE` prints a license header.

- [ ] **Step 4: Write `README.md`** (install section is filled in Task 7)

`/Users/jim/work/skills4hire/README.md`:

```markdown
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
```

- [ ] **Step 5: Validate the manifest**

Run: `claude plugin validate /Users/jim/work/skills4hire`
Expected: `✔ Validation passed`

- [ ] **Step 6: Commit**

```bash
cd /Users/jim/work/skills4hire
git add .claude-plugin/plugin.json README.md .gitignore LICENSE
git commit -m "feat: scaffold skills4hire plugin"
```

---

### Task 2: `til-store.mjs` foundation + `ensure-recall`

Build the helper's shared layer and its highest-stakes command: idempotently bootstrapping/refreshing the store and the `~/.claude/CLAUDE.md` managed block. This is the operation that could corrupt a real user file, so it is tested first and hardest.

**Files:**
- Create: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.mjs`
- Test: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`

**Interfaces:**
- Consumes: env `CLAUDE_CONFIG_DIR` (optional; defaults to `$HOME/.claude`).
- Produces (used by later tasks and by `SKILL.md`):
  - CLI: `node til-store.mjs ensure-recall` → creates `<config>/memory/`, `<config>/memory/MEMORY.md` (header only if absent), and the managed block in `<config>/CLAUDE.md`; prints a one-line summary. Idempotent.
  - Internal functions later tasks extend/reuse: `parseFlags(argv) -> object`, `splitFrontmatter(text) -> {fm, body}`, `readField(fmText, key) -> string|null`, `ensureIndex()`, `writeFileAtomic(file, data)` (all file writes in later tasks go through this), and the `CONFIG_DIR`/`MEMORY_DIR`/`INDEX`/`CLAUDE_MD` path constants and `BEGIN`/`END` markers.

- [ ] **Step 1: Write the failing tests**

`/Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`:

```js
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRIPT = new URL('./til-store.mjs', import.meta.url).pathname;

let dir;
beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'til-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

function run(args, env = {}) {
  return execFileSync('node', [SCRIPT, ...args], {
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir, ...env },
    encoding: 'utf8',
  });
}
const read = (p) => fs.readFileSync(path.join(dir, p), 'utf8');
const count = (s, sub) => s.split(sub).length - 1;

test('ensure-recall bootstraps store and index on an empty config dir', () => {
  run(['ensure-recall']);
  assert.ok(fs.existsSync(path.join(dir, 'memory')), 'memory/ created');
  assert.match(read('memory/MEMORY.md'), /^# Global memory index/);
});

test('ensure-recall creates the managed block with a bare import line', () => {
  // Point HOME at the test's temp dir so the config dir IS $HOME/.claude and
  // the ~ import rendering is exercised — without touching the real home dir.
  const cfg = path.join(dir, '.claude');
  execFileSync('node', [SCRIPT, 'ensure-recall'], {
    env: { ...process.env, HOME: dir, CLAUDE_CONFIG_DIR: cfg }, encoding: 'utf8',
  });
  const md = fs.readFileSync(path.join(cfg, 'CLAUDE.md'), 'utf8');
  assert.ok(md.includes('<!-- BEGIN til:global-memory -->'), 'has BEGIN marker');
  assert.ok(md.includes('<!-- END til:global-memory -->'), 'has END marker');
  assert.match(md, /^@~\/\.claude\/memory\/MEMORY\.md$/m, 'bare ~ import line present');
});

test('ensure-recall is idempotent — exactly one block after two runs', () => {
  run(['ensure-recall']);
  const first = read('CLAUDE.md');
  run(['ensure-recall']);
  const second = read('CLAUDE.md');
  assert.equal(count(second, '<!-- BEGIN til:global-memory -->'), 1);
  assert.equal(first, second, 'second run leaves the file byte-identical');
});

test('ensure-recall preserves pre-existing CLAUDE.md content', () => {
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# My notes\n\nkeep me\n');
  run(['ensure-recall']);
  const md = read('CLAUDE.md');
  assert.ok(md.includes('# My notes'), 'user heading kept');
  assert.ok(md.includes('keep me'), 'user body kept');
  assert.equal(count(md, '<!-- BEGIN til:global-memory -->'), 1);
});

test('ensure-recall refreshes a stale block in place, preserving surrounding order', () => {
  run(['ensure-recall']);
  const p = path.join(dir, 'CLAUDE.md');
  const block = fs.readFileSync(p, 'utf8').trim();
  const stale = block.replace('## Global developer knowledge', '## STALE HEADING');
  // User content on BOTH sides of the block — a refresh must not reorder it.
  fs.writeFileSync(p, '# My notes\n\n' + stale + '\n\n# trailing note\n');
  run(['ensure-recall']);
  const out = fs.readFileSync(p, 'utf8');
  assert.ok(!out.includes('STALE HEADING'), 'stale content replaced');
  assert.ok(out.includes('## Global developer knowledge'), 'canonical heading restored');
  assert.equal(count(out, '<!-- BEGIN til:global-memory -->'), 1, 'single block');
  assert.ok(out.indexOf('# My notes') < out.indexOf('<!-- BEGIN til:global-memory -->'),
    'user notes stay before the block');
  assert.ok(out.indexOf('<!-- END til:global-memory -->') < out.indexOf('# trailing note'),
    'trailing note stays after the block');
});

test('ensure-recall uses an absolute import path for a non-default config dir', () => {
  // dir is a temp dir, i.e. NOT $HOME/.claude, so the import must be absolute.
  run(['ensure-recall']);
  const md = read('CLAUDE.md');
  assert.match(md, new RegExp('^@' + dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/memory/MEMORY\\.md$', 'm'));
});

test('ensure-recall heals a CLAUDE.md that already has two managed blocks', () => {
  run(['ensure-recall']);
  const p = path.join(dir, 'CLAUDE.md');
  const block = fs.readFileSync(p, 'utf8').trim();
  // Two complete blocks with user text between them, as a bad merge/copy-paste
  // might produce. The tool must collapse this back to exactly one block.
  fs.writeFileSync(p, block + '\n\n# user notes\n\n' + block + '\n');
  run(['ensure-recall']);
  const out = fs.readFileSync(p, 'utf8');
  assert.equal(count(out, '<!-- BEGIN til:global-memory -->'), 1, 'exactly one begin marker');
  assert.equal(count(out, '<!-- END til:global-memory -->'), 1, 'exactly one end marker');
  assert.ok(out.includes('# user notes'), 'user text between the blocks preserved');
});

test('ensure-recall does not clobber an existing MEMORY.md with content', () => {
  fs.mkdirSync(path.join(dir, 'memory'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'memory', 'MEMORY.md'),
    '# Global memory index\n\n- [Existing](existing.md) — keep me\n');
  run(['ensure-recall']);
  const idx = read('memory/MEMORY.md');
  assert.ok(idx.includes('- [Existing](existing.md) — keep me'), 'existing index content preserved');
});

test('ensure-recall leaves an orphan BEGIN marker inert without eating later content', () => {
  const p = path.join(dir, 'CLAUDE.md');
  // A BEGIN with no matching END, followed by user data. Even across repeated
  // runs (which append a real block after it) the user data must survive.
  fs.writeFileSync(p, '<!-- BEGIN til:global-memory -->\n\nIMPORTANT USER DATA\n');
  run(['ensure-recall']);
  run(['ensure-recall']);
  const out = fs.readFileSync(p, 'utf8');
  assert.ok(out.includes('IMPORTANT USER DATA'), 'content after an orphan marker is never deleted');
  assert.equal(count(out, '<!-- END til:global-memory -->'), 1, 'exactly one real end marker');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`
Expected: FAIL — the run errors because `til-store.mjs` does not exist (`Cannot find module … til-store.mjs`).

- [ ] **Step 3: Write the implementation**

`/Users/jim/work/skills4hire/skills/til/scripts/til-store.mjs`:

```js
#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR
  ? path.resolve(process.env.CLAUDE_CONFIG_DIR)
  : path.join(os.homedir(), '.claude');
const MEMORY_DIR = path.join(CONFIG_DIR, 'memory');
const INDEX = path.join(MEMORY_DIR, 'MEMORY.md');
const CLAUDE_MD = path.join(CONFIG_DIR, 'CLAUDE.md');

const BEGIN = '<!-- BEGIN til:global-memory -->';
const END = '<!-- END til:global-memory -->';
const INDEX_HEADER = '# Global memory index\n';

// --- shared helpers -------------------------------------------------------

function parseFlags(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { out[a.slice(2)] = argv[i + 1]; i++; }
  }
  return out;
}

function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: null, body: text };
  return { fm: m[1], body: m[2] };
}

function readField(fmText, key) {
  if (!fmText) return null;
  const m = fmText.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

function writeFileAtomic(file, data) {
  // Write to a temp file in the same dir, then rename — atomic on POSIX, so a
  // crash / disk-full mid-write can never truncate the real target file. The
  // pid suffix keeps two concurrent runs from racing on the same temp path.
  const tmp = `${file}.${process.pid}.til-tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
}

function ensureIndex() {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
  if (!fs.existsSync(INDEX)) writeFileAtomic(INDEX, INDEX_HEADER + '\n');
}

// --- ensure-recall --------------------------------------------------------

function importLine() {
  if (CONFIG_DIR === path.join(os.homedir(), '.claude')) {
    return '@~/.claude/memory/MEMORY.md';
  }
  return '@' + path.join(MEMORY_DIR, 'MEMORY.md');
}

function blockBody() {
  return [
    BEGIN,
    '## Global developer knowledge',
    '',
    'Cross-project facts and promoted memories. The index below is always loaded;',
    'read a linked file when its hook looks relevant. These are point-in-time claims —',
    'check the Verify line before relying on version/API specifics.',
    '',
    importLine(),
    END,
  ].join('\n');
}

function stripBlocks(text) {
  // Remove every well-matched BEGIN…END span (a BEGIN whose next END is not
  // preceded by another BEGIN), collapsing any number of managed blocks to
  // none. An orphan BEGIN — no END, or another BEGIN opening before this one
  // closes — is left inert so it can never pair with a later block's END and
  // delete the content between them. Returns the healed text and the offset
  // where the first matched block started (or -1 if none), so ensureRecall can
  // refresh in place rather than relocating the surviving block to EOF.
  let out = '';
  let rest = text;
  let offset = -1;
  for (;;) {
    const b = rest.indexOf(BEGIN);
    if (b === -1) { out += rest; break; }
    const e = rest.indexOf(END, b + BEGIN.length);
    const nextB = rest.indexOf(BEGIN, b + BEGIN.length);
    if (e === -1 || (nextB !== -1 && nextB < e)) {
      out += rest.slice(0, b + BEGIN.length);
      rest = rest.slice(b + BEGIN.length);
    } else {
      out += rest.slice(0, b);
      if (offset === -1) offset = out.length;
      rest = rest.slice(e + END.length);
    }
  }
  return { text: out, offset };
}

function spliceBlock(text, at, block) {
  // Insert block at offset `at`, separated from surrounding content by a single
  // blank line, with exactly one trailing newline.
  const before = text.slice(0, at).replace(/\s+$/, '');
  const after = text.slice(at).replace(/^\s+/, '');
  let out = '';
  if (before) out += `${before}\n\n`;
  out += block;
  if (after) out += `\n\n${after}`;
  return `${out.replace(/\n*$/, '')}\n`;
}

function ensureRecall() {
  ensureIndex();
  const existed = fs.existsSync(CLAUDE_MD);
  const original = existed ? fs.readFileSync(CLAUDE_MD, 'utf8') : '';
  const { text: stripped, offset } = stripBlocks(original);
  const at = offset !== -1 ? offset : stripped.length;
  const out = spliceBlock(stripped, at, blockBody());
  const action = offset !== -1 ? 'refreshed' : original.trim() ? 'appended' : 'created';
  writeFileAtomic(CLAUDE_MD, out);
  console.log(`ensure-recall: ${action} managed block in ${CLAUDE_MD}; index at ${INDEX}`);
}

// --- dispatch -------------------------------------------------------------

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);
  switch (cmd) {
    case 'ensure-recall': ensureRecall(); break;
    default:
      console.error(`unknown command: ${cmd ?? '(none)'}`);
      process.exit(1);
  }
}

main();
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`
Expected: PASS — `# pass 9`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
cd /Users/jim/work/skills4hire
git add skills/til/scripts/til-store.mjs skills/til/scripts/til-store.test.mjs
git commit -m "feat(til): til-store helper with idempotent ensure-recall"
```

---

### Task 3: `index-add` command

Upsert a fact's bullet into `MEMORY.md`. Same slug → update the existing bullet in place; new slug → append. Never duplicates.

**Files:**
- Modify: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.mjs` (add `index-add` case + `indexAdd`)
- Test: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs` (append cases)

**Interfaces:**
- Consumes: `ensureIndex`, `INDEX` (Task 2).
- Produces: CLI `node til-store.mjs index-add --name <slug> --title <title> --hook <hook>` → ensures `MEMORY.md` contains exactly one bullet `- [<title>](<slug>.md) — <hook>`. Reused by `promote` in Task 5.

- [ ] **Step 1: Write the failing tests** (append to `til-store.test.mjs`)

```js
test('index-add appends a markdown-link bullet', () => {
  run(['index-add', '--name', 'node-24-native-sqlite',
       '--title', 'Node 24 native SQLite', '--hook', 'built-in node:sqlite, no dependency']);
  const idx = read('memory/MEMORY.md');
  assert.ok(idx.includes('- [Node 24 native SQLite](node-24-native-sqlite.md) — built-in node:sqlite, no dependency'));
});

test('index-add updates the existing bullet for a slug instead of duplicating', () => {
  run(['index-add', '--name', 'foo', '--title', 'Foo', '--hook', 'first hook']);
  run(['index-add', '--name', 'foo', '--title', 'Foo Updated', '--hook', 'second hook']);
  const idx = read('memory/MEMORY.md');
  assert.equal(count(idx, '(foo.md)'), 1, 'exactly one bullet for the slug');
  assert.ok(idx.includes('second hook'), 'hook updated');
  assert.ok(!idx.includes('first hook'), 'old hook gone');
  assert.ok(idx.includes('Foo Updated'), 'title updated');
});

test('index-add creates MEMORY.md with a header if it is missing', () => {
  // No ensure-recall first: MEMORY.md does not exist yet.
  run(['index-add', '--name', 'bar', '--title', 'Bar', '--hook', 'hooky']);
  const idx = read('memory/MEMORY.md');
  assert.match(idx, /^# Global memory index/);
  assert.ok(idx.includes('- [Bar](bar.md) — hooky'));
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`
Expected: FAIL — the three new tests fail because `index-add` is an unknown command (exit 1 → `execFileSync` throws).

- [ ] **Step 3: Add the `indexAdd` function** (insert before `// --- dispatch` in `til-store.mjs`)

```js
// --- index-add ------------------------------------------------------------

function indexAdd({ name, title, hook }) {
  if (!name || !title) { console.error('index-add: --name and --title required'); process.exit(1); }
  ensureIndex();
  const bullet = `- [${title}](${name}.md) — ${hook ?? ''}`.trimEnd();
  const text = fs.readFileSync(INDEX, 'utf8');
  const lines = text.split('\n');
  const linkTarget = `](${name}.md)`;
  const idx = lines.findIndex((l) => l.includes(linkTarget));
  if (idx !== -1) {
    lines[idx] = bullet;
    writeFileAtomic(INDEX, lines.join('\n'));
    console.log(`index-add: updated bullet for ${name}`);
  } else {
    const out = text.replace(/\n*$/, '') + '\n' + bullet + '\n';
    writeFileAtomic(INDEX, out);
    console.log(`index-add: added bullet for ${name}`);
  }
}
```

- [ ] **Step 4: Wire the dispatch** — add this case to the `switch` in `main()`, right after the `ensure-recall` case:

```js
    case 'index-add': indexAdd(flags); break;
```

- [ ] **Step 5: Run to verify all tests pass**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`
Expected: PASS — `# pass 12`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
cd /Users/jim/work/skills4hire
git add skills/til/scripts/til-store.mjs skills/til/scripts/til-store.test.mjs
git commit -m "feat(til): index-add upserts MEMORY.md bullets"
```

---

### Task 4: `list` + `find-dupe` commands (dedup support)

Two read-only lookups the skill uses to avoid duplicate captures: `list` prints every global memory's slug + description (for the model to scan for semantic duplicates); `find-dupe` reports an exact-slug collision.

**Files:**
- Modify: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.mjs` (add two cases + `list`, `findDupe`)
- Test: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs` (append cases)

**Interfaces:**
- Consumes: `MEMORY_DIR`, `INDEX`, `splitFrontmatter`, `readField` (Task 2).
- Produces:
  - CLI `node til-store.mjs list` → one line per fact file (except `MEMORY.md`): `<slug>\t<description>`. Empty output if the store is empty or absent.
  - CLI `node til-store.mjs find-dupe --slug <slug>` → prints the absolute path of `<slug>.md` if it exists, else prints nothing. A **lookup** (match or no-match) exits 0 — a no-match is not an error. A missing required `--slug` is a **usage error** and exits 1, consistent with `index-add`/`promote`.

- [ ] **Step 1: Write the failing tests** (append to `til-store.test.mjs`)

```js
test('list prints slug and description for each memory, skipping MEMORY.md', () => {
  fs.mkdirSync(path.join(dir, 'memory'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'memory', 'MEMORY.md'), '# Global memory index\n');
  fs.writeFileSync(path.join(dir, 'memory', 'a-fact.md'),
    '---\nname: a-fact\ndescription: A described fact.\nmetadata:\n  type: knowledge\n---\nbody\n');
  const out = run(['list']);
  assert.ok(out.includes('a-fact'), 'slug listed');
  assert.ok(out.includes('A described fact.'), 'description listed');
  assert.ok(!out.includes('MEMORY'), 'index file skipped');
});

test('list prints nothing for an empty/absent store', () => {
  const out = run(['list']);
  assert.equal(out.trim(), '');
});

test('find-dupe prints the path on an exact slug match', () => {
  fs.mkdirSync(path.join(dir, 'memory'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'memory', 'dup.md'), '---\nname: dup\n---\nx\n');
  const out = run(['find-dupe', '--slug', 'dup']).trim();
  assert.equal(out, path.join(dir, 'memory', 'dup.md'));
});

test('find-dupe prints nothing and exits 0 when there is no match', () => {
  const out = run(['find-dupe', '--slug', 'nope']);
  assert.equal(out.trim(), '');
});

test('find-dupe treats a missing --slug as a usage error (nonzero exit)', () => {
  // A no-match exits 0, but omitting the required flag is a caller bug and must
  // fail loudly — consistent with index-add/promote — never silently report
  // "no duplicate" (which could let the skill create a dup). Assert the exit
  // code itself: execFileSync's message always contains "Command failed".
  assert.throws(() => run(['find-dupe']), (err) => err.status === 1);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`
Expected: FAIL — the four new tests fail (unknown commands `list` / `find-dupe`).

- [ ] **Step 3: Add the functions** (insert before `// --- dispatch` in `til-store.mjs`)

```js
// --- list & find-dupe -----------------------------------------------------

function list() {
  if (!fs.existsSync(MEMORY_DIR)) return;
  const files = fs.readdirSync(MEMORY_DIR)
    .filter((f) => f.endsWith('.md') && f !== 'MEMORY.md');
  for (const f of files.sort()) {
    const { fm } = splitFrontmatter(fs.readFileSync(path.join(MEMORY_DIR, f), 'utf8'));
    const slug = readField(fm, 'name') || f.replace(/\.md$/, '');
    const desc = readField(fm, 'description') || '';
    console.log(`${slug}\t${desc}`);
  }
}

function findDupe({ slug }) {
  if (!slug) { console.error('find-dupe: --slug required'); process.exit(1); }
  const p = path.join(MEMORY_DIR, `${slug}.md`);
  if (fs.existsSync(p)) console.log(p);
}
```

- [ ] **Step 4: Wire the dispatch** — add these cases to the `switch` in `main()`:

```js
    case 'list': list(); break;
    case 'find-dupe': findDupe(flags); break;
```

- [ ] **Step 5: Run to verify all tests pass**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`
Expected: PASS — `# pass 17`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
cd /Users/jim/work/skills4hire
git add skills/til/scripts/til-store.mjs skills/til/scripts/til-store.test.mjs
git commit -m "feat(til): list and find-dupe for capture dedup"
```

---

### Task 5: `promote` command

Copy a project memory into the global store: add `metadata.promotedFrom` + `metadata.scope: global`, preserve everything else (notably `originSessionId` and body), add the index bullet, and leave the project original untouched.

**Files:**
- Modify: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.mjs` (add `promote` case + `promote`, `upsertMetaField`, `projectSlugFromPath`)
- Test: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs` (append cases)

**Interfaces:**
- Consumes: `MEMORY_DIR`, `ensureIndex`, `splitFrontmatter`, `readField`, `indexAdd` (Tasks 2–3).
- Produces: CLI `node til-store.mjs promote --from <project-memory-file> [--as <slug>]`. Writes `<config>/memory/<slug>.md`, adds the index bullet, prints the target path. Exits 2 (without overwriting) if a *different* global file already occupies the slug.

- [ ] **Step 1: Write the failing tests** (append to `til-store.test.mjs`)

```js
function seedProjectMemory() {
  const projDir = path.join(dir, 'projects', '-Users-jim-work-demo', 'memory');
  fs.mkdirSync(projDir, { recursive: true });
  const file = path.join(projDir, 'flag-parsing.md');
  fs.writeFileSync(file,
    '---\n' +
    'name: flag-parsing\n' +
    'description: How the demo app parses flags.\n' +
    'metadata:\n' +
    '  node_type: memory\n' +
    '  type: project\n' +
    '  originSessionId: sess-123\n' +
    '---\n' +
    'The demo app parses flags with a hand-rolled loop.\n');
  return file;
}

test('promote copies to the global store, mutating metadata and keeping the body', () => {
  const src = seedProjectMemory();
  run(['promote', '--from', src]);
  const g = read('memory/flag-parsing.md');
  assert.ok(g.includes('scope: global'), 'scope set to global');
  assert.ok(g.includes('promotedFrom: -Users-jim-work-demo'), 'promotedFrom derived from path');
  assert.ok(g.includes('originSessionId: sess-123'), 'originSessionId preserved');
  assert.ok(g.includes('hand-rolled loop'), 'body preserved');
});

test('promote leaves the project original untouched and adds an index bullet', () => {
  const src = seedProjectMemory();
  run(['promote', '--from', src]);
  const original = fs.readFileSync(src, 'utf8');
  assert.ok(!original.includes('scope: global'), 'original not mutated');
  assert.ok(read('memory/MEMORY.md').includes('(flag-parsing.md)'), 'index bullet added');
});

test('promote refuses to overwrite a different global file on a slug clash', () => {
  const src = seedProjectMemory();
  fs.mkdirSync(path.join(dir, 'memory'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'memory', 'flag-parsing.md'), 'different content\n');
  // Assert on the exit code itself — execFileSync's error message always
  // contains "Command failed" regardless of code, so a message regex can't
  // distinguish a real exit-2 clash refusal from any other failure.
  assert.throws(() => run(['promote', '--from', src]), (err) => err.status === 2);
  assert.equal(read('memory/flag-parsing.md'), 'different content\n', 'existing file untouched');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`
Expected: FAIL — the three new tests fail (unknown command `promote`).

- [ ] **Step 3: Add the functions** (insert before `// --- dispatch` in `til-store.mjs`)

```js
// --- promote --------------------------------------------------------------

function projectSlugFromPath(p) {
  const norm = p.replace(/\\/g, '/');
  const m = norm.match(/projects\/([^/]+)\/memory\//);
  return m ? m[1] : path.basename(path.dirname(p));
}

function upsertMetaField(fmText, key, value) {
  const lines = fmText.split('\n');
  const metaIdx = lines.findIndex((l) => /^metadata:\s*$/.test(l));
  if (metaIdx === -1) { lines.push('metadata:', `  ${key}: ${value}`); return lines.join('\n'); }
  for (let i = metaIdx + 1; i < lines.length; i++) {
    if (/^\S/.test(lines[i])) break; // left the indented metadata block
    const km = lines[i].match(/^\s+([A-Za-z0-9_]+):/);
    if (km && km[1] === key) { lines[i] = `  ${key}: ${value}`; return lines.join('\n'); }
  }
  lines.splice(metaIdx + 1, 0, `  ${key}: ${value}`);
  return lines.join('\n');
}

function promote({ from, as }) {
  if (!from) { console.error('promote: --from <file> required'); process.exit(1); }
  const srcText = fs.readFileSync(from, 'utf8');
  const { fm, body } = splitFrontmatter(srcText);
  if (fm === null) { console.error('promote: source has no frontmatter'); process.exit(1); }
  const slug = as || readField(fm, 'name') || path.basename(from, '.md');
  const target = path.join(MEMORY_DIR, `${slug}.md`);

  let newFm = upsertMetaField(fm, 'scope', 'global');
  newFm = upsertMetaField(newFm, 'promotedFrom', projectSlugFromPath(from));
  const out = `---\n${newFm}\n---\n${body}`;

  ensureIndex();
  if (fs.existsSync(target)) {
    if (fs.readFileSync(target, 'utf8') === out) {
      console.log(`promote: ${slug} already promoted (no change)`);
      return;
    }
    console.error(`promote: ${target} already exists with different content; pass --as <slug>`);
    process.exit(2);
  }
  writeFileAtomic(target, out);
  indexAdd({ name: slug, title: readField(fm, 'name') || slug, hook: readField(fm, 'description') || '' });
  console.log(`promote: wrote ${target}`);
}
```

- [ ] **Step 4: Wire the dispatch** — add this case to the `switch` in `main()`:

```js
    case 'promote': promote(flags); break;
```

- [ ] **Step 5: Run to verify all tests pass**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.test.mjs`
Expected: PASS — `# pass 20`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
cd /Users/jim/work/skills4hire
git add skills/til/scripts/til-store.mjs skills/til/scripts/til-store.test.mjs
git commit -m "feat(til): promote project memory to the global store"
```

---

### Task 6: `SKILL.md` + end-to-end integration test

Write the prose orchestration and an integration test that drives the exact command sequence the skill documents (proving the helper commands compose into the intended `~/.claude` state). Model judgment isn't unit-testable, so the integration test covers the mechanical path and the skill's prose covers the judgment.

**Files:**
- Create: `/Users/jim/work/skills4hire/skills/til/SKILL.md`
- Test: `/Users/jim/work/skills4hire/skills/til/scripts/til-store.integration.test.mjs`

**Interfaces:**
- Consumes: every `til-store.mjs` command (Tasks 2–5).
- Produces: the user-facing `/til` skill. No new code interfaces.

- [ ] **Step 1: Write the failing integration test**

`/Users/jim/work/skills4hire/skills/til/scripts/til-store.integration.test.mjs`:

```js
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRIPT = new URL('./til-store.mjs', import.meta.url).pathname;
let dir;
beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'til-int-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });
const cli = (args) => execFileSync('node', [SCRIPT, ...args],
  { env: { ...process.env, CLAUDE_CONFIG_DIR: dir }, encoding: 'utf8' });
const read = (p) => fs.readFileSync(path.join(dir, p), 'utf8');

// Mirrors the "/til <fact>" flow documented in SKILL.md: bootstrap recall,
// the model Writes the fact file from the template, then index-add.
test('capture flow: ensure-recall + write fact file + index-add yields a recallable fact', () => {
  cli(['ensure-recall']);
  const factFile = path.join(dir, 'memory', 'node-24-native-sqlite.md');
  fs.writeFileSync(factFile,
    '---\n' +
    'name: node-24-native-sqlite\n' +
    'description: "Node.js ships a built-in SQLite module (node:sqlite), added in Node 24."\n' +
    'metadata:\n' +
    '  node_type: memory\n' +
    '  type: knowledge\n' +
    '  scope: global\n' +
    '  captured: 2026-07-02\n' +
    '  originSessionId: sess-xyz\n' +
    '---\n' +
    'Node.js has a native SQLite interface via the built-in `node:sqlite` module, added in Node 24.\n\n' +
    '**Source:** surfaced in conversation, 2026-07-02 (not independently verified).\n' +
    '**Verify:** confirm the introducing version at nodejs.org/api/sqlite.html.\n');
  cli(['index-add', '--name', 'node-24-native-sqlite',
       '--title', 'Node 24 native SQLite', '--hook', 'built-in node:sqlite, no dependency']);

  // Recall block points at the index; index links the fact; fact carries Verify.
  assert.match(read('CLAUDE.md'), /@~\/\.claude\/memory\/MEMORY\.md|@.*memory\/MEMORY\.md/);
  assert.ok(read('memory/MEMORY.md').includes('(node-24-native-sqlite.md)'));
  assert.ok(read('memory/node-24-native-sqlite.md').includes('**Verify:**'));
});

test('SKILL.md references the helper via CLAUDE_PLUGIN_ROOT and sets disable-model-invocation', () => {
  const skill = fs.readFileSync(new URL('../SKILL.md', import.meta.url).pathname, 'utf8');
  assert.ok(skill.includes('disable-model-invocation: true'), 'user-invoked only');
  assert.ok(skill.includes('${CLAUDE_PLUGIN_ROOT}/skills/til/scripts/til-store.mjs'), 'invokes the helper by plugin-root path');
  assert.ok(skill.includes('type: knowledge'), 'documents the knowledge type');
  assert.ok(skill.includes('**Source:**') && skill.includes('**Verify:**'), 'documents Source/Verify body convention');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.integration.test.mjs`
Expected: FAIL — the second test errors reading `../SKILL.md` (file does not exist yet).

- [ ] **Step 3: Write `SKILL.md`**

`/Users/jim/work/skills4hire/skills/til/SKILL.md`:

````markdown
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
````

- [ ] **Step 4: Run to verify all tests pass**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/til-store.integration.test.mjs`
Expected: PASS — `# pass 2`, `# fail 0`.

- [ ] **Step 5: Full suite + manifest re-validate**

Run: `node --test /Users/jim/work/skills4hire/skills/til/scripts/*.test.mjs` (runs all `*.test.mjs`; use the glob form — the bare-directory form is unreliable in Node 26.4.0)
Expected: PASS — `# pass 22`, `# fail 0`.

Run: `claude plugin validate /Users/jim/work/skills4hire`
Expected: `✔ Validation passed`

- [ ] **Step 6: Manual behavioral smoke (not automated — model judgment)**

Drive the real skill flow once against a throwaway config dir so the live model
path is exercised without touching your real `~/.claude`:

```bash
export CLAUDE_CONFIG_DIR=$(mktemp -d)
# In a Claude Code session with skills4hire loaded (see Task 7 dev-load note),
# run:  /til Node 24 added a built-in node:sqlite module
# Then inspect:
ls "$CLAUDE_CONFIG_DIR/memory" && cat "$CLAUDE_CONFIG_DIR/CLAUDE.md"
unset CLAUDE_CONFIG_DIR
```

Expected: a `node-*-sqlite.md` fact file, a bullet in `MEMORY.md`, and one managed
block in `CLAUDE.md`. (This step confirms judgment + plumbing together; it is a
human check, not a CI gate.)

- [ ] **Step 7: Commit**

```bash
cd /Users/jim/work/skills4hire
git add skills/til/SKILL.md skills/til/scripts/til-store.integration.test.mjs
git commit -m "feat(til): SKILL.md orchestration + end-to-end integration test"
```

---

### Task 7: Register in `m4h-marketplace` + finish README

Add `skills4hire` to the marketplace manifest (mirroring the `agents4hire` entry) and complete the install docs. `skills4hire` has no GitHub remote yet, so creating/pushing that repo is a prerequisite the user performs; this task prepares the entry and validates it.

**Files:**
- Modify: `/Users/jim/work/m4h-marketplace/.claude-plugin/marketplace.json`
- Modify: `/Users/jim/work/skills4hire/README.md`

**Interfaces:**
- Consumes: the validated `skills4hire` plugin (Tasks 1–6).
- Produces: an installable marketplace entry `skills4hire@m4h-marketplace`.

- [ ] **Step 1: Add the marketplace entry** — in `/Users/jim/work/m4h-marketplace/.claude-plugin/marketplace.json`, append to the `plugins` array (after the `agents4hire` object):

```json
    {
      "name": "skills4hire",
      "source": {
        "source": "url",
        "url": "https://github.com/Meyer-For-Hire/skills4hire.git"
      },
      "description": "Skills for capturing and recalling reusable developer knowledge across projects. Includes the /til global-memory skill.",
      "version": "0.1.0",
      "strict": true
    }
```

- [ ] **Step 2: Validate the marketplace manifest**

Run: `claude plugin validate /Users/jim/work/m4h-marketplace`
Expected: `✔ Validation passed` (manifest is well-formed).

- [ ] **Step 3: Fill the README install section** — replace the `<!-- filled in Task 7 -->` placeholder in `/Users/jim/work/skills4hire/README.md` with:

```markdown
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
```

- [ ] **Step 4: Commit both repos**

```bash
cd /Users/jim/work/skills4hire
git add README.md
git commit -m "docs: marketplace install instructions"

cd /Users/jim/work/m4h-marketplace
git add .claude-plugin/marketplace.json
git commit -m "feat: register skills4hire plugin"
```

- [ ] **Step 5: Prerequisites for actual publish (user action, note only)**

Publishing requires the `skills4hire` GitHub repo to exist and be pushed
(`git remote add origin git@github.com:Meyer-For-Hire/skills4hire.git && git push -u origin main`),
and the `m4h-marketplace` commit pushed. Flag this to the user; do not create
remotes or push without their say-so.

---

## Self-Review

**1. Spec coverage** (each design section → task):

- Problem / Goal → whole plan. ✓
- Store layout (`~/.claude/memory/`, `MEMORY.md`, one fact per file) → Task 2 (`ensure-recall`, `ensureIndex`), Task 3 (`index-add`). ✓
- Recall mechanism (managed block, bare `@~/.claude/memory/MEMORY.md`, always-loaded index, ignored-in-fence rule) → Task 2 (`blockBody`, `importLine`, refresh-in-place). ✓
- `knowledge` file format (frontmatter shape, Source/Verify) → Task 6 (`SKILL.md` template) + integration test. ✓
- Flow A `/til <fact>` (derive name/description, dedup, write, index, report) → Task 6 (`SKILL.md`), backed by Tasks 2–4. ✓
- Flow B `/til` no-args (conversation + project candidates) → Task 6 (`SKILL.md`). ✓
- Promotion (copy-not-move, `promotedFrom`, preserve `originSessionId`, offer delete) → Task 5 (`promote`) + Task 6 (offer-delete prose). ✓
- Staleness/verify posture (capture + flag, no block/auto-verify) → Global Constraints + Task 6 prose. ✓
- Bootstrap/idempotency/managed-block-refresh/dedup → Task 2 (idempotency tests), Task 3 (bullet upsert), Task 4 (dedup lookups). ✓
- Repo/distribution (plugin scaffold, marketplace registration) → Task 1, Task 7. ✓
- Verification note (`@import` semantics) → already confirmed in the spec; honored by the bare-import-line design in Task 2. ✓

**2. Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N". The one intentional `<!-- filled in Task 7 -->` marker in the README is created in Task 1 and resolved in Task 7 (Step 3) — not a dangling placeholder. Every code step shows complete code; every command shows expected output.

**3. Type/name consistency:** Command names (`ensure-recall`, `index-add`, `list`, `find-dupe`, `promote`) and flag names (`--name`, `--title`, `--hook`, `--slug`, `--from`, `--as`) are identical across `til-store.mjs`, the tests, `SKILL.md`, and the integration test. Shared helpers (`parseFlags`, `splitFrontmatter`, `readField`, `ensureIndex`, `CONFIG_DIR`/`MEMORY_DIR`/`INDEX`/`CLAUDE_MD`, `BEGIN`/`END`) are defined in Task 2 and reused unchanged. `indexAdd` (Task 3) is reused by `promote` (Task 5) with the same `{name, title, hook}` shape. Test pass-counts accumulate 9 → 12 → 17 → 20 (unit) + 2 (integration) = 22. ✓ (Task 2 hardened during execution: position-preserving in-place refresh, orphan-safe strip-all-blocks dedup, and atomic writes via `writeFileAtomic` — reused by `index-add`/`promote`; +3 edge-case tests. Task 4: `find-dupe` exit semantics clarified — lookups exit 0, a missing `--slug` is a usage error (exit 1) like the sibling commands; +1 test.)
