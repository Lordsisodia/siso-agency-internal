#!/usr/bin/env bash
set -euo pipefail

# OSS discovery cycle:
# - Create a new run folder (plan + artifacts)
# - Run GitHub search (live) using the query bank
# - Save a repo tranche list (owner/repo)
# - Fetch metadata + generate entry stubs
# - Generate triage + shortlist reports
#
# Run from repo root:
#   ./docs/.blackbox/4-scripts/start-oss-discovery-cycle.sh
# Or from within docs/:
#   ./.blackbox/4-scripts/start-oss-discovery-cycle.sh

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
docs_root="$(cd "$here/../.." && pwd)"

if [[ ! -d "$docs_root/.blackbox" ]]; then
  echo "ERROR: Could not locate docs/.blackbox from: $here" >&2
  exit 1
fi

usage() {
  cat <<'EOF' >&2
Usage:
  start-oss-discovery-cycle.sh [--queries-md <path>] [--feature-map <path>] [--max-repos <n>] [--tranche-name <name>] \
    [--no-derived-queries] \
    [--max-queries-per-group <n>] [--max-total-queries <n>] [--min-stars <n>] [--include-forks] [--include-archived] \
    [--exclude-keywords "<csv>"] [--exclude-regex "<re>"] [--no-rotate] [--state-file <path>] [--no-gap-boost] \
    [--gap-boost-max-total-queries <n>] [--gap-boost-min-count <n>] [--gap-boost-min-stars <n>] [--gap-boost-min-stars-relaxed <n>] \
    [--gap-boost-relax-excludes] [--no-auto-tune] [--no-prefer-new] [--prefer-new-no-fallback] [--catalog-file <path>] \
    [--curation-file <path>] [--prefer-new-keep-statuses "<csv>"] \
    [--no-catalog-gap-boost] [--catalog-gap-min-tranche-repos <n>] [--catalog-gap-max-total-queries <n>] [--catalog-gap-min-stars-relaxed <n>] \
    [--no-coverage-quota-boost] [--coverage-quota-min-count <n>] [--coverage-quota-max-total-queries <n>] [--coverage-quota-min-stars-relaxed <n>] \
    [--print-settings]

Defaults:
  --queries-md   docs/.blackbox/snippets/research/github-search-queries.md
  --feature-map  docs/05-planning/research/competitor-feature-map.md
  --max-repos    75
  --tranche-name tranche-001
  --max-queries-per-group 4
  --max-total-queries     40
  --min-stars            50

Notes:
  - For best results, set a GitHub token (avoids search API rate limiting):
      export GITHUB_TOKEN="..."
  - Use `--no-derived-queries` for lane-specific runs where you want *only* `--queries-md` (avoids feature-map “bridge query” pollution).
  - This script does NOT clone repos; it catalogs metadata + entry stubs.
EOF
}

config_file="$docs_root/.blackbox/agents/oss-discovery/config.yaml"

queries_md="$docs_root/.blackbox/snippets/research/github-search-queries.md"
feature_map="$docs_root/05-planning/research/competitor-feature-map.md"
max_repos=75
tranche_name="tranche-001"
max_queries_per_group=4
max_total_queries=40
min_stars=50
include_forks=false
include_archived=false
exclude_keywords=""
exclude_regex=""
enable_query_rotation=true
state_file="$docs_root/.blackbox/.local/oss-discovery-state.json"
enable_gap_boost=true
gap_boost_min_count=1
gap_boost_max_total_queries=8
gap_boost_retry_on_empty=true
gap_boost_min_stars_override=""
gap_boost_min_stars_relaxed=50
gap_boost_relax_excludes_on_empty=false
enable_auto_tune=true
auto_tune_threshold_failures=2
auto_tune_max_total_queries=4
auto_tune_max_repos=25
prefer_new_repos=true
prefer_new_fallback_to_seen=true
catalog_file="$docs_root/.blackbox/oss-catalog/catalog.json"
curation_file="$docs_root/.blackbox/oss-catalog/curation.json"
prefer_new_keep_curated_statuses="adopt,poc,deepen"
enable_catalog_gap_boost=true
catalog_gap_boost_min_tranche_repos=12
catalog_gap_boost_max_total_queries=6
catalog_gap_boost_min_stars_relaxed=25
catalog_gap_boost_max_tags_per_run=3
catalog_gap_boost_avoid_recent_tags=true
enable_coverage_quota_boost=true
coverage_quota_min_count_per_tag=2
coverage_quota_max_total_queries=6
coverage_quota_min_stars_relaxed=25
coverage_quota_max_tags_per_run=3
coverage_quota_rotate_tags=true
coverage_quota_avoid_recent_tags=true
gap_tag_recent_window=10
enable_derived_queries=true

user_set_max_total_queries=false
user_set_max_repos=false
print_settings=false

is_true() {
  local raw="${1:-}"
  local v
  v="$(echo "$raw" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
  case "$v" in
    true|1|yes|y|on) return 0 ;;
    *) return 1 ;;
  esac
}

apply_prefer_new_filter() {
  local list_path="$1"

  original_repo_line_count="$(awk 'NF && $0 !~ /^#/' "$list_path" 2>/dev/null | wc -l | tr -d ' ')"
  filtered_repo_line_count="$original_repo_line_count"
  prefer_new_applied=false
  prefer_new_used_fallback=false
  prefer_new_removed_seen_count=0
  prefer_new_kept_curated_count=0

  if is_true "$prefer_new_repos" && [[ -f "$catalog_file" ]]; then
    filtered_tmp="${list_path}.prefer-new.tmp"
    prefer_new_stats="$(
      python3 - "$list_path" "$catalog_file" "$curation_file" "$prefer_new_keep_curated_statuses" "$filtered_tmp" <<'PY' 2>/dev/null || true
import json
import sys

repo_list_path = sys.argv[1]
catalog_path = sys.argv[2]
curation_path = sys.argv[3]
keep_statuses_csv = sys.argv[4]
out_path = sys.argv[5]

try:
  catalog = json.load(open(catalog_path, "r", encoding="utf-8"))
except Exception:
  catalog = {}

seen = set()
repos = catalog.get("repos", [])
if isinstance(repos, list):
  for r in repos:
    if isinstance(r, dict) and isinstance(r.get("full_name"), str):
      seen.add(r["full_name"])

keep_statuses = {s.strip() for s in (keep_statuses_csv or "").split(",") if s.strip()}
curated_keep = set()
try:
  cur = json.load(open(curation_path, "r", encoding="utf-8"))
except Exception:
  cur = {}
items = cur.get("items", [])
if isinstance(items, list) and keep_statuses:
  for it in items:
    if not isinstance(it, dict):
      continue
    fn = it.get("full_name")
    st = it.get("status")
    if isinstance(fn, str) and isinstance(st, str) and st in keep_statuses:
      curated_keep.add(fn.strip())

lines = open(repo_list_path, "r", encoding="utf-8", errors="ignore").read().splitlines()
out_lines = []
removed_seen = 0
kept_curated = 0
for line in lines:
  if line.strip().startswith("#") or not line.strip():
    out_lines.append(line)
    continue
  name = line.strip()
  if name in curated_keep:
    out_lines.append(line)
    kept_curated += 1
    continue
  if name not in seen:
    out_lines.append(line)
  else:
    removed_seen += 1

open(out_path, "w", encoding="utf-8").write("\n".join(out_lines).rstrip() + "\n")
print(f"removed_seen={removed_seen} kept_curated={kept_curated}")
PY
    )"

    if [[ -f "$filtered_tmp" ]]; then
      prefer_new_removed_seen_count="$(echo "$prefer_new_stats" | tr ' ' '\n' | sed -n 's/^removed_seen=//p' | tail -n 1 || echo "0")"
      prefer_new_kept_curated_count="$(echo "$prefer_new_stats" | tr ' ' '\n' | sed -n 's/^kept_curated=//p' | tail -n 1 || echo "0")"
      if ! [[ "$prefer_new_removed_seen_count" =~ ^[0-9]+$ ]]; then prefer_new_removed_seen_count=0; fi
      if ! [[ "$prefer_new_kept_curated_count" =~ ^[0-9]+$ ]]; then prefer_new_kept_curated_count=0; fi
      filtered_repo_line_count="$(awk 'NF && $0 !~ /^#/' "$filtered_tmp" 2>/dev/null | wc -l | tr -d ' ')"
      if [[ "$filtered_repo_line_count" == "0" ]] && is_true "$prefer_new_fallback_to_seen"; then
        echo "WARN: prefer-new removed all repos (already seen in catalog); keeping original tranche list." >&2
        rm -f "$filtered_tmp" || true
        prefer_new_used_fallback=true
      else
        mv "$filtered_tmp" "$list_path"
        prefer_new_applied=true
      fi
    fi
  fi

  repo_line_count="$(awk 'NF && $0 !~ /^#/' "$list_path" 2>/dev/null | wc -l | tr -d ' ')"
}

read_cfg_value() {
  local key="$1"
  local file="$2"
  if [[ ! -f "$file" ]]; then
    return 1
  fi
  # Expect: key: "value"   OR key: value
  # - ignores comments and whitespace
  local line
  line="$(grep -E "^[[:space:]]*${key}[[:space:]]*:" "$file" 2>/dev/null | head -n 1 || true)"
  if [[ -z "$line" ]]; then
    return 1
  fi
  local val
  val="$(echo "$line" | sed -E "s/^[[:space:]]*${key}[[:space:]]*:[[:space:]]*//" | sed -E 's/[[:space:]]+#.*$//')"
  val="$(echo "$val" | sed -E 's/^"(.*)"$/\1/' | sed -E "s/^'(.*)'$/\1/")"
  val="$(echo "$val" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
  echo "$val"
}

