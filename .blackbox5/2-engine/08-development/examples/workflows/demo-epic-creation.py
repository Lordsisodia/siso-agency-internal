#!/usr/bin/env python3
"""
Epic-Agent Demonstration Script

Demonstrates the PRD → Epic transformation system.
"""

from pathlib import Path
import sys

# Add blackbox5 to path
sys.path.insert(0, str(Path(__file__).parent))

from engine.spec_driven import EpicAgent

def main():
    """Run the epic creation demonstration."""
    print("=" * 80)
    print("EPIC-AGENT DEMONSTRATION: PRD → Epic Transformation")
    print("=" * 80)
    print()

    # Initialize agent
    specs_root = Path.cwd() / "specs"
    agent = EpicAgent(specs_root=specs_root)

    # Check if PRD exists
    prd_id = "PRD-001-authentication"
    prd_path = specs_root / "prds" / f"{prd_id}.md"

    if not prd_path.exists():
        print(f"❌ PRD not found: {prd_path}")
        print(f"   Please ensure the PRD file exists.")
        return 1

    print(f"📋 Loading PRD: {prd_id}")
    print()

    # Load PRD
    try:
        prd = agent.prd_agent.load_prd(prd_id)
        print(f"✅ PRD loaded successfully")
        print(f"   Title: {prd.title}")
        print(f"   Status: {prd.status}")
        print(f"   Functional Requirements: {len(prd.functional_requirements)}")
        print(f"   User Stories: {len(prd.user_stories)}")
        print(f"   Risks: {len(prd.risks)}")
        print()
    except Exception as e:
        print(f"❌ Error loading PRD: {e}")
        return 1

    # Create Epic
    print(f"🔨 Creating Epic from PRD...")
    print()

    try:
        epic = agent.create_epic(prd_id)

        print(f"✅ Epic created successfully!")
        print(f"   ID: {epic.epic_id}")
        print(f"   Title: {epic.title}")
        print(f"   Status: {epic.status}")
        print(f"   From PRD: {epic.prd_id}")
        print()
        print(f"   📦 Components: {len(epic.components)}")
        print(f"   📊 Phases: {len(epic.phases)}")
        print(f"   🔧 Technical Decisions: {len(epic.technical_decisions)}")
        print()

        # Show components
        if epic.components:
            print(f"   Components:")
            for i, comp in enumerate(epic.components[:3], 1):
                print(f"     {i}. {comp.name}")
                print(f"        → {comp.purpose}")
                print(f"        → {comp.file_location}")
            if len(epic.components) > 3:
                print(f"     ... and {len(epic.components) - 3} more")
            print()

        # Show phases
        if epic.phases:
            print(f"   Implementation Phases:")
            for phase in epic.phases:
                print(f"     • {phase.name}")
                print(f"       Components: {len(phase.components)}")
                print(f"       Deliverables: {len(phase.deliverables)}")
            print()

        # Show technical decisions
        if epic.technical_decisions:
            print(f"   Technical Decisions:")
            for decision in epic.technical_decisions:
                print(f"     • {decision.title}")
                print(f"       Chosen: {decision.chosen}")
                print(f"       Rationale: {decision.rationale[:80]}...")
            print()

        # Show epic file location
        epic_file = specs_root / "epics" / f"{epic.epic_id}.md"
        print(f"📄 Epic file created:")
        print(f"   {epic_file}")
        print()

        # Validate epic
        print(f"🔍 Validating Epic...")
        validation = agent.validate_epic(epic.epic_id)

        if validation["valid"]:
            print(f"✅ Epic is VALID!")
        else:
            print(f"⚠️  Epic has issues:")
            for error in validation["errors"][:3]:
                print(f"   ❌ {error}")
            for warning in validation["warnings"][:3]:
                print(f"   ⚠️  {warning}")

        print()
        print(f"   Completion: {validation['completion_percent']:.0f}%")
        print()

        print("=" * 80)
        print("DEMONSTRATION COMPLETE")
        print("=" * 80)
        print()
        print("Next steps:")
        print(f"  1. Review the generated Epic: {epic_file}")
        print(f"  2. Edit as needed to add more details")
        print(f"  3. Validate again: python3 -m engine.cli.epic_commands validate {epic.epic_id}")
        print(f"  4. Start implementation based on component specifications")
        print()

        return 0

    except Exception as e:
        print(f"❌ Error creating Epic: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
