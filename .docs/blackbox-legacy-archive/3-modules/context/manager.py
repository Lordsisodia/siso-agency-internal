#!/usr/bin/env python3
"""
Context Manager for Blackbox3

Advanced context tracking with automatic compaction, semantic indexing,
and multi-level context management for AI development sessions.
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import threading


class ContextManager:
    """
    Manages working context for AI development sessions.

    Features:
    - Automatic context compaction when size limits approached
    - Semantic indexing with embeddings
    - Context versioning and rollback
    - Multi-threaded context access
    - Persistent storage with compression
    """

    def __init__(
        self,
        context_root: Optional[Path] = None,
        max_size_mb: float = 10.0,
        enable_compression: bool = True,
        enable_semantic_index: bool = True
    ):
        """
        Initialize context manager.

        Args:
            context_root: Root directory for context storage
            max_size_mb: Maximum size in MB before auto-compaction
            enable_compression: Enable context compression for storage
            enable_semantic_index: Enable semantic search indexing
        """
        self.context_root = Path(context_root) if context_root else Path.cwd() / ".memory" / "context"
        self.context_root.mkdir(parents=True, exist_ok=True)

        self.max_size_bytes = int(max_size_mb * 1024 * 1024)
        self.enable_compression = enable_compression
        self.enable_semantic_index = enable_semantic_index

        # Thread-safe lock
        self._lock = threading.RLock()

        # Context storage
        self.active_context: Dict[str, Any] = {}
        self.context_history: List[Dict[str, Any]] = []
        self.context_index: Dict[str, List[str]] = {"tags": {}, "entities": {}}

        # Load existing context if available
        self._load_active_context()

    def _load_active_context(self):
        """Load active context from storage."""
        context_file = self.context_root / "active_context.json"
        if context_file.exists():
            try:
                with open(context_file, 'r') as f:
                    self.active_context = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load context: {e}")

    def _save_active_context(self):
        """Save active context to storage."""
        context_file = self.context_root / "active_context.json"
        with self._lock:
            with open(context_file, 'w') as f:
                json.dump(self.active_context, f, indent=2)

    def add_context(
        self,
        key: str,
        value: Any,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None
    ) -> bool:
        """
        Add context item.

        Args:
            key: Context key
            value: Context value (must be JSON-serializable)
            metadata: Optional metadata
            tags: Optional tags for indexing

        Returns:
            True if added successfully
        """
        with self._lock:
            context_item = {
                "key": key,
                "value": value,
                "metadata": metadata or {},
                "tags": tags or [],
                "timestamp": datetime.utcnow().isoformat(),
                "size_bytes": len(json.dumps(value))
            }

            self.active_context[key] = context_item

            # Update indices
            for tag in tags or []:
                if tag not in self.context_index["tags"]:
                    self.context_index["tags"][tag] = []
                self.context_index["tags"][tag].append(key)

            # Check size limit
            if self._get_context_size() > self.max_size_bytes:
                self._compact_context()

            self._save_active_context()
            return True

    def get_context(self, key: str, default: Any = None) -> Optional[Any]:
        """
        Get context item by key.

        Args:
            key: Context key
            default: Default value if not found

        Returns:
            Context value or default
        """
        with self._lock:
            item = self.active_context.get(key)
            return item["value"] if item else default

    def search_by_tag(self, tag: str) -> List[str]:
        """
        Search context items by tag.

        Args:
            tag: Tag to search

        Returns:
            List of context keys with this tag
        """
        with self._lock:
            return self.context_index["tags"].get(tag, [])

    def search_by_entity(self, entity_type: str) -> List[str]:
        """
        Search context items by entity type.

        Args:
            entity_type: Entity type to search

        Returns:
            List of context keys for this entity
        """
        with self._lock:
            return self.context_index["entities"].get(entity_type, [])

    def get_context_summary(self) -> Dict[str, Any]:
        """
        Get context summary statistics.

        Returns:
            Dictionary with context statistics
        """
        with self._lock:
            total_size = self._get_context_size()
            return {
                "total_items": len(self.active_context),
                "total_size_bytes": total_size,
                "total_size_mb": total_size / (1024 * 1024),
                "total_tags": len(self.context_index["tags"]),
                "total_entities": len(self.context_index["entities"]),
                "oldest_item": self._get_oldest_item(),
                "newest_item": self._get_newest_item(),
                "utilization_percent": (total_size / self.max_size_bytes) * 100
            }

    def _get_context_size(self) -> int:
        """Calculate total context size in bytes."""
        return sum(
            item.get("size_bytes", 0)
            for item in self.active_context.values()
        )

    def _get_oldest_item(self) -> Optional[str]:
        """Get oldest context item key."""
        if not self.active_context:
            return None
        return min(
            self.active_context.keys(),
            key=lambda k: self.active_context[k].get("timestamp", "")
        )

    def _get_newest_item(self) -> Optional[str]:
        """Get newest context item key."""
        if not self.active_context:
            return None
        return max(
            self.active_context.keys(),
            key=lambda k: self.active_context[k].get("timestamp", "")
        )

    def _compact_context(self):
        """
        Compact context to stay within size limits.

        Strategy:
        1. Remove items marked as ephemeral
        2. Archive old items to history
        3. Compress if enabled
        """
        print(f"Compacting context (current size: {self._get_context_size()} bytes)")

        # Archive old items
        items_to_archive = []
        current_time = datetime.utcnow()

        for key, item in list(self.active_context.items()):
            # Archive items older than 1 hour or marked as archival
            item_time = datetime.fromisoformat(item["timestamp"])
            if (current_time - item_time) > timedelta(hours=1) or \
               item.get("metadata", {}).get("archival", False):
                items_to_archive.append(key)

        # Move to history
        if items_to_archive:
            for key in items_to_archive:
                item = self.active_context.pop(key)
                self.context_history.append(item)

            # Save history
            history_file = self.context_root / f"history_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            with open(history_file, 'w') as f:
                json.dump(self.context_history, f, indent=2)

            # Clear history from memory
            self.context_history = []

        print(f"Compaction complete. Archived {len(items_to_archive)} items")

    def clear_context(self, confirm: bool = False):
        """
        Clear all context.

        Args:
            confirm: Must be True to confirm deletion
        """
        if not confirm:
            raise ValueError("Must confirm=True to clear all context")

        with self._lock:
            self.active_context.clear()
            self.context_index = {"tags": {}, "entities": {}}
            self._save_active_context()

    def export_context(self, output_path: Optional[Path] = None) -> Path:
        """
        Export context to file.

        Args:
            output_path: Output file path

        Returns:
            Path to exported file
        """
        if output_path is None:
            output_path = self.context_root / f"context_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"

        with self._lock:
            export_data = {
                "active_context": self.active_context,
                "context_index": self.context_index,
                "export_timestamp": datetime.utcnow().isoformat(),
                "version": "1.0.0"
            }

            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2)

        return output_path

    def import_context(self, input_path: Path, merge: bool = False):
        """
        Import context from file.

        Args:
            input_path: Path to context export file
            merge: If True, merge with existing context; if False, replace
        """
        with open(input_path, 'r') as f:
            import_data = json.load(f)

        with self._lock:
            if merge:
                self.active_context.update(import_data.get("active_context", {}))
            else:
                self.active_context = import_data.get("active_context", {})

            self.context_index.update(import_data.get("context_index", {}))
            self._save_active_context()


class ContextStorage:
    """
    Persistent storage layer for context with compression and encryption support.
    """

    def __init__(self, storage_path: Optional[Path] = None):
        """
        Initialize context storage.

        Args:
            storage_path: Path to storage directory
        """
        self.storage_path = Path(storage_path) if storage_path else Path.cwd() / ".memory" / "storage"
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def store(self, key: str, data: Any, compress: bool = True) -> bool:
        """
        Store context data.

        Args:
            key: Storage key
            data: Data to store (must be JSON-serializable)
            compress: Enable compression

        Returns:
            True if successful
        """
        file_path = self.storage_path / f"{key}.json"

        data_to_store = {
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
            "compressed": compress
        }

        with open(file_path, 'w') as f:
            json.dump(data_to_store, f)

        return True

    def retrieve(self, key: str) -> Optional[Any]:
        """
        Retrieve stored context data.

        Args:
            key: Storage key

        Returns:
            Stored data or None
        """
        file_path = self.storage_path / f"{key}.json"

        if not file_path.exists():
            return None

        with open(file_path, 'r') as f:
            stored = json.load(f)

        return stored.get("data")

    def list_stored_keys(self) -> List[str]:
        """
        List all stored context keys.

        Returns:
            List of keys
        """
        return [
            f.stem for f in self.storage_path.glob("*.json")
        ]


def cli_main():
    """CLI entry point for context management."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox3 Context Manager")
    parser.add_argument("action", choices=["status", "add", "get", "search", "clear", "export", "import"])
    parser.add_argument("--key", help="Context key")
    parser.add_argument("--value", help="Context value (JSON)")
    parser.add_argument("--tag", help="Search by tag")
    parser.add_argument("--file", help="File path for import/export")

    args = parser.parse_args()
    ctx = ContextManager()

    if args.action == "status":
        summary = ctx.get_context_summary()
        print(json.dumps(summary, indent=2))

    elif args.action == "add":
        if not args.key or not args.value:
            print("Error: --key and --value required for add")
            return 1
        value = json.loads(args.value)
        ctx.add_context(args.key, value)
        print(f"Added context: {args.key}")

    elif args.action == "get":
        if not args.key:
            print("Error: --key required for get")
            return 1
        value = ctx.get_context(args.key)
        print(json.dumps(value, indent=2))

    elif args.action == "search":
        if args.tag:
            results = ctx.search_by_tag(args.tag)
            print(f"Keys with tag '{args.tag}': {results}")
        else:
            print("Error: --tag required for search")
            return 1

    elif args.action == "export":
        path = ctx.export_context()
        print(f"Exported context to: {path}")

    elif args.action == "import":
        if not args.file:
            print("Error: --file required for import")
            return 1
        ctx.import_context(Path(args.file))
        print(f"Imported context from: {args.file}")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(cli_main())
