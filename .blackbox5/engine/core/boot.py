#!/usr/bin/env python3
import os
import sys
import yaml
from pathlib import Path

def load_schema():
    # Schema is in the same directory (core)
    schema_path = Path(__file__).parent / "schema.yaml"
    with open(schema_path, "r") as f:
        return yaml.safe_load(f)

def boot():
    print("🔌 Black Box 5 Kernel Booting...")
    
    # We are in engine/core/boot.py
    # Root is where we ran the script from (usually project root or .blackbox5)
    root = Path(os.getcwd())
    
    # 1. Load Schema
    try:
        schema = load_schema()
        print(f"✅ Schema Loaded (v{schema.get('version', 'unknown')})")
    except Exception as e:
        print(f"❌ Failed to load schema: {e}")
        sys.exit(1)
        
    # Define Roots
    # We assume config.yml is in the container root (.blackbox5)
    if (root / "config.yml").exists():
        container_root = root
    elif (root / ".blackbox5/config.yml").exists():
        container_root = root / ".blackbox5"
    else:
        # Fallback: ../.. from engine/core/boot.py
        container_root = Path(__file__).parent.parent.parent.resolve()
        
    project_root = container_root.parent
    print(f"📂 Container: {container_root.name}")
    print(f"🏠 Project:   {project_root.name}")

    # 2. Validate & Create Directories
    print("🛠️  Verifying Memory Structure...")
    for directory in schema.get("directories", []):
        path = container_root / directory["path"]
        if not path.exists():
            if directory.get("auto_create", False):
                print(f"   + Creating {directory['path']}...")
                path.mkdir(parents=True, exist_ok=True)
            else:
                print(f"   ! Missing required directory: {directory['path']}")
        else:
            print(f"   . Found {directory['path']}")

    # 3. Check Required Files
    print("Checking System Files...")
    for file_def in schema.get("files", []):
        path = container_root / file_def["path"]
        if not path.exists():
            print(f"   ! Missing {file_def['path']}")
            if "generator" in file_def:
                gen_script = file_def["generator"]
                print(f"     -> Auto-generating via {gen_script}...")
                
                try:
                    # Dynamically import tool from sibling directory '../tools'
                    import sys
                    tools_path = Path(__file__).parent.parent / "tools"
                    sys.path.append(str(tools_path))
                    
                    # Assume generator name 'indexer.py' metadata maps to module 'indexer'
                    module_name = gen_script.replace(".py", "")
                    module = __import__(module_name)
                    
                    # Pass PROJECT root to scan, but output to CONTAINER root
                    module.generate_index(root_dir=str(project_root), output_file=str(path))
                    print(f"     ✅ Generated {file_def['path']}")
                except Exception as e:
                    print(f"     ❌ Generation failed: {e}")
        else:
            print(f"   . Found {file_def['path']}")

    print("🟢 Kernel Ready.")

if __name__ == "__main__":
    boot()
