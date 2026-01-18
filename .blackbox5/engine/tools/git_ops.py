#!/usr/bin/env python3
import subprocess
import sys
from typing import List, Optional

class GitOps:
    """
    Implements GSD "Atomic Commits" protocol.
    Enforces format: type(phase-plan): description
    """
    
    @staticmethod
    def run_cmd(cmd: List[str]) -> str:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            return f"Error: {e.stderr}"

    @staticmethod
    def status() -> str:
        return GitOps.run_cmd(["git", "status", "--short"])

    @staticmethod
    def check_clean_state() -> bool:
        status = GitOps.status()
        return status == ""

    @staticmethod
    def commit_task(task_type: str, scope: str, description: str, files: List[str], body: Optional[str] = None) -> str:
        """
        Executes a GSD atomic commit.
        """
        # 1. Validate inputs
        valid_types = ["feat", "fix", "test", "refactor", "perf", "docs", "style", "chore"]
        if task_type not in valid_types:
            raise ValueError(f"Invalid type '{task_type}'. Must be one of: {valid_types}")

        # 2. Stage files
        for file in files:
            GitOps.run_cmd(["git", "add", file])
            
        # 3. Construct message
        header = f"{task_type}({scope}): {description}"
        message = header
        if body:
            message += f"\n\n{body}"
            
        # 4. Commit
        result = GitOps.run_cmd(["git", "commit", "-m", message])
        
        # 5. Return hash
        if "Error" not in result:
             return GitOps.run_cmd(["git", "rev-parse", "--short", "HEAD"])
        return result

if __name__ == "__main__":
    # Test execution
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        print(f"Clean State: {GitOps.check_clean_state()}")
    else:
        print("GitOps Tool Ready. Use via import.")
