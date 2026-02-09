#!/usr/bin/env python3
"""
Map task dependencies and relationships to determine execution order.
Creates a dependency graph and identifies which tasks must be done first.
"""

import sys
import os
from pathlib import Path
import json
from datetime import datetime

os.chdir('/Users/shaansisodia/DEV/client-projects/lumelle')

print("🔗 Mapping Task Dependencies and Relationships")
print("=" * 70)
print()

# Load board data
board_file = Path(".blackbox/.plans/kanban/lumelle-refactoring.json")
with open(board_file, 'r') as f:
    board_data = json.load(f)

cards = board_data['cards']

# Define dependencies based on architectural knowledge
# This maps which cards depend on others

dependencies = {
    # Issue #193 (CartContext) dependencies
    # - Must come BEFORE any cart-related features
    # - Blocks: Landing page cart drawer changes

    # Issue #194 (Analytics) dependencies
    # - Must come BEFORE any analytics features
    # - Blocks: Landing page analytics integration

    # Issue #195 (DrawerProvider) dependencies
    # - Depends on: Issue #193 (CartContext refactor should inform drawer structure)
    # - Blocks: Cart drawer UI improvements

    # Issue #196 (TypeScript) dependencies
    # - Should be done EARLY (preferably first or second)
    # - Blocks: All other issues (better types help everything)

    # Issue #197 (localStorage) dependencies
    # - Independent, can be done anytime

    # Issue #198 (Platform Commerce) dependencies
    # - Independent, but affects checkout flow

    # Issue #199 (Debug Cleanup) dependencies
    # - Should be done EARLY (clean slate before other work)

    # Issue #200 (Volume Discount) dependencies
    # - Depends on: Issue #193 (uses CartContext)
    # - Related to cart calculations

    # Landing Page tasks
    # - Independent of refactoring, but can benefit from Issue #193 completion

    # WebhookInbox tasks
    # - Form their own dependency chain
}

# Detailed dependency mapping
task_dependencies = {}

# Phase 1 Issues
task_dependencies['Issue #193: CartContext'] = {
    "depends_on": [],
    "blocks": ["Issue #195: DrawerProvider", "Issue #200: Volume Discount"],
    "priority_rank": 3,  # Do 3rd (after TypeScript and Debug cleanup)
    "reason": "Foundational cart work, should inform drawer structure"
}

task_dependencies['Issue #194: Analytics'] = {
    "depends_on": [],
    "blocks": [],
    "priority_rank": 5,
    "reason": "Independent, can be done anytime"
}

task_dependencies['Issue #195: DrawerProvider'] = {
    "depends_on": ["Issue #193: CartContext"],
    "blocks": [],
    "priority_rank": 6,
    "reason": "Should learn from CartContext refactor first"
}

task_dependencies['Issue #196: TypeScript'] = {
    "depends_on": [],
    "blocks": ["ALL ISSUES"],  # Blocks everything because better types help all work
    "priority_rank": 1,
    "reason": "DO FIRST - Better TypeScript configuration helps all other work"
}

task_dependencies['Issue #197: localStorage'] = {
    "depends_on": [],
    "blocks": [],
    "priority_rank": 8,
    "reason": "Independent quick win"
}

task_dependencies['Issue #198: Platform Commerce'] = {
    "depends_on": [],
    "blocks": [],
    "priority_rank": 7,
    "reason": "Independent runtime fix"
}

task_dependencies['Issue #199: Debug Cleanup'] = {
    "depends_on": [],
    "blocks": ["ALL ISSUES"],  # Blocks everything because clean code is better
    "priority_rank": 2,
    "reason": "DO SECOND - Clean slate before other refactoring"
}

task_dependencies['Issue #200: Volume Discount'] = {
    "depends_on": ["Issue #193: CartContext"],
    "blocks": [],
    "priority_rank": 4,
    "reason": "Depends on CartContext refactor completion"
}

# Landing Page tasks
for i, lp_task in enumerate([
    "LP: Hero - Update imagery",
    "LP: Hero - Refine copy",
    "LP: Customer Stories - Add testimonials",
    "LP: Customer Stories - Update logos",
    "LP: Customer Stories - Refine layout",
    "LP: Customer Stories - Add carousel",
    "LP: Spin Wheel - Implement component",
    "LP: Spin Wheel - Connect backend",
    "LP: Footer - Update links"
]):
    task_dependencies[lp_task] = {
        "depends_on": [],
        "blocks": [],
        "priority_rank": 20 + i,  # Lower priority than Phase 1
        "reason": "Independent UI work, can be done anytime"
    }

# WebhookInbox tasks (sequential dependency chain)
webhook_tasks = [
    ("WH: Verification parity review", 10),
    ("WH: Design richer inbox records", 11),
    ("WH: Implement replay tooling", 12),
    ("WH: Add auditability features", 13),
    ("WH: Testing & validation", 14)
]

for i, (task, rank) in enumerate(webhook_tasks):
    if i == 0:
        task_dependencies[task] = {
            "depends_on": [],
            "blocks": [],
            "priority_rank": rank,
            "reason": "First step in webhook improvements"
        }
    else:
        task_dependencies[task] = {
            "depends_on": [webhook_tasks[i-1][0]],
            "blocks": [],
            "priority_rank": rank,
            "reason": f"Depends on {webhook_tasks[i-1][0]}"
        }