if [[ -f "$config_file" ]]; then
  cfg_queries="$(read_cfg_value "queries_md" "$config_file" || true)"
  cfg_feature_map="$(read_cfg_value "feature_map" "$config_file" || true)"
  cfg_max_repos="$(read_cfg_value "max_repos" "$config_file" || true)"
  cfg_max_qpg="$(read_cfg_value "max_queries_per_group" "$config_file" || true)"
  cfg_max_total="$(read_cfg_value "max_total_queries" "$config_file" || true)"
  cfg_min_stars="$(read_cfg_value "min_stars" "$config_file" || true)"
  cfg_inc_forks="$(read_cfg_value "include_forks" "$config_file" || true)"
  cfg_inc_archived="$(read_cfg_value "include_archived" "$config_file" || true)"
  cfg_ex_keywords="$(read_cfg_value "exclude_keywords" "$config_file" || true)"
  cfg_ex_regex="$(read_cfg_value "exclude_regex" "$config_file" || true)"
  cfg_rotate="$(read_cfg_value "enable_query_rotation" "$config_file" || true)"
  cfg_state_file="$(read_cfg_value "state_file" "$config_file" || true)"
  cfg_gap_boost="$(read_cfg_value "enable_gap_boost" "$config_file" || true)"
  cfg_gap_min="$(read_cfg_value "gap_boost_min_count" "$config_file" || true)"
  cfg_gap_max="$(read_cfg_value "gap_boost_max_total_queries" "$config_file" || true)"
  cfg_gap_retry="$(read_cfg_value "gap_boost_retry_on_empty" "$config_file" || true)"
  cfg_gap_min_stars="$(read_cfg_value "gap_boost_min_stars_override" "$config_file" || true)"
  cfg_gap_min_stars_relaxed="$(read_cfg_value "gap_boost_min_stars_relaxed" "$config_file" || true)"
  cfg_gap_relax_excludes="$(read_cfg_value "gap_boost_relax_excludes_on_empty" "$config_file" || true)"
  cfg_auto_tune="$(read_cfg_value "enable_auto_tune" "$config_file" || true)"
  cfg_auto_tune_threshold="$(read_cfg_value "auto_tune_threshold_failures" "$config_file" || true)"
  cfg_auto_tune_mq="$(read_cfg_value "auto_tune_max_total_queries" "$config_file" || true)"
  cfg_auto_tune_mr="$(read_cfg_value "auto_tune_max_repos" "$config_file" || true)"
  cfg_prefer_new="$(read_cfg_value "prefer_new_repos" "$config_file" || true)"
  cfg_prefer_new_fallback="$(read_cfg_value "prefer_new_fallback_to_seen" "$config_file" || true)"
  cfg_catalog_file="$(read_cfg_value "catalog_file" "$config_file" || true)"
  cfg_curation_file="$(read_cfg_value "curation_file" "$config_file" || true)"
  cfg_prefer_new_keep_statuses="$(read_cfg_value "prefer_new_keep_curated_statuses" "$config_file" || true)"
  cfg_catalog_gap_boost="$(read_cfg_value "enable_catalog_gap_boost" "$config_file" || true)"
  cfg_catalog_gap_min="$(read_cfg_value "catalog_gap_boost_min_tranche_repos" "$config_file" || true)"
  cfg_catalog_gap_max="$(read_cfg_value "catalog_gap_boost_max_total_queries" "$config_file" || true)"
  cfg_catalog_gap_relaxed="$(read_cfg_value "catalog_gap_boost_min_stars_relaxed" "$config_file" || true)"
  cfg_catalog_gap_max_tags="$(read_cfg_value "catalog_gap_boost_max_tags_per_run" "$config_file" || true)"
  cfg_catalog_gap_avoid_recent="$(read_cfg_value "catalog_gap_boost_avoid_recent_tags" "$config_file" || true)"
  cfg_quota_boost="$(read_cfg_value "enable_coverage_quota_boost" "$config_file" || true)"
  cfg_quota_min="$(read_cfg_value "coverage_quota_min_count_per_tag" "$config_file" || true)"
  cfg_quota_max="$(read_cfg_value "coverage_quota_max_total_queries" "$config_file" || true)"
  cfg_quota_relaxed="$(read_cfg_value "coverage_quota_min_stars_relaxed" "$config_file" || true)"
  cfg_quota_max_tags="$(read_cfg_value "coverage_quota_max_tags_per_run" "$config_file" || true)"
  cfg_quota_rotate="$(read_cfg_value "coverage_quota_rotate_tags" "$config_file" || true)"
  cfg_quota_avoid_recent="$(read_cfg_value "coverage_quota_avoid_recent_tags" "$config_file" || true)"
  cfg_gap_recent_window="$(read_cfg_value "gap_tag_recent_window" "$config_file" || true)"

  if [[ -n "$cfg_queries" ]]; then
    queries_md="$docs_root/$cfg_queries"
  fi
  if [[ -n "$cfg_feature_map" ]]; then
    feature_map="$docs_root/$cfg_feature_map"
  fi
  if [[ -n "$cfg_max_repos" ]]; then
    max_repos="$cfg_max_repos"
  fi
  if [[ -n "$cfg_max_qpg" ]]; then
    max_queries_per_group="$cfg_max_qpg"
  fi
  if [[ -n "$cfg_max_total" ]]; then
    max_total_queries="$cfg_max_total"
  fi
  if [[ -n "$cfg_min_stars" ]]; then
    min_stars="$cfg_min_stars"
  fi
  if [[ -n "$cfg_inc_forks" ]]; then
    include_forks="$cfg_inc_forks"
  fi
  if [[ -n "$cfg_inc_archived" ]]; then
    include_archived="$cfg_inc_archived"
  fi
  if [[ -n "$cfg_ex_keywords" ]]; then
    exclude_keywords="$cfg_ex_keywords"
  fi
  if [[ -n "$cfg_ex_regex" ]]; then
    exclude_regex="$cfg_ex_regex"
  fi
  if [[ -n "$cfg_rotate" ]]; then
    enable_query_rotation="$cfg_rotate"
  fi
  if [[ -n "$cfg_state_file" ]]; then
    state_file="$docs_root/$cfg_state_file"
  fi
  if [[ -n "$cfg_gap_boost" ]]; then
    enable_gap_boost="$cfg_gap_boost"
  fi
  if [[ -n "$cfg_gap_min" ]]; then
    gap_boost_min_count="$cfg_gap_min"
  fi
  if [[ -n "$cfg_gap_max" ]]; then
    gap_boost_max_total_queries="$cfg_gap_max"
  fi
  if [[ -n "$cfg_gap_retry" ]]; then
    gap_boost_retry_on_empty="$cfg_gap_retry"
  fi
  if [[ -n "$cfg_gap_min_stars" ]]; then
    gap_boost_min_stars_override="$cfg_gap_min_stars"
  fi
  if [[ -n "$cfg_gap_min_stars_relaxed" ]]; then
    gap_boost_min_stars_relaxed="$cfg_gap_min_stars_relaxed"
  fi
  if [[ -n "$cfg_gap_relax_excludes" ]]; then
    gap_boost_relax_excludes_on_empty="$cfg_gap_relax_excludes"
  fi
  if [[ -n "$cfg_auto_tune" ]]; then
    enable_auto_tune="$cfg_auto_tune"
  fi
  if [[ -n "$cfg_auto_tune_threshold" ]]; then
    auto_tune_threshold_failures="$cfg_auto_tune_threshold"
  fi
  if [[ -n "$cfg_auto_tune_mq" ]]; then
    auto_tune_max_total_queries="$cfg_auto_tune_mq"
  fi
  if [[ -n "$cfg_auto_tune_mr" ]]; then
    auto_tune_max_repos="$cfg_auto_tune_mr"
  fi
  if [[ -n "$cfg_prefer_new" ]]; then
    prefer_new_repos="$cfg_prefer_new"
  fi
  if [[ -n "$cfg_prefer_new_fallback" ]]; then
    prefer_new_fallback_to_seen="$cfg_prefer_new_fallback"
  fi
  if [[ -n "$cfg_catalog_file" ]]; then
    catalog_file="$docs_root/$cfg_catalog_file"
  fi
  if [[ -n "$cfg_curation_file" ]]; then
    curation_file="$docs_root/$cfg_curation_file"
  fi
  if [[ -n "$cfg_prefer_new_keep_statuses" ]]; then
    prefer_new_keep_curated_statuses="$cfg_prefer_new_keep_statuses"
  fi
  if [[ -n "$cfg_catalog_gap_boost" ]]; then
    enable_catalog_gap_boost="$cfg_catalog_gap_boost"
  fi
  if [[ -n "$cfg_catalog_gap_min" ]]; then
    catalog_gap_boost_min_tranche_repos="$cfg_catalog_gap_min"
  fi
  if [[ -n "$cfg_catalog_gap_max" ]]; then
    catalog_gap_boost_max_total_queries="$cfg_catalog_gap_max"
  fi
  if [[ -n "$cfg_catalog_gap_relaxed" ]]; then
    catalog_gap_boost_min_stars_relaxed="$cfg_catalog_gap_relaxed"
  fi
  if [[ -n "$cfg_catalog_gap_max_tags" ]]; then
    catalog_gap_boost_max_tags_per_run="$cfg_catalog_gap_max_tags"
  fi
  if [[ -n "$cfg_catalog_gap_avoid_recent" ]]; then
    catalog_gap_boost_avoid_recent_tags="$cfg_catalog_gap_avoid_recent"
  fi
  if [[ -n "$cfg_quota_boost" ]]; then
    enable_coverage_quota_boost="$cfg_quota_boost"
  fi
  if [[ -n "$cfg_quota_min" ]]; then
    coverage_quota_min_count_per_tag="$cfg_quota_min"
  fi
  if [[ -n "$cfg_quota_max" ]]; then
    coverage_quota_max_total_queries="$cfg_quota_max"
  fi
  if [[ -n "$cfg_quota_relaxed" ]]; then
    coverage_quota_min_stars_relaxed="$cfg_quota_relaxed"
  fi
  if [[ -n "$cfg_quota_max_tags" ]]; then
    coverage_quota_max_tags_per_run="$cfg_quota_max_tags"
  fi
  if [[ -n "$cfg_quota_rotate" ]]; then
    coverage_quota_rotate_tags="$cfg_quota_rotate"
  fi
  if [[ -n "$cfg_quota_avoid_recent" ]]; then
    coverage_quota_avoid_recent_tags="$cfg_quota_avoid_recent"
  fi
  if [[ -n "$cfg_gap_recent_window" ]]; then
    gap_tag_recent_window="$cfg_gap_recent_window"
  fi
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --queries-md)
      shift
      queries_md="${1:-}"
      shift || true
      ;;
    --feature-map)
      shift
      feature_map="${1:-}"
      shift || true
      ;;
    --no-derived-queries)
      enable_derived_queries=false
      shift || true
      ;;
    --max-repos)
      shift
      max_repos="${1:-}"
      user_set_max_repos=true
      shift || true
      ;;
    --tranche-name)
      shift
      tranche_name="${1:-}"
      shift || true
      ;;
    --max-queries-per-group)
      shift
      max_queries_per_group="${1:-}"
      shift || true
      ;;
    --max-total-queries)
      shift
      max_total_queries="${1:-}"
      user_set_max_total_queries=true
      shift || true
      ;;
    --min-stars)
      shift
      min_stars="${1:-}"
      shift || true
      ;;
    --include-forks)
      include_forks=true
      shift || true
      ;;
    --include-archived)
      include_archived=true
      shift || true
      ;;
    --exclude-keywords)
      shift
      exclude_keywords="${1:-}"
      shift || true
      ;;
    --exclude-regex)
      shift
      exclude_regex="${1:-}"
      shift || true
      ;;
    --no-rotate)
      enable_query_rotation=false
      shift || true
      ;;
    --state-file)
      shift
      state_file="${1:-}"
      shift || true
      ;;
    --no-gap-boost)
      enable_gap_boost=false
      shift || true
      ;;
    --gap-boost-max-total-queries)
      shift
      gap_boost_max_total_queries="${1:-}"
      shift || true
      ;;
    --gap-boost-min-count)
      shift
      gap_boost_min_count="${1:-}"
      shift || true
      ;;
    --gap-boost-min-stars)
      shift
      gap_boost_min_stars_override="${1:-}"
      shift || true
      ;;
    --gap-boost-min-stars-relaxed)
      shift
      gap_boost_min_stars_relaxed="${1:-}"
      shift || true
      ;;
    --gap-boost-relax-excludes)
      gap_boost_relax_excludes_on_empty=true
      shift || true
      ;;
    --no-auto-tune)
      enable_auto_tune=false
      shift || true
      ;;
    --print-settings)
      print_settings=true
      shift || true
      ;;
    --no-prefer-new)
      prefer_new_repos=false
      shift || true
      ;;
    --prefer-new-no-fallback)
      prefer_new_fallback_to_seen=false
      shift || true
      ;;
    --catalog-file)
      shift
      catalog_file="${1:-}"
      shift || true
      ;;
    --curation-file)
      shift
      curation_file="${1:-}"
      shift || true
      ;;
    --prefer-new-keep-statuses)
      shift
      prefer_new_keep_curated_statuses="${1:-}"
      shift || true
      ;;
    --no-catalog-gap-boost)
      enable_catalog_gap_boost=false
      shift || true
      ;;
    --catalog-gap-min-tranche-repos)
      shift
      catalog_gap_boost_min_tranche_repos="${1:-}"
      shift || true
      ;;
    --catalog-gap-max-total-queries)
      shift
      catalog_gap_boost_max_total_queries="${1:-}"
      shift || true
      ;;
    --catalog-gap-min-stars-relaxed)
      shift
      catalog_gap_boost_min_stars_relaxed="${1:-}"
      shift || true
      ;;
    --no-coverage-quota-boost)
      enable_coverage_quota_boost=false
      shift || true
      ;;
    --coverage-quota-min-count)
      shift
      coverage_quota_min_count_per_tag="${1:-}"
      shift || true
      ;;
    --coverage-quota-max-total-queries)
      shift
      coverage_quota_max_total_queries="${1:-}"
      shift || true
      ;;
    --coverage-quota-min-stars-relaxed)
      shift
      coverage_quota_min_stars_relaxed="${1:-}"
      shift || true
      ;;
    --coverage-quota-max-tags)
      shift
      coverage_quota_max_tags_per_run="${1:-}"
      shift || true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ -z "$queries_md" || ! -f "$queries_md" ]]; then
  echo "ERROR: queries markdown not found: $queries_md" >&2
  exit 2
