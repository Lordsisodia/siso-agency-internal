#!/usr/bin/env python3
"""
Ralph Runtime Example Usage

This script demonstrates how to use the Ralph Runtime autonomous
execution engine in Blackbox4 Phase 4.
"""

import sys
import os

# Add the lib directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from lib.ralph_runtime import RalphRuntime


def main():
    """Main example function"""

    print("=" * 60)
    print("Ralph Runtime - Autonomous Execution Engine")
    print("Blackbox4 Phase 4 Example")
    print("=" * 60)
    print()

    # Initialize the runtime
    print("1. Initializing Ralph Runtime...")
    runtime = RalphRuntime(
        max_retries=3,
        confidence_threshold=0.7,
        human_intervention="on_error"
    )

    # Set context variables (Phase 1 integration)
    print("2. Setting context variables...")
    runtime.set_context_variable("project_root", "/path/to/project")
    runtime.set_context_variable("environment", "development")
    runtime.set_context_variable("debug_mode", True)

    print(f"   Context variables: {runtime.get_all_context_variables()}")
    print()

    # Define a sample task
    sample_task = {
        "id": "task_001",
        "description": "Execute sample autonomous task",
        "type": "default",
        "complexity": "medium",
        "dependencies": []
    }

    # Demonstrate decision making
    print("3. Making autonomous decision...")
    context = runtime.get_all_context_variables()
    decision = runtime.make_decision(sample_task, context)

    print(f"   Action: {decision.action}")
    print(f"   Confidence: {decision.confidence:.2f}")
    print(f"   Rationale: {decision.rationale}")
    print(f"   Risk Assessment: {decision.risk_assessment}")
    print()

    # Demonstrate progress tracking
    print("4. Tracking progress...")
    session_id = runtime.progress_tracker.start_session(
        plan_name="example_plan",
        autonomous_mode=True
    )

    print(f"   Session ID: {session_id}")

    # Add milestone
    milestone = runtime.progress_tracker.add_milestone(
        session_id=session_id,
        name="example_milestone",
        description="Example milestone for demonstration"
    )
    print(f"   Milestone: {milestone.name} ({milestone.id})")

    # Update progress
    runtime.progress_tracker.update_progress(
        session_id=session_id,
        task_id="task_001",
        status="completed",
        result={"output": "Task completed successfully"}
    )

    # Complete milestone
    runtime.progress_tracker.complete_milestone(session_id, milestone.id)

    # Get status
    status = runtime.progress_tracker.get_status(session_id)
    print(f"   Status: {status.status.value}")
    print(f"   Tasks completed: {status.tasks_completed}/{status.tasks_total}")
    print()

    # Generate report
    print("5. Generating progress report...")
    report = runtime.progress_tracker.generate_report(session_id)

    print(f"   Duration: {report['duration']:.2f} seconds")
    print(f"   Task completion rate: {report['task_summary']['completion_rate']:.1f}%")
    print(f"   Milestones completed: {report['milestone_summary']['completed']}/{report['milestone_summary']['total']}")
    print()

    # Demonstrate error recovery
    print("6. Demonstrating error recovery...")
    try:
        # Simulate an error
        error_info = runtime.error_recovery.detect_error(
            "Permission denied: Cannot access file"
        )

        print(f"   Error type: {error_info.error_type.value}")
        print(f"   Severity: {error_info.severity.value}")

        # Classify the error
        classification = runtime.error_recovery.classify_error(error_info)

        print(f"   Is recoverable: {classification.is_recoverable}")
        print(f"   Suggested strategy: {classification.suggested_strategy.value}")
        print(f"   Confidence: {classification.confidence:.2f}")

        # Attempt recovery
        recovery = runtime.error_recovery.attempt_recovery(
            classification,
            retry_count=0,
            max_retries=3
        )

        print(f"   Recovery action: {recovery.strategy.value}")
        print(f"   Description: {recovery.description}")

    except Exception as e:
        print(f"   Error in recovery demo: {e}")

    print()

    # Demonstrate autonomous agent
    print("7. Demonstrating autonomous agent...")
    agent = runtime.agent

    # Plan next steps
    steps = agent.plan_next_steps(sample_task, context)
    print(f"   Planned {len(steps)} steps:")
    for i, step in enumerate(steps, 1):
        print(f"     {i}. {step.action}: {step.description} (confidence: {step.confidence:.2f})")

    # Evaluate completion
    completion = agent.evaluate_completion(sample_task, context)
    print(f"\n   Completion confidence: {completion.score:.2f}")
    print(f"   Rationale: {completion.rationale}")
    print()

    # Save and load state
    print("8. Saving and loading state...")
    state_file = "/tmp/ralph_runtime_example_state.json"

    runtime.save_state(state_file)
    print(f"   State saved to: {state_file}")

    # Create new runtime and load state
    new_runtime = RalphRuntime()
    new_runtime.load_state(state_file)
    print(f"   State loaded successfully")
    print(f"   Loaded state: {new_runtime.state.value}")
    print()

    # Final summary
    print("=" * 60)
    print("Example completed successfully!")
    print("=" * 60)
    print()
    print("Key Features Demonstrated:")
    print("  - Runtime initialization and configuration")
    print("  - Context variable management (Phase 1)")
    print("  - Autonomous decision making")
    print("  - Progress tracking with milestones")
    print("  - Error detection and recovery")
    print("  - Autonomous agent planning")
    print("  - State persistence")
    print()
    print("For more information, see:")
    print("  .blackbox4/4-scripts/lib/ralph-runtime/README.md")
    print()


if __name__ == "__main__":
    main()
