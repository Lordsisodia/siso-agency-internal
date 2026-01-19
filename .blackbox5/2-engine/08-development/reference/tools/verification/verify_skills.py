#!/usr/bin/env python3
"""
BlackBox5 Skills Verification Script
Verifies all skills in the registry are present
"""

import sys
from pathlib import Path
import yaml

def main():
    # Get paths
    script_dir = Path(__file__).parent.parent
    skills_base = script_dir / "engine" / "agents" / "skills"
    registry_path = skills_base / "SKILLS-REGISTRY.yaml"

    # Load registry
    with open(registry_path, 'r') as f:
        registry = yaml.safe_load(f)

    skills = registry['skills']
    total = len(skills)
    verified = 0
    failed = []

    print("\n" + "="*60)
    print("BlackBox5 Skills Verification")
    print("="*60)

    for skill in skills:
        skill_path = skills_base / skill['path'] / "SKILL.md"
        if skill_path.exists():
            verified += 1
            print(f"✅ {skill['name']}")
        else:
            failed.append(skill['name'])
            print(f"❌ {skill['name']} - NOT FOUND")

    print("\n" + "="*60)
    print(f"Total: {total}")
    print(f"Verified: ✅ {verified}")
    print(f"Failed: ❌ {len(failed)}")

    if verified == total:
        print("\n🎉 All skills verified successfully!")
        print(f"\nSkills directory: {skills_base}")
        print(f"Registry: {registry_path}")
    else:
        print(f"\n⚠️  {len(failed)} skill(s) missing:")
        for name in failed:
            print(f"  - {name}")

    print("="*60 + "\n")

    # Show by category
    print("\nSkills by Category:")
    print("-"*60)

    by_category = {}
    for skill in skills:
        cat = skill['category']
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(skill)

    for category, cat_skills in sorted(by_category.items()):
        print(f"\n{category}: {len(cat_skills)} skills")
        for skill in cat_skills:
            print(f"  - {skill['name']}")

    sys.exit(0 if verified == total else 1)

if __name__ == '__main__':
    main()
