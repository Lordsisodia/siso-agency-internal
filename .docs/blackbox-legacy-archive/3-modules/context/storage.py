#!/usr/bin/env python3
"""
Context Storage for Blackbox3

Provides persistent storage layer for context with compression,
encryption support, and multi-backend storage capabilities.
"""

import os
import json
import gzip
import hashlib
import pickle
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
import threading
from abc import ABC, abstractmethod


class StorageBackend(ABC):
    """Abstract base class for storage backends."""

    @abstractmethod
    def store(self, key: str, data: bytes) -> bool:
        """Store data by key."""
        pass

    @abstractmethod
    def retrieve(self, key: str) -> Optional[bytes]:
        """Retrieve data by key."""
        pass

    @abstractmethod
    def delete(self, key: str) -> bool:
        """Delete data by key."""
        pass

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Check if key exists."""
        pass

    @abstractmethod
    def list_keys(self) -> List[str]:
        """List all keys."""
        pass


class FileSystemBackend(StorageBackend):
    """File system storage backend with compression support."""

    def __init__(self, storage_path: Path, compress: bool = True):
        """
        Initialize file system backend.

        Args:
            storage_path: Root directory for storage
            compress: Enable gzip compression
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.compress = compress

    def _get_path(self, key: str) -> Path:
        """Get file path for key."""
        # Use hash-based sharding for better performance
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        shard = key_hash[:2]
        shard_dir = self.storage_path / shard
        shard_dir.mkdir(exist_ok=True)
        return shard_dir / f"{key_hash}.{'gz' if self.compress else 'json'}"

    def store(self, key: str, data: bytes) -> bool:
        """Store data to file system."""
        try:
            file_path = self._get_path(key)
            if self.compress:
                with gzip.open(file_path, 'wb') as f:
                    f.write(data)
            else:
                with open(file_path, 'wb') as f:
                    f.write(data)
            return True
        except Exception as e:
            print(f"Error storing {key}: {e}")
            return False

    def retrieve(self, key: str) -> Optional[bytes]:
        """Retrieve data from file system."""
        try:
            file_path = self._get_path(key)
            if not file_path.exists():
                return None

            if self.compress:
                with gzip.open(file_path, 'rb') as f:
                    return f.read()
            else:
                with open(file_path, 'rb') as f:
                    return f.read()
        except Exception as e:
            print(f"Error retrieving {key}: {e}")
            return None

    def delete(self, key: str) -> bool:
        """Delete data from file system."""
        try:
            file_path = self._get_path(key)
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error deleting {key}: {e}")
            return False

    def exists(self, key: str) -> bool:
        """Check if key exists."""
        return self._get_path(key).exists()

    def list_keys(self) -> List[str]:
        """List all keys (expensive operation)."""
        keys = []
        for shard_dir in self.storage_path.iterdir():
            if shard_dir.is_dir():
                for file_path in shard_dir.glob("*.gz" if self.compress else "*.json"):
                    keys.append(file_path.stem)
        return keys


class MemoryBackend(StorageBackend):
    """In-memory storage backend for testing and caching."""

    def __init__(self):
        """Initialize in-memory backend."""
        self._storage: Dict[str, bytes] = {}
        self._lock = threading.RLock()

    def store(self, key: str, data: bytes) -> bool:
        """Store data in memory."""
        with self._lock:
            self._storage[key] = data
            return True

    def retrieve(self, key: str) -> Optional[bytes]:
        """Retrieve data from memory."""
        with self._lock:
            return self._storage.get(key)

    def delete(self, key: str) -> bool:
        """Delete data from memory."""
        with self._lock:
            if key in self._storage:
                del self._storage[key]
                return True
            return False

    def exists(self, key: str) -> bool:
        """Check if key exists in memory."""
        with self._lock:
            return key in self._storage

    def list_keys(self) -> List[str]:
        """List all keys in memory."""
        with self._lock:
            return list(self._storage.keys())


