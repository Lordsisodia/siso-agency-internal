#!/usr/bin/env python3
"""
Run Manifest Manager for Blackbox3
Complete execution tracking for replayability and debugging
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import yaml
import json
import git
import os
import subprocess


class RunManifest:
    """
    Tracks complete execution context for replayability

    Captures:
    - Input/output files
    - Execution timeline
    - Token usage and costs
    - Environment state
    - GitHub integration
    """

    def __init__(self,
                 run_id: str,
                 agent: str,
                 phase: str,
                 model_profile: str,
                 project_root: Path):
        """
        Initialize run manifest

        Args:
            run_id: Unique run identifier (YYYY-MM-DD_HHMM_task-name)
            agent: Agent type (e.g., "analyst", "architect", "dev")
            phase: Phase name (plan, build)
            model_profile: Model profile used (fast, balanced, hq)
            project_root: Project root directory
        """
        self.run_id = run_id
        self.agent = agent
        self.phase = phase
        self.model_profile = model_profile
        self.project_root = Path(project_root)
        self.manifest_dir = self.project_root / "runs" / "manifests"

        # Ensure manifest directory exists
        self.manifest_dir.mkdir(parents=True, exist_ok=True)

        # Initialize manifest structure
        self.data = {
            "manifest": {
                "run_id": run_id,
                "agent": agent,
                "phase": phase,
                "model_profile": model_profile,
                "model_version": "",  # Will be populated
                "model_id": "",  # Will be populated
                "timestamps": {
                    "started_at": "",
                    "completed_at": "",
                    "duration_seconds": 0,
                    "started_at_iso": "",
                    "completed_at_iso": ""
                },
                "inputs": {
                    "requirements": "",
                    "context": "",
                    "blueprint": "",
                    "user_prompt": "",
                    "additional_files": []
                },
                "outputs": {
                    "artifacts": [],
                    "files_created": [],
                    "files_modified": [],
                    "files_deleted": [],
                    "documentation": []
                },
                "steps": [],
                "metrics": {
                    "total_tokens": 0,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "estimated_cost": 0.0,
                    "operations_count": 0,
                    "files_accessed": 0,
                    "network_requests": 0
                },
                "validation": {
                    "success": False,
                    "errors": [],
                    "warnings": [],
                    "checks_passed": 0,
                    "checks_failed": 0
                },
                "environment": self._capture_environment(),
                "replay": {
                    "replayable": False,
                    "replay_command": "",
                    "replay_instructions": "",
                    "dependencies": []
                },
                "github": {
                    "auto_push": False,
                    "commit_hash": "",
                    "repo_url": "",
                    "issue_url": "",
                    "run_tag": ""
                },
                "debugging": {
                    "log_file": "",
                    "error_trace": "",
                    "performance_profile": {}
                },
                "metadata": {
                    "tags": [],
                    "notes": "",
                    "related_runs": [],
                    "parent_run": "",
                    "version": "1.0"
                }
            }
        }

        # Track start time
        self.start_time = datetime.now()
        self.data["manifest"]["timestamps"]["started_at"] = self.start_time.strftime("%Y-%m-%d %H:%M:%S")
        self.data["manifest"]["timestamps"]["started_at_iso"] = self.start_time.isoformat()

    def _capture_environment(self) -> Dict[str, Any]:
        """Capture environment information"""
        try:
            repo = git.Repo(self.project_root)
            git_branch = repo.active_branch.name
            git_commit = repo.head.commit.hexsha
            git_dirty = repo.is_dirty()
        except Exception:
            git_branch = ""
            git_commit = ""
            git_dirty = False

        return {
            "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
            "os": os.uname().sysname,
            "hostname": os.uname().nodename,
            "cwd": str(Path.cwd()),
            "user": os.getenv("USER", os.getenv("USERNAME", "unknown")),
            "git_branch": git_branch,
            "git_commit": git_commit,
            "git_dirty": git_dirty
        }

    def set_input(self, input_type: str, path: str):
        """
        Set input file path

        Args:
            input_type: Type of input (requirements, context, blueprint, user_prompt)
            path: Path to input file
        """
        if input_type in self.data["manifest"]["inputs"]:
            self.data["manifest"]["inputs"][input_type] = str(path)

    def add_additional_file(self, path: str):
        """Add additional input file"""
        self.data["manifest"]["inputs"]["additional_files"].append(str(path))

    def add_output(self, output_type: str, path: str):
        """
        Add output file

        Args:
            output_type: Type of output (artifacts, files_created, files_modified, documentation)
            path: Path to output file
        """
        if output_type in self.data["manifest"]["outputs"]:
            self.data["manifest"]["outputs"][output_type].append(str(path))

    def log_step(self,
                 action: str,
                 status: str,
                 duration_ms: int,
                 input_tokens: int = 0,
                 output_tokens: int = 0,
                 metadata: Optional[Dict[str, Any]] = None):
        """
        Log execution step

        Args:
            action: Action description (e.g., "load_context", "analyze_requirements")
            status: Status (success, failed, warning)
            duration_ms: Duration in milliseconds
            input_tokens: Input tokens used (optional)
            output_tokens: Output tokens generated (optional)
            metadata: Additional metadata (optional)
        """
        step = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "status": status,
            "duration_ms": duration_ms,
            "metadata": metadata or {}
        }

        if input_tokens > 0:
            step["input_tokens"] = input_tokens
        if output_tokens > 0:
            step["output_tokens"] = output_tokens

        self.data["manifest"]["steps"].append(step)

        # Update metrics
        self.data["manifest"]["metrics"]["total_tokens"] += input_tokens + output_tokens
        self.data["manifest"]["metrics"]["input_tokens"] += input_tokens
        self.data["manifest"]["metrics"]["output_tokens"] += output_tokens

    def update_metrics(self,
                      operations_count: Optional[int] = None,
                      files_accessed: Optional[int] = None,
                      network_requests: Optional[int] = None,
                      estimated_cost: Optional[float] = None):
        """
        Update execution metrics

        Args:
            operations_count: Number of operations performed
            files_accessed: Number of files accessed
            network_requests: Number of network requests
            estimated_cost: Estimated cost in USD
        """
        metrics = self.data["manifest"]["metrics"]

        if operations_count is not None:
            metrics["operations_count"] = operations_count
        if files_accessed is not None:
            metrics["files_accessed"] = files_accessed
        if network_requests is not None:
            metrics["network_requests"] = network_requests
        if estimated_cost is not None:
            metrics["estimated_cost"] = estimated_cost

    def add_validation_error(self, error: str):
        """Add validation error"""
        self.data["manifest"]["validation"]["errors"].append(error)

    def add_validation_warning(self, warning: str):
        """Add validation warning"""
        self.data["manifest"]["validation"]["warnings"].append(warning)

    def set_validation_results(self,
                              success: bool,
                              checks_passed: int,
                              checks_failed: int):
        """Set validation results"""
        validation = self.data["manifest"]["validation"]
        validation["success"] = success
        validation["checks_passed"] = checks_passed
        validation["checks_failed"] = checks_failed

    def finalize(self) -> Dict[str, Any]:
        """
        Finalize manifest

        Calculates duration, saves manifest, returns completed manifest

        Returns:
            Completed manifest data
        """
        # Calculate duration
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()

        self.data["manifest"]["timestamps"]["completed_at"] = end_time.strftime("%Y-%m-%d %H:%M:%S")
        self.data["manifest"]["timestamps"]["completed_at_iso"] = end_time.isoformat()
        self.data["manifest"]["timestamps"]["duration_seconds"] = duration

        # Save manifest
        self.save()

        return self.data

    def save(self):
        """Save manifest to file"""
        manifest_path = self.manifest_dir / f"{self.run_id}.yaml"

        with open(manifest_path, 'w') as f:
            yaml.safe_dump(self.data, f, default_flow_style=False, sort_keys=False)

        # Update debugging section
        self.data["manifest"]["debugging"]["log_file"] = str(manifest_path)

    def load(self, run_id: str) -> Optional[Dict[str, Any]]:
        """
        Load existing manifest

        Args:
            run_id: Run ID to load

        Returns:
            Manifest data if found, None otherwise
        """
        manifest_path = self.manifest_dir / f"{run_id}.yaml"

        if not manifest_path.exists():
            return None

        with open(manifest_path, 'r') as f:
            return yaml.safe_load(f)

    def get_replay_command(self) -> str:
        """
        Generate command to replay this run

        Returns:
            Replay command string
        """
        inputs = self.data["manifest"]["inputs"]

        if self.phase == "plan":
            if inputs.get("requirements"):
                return f"blackbox3 plan {inputs['requirements']}"

        elif self.phase == "build":
            if inputs.get("blueprint"):
                return f"blackbox3 build {inputs['blueprint']}"

        return f"# No replay command available for run {self.run_id}"

    def get_replay_instructions(self) -> str:
        """
        Generate human-readable replay instructions

        Returns:
            Replay instructions
        """
        instructions = [
            f"# Replay Instructions for Run {self.run_id}",
            "",
            f"Agent: {self.agent}",
            f"Phase: {self.phase}",
            f"Model Profile: {self.model_profile}",
            "",
            "## Inputs:"
        ]

        inputs = self.data["manifest"]["inputs"]
        if inputs.get("requirements"):
            instructions.append(f"  Requirements: {inputs['requirements']}")
        if inputs.get("blueprint"):
            instructions.append(f"  Blueprint: {inputs['blueprint']}")
        if inputs.get("context"):
            instructions.append(f"  Context: {inputs['context']}")

        instructions.append("")
        instructions.append("## Command:")
        instructions.append(f"  {self.get_replay_command()}")

        return "\n".join(instructions)


class ManifestManager:
    """
    Manages run manifests lifecycle

    Features:
    - Create manifests for runs
    - Track execution steps
    - Calculate metrics
    - Enable replayability
    - GitHub integration
    """

    def __init__(self, project_root: Path):
        """
        Initialize manifest manager

        Args:
            project_root: Project root directory
        """
        self.project_root = Path(project_root)
        self.manifest_dir = self.project_root / "runs" / "manifests"
        self.manifest_dir.mkdir(parents=True, exist_ok=True)

    def generate_run_id(self,
                       agent: str,
                       phase: str,
                       task_name: str) -> str:
        """
        Generate unique run ID

        Format: YYYY-MM-DD_HHMM_agent-phase_task-name

        Args:
            agent: Agent type
            phase: Phase name
            task_name: Task description

        Returns:
            Unique run ID
        """
        now = datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H%M")

        # Sanitize task name
        task_safe = task_name.lower().replace(" ", "-").replace("/", "-")[:50]

        return f"{date_str}_{time_str}_{agent}-{phase}_{task_safe}"

    def create_manifest(self,
                       agent: str,
                       phase: str,
                       model_profile: str,
                       task_name: str) -> RunManifest:
        """
        Create new run manifest

        Args:
            agent: Agent type
            phase: Phase name
            model_profile: Model profile used
            task_name: Task description

        Returns:
            New RunManifest instance
        """
        run_id = self.generate_run_id(agent, phase, task_name)

        return RunManifest(
            run_id=run_id,
            agent=agent,
            phase=phase,
            model_profile=model_profile,
            project_root=self.project_root
        )

    def list_manifests(self,
                      agent: Optional[str] = None,
                      phase: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all manifests, optionally filtered

        Args:
            agent: Optional agent filter
            phase: Optional phase filter

        Returns:
            List of manifest summaries
        """
        manifests = []

        for manifest_file in self.manifest_dir.glob("*.yaml"):
            with open(manifest_file, 'r') as f:
                data = yaml.safe_load(f)
                manifest = data.get("manifest", {})

                # Apply filters
                if agent and manifest.get("agent") != agent:
                    continue
                if phase and manifest.get("phase") != phase:
                    continue

                manifests.append({
                    "run_id": manifest.get("run_id"),
                    "agent": manifest.get("agent"),
                    "phase": manifest.get("phase"),
                    "model_profile": manifest.get("model_profile"),
                    "started_at": manifest.get("timestamps", {}).get("started_at"),
                    "duration_seconds": manifest.get("timestamps", {}).get("duration_seconds"),
                    "success": manifest.get("validation", {}).get("success", False),
                    "estimated_cost": manifest.get("metrics", {}).get("estimated_cost", 0.0)
                })

        # Sort by start time (newest first)
        manifests.sort(key=lambda x: x.get("started_at", ""), reverse=True)

        return manifests

    def get_manifest(self, run_id: str) -> Optional[Dict[str, Any]]:
        """
        Get manifest by run ID

        Args:
            run_id: Run ID

        Returns:
            Manifest data if found
        """
        manifest_path = self.manifest_dir / f"{run_id}.yaml"

        if not manifest_path.exists():
            return None

        with open(manifest_path, 'r') as f:
            return yaml.safe_load(f)

    def diff_manifests(self,
                      run_id_1: str,
                      run_id_2: str) -> Dict[str, Any]:
        """
        Compare two manifests

        Args:
            run_id_1: First run ID
            run_id_2: Second run ID

        Returns:
            Diff results
        """
        manifest_1 = self.get_manifest(run_id_1)
        manifest_2 = self.get_manifest(run_id_2)

        if not manifest_1 or not manifest_2:
            return {
                "error": "One or both manifests not found"
            }

        m1 = manifest_1.get("manifest", {})
        m2 = manifest_2.get("manifest", {})

        return {
            "run_1": run_id_1,
            "run_2": run_id_2,
            "duration_diff": m2.get("timestamps", {}).get("duration_seconds", 0) - m1.get("timestamps", {}).get("duration_seconds", 0),
            "token_diff": m2.get("metrics", {}).get("total_tokens", 0) - m1.get("metrics", {}).get("total_tokens", 0),
            "cost_diff": m2.get("metrics", {}).get("estimated_cost", 0.0) - m1.get("metrics", {}).get("estimated_cost", 0.0),
            "status_diff": {
                "run_1": m1.get("validation", {}).get("success", False),
                "run_2": m2.get("validation", {}).get("success", False)
            }
        }

    def get_statistics(self) -> Dict[str, Any]:
        """
        Get statistics across all manifests

        Returns:
            Statistics summary
        """
        manifests = self.list_manifests()

        total_runs = len(manifests)
        successful_runs = sum(1 for m in manifests if m.get("success", False))
        failed_runs = total_runs - successful_runs

        total_duration = sum(m.get("duration_seconds", 0) for m in manifests)
        total_cost = sum(m.get("estimated_cost", 0.0) for m in manifests)

        # By phase
        plan_runs = [m for m in manifests if m.get("phase") == "plan"]
        build_runs = [m for m in manifests if m.get("phase") == "build"]

        # By agent
        by_agent = {}
        for m in manifests:
            agent = m.get("agent", "unknown")
            by_agent[agent] = by_agent.get(agent, 0) + 1

        return {
            "total_runs": total_runs,
            "successful_runs": successful_runs,
            "failed_runs": failed_runs,
            "success_rate": successful_runs / total_runs if total_runs > 0 else 0.0,
            "total_duration_seconds": total_duration,
            "total_cost_usd": total_cost,
            "plan_runs": len(plan_runs),
            "build_runs": len(build_runs),
            "by_agent": by_agent
        }
