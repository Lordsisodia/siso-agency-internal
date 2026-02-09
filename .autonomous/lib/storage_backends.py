#!/usr/bin/env python3
"""
Storage Backends for SISO-Internal Autonomous System

Provides unified storage interface for different backends:
- FileSystem: Local file storage
- Memory: In-memory storage (for testing)
- Hybrid: File + Memory caching

Adapted from BlackBox5 RALF-Core storage system.
"""

import json
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from abc import ABC, abstractmethod
from datetime import datetime
from dataclasses import dataclass, field, asdict


@dataclass
class StorageEntry:
    """Represents a single storage entry."""
    key: str
    data: Dict[str, Any]
    created: datetime = field(default_factory=datetime.now)
    modified: datetime = field(default_factory=datetime.now)
    version: int = 1
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "key": self.key,
            "data": self.data,
            "created": self.created.isoformat(),
            "modified": self.modified.isoformat(),
            "version": self.version,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "StorageEntry":
        """Create from dictionary."""
        return cls(
            key=data["key"],
            data=data["data"],
            created=datetime.fromisoformat(data["created"]),
            modified=datetime.fromisoformat(data["modified"]),
            version=data.get("version", 1),
            metadata=data.get("metadata", {}),
        )


class StorageBackend(ABC):
    """Abstract base class for storage backends."""

    @abstractmethod
    def get(self, key: str) -> Optional[StorageEntry]:
        """Retrieve an entry by key."""
        pass

    @abstractmethod
    def set(self, key: str, data: Dict[str, Any], metadata: Optional[Dict] = None) -> StorageEntry:
        """Store an entry."""
        pass

    @abstractmethod
    def delete(self, key: str) -> bool:
        """Delete an entry."""
        pass

    @abstractmethod
    def list_keys(self, prefix: str = "") -> List[str]:
        """List all keys, optionally filtered by prefix."""
        pass

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Check if key exists."""
        pass


class FileSystemBackend(StorageBackend):
    """File system based storage backend."""

    def __init__(self, base_path: Union[str, Path], format: str = "yaml"):
        """Initialize file system backend.

        Args:
            base_path: Base directory for storage
            format: Storage format ("yaml" or "json")
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.format = format.lower()

        if self.format not in ["yaml", "json"]:
            raise ValueError(f"Unsupported format: {format}")

    def _get_file_path(self, key: str) -> Path:
        """Get file path for a key."""
        # Sanitize key for filesystem
        safe_key = key.replace("/", "_").replace("\\", "_")
        extension = ".yaml" if self.format == "yaml" else ".json"
        return self.base_path / f"{safe_key}{extension}"

    def get(self, key: str) -> Optional[StorageEntry]:
        """Retrieve an entry by key."""
        file_path = self._get_file_path(key)

        if not file_path.exists():
            return None

        try:
            content = file_path.read_text()

            if self.format == "yaml":
                data = yaml.safe_load(content)
            else:
                data = json.loads(content)

            return StorageEntry.from_dict(data)

        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return None

    def set(self, key: str, data: Dict[str, Any], metadata: Optional[Dict] = None) -> StorageEntry:
        """Store an entry."""
        file_path = self._get_file_path(key)

        # Check if entry exists to update version
        existing = self.get(key)
        version = 1
        created = datetime.now()

        if existing:
            version = existing.version + 1
            created = existing.created

        entry = StorageEntry(
            key=key,
            data=data,
            created=created,
            modified=datetime.now(),
            version=version,
            metadata=metadata or {},
        )

        # Write to file
        if self.format == "yaml":
            content = yaml.dump(entry.to_dict(), default_flow_style=False, sort_keys=False)
        else:
            content = json.dumps(entry.to_dict(), indent=2)

        file_path.write_text(content)
        return entry

    def delete(self, key: str) -> bool:
        """Delete an entry."""
        file_path = self._get_file_path(key)

        if file_path.exists():
            file_path.unlink()
            return True
        return False

    def list_keys(self, prefix: str = "") -> List[str]:
        """List all keys, optionally filtered by prefix."""
        keys = []
        extension = ".yaml" if self.format == "yaml" else ".json"

        for file_path in self.base_path.glob(f"*{extension}"):
            key = file_path.stem
            if not prefix or key.startswith(prefix):
                keys.append(key)

        return sorted(keys)

    def exists(self, key: str) -> bool:
        """Check if key exists."""
        return self._get_file_path(key).exists()


