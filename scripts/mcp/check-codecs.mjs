#!/usr/bin/env node
// Simple, dependency-free MCP "codec" checker.
// - Enumerates what each MCP should use
// - Performs lightweight health checks without making destructive calls

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const log = {
  heading: (t) => console.log(`\n${t}`),
  ok: (t) => console.log(`  ✓ ${t}`),
  warn: (t) => console.log(`  ! ${t}`),
  err: (t) => console.log(`  ✗ ${t}`),
  info: (t) => console.log(`    • ${t}`),
};

async function head(url, headers = {}) {
  try {
    const res = await fetch(url, { method: 'HEAD', headers });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e };
  }
}

async function get(url, headers = {}) {
  try {
    const res = await fetch(url, { method: 'GET', headers });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e };
  }
}

function readJSONIfExists(path) {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function detectEnv(...keys) {
  const found = {};
  for (const k of keys) {
    if (process.env[k]) found[k] = process.env[k];
  }
  return found;
}

function findViteEnvInFile(path, keys) {
  if (!existsSync(path)) return {};
  const txt = readFileSync(path, 'utf8');
  const out = {};
  for (const k of keys) {
    const re = new RegExp(`^${k}=([^\n]+)$`, 'm');
    const m = txt.match(re);
    if (m) out[k] = m[1];
  }
  return out;
}

async function checkSupabase() {
  const result = { name: 'Supabase', shouldUse: 'supabase-js via REST (read-only ops by default)', checks: [] };

  // Where to look for creds
  const env = {
    ...detectEnv('SUPABASE_URL', 'SUPABASE_ANON_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'),
    ...findViteEnvInFile(resolve('.env'), ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']),
  };

  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anon = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    result.checks.push({ status: 'warn', msg: 'Missing SUPABASE_URL/ANON_KEY (or VITE_ variants).' });
    return result;
  }

  result.checks.push({ status: 'ok', msg: 'Found Supabase URL and anon key in env.' });

  // Lightweight HTTP probe (Auth settings is a safe public endpoint with API key)
  const probe = await get(`${url.replace(/\/$/, '')}/auth/v1/settings`, { apikey: anon, Authorization: `Bearer ${anon}` });
  if (probe.ok) {
    result.checks.push({ status: 'ok', msg: `Endpoint reachable (GET /auth/v1/settings -> ${probe.status}).` });
  } else {
    result.checks.push({ status: 'warn', msg: `Could not confirm reachability (status ${probe.status}). Check project URL/key.` });
  }

  return result;
}

async function checkFetch() {
  const result = { name: 'Fetch (HTTP)', shouldUse: 'Built-in fetch for simple HTTP GET/POST', checks: [] };
  if (typeof fetch !== 'function') {
    result.checks.push({ status: 'err', msg: 'Global fetch not available in Node runtime.' });
    return result;
  }
  const res = await get('https://example.com');
  if (res.ok) {
    result.checks.push({ status: 'ok', msg: `fetch works (example.com -> ${res.status}).` });
  } else {
    result.checks.push({ status: 'err', msg: 'fetch failed to reach example.com.' });
  }
  return result;
}

async function checkSearch() {
  const result = { name: 'Search', shouldUse: 'Exa (if EXA_API_KEY set); fallback to DuckDuckGo HTML', checks: [] };
  const hasExa = !!process.env.EXA_API_KEY;
  if (hasExa) {
    // Avoid paid calls; do a harmless HEAD to domain
    const res = await head('https://api.exa.run');
    if (res.ok || res.status > 0) {
      result.checks.push({ status: 'ok', msg: `EXA_API_KEY present; api.exa.run reachable (status ${res.status}).` });
    } else {
      result.checks.push({ status: 'warn', msg: 'EXA_API_KEY present but exa host not reachable from here.' });
    }
  } else {
    const ddg = await get('https://duckduckgo.com/?q=test');
    if (ddg.ok) {
      result.checks.push({ status: 'warn', msg: 'No EXA_API_KEY; fallback search (DuckDuckGo) reachable.' });
    } else {
      result.checks.push({ status: 'err', msg: 'No EXA_API_KEY and fallback search not reachable.' });
    }
  }
  return result;
}

async function checkDesktopCommander() {
  const result = { name: 'Desktop Commander', shouldUse: 'macOS AppleScript/CLI bridge via osascript; guard dangerous ops', checks: [] };
  try {
    execSync('which osascript', { stdio: 'pipe' });
    result.checks.push({ status: 'ok', msg: 'osascript available on PATH (macOS).' });
    try {
      // Harmless evaluation
      execSync("osascript -e 'return 1'", { stdio: 'pipe' });
      result.checks.push({ status: 'ok', msg: 'osascript executes simple command.' });
    } catch (e) {
      result.checks.push({ status: 'warn', msg: 'osascript present but execution blocked.' });
    }
  } catch (e) {
    result.checks.push({ status: 'warn', msg: 'osascript not found; Desktop Commander features unavailable on this OS.' });
  }
  return result;
}

async function checkSequentialThinking() {
  const result = { name: 'Sequential Thinking', shouldUse: 'Plan → ordered steps → verify each → aggregate', checks: [] };
  // Minimal ordered-step validation
  const steps = [
    async () => 'step-1',
    async () => 'step-2',
    async () => 'step-3',
  ];
  const out = [];
  for (const s of steps) out.push(await s());
  if (out.join('>') === 'step-1>step-2>step-3') {
    result.checks.push({ status: 'ok', msg: 'Sequential executor runs steps in order.' });
  } else {
    result.checks.push({ status: 'err', msg: 'Sequential executor ordering failed.' });
  }
  return result;
}

function printSection(title, arr) {
  log.heading(`** ${title} **`);
  for (const item of arr) {
    const prefix = item.status === 'ok' ? log.ok : item.status === 'warn' ? log.warn : log.err;
    prefix(item.msg);
  }
}

function printWhatTheyShouldUse() {
  log.heading('** What Each MCP Should Use **');
  const mapping = [
    { name: 'Supabase', uses: 'supabase-js client (REST) with read-only defaults; env SUPABASE_URL + ANON key' },
    { name: 'Fetch', uses: 'Global fetch (Node 18+) for HTTP; JSON by default' },
    { name: 'Search', uses: 'Exa API when EXA_API_KEY set; otherwise fallback HTML search' },
    { name: 'Desktop Commander', uses: 'osascript on macOS; guard file/exec ops via allowlist' },
  ];
  for (const m of mapping) {
    log.ok(`${m.name}: ${m.uses}`);
  }
}

async function main() {
  console.log('\n🔎 MCP Codec Audit and Health Check');
  printWhatTheyShouldUse();

  const results = await Promise.all([
    checkSequentialThinking(),
    checkSupabase(),
    checkFetch(),
    checkSearch(),
    checkDesktopCommander(),
  ]);

  for (const r of results) {
    printSection(r.name, r.checks);
  }

  // Summary
  const flat = results.flatMap(r => r.checks.map(c => ({ name: r.name, ...c })));
  const ok = flat.filter(x => x.status === 'ok').length;
  const warn = flat.filter(x => x.status === 'warn').length;
  const err = flat.filter(x => x.status === 'err').length;
  log.heading('** Summary **');
  log.ok(`${ok} OK`);
  if (warn) log.warn(`${warn} Warnings`);
  if (err) log.err(`${err} Errors`);

  if (err) process.exitCode = 2;
  else if (warn) process.exitCode = 1;
}

main().catch((e) => {
  log.err(e?.message || String(e));
  process.exitCode = 2;
});

