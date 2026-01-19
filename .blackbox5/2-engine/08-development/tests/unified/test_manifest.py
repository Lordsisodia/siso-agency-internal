#!/usr/bin/env python3
"""
Test script to demonstrate the Manifest System
"""

import sys
import time
from pathlib import Path

# Add engine to path
sys.path.insert(0, str(Path(__file__).parent))

from manifest import ManifestSystem

def main():
    """Demonstrate manifest system usage."""
    # Initialize manifest system
    manifest_system = ManifestSystem()

    print("Creating manifest for a sample task execution...")

    # Create a manifest for a task execution
    manifest = manifest_system.create_manifest(
        operation_type="task_execution",
        metadata={
            "task_id": "task-123",
            "task_description": "Create a REST API for user management",
            "agent": "coder"
        }
    )

    print(f"Created manifest: {manifest.id}")
    print(f"Type: {manifest.type}")
    print(f"Status: {manifest.status.value}")

    # Add execution steps
    manifest_system.start_step(
        manifest,
        "task_analysis",
        {
            "complexity_score": 0.6,
            "estimated_steps": 15,
            "tools_required": ["code_generation", "testing"]
        }
    )
    print("\nStep 1: Task analysis completed")

    time.sleep(1)  # Simulate work

    manifest_system.start_step(
        manifest,
        "code_generation",
        {
            "files_created": 5,
            "lines_of_code": 250,
            "endpoints": ["GET /users", "POST /users", "PUT /users/:id", "DELETE /users/:id"]
        }
    )
    print("Step 2: Code generation completed")

    time.sleep(1)  # Simulate work

    manifest_system.start_step(
        manifest,
        "testing",
        {
            "tests_written": 10,
            "coverage": 85,
            "all_passed": True
        }
    )
    print("Step 3: Testing completed")

    # Complete the manifest
    manifest_system.complete_manifest(
        manifest,
        result={
            "success": True,
            "files": ["user_controller.py", "user_routes.py", "user_model.py"],
            "test_results": "10/10 tests passed"
        }
    )

    print(f"\nManifest completed: {manifest.id}")
    print(f"Status: {manifest.status.value}")
    print(f"Completed at: {manifest.completed_at}")

    # List all manifests
    print("\n" + "="*60)
    print("All manifests in system:")
    print("="*60)
    manifests = manifest_system.list_manifests()
    for m in manifests:
        print(f"- {m.id}: {m.type} ({m.status.value})")

    print("\n" + "="*60)
    print(f"Manifest saved to: .blackbox5/scratch/manifests/{manifest.id}.md")
    print("View it with: .blackbox5/engine/runtime/view-manifest.sh " + manifest.id)
    print("="*60)

if __name__ == "__main__":
    main()