fi

if [[ -z "$feature_map" || ! -f "$feature_map" ]]; then
  echo "ERROR: feature map markdown not found: $feature_map" >&2
  exit 2
fi

if ! [[ "$max_repos" =~ ^[0-9]+$ ]] || [[ "$max_repos" -lt 1 ]]; then
  echo "ERROR: --max-repos must be a positive integer (got: $max_repos)" >&2
  exit 2
fi

if ! [[ "$max_queries_per_group" =~ ^[0-9]+$ ]]; then
  echo "ERROR: --max-queries-per-group must be an integer (got: $max_queries_per_group)" >&2
  exit 2
fi

if ! [[ "$max_total_queries" =~ ^[0-9]+$ ]]; then
  echo "ERROR: --max-total-queries must be an integer (got: $max_total_queries)" >&2
  exit 2
fi

if ! [[ "$min_stars" =~ ^[0-9]+$ ]]; then
  echo "ERROR: --min-stars must be an integer (got: $min_stars)" >&2
  exit 2
fi

if [[ -n "$gap_boost_min_stars_override" ]] && ! [[ "$gap_boost_min_stars_override" =~ ^[0-9]+$ ]]; then
  echo "ERROR: --gap-boost-min-stars must be an integer (got: $gap_boost_min_stars_override)" >&2
  exit 2
fi

if ! [[ "$gap_boost_min_stars_relaxed" =~ ^[0-9]+$ ]]; then
  echo "ERROR: --gap-boost-min-stars-relaxed must be an integer (got: $gap_boost_min_stars_relaxed)" >&2
  exit 2
fi

token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"

if [[ -z "$token" && "$max_total_queries" -gt 10 ]]; then
  echo "WARN: No GitHub token detected (GITHUB_TOKEN/GH_TOKEN). Reducing --max-total-queries to 8 to avoid rate limits." >&2
  max_total_queries=8
fi

prev_failures=0
auto_tune_active=false
auto_tune_applied_max_total_queries=false
auto_tune_applied_max_repos=false

if [[ -z "$token" && -f "$state_file" ]]; then
  prev_failures="$(python3 -c 'import json,sys; print(int(json.load(open(sys.argv[1])).get("consecutive_metadata_failures_no_token",0)))' "$state_file" 2>/dev/null || echo "0")"
fi

if is_true "$enable_auto_tune" && [[ -z "$token" ]]; then
  if [[ "$prev_failures" -ge "$auto_tune_threshold_failures" ]]; then
    auto_tune_active=true
    if [[ "$user_set_max_total_queries" == "false" && "$max_total_queries" -gt "$auto_tune_max_total_queries" ]]; then
      echo "WARN: Auto-tune active (previous no-token metadata failures: $prev_failures). Reducing --max-total-queries to $auto_tune_max_total_queries." >&2
      max_total_queries="$auto_tune_max_total_queries"
      auto_tune_applied_max_total_queries=true
    fi
    if [[ "$user_set_max_repos" == "false" && "$max_repos" -gt "$auto_tune_max_repos" ]]; then
      echo "WARN: Auto-tune active (previous no-token metadata failures: $prev_failures). Reducing --max-repos to $auto_tune_max_repos." >&2
      max_repos="$auto_tune_max_repos"
      auto_tune_applied_max_repos=true
    fi
  fi
fi

if [[ "$print_settings" == "true" ]]; then
  cat <<EOF
Resolved settings (no side effects):

- token_used: $([[ -n "$token" ]] && echo "yes" || echo "no")
- queries_md: $queries_md
- feature_map: $feature_map
- tranche_name: $tranche_name
- max_total_queries: $max_total_queries (user_override=$user_set_max_total_queries)
- max_repos: $max_repos (user_override=$user_set_max_repos)
- max_queries_per_group: $max_queries_per_group
- min_stars: $min_stars
- include_forks: $include_forks
- include_archived: $include_archived
- exclude_keywords: $exclude_keywords
- exclude_regex: $exclude_regex
- rotation_enabled: $enable_query_rotation (state_file=$state_file)
- derived_queries_enabled: $enable_derived_queries
- gap_boost_enabled: $enable_gap_boost
- auto_tune_enabled: $enable_auto_tune
- auto_tune_prev_failures_no_token: $prev_failures (threshold=$auto_tune_threshold_failures, active=$auto_tune_active)
- auto_tune_applied: max_total_queries=$auto_tune_applied_max_total_queries, max_repos=$auto_tune_applied_max_repos
- prefer_new_repos: $prefer_new_repos (fallback_to_seen=$prefer_new_fallback_to_seen)
- catalog_file: $catalog_file
- curation_file: $curation_file
- prefer_new_keep_curated_statuses: $prefer_new_keep_curated_statuses
- catalog_gap_boost: $enable_catalog_gap_boost (min_tranche_repos=$catalog_gap_boost_min_tranche_repos, max_total_queries=$catalog_gap_boost_max_total_queries, relaxed_min_stars=$catalog_gap_boost_min_stars_relaxed)
- catalog_gap_boost_max_tags_per_run: $catalog_gap_boost_max_tags_per_run
- catalog_gap_boost_avoid_recent_tags: $catalog_gap_boost_avoid_recent_tags
- coverage_quota_boost: $enable_coverage_quota_boost (min_count_per_tag=$coverage_quota_min_count_per_tag, max_total_queries=$coverage_quota_max_total_queries, relaxed_min_stars=$coverage_quota_min_stars_relaxed)
- coverage_quota_max_tags_per_run: $coverage_quota_max_tags_per_run
- coverage_quota_rotate_tags: $coverage_quota_rotate_tags (state_file=$state_file)
- coverage_quota_avoid_recent_tags: $coverage_quota_avoid_recent_tags
- gap_tag_recent_window: $gap_tag_recent_window
EOF
  exit 0
fi

run_id="$(date +%H%M%S)"
created="$("$docs_root/.blackbox/4-scripts/new-run.sh" oss-discovery "github oss discovery cycle ${run_id}" \
  --prompt .blackbox/agents/oss-discovery/prompt.md \
  --prompt .blackbox/agents/oss-discovery/runbook.md)"
plan_path="$(echo "$created" | sed -n 's/^- plan: //p')"
if [[ -z "$plan_path" ]]; then
  echo "ERROR: Failed to determine plan path from new-run output." >&2
  exit 1
fi

mkdir -p "$plan_path/artifacts"
mkdir -p "$plan_path/oss/entries"

search_report="$plan_path/artifacts/github-search.md"
search_json="$plan_path/artifacts/search-extracted.json"
search_json_gap="$plan_path/artifacts/search-extracted-gap.json"
search_json_merged="$plan_path/artifacts/search-extracted-merged.json"
repo_list="$plan_path/oss/${tranche_name}-repos.txt"
derived_queries="$plan_path/artifacts/feature-map-queries.md"
combined_queries="$plan_path/artifacts/query-bank.md"
rotated_queries="$plan_path/artifacts/query-bank-rotated.md"
gap_queries_md="$plan_path/artifacts/gap-queries.boost.md"

if [[ "$enable_derived_queries" == "true" ]]; then
  echo "Generating feature-derived query bank (source: $feature_map)..."
  python3 "$docs_root/.blackbox/4-scripts/research/generate_oss_query_bank.py" \
    --feature-map "$feature_map" \
    --out "$derived_queries"
else
  echo "Derived queries disabled (--no-derived-queries)."
  {
    echo "# OSS Discovery Queries (derived from feature map)"
    echo ""
    echo "_Disabled for this run._"
    echo ""
  } >"$derived_queries"
fi

{
  echo "# OSS Discovery Query Bank (combined)"
  echo ""
  echo "## Base query bank"
  echo ""
  cat "$queries_md"
  echo ""
  echo "## Derived from competitor feature map"
  echo ""
  cat "$derived_queries"
} >"$combined_queries"

queries_for_run="$combined_queries"
if [[ "$enable_query_rotation" == "true" ]]; then
  echo "Rotating query bank (state: $state_file)..."
  python3 "$docs_root/.blackbox/4-scripts/research/rotate_query_bank.py" \
    --in "$combined_queries" \
    --out "$rotated_queries" \
    --state "$state_file" \
    --max-per-group "$max_queries_per_group"
  queries_for_run="$rotated_queries"
