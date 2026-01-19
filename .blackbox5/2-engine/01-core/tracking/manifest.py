"""
Manifest System - Track operations for debugging and audit
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from enum import Enum
import uuid
import json


class ManifestStatus(Enum):
    """Status of a manifest operation."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class ManifestStep:
    """A single step in a manifest operation."""
    step: str
    timestamp: str
    details: Dict[str, Any]
    status: str = "completed"


@dataclass
class Manifest:
    """Operation manifest tracking execution details."""
    id: str
    type: str
    started_at: str
    status: ManifestStatus
    steps: List[ManifestStep] = field(default_factory=list)
    completed_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class ManifestSystem:
    """
    Track all operations for debugging and audit.

    Creates markdown files for each operation with:
    - Operation metadata
    - Step-by-step execution
    - Results and errors
    - Timing information
    """

    def __init__(self, manifest_dir: Path = None):
        """
        Initialize the manifest system.

        Args:
            manifest_dir: Directory to store manifest files. Defaults to .blackbox5/scratch/manifests
        """
        if manifest_dir is None:
            manifest_dir = Path("./.blackbox5/scratch/manifests")

        self.manifest_dir = Path(manifest_dir)
        self.manifest_dir.mkdir(parents=True, exist_ok=True)

        self.active_manifests: Dict[str, Manifest] = {}

    def create_manifest(
        self,
        operation_type: str,
        metadata: Dict[str, Any] = None
    ) -> Manifest:
        """
        Create new operation manifest.

        Args:
            operation_type: Type of operation (e.g., "task_execution", "agent_coordination")
            metadata: Additional metadata to attach

        Returns:
            Manifest object
        """
        manifest_id = str(uuid.uuid4())

        manifest = Manifest(
            id=manifest_id,
            type=operation_type,
            started_at=datetime.now().isoformat(),
            status=ManifestStatus.PENDING,
            metadata=metadata or {}
        )

        self.active_manifests[manifest_id] = manifest
        self._save_manifest(manifest)

        return manifest

    def start_step(
        self,
        manifest: Manifest,
        step: str,
        details: Dict[str, Any] = None
    ) -> None:
        """
        Start a new step in the operation.

        Args:
            manifest: Manifest to add step to
            step: Step description
            details: Step details
        """
        manifest.status = ManifestStatus.IN_PROGRESS

        step_record = ManifestStep(
            step=step,
            timestamp=datetime.now().isoformat(),
            details=details or {}
        )

        manifest.steps.append(step_record)
        self._save_manifest(manifest)

    def complete_manifest(
        self,
        manifest: Manifest,
        result: Dict[str, Any] = None
    ) -> None:
        """
        Mark manifest as completed.

        Args:
            manifest: Manifest to complete
            result: Operation result
        """
        manifest.status = ManifestStatus.COMPLETED
        manifest.completed_at = datetime.now().isoformat()
        manifest.result = result

        self._save_manifest(manifest)
        self.active_manifests.pop(manifest.id, None)

    def fail_manifest(
        self,
        manifest: Manifest,
        error: str
    ) -> None:
        """
        Mark manifest as failed.

        Args:
            manifest: Manifest that failed
            error: Error message
        """
        manifest.status = ManifestStatus.FAILED
        manifest.completed_at = datetime.now().isoformat()
        manifest.error = error

        self._save_manifest(manifest)
        self.active_manifests.pop(manifest.id, None)

    def get_manifest(self, manifest_id: str) -> Optional[Manifest]:
        """
        Get manifest by ID.

        Args:
            manifest_id: UUID of the manifest

        Returns:
            Manifest if found, None otherwise
        """
        return self.active_manifests.get(manifest_id)

    def list_manifests(
        self,
        operation_type: str = None,
        status: ManifestStatus = None
    ) -> List[Manifest]:
        """
        List manifests with optional filtering.

        Args:
            operation_type: Filter by operation type
            status: Filter by status

        Returns:
            List of manifests matching filters, sorted by started_at (newest first)
        """
        # Scan manifest directory
        manifests = []

        for manifest_file in self.manifest_dir.glob("*.md"):
            try:
                manifest = self._load_manifest_file(manifest_file)

                if operation_type and manifest.type != operation_type:
                    continue
                if status and manifest.status != status:
                    continue

                manifests.append(manifest)
            except Exception:
                continue

        # Sort by started_at (newest first)
        manifests.sort(key=lambda m: m.started_at, reverse=True)

        return manifests

    def _save_manifest(self, manifest: Manifest) -> None:
        """
        Save manifest to markdown file.

        Args:
            manifest: Manifest to save
        """
        path = self.manifest_dir / f"{manifest.id}.md"

        with open(path, 'w') as f:
            f.write(self._format_manifest(manifest))

    def _format_manifest(self, manifest: Manifest) -> str:
        """
        Format manifest as markdown.

        Args:
            manifest: Manifest to format

        Returns:
            Markdown formatted string
        """
        lines = [
            f"# Operation Manifest: {manifest.type}",
            "",
            "## Metadata",
            f"- **ID:** `{manifest.id}`",
            f"- **Type:** {manifest.type}",
            f"- **Started:** {manifest.started_at}",
            f"- **Status:** {manifest.status.value}",
        ]

        if manifest.completed_at:
            lines.append(f"- **Completed:** {manifest.completed_at}")

        if manifest.metadata:
            lines.append("")
            lines.append("### Additional Metadata")
            for key, value in manifest.metadata.items():
                lines.append(f"- **{key}:** {value}")

        if manifest.steps:
            lines.append("")
            lines.append("## Execution Steps")

            for i, step in enumerate(manifest.steps, 1):
                lines.append(f"### Step {i}: {step.step}")
                lines.append(f"- **Time:** {step.timestamp}")
                lines.append(f"- **Status:** {step.status}")

                if step.details:
                    lines.append("")
                    lines.append("**Details:**")
                    for key, value in step.details.items():
                        if isinstance(value, (dict, list)):
                            value = json.dumps(value, indent=2)
                        lines.append(f"  - {key}: {value}")

                lines.append("")

        if manifest.result:
            lines.append("## Result")
            lines.append("```json")
            lines.append(json.dumps(manifest.result, indent=2))
            lines.append("```")

        if manifest.error:
            lines.append("## Error")
            lines.append(f"```\n{manifest.error}\n```")

        return "\n".join(lines)

    def _load_manifest_file(self, path: Path) -> Manifest:
        """
        Load manifest from file (basic parsing).

        Args:
            path: Path to manifest file

        Returns:
            Manifest object
        """
        # This is a simplified version - could parse the markdown properly
        # For now, just return a stub based on filename
        return Manifest(
            id=path.stem,
            type="unknown",
            started_at="unknown",
            status=ManifestStatus.COMPLETED
        )
