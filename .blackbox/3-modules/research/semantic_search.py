#!/usr/bin/env python3
"""
Semantic Search Engine for Blackbox3 Memory Architecture

Provides vector-based semantic search over project files using
ChromaDB and sentence-transformers.
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import json

# Try to import dependencies
try:
    import chromadb
    from chromadb.config import Settings
    from sentence_transformers import SentenceTransformer
    import numpy as np
except ImportError as e:
    print(f"Missing dependency: {e}", file=sys.stderr)
    print("Install with: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)


class SemanticSearchEngine:
    """
    Vector-based semantic search over project files.

    Uses ChromaDB for vector storage and sentence-transformers
    for embeddings.
    """

    def __init__(
        self,
        vector_db_path: str = None,
        embedding_model: str = "all-MiniLM-L6-v2",
        chunk_size: int = 500,
        overlap: int = 50
    ):
        """
        Initialize the semantic search engine.

        Args:
            vector_db_path: Path to vector database
            embedding_model: Name of sentence-transformers model
            chunk_size: Size of text chunks for embedding
            overlap: Overlap between chunks
        """
        if vector_db_path is None:
            project_root = Path(__file__).parent.parent.parent
            vector_db_path = project_root / "modules" / "research" / "vector-db"

        self.vector_db_path = Path(vector_db_path)
        self.vector_db_path.mkdir(parents=True, exist_ok=True)

        self.chunk_size = chunk_size
        self.overlap = overlap

        # Initialize embedding model
        print(f"Loading embedding model: {embedding_model}")
        self.model = SentenceTransformer(embedding_model)

        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(
            path=str(self.vector_db_path),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="blackbox_memory",
            metadata={"description": "Blackbox3 memory index"}
        )

    def _chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks.

        Args:
            text: Input text

        Returns:
            List of text chunks
        """
        words = text.split()
        chunks = []

        start = 0
        while start < len(words):
            end = start + self.chunk_size
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start = end - self.overlap

        return chunks

    def index_file(self, file_path: Path) -> int:
        """
        Index a single file.

        Args:
            file_path: Path to file

        Returns:
            Number of chunks indexed
        """
        if not file_path.exists():
            print(f"File not found: {file_path}", file=sys.stderr)
            return 0

        # Read file
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}", file=sys.stderr)
            return 0

        # Skip if too small
        if len(content.split()) < 50:
            return 0

        # Chunk text
        chunks = self._chunk_text(content)

        # Create embeddings
        embeddings = self.model.encode(chunks, show_progress_bar=False)

        # Create IDs and metadata
        file_str = str(file_path)
        ids = [
            f"{file_str}#{i}"
            for i in range(len(chunks))
        ]
        metadatas = [
            {
                "file_path": file_str,
                "chunk_index": i,
                "total_chunks": len(chunks)
            }
            for i in range(len(chunks))
        ]

        # Add to collection
        self.collection.add(
            documents=chunks,
            embeddings=embeddings.tolist(),
            ids=ids,
            metadatas=metadatas
        )

        return len(chunks)

    def index_directory(
        self,
        directory: Path,
        pattern: str = "*.md",
        force: bool = False
    ) -> Dict[str, int]:
        """
        Index all files in directory.

        Args:
            directory: Directory to index
            pattern: File pattern to match
            force: Re-index all files

        Returns:
            Dict with indexing stats
        """
        directory = Path(directory)

        if not directory.is_dir():
            print(f"Not a directory: {directory}", file=sys.stderr)
            return {}

        stats = {
            "indexed": 0,
            "skipped": 0,
            "errors": 0,
            "total_chunks": 0
        }

        # Get existing files if not forcing
        existing_files = set()
        if not force:
            for doc in self.collection.get():
                if doc and "metadatas" in doc:
                    for meta in doc["metadatas"]:
                        if meta and "file_path" in meta:
                            existing_files.add(meta["file_path"])

        # Index files
        for file_path in directory.rglob(pattern):
            if not file_path.is_file():
                continue

            file_str = str(file_path)

            # Skip if already indexed
            if not force and file_str in existing_files:
                stats["skipped"] += 1
                continue

            # Index file
            try:
                chunks = self.index_file(file_path)
                if chunks > 0:
                    stats["indexed"] += 1
                    stats["total_chunks"] += chunks
                    print(f"  Indexed: {file_path} ({chunks} chunks)")
                else:
                    stats["skipped"] += 1
            except Exception as e:
                print(f"Error indexing {file_path}: {e}", file=sys.stderr)
                stats["errors"] += 1

        return stats

    def search(
        self,
        query: str,
        n_results: int = 5,
        filter_path: str = None
    ) -> List[Dict]:
        """
        Search for similar documents.

        Args:
            query: Search query
            n_results: Number of results to return
            filter_path: Optional path filter

        Returns:
            List of search results
        """
        # Create query embedding
        query_embedding = self.model.encode([query])

        # Build where clause
        where_clause = None
        if filter_path:
            where_clause = {"file_path": {"$contains": filter_path}}

        # Search
        results = self.collection.query(
            query_embeddings=query_embedding.tolist(),
            n_results=n_results,
            where=where_clause
        )

        # Format results
        formatted = []
        if results and "documents" in results and results["documents"]:
            for i, doc in enumerate(results["documents"][0]):
                metadata = results["metadatas"][0][i] if results["metadatas"] else {}
                distance = results["distances"][0][i] if "distances" in results else None

                formatted.append({
                    "content": doc,
                    "file_path": metadata.get("file_path", "unknown"),
                    "chunk_index": metadata.get("chunk_index", 0),
                    "similarity": 1 - distance if distance is not None else 0
                })

        return formatted

    def get_stats(self) -> Dict:
        """
        Get index statistics.

        Returns:
            Dict with stats
        """
        count = self.collection.count()

        return {
            "total_chunks": count,
            "vector_db_path": str(self.vector_db_path),
            "embedding_model": self.model.model_name
        }


