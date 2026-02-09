#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path


def is_hidden(path: Path) -> bool:
    return path.name.startswith(".")


def main() -> int:
    docs = Path(__file__).resolve().parents[2]  # .../docs/.blackbox/scripts/validate-docs.py
    repo_root = docs.parent

    if not docs.exists():
        print("FAIL: expected docs/ folder at repo root")
        return 1

    # Rule 1: docs/ has 6–10 visible root folders
    roots = sorted([p for p in docs.iterdir() if p.is_dir() and not is_hidden(p)])
    if not (6 <= len(roots) <= 10):
        print(f"FAIL: expected 6–10 visible root folders in docs/, got {len(roots)}")
        for p in roots:
            print(f"- {p.name}")
        return 1

    # `.blackbox` rule: allow only docs/.blackbox (root-level)
    stray_blackboxes = []
    for p in docs.rglob(".blackbox"):
        if p == docs / ".blackbox":
            continue
        if p.is_dir():
            stray_blackboxes.append(p)

    if stray_blackboxes:
        print("FAIL: found nested .blackbox folders (only docs/.blackbox is allowed):")
        for p in sorted(stray_blackboxes):
            print(f"- {p.relative_to(repo_root)}")
        return 1

    # Rule 2: each root folder has README.md and 1–10 direct child folders
    for root in roots:
        readme = root / "README.md"
        if not readme.exists():
            print(f"FAIL: missing README: {readme.relative_to(repo_root)}")
            return 1

        children = [p for p in root.iterdir() if p.is_dir() and not is_hidden(p)]
        if not (1 <= len(children) <= 10):
            print(
                f"FAIL: expected 1–10 direct child folders in {root.name}/, got {len(children)}"
            )
            for c in sorted(children):
                print(f"- {c.name}")
            return 1

    # Soft requirements (brain/backbone live in docs/.blackbox)
    infra_missing = []
    for p in (docs / ".blackbox" / "docs-ledger.md", docs / ".blackbox" / "information-routing.md"):
        if not p.exists():
            infra_missing.append(p)

    print("OK")
    print(f"- roots: {len(roots)}")
    for root in roots:
        children = [p for p in root.iterdir() if p.is_dir() and not is_hidden(p)]
        print(f"- {root.name}: child_dirs={len(children)}")

    if infra_missing:
        print("WARN: missing docs blackbox infrastructure files:")
        for p in infra_missing:
            print(f"- {p.relative_to(repo_root)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