fi

echo "Running live GitHub search (queries: $queries_for_run)..."
exclude_args=()
if [[ -n "${exclude_keywords// /}" ]]; then
  IFS=',' read -r -a __ex_kw <<< "$exclude_keywords"
  for kw in "${__ex_kw[@]}"; do
    kw="$(echo "$kw" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
    if [[ -n "$kw" ]]; then
      exclude_args+=(--exclude-keyword "$kw")
    fi
  done
fi
if [[ -n "${exclude_regex// /}" ]]; then
  exclude_args+=(--exclude-regex "$exclude_regex")
fi

python3 "$docs_root/.blackbox/4-scripts/research/github_search_repos.py" \
  --out "$search_report" \
  --title "OSS Discovery — GitHub search (catalog only)" \
  --queries-md "$queries_for_run" \
  --out-repos "$repo_list" \
  --out-search-json "$search_json" \
  --token "$token" \
  --max-queries-per-group "$max_queries_per_group" \
  --max-total-queries "$max_total_queries" \
  --min-stars "$min_stars" \
  $([[ "$include_forks" == "true" ]] && echo "--include-forks" || true) \
  $([[ "$include_archived" == "true" ]] && echo "--include-archived" || true) \
  "${exclude_args[@]}"

# Optional: gap boost search (adds targeted coverage, then merges).
# This uses tag inference from a provisional extracted.json generated from Search API results.
if [[ "$enable_gap_boost" == "true" ]]; then
  echo "Preparing gap boost queries..."
  python3 "$docs_root/.blackbox/4-scripts/research/export_oss_candidates.py" \
    --search-json "$search_json" \
    --out-json "$plan_path/artifacts/extracted.search.json"

  python3 "$docs_root/.blackbox/4-scripts/research/suggest_oss_gap_queries.py" \
    --extracted-json "$plan_path/artifacts/extracted.search.json" \
    --out "$gap_queries_md" \
    --min-count "$gap_boost_min_count"

  gap_query_lines="$(python3 -c 'import sys; print(sum(1 for line in open(sys.argv[1], "r", encoding="utf-8", errors="ignore") if line.strip().startswith("- ")))' "$gap_queries_md" 2>/dev/null || echo "0")"
  if [[ "$gap_query_lines" == "0" ]]; then
    echo "No gap queries generated at current threshold; skipping gap boost search."
    cp "$search_json" "$search_json_merged"
  else
    echo "Running gap boost search..."
    boost_min_stars="$min_stars"
    if [[ -n "$gap_boost_min_stars_override" ]]; then
      boost_min_stars="$gap_boost_min_stars_override"
    fi

    boost_exclude_args=("${exclude_args[@]}")

    python3 "$docs_root/.blackbox/4-scripts/research/github_search_repos.py" \
      --out "$plan_path/artifacts/github-search-gap.md" \
      --title "OSS Discovery — Gap boost search (catalog only)" \
      --queries-md "$gap_queries_md" \
      --out-search-json "$search_json_gap" \
      --token "$token" \
      --max-total-queries "$gap_boost_max_total_queries" \
      --min-stars "$boost_min_stars" \
      $([[ "$include_forks" == "true" ]] && echo "--include-forks" || true) \
      $([[ "$include_archived" == "true" ]] && echo "--include-archived" || true) \
      "${boost_exclude_args[@]}"

    gap_count="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(int(p.get("count",0)))' "$search_json_gap" 2>/dev/null || echo "0")"
    if [[ "$gap_count" == "0" && "$gap_boost_retry_on_empty" == "true" ]]; then
      echo "Gap boost returned 0 results; retrying once with relaxed min_stars=${gap_boost_min_stars_relaxed}..."
      python3 "$docs_root/.blackbox/4-scripts/research/github_search_repos.py" \
        --out "$plan_path/artifacts/github-search-gap-relaxed.md" \
        --title "OSS Discovery — Gap boost search (relaxed)" \
        --queries-md "$gap_queries_md" \
        --out-search-json "$search_json_gap" \
        --token "$token" \
        --max-total-queries "$gap_boost_max_total_queries" \
        --min-stars "$gap_boost_min_stars_relaxed" \
        $([[ "$include_forks" == "true" ]] && echo "--include-forks" || true) \
        $([[ "$include_archived" == "true" ]] && echo "--include-archived" || true) \
        "${boost_exclude_args[@]}"
    fi

    gap_count="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(int(p.get("count",0)))' "$search_json_gap" 2>/dev/null || echo "0")"
    if [[ "$gap_count" == "0" && "$gap_boost_relax_excludes_on_empty" == "true" ]]; then
      echo "Gap boost still 0; retrying once more with excludes disabled (min_stars=${gap_boost_min_stars_relaxed})..."
      boost_exclude_args=()
      python3 "$docs_root/.blackbox/4-scripts/research/github_search_repos.py" \
        --out "$plan_path/artifacts/github-search-gap-relaxed-no-excludes.md" \
        --title "OSS Discovery — Gap boost (relaxed, no excludes)" \
        --queries-md "$gap_queries_md" \
        --out-search-json "$search_json_gap" \
        --token "$token" \
        --max-total-queries "$gap_boost_max_total_queries" \
        --min-stars "$gap_boost_min_stars_relaxed" \
        $([[ "$include_forks" == "true" ]] && echo "--include-forks" || true) \
        $([[ "$include_archived" == "true" ]] && echo "--include-archived" || true)
    fi

    echo "Merging search results..."
    python3 "$docs_root/.blackbox/4-scripts/research/merge_search_extracted.py" \
      --in "$search_json" \
      --in "$search_json_gap" \
      --out "$search_json_merged" \
      --out-repos "$repo_list" \
      --limit "$max_repos"
  fi
else
  # Keep a merged alias for easier downstream references.
  cp "$search_json" "$search_json_merged"
fi

# Trim to max_repos (keep header lines starting with #)
tmp_list="${repo_list}.tmp"
{
  grep -E '^[#]' "$repo_list" || true
  awk 'NF && $0 !~ /^#/' "$repo_list" | head -n "$max_repos" || true
} > "$tmp_list"
mv "$tmp_list" "$repo_list"

apply_prefer_new_filter "$repo_list"

catalog_gap_boost_applied=false
catalog_gap_boost_candidates=0
catalog_gap_boost_repo_delta=0
catalog_gap_boost_blocked=false
catalog_gap_boost_error_http_status=""
catalog_gap_boost_blocked_reason=""
catalog_gap_boost_selected_tags=""
catalog_gap_boost_rotation_start_index=0
catalog_gap_boost_total_gap_tags=0
catalog_gap_boost_selected_gap_tags=0
catalog_gap_recent_excludes=""
catalog_gap_selected_query_lines=0
coverage_quota_applied=false
coverage_quota_candidates=0
coverage_quota_repo_delta=0
coverage_quota_blocked=false
coverage_quota_error_http_status=""
coverage_quota_blocked_reason=""
coverage_quota_rotation_start_index=0
coverage_quota_total_gap_tags=0
coverage_quota_selected_gap_tags=0
coverage_quota_selected_tags=""
coverage_quota_recent_excludes=""
coverage_quota_exclude_tags=""
coverage_quota_selected_query_lines=0
if is_true "$enable_catalog_gap_boost" && [[ -f "$catalog_file" ]] && [[ "$repo_line_count" -lt "$catalog_gap_boost_min_tranche_repos" ]]; then
  echo "Catalog gap boost: tranche has $repo_line_count repos (< $catalog_gap_boost_min_tranche_repos); running targeted top-up search..."
  catalog_gap_queries_md="$plan_path/artifacts/gap-queries.catalog.md"
  python3 "$docs_root/.blackbox/4-scripts/research/generate_oss_catalog_gap_queries.py" \
    --catalog-json "$catalog_file" \
    --out "$catalog_gap_queries_md" \
    --min-count 3

  catalog_gap_queries_selected_md="$plan_path/artifacts/gap-queries.catalog.selected.md"
  catalog_gap_tags_json="$plan_path/artifacts/gap-queries.catalog.selected.tags.json"
  catalog_gap_boost_total_gap_tags="$(python3 -c 'import sys; print(sum(1 for line in open(sys.argv[1], \"r\", encoding=\"utf-8\", errors=\"ignore\") if line.startswith(\"## \")))' "$catalog_gap_queries_md" 2>/dev/null || echo "0")"
  if ! [[ "$catalog_gap_boost_total_gap_tags" =~ ^[0-9]+$ ]]; then catalog_gap_boost_total_gap_tags=0; fi
  catalog_gap_boost_rotation_start_index=0
  if [[ "$catalog_gap_boost_total_gap_tags" -gt 0 ]]; then
    mkdir -p "$(dirname "$state_file")"
    catalog_gap_boost_rotation_start_index="$(
      python3 - "$state_file" "$catalog_gap_boost_total_gap_tags" <<'PY' 2>/dev/null || true
import json
import sys
from datetime import datetime, timezone

path = sys.argv[1]
total = int(sys.argv[2])

try:
  d = json.load(open(path, "r", encoding="utf-8"))
except Exception:
  d = {}

count = int(d.get("catalog_gap_rotation_count", 0) or 0)
start = count % max(1, total)
d["catalog_gap_rotation_count"] = count + 1
d["updated_at_utc"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, sort_keys=True) + "\n")
print(start)
PY
    )"
    if [[ -z "$catalog_gap_boost_rotation_start_index" ]]; then catalog_gap_boost_rotation_start_index=0; fi
    if ! [[ "$catalog_gap_boost_rotation_start_index" =~ ^[0-9]+$ ]]; then catalog_gap_boost_rotation_start_index=0; fi
  fi

  recent_excludes=""
  if is_true "$catalog_gap_boost_avoid_recent_tags" && [[ -f "$state_file" ]]; then
    recent_excludes="$(python3 - "$state_file" "$gap_tag_recent_window" <<'PY' 2>/dev/null || true
import json,sys
path=sys.argv[1]
limit=int(sys.argv[2])
try:
  d=json.load(open(path,"r",encoding="utf-8"))
except Exception:
  d={}
tags=d.get("recent_gap_tags") or []
if not isinstance(tags,list):
  tags=[]
