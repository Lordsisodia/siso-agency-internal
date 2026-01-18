#!/usr/bin/env python3
"""
Documentation Validator for Blackbox3

Validates documentation structure and compliance:
- Root folder count (6-10 visible folders)
- README.md in each root folder
- Child folder count (1-10 per root)
- No nested .blackbox folders
- Infrastructure files present

No third-party dependencies.
"""

from __future__ import annotations

import sys
from pathlib import Path


def is_hidden(path: Path) -> bool:
    """Check if path is hidden (starts with .)."""
    return path.name.startswith(".")


def main() -> int:
    # Find Blackbox3 root
    script_path = Path(__file__).resolve()
    box_root = script_path.parent.parent

    if not (box_root / "manifest.yaml").exists():
        print("FAIL: expected manifest.yaml at Blackbox3 root")
        return 1

    docs_root = box_root / "docs"
    if not docs_root.exists():
        # If no docs/ folder, check root structure directly
        docs_root = box_root

    # Rule 1: 6-10 visible root folders
    roots = sorted([p for p in docs_root.iterdir() if p.is_dir() and not is_hidden(p)])
    if not (6 <= len(roots) <= 10):
        print(f"FAIL: expected 6-10 visible root folders, got {len(roots)}")
        for p in roots:
            print(f"- {p.name}")
        return 1

    # Rule 2: no nested .blackbox folders (only root-level)
    stray_blackboxes = []
    for p in docs_root.rglob(".blackbox"):
        if p == docs_root / ".blackbox":
            continue
        if p.is_dir():
            stray_blackboxes.append(p)

    if stray_blackboxes:
        print("FAIL: found nested .blackbox folders (only root-level .blackbox allowed):")
        for p in sorted(stray_blackboxes):
            print(f"- {p.relative_to(box_root)}")
        return 1

    # Rule 3: each root folder has README.md and 1-10 child folders
    for root in roots:
        readme = root / "README.md"
        if not readme.exists():
            print(f"FAIL: missing README: {readme.relative_to(box_root)}")
            return 1

        children = [p for p in root.iterdir() if p.is_dir() and not is_hidden(p)]
        if not (1 <= len(children) <= 10):
            print(f"FAIL: expected 1-10 child folders in {root.name}/, got {len(children)}")
            for c in sorted(children):
                print(f"- {c.name}")
            return 1

    # Soft requirements (infrastructure files)
    infra_missing = []
    for p in [
        docs_root / ".blackbox" / "docs-ledger.md",
        docs_root / ".blackbox" / "information-routing.md",
    ]:
        if not p.exists():
            infra_missing.append(p)

    print("OK")
    print(f"- roots: {len(roots)}")
    for root in roots:
        children = [p for p in root.iterdir() if p.is_dir() and not is_hidden(p)]
        print(f"- {root.name}: child_dirs={len(children)}")

    if infra_missing:
        print("WARN: missing infrastructure files:")
        for p in infra_missing:
            print(f"- {p.relative_to(box_root)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
