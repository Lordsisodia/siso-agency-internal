#!/usr/bin/env python3
"""
Move actually used components to appropriate locations:
- MorningRoutineTimer → src/components/timers/
- RealTaskManager → src/ecosystem/internal/tasks/components/
- CollapsibleTaskCard → src/ecosystem/internal/tasks/ui/
- TimeBlockView → src/ecosystem/internal/dashboard/components/
- APITester, FeatureFlagTester → src/test/utilities/
"""

import os
import shutil
from pathlib import Path

AI_FIRST = Path("ai-first")
SRC = Path("src")

# Files actually used (from grep analysis)
SALVAGE_MAP = {
    # Component → Target location
    "shared/components/MorningRoutineTimer.tsx": "components/timers/MorningRoutineTimer.tsx",
    "features/tasks/components/RealTaskManager.tsx": "ecosystem/internal/tasks/components/RealTaskManager.tsx",
    "features/tasks/ui/CollapsibleTaskCard.tsx": "ecosystem/internal/tasks/ui/CollapsibleTaskCard.tsx",
    "features/dashboard/components/TimeBlockView.tsx": "ecosystem/internal/dashboard/components/TimeBlockView.tsx",
    "shared/components/APITester.tsx": "test/utilities/APITester.tsx",
    "shared/components/FeatureFlagTester.tsx": "test/utilities/FeatureFlagTester.tsx",
}

def salvage_files():
    """Move valuable components to proper locations"""
    
    print("💾 Salvaging valuable components...")
    print("=" * 60)
    
    salvaged = 0
    not_found = 0
    
    for src_rel, dst_rel in SALVAGE_MAP.items():
        src_path = AI_FIRST / src_rel
        dst_path = SRC / dst_rel
        
        if not src_path.exists():
            print(f"⚠️  Not found: {src_rel}")
            not_found += 1
            continue
        
        # Create destination directory
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file (don't move yet, in case of issues)
        shutil.copy2(src_path, dst_path)
        salvaged += 1
        print(f"✅ {src_rel}")
        print(f"   → {dst_rel}")
    
    print()
    print("=" * 60)
    print(f"✅ Salvaged: {salvaged}")
    print(f"⚠️  Not found: {not_found}")
    print("=" * 60)
    
    return salvaged

if __name__ == "__main__":
    salvaged = salvage_files()

