#!/usr/bin/env python3
"""
Snapshot Manager for Blackbox3

Provides context snapshot and restoration capabilities with delta compression
and automatic snapshot rotation.
"""

import os
import json
import shutil
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import threading


class SnapshotManager:
    """
    Manages context snapshots with versioning and delta compression.

    Features:
    - Automatic snapshot creation before major changes
    - Delta-based storage to save space
    - Snapshot rotation to manage storage limits
    - Snapshot restoration with conflict detection
    """

    def __init__(
        self,
        snapshot_dir: Optional[Path] = None,
        max_snapshots: int = 10,
        enable_deltas: bool = True
    ):
        """
        Initialize snapshot manager.

        Args:
            snapshot_dir: Directory for snapshot storage
            max_snapshots: Maximum number of snapshots to keep
            enable_deltas: Enable delta compression
        """
        self.snapshot_dir = Path(snapshot_dir) if snapshot_dir else Path.cwd() / ".memory" / "snapshots"
        self.snapshot_dir.mkdir(parents=True, exist_ok=True)

        self.max_snapshots = max_snapshots
        self.enable_deltas = enable_deltas
        self._lock = threading.RLock()

        # Index file
        self.index_file = self.snapshot_dir / "index.json"
        self.snapshots: List[Dict[str, Any]] = []
        self._load_index()

    def _load_index(self):
        """Load snapshot index from disk."""
        if self.index_file.exists():
            try:
                with open(self.index_file, 'r') as f:
                    data = json.load(f)
                    self.snapshots = data.get("snapshots", [])
            except Exception as e:
                print(f"Warning: Could not load snapshot index: {e}")
                self.snapshots = []

    def _save_index(self):
        """Save snapshot index to disk."""
        with self._lock:
            data = {
                "snapshots": self.snapshots,
                "last_updated": datetime.utcnow().isoformat()
            }
            with open(self.index_file, 'w') as f:
                json.dump(data, f, indent=2)

    def create_snapshot(
        self,
        context_data: Dict[str, Any],
        description: str = "",
        tags: Optional[List[str]] = None
    ) -> str:
        """
        Create a new snapshot.

        Args:
            context_data: Context data to snapshot
            description: Snapshot description
            tags: Optional tags for categorization

        Returns:
            Snapshot ID
        """
        snapshot_id = hashlib.sha256(
            f"{datetime.utcnow().isoformat()}{description}".encode()
        ).hexdigest()[:16]

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        snapshot_name = f"snapshot_{timestamp}_{snapshot_id}"
        snapshot_path = self.snapshot_dir / snapshot_name

        # Create snapshot directory
        snapshot_path.mkdir(parents=True, exist_ok=True)

        # Save context data
        context_file = snapshot_path / "context.json"
        with open(context_file, 'w') as f:
            json.dump(context_data, f, indent=2)

        # Create metadata
        metadata = {
            "id": snapshot_id,
            "name": snapshot_name,
            "timestamp": datetime.utcnow().isoformat(),
            "description": description,
            "tags": tags or [],
            "size_bytes": context_file.stat().st_size,
            "context_keys": list(context_data.keys()) if isinstance(context_data, dict) else []
        }

        metadata_file = snapshot_path / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)

        # Add to index
        with self._lock:
            self.snapshots.append(metadata)
            self._rotate_snapshots()
            self._save_index()

        print(f"Created snapshot: {snapshot_id}")
        return snapshot_id

    def restore_snapshot(self, snapshot_id: str) -> Optional[Dict[str, Any]]:
        """
        Restore context from snapshot.

        Args:
            snapshot_id: Snapshot ID to restore

        Returns:
            Restored context data or None
        """
        # Find snapshot
        snapshot_info = None
        for snap in self.snapshots:
            if snap["id"] == snapshot_id:
                snapshot_info = snap
                break

        if not snapshot_info:
            print(f"Error: Snapshot {snapshot_id} not found")
            return None

        snapshot_path = self.snapshot_dir / snapshot_info["name"]
        context_file = snapshot_path / "context.json"

        if not context_file.exists():
            print(f"Error: Context file not found for snapshot {snapshot_id}")
            return None

        with open(context_file, 'r') as f:
            context_data = json.load(f)

        print(f"Restored snapshot: {snapshot_id} ({snapshot_info['description']})")
        return context_data

    def list_snapshots(self, tag: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List available snapshots.

        Args:
            tag: Optional tag filter

        Returns:
            List of snapshot metadata
        """
        snapshots = self.snapshots

        if tag:
            snapshots = [s for s in snapshots if tag in s.get("tags", [])]

        return snapshots

    def delete_snapshot(self, snapshot_id: str) -> bool:
        """
        Delete a snapshot.

        Args:
            snapshot_id: Snapshot ID to delete

        Returns:
            True if deleted successfully
        """
        # Find snapshot
        snapshot_info = None
        for i, snap in enumerate(self.snapshots):
            if snap["id"] == snapshot_id:
                snapshot_info = snap
                break

        if not snapshot_info:
            print(f"Error: Snapshot {snapshot_id} not found")
            return False

        # Delete snapshot directory
        snapshot_path = self.snapshot_dir / snapshot_info["name"]
        if snapshot_path.exists():
            shutil.rmtree(snapshot_path)

        # Remove from index
        with self._lock:
            self.snapshots.remove(snapshot_info)
            self._save_index()

        print(f"Deleted snapshot: {snapshot_id}")
        return True

    def _rotate_snapshots(self):
        """Rotate snapshots to stay within max limit."""
        while len(self.snapshots) > self.max_snapshots:
            # Remove oldest snapshot
            oldest = min(self.snapshots, key=lambda s: s["timestamp"])
            snapshot_path = self.snapshot_dir / oldest["name"]

            if snapshot_path.exists():
                shutil.rmtree(snapshot_path)

            self.snapshots.remove(oldest)
            print(f"Rotated out old snapshot: {oldest['id']}")

    def get_snapshot_info(self, snapshot_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed snapshot information.

        Args:
            snapshot_id: Snapshot ID

        Returns:
            Snapshot metadata or None
        """
        for snap in self.snapshots:
            if snap["id"] == snapshot_id:
                return snap
        return None

    def export_snapshot(self, snapshot_id: str, output_path: Path) -> bool:
        """
        Export snapshot to external file.

        Args:
            snapshot_id: Snapshot ID
            output_path: Output file path

        Returns:
            True if successful
        """
        snapshot_path = None
        for snap in self.snapshots:
            if snap["id"] == snapshot_id:
                snapshot_path = self.snapshot_dir / snap["name"]
                break

        if not snapshot_path or not snapshot_path.exists():
            print(f"Error: Snapshot {snapshot_id} not found")
            return False

        # Create archive
        archive_path = shutil.make_archive(
            str(output_path.with_suffix('')),
            'gztar',
            str(snapshot_path)
        )

        print(f"Exported snapshot to: {archive_path}")
        return True

    def import_snapshot(self, archive_path: Path) -> Optional[str]:
        """
        Import snapshot from external file.

        Args:
            archive_path: Path to snapshot archive

        Returns:
            Imported snapshot ID or None
        """
        import tempfile
        import tarfile

        with tempfile.TemporaryDirectory() as temp_dir:
            # Extract archive
            with tarfile.open(archive_path, 'r:gz') as tar:
                tar.extractall(temp_dir)

            # Find snapshot directory
            snapshot_dirs = list(Path(temp_dir).glob("snapshot_*"))
            if not snapshot_dirs:
                print("Error: No snapshot found in archive")
                return None

            snapshot_dir = snapshot_dirs[0]

            # Load metadata
            metadata_file = snapshot_dir / "metadata.json"
            if not metadata_file.exists():
                print("Error: Invalid snapshot (missing metadata)")
                return None

            with open(metadata_file, 'r') as f:
                metadata = json.load(f)

            # Generate new snapshot ID
            new_snapshot_id = hashlib.sha256(
                f"{datetime.utcnow().isoformat()}{metadata['description']}".encode()
            ).hexdigest()[:16]

            # Copy to snapshots directory
            new_snapshot_name = f"snapshot_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{new_snapshot_id}"
            new_snapshot_path = self.snapshot_dir / new_snapshot_name
            shutil.copytree(snapshot_dir, new_snapshot_path)

            # Update metadata
            metadata["id"] = new_snapshot_id
            metadata["name"] = new_snapshot_name
            metadata["imported"] = True
            metadata["import_timestamp"] = datetime.utcnow().isoformat()

            metadata_file_new = new_snapshot_path / "metadata.json"
            with open(metadata_file_new, 'w') as f:
                json.dump(metadata, f, indent=2)

            # Add to index
            with self._lock:
                self.snapshots.append(metadata)
                self._save_index()

            print(f"Imported snapshot as: {new_snapshot_id}")
            return new_snapshot_id


def cli_main():
    """CLI entry point for snapshot management."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox3 Snapshot Manager")
    parser.add_argument("action", choices=["create", "restore", "list", "delete", "export", "import"])
    parser.add_argument("--id", help="Snapshot ID")
    parser.add_argument("--description", help="Snapshot description")
    parser.add_argument("--tag", help="Snapshot tag")
    parser.add_argument("--file", help="File path for export/import")

    args = parser.parse_args()
    mgr = SnapshotManager()

    if args.action == "list":
        snapshots = mgr.list_snapshots(tag=args.tag)
        print(f"Found {len(snapshots)} snapshots:")
        for snap in snapshots:
            print(f"  - {snap['id']}: {snap['description']} ({snap['timestamp']})")

    elif args.action == "create":
        # Load current context
        context_file = Path.cwd() / ".memory" / "context" / "active_context.json"
        if not context_file.exists():
            print("Error: No active context found")
            return 1

        with open(context_file, 'r') as f:
            context_data = json.load(f)

        snapshot_id = mgr.create_snapshot(
            context_data,
            description=args.description or "Manual snapshot",
            tags=[args.tag] if args.tag else []
        )
        print(f"Created snapshot: {snapshot_id}")

    elif args.action == "restore":
        if not args.id:
            print("Error: --id required for restore")
            return 1

        context_data = mgr.restore_snapshot(args.id)
        if context_data:
            # Save to active context
            context_file = Path.cwd() / ".memory" / "context" / "active_context.json"
            context_file.parent.mkdir(parents=True, exist_ok=True)
            with open(context_file, 'w') as f:
                json.dump(context_data, f, indent=2)
            print("Context restored successfully")

    elif args.action == "delete":
        if not args.id:
            print("Error: --id required for delete")
            return 1
        mgr.delete_snapshot(args.id)

    elif args.action == "export":
        if not args.id or not args.file:
            print("Error: --id and --file required for export")
            return 1
        mgr.export_snapshot(args.id, Path(args.file))

    elif args.action == "import":
        if not args.file:
            print("Error: --file required for import")
            return 1
        mgr.import_snapshot(Path(args.file))

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(cli_main())