class MemoryBackend(StorageBackend):
    """In-memory storage backend (useful for testing)."""

    def __init__(self):
        """Initialize memory backend."""
        self._store: Dict[str, StorageEntry] = {}

    def get(self, key: str) -> Optional[StorageEntry]:
        """Retrieve an entry by key."""
        return self._store.get(key)

    def set(self, key: str, data: Dict[str, Any], metadata: Optional[Dict] = None) -> StorageEntry:
        """Store an entry."""
        existing = self._store.get(key)
        version = 1
        created = datetime.now()

        if existing:
            version = existing.version + 1
            created = existing.created

        entry = StorageEntry(
            key=key,
            data=data,
            created=created,
            modified=datetime.now(),
            version=version,
            metadata=metadata or {},
        )

        self._store[key] = entry
        return entry

    def delete(self, key: str) -> bool:
        """Delete an entry."""
        if key in self._store:
            del self._store[key]
            return True
        return False

    def list_keys(self, prefix: str = "") -> List[str]:
        """List all keys, optionally filtered by prefix."""
        if prefix:
            return sorted([k for k in self._store.keys() if k.startswith(prefix)])
        return sorted(self._store.keys())

    def exists(self, key: str) -> bool:
        """Check if key exists."""
        return key in self._store

    def clear(self):
        """Clear all entries."""
        self._store.clear()


class HybridBackend(StorageBackend):
    """Hybrid backend with file storage and memory caching."""

    def __init__(self, base_path: Union[str, Path], format: str = "yaml"):
        """Initialize hybrid backend."""
        self.file_backend = FileSystemBackend(base_path, format)
        self.cache = MemoryBackend()
        self._cache_enabled = True

    def get(self, key: str) -> Optional[StorageEntry]:
        """Retrieve an entry by key (checks cache first)."""
        # Check cache first
        if self._cache_enabled:
            cached = self.cache.get(key)
            if cached:
                return cached

        # Fall back to file
        entry = self.file_backend.get(key)
        if entry and self._cache_enabled:
            self.cache.set(key, entry.data, entry.metadata)

        return entry

    def set(self, key: str, data: Dict[str, Any], metadata: Optional[Dict] = None) -> StorageEntry:
        """Store an entry (updates both cache and file)."""
        # Update file first
        entry = self.file_backend.set(key, data, metadata)

        # Update cache
        if self._cache_enabled:
            self.cache.set(key, data, metadata)

        return entry

    def delete(self, key: str) -> bool:
        """Delete an entry."""
        # Delete from both
        file_result = self.file_backend.delete(key)
        self.cache.delete(key)
        return file_result

    def list_keys(self, prefix: str = "") -> List[str]:
        """List all keys."""
        return self.file_backend.list_keys(prefix)

    def exists(self, key: str) -> bool:
        """Check if key exists."""
        if self._cache_enabled and self.cache.exists(key):
            return True
        return self.file_backend.exists(key)

    def invalidate_cache(self):
        """Clear the memory cache."""
        self.cache.clear()

    def disable_cache(self):
        """Disable caching."""
        self._cache_enabled = False

    def enable_cache(self):
        """Enable caching."""
        self._cache_enabled = True


