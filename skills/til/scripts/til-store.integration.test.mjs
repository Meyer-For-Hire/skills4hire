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
