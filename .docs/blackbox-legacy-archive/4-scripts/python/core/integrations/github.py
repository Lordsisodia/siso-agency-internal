#!/usr/bin/env python3
"""
GitHub Auto-Push Integration for Blackbox3
Automatic tracking and synchronization with GitHub
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
import git
from datetime import datetime
import json
import subprocess


class GitHubAutoPush:
    """
    Automatic GitHub synchronization for run tracking

    Features:
    - Auto-push every run to GitHub
    - Create commits with manifest data
    - Tag runs for easy retrieval
    - Optional issue creation
    """

    def __init__(self,
                 project_root: Path,
                 enabled: bool = True,
                 create_issues: bool = False):
        """
        Initialize GitHub auto-push

        Args:
            project_root: Project root directory
            enabled: Whether auto-push is enabled
            create_issues: Whether to create issues for features
        """
        self.project_root = Path(project_root)
        self.enabled = enabled
        self.create_issues = create_issues

        try:
            self.repo = git.Repo(self.project_root)
            self.has_git = True
        except Exception as e:
            self.has_git = False
            self.repo = None

    def is_enabled(self) -> bool:
        """Check if auto-push is enabled and available"""
        return self.enabled and self.has_git

    def get_repo_url(self) -> Optional[str]:
        """
        Get GitHub repository URL

        Returns:
            Repository URL or None
        """
        if not self.repo:
            return None

        try:
            origin = self.repo.remotes.origin
            url = next(origin.urls, None)

            if url and "github.com" in url:
                # Convert to HTTPS if SSH
                if url.startswith("git@"):
                    url = url.replace(":", "/").replace("git@", "https://")[:-4]  # Remove .git
                return url

        except Exception:
            pass

        return None

    def get_current_commit(self) -> Optional[str]:
        """
        Get current commit hash

        Returns:
            Commit hash or None
        """
        if not self.repo:
            return None

        try:
            return self.repo.head.commit.hexsha
        except Exception:
            return None

    def get_current_branch(self) -> Optional[str]:
        """
        Get current branch name

        Returns:
            Branch name or None
        """
        if not self.repo:
            return None

        try:
            return self.repo.active_branch.name
        except Exception:
            return None

    def check_dirty(self) -> bool:
        """
        Check if working tree is dirty

        Returns:
            True if there are uncommitted changes
        """
        if not self.repo:
            return False

        return self.repo.is_dirty()

    def get_changed_files(self) -> List[str]:
        """
        Get list of changed files

        Returns:
            List of changed file paths
        """
        if not self.repo:
            return []

        try:
            # Get untracked files
            untracked = [item for item in self.repo.untracked_files]

            # Get modified files
            modified = [item.a_path for item in self.repo.index.diff(None)]

            return list(set(untracked + modified))

        except Exception:
            return []

    def commit_run(self,
                  run_id: str,
                  manifest_data: Dict[str, Any],
                  manifest_path: Path) -> Dict[str, Any]:
        """
        Commit run manifest and any generated artifacts

        Args:
            run_id: Run ID
            manifest_data: Manifest data dictionary
            manifest_path: Path to manifest file

        Returns:
            Commit result
        """
        if not self.is_enabled():
            return {
                "success": False,
                "message": "GitHub auto-push is not enabled"
            }

        try:
            # Add manifest file
            self.repo.index.add([str(manifest_path.relative_to(self.project_root))])

            # Add any generated artifacts
            outputs = manifest_data.get("manifest", {}).get("outputs", {})

            files_to_add = []
            for file_list in [outputs.get("files_created", []),
                            outputs.get("files_modified", []),
                            outputs.get("artifacts", [])]:
                for file_path in file_list:
                    path = Path(file_path)
                    if path.exists():
                        try:
                            self.repo.index.add([str(path.relative_to(self.project_root))])
                            files_to_add.append(file_path)
                        except Exception:
                            pass  # File might be outside repo

            # Create commit message
            manifest = manifest_data.get("manifest", {})
            phase = manifest.get("phase", "unknown")
            agent = manifest.get("agent", "unknown")
            status = "✅" if manifest.get("validation", {}).get("success", False) else "❌"

            commit_message = f"{status} Run {run_id}\n\n"
            commit_message += f"Agent: {agent}\n"
            commit_message += f"Phase: {phase}\n"
            commit_message += f"Model Profile: {manifest.get('model_profile', 'unknown')}\n"
            commit_message += f"Duration: {manifest.get('timestamps', {}).get('duration_seconds', 0):.1f}s\n"
            commit_message += f"Cost: ${manifest.get('metrics', {}).get('estimated_cost', 0.0):.4f}\n"

            # Commit
            commit = self.repo.index.commit(commit_message)

            result = {
                "success": True,
                "commit_hash": commit.hexsha,
                "commit_message": commit_message,
                "files_added": files_to_add,
                "branch": self.get_current_branch()
            }

            return result

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def push_to_github(self,
                      branch: Optional[str] = None) -> Dict[str, Any]:
        """
        Push commits to GitHub

        Args:
            branch: Branch to push (default: current branch)

        Returns:
            Push result
        """
        if not self.is_enabled():
            return {
                "success": False,
                "message": "GitHub auto-push is not enabled"
            }

        try:
            branch = branch or self.get_current_branch()

            if not branch:
                return {
                    "success": False,
                    "message": "No branch found"
                }

            # Push to origin
            origin = self.repo.remotes.origin
            push_info = origin.push(branch)

            # Get push result
            if push_info:
                return {
                    "success": True,
                    "branch": branch,
                    "remote_url": self.get_repo_url()
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def create_run_tag(self,
                      run_id: str,
                      commit_hash: Optional[str] = None) -> Dict[str, Any]:
        """
        Create tag for run

        Args:
            run_id: Run ID
            commit_hash: Commit hash (default: HEAD)

        Returns:
            Tag result
        """
        if not self.is_enabled():
            return {
                "success": False,
                "message": "GitHub auto-push is not enabled"
            }

        try:
            # Get commit
            if commit_hash:
                commit = self.repo.commit(commit_hash)
            else:
                commit = self.repo.head.commit

            # Create tag
            tag_name = f"run/{run_id}"
            tag_message = f"Run {run_id}\n\nAuto-generated tag for run tracking"

            tag = self.repo.create_tag(tag_name, commit, message=tag_message)

            return {
                "success": True,
                "tag_name": tag_name,
                "tag_commit": tag.commit.hexsha
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def sync_run(self,
                run_id: str,
                manifest_data: Dict[str, Any],
                manifest_path: Path,
                push: bool = True,
                tag: bool = True) -> Dict[str, Any]:
        """
        Complete run synchronization: commit, push, and tag

        Args:
            run_id: Run ID
            manifest_data: Manifest data
            manifest_path: Path to manifest file
            push: Whether to push to GitHub
            tag: Whether to create tag

        Returns:
            Sync result with all operations
        """
        result = {
            "run_id": run_id,
            "operations": []
        }

        # Step 1: Commit
        commit_result = self.commit_run(run_id, manifest_data, manifest_path)
        result["operations"].append({
            "operation": "commit",
            "result": commit_result
        })

        if not commit_result.get("success"):
            result["success"] = False
            return result

        commit_hash = commit_result.get("commit_hash")

        # Step 2: Push
        if push:
            push_result = self.push_to_github()
            result["operations"].append({
                "operation": "push",
                "result": push_result
            })

            if not push_result.get("success"):
                result["success"] = False
                result["push_error"] = push_result.get("error")

        # Step 3: Tag
        if tag and commit_hash:
            tag_result = self.create_run_tag(run_id, commit_hash)
            result["operations"].append({
                "operation": "tag",
                "result": tag_result
            })

        result["success"] = all(
            op.get("result", {}).get("success", False)
            for op in result["operations"]
        )

        return result

    def create_feature_issue(self,
                            title: str,
                            description: str,
                            labels: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Create GitHub issue for feature (requires GitHub CLI)

        Args:
            title: Issue title
            description: Issue description
            labels: Optional list of labels

        Returns:
            Issue creation result
        """
        if not self.is_enabled() or not self.create_issues:
            return {
                "success": False,
                "message": "Issue creation is not enabled"
            }

        try:
            # Build gh CLI command
            cmd = ["gh", "issue", "create", "--title", title]

            if description:
                cmd.extend(["--body", description])

            if labels:
                cmd.extend(["--label", ",".join(labels)])

            # Run command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if result.returncode == 0:
                # Parse output to get issue URL
                issue_url = result.stdout.strip()

                return {
                    "success": True,
                    "issue_url": issue_url
                }

            else:
                return {
                    "success": False,
                    "error": result.stderr
                }

        except FileNotFoundError:
            return {
                "success": False,
                "message": "GitHub CLI (gh) not installed"
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def get_run_history(self,
                       agent: Optional[str] = None,
                       phase: Optional[str] = None,
                       limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get run history from git log

        Args:
            agent: Filter by agent
            phase: Filter by phase
            limit: Maximum number of runs to return

        Returns:
            List of run summaries
        """
        if not self.is_enabled():
            return []

        try:
            # Get git log
            commits = list(self.repo.iter_commits(max_count=limit))

            runs = []
            for commit in commits:
                message = commit.message.strip()

                # Parse commit message for run info
                if "Run " in message and ("Agent:" in message or "Phase:" in message):
                    lines = message.split("\n")
                    run_id = lines[0].replace("✅ ", "").replace("❌ ", "").strip()

                    # Parse metadata
                    run_agent = None
                    run_phase = None
                    status = "✅" in lines[0]

                    for line in lines[1:]:
                        if line.startswith("Agent:"):
                            run_agent = line.split(":", 1)[1].strip()
                        elif line.startswith("Phase:"):
                            run_phase = line.split(":", 1)[1].strip()

                    # Apply filters
                    if agent and run_agent != agent:
                        continue
                    if phase and run_phase != phase:
                        continue

                    runs.append({
                        "run_id": run_id,
                        "agent": run_agent,
                        "phase": run_phase,
                        "status": "success" if status else "failed",
                        "commit_hash": commit.hexsha,
                        "timestamp": datetime.fromtimestamp(commit.committed_date).isoformat(),
                        "commit_message": message
                    })

            return runs

        except Exception:
            return []
