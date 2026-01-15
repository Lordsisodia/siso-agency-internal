#!/usr/bin/env python3
"""
Token counting utility for context management.
"""

import tiktoken
import sys
from pathlib import Path
from typing import Dict, List
import json


def estimate_tokens(text: str, model: str = "gpt-4") -> int:
    """Estimate token count for given text."""
    try:
        encoder = tiktoken.encoding_for_model(model)
    except KeyError:
        encoder = tiktoken.get_encoding("cl100k_base")
    return len(encoder.encode(text))


def count_file_tokens(file_path: Path) -> int:
    """Count tokens in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return estimate_tokens(content)
    except Exception as e:
        print(f"Error reading {file_path}: {e}", file=sys.stderr)
        return 0


def count_directory_tokens(directory: Path, pattern: str = "*.md") -> Dict[str, int]:
    """Count tokens for all files matching pattern in directory."""
    results = {}
    for file_path in directory.rglob(pattern):
        if file_path.is_file():
            tokens = count_file_tokens(file_path)
            results[str(file_path.relative_to(directory))] = tokens
    return results


def find_large_files(directory: Path, threshold: int = 50000,
                    pattern: str = "*.md") -> List[tuple]:
    """Find files exceeding token threshold."""
    large_files = []
    for file_path in directory.rglob(pattern):
        if file_path.is_file():
            tokens = count_file_tokens(file_path)
            if tokens > threshold:
                large_files.append((file_path, tokens))
    large_files.sort(key=lambda x: x[1], reverse=True)
    return large_files


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Count tokens in files to manage context window"
    )
    parser.add_argument("path", type=Path, help="File or directory to analyze")
    parser.add_argument("-t", "--threshold", type=int, default=50000,
                       help="Token threshold (default: 50K)")
    parser.add_argument("-p", "--pattern", default="*.md",
                       help="File pattern (default: *.md)")
    parser.add_argument("-j", "--json", action="store_true",
                       help="Output results as JSON")
    parser.add_argument("-f", "--find-large", action="store_true",
                       help="Only show files exceeding threshold")

    args = parser.parse_args()

    if args.path.is_file():
        tokens = count_file_tokens(args.path)
        result = {str(args.path): tokens}
    elif args.path.is_dir():
        if args.find_large:
            large_files = find_large_files(args.path, args.threshold, args.pattern)
            if large_files:
                print(f"\nFiles exceeding {args.threshold:,} token threshold:")
                print("=" * 80)
                for file_path, count in large_files:
                    print(f"{count:>10,} tokens - {file_path}")
                print()
            else:
                print(f"No files found exceeding {args.threshold:,} tokens.")
            return
        else:
            result = count_directory_tokens(args.path, args.pattern)
    else:
        print(f"Error: {args.path} is not a valid file or directory", file=sys.stderr)
        sys.exit(1)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        total = sum(result.values())
        print(f"\nToken Count Report")
        print("=" * 60)
        for file_path, count in sorted(result.items(), key=lambda x: x[1], reverse=True):
            display_path = file_path[:47] + "..." if len(file_path) > 50 else file_path
            print(f"{display_path:<50} {count:>10,}")
        print("-" * 60)
        print(f"{'TOTAL':<50} {total:>10,}")
        print()


if __name__ == "__main__":
    main()
