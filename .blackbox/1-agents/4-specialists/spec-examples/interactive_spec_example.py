#!/usr/bin/env python3
"""
Interactive Spec Creation Example
Demonstrates how to create a specification interactively
"""

import sys
import os
import tempfile
import json
from pathlib import Path

# Add lib to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/lib/spec-creation'))

from spec_types import StructuredSpec, UserStory, FunctionalRequirement, ProjectConstitution

print("=" * 60)
print("Interactive Spec Creation Example")
print("=" * 60)
print()

# Create a temporary directory for this example
temp_dir = tempfile.mkdtemp(prefix='spec_example_')
print(f"Working in: {temp_dir}\n")

# Create spec
spec = StructuredSpec(project_name="E-Commerce Platform")

# Add overview
spec.overview = """
# E-Commerce Platform Overview

This project aims to build a modern e-commerce platform that enables
businesses to sell products online with a focus on user experience and
performance.

Key features include:
- Product catalog management
- Shopping cart and checkout
- Payment processing
- Order management
- User accounts and authentication
- Admin dashboard

The platform will support both B2C and B2B sales models.
""".strip()

# Add user stories
spec.user_stories = [
    UserStory(
        id="US-001",
        as_a="shopper",
        i_want="to browse and search for products",
        so_that="I can find items I want to purchase",
        acceptance_criteria=[
            "Can search by product name, category, or filters",
            "Can view product details and images",
            "Can save products to wishlist"
        ],
        priority="high"
    ),
    UserStory(
        id="US-002",
        as_a="shopper",
        i_want="to add items to my cart",
        so_that="I can purchase multiple items at once",
        acceptance_criteria=[
            "Can add items to cart with desired quantity",
            "Can update quantity or remove items",
            "Cart persists across sessions"
        ],
        priority="high"
    ),
    UserStory(
        id="US-003",
        as_a="shopper",
        i_want="to checkout and pay securely",
        so_that="I can complete my purchase",
        acceptance_criteria=[
            "Can enter shipping and billing information",
            "Can choose from multiple payment methods",
            "Receive order confirmation"
        ],
        priority="high"
    ),
    UserStory(
        id="US-004",
        as_a="store admin",
        i_want="to manage products in the catalog",
        so_that="I can display products for sale",
        acceptance_criteria=[
            "Can add/edit/delete products",
            "Can manage product categories",
            "Can set prices and inventory"
        ],
        priority="medium"
    )
]

# Add functional requirements
spec.functional_requirements = [
    FunctionalRequirement(
        id="FR-001",
        title="Product Search",
        description="Users must be able to search for products by name, category, price range, and other attributes",
        priority="high",
        acceptance_criteria=[
            "Search returns relevant results within 2 seconds",
            "Can filter by multiple criteria simultaneously",
            "Search handles partial matches and typos"
        ]
    ),
    FunctionalRequirement(
        id="FR-002",
        title="Shopping Cart",
        description="Users can add products to cart, update quantities, and remove items",
        priority="high",
        dependencies=[],
        acceptance_criteria=[
            "Cart shows item images and prices",
            "Cart calculates totals correctly",
            "Cart persists for 30 days"
        ]
    ),
    FunctionalRequirement(
        id="FR-003",
        title="Payment Processing",
        description="System must process payments securely using multiple payment methods",
        priority="high",
        dependencies=["FR-002"],
        acceptance_criteria=[
            "Supports credit cards, PayPal, and Apple Pay",
            "Payment information is encrypted",
            "Payment confirmation is generated"
        ]
    )
]

# Add constitution
spec.constitution = ProjectConstitution(
    vision="To be the most user-friendly e-commerce platform for small to medium businesses",
    tech_stack={
        "Frontend": "React with TypeScript",
        "Backend": "Python with FastAPI",
        "Database": "PostgreSQL",
        "Hosting": "AWS",
        "Payment": "Stripe"
    },
    quality_standards=[
        "All API responses < 200ms (p95)",
        "90/90 Page Speed score",
        "WCAG 2.1 AA accessibility compliance",
        "99.9% uptime SLA"
    ],
    architectural_principles=[
        "API-first design for future integrations",
        "Event-driven architecture for order processing",
        "CQRS pattern for read/write separation"
    ],
    constraints=[
        "Initial launch within 6 months",
        "Budget under $100k for infrastructure",
        "Team of 5 developers"
    ]
)

# Add assumptions
spec.assumptions = [
    "Users have modern web browsers (Chrome, Firefox, Safari, Edge)",
    "Payment gateway APIs remain stable",
    "Products have digital images available",
    "Average order value is $50-200"
]

# Add success criteria
spec.success_criteria = [
    "Launch with at least 10 stores",
    "Process 1000 orders in first month",
    "Achieve 2% conversion rate",
    "Maintain sub-2-second average page load time"
]

print("✅ Spec created successfully!\n")

# Display PRD
print("=" * 60)
print("Generated PRD Preview")
print("=" * 60)
print()
prd_content = spec.to_prd()
print(prd_content[:1000] + "..." if len(prd_content) > 1000 else prd_content)

# Save spec
spec_file = os.path.join(temp_dir, "ecommerce-spec.json")
prd_file = spec.save(spec_file)

print(f"\n✅ Files saved:")
print(f"   PRD: {prd_file}")
print(f"   JSON: {spec_file}")

# Generate questioning report
print("\n" + "=" * 60)
print("Questioning Report")
print("=" * 60)
print()

from questioning import QuestioningEngine
engine = QuestioningEngine()
report = engine.generate_questioning_report(spec)

print(report[:800] + "..." if len(report) > 800 else report)

# Validate spec
print("\n" + "=" * 60)
print("Validation Results")
print("=" * 60)
print()

from validation import SpecValidator
validator = SpecValidator()
validation_results = validator.validate_completeness(spec)

if validation_results:
    print(f"Found {len(validation_results)} issues:\n")
    for result in validation_results:
        icon = "🔴" if result.severity == "high" else "🟡" if result.severity == "medium" else "🟢"
        print(f"{icon} [{result.location}] {result.message}")
else:
    print("✅ No issues found!")

# Cleanup
import shutil
shutil.rmtree(temp_dir)
print(f"\n✅ Cleaned up temporary directory")
