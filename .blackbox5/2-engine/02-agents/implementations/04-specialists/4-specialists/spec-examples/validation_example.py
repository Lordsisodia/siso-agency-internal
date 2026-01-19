#!/usr/bin/env python3
"""
Spec Validation Example
Demonstrates cross-artifact validation
"""

import sys
import os
import tempfile
import shutil
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/lib/spec-creation'))

from spec_types import StructuredSpec, UserStory
from validation import SpecValidator

print("=" * 60)
print("Spec Validation Example")
print("=" * 60)
print()

# Create temporary directory
temp_dir = tempfile.mkdtemp(prefix='validation_example_')
print(f"Working in: {temp_dir}\n")

# Create sample spec files
spec_dir = Path(temp_dir) / "my-project"
spec_dir.mkdir()

# Create PRD
prd_content = """# Product Requirements Document

## User Stories

### US-001: User Login
**As a** user
**I want** to log into the system
**So that** I can access my account

### US-002: User Profile
**As a** user
**I want** to manage my profile
**So that** I can keep my information up to date

## Functional Requirements

### FR-001: Authentication
Users can log in with email/password or OAuth

### FR-002: Profile Management
Users can update their profile information
"""

prd_file = spec_dir / "prd.md"
with open(prd_file, 'w') as f:
    f.write(prd_content)

# Create user stories file
stories_content = """# User Stories

## US-001: User Login
- As a user
- I want to log in
- So that I can access my account

## US-002: User Profile
- As a user
- I want to manage my profile
- So that I can keep my info up to date

## US-003: User Dashboard
- As a user
- I want to view my dashboard
- So that I can see my activity
"""

stories_file = spec_dir / "user-stories.md"
with open(stories_file, 'w') as f:
    f.write(stories_content)

# Create constitution file
constitution_content = """# Project Constitution

## Vision
Build the best user management system

## Technology Stack
| Component | Technology |
|-----------|-----------|
| Frontend | React |
| Backend | Python |
| Database | PostgreSQL |

## Quality Standards
- All code tested
- 99.9% uptime
"""

const_file = spec_dir / "constitution.md"
with open(const_file, 'w') as f:
    f.write(constitution_content)

# Run validations
validator = SpecValidator()

print("Running cross-artifact validations...\n")

# Validation 1: PRD vs User Stories
print("1. Validating PRD vs User Stories...")
results1 = validator.validate_prd_vs_user_stories(str(prd_file), str(stories_file))
for result in results1:
    icon = "✅" if result.is_valid else "❌"
    print(f"   {icon} {result.message}")

# Validation 2: Requirements vs Constitution
print("\n2. Validating Requirements vs Constitution...")
results2 = validator.validate_requirements_vs_constitution("requirements.md", str(const_file))
if results2:
    for result in results2:
        icon = "✅" if result.is_valid else "⚠️ "
        print(f"   {icon} {result.message}")
else:
    print("   ✅ No constitution found (optional)")

# Validation 3: Traceability
print("\n3. Validating Traceability...")
results3 = validator.validate_traceability(str(spec_dir))
for result in results3:
    icon = "✅" if result.is_valid else "❌"
    print(f"   {icon} {result.message}")

# Overall report
validator.results = results1 + results2 + results3
print(f"\n{'=' * 60}")
print("Overall Validation Report")
print("=" * 60)

if not validator.results:
    print("✅ All validations passed!")
else:
    high = len([r for r in validator.results if r.severity == 'high'])
    medium = len([r for r in validator.results if r.severity == 'medium'])
    low = len([r for r in validator.results if r.severity == 'low'])

    print(f"\nHigh severity: {high}")
    print(f"Medium severity: {medium}")
    print(f"Low severity: {low}")
    print(f"\nTotal: {len(validator.results)} issues")

# Save validation report
report_file = spec_dir / "validation-report.md"
validator.save_report(str(report_file))
print(f"\n✅ Validation report saved: {report_file}")

# Cleanup
shutil.rmtree(temp_dir)
print(f"\n✅ Cleaned up temporary directory")