tags=[t for t in tags if isinstance(t,str) and t.strip()]
tags=tags[-max(0,limit):]
print(",".join(tags))
PY)"
  fi
  catalog_gap_recent_excludes="$recent_excludes"

  python3 "$docs_root/.blackbox/4-scripts/research/select_gap_queries_subset.py" \
    --in "$catalog_gap_queries_md" \
    --out "$catalog_gap_queries_selected_md" \
    --max-tags "$catalog_gap_boost_max_tags_per_run" \
    --start-index "$catalog_gap_boost_rotation_start_index" \
    --wrap \
    --exclude-tags "$recent_excludes" \
    --out-tags-json "$catalog_gap_tags_json"

  catalog_gap_selected_query_lines="$(python3 -c 'import sys; print(sum(1 for line in open(sys.argv[1], "r", encoding="utf-8", errors="ignore") if line.strip().startswith("- ")))' "$catalog_gap_queries_selected_md" 2>/dev/null || echo "0")"
  if [[ "$catalog_gap_selected_query_lines" == "0" && -n "${recent_excludes// /}" ]]; then
    echo "Catalog gap boost: selected 0 queries after excluding recent tags; retrying selection without excludes..."
    python3 "$docs_root/.blackbox/4-scripts/research/select_gap_queries_subset.py" \
      --in "$catalog_gap_queries_md" \
      --out "$catalog_gap_queries_selected_md" \
      --max-tags "$catalog_gap_boost_max_tags_per_run" \
      --start-index "$catalog_gap_boost_rotation_start_index" \
      --wrap \
      --out-tags-json "$catalog_gap_tags_json"
  fi

  # If we still have no queries, skip this boost rather than failing the entire cycle.
  catalog_gap_selected_query_lines="$(python3 -c 'import sys; print(sum(1 for line in open(sys.argv[1], "r", encoding="utf-8", errors="ignore") if line.strip().startswith("- ")))' "$catalog_gap_queries_selected_md" 2>/dev/null || echo "0")"
  if [[ "$catalog_gap_selected_query_lines" == "0" ]]; then
    echo "Catalog gap boost: 0 queries selected; skipping catalog top-up search."
    catalog_gap_boost_applied=false
    catalog_gap_boost_candidates="0"
    catalog_gap_boost_blocked=false
    catalog_gap_boost_blocked_reason=""
    catalog_gap_boost_error_http_status=""
  else

  catalog_gap_boost_selected_tags="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(\",\".join(p.get(\"selected_tags\") or []))' "$catalog_gap_tags_json" 2>/dev/null || true)"
  catalog_gap_boost_selected_gap_tags="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(len(p.get(\"selected_tags\") or []))' "$catalog_gap_tags_json" 2>/dev/null || echo "0")"
  if ! [[ "$catalog_gap_boost_selected_gap_tags" =~ ^[0-9]+$ ]]; then catalog_gap_boost_selected_gap_tags=0; fi

  catalog_gap_boost_min_stars="$min_stars"
  if [[ -z "$token" ]] && [[ "$catalog_gap_boost_min_stars_relaxed" =~ ^[0-9]+$ ]] && [[ "$catalog_gap_boost_min_stars_relaxed" -lt "$min_stars" ]]; then
    catalog_gap_boost_min_stars="$catalog_gap_boost_min_stars_relaxed"
  fi

  search_json_catalog_gap="$plan_path/artifacts/search-extracted-catalog-gap.json"
  python3 "$docs_root/.blackbox/4-scripts/research/github_search_repos.py" \
    --out "$plan_path/artifacts/github-search-catalog-gap.md" \
    --title "OSS Discovery — Catalog gap boost (catalog only)" \
    --queries-md "$catalog_gap_queries_selected_md" \
    --out-search-json "$search_json_catalog_gap" \
    --token "$token" \
    --max-total-queries "$catalog_gap_boost_max_total_queries" \
    --min-stars "$catalog_gap_boost_min_stars" \
    $([[ "$include_forks" == "true" ]] && echo "--include-forks" || true) \
    $([[ "$include_archived" == "true" ]] && echo "--include-archived" || true) \
    "${exclude_args[@]}"

  catalog_gap_boost_candidates="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(int(p.get("count",0)))' "$search_json_catalog_gap" 2>/dev/null || echo "0")"
  catalog_gap_boost_blocked_reason="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(p.get("blocked_reason","") if p.get("blocked") else "")' "$search_json_catalog_gap" 2>/dev/null || true)"
  catalog_gap_boost_error_http_status="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); e=p.get("error") or {}; print(e.get("http_status",""))' "$search_json_catalog_gap" 2>/dev/null || true)"
  if [[ -n "$catalog_gap_boost_blocked_reason" || -n "$catalog_gap_boost_error_http_status" ]]; then
    catalog_gap_boost_blocked=true
  fi
  if [[ "$catalog_gap_boost_candidates" != "0" ]]; then
    echo "Merging catalog gap boost results..."
    merged2="$plan_path/artifacts/search-extracted-merged2.json"
    python3 "$docs_root/.blackbox/4-scripts/research/merge_search_extracted.py" \
      --in "$search_json_merged" \
      --in "$search_json_catalog_gap" \
      --out "$merged2" \
      --out-repos "$repo_list" \
      --limit "$max_repos"
    mv "$merged2" "$search_json_merged"

    tmp_list="${repo_list}.tmp"
    {
      grep -E '^[#]' "$repo_list" || true
      awk 'NF && $0 !~ /^#/' "$repo_list" | head -n "$max_repos" || true
    } > "$tmp_list"
    mv "$tmp_list" "$repo_list"

    pre_topup_repo_count="$repo_line_count"
    apply_prefer_new_filter "$repo_list"
    if [[ "$repo_line_count" -ge "$pre_topup_repo_count" ]]; then
      catalog_gap_boost_repo_delta=$((repo_line_count - pre_topup_repo_count))
    fi
    catalog_gap_boost_applied=true
  else
    if [[ "$catalog_gap_boost_blocked" == "true" ]]; then
      if [[ -n "$catalog_gap_boost_blocked_reason" ]]; then
        echo "Catalog gap boost was blocked (${catalog_gap_boost_blocked_reason}); continuing without top-up."
      else
        echo "Catalog gap boost was blocked (HTTP $catalog_gap_boost_error_http_status); continuing without top-up."
      fi
    else
      echo "Catalog gap boost produced 0 candidates; continuing without top-up."
    fi
	  fi
	  fi
	fi

	# Coverage quota boost: after prefer-new (and optional catalog gap boost), ensure we have
# minimum per-tag coverage by generating gap queries from the current merged candidates.
if is_true "$enable_coverage_quota_boost" && [[ "$repo_line_count" -gt 0 ]]; then
  quota_extracted_json="$plan_path/artifacts/extracted.search.after-filter.json"
  # Build a tranche-scoped Search API dump so quota coverage reflects the actual tranche list.
  quota_search_json="$plan_path/artifacts/search-extracted.tranche.json"
  python3 - "$search_json_merged" "$repo_list" "$quota_search_json" <<'PY' 2>/dev/null || true
import json
import sys

search_path = sys.argv[1]
repo_list_path = sys.argv[2]
out_path = sys.argv[3]

try:
  payload = json.load(open(search_path, "r", encoding="utf-8"))
except Exception:
  payload = {"count": 0, "items": []}

items = payload.get("items") or []
if not isinstance(items, list):
  items = []

repos = set()
for line in open(repo_list_path, "r", encoding="utf-8", errors="ignore").read().splitlines():
  s = line.strip()
  if not s or s.startswith("#"):
    continue
  repos.add(s)

filtered = []
for it in items:
  if not isinstance(it, dict):
    continue
  fn = it.get("full_name") or ""
  if isinstance(fn, str) and fn in repos:
    filtered.append(it)

out = dict(payload)
out["items"] = filtered
out["count"] = len(filtered)
open(out_path, "w", encoding="utf-8").write(json.dumps(out, indent=2, sort_keys=True) + "\n")
PY

  python3 "$docs_root/.blackbox/4-scripts/research/export_oss_candidates.py" \
    --search-json "$quota_search_json" \
    --out-json "$quota_extracted_json"

  quota_gap_queries_md="$plan_path/artifacts/gap-queries.quota.md"
  python3 "$docs_root/.blackbox/4-scripts/research/suggest_oss_gap_queries.py" \
    --extracted-json "$quota_extracted_json" \
    --out "$quota_gap_queries_md" \
    --min-count "$coverage_quota_min_count_per_tag"

  quota_gap_queries_selected_md="$plan_path/artifacts/gap-queries.quota.selected.md"
  quota_tags_json="$plan_path/artifacts/gap-queries.quota.selected.tags.json"

  coverage_quota_total_gap_tags="$(python3 -c 'import sys; print(sum(1 for line in open(sys.argv[1], "r", encoding="utf-8", errors="ignore") if line.startswith("## ")))' "$quota_gap_queries_md" 2>/dev/null || echo "0")"
  if ! [[ "$coverage_quota_total_gap_tags" =~ ^[0-9]+$ ]]; then coverage_quota_total_gap_tags=0; fi

  coverage_quota_rotation_start_index=0
  if is_true "$coverage_quota_rotate_tags" && [[ "$coverage_quota_total_gap_tags" -gt 0 ]]; then
    mkdir -p "$(dirname "$state_file")"
    coverage_quota_rotation_start_index="$(
      python3 - "$state_file" "$coverage_quota_total_gap_tags" <<'PY' 2>/dev/null || true
import json
import sys
from datetime import datetime, timezone

path = sys.argv[1]
total = int(sys.argv[2])

try:
  d = json.load(open(path, "r", encoding="utf-8"))
except Exception:
  d = {}

count = int(d.get("quota_rotation_count", 0) or 0)
start = count % max(1, total)

d["quota_rotation_count"] = count + 1
d["updated_at_utc"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, sort_keys=True) + "\n")

print(start)
PY
    )"
    if [[ -z "$coverage_quota_rotation_start_index" ]]; then coverage_quota_rotation_start_index=0; fi
    if ! [[ "$coverage_quota_rotation_start_index" =~ ^[0-9]+$ ]]; then coverage_quota_rotation_start_index=0; fi
  fi

  recent_quota_excludes=""
  if is_true "$coverage_quota_avoid_recent_tags" && [[ -f "$state_file" ]]; then
    recent_quota_excludes="$(python3 - "$state_file" "$gap_tag_recent_window" <<'PY' 2>/dev/null || true
import json,sys
path=sys.argv[1]
limit=int(sys.argv[2])
try:
  d=json.load(open(path,"r",encoding="utf-8"))
except Exception:
  d={}
tags=d.get("recent_gap_tags") or []
if not isinstance(tags,list):
  tags=[]
