#!/usr/bin/env node
/**
 * Minimal helper for .blackbox.
 *
 * Usage:
 *   node docs/.blackbox/bin/blackbox.mjs new "Issue title" --domain ui --priority p1
 */
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
// This script lives at: docs/.blackbox/bin/blackbox.mjs
const BLACKBOX_DIR = path.resolve(scriptDir, "..");
const ROOT = path.resolve(BLACKBOX_DIR, "../..");
const RUNS_DIR = path.join(BLACKBOX_DIR, ".runs");
const ACTIVE_RUN_FILE = path.join(RUNS_DIR, "ACTIVE_RUN");
const ISSUE_TEMPLATE_PATH = path.join(
  BLACKBOX_DIR,
  ".agents",
  "selection-planner",
  "templates",
  "issue_plan.md",
);

function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function formatDate(d) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatId(date, seq) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `ISSUE-${yyyy}${mm}${dd}-${String(seq).padStart(4, "0")}`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function listIssueDirs(issuesDir) {
  try {
    const entries = await fs.readdir(issuesDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function nextSequenceForToday(issuesDir, todayIdPrefix) {
  const dirs = await listIssueDirs(issuesDir);
  const todays = dirs
    .filter((d) => d.startsWith(todayIdPrefix))
    .map((d) => d.slice(todayIdPrefix.length))
    .map((rest) => Number(rest.split("_")[0]))
    .filter((n) => Number.isFinite(n));

  const max = todays.length ? Math.max(...todays) : 0;
  return max + 1;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args[key] = value;
    } else {
      args._.push(a);
    }
  }
  return args;
}

async function readActiveRunId() {
  try {
    const raw = await fs.readFile(ACTIVE_RUN_FILE, "utf8");
    const runId = raw.trim();
    if (!runId) return null;
    return runId;
  } catch {
    return null;
  }
}

async function resolveIssuesDir(runId) {
  const runDir = path.join(RUNS_DIR, runId);
  const issuesDir = path.join(runDir, "issues");
  await ensureDir(issuesDir);
  return issuesDir;
}

async function cmdNew(title, { domain = "other", priority = "p2", owner = "unassigned" }) {
  if (!title || !title.trim()) {
    throw new Error("Missing title. Example: node .blackbox/bin/blackbox.mjs new \"Fix login redirect\"");
  }

  const now = new Date();
  const dateStr = formatDate(now);
  const activeRunId = await readActiveRunId();
  if (!activeRunId) {
    throw new Error(
      `No active run set. Create a run folder under ${path.relative(ROOT, RUNS_DIR)}/ and set ${path.relative(
        ROOT,
        ACTIVE_RUN_FILE,
      )} to its folder name.`,
    );
  }

  const idPrefix = `ISSUE-${dateStr.replaceAll("-", "")}-`;
  const issuesDir = await resolveIssuesDir(activeRunId);
  const seq = await nextSequenceForToday(issuesDir, idPrefix);
  const issueId = formatId(now, seq);
  const folderName = `${issueId}_${slugify(title) || "issue"}`;
  const issueDir = path.join(issuesDir, folderName);

  await ensureDir(issueDir);

  const template = await fs.readFile(ISSUE_TEMPLATE_PATH, "utf8");
  const seeded = template
    .replace(/id: ISSUE-YYYYMMDD-0001/g, `id: ${issueId}`)
    .replace(/title: \"<short, specific title>\"/g, `title: "${title.replaceAll('"', '\\"')}"`)
    .replace(/status: inbox/g, "status: inbox")
    .replace(/domain: \"<supabase\|auth\|ui\|integrations\|build\|mobile\|tauri\|other>\"/g, `domain: "${domain}"`)
    .replace(/priority: \"<p0\|p1\|p2\|p3>\"/g, `priority: "${priority}"`)
    .replace(/owner: \"<agent_or_human>\"/g, `owner: "${owner}"`)
    .replace(/created_at: \"<YYYY-MM-DD>\"/g, `created_at: "${dateStr}"`)
    .replace(/updated_at: \"<YYYY-MM-DD>\"/g, `updated_at: "${dateStr}"`);

  await fs.writeFile(path.join(issueDir, "plan.md"), seeded, "utf8");

  // Optional scratch area for logs/screenshots references (kept empty by default)
  await fs.writeFile(path.join(issueDir, "context.md"), `# Context for ${issueId}\n\n`, "utf8");

  process.stdout.write(`${path.relative(ROOT, issueDir)}\n`);
}

async function main() {
  const [, , command, ...rest] = process.argv;
  const args = parseArgs(rest);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    process.stdout.write(
      [
        "blackbox helper",
        "",
        "Commands:",
        "  new <title> [--domain <domain>] [--priority <p0|p1|p2|p3>] [--owner <name>]",
        "",
        "Examples:",
        "  node docs/.blackbox/bin/blackbox.mjs new \"Fix profile save button\" --domain ui --priority p1",
        "",
      ].join("\n"),
    );
    return;
  }

  if (command === "new") {
    const title = args._.join(" ").trim();
    await cmdNew(title, {
      domain: typeof args.domain === "string" ? args.domain : "other",
      priority: typeof args.priority === "string" ? args.priority : "p2",
      owner: typeof args.owner === "string" ? args.owner : "unassigned",
    });
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err?.message || err) + "\n");
  process.exit(1);
});
