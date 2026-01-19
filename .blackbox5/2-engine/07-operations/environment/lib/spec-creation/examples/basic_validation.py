"""
Basic Validation Example

Demonstrates how to use the SpecValidator to validate spec artifacts.
"""

from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from validation import SpecValidator


def main():
    """Run basic validation example."""
    validator = SpecValidator()

    # Example 1: Validate PRD vs User Stories
    print("=" * 60)
    print("Example 1: Validating PRD vs User Stories")
    print("=" * 60)

    # In a real scenario, these would be actual file paths
    prd_file = "specs/example-spec/prd.md"
    stories_file = "specs/example-spec/user-stories.md"

    results = validator.validate_prd_vs_user_stories(prd_file, stories_file)

    if results:
        print(f"Found {len(results)} issues:")
        for result in results:
            print(f"  [{result.severity.upper()}] {result.location}: {result.message}")
    else:
        print("No issues found!")

    # Example 2: Validate Requirements vs Constitution
    print("\n" + "=" * 60)
    print("Example 2: Validating Requirements vs Constitution")
    print("=" * 60)

    requirements_file = "specs/example-spec/functional-requirements.md"
    constitution_file = "specs/example-spec/constitution.md"

    results = validator.validate_requirements_vs_constitution(
        requirements_file,
        constitution_file
    )

    if results:
        print(f"Found {len(results)} issues:")
        for result in results:
            print(f"  [{result.severity.upper()}] {result.location}: {result.message}")
    else:
        print("No issues found!")

    # Example 3: Validate Traceability
    print("\n" + "=" * 60)
    print("Example 3: Validating Traceability")
    print("=" * 60)

    spec_dir = "specs/example-spec"
    results = validator.validate_traceability(spec_dir)

    if results:
        print(f"Found {len(results)} issues:")
        for result in results:
            print(f"  [{result.severity.upper()}] {result.location}: {result.message}")
    else:
        print("No issues found!")

    # Example 4: Generate Validation Report
    print("\n" + "=" * 60)
    print("Example 4: Generating Validation Report")
    print("=" * 60)

    report = validator.generate_validation_report()
    print(report)

    # Save report to file
    report_file = "validation-report.md"
    saved_path = validator.save_report(report_file)
    print(f"\nReport saved to: {saved_path}")


if __name__ == "__main__":
    main()