tags=[t.strip() for t in tags if isinstance(t,str) and t.strip()]
tags=tags[-max(0,limit):]
print(",".join(tags))
PY)"
  fi
  coverage_quota_recent_excludes="$recent_quota_excludes"

  exclude_quota_tags="$catalog_gap_boost_selected_tags"
  if [[ -n "${recent_quota_excludes// /}" ]]; then
    if [[ -n "${exclude_quota_tags//,/}" ]]; then
      exclude_quota_tags="${exclude_quota_tags},${recent_quota_excludes}"
    else
      exclude_quota_tags="${recent_quota_excludes}"
    fi
  fi
  coverage_quota_exclude_tags="$exclude_quota_tags"

  python3 "$docs_root/.blackbox/4-scripts/research/select_gap_queries_subset.py" \
    --in "$quota_gap_queries_md" \
    --out "$quota_gap_queries_selected_md" \
    --max-tags "$coverage_quota_max_tags_per_run" \
    --start-index "$coverage_quota_rotation_start_index" \
    --wrap \
    --exclude-tags "$exclude_quota_tags" \
    --out-tags-json "$quota_tags_json"

  quota_query_lines="$(python3 -c 'import sys; print(sum(1 for line in open(sys.argv[1], "r", encoding="utf-8", errors="ignore") if line.strip().startswith("- ")))' "$quota_gap_queries_selected_md" 2>/dev/null || echo "0")"
  coverage_quota_selected_query_lines="$quota_query_lines"
  if [[ "$quota_query_lines" == "0" && -n "${exclude_quota_tags//,/}" ]]; then
    echo "Coverage quota boost: selected 0 queries after excludes; retrying selection without excludes..."
    python3 "$docs_root/.blackbox/4-scripts/research/select_gap_queries_subset.py" \
      --in "$quota_gap_queries_md" \
      --out "$quota_gap_queries_selected_md" \
      --max-tags "$coverage_quota_max_tags_per_run" \
      --start-index "$coverage_quota_rotation_start_index" \
      --wrap \
      --out-tags-json "$quota_tags_json"
    quota_query_lines="$(python3 -c 'import sys; print(sum(1 for line in open(sys.argv[1], "r", encoding="utf-8", errors="ignore") if line.strip().startswith("- ")))' "$quota_gap_queries_selected_md" 2>/dev/null || echo "0")"
    coverage_quota_selected_query_lines="$quota_query_lines"
  fi

  coverage_quota_selected_tags="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(",".join(p.get("selected_tags") or []))' "$quota_tags_json" 2>/dev/null || true)"
  coverage_quota_selected_gap_tags="$(python3 -c 'import sys; print(sum(1 for line in open(sys.argv[1], "r", encoding="utf-8", errors="ignore") if line.startswith("## ")))' "$quota_gap_queries_selected_md" 2>/dev/null || echo "0")"
  if ! [[ "$coverage_quota_selected_gap_tags" =~ ^[0-9]+$ ]]; then coverage_quota_selected_gap_tags=0; fi

  if [[ "$quota_query_lines" == "0" ]]; then
    echo "Coverage quota boost: no gaps at threshold min_count=${coverage_quota_min_count_per_tag}; skipping."
  else
    echo "Coverage quota boost: running top-up search for under-covered tags..."
    quota_boost_min_stars="$min_stars"
    if [[ -z "$token" ]] && [[ "$coverage_quota_min_stars_relaxed" =~ ^[0-9]+$ ]] && [[ "$coverage_quota_min_stars_relaxed" -lt "$min_stars" ]]; then
      quota_boost_min_stars="$coverage_quota_min_stars_relaxed"
    fi

    search_json_quota="$plan_path/artifacts/search-extracted-quota-gap.json"
    python3 "$docs_root/.blackbox/4-scripts/research/github_search_repos.py" \
      --out "$plan_path/artifacts/github-search-quota-gap.md" \
      --title "OSS Discovery — Coverage quota boost (tranche only)" \
      --queries-md "$quota_gap_queries_selected_md" \
      --out-search-json "$search_json_quota" \
      --token "$token" \
      --max-total-queries "$coverage_quota_max_total_queries" \
      --min-stars "$quota_boost_min_stars" \
      $([[ "$include_forks" == "true" ]] && echo "--include-forks" || true) \
      $([[ "$include_archived" == "true" ]] && echo "--include-archived" || true) \
      "${exclude_args[@]}"

    coverage_quota_candidates="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(int(p.get("count",0)))' "$search_json_quota" 2>/dev/null || echo "0")"
    coverage_quota_blocked_reason="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(p.get("blocked_reason","") if p.get("blocked") else "")' "$search_json_quota" 2>/dev/null || true)"
    coverage_quota_error_http_status="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); e=p.get("error") or {}; print(e.get("http_status",""))' "$search_json_quota" 2>/dev/null || true)"
    if [[ -n "$coverage_quota_blocked_reason" || -n "$coverage_quota_error_http_status" ]]; then
      coverage_quota_blocked=true
    fi

    if [[ "$coverage_quota_candidates" != "0" ]]; then
      echo "Merging coverage quota results..."
      merged3="$plan_path/artifacts/search-extracted-merged3.json"
      python3 "$docs_root/.blackbox/4-scripts/research/merge_search_extracted.py" \
        --in "$search_json_merged" \
        --in "$search_json_quota" \
        --out "$merged3" \
        --out-repos "$repo_list" \
        --limit "$max_repos"
      mv "$merged3" "$search_json_merged"

      tmp_list="${repo_list}.tmp"
      {
        grep -E '^[#]' "$repo_list" || true
        awk 'NF && $0 !~ /^#/' "$repo_list" | head -n "$max_repos" || true
      } > "$tmp_list"
      mv "$tmp_list" "$repo_list"

      pre_quota_repo_count="$repo_line_count"
      apply_prefer_new_filter "$repo_list"
      if [[ "$repo_line_count" -ge "$pre_quota_repo_count" ]]; then
        coverage_quota_repo_delta=$((repo_line_count - pre_quota_repo_count))
      fi
      coverage_quota_applied=true
    else
      if [[ "$coverage_quota_blocked" == "true" ]]; then
        if [[ -n "$coverage_quota_blocked_reason" ]]; then
          echo "Coverage quota boost was blocked (${coverage_quota_blocked_reason}); continuing."
        else
          echo "Coverage quota boost was blocked (HTTP $coverage_quota_error_http_status); continuing."
        fi
      else
        echo "Coverage quota boost produced 0 candidates; continuing."
      fi
    fi
  fi
fi

# Update recent gap tags cache (best-effort; used to avoid repeating tags across runs).
if [[ -n "${catalog_gap_boost_selected_tags//,/}" || -n "${coverage_quota_selected_tags//,/}" ]]; then
  mkdir -p "$(dirname "$state_file")"
  python3 - "$state_file" "$gap_tag_recent_window" "$catalog_gap_boost_selected_tags" "$coverage_quota_selected_tags" <<'PY' 2>/dev/null || true
import json
import sys
from datetime import datetime, timezone

path = sys.argv[1]
limit = int(sys.argv[2])
tags_a = [t.strip() for t in (sys.argv[3] or "").split(",") if t.strip()]
tags_b = [t.strip() for t in (sys.argv[4] or "").split(",") if t.strip()]

try:
  d = json.load(open(path, "r", encoding="utf-8"))
except Exception:
  d = {}

recent = d.get("recent_gap_tags") or []
if not isinstance(recent, list):
  recent = []
recent = [t.strip() for t in recent if isinstance(t, str) and t.strip()]

for t in tags_a + tags_b:
  if t in recent:
    recent.remove(t)
  recent.append(t)

if limit > 0:
  recent = recent[-limit:]

d["recent_gap_tags"] = recent
d["updated_at_utc"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, sort_keys=True) + "\n")
PY
fi

if [[ "$repo_line_count" == "0" ]]; then
  search_blocked_reason="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(p.get("blocked_reason","") if p.get("blocked") else "")' "$search_json" 2>/dev/null || true)"
  search_error_http_status="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); e=p.get("error") or {}; print(e.get("http_status",""))' "$search_json" 2>/dev/null || true)"
  if [[ -n "$search_blocked_reason" ]]; then
    echo "Search appears blocked (${search_blocked_reason}); generating minimal artifacts and stopping early."
  elif [[ -n "$search_error_http_status" ]]; then
    echo "Search appears blocked (HTTP $search_error_http_status); generating minimal artifacts and stopping early."
  else
    echo "No repos in tranche list after search; generating empty-candidate artifacts and stopping early."
  fi

  python3 "$docs_root/.blackbox/4-scripts/research/export_oss_candidates.py" \
    --search-json "$search_json_merged" \
    --out-json "$plan_path/artifacts/extracted.json" \
    --out-md "$plan_path/artifacts/oss-candidates-extracted.md"

  python3 "$docs_root/.blackbox/4-scripts/research/summarize_oss_coverage.py" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out "$plan_path/artifacts/coverage.md"

  python3 "$docs_root/.blackbox/4-scripts/research/suggest_oss_gap_queries.py" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out "$plan_path/artifacts/gap-queries.md"

  python3 "$docs_root/.blackbox/4-scripts/research/summarize_oss_auto_picks.py" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out "$plan_path/artifacts/auto-picks.md"

  python3 "$docs_root/.blackbox/4-scripts/research/generate_oss_deepening_queue_from_extracted.py" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out "$plan_path/artifacts/deepening-queue.md" \
    --top 20

	  summary_status="EMPTY"
	  if [[ -n "$search_blocked_reason" || -n "$search_error_http_status" ]]; then
	    summary_status="BLOCKED"
	  fi
	  cat >"$plan_path/artifacts/summary.md" <<'EOF'
	# Summary (OSS discovery cycle) — __SUMMARY_STATUS__
	
	Plan: `__PLAN_PATH__`
	
	This run produced **0 repos** after applying the current query bank + filters.
	
	If this was caused by GitHub Search API rate limiting, check `artifacts/search-extracted.json` for a `blocked` payload and re-run with `GITHUB_TOKEN`.
	
	## Suggested next run
	
	Try one of:
	
	- Increase recall:
	  - lower `--min-stars` (e.g. 10–25)
	  - reduce `--exclude-keywords`
	  - increase `--max-total-queries` (best with a token)
	- Increase breadth:
	  - leave rotation enabled (default) and run again (new slice of query bank)
	
	Start here:
	- Search report: `artifacts/github-search.md`
	- Diagnostics: `artifacts/diagnostics.md`
	EOF
	  perl -pe "s/__SUMMARY_STATUS__/$summary_status/g; s#__PLAN_PATH__#$plan_path#g" -i "$plan_path/artifacts/summary.md" 2>/dev/null || true

  cat >"$plan_path/artifacts/sources.md" <<EOF
# Sources