class StorageManager:
    """High-level storage manager for different data types."""

    def __init__(self, autonomous_root: Optional[Path] = None):
        """Initialize storage manager."""
        if autonomous_root is None:
            autonomous_root = Path(__file__).parent.parent

        self.autonomous_root = Path(autonomous_root)

        # Initialize specialized backends
        self.memory_short = FileSystemBackend(
            self.autonomous_root / "memory" / "short_term",
            format="yaml"
        )
        self.memory_long = FileSystemBackend(
            self.autonomous_root / "memory" / "long_term",
            format="yaml"
        )
        self.memory_episodic = FileSystemBackend(
            self.autonomous_root / "memory" / "episodic",
            format="yaml"
        )
        self.config = FileSystemBackend(
            self.autonomous_root / "config",
            format="yaml"
        )

    def store_insight(self, category: str, data: Dict[str, Any], key: Optional[str] = None) -> str:
        """Store an insight in long-term memory.

        Args:
            category: Category of insight (e.g., "testing", "architecture")
            data: The insight data
            key: Optional specific key, otherwise auto-generated

        Returns:
            The storage key
        """
        if key is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            key = f"{category}_{timestamp}"

        self.memory_long.set(key, data, {"category": category, "type": "insight"})
        return key

    def store_episode(self, run_id: str, data: Dict[str, Any]) -> str:
        """Store an episodic memory (run/session record).

        Args:
            run_id: Identifier for the run/session
            data: Episode data

        Returns:
            The storage key
        """
        key = f"episode_{run_id}"
        self.memory_episodic.set(key, data, {"run_id": run_id, "type": "episode"})
        return key

    def store_short_term(self, key: str, data: Dict[str, Any]) -> str:
        """Store short-term memory.

        Args:
            key: Memory key
            data: Memory data

        Returns:
            The storage key
        """
        self.memory_short.set(key, data, {"type": "short_term"})
        return key

    def get_insights(self, category: Optional[str] = None) -> List[StorageEntry]:
        """Retrieve insights, optionally filtered by category."""
        entries = []
        for key in self.memory_long.list_keys():
            entry = self.memory_long.get(key)
            if entry:
                if category is None or entry.metadata.get("category") == category:
                    entries.append(entry)
        return entries

    def get_episode(self, run_id: str) -> Optional[StorageEntry]:
        """Retrieve an episode by run ID."""
        key = f"episode_{run_id}"
        return self.memory_episodic.get(key)

    def get_short_term(self, key: str) -> Optional[StorageEntry]:
        """Retrieve short-term memory."""
        return self.memory_short.get(key)


def get_storage_manager(autonomous_root: Optional[Path] = None) -> StorageManager:
    """Get the default storage manager instance."""
    return StorageManager(autonomous_root)


if __name__ == "__main__":
    # Simple CLI for testing
    import sys

    if len(sys.argv) < 2:
        print("Usage: python storage_backends.py [test]")
        sys.exit(1)

    if sys.argv[1] == "test":
        # Test the storage backends
        print("Testing storage backends...")

        # Create temp directory for testing
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdir:
            # Test FileSystemBackend
            fs = FileSystemBackend(tmpdir, format="yaml")
            fs.set("test_key", {"value": 42, "name": "test"})

            entry = fs.get("test_key")
            assert entry is not None
            assert entry.data["value"] == 42
            print("✓ FileSystemBackend works")

            # Test MemoryBackend
            mem = MemoryBackend()
            mem.set("test_key", {"value": 100})

            entry = mem.get("test_key")
            assert entry is not None
            assert entry.data["value"] == 100
            print("✓ MemoryBackend works")

            # Test HybridBackend
            hybrid = HybridBackend(tmpdir + "_hybrid", format="json")
            hybrid.set("test_key", {"value": 200})

            entry = hybrid.get("test_key")
            assert entry is not None
            assert entry.data["value"] == 200
            print("✓ HybridBackend works")

            # Test StorageManager
            manager = StorageManager(Path(tmpdir) / "autonomous")
            key = manager.store_insight("testing", {"finding": "it works!"})
            print(f"✓ StorageManager stored insight with key: {key}")

            insights = manager.get_insights("testing")
            assert len(insights) > 0
            print(f"✓ Retrieved {len(insights)} insight(s)")

        print("\nAll tests passed!")
