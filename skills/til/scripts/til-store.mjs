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

// --- dispatch -------------------------------------------------------------

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);
  switch (cmd) {
    case 'ensure-recall': ensureRecall(); break;
    case 'index-add': indexAdd(flags); break;
    case 'list': list(); break;
    case 'find-dupe': findDupe(flags); break;
    default:
      console.error(`unknown command: ${cmd ?? '(none)'}`);
      process.exit(1);
  }
}

main();