class ContextStorage:
    """
    Advanced persistent storage layer for context data.

    Features:
    - Multiple storage backends (filesystem, memory)
    - Automatic compression
    - Data versioning
    - TTL support
    - Encryption-ready architecture
    - Multi-format support (JSON, pickle)
    """

    def __init__(
        self,
        backend: Optional[StorageBackend] = None,
        default_format: str = "json",
        enable_compression: bool = True,
        enable_versioning: bool = True
    ):
        """
        Initialize context storage.

        Args:
            backend: Storage backend (defaults to FileSystemBackend)
            default_format: Default serialization format (json, pickle)
            enable_compression: Enable compression
            enable_versioning: Enable data versioning
        """
        if backend is None:
            storage_path = Path.cwd() / ".memory" / "storage"
            backend = FileSystemBackend(storage_path, compress=enable_compression)

        self.backend = backend
        self.default_format = default_format
        self.enable_versioning = enable_versioning
        self._lock = threading.RLock()

        # Version tracking
        self.versions: Dict[str, List[str]] = {}

    def _serialize(self, data: Any, format: str) -> bytes:
        """Serialize data to bytes."""
        if format == "json":
            return json.dumps(data).encode('utf-8')
        elif format == "pickle":
            return pickle.dumps(data)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _deserialize(self, data: bytes, format: str) -> Any:
        """Deserialize data from bytes."""
        if format == "json":
            return json.loads(data.decode('utf-8'))
        elif format == "pickle":
            return pickle.loads(data)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def store(
        self,
        key: str,
        data: Any,
        format: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Store context data.

        Args:
            key: Storage key
            data: Data to store (must be serializable)
            format: Serialization format (json, pickle)
            metadata: Optional metadata
            ttl: Time-to-live in seconds

        Returns:
            True if successful
        """
        format = format or self.default_format

        try:
            # Wrap data with metadata
            wrapper = {
                "data": data,
                "metadata": metadata or {},
                "format": format,
                "timestamp": datetime.utcnow().isoformat(),
                "version": self._get_next_version(key) if self.enable_versioning else 1
            }

            if ttl:
                wrapper["expires_at"] = (datetime.utcnow() + timedelta(seconds=ttl)).isoformat()

            # Serialize and store
            serialized = self._serialize(wrapper, format)
            success = self.backend.store(key, serialized)

            if success and self.enable_versioning:
                self._track_version(key, wrapper["version"])

            return success

        except Exception as e:
            print(f"Error storing {key}: {e}")
            return False

    def retrieve(self, key: str) -> Optional[Any]:
        """
        Retrieve stored context data.

        Args:
            key: Storage key

        Returns:
            Stored data or None
        """
        try:
            serialized = self.backend.retrieve(key)
            if serialized is None:
                return None

            # Deserialize wrapper
            wrapper = self._deserialize(serialized, wrapper.get("format", self.default_format))

            # Check TTL
            if "expires_at" in wrapper:
                expires_at = datetime.fromisoformat(wrapper["expires_at"])
                if datetime.utcnow() > expires_at:
                    self.delete(key)
                    return None

            return wrapper.get("data")

        except Exception as e:
            print(f"Error retrieving {key}: {e}")
            return None

    def retrieve_with_metadata(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve stored data with metadata.

        Args:
            key: Storage key

        Returns:
            Dictionary with data and metadata or None
        """
        try:
            serialized = self.backend.retrieve(key)
            if serialized is None:
                return None

            wrapper = self._deserialize(serialized, self.default_format)

            # Check TTL
            if "expires_at" in wrapper:
                expires_at = datetime.fromisoformat(wrapper["expires_at"])
                if datetime.utcnow() > expires_at:
                    self.delete(key)
                    return None

            return {
                "data": wrapper.get("data"),
                "metadata": wrapper.get("metadata", {}),
                "timestamp": wrapper.get("timestamp"),
                "version": wrapper.get("version", 1)
            }

        except Exception as e:
            print(f"Error retrieving {key}: {e}")
            return None

    def delete(self, key: str) -> bool:
        """
        Delete stored context data.

        Args:
            key: Storage key

        Returns:
            True if deleted
        """
        success = self.backend.delete(key)
        if success and self.enable_versioning:
            self.versions.pop(key, None)
        return success

    def exists(self, key: str) -> bool:
        """
        Check if key exists.

        Args:
            key: Storage key

        Returns:
            True if exists
        """
        return self.backend.exists(key)

    def list_keys(self) -> List[str]:
        """
        List all stored keys.

        Returns:
            List of keys
        """
        return self.backend.list_keys()

    def get_storage_stats(self) -> Dict[str, Any]:
        """
        Get storage statistics.

        Returns:
            Dictionary with stats
        """
        keys = self.list_keys()
        total_keys = len(keys)

        # Count by format
        format_counts = {}
        for key in keys:
            with_metadata = self.retrieve_with_metadata(key)
            if with_metadata:
                format_type = with_metadata.get("metadata", {}).get("format", "unknown")
                format_counts[format_type] = format_counts.get(format_type, 0) + 1

        return {
            "total_keys": total_keys,
            "format_distribution": format_counts,
            "versioning_enabled": self.enable_versioning,
            "backend_type": type(self.backend).__name__
        }

    def _get_next_version(self, key: str) -> int:
        """Get next version number for key."""
        if key not in self.versions:
            return 1
        return len(self.versions[key]) + 1

    def _track_version(self, key: str, version: int):
        """Track version for key."""
        if key not in self.versions:
            self.versions[key] = []
        self.versions[key].append(str(version))

    def cleanup_expired(self) -> int:
        """
        Clean up expired entries.

        Returns:
            Number of entries cleaned up
        """
        cleaned = 0
        keys = self.list_keys()

        for key in keys:
            with_metadata = self.retrieve_with_metadata(key)
            if with_metadata is None:
                # Already expired and deleted
                cleaned += 1
                continue

            if "expires_at" in with_metadata:
                expires_at = datetime.fromisoformat(with_metadata["expires_at"])
                if datetime.utcnow() > expires_at:
                    self.delete(key)
                    cleaned += 1

        return cleaned

    def export_data(self, output_path: Path) -> bool:
        """
        Export all stored data to file.

        Args:
            output_path: Output file path

        Returns:
            True if successful
        """
        try:
            export_data = {}
            keys = self.list_keys()

            for key in keys:
                with_metadata = self.retrieve_with_metadata(key)
                if with_metadata:
                    export_data[key] = with_metadata

            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2)

            print(f"Exported {len(export_data)} items to {output_path}")
            return True

        except Exception as e:
            print(f"Error exporting data: {e}")
            return False

    def import_data(self, input_path: Path, merge: bool = False) -> int:
        """
        Import data from file.

        Args:
            input_path: Input file path
            merge: If True, merge with existing; if False, replace

        Returns:
            Number of items imported
        """
        try:
            with open(input_path, 'r') as f:
                import_data = json.load(f)

            if not merge:
                # Clear existing
                for key in self.list_keys():
                    self.delete(key)

            imported = 0
            for key, item in import_data.items():
                if self.store(
                    key,
                    item["data"],
                    metadata=item.get("metadata", {}),
                    ttl=None  # Don't restore TTL
                ):
                    imported += 1

            print(f"Imported {imported} items from {input_path}")
            return imported

        except Exception as e:
            print(f"Error importing data: {e}")
            return 0