# Update cards with dependencies
print("📝 Updating cards with dependency information...")
print()

updated_cards = []
for card_id, card in cards.items():
    title = card['title']

    if title in task_dependencies:
        deps = task_dependencies[title]

        # Add dependency metadata
        card['metadata'] = card.get('metadata', {})
        card['metadata']['depends_on'] = deps['depends_on']
        card['metadata']['blocks'] = deps['blocks']
        card['metadata']['priority_rank'] = deps['priority_rank']
        card['metadata']['dependency_reason'] = deps['reason']

        updated_cards.append(title)
        print(f"   ✅ {title}")
        print(f"      Depends on: {', '.join(deps['depends_on']) if deps['depends_on'] else 'None'}")
        print(f"      Blocks: {', '.join(deps['blocks']) if deps['blocks'] else 'None'}")
        print(f"      Priority Rank: {deps['priority_rank']}")
        print()

# Save updated board
print("💾 Saving dependency data...")
with open(board_file, 'w') as f:
    json.dump(board_data, f, indent=2)
print("   ✅ Saved")
print()

# Create execution order document
execution_order = sorted(
    [(title, data['priority_rank']) for title, data in task_dependencies.items()],
    key=lambda x: x[1]
)

print("=" * 70)
print("📋 RECOMMENDED EXECUTION ORDER")
print("=" * 70)
print()

for rank, (task_name, priority_rank) in enumerate(execution_order, 1):
    deps = task_dependencies[task_name]
    print(f"{rank:2}. [{priority_rank:2}] {task_name}")
    print(f"     Reason: {deps['reason']}")

    if deps['depends_on']:
        print(f"     ⚠️  Must complete after: {', '.join(deps['depends_on'])}")

    if deps['blocks']:
        print(f"     🚫 Blocks: {', '.join(deps['blocks'])}")

    print()

# Create dependency graph
print("=" * 70)
print("🔗 DEPENDENCY GRAPH")
print("=" * 70)
print()

dependency_graph = """
Critical Path Dependencies:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Foundational (Must do first):
├── Issue #199: Debug Cleanup (2-3 hours) ─────────┐
└── Issue #196: TypeScript Config (2-3 days) ────────┤
                                                          │
                                                          ▼
Core Refactoring (Foundational cart work):
├── Issue #193: CartContext Refactoring (8-12 days) ──┤
│   │                                                 │
│   ├─→ Blocks: Issue #195 (DrawerProvider)         │
│   └─→ Blocks: Issue #200 (Volume Discount)         │
│                                                     │
│                                                     ▼
Independent Critical Issues:
├── Issue #194: Analytics Domain Migration (7-12 days)
├── Issue #197: localStorage Keys (4-6 hours)
└── Issue #198: Platform Commerce Runtime (4-6 hours)

Secondary (Depend on core):
├── Issue #195: DrawerProvider Split (requires #193)
└── Issue #200: Volume Discount Duplication (requires #193)

Separate Work Streams:
├── Landing Page UI Tasks (9 tasks, independent)
└── WebhookInbox Tasks (5 tasks, sequential chain)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

print(dependency_graph)

# Create sprint recommendations
print("=" * 70)
print("🎯 SPRINT 1 RECOMMENDATION")
print("=" * 70)
print()

sprint1_tasks = [
    {
        "order": 1,
        "task": "Issue #199: Debug Cleanup",
        "estimate": "2-3 hours",
        "reason": "Quick win, clean slate"
    },
    {
        "order": 2,
        "task": "Issue #196: TypeScript Config",
        "estimate": "2-3 days",
        "reason": "Better types help all work"
    },
    {
        "order": 3,
        "task": "Issue #193: CartContext Refactoring",
        "estimate": "8-12 days",
        "reason": "Core cart work, highest impact"
    }
]

print("Commit these 3 tasks to Sprint 1:")
print()
for task in sprint1_tasks:
    print(f"   {task['order']}. {task['task']}")
    print(f"      Estimate: {task['estimate']}")
    print(f"      Reason: {task['reason']}")
    print()

print("Total Sprint 1 Estimate: 11-17 days")
print("Target Velocity: Complete 2-3 critical issues")
print()

# Save dependency map to file
dep_map_file = Path(".blackbox/.plans/task-dependencies.json")
dependency_data = {
    "generated_at": datetime.now().isoformat(),
    "total_tasks": len(task_dependencies),
    "execution_order": execution_order,
    "dependencies": task_dependencies
}

with open(dep_map_file, 'w') as f:
    json.dump(dependency_data, f, indent=2)

print(f"💾 Dependency map saved: {dep_map_file}")
print()

print("=" * 70)
print("✅ DEPENDENCY MAPPING COMPLETE!")
print("=" * 70)
print()
print("📖 Next Steps:")
print()
print("1. Commit Sprint 1 tasks:")
print("   python3 .blackbox/.plans/commit-sprint.py")
print()
print("2. Create Sprint Goal document:")
print("   python3 .blackbox/.plans/create-sprint-goal.py")
print()
print("3. Start Issue #199 (Debug Cleanup) - quick win:")
print("   → Can be done in 2-3 hours")
print("   → No dependencies")
print("   → Clean slate for other work")
