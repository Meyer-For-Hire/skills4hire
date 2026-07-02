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

function ensureIndex() {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
  if (!fs.existsSync(INDEX)) fs.writeFileSync(INDEX, INDEX_HEADER + '\n');
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

function ensureRecall() {
  ensureIndex();
  const existed = fs.existsSync(CLAUDE_MD);
  const text = existed ? fs.readFileSync(CLAUDE_MD, 'utf8') : '';
  const b = text.indexOf(BEGIN);
  const e = text.indexOf(END);
  let out;
  let action;
  if (b !== -1 && e !== -1 && e > b) {
    out = text.slice(0, b) + blockBody() + text.slice(e + END.length);
    action = 'refreshed';
  } else if (text.length) {
    out = text.replace(/\n*$/, '') + '\n\n' + blockBody() + '\n';
    action = 'appended';
  } else {
    out = blockBody() + '\n';
    action = 'created';
  }
  fs.writeFileSync(CLAUDE_MD, out);
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