class CacheLayer:
    """
    Multi-level cache layer for context storage.

    Features:
    - L1: In-memory cache (fastest)
    - L2: Storage backend (persistent)
    - Automatic cache eviction
    - TTL support
    """

    def __init__(
        self,
        storage: ContextStorage,
        max_l1_items: int = 1000,
        l1_ttl: int = 300  # 5 minutes
    ):
        """
        Initialize cache layer.

        Args:
            storage: Underlying storage
            max_l1_items: Maximum items in L1 cache
            l1_ttl: L1 cache TTL in seconds
        """
        self.storage = storage
        self.l1_cache = MemoryBackend()
        self.max_l1_items = max_l1_items
        self.l1_ttl = l1_ttl
        self._l1_timestamps: Dict[str, datetime] = {}
        self._lock = threading.RLock()

    def get(self, key: str) -> Optional[Any]:
        """Get data from cache (L1) or storage (L2)."""
        # Try L1 first
        with self._lock:
            if key in self._l1_timestamps:
                age = (datetime.utcnow() - self._l1_timestamps[key]).total_seconds()
                if age < self.l1_ttl:
                    data = self.l1_cache.retrieve(key)
                    if data:
                        return self.storage._deserialize(data, self.storage.default_format)

                # Evict expired
                self._evict_from_l1(key)

        # Fall back to L2
        data = self.storage.retrieve(key)
        if data is not None:
            # Promote to L1
            self._promote_to_l1(key, data)

        return data

    def set(self, key: str, data: Any, **kwargs) -> bool:
        """Set data in both cache and storage."""
        # Store in L2
        success = self.storage.store(key, data, **kwargs)

        if success:
            # Promote to L1
            self._promote_to_l1(key, data)

        return success

    def delete(self, key: str) -> bool:
        """Delete from both cache and storage."""
        with self._lock:
            self._evict_from_l1(key)
        return self.storage.delete(key)

    def _promote_to_l1(self, key: str, data: Any):
        """Promote data to L1 cache."""
        with self._lock:
            # Evict if at capacity
            if len(self._l1_timestamps) >= self.max_l1_items:
                # LRU eviction
                oldest_key = min(self._l1_timestamps.keys(),
                                key=lambda k: self._l1_timestamps[k])
                self._evict_from_l1(oldest_key)

            # Store in L1
            serialized = self.storage._serialize(data, self.storage.default_format)
            self.l1_cache.store(key, serialized)
            self._l1_timestamps[key] = datetime.utcnow()

    def _evict_from_l1(self, key: str):
        """Evict key from L1 cache."""
        with self._lock:
            self.l1_cache.delete(key)
            self._l1_timestamps.pop(key, None)

    def clear_l1(self):
        """Clear L1 cache."""
        with self._lock:
            for key in list(self._l1_timestamps.keys()):
                self._evict_from_l1(key)

    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        with self._lock:
            return {
                "l1_cache_size": len(self._l1_timestamps),
                "l1_max_items": self.max_l1_items,
                "l1_ttl_seconds": self.l1_ttl,
                "l1_utilization_percent": (len(self._l1_timestamps) / self.max_l1_items) * 100,
                "storage_stats": self.storage.get_storage_stats()
            }


def cli_main():
    """CLI entry point for storage management."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox3 Context Storage")
    parser.add_argument("action", choices=["stats", "cleanup", "export", "import", "cache-stats"])
    parser.add_argument("--file", help="File path for export/import")

    args = parser.parse_args()
    storage = ContextStorage()
    cache = CacheLayer(storage)

    if args.action == "stats":
        stats = storage.get_storage_stats()
        print(json.dumps(stats, indent=2))

    elif args.action == "cleanup":
        cleaned = storage.cleanup_expired()
        print(f"Cleaned up {cleaned} expired entries")

    elif args.action == "export":
        if not args.file:
            print("Error: --file required for export")
            return 1
        storage.export_data(Path(args.file))

    elif args.action == "import":
        if not args.file:
            print("Error: --file required for import")
            return 1
        storage.import_data(Path(args.file))

    elif args.action == "cache-stats":
        stats = cache.get_cache_stats()
        print(json.dumps(stats, indent=2))

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(cli_main())