- Base query bank: \`$queries_md\`
- Feature map: \`$feature_map\`
- Derived query bank: \`$derived_queries\`
- Combined query bank: \`$combined_queries\`
- Rotated query bank: \`$rotated_queries\`
- Live search report: \`$search_report\`
- Search extracted JSON: \`$search_json\`
- Merged search JSON: \`$search_json_merged\`
- Repo tranche: \`$repo_list\`

## Notes

- Token used: \`$([[ -n "$token" ]] && echo "yes" || echo "no")\`
- Search filters: min_stars=\`$min_stars\`, include_forks=\`$include_forks\`, include_archived=\`$include_archived\`
- Excludes: keywords=\`$exclude_keywords\`, regex=\`$exclude_regex\`
- Query rotation: enabled=\`$enable_query_rotation\`, state_file=\`$state_file\`
- Gap boost: enabled=\`$enable_gap_boost\`, max_total_queries=\`$gap_boost_max_total_queries\`, min_count=\`$gap_boost_min_count\`
EOF

  echo "Updating cross-run OSS catalog..."
  catalog_dir="$docs_root/.blackbox/oss-catalog"
  mkdir -p "$catalog_dir"
  python3 "$docs_root/.blackbox/4-scripts/research/update_oss_catalog.py" \
    --run-path "$plan_path" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out-catalog "$catalog_dir/catalog.json" \
    --out-index "$catalog_dir/index.md" || echo "WARN: failed to update OSS catalog (non-fatal)" >&2
  "$docs_root/.blackbox/4-scripts/render-oss-catalog.sh" --catalog-dir ".blackbox/oss-catalog" \
    || echo "WARN: failed to render OSS catalog artifacts (non-fatal)" >&2

  if [[ -x "$docs_root/.blackbox/4-scripts/new-step.sh" ]]; then
    if [[ -n "$search_blocked_reason" || -n "$search_error_http_status" ]]; then
      "$docs_root/.blackbox/4-scripts/new-step.sh" --plan "$plan_path" "OSS discovery cycle blocked (GitHub Search API rate limit)"
    else
      "$docs_root/.blackbox/4-scripts/new-step.sh" --plan "$plan_path" "OSS discovery cycle completed (empty tranche)"
    fi
  fi

  echo ""
  if [[ -n "$search_blocked_reason" || -n "$search_error_http_status" ]]; then
    echo "Done (blocked search)."
  else
    echo "Done (empty tranche)."
  fi
  echo "- plan: $plan_path"
  echo "- search report: $search_report"
  echo "- tranche list: $repo_list"
  exit 0
fi

echo "Fetching repo metadata + generating entry stubs..."
python3 "$docs_root/.blackbox/4-scripts/research/fetch_github_repos.py" \
  --input "$repo_list" \
  --out-dir "$plan_path/oss/entries" \
  --dump-json

json_count="$(find "$plan_path/oss/entries" -maxdepth 1 -type f -name '*.json' 2>/dev/null | wc -l | tr -d ' ')"
search_count="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(int(p.get("count",0)))' "$search_json" 2>/dev/null || echo "0")"
merged_count="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(int(p.get("count",0)))' "$search_json_merged" 2>/dev/null || echo "0")"
gap_count="0"
if [[ -f "$search_json_gap" ]]; then
  gap_count="$(python3 -c 'import json,sys; p=json.load(open(sys.argv[1])); print(int(p.get("count",0)))' "$search_json_gap" 2>/dev/null || echo "0")"
fi

recent_gap_tags_snapshot=""
if [[ -f "$state_file" ]]; then
  recent_gap_tags_snapshot="$(python3 - "$state_file" "$gap_tag_recent_window" <<'PY' 2>/dev/null || true
import json,sys
path=sys.argv[1]
limit=int(sys.argv[2])
try:
  d=json.load(open(path,"r",encoding="utf-8"))
except Exception:
  d={}
tags=d.get("recent_gap_tags") or []
if not isinstance(tags,list):
  tags=[]
tags=[t.strip() for t in tags if isinstance(t,str) and t.strip()]
tags=tags[-max(0,limit):]
print(",".join(tags))
PY)"
fi

cat >"$plan_path/artifacts/diagnostics.md" <<EOF
# Diagnostics (OSS discovery cycle)

Plan: \`$plan_path\`

## Counts

- Search (initial) candidates: $search_count
- Search (gap boost) candidates: $gap_count
- Search (merged) candidates: $merged_count
- Search (catalog gap boost) candidates: $catalog_gap_boost_candidates
- Search (coverage quota boost) candidates: $coverage_quota_candidates
- Repo metadata fetched (*.json): $json_count
- Tranche repos (pre-filter): $original_repo_line_count
- Tranche repos (post-filter): $repo_line_count

## Settings snapshot

- Token used: $([[ -n "$token" ]] && echo "yes" || echo "no")
- Auto-tune: enabled=$enable_auto_tune (prev_failures_no_token=$prev_failures, threshold=$auto_tune_threshold_failures, active=$auto_tune_active, applied_max_total_queries=$auto_tune_applied_max_total_queries, applied_max_repos=$auto_tune_applied_max_repos)
- Rotation: enabled=$enable_query_rotation, state_file=\`$state_file\`
- Gap boost: enabled=$enable_gap_boost, min_count=$gap_boost_min_count, max_total_queries=$gap_boost_max_total_queries
- Gap boost retry: enabled=$gap_boost_retry_on_empty, relaxed_min_stars=$gap_boost_min_stars_relaxed
- Gap boost relax excludes: enabled=$gap_boost_relax_excludes_on_empty
- Effective sizing: max_total_queries=$max_total_queries, max_repos=$max_repos, max_queries_per_group=$max_queries_per_group
- Filters: min_stars=$min_stars, include_forks=$include_forks, include_archived=$include_archived
- Excludes: keywords="$exclude_keywords", regex="$exclude_regex"
- Prefer-new: enabled=$prefer_new_repos, applied=$prefer_new_applied, used_fallback=$prefer_new_used_fallback, catalog_file=\`$catalog_file\`
- Prefer-new details: removed_seen=$prefer_new_removed_seen_count, kept_curated=$prefer_new_kept_curated_count, curation_file=\`$curation_file\`, keep_statuses="$prefer_new_keep_curated_statuses"
- Recent gap-tag cache: window=$gap_tag_recent_window, recent_tags="$recent_gap_tags_snapshot"
- Catalog gap boost: enabled=$enable_catalog_gap_boost, applied=$catalog_gap_boost_applied, min_tranche_repos=$catalog_gap_boost_min_tranche_repos, max_total_queries=$catalog_gap_boost_max_total_queries, min_stars_relaxed=$catalog_gap_boost_min_stars_relaxed, repo_delta=$catalog_gap_boost_repo_delta
- Catalog gap boost selection: max_tags=$catalog_gap_boost_max_tags_per_run, rotation_start_index=$catalog_gap_boost_rotation_start_index, total_gap_tags=$catalog_gap_boost_total_gap_tags, selected_gap_tags=$catalog_gap_boost_selected_gap_tags, selected_query_lines=$catalog_gap_selected_query_lines, selected_tags="$catalog_gap_boost_selected_tags", avoid_recent_tags=$catalog_gap_boost_avoid_recent_tags, excluded_recent_tags="$catalog_gap_recent_excludes"
- Catalog gap boost details: blocked=$catalog_gap_boost_blocked, blocked_reason="$catalog_gap_boost_blocked_reason", error_http_status="$catalog_gap_boost_error_http_status"
- Coverage quota boost: enabled=$enable_coverage_quota_boost, applied=$coverage_quota_applied, min_count_per_tag=$coverage_quota_min_count_per_tag, max_total_queries=$coverage_quota_max_total_queries, min_stars_relaxed=$coverage_quota_min_stars_relaxed, repo_delta=$coverage_quota_repo_delta
- Coverage quota selection: max_tags=$coverage_quota_max_tags_per_run, rotate_tags=$coverage_quota_rotate_tags, rotation_start_index=$coverage_quota_rotation_start_index, total_gap_tags=$coverage_quota_total_gap_tags, selected_gap_tags=$coverage_quota_selected_gap_tags, selected_query_lines=$coverage_quota_selected_query_lines, selected_tags="$coverage_quota_selected_tags", avoid_recent_tags=$coverage_quota_avoid_recent_tags, excluded_recent_tags="$coverage_quota_recent_excludes", excluded_tags="$coverage_quota_exclude_tags"
- Coverage quota boost details: blocked=$coverage_quota_blocked, blocked_reason="$coverage_quota_blocked_reason", error_http_status="$coverage_quota_error_http_status"
EOF

if [[ -z "$token" ]] && is_true "$enable_auto_tune"; then
  mkdir -p "$(dirname "$state_file")"
  if [[ "$json_count" == "0" ]]; then
    python3 - "$state_file" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" <<'PY' 2>/dev/null || true
import json
import sys

path = sys.argv[1]
run_at = sys.argv[2]

try:
  d = json.load(open(path, "r", encoding="utf-8"))
except Exception:
  d = {}

d["consecutive_metadata_failures_no_token"] = int(d.get("consecutive_metadata_failures_no_token", 0)) + 1
d["last_run_at_utc"] = run_at
d["last_metadata_json_count"] = 0

open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, sort_keys=True) + "\n")
PY
  else
    python3 - "$state_file" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$json_count" <<'PY' 2>/dev/null || true
import json
import sys

path = sys.argv[1]
run_at = sys.argv[2]
json_count = int(sys.argv[3])

try:
  d = json.load(open(path, "r", encoding="utf-8"))
except Exception:
  d = {}

d["consecutive_metadata_failures_no_token"] = 0
d["last_run_at_utc"] = run_at
d["last_metadata_json_count"] = json_count

open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, sort_keys=True) + "\n")
PY
  fi
fi
if [[ "$json_count" == "0" ]]; then
  echo "Repo metadata fetch blocked; falling back to Search API extracted candidates..."
  python3 "$docs_root/.blackbox/4-scripts/research/export_oss_candidates.py" \
    --search-json "$search_json_merged" \
    --out-json "$plan_path/artifacts/extracted.json" \
    --out-md "$plan_path/artifacts/oss-candidates-extracted.md"

  python3 "$docs_root/.blackbox/4-scripts/research/summarize_oss_coverage.py" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out "$plan_path/artifacts/coverage.md"

  python3 "$docs_root/.blackbox/4-scripts/research/suggest_oss_gap_queries.py" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out "$plan_path/artifacts/gap-queries.md"

  python3 "$docs_root/.blackbox/4-scripts/research/generate_oss_deepening_queue_from_extracted.py" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out "$plan_path/artifacts/deepening-queue.md" \
    --top 20

  python3 "$docs_root/.blackbox/4-scripts/research/summarize_oss_auto_picks.py" \
    --extracted-json "$plan_path/artifacts/extracted.json" \
    --out "$plan_path/artifacts/auto-picks.md"

  cat >"$plan_path/artifacts/summary.md" <<EOF
# Summary (OSS discovery cycle) — BLOCKED

Plan: \`$plan_path\`

The GitHub **repo metadata fetch** step produced **0 results**, likely due to unauthenticated GitHub API rate limiting.

Fallback: generated \`artifacts/extracted.json\` using the GitHub **Search API** dump (lower fidelity than /repos metadata, but usable for triage).

## Diagnostics

- Search candidates (initial / merged): $search_count / $merged_count
- Repo metadata fetched: $json_count
- Token used: $([[ -n "$token" ]] && echo "yes" || echo "no")

## What you still have

- Live search report: \`artifacts/github-search.md\` (candidate pool)
- Repo tranche list: \`oss/${tranche_name}-repos.txt\` (owner/repo)
- Search extracted JSON: \`artifacts/search-extracted.json\`
- Merged search JSON: \`artifacts/search-extracted-merged.json\`
- Coverage report: \`artifacts/coverage.md\`
- Gap query suggestions: \`artifacts/gap-queries.md\`
- Deepening queue: \`artifacts/deepening-queue.md\`
- Auto picks: \`artifacts/auto-picks.md\`
- Diagnostics: \`artifacts/diagnostics.md\`
- Extracted candidates: \`artifacts/extracted.json\`

## Fast fix

Re-run with a GitHub token (higher API limits):

\`\`\`bash
export GITHUB_TOKEN="<your_token>"
./.blackbox/4-scripts/start-oss-discovery-cycle.sh --tranche-name ${tranche_name}
\`\`\`

## Suggested next run (no token)

If you can’t use a token, reduce calls:

\`\`\`bash
./.blackbox/4-scripts/start-oss-discovery-cycle.sh \\
  --tranche-name ${tranche_name} \\
  --max-total-queries 4 \\
  --max-repos 25
\`\`\`

## Notes

- Without a token, GitHub API limits are easy to hit during repeated cycles.
- This cycle does not clone repos; it only catalogs metadata.
EOF

  cat >"$plan_path/artifacts/sources.md" <<EOF
# Sources

- Base query bank: \`$queries_md\`
- Feature map: \`$feature_map\`
- Derived query bank: \`$derived_queries\`
- Combined query bank: \`$combined_queries\`
- Rotated query bank: \`$rotated_queries\`
- Live search report: \`$search_report\`
- Search extracted JSON: \`$search_json\`
- Merged search JSON: \`$search_json_merged\`
- Repo tranche: \`$repo_list\`

## Notes

- Token used: \`$([[ -n "$token" ]] && echo "yes" || echo "no")\`
- Search filters: min_stars=\`$min_stars\`, include_forks=\`$include_forks\`, include_archived=\`$include_archived\`
- Excludes: keywords=\`$exclude_keywords\`, regex=\`$exclude_regex\`
- Query rotation: enabled=\`$enable_query_rotation\`, state_file=\`$state_file\`
  - Gap boost: enabled=\`$enable_gap_boost\`, max_total_queries=\`$gap_boost_max_total_queries\`, min_count=\`$gap_boost_min_count\`
EOF

echo "Updating cross-run OSS catalog..."
catalog_dir="$docs_root/.blackbox/oss-catalog"
mkdir -p "$catalog_dir"
python3 "$docs_root/.blackbox/4-scripts/research/update_oss_catalog.py" \
  --run-path "$plan_path" \
  --extracted-json "$plan_path/artifacts/extracted.json" \
  --out-catalog "$catalog_dir/catalog.json" \
  --out-index "$catalog_dir/index.md" || echo "WARN: failed to update OSS catalog (non-fatal)" >&2
"$docs_root/.blackbox/4-scripts/render-oss-catalog.sh" --catalog-dir ".blackbox/oss-catalog" \
  || echo "WARN: failed to render OSS catalog artifacts (non-fatal)" >&2

  if [[ -x "$docs_root/.blackbox/4-scripts/new-step.sh" ]]; then
    "$docs_root/.blackbox/4-scripts/new-step.sh" --plan "$plan_path" "OSS discovery cycle blocked (GitHub rate limit)"
  fi

  echo ""
  echo "Blocked (metadata fetch rate limit)."
  echo "- plan: $plan_path"
  echo "- search report: $search_report"
  echo "- tranche list: $repo_list"
  exit 0
fi

echo "Generating triage + shortlist reports..."
python3 "$docs_root/.blackbox/4-scripts/research/summarize_oss_meta.py" \
  --entries-dir "$plan_path/oss/entries" \
  --out "$plan_path/artifacts/oss-triage.md"

python3 "$docs_root/.blackbox/4-scripts/research/build_oss_shortlist.py" \
  --entries-dir "$plan_path/oss/entries" \
  --out "$plan_path/artifacts/oss-shortlist.md" \
  --top 25

python3 "$docs_root/.blackbox/4-scripts/research/score_oss_from_metadata.py" \
  --entries-dir "$plan_path/oss/entries" \
  --out-index "$plan_path/artifacts/oss-index.md" \
  --out-ranked "$plan_path/artifacts/oss-ranked.md"

echo "Exporting extracted candidates artifact..."
python3 "$docs_root/.blackbox/4-scripts/research/export_oss_candidates.py" \
  --entries-dir "$plan_path/oss/entries" \
  --out-json "$plan_path/artifacts/extracted.json" \
  --out-md "$plan_path/artifacts/oss-candidates-extracted.md"

echo "Generating coverage + risk report..."
python3 "$docs_root/.blackbox/4-scripts/research/summarize_oss_coverage.py" \
  --extracted-json "$plan_path/artifacts/extracted.json" \
  --out "$plan_path/artifacts/coverage.md"

echo "Suggesting gap queries..."
python3 "$docs_root/.blackbox/4-scripts/research/suggest_oss_gap_queries.py" \
  --extracted-json "$plan_path/artifacts/extracted.json" \
  --out "$plan_path/artifacts/gap-queries.md"

echo "Generating auto picks..."
python3 "$docs_root/.blackbox/4-scripts/research/summarize_oss_auto_picks.py" \
  --extracted-json "$plan_path/artifacts/extracted.json" \
  --out "$plan_path/artifacts/auto-picks.md"

echo "Generating deepening queue..."
python3 "$docs_root/.blackbox/4-scripts/research/generate_oss_deepening_queue_from_extracted.py" \
  --extracted-json "$plan_path/artifacts/extracted.json" \
  --out "$plan_path/artifacts/deepening-queue.md" \
  --top 20

cat >"$plan_path/work-queue.md" <<EOF
# Work Queue

## Next actions (keep 5–10)
- [ ] Review \`artifacts/oss-ranked.md\` and pick top 10 to deepen
- [ ] Work through \`artifacts/deepening-queue.md\` (fill \`oss/entries/*.md\`)
- [ ] Flag any copyleft/unknown licenses for review
- [ ] Identify 3 “quick wins” (1–2 day POCs) + 3 “platform primitives” we must build
- [ ] Promote best learnings if reusable (optional): \`./.blackbox/4-scripts/promote.sh <plan> <slug>\`
EOF

cat >"$plan_path/artifacts/summary.md" <<EOF
# Summary (OSS discovery cycle)

Plan: \`$plan_path\`

## Start here

- Search report: \`artifacts/github-search.md\`
- Triage table: \`artifacts/oss-triage.md\`
- Ranked shortlist: \`artifacts/oss-ranked.md\`
- Coverage report: \`artifacts/coverage.md\`
- Gap query suggestions: \`artifacts/gap-queries.md\`
- Deepening queue: \`artifacts/deepening-queue.md\`
- Auto picks: \`artifacts/auto-picks.md\`
- Extracted candidates (JSON): \`artifacts/extracted.json\`

## Next actions

- Pick the top ~10–20 candidates and deepen in \`oss/entries/*.md\` (POC slice + 1 week plan + risks).
- Flag any \`license_bucket=flagged\` or unknown licensing for review before integration.
EOF

cat >"$plan_path/artifacts/sources.md" <<EOF
# Sources

- Base query bank: \`$queries_md\`
- Feature map: \`$feature_map\`
- Derived query bank: \`$derived_queries\`
- Combined query bank: \`$combined_queries\`
- Live search report: \`$search_report\`
- Search extracted JSON: \`$search_json\`
- Merged search JSON: \`$search_json_merged\`
- Repo tranche: \`$repo_list\`
- Raw metadata: \`$plan_path/oss/entries/*.json\`
- Entry stubs: \`$plan_path/oss/entries/*.md\`
- Deepening queue: \`$plan_path/artifacts/deepening-queue.md\`
- Extracted candidates: \`$plan_path/artifacts/extracted.json\`
- Coverage report: \`$plan_path/artifacts/coverage.md\`
- Gap query suggestions: \`$plan_path/artifacts/gap-queries.md\`
- Catalog gap queries (if used): \`$plan_path/artifacts/gap-queries.catalog.md\`, \`$plan_path/artifacts/gap-queries.catalog.selected.md\`, \`$plan_path/artifacts/gap-queries.catalog.selected.tags.json\`
- Coverage quota queries (if used): \`$plan_path/artifacts/gap-queries.quota.md\`, \`$plan_path/artifacts/gap-queries.quota.selected.md\`, \`$plan_path/artifacts/gap-queries.quota.selected.tags.json\`
- Auto picks: \`$plan_path/artifacts/auto-picks.md\`
- Diagnostics: \`$plan_path/artifacts/diagnostics.md\`

## Notes

- Token used: \`$([[ -n "$token" ]] && echo "yes" || echo "no")\` (set \`GITHUB_TOKEN\` to avoid rate limits)
- This cycle catalogs metadata only; it does not clone or vendor code.
- Search filters: min_stars=\`$min_stars\`, include_forks=\`$include_forks\`, include_archived=\`$include_archived\`
- Excludes: keywords=\`$exclude_keywords\`, regex=\`$exclude_regex\`
- Query rotation: enabled=\`$enable_query_rotation\`, state_file=\`$state_file\`
- Gap boost: enabled=\`$enable_gap_boost\`, max_total_queries=\`$gap_boost_max_total_queries\`, min_count=\`$gap_boost_min_count\`
- Recent tag cache: window=\`$gap_tag_recent_window\`, state_recent_tags=\`$recent_gap_tags_snapshot\`
- Diagnostics snapshot: search_count=$search_count, gap_count=$gap_count, merged_count=$merged_count, metadata_json_count=$json_count
EOF

echo "Updating cross-run OSS catalog..."
catalog_dir="$docs_root/.blackbox/oss-catalog"
mkdir -p "$catalog_dir"
python3 "$docs_root/.blackbox/4-scripts/research/update_oss_catalog.py" \
  --run-path "$plan_path" \
  --extracted-json "$plan_path/artifacts/extracted.json" \
  --out-catalog "$catalog_dir/catalog.json" \
  --out-index "$catalog_dir/index.md" || echo "WARN: failed to update OSS catalog (non-fatal)" >&2
"$docs_root/.blackbox/4-scripts/render-oss-catalog.sh" --catalog-dir ".blackbox/oss-catalog" \
  || echo "WARN: failed to render OSS catalog artifacts (non-fatal)" >&2

if [[ -x "$docs_root/.blackbox/4-scripts/new-step.sh" ]]; then
  "$docs_root/.blackbox/4-scripts/new-step.sh" --plan "$plan_path" "OSS discovery cycle completed"
fi

echo ""
echo "Done."
echo "- plan: $plan_path"
echo "- search report: $search_report"
echo "- tranche list: $repo_list"
echo "- triage table: $plan_path/artifacts/oss-triage.md"
