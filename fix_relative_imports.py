#!/usr/bin/env python3
"""
Convert relative imports to absolute @/ imports in tasks directory
"""

import re
from pathlib import Path

TASKS_DIR = Path("src/ecosystem/internal/tasks")

REPLACEMENTS = {
    # Constants
    r"from ['\"]\.\.\/constants\/taskConstants['\"]": "from '@/ecosystem/internal/tasks/constants/taskConstants'",
    r"from ['\"]\.\.\/\.\.\/constants\/taskConstants['\"]": "from '@/ecosystem/internal/tasks/constants/taskConstants'",
    
    # Types
    r"from ['\"]\.\.\/types\/task\.types['\"]": "from '@/ecosystem/internal/tasks/types/task.types'",
    r"from ['\"]\.\.\/\.\.\/types\/task\.types['\"]": "from '@/ecosystem/internal/tasks/types/task.types'",
    r"from ['\"]\.\.\/\.\.\/\.\.\/types\/task\.types['\"]": "from '@/ecosystem/internal/tasks/types/task.types'",
    r"from ['\"]\.\.\/\.\.\/\.\.\/\.\.\/features\/tasks\/types\/task\.types['\"]": "from '@/ecosystem/internal/tasks/types/task.types'",
    
    # Utils
    r"from ['\"]\.\.\/utils\/taskCardUtils['\"]": "from '@/ecosystem/internal/tasks/utils/taskCardUtils'",
    r"from ['\"]\.\.\/\.\.\/utils\/taskCardUtils['\"]": "from '@/ecosystem/internal/tasks/utils/taskCardUtils'",
    r"from ['\"]\.\.\/utils\/taskHelpers['\"]": "from '@/ecosystem/internal/tasks/utils/taskHelpers'",
    
    # Views
    r"from ['\"]\.\.\/views\/KanbanView['\"]": "from '@/ecosystem/internal/tasks/views/KanbanView'",
    r"from ['\"]\.\.\/views\/ListView['\"]": "from '@/ecosystem/internal/tasks/views/ListView'",
}

def fix_file(file_path):
    """Fix relative imports in file"""
    try:
        content = file_path.read_text()
        original = content
        
        for pattern, replacement in REPLACEMENTS.items():
            content = re.sub(pattern, replacement, content)
        
        if content != original:
            file_path.write_text(content)
            return True
        return False
    except:
        return False

def main():
    print("🔧 Converting relative to absolute imports...")
    print("=" * 60)
    
    fixed = 0
    
    for file_path in TASKS_DIR.rglob("*.ts"):
        if fix_file(file_path):
            fixed += 1
            print(f"✅ {file_path.relative_to(TASKS_DIR)}")
    
    for file_path in TASKS_DIR.rglob("*.tsx"):
        if fix_file(file_path):
            fixed += 1
            print(f"✅ {file_path.relative_to(TASKS_DIR)}")
    
    print()
    print("=" * 60)
    print(f"✅ Fixed: {fixed} files")
    print("=" * 60)

if __name__ == "__main__":
    main()

