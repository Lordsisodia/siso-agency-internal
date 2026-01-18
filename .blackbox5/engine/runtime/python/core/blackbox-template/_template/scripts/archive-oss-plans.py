#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass
from pathlib import Path


PLAN_DIR_RE = re.compile(r"^(?P<date>\d{4}-\d{2}-\d{2})_(?P<time>\d{4})_(?P<rest>.+)$")
LEDGER_REF_RE = re.compile(r"docs/\.blackbox/\agents/.plans/([^/]+)/")


@dataclass(frozen=True)
class PlanDir:
    name: str
    date: str
    time: str
    rest: str
    path: Path

    @property
    def month(self) -> str:
        return self.date[:7]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Archive high-frequency OSS plan folders under docs/.blackbox/.plans by count (not age), "
            "keeping the newest N and protecting ledger-referenced + pinned runs."
        )
    )
    parser.add_argument(
        "--keep-latest",
        type=int,
        default=12,
        help="Keep the newest N OSS plan folders in agents/.plans/ (default: 12).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would move, but do not move anything.",
    )
    parser.add_argument(
        "--rest-prefix",
        default="oss-",
        help=(
            "Only archive plan folders whose <rest> segment starts with this prefix "
            "(default: oss-)."
        ),
    )
    parser.add_argument(
        "--keep-file",
        default=".keep",
        help="If a plan folder contains this file, it will never be archived (default: .keep).",
    )
    parser.add_argument(
        "--ledger",
        default="08-meta/repo/docs-ledger.md",
        help=(
            "Docs ledger path (relative to docs/) used to protect referenced plan folders "
            "(default: 08-meta/repo/docs-ledger.md)."
        ),
    )
    parser.add_argument(
        "--plans-dir",
        default=".blackbox/.plans",
        help="Plans directory path (relative to docs/) (default: .blackbox/.plans).",
    )
    parser.add_argument(
        "--archive-root",
        default="",
        help=(
            "Archive root (relative to docs/). Default is <plans-dir>/_archive. "
            "Example: .blackbox/agents/.plans/_archive"
        ),
    )
    return parser.parse_args()


def load_ledger_refs(docs_root: Path, ledger_rel: str) -> set[str]:
    ledger_path = docs_root / ledger_rel
    if not ledger_path.exists():
        # Best-effort: if ledger isn't present, don't fail the cleanup.
        return set()
    text = ledger_path.read_text(encoding="utf-8")
    return set(LEDGER_REF_RE.findall(text))


def iter_plan_dirs(plans_dir: Path) -> list[PlanDir]:
    out: list[PlanDir] = []
    for child in plans_dir.iterdir():
        if not child.is_dir():
            continue
        if child.name.startswith("."):
            continue
        if child.name.startswith("_"):
            continue

        match = PLAN_DIR_RE.match(child.name)
        if not match:
            continue

        out.append(
            PlanDir(
                name=child.name,
                date=match.group("date"),
                time=match.group("time"),
                rest=match.group("rest"),
                path=child,
            )
        )
    return out


def main() -> int:
    args = parse_args()
    if args.keep_latest < 0:
        raise SystemExit("--keep-latest must be >= 0")

    docs_root = Path(__file__).resolve().parents[2]  # .../docs/.blackbox/scripts/archive-oss-plans.py
    plans_dir = docs_root / args.plans_dir
    if not plans_dir.exists():
        print(f"ERROR: plans dir not found: {plans_dir}")
        return 2

    archive_root = docs_root / args.archive_root if args.archive_root else plans_dir / "_archive"
    refs = load_ledger_refs(docs_root, args.ledger)

    all_plans = iter_plan_dirs(plans_dir)
    oss_plans = [p for p in all_plans if p.rest.startswith(args.rest_prefix)]
    oss_sorted = sorted(oss_plans, key=lambda p: p.name, reverse=True)

    keep_latest = set()
    if args.keep_latest > 0:
        keep_latest = {p.name for p in oss_sorted[: args.keep_latest]}

    pinned_by_keep_file = {p.name for p in oss_sorted if args.keep_file and (p.path / args.keep_file).exists()}

    protected = set()
    protected |= refs
    protected |= pinned_by_keep_file
    protected |= keep_latest

    # Move everything beyond keep_latest, excluding protected.
    candidates = [p for p in oss_sorted[args.keep_latest :] if p.name not in protected]

    print("OSS plans archive-by-count")
    print(f"- plans_dir: {plans_dir.relative_to(docs_root)}")
    print(f"- archive_root: {archive_root.relative_to(docs_root)}")
    print(f"- dry_run: {'yes' if args.dry_run else 'no'}")
    print(f"- total_plans: {len(all_plans)}")
    print(f"- oss_plans: {len(oss_plans)}")
    print(f"- keep_latest: {args.keep_latest}")
    print(f"- protected_by_ledger_refs: {len(refs)}")
    print(f"- protected_by_keep_file: {len(pinned_by_keep_file)}")
    print(f"- move_to_archive_count: {len(candidates)}")

    if not candidates:
        return 0

    for plan in candidates:
        dest_dir = archive_root / plan.month
        dest = dest_dir / plan.name
        print(f"- move: {plan.path.relative_to(docs_root)} -> {dest.relative_to(docs_root)}")

        if args.dry_run:
            continue

        dest_dir.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            print(f"ERROR: destination already exists: {dest.relative_to(docs_root)}")
            return 1

        os.rename(plan.path, dest)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

