"""
Ralph Runtime - Main Entry Point

Run Ralph autonomous loop:
  python -m blackbox5.engine.runtime.ralph --workspace /path/to/project --prd prd.json
"""

import asyncio
import argparse
import logging
import sys
from pathlib import Path

from .ralph_runtime import RalphRuntime, run_ralph

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("RalphMain")


def main():
    """Main entry point for Ralph Runtime"""

    parser = argparse.ArgumentParser(
        description='Ralph Runtime - Autonomous Agent Loop for Blackbox5',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with default settings
  python -m blackbox5.engine.runtime.ralph --workspace . --prd prd.json

  # Run with custom max iterations
  python -m blackbox5.engine.runtime.ralph --workspace . --prd prd.json --max-iterations 50

  # Run with verbose logging
  python -m blackbox5.engine.runtime.ralph --workspace . --prd prd.json --verbose
        """
    )

    parser.add_argument(
        '--workspace',
        type=str,
        required=True,
        help='Path to workspace directory'
    )

    parser.add_argument(
        '--prd',
        type=str,
        required=True,
        help='Path to PRD JSON file'
    )

    parser.add_argument(
        '--max-iterations',
        type=int,
        default=100,
        help='Maximum number of iterations (default: 100)'
    )

    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Parse PRD and show plan without executing'
    )

    args = parser.parse_args()

    # Adjust logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Validate paths
    workspace_path = Path(args.workspace).resolve()
    prd_path = Path(args.prd).resolve()

    if not workspace_path.exists():
        logger.error(f"Workspace path does not exist: {workspace_path}")
        sys.exit(1)

    if not prd_path.exists():
        logger.error(f"PRD file does not exist: {prd_path}")
        sys.exit(1)

    # Print banner
    print("")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║           Ralph Autonomous Loop - Starting                ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print("")
    print(f"Workspace: {workspace_path}")
    print(f"PRD: {prd_path.name}")
    print(f"Max Iterations: {args.max_iterations}")
    print("")

    # Run Ralph
    try:
        asyncio.run(run_ralph(
            workspace_path=workspace_path,
            prd_path=prd_path,
            max_iterations=args.max_iterations,
            dry_run=args.dry_run
        ))
    except KeyboardInterrupt:
        print("\n⏹️  Ralph Runtime stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Ralph Runtime failed: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
