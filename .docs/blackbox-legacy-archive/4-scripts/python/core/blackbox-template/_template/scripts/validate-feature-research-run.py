#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Requirement:
    path: str
    must_contain_any: tuple[str, ...] = ()


def read_text(p: Path) -> str:
    return p.read_text("utf-8", errors="replace")


def is_effectively_empty(text: str) -> bool:
    return not any(ch.strip() for ch in text)


def yaml_value(key: str, text: str) -> str | None:
    m = re.search(rf"^\s*{re.escape(key)}:\s*(.+?)\s*$", text, re.MULTILINE)
    if not m:
        return None
    raw = m.group(1).strip()
    if "#" in raw:
        raw = raw.split("#", 1)[0].strip()
    if raw.startswith('"') and raw.endswith('"') and len(raw) >= 2:
        raw = raw[1:-1]
    return raw.strip()


def is_tbd(value: str | None) -> bool:
    if value is None:
        return True
    return value.strip().upper() in {"", "TBD", "TO BE DETERMINED"}


def count_competitor_seed_entries(text: str) -> int:
    """
    Counts non-comment, non-empty lines that look like:
      name|category|https://...|notes
    """
    n = 0
    for line in text.splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#"):
            continue
        if "|" not in raw:
            continue
        if "http://" not in raw and "https://" not in raw:
            continue
        n += 1
    return n