def main():
    """CLI for semantic search."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Semantic search for Blackbox3 memory"
    )
    parser.add_argument("command", choices=["index", "search", "stats"],
                       help="Command to run")
    parser.add_argument("--path", type=Path,
                       help="File or directory to index")
    parser.add_argument("--pattern", default="*.md",
                       help="File pattern for indexing (default: *.md)")
    parser.add_argument("--query", help="Search query")
    parser.add_argument("--n-results", type=int, default=5,
                       help="Number of search results (default: 5)")
    parser.add_argument("--force", action="store_true",
                       help="Re-index all files")

    args = parser.parse_args()

    # Initialize engine
    engine = SemanticSearchEngine()

    if args.command == "index":
        if not args.path:
            print("Error: --path required for indexing", file=sys.stderr)
            sys.exit(1)

        if args.path.is_file():
            chunks = engine.index_file(args.path)
            print(f"\nIndexed {args.path} ({chunks} chunks)")
        elif args.path.is_dir():
            stats = engine.index_directory(args.path, args.pattern, args.force)
            print(f"\nIndexing complete:")
            print(f"  Indexed: {stats['indexed']} files")
            print(f"  Skipped: {stats['skipped']} files")
            print(f"  Errors: {stats['errors']} files")
            print(f"  Total chunks: {stats['total_chunks']}")
        else:
            print(f"Error: Not a file or directory: {args.path}", file=sys.stderr)
            sys.exit(1)

    elif args.command == "search":
        if not args.query:
            print("Error: --query required for searching", file=sys.stderr)
            sys.exit(1)

        results = engine.search(args.query, args.n_results)

        print(f"\nSearch results for: {args.query}")
        print("=" * 60)
        for i, result in enumerate(results, 1):
            print(f"\n{i}. {result['file_path']}")
            print(f"   Similarity: {result['similarity']:.2f}")
            print(f"   Content: {result['content'][:200]}...")

    elif args.command == "stats":
        stats = engine.get_stats()
        print(f"\nSemantic Search Stats:")
        print(f"  Total chunks: {stats['total_chunks']}")
        print(f"  Vector DB: {stats['vector_db_path']}")
        print(f"  Model: {stats['embedding_model']}")


if __name__ == "__main__":
    main()
