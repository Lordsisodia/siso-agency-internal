#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import os
import re
from pathlib import Path


PLAN_DIR_RE = re.compile(r"^(?P<date>\d{4}-\d{2}-\d{2})_")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Archive old plan folders under docs/.blackbox/agents/.plans/ into agents/.plans/_archive/YYYY-MM/."
        )
    )
    parser.add_argument(
        "--older-than-days",
        type=int,
        default=14,
        help="Archive runs whose YYYY-MM-DD prefix is older than this many days (default: 14).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would move, but do not move anything.",
    )
    parser.add_argument(
        "--keep-file",
        default=".keep",
        help="If a plan folder contains this file, it will never be archived (default: .keep).",
    )
    parser.add_argument(
        "--pin",
        action="append",
        default=[],
        help="Glob pattern (matched against plan folder name) to exclude from archiving; repeatable.",
    )
    parser.add_argument(
        "--keep-modified-within-days",
        type=int,
        default=3,
        help=(
            "If a plan folder was modified within this many days, do not archive it "
            "(default: 3). Set to 0 to disable."
        ),
    )
    parser.add_argument(
        "--keep-latest",
        type=int,
        default=5,
        help="Never archive the newest N plan folders (default: 5). Set to 0 to disable.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.older_than_days < 0:
        raise SystemExit("--older-than-days must be >= 0")
    if args.keep_modified_within_days < 0:
        raise SystemExit("--keep-modified-within-days must be >= 0")
    if args.keep_latest < 0:
        raise SystemExit("--keep-latest must be >= 0")

    docs_root = Path(__file__).resolve().parents[2]  # .../docs/.blackbox/scripts/archive-plans.py
    plans_dir = docs_root / ".blackbox" / ".plans"
    archive_root = plans_dir / "_archive"

    if not plans_dir.exists():
        print(f"ERROR: plans dir not found: {plans_dir}")
        return 2

    today = dt.date.today()
    cutoff = today - dt.timedelta(days=args.older_than_days)
    modified_cutoff = today - dt.timedelta(days=args.keep_modified_within_days)

    # Always keep newest N (by folder name, which includes YYYY-MM-DD_HHMM* prefix).
    keep_names: set[str] = set()
    if args.keep_latest > 0:
        plan_dirs = [
            p
            for p in plans_dir.iterdir()
            if p.is_dir() and not p.name.startswith(".") and not p.name.startswith("_")
        ]
        plan_dirs_sorted = sorted(plan_dirs, key=lambda p: p.name, reverse=True)
        keep_names = {p.name for p in plan_dirs_sorted[: args.keep_latest]}

    candidates: list[tuple[dt.date, Path]] = []
    for child in sorted(plans_dir.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith("."):
            continue
        if child.name.startswith("_"):
            continue
        if child.name in keep_names:
            continue
        if args.keep_file and (child / args.keep_file).exists():
            continue
        if args.pin and any(Path(child.name).match(pat) or child.name == pat for pat in args.pin):
            continue
        if args.keep_modified_within_days > 0:
            mtime = dt.datetime.fromtimestamp(child.stat().st_mtime).date()
            if mtime >= modified_cutoff:
                continue

        match = PLAN_DIR_RE.match(child.name)
        if not match:
            continue

        try:
            run_date = dt.date.fromisoformat(match.group("date"))
        except ValueError:
            continue

        if run_date <= cutoff:
            candidates.append((run_date, child))

    if not candidates:
        print("No plan folders eligible for archiving.")
        print(f"- cutoff: {cutoff.isoformat()} (older-than-days={args.older_than_days})")
        return 0

    print(f"Eligible plan folders: {len(candidates)}")
    print(f"- cutoff: {cutoff.isoformat()} (older-than-days={args.older_than_days})")
    print(f"- dry_run: {'yes' if args.dry_run else 'no'}")

    for run_date, src in candidates:
        month = run_date.strftime("%Y-%m")
        dest_dir = archive_root / month
        dest = dest_dir / src.name
        print(f"- move: {src.relative_to(docs_root)} -> {dest.relative_to(docs_root)}")

        if args.dry_run:
            continue

        dest_dir.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            print(f"ERROR: destination already exists: {dest.relative_to(docs_root)}")
            return 1

        os.rename(src, dest)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