def validate(plan_dir: Path, requirements: list[Requirement]) -> list[str]:
    errors: list[str] = []
    for req in requirements:
        p = plan_dir / req.path
        if not p.exists():
            errors.append(f"Missing: {req.path}")
            continue
        txt = read_text(p)
        if is_effectively_empty(txt):
            errors.append(f"Empty: {req.path}")
            continue
        if req.must_contain_any:
            if not any(token in txt for token in req.must_contain_any):
                errors.append(f"Missing expected section in {req.path}: one of {list(req.must_contain_any)}")
    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description="Lightweight validator for feature-research plan artifacts.")
    ap.add_argument("--plan", required=True, help="Plan directory (docs/.blackbox/agents/.plans/<run>).")
    ap.add_argument(
        "--kind",
        required=True,
        choices=["step-01", "step-02", "step-03", "step-04", "synthesis"],
        help="Which feature-research run this plan represents.",
    )
    args = ap.parse_args()

    plan_dir = Path(args.plan)
    if not plan_dir.exists() or not plan_dir.is_dir():
        print(f"FAIL: plan dir not found: {plan_dir}", file=sys.stderr)
        return 2

    kind = args.kind
    reqs: list[Requirement] = []

    # All plans must have feature-research config and decisions set (no TBD).
    cfg_path = "artifacts/feature-research-config.yaml"
    reqs.append(Requirement(cfg_path, must_contain_any=("# AUTO-GENERATED: feature-research config", "decisions:")))

    # All plans should have the generic summary + sources.
    reqs.extend(
        [
            Requirement("artifacts/summary.md", must_contain_any=("#", "##", "- ")),
            Requirement("artifacts/sources.md", must_contain_any=("-", "http", "https")),
        ]
    )

    if kind == "step-01":
        reqs.extend(
            [
                Requirement("artifacts/start-here.md", must_contain_any=("Start Here", "Prompt pack", "Expected artifacts")),
                Requirement("artifacts/features-catalog.md", must_contain_any=("## Feature list", "## Feature list", "Feature:")),
                Requirement("artifacts/oss-catalog.md", must_contain_any=("## Entries", "Repo:", "License:")),
                Requirement("artifacts/search-log.md", must_contain_any=("## Log entries", "Query:", "Source:")),
            ]
        )
    elif kind in {"step-02", "step-03"}:
        reqs.extend(
            [
                Requirement("artifacts/start-here.md", must_contain_any=("Start Here", "Prompt pack", "Expected artifacts")),
                Requirement("artifacts/competitor-seeds.txt", must_contain_any=("|", "http://", "https://")),
                Requirement("artifacts/competitor-matrix.md", must_contain_any=("## 2) Breadth list", "## 3) Winners deepened", "Winners")),
            ]
        )
    elif kind == "step-04":
        reqs.extend(
            [
                Requirement("artifacts/start-here.md", must_contain_any=("Start Here", "Prompt pack", "Expected artifacts")),
                Requirement("artifacts/oss-candidates.md", must_contain_any=("## 1) Longlist", "Longlist", "Repo")),
                Requirement("artifacts/build-vs-buy.md", must_contain_any=("| Need |", "Recommendation", "build / integrate / buy")),
            ]
        )
    elif kind == "synthesis":
        reqs.extend(
            [
                Requirement("artifacts/kickoff.md", must_contain_any=("Kickoff", "Fast setup", "validate_feature_research_config.py")),
                Requirement("artifacts/start-here.md", must_contain_any=("Start Here", "Prompt pack", "Expected artifacts")),
                Requirement(
                    "artifacts/final-synthesis.md",
                    must_contain_any=(
                        "# Final Synthesis",
                        "Final Synthesis",
                        "The single best next move",
                        "## 1) Top 10 things to build next",
                        "## Top 10",
                        "Top 10",
                        "## 2) Top OSS accelerators",
                        "Build vs Integrate vs Buy",
                    ),
                ),
                Requirement(
                    "artifacts/features-ranked.md",
                    must_contain_any=(
                        "Scorecard",
                        "Scores (0–10):",
                        "Total (/50):",
                        "## Scoring rubric",
                        "## Top 30",
                        "Top 30",
                    ),
                ),
                Requirement(
                    "artifacts/oss-ranked.md",
                    must_contain_any=(
                        # Accept either the old “scorecard” format or the newer
                        # metadata-scored shortlist format.
                        "OSS Ranked Shortlist",
                        "## 1)",
                        "— score ",
                        "- URL:",
                        "## Scoring rubric",
                        "Top 50",
                    ),
                ),
                Requirement(
                    "artifacts/open-questions.md",
                    must_contain_any=(
                        "# Open Questions",
                        "Open Questions",
                        "Decisions Needed",
                        "Decision Log",
                        "Recommendation:",
                        "Options:",
                        "1)",
                        "License policy",
                        "Target user",
                    ),
                ),
                Requirement(
                    "artifacts/evidence-index.md",
                    must_contain_any=(
                        "# Evidence Index",
                        "Top 10 crosswalk",
                        "| Rank | Feature",
                        "Best competitors",
                        "Best OSS",
                        "Evidence links",
                    ),
                ),
            ]
        )

        # Synthesis summary has a dedicated structure.
        reqs.append(
            Requirement(
                "artifacts/summary.md",
                must_contain_any=(
                    "Summary (Synthesis",
                    "## 🔥 Top 10 recommendations",
                    "## 🧩 Top 10 OSS accelerators",
                    "Top 10 recommendations",
                ),
            )
        )

    errors = validate(plan_dir, reqs)

    # Validate decisions are set (no TBD) if the config exists.
    cfg_file = plan_dir / cfg_path
    if cfg_file.exists():
        cfg_txt = read_text(cfg_file)
        target_user_first = yaml_value("target_user_first", cfg_txt)
        license_policy = yaml_value("license_policy", cfg_txt)
        if is_tbd(target_user_first):
            errors.append(f"TBD decision in {cfg_path}: target_user_first")
        if is_tbd(license_policy):
            errors.append(f"TBD decision in {cfg_path}: license_policy")

    # Step 02/03 should include at least 1 real seed entry (comments-only is not sufficient).
    if kind in {"step-02", "step-03"}:
        seeds_file = plan_dir / "artifacts/competitor-seeds.txt"
        if seeds_file.exists():
            seeds_txt = read_text(seeds_file)
            if count_competitor_seed_entries(seeds_txt) < 1:
                errors.append("No competitor seed entries found in artifacts/competitor-seeds.txt (comments-only)")

    if errors:
        print("FAIL")
        for e in errors:
            print(f"- {e}")
        return 1

    print("OK")
    print(f"- plan: {plan_dir}")
    print(f"- kind: {kind}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
