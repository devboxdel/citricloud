#!/usr/bin/env node
// Auto logs generator: scans markdown summaries updated in the last 24h
// and appends categorized entries to public/logs.json.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_LOGS = path.join(ROOT, 'public', 'logs.json');
const WORKSPACE_ROOT = path.resolve(ROOT, '..');

const CATEGORY_MAP = [
  { type: 'feature', keywords: ['feature', 'added', 'new', 'introduce', 'launch'] },
  { type: 'fix', keywords: ['fix', 'bug', 'resolve', 'patch', 'error'] },
  { type: 'improvement', keywords: ['improve', 'better', 'refine', 'polish', 'ux', 'ui'] },
  { type: 'update', keywords: ['update', 'upgrade', 'bump', 'release', 'deploy', 'build'] },
  { type: 'change', keywords: ['change', 'modify', 'adjust', 'tweak', 'rename'] },
  { type: 'deleted', keywords: ['remove', 'deleted', 'deprecate', 'drop'] },
  { type: 'optimized', keywords: ['optimize', 'optimized', 'performance', 'speed', 'cache'] },
];

function readJsonSafe(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function collectRecentMarkdownEntries(hours = 24) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const mdFiles = fs.readdirSync(WORKSPACE_ROOT)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(WORKSPACE_ROOT, f));

  const entries = [];
  for (const file of mdFiles) {
    const stat = fs.statSync(file);
    if (stat.mtimeMs < cutoff) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    const title = path.basename(file);

    // Determine type by keyword heuristics across the file
    const lowerAll = content.toLowerCase();
    let type = 'update';
    for (const cat of CATEGORY_MAP) {
      if (cat.keywords.some(k => lowerAll.includes(k))) { type = cat.type; break; }
    }

    // Gather up to 10 bullet-like lines as details
    const details = lines
      .filter(l => l.match(/^[-*•✅✨🔧📱📝]/))
      .slice(0, 10);

    const now = new Date();
    entries.push({
      date: now.toISOString().slice(0,10),
      time: now.toTimeString().slice(0,5),
      type,
      title: `Auto: ${title}`,
      description: `Auto-imported updates from ${title}`,
      details,
    });
  }
  return entries;
}

function main() {
  const logs = readJsonSafe(PUBLIC_LOGS, { logs: [] });
  const newEntries = collectRecentMarkdownEntries(24);
  if (newEntries.length === 0) {
    console.log('No recent markdown updates found.');
    return;
  }

  // Avoid duplicates: don't add identical title+time combos
  const existingKeys = new Set(logs.logs.map(l => `${l.title}|${l.date}|${l.time}`));
  const deduped = newEntries.filter(e => !existingKeys.has(`${e.title}|${e.date}|${e.time}`));
  if (deduped.length === 0) {
    console.log('No new entries after deduping.');
    return;
  }

  logs.logs = [...deduped, ...logs.logs].slice(0, 500); // keep last 500
  writeJson(PUBLIC_LOGS, logs);
  console.log(`Added ${deduped.length} auto log entries.`);
}

main();
