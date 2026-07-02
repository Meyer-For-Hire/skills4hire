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
