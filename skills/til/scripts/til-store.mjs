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
  // crash / disk-full mid-write can never truncate the real target file.
  const tmp = `${file}.til-tmp`;
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
  // Remove every complete BEGIN…END span (handles 0, 1, or many pairs), so a
  // file that somehow accrued duplicate managed blocks heals to exactly one.
  // Orphan markers (a BEGIN with no matching END) are left untouched — this
  // tool never produces them, and dropping to EOF could destroy user content.
  let out = text;
  for (;;) {
    const b = out.indexOf(BEGIN);
    if (b === -1) break;
    const e = out.indexOf(END, b);
    if (e === -1) break;
    out = out.slice(0, b) + out.slice(e + END.length);
  }
  return out;
}

function ensureRecall() {
  ensureIndex();
  const existed = fs.existsSync(CLAUDE_MD);
  const original = existed ? fs.readFileSync(CLAUDE_MD, 'utf8') : '';
  const had = original.includes(BEGIN);
  const stripped = stripBlocks(original).replace(/\n+$/, '');
  const out = stripped.length ? `${stripped}\n\n${blockBody()}\n` : `${blockBody()}\n`;
  writeFileAtomic(CLAUDE_MD, out);
  const action = had ? 'refreshed' : existed ? 'appended' : 'created';
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
