"""
Comprehensive Validation Example

Demonstrates full validation workflow with mock spec data.
"""

from pathlib import Path
import sys
import tempfile
import os

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from validation import SpecValidator, ValidationResult
from spec_types import StructuredSpec, UserStory, FunctionalRequirement


def create_mock_spec_files(temp_dir: Path):
    """Create mock spec files for testing validation."""

    # Create mock PRD
    prd_content = """# Product Requirements Document

## User Stories

### US-001: User Authentication
As a user, I want to authenticate securely so that my data is protected.

### US-002: Profile Management
As a user, I want to manage my profile so that I can keep my information updated.

### US-003: Non-existent Story
This story doesn't exist in user-stories.md

## Functional Requirements

### FR-001: Secure Login System
The system shall provide secure login functionality.
- Traces to: US-001

### FR-002: Profile Editing
The system shall allow users to edit their profile.
- Traces to: US-002

## Success Criteria
1. All user stories completed
2. 100% test coverage
"""

    # Create mock User Stories
    stories_content = """# User Stories

## US-001: User Authentication
**As a** registered user
**I want to** log in securely with email/password
**So that** my account and data are protected

**Acceptance Criteria:**
- User can log in with valid credentials
- User cannot log in with invalid credentials
- Session is maintained after login

**Priority:** High
**Complexity:** Medium

## US-002: Profile Management
**As a** registered user
**I want to** update my profile information
**So that** my account information is current

**Acceptance Criteria:**
- User can update name, email, and bio
- Changes are persisted immediately
- Validation prevents invalid data

**Priority:** Medium
**Complexity:** Low

## US-004: Notifications
**As a** user
**I want to** receive notifications
**So that** I stay updated

**Note:** This story is not referenced in the PRD
"""

    # Create mock Constitution
    constitution_content = """# Project Constitution

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React |
| Backend | Python/FastAPI |
| Database | PostgreSQL |

## Architectural Principles

1. **Microservices Architecture**: Services should be loosely coupled
2. **API-First Design**: All features exposed via REST API
3. **Security First**: All endpoints require authentication

## Development Standards

- All code must be tested
- Documentation is required
- Code review process must be followed
"""

    # Create mock Functional Requirements
    requirements_content = """# Functional Requirements

## FR-001: Secure Login System
The system shall provide secure login functionality using email and password.

**Details:**
- Passwords must be hashed using bcrypt
- Sessions should use JWT tokens
- Login rate limiting must be implemented

**Traces to:** US-001

## FR-002: Profile Editing
The system shall allow users to edit their profile information.

**Details:**
- Users can update name, email, bio
- Email changes require verification
- Validation prevents invalid data

**Traces to:** US-002

## FR-003: Notification System
The system shall send notifications to users.

**Note:** This requirement uses Vue.js components (incompatible with constitution!)
"""

    # Write files
    (temp_dir / "prd.md").write_text(prd_content)
    (temp_dir / "user-stories.md").write_text(stories_content)
    (temp_dir / "constitution.md").write_text(constitution_content)
    (temp_dir / "functional-requirements.md").write_text(requirements_content)

    print(f"Created mock spec files in: {temp_dir}")


def run_comprehensive_validation():
    """Run comprehensive validation on mock spec files."""

    print("=" * 70)
    print("COMPREHENSIVE VALIDATION EXAMPLE")
    print("=" * 70)

    # Create temporary directory for mock files
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        # Create mock spec files
        create_mock_spec_files(temp_path)

        # Initialize validator
        validator = SpecValidator()

        # Validation 1: PRD vs User Stories
        print("\n" + "=" * 70)
        print("VALIDATION 1: PRD vs User Stories")
        print("=" * 70)

        results = validator.validate_prd_vs_user_stories(
            str(temp_path / "prd.md"),
            str(temp_path / "user-stories.md")
        )

        print(f"\nResults: {len(results)} issues found\n")
        for result in results:
            symbol = "🔴" if result.severity == "high" else "🟡" if result.severity == "medium" else "🟢"
            print(f"{symbol} [{result.severity.upper()}] {result.location}")
            print(f"   {result.message}\n")

        # Validation 2: Requirements vs Constitution
        print("\n" + "=" * 70)
        print("VALIDATION 2: Requirements vs Constitution")
        print("=" * 70)

        results = validator.validate_requirements_vs_constitution(
            str(temp_path / "functional-requirements.md"),
            str(temp_path / "constitution.md")
        )

        print(f"\nResults: {len(results)} issues found\n")
        for result in results:
            symbol = "🔴" if result.severity == "high" else "🟡" if result.severity == "medium" else "🟢"
            print(f"{symbol} [{result.severity.upper()}] {result.location}")
            print(f"   {result.message}\n")

        # Validation 3: Traceability
        print("\n" + "=" * 70)
        print("VALIDATION 3: Traceability")
        print("=" * 70)

        results = validator.validate_traceability(str(temp_path))

        print(f"\nResults: {len(results)} issues found\n")
        for result in results:
            symbol = "🔴" if result.severity == "high" else "🟡" if result.severity == "medium" else "🟢"
            print(f"{symbol} [{result.severity.upper()}] {result.location}")
            print(f"   {result.message}\n")

        # Validation 4: Completeness (with StructuredSpec)
        print("\n" + "=" * 70)
        print("VALIDATION 4: Spec Completeness")
        print("=" * 70)

        # Create a mock StructuredSpec
        spec = StructuredSpec(
            title="Mock Spec",
            overview="This is a comprehensive mock specification for testing validation.",
            user_stories=[
                UserStory(
                    id="US-001",
                    title="User Authentication",
                    as_a="registered user",
                    i_want_to="log in securely",
                    so_that="my data is protected",
                    acceptance_criteria=[
                        "User can log in with valid credentials",
                        "User cannot log in with invalid credentials"
                    ],
                    priority="High",
                    complexity="Medium"
                ),
                UserStory(
                    id="US-002",
                    title="Profile Management",
                    as_a="user",
                    i_want_to="manage my profile",
                    so_that="information is current",
                    acceptance_criteria=[],  # Missing acceptance criteria
                    priority="Medium",
                    complexity="Low"
                )
            ],
            functional_requirements=[
                FunctionalRequirement(
                    id="FR-001",
                    title="Secure Login",
                    description="System provides secure login",
                    priority="High"
                )
            ],
            assumptions=[],  # Missing assumptions
            success_criteria=[]  # Missing success criteria
        )

        results = validator.validate_completeness(spec)

        print(f"\nResults: {len(results)} issues found\n")
        for result in results:
            symbol = "🔴" if result.severity == "high" else "🟡" if result.severity == "medium" else "🟢"
            print(f"{symbol} [{result.severity.upper()}] {result.location}")
            print(f"   {result.message}\n")

        # Generate comprehensive report
        print("\n" + "=" * 70)
        print("COMPREHENSIVE VALIDATION REPORT")
        print("=" * 70)

        report = validator.generate_validation_report()
        print(report)

        # Save report
        report_path = temp_path / "validation-report.md"
        validator.save_report(str(report_path))
        print(f"\n✓ Report saved to: {report_path}")

        # Show report content
        print("\n" + "=" * 70)
        print("REPORT CONTENT")
        print("=" * 70)
        print(report_path.read_text())


if __name__ == "__main__":
    run_comprehensive_validation()
