#!/usr/bin/env python3
"""
Ralph Runtime - Direct execution script
Runs Ralph without module path issues
"""

import sys
import asyncio
from pathlib import Path
import importlib.util

# Force fresh load by removing from cache if present
if 'ralph_runtime' in sys.modules:
    del sys.modules['ralph_runtime']

# Load Ralph module fresh
ralph_path = Path.cwd() / ".blackbox5" / "engine" / "runtime" / "ralph" / "ralph_runtime.py"
spec = importlib.util.spec_from_file_location("ralph_runtime", ralph_path)
ralph_module = importlib.util.module_from_spec(spec)
sys.modules['ralph_runtime'] = ralph_module
spec.loader.exec_module(ralph_module)

async def main():
    workspace = Path.cwd()
    prd = workspace / "prd-framework-research.json"

    print(f"Workspace: {workspace}")
    print(f"PRD: {prd}")
    print("")

    if not prd.exists():
        print(f"❌ PRD not found: {prd}")
        sys.exit(1)

    await ralph_module.run_ralph(
        workspace_path=str(workspace),
        prd_path=str(prd),
        max_iterations=10
    )

if __name__ == '__main__':
    asyncio.run(main())
