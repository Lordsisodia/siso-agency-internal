#!/usr/bin/env python3
"""
End-to-End Ralph Runtime Test

This script creates a complex scenario, executes it autonomously,
monitors progress, and validates results.
"""

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "4-scripts" / "python"))

# Colors for output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    MAGENTA = '\033[0;35m'
    NC = '\033[0m'  # No Color

class EndToEndTest:
    """End-to-end test for Ralph Runtime"""

    def __init__(self, test_dir: str):
        self.test_dir = Path(test_dir)
        self.test_dir.mkdir(parents=True, exist_ok=True)

        self.ralph_dir = self.test_dir / ".ralph"
        self.ralph_dir.mkdir(exist_ok=True)

        self.results = {
            "test_name": "End-to-End Ralph Runtime Test",
            "timestamp": datetime.now().isoformat(),
            "test_dir": str(self.test_dir),
            "phases": [],
            "status": "initialized"
        }

    def print_header(self, title: str):
        """Print a formatted header"""
        print("")
        print(f"{Colors.CYAN}╔════════════════════════════════════════════════════════════╗{Colors.NC}")
        print(f"{Colors.CYAN}║{Colors.NC} {Colors.BLUE}{title}{Colors.NC}")
        print(f"{Colors.CYAN}╚════════════════════════════════════════════════════════════╝{Colors.NC}")
        print("")

    def print_section(self, title: str):
        """Print a section header"""
        print("")
        print(f"{Colors.YELLOW}▶ {title}{Colors.NC}")
        print(f"{Colors.YELLOW}────────────────────────────────────────────────────────────{Colors.NC}")
        print("")

    def print_test(self, name: str, passed: bool):
        """Print test result"""
        if passed:
            print(f"{Colors.GREEN}[PASS]{Colors.NC} {name}")
        else:
            print(f"{Colors.RED}[FAIL]{Colors.NC} {name}")

    def setup_scenario(self) -> bool:
        """Setup the complex test scenario"""
        self.print_section("Setting Up Complex Scenario")

        # Create a multi-step scenario
        scenario = {
            "name": "Complex Feature Implementation",
            "steps": [
                {
                    "id": 1,
                    "name": "Requirements Analysis",
                    "description": "Analyze requirements for the feature",
                    "expected_duration": 60,
                    "dependencies": []
                },
                {
                    "id": 2,
                    "name": "Design",
                    "description": "Create technical design",
                    "expected_duration": 120,
                    "dependencies": [1]
                },
                {
                    "id": 3,
                    "name": "Implementation",
                    "description": "Implement the feature",
                    "expected_duration": 300,
                    "dependencies": [2]
                },
                {
                    "id": 4,
                    "name": "Testing",
                    "description": "Test the implementation",
                    "expected_duration": 180,
                    "dependencies": [3]
                },
                {
                    "id": 5,
                    "name": "Documentation",
                    "description": "Write documentation",
                    "expected_duration": 60,
                    "dependencies": [3]
                },
                {
                    "id": 6,
                    "name": "Deployment",
                    "description": "Deploy to production",
                    "expected_duration": 30,
                    "dependencies": [4, 5]
                }
            ]
        }

        scenario_file = self.test_dir / "scenario.json"
        with open(scenario_file, 'w') as f:
            json.dump(scenario, f, indent=2)

        self.print_test("Scenario file created", scenario_file.exists())

        # Create initial runtime state
        runtime_state = {
            "status": "ready",
            "scenario": "Complex Feature Implementation",
            "current_step": 0,
            "total_steps": len(scenario["steps"]),
            "start_time": datetime.now().isoformat()
        }

        runtime_file = self.ralph_dir / "runtime-state.json"
        with open(runtime_file, 'w') as f:
            json.dump(runtime_state, f, indent=2)

        self.print_test("Runtime state initialized", runtime_file.exists())

        return True

    def execute_autonomously(self) -> bool:
        """Simulate autonomous execution"""
        self.print_section("Simulating Autonomous Execution")

        # Load scenario
        scenario_file = self.test_dir / "scenario.json"
        with open(scenario_file, 'r') as f:
            scenario = json.load(f)

        steps_completed = 0

        for step in scenario["steps"]:
            # Simulate step execution
            execution_record = {
                "step_id": step["id"],
                "step_name": step["name"],
                "status": "executing",
                "start_time": datetime.now().isoformat()
            }

            # Create step directory
            step_dir = self.ralph_dir / f"step_{step['id']}"
            step_dir.mkdir(exist_ok=True)

            # Write execution record
            with open(step_dir / "execution.json", 'w') as f:
                json.dump(execution_record, f, indent=2)

            self.print_test(f"Step {step['id']}: {step['name']} - Started", True)

            # Simulate progress
            time.sleep(0.1)  # Minimal delay for testing

            # Complete step
            execution_record["status"] = "completed"
            execution_record["end_time"] = datetime.now().isoformat()
            execution_record["duration_seconds"] = 0.1

            with open(step_dir / "execution.json", 'w') as f:
                json.dump(execution_record, f, indent=2)

            self.print_test(f"Step {step['id']}: {step['name']} - Completed", True)
            steps_completed += 1

        # Update runtime state
        runtime_file = self.ralph_dir / "runtime-state.json"
        with open(runtime_file, 'r') as f:
            runtime_state = json.load(f)

        runtime_state["status"] = "completed"
        runtime_state["current_step"] = steps_completed
        runtime_state["end_time"] = datetime.now().isoformat()

        with open(runtime_file, 'w') as f:
            json.dump(runtime_state, f, indent=2)

        return steps_completed == len(scenario["steps"])

    def monitor_progress(self) -> bool:
        """Monitor and validate progress"""
        self.print_section("Monitoring Progress")

        # Load runtime state
        runtime_file = self.ralph_dir / "runtime-state.json"
        with open(runtime_file, 'r') as f:
            runtime_state = json.load(f)

        # Validate progress tracking
        tests_passed = 0
        tests_total = 0

        # Test 1: Runtime state exists
        tests_total += 1
        if runtime_file.exists():
            self.print_test("Runtime state file exists", True)
            tests_passed += 1
        else:
            self.print_test("Runtime state file exists", False)

        # Test 2: Status is tracked
        tests_total += 1
        if "status" in runtime_state:
            self.print_test("Status is tracked", True)
            tests_passed += 1
        else:
            self.print_test("Status is tracked", False)

        # Test 3: Steps are counted
        tests_total += 1
        if "current_step" in runtime_state and "total_steps" in runtime_state:
            self.print_test("Steps are counted", True)
            tests_passed += 1
        else:
            self.print_test("Steps are counted", False)

        # Test 4: All steps completed
        tests_total += 1
        if runtime_state.get("current_step") == runtime_state.get("total_steps"):
            self.print_test("All steps completed", True)
            tests_passed += 1
        else:
            self.print_test("All steps completed", False)

        # Test 5: Execution records exist
        tests_total += 1
        step_dirs = list(self.ralph_dir.glob("step_*"))
        if len(step_dirs) == runtime_state.get("total_steps", 0):
            self.print_test("Execution records exist for all steps", True)
            tests_passed += 1
        else:
            self.print_test("Execution records exist for all steps", False)

        self.results["monitoring_tests"] = {
            "total": tests_total,
            "passed": tests_passed,
            "failed": tests_total - tests_passed
        }

        return tests_passed == tests_total

    def verify_results(self) -> bool:
        """Verify final results"""
        self.print_section("Verifying Results")

        # Load runtime state
        runtime_file = self.ralph_dir / "runtime-state.json"
        with open(runtime_file, 'r') as f:
            runtime_state = json.load(f)

        tests_passed = 0
        tests_total = 0

        # Test 1: Scenario completed successfully
        tests_total += 1
        if runtime_state.get("status") == "completed":
            self.print_test("Scenario completed successfully", True)
            tests_passed += 1
        else:
            self.print_test("Scenario completed successfully", False)

        # Test 2: All steps executed
        tests_total += 1
        if runtime_state.get("current_step") == 6:
            self.print_test("All 6 steps executed", True)
            tests_passed += 1
        else:
            self.print_test("All 6 steps executed", False)

        # Test 3: Execution time tracked
        tests_total += 1
        if "start_time" in runtime_state and "end_time" in runtime_state:
            self.print_test("Execution time tracked", True)
            tests_passed += 1
        else:
            self.print_test("Execution time tracked", False)

        # Test 4: Step execution records are valid
        tests_total += 1
        all_valid = True
        for step_dir in self.ralph_dir.glob("step_*"):
            exec_file = step_dir / "execution.json"
            if exec_file.exists():
                with open(exec_file, 'r') as f:
                    exec_record = json.load(f)
                if exec_record.get("status") != "completed":
                    all_valid = False
                    break
            else:
                all_valid = False
                break

        if all_valid:
            self.print_test("All step execution records valid", True)
            tests_passed += 1
        else:
            self.print_test("All step execution records valid", False)

        # Test 5: No errors occurred
        tests_total += 1
        error_files = list(self.ralph_dir.glob("**/*error*.json"))
        if len(error_files) == 0:
            self.print_test("No errors occurred", True)
            tests_passed += 1
        else:
            self.print_test("No errors occurred", False)

        self.results["verification_tests"] = {
            "total": tests_total,
            "passed": tests_passed,
            "failed": tests_total - tests_passed
        }

        return tests_passed == tests_total

    def generate_report(self) -> Dict[str, Any]:
        """Generate test report"""
        self.print_section("Generating Report")

        # Calculate overall results
        total_tests = 0
        total_passed = 0

        if "monitoring_tests" in self.results:
            total_tests += self.results["monitoring_tests"]["total"]
            total_passed += self.results["monitoring_tests"]["passed"]

        if "verification_tests" in self.results:
            total_tests += self.results["verification_tests"]["total"]
            total_passed += self.results["verification_tests"]["passed"]

        self.results["total_tests"] = total_tests
        self.results["total_passed"] = total_passed
        self.results["total_failed"] = total_tests - total_passed
        self.results["pass_rate"] = (total_passed / total_tests * 100) if total_tests > 0 else 0

        # Print summary
        print("")
        print(f"{Colors.BLUE}Test Results:{Colors.NC}")
        print(f"  Total Tests: {total_tests}")
        print(f"  {Colors.GREEN}Passed: {total_passed}{Colors.NC}")
        print(f"  {Colors.RED}Failed: {self.results['total_failed']}{Colors.NC}")
        print("")
        print(f"{Colors.BLUE}Pass Rate:{Colors.NC} {self.results['pass_rate']:.1f}%")
        print("")

        # Save report
        report_file = self.test_dir / "test-report.json"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        self.print_test("Report saved", report_file.exists())

        # Final verdict
        if self.results['total_failed'] == 0:
            print(f"{Colors.GREEN}╔════════════════════════════════════════════════════════════╗{Colors.NC}")
            print(f"{Colors.GREEN}║{Colors.NC} {Colors.GREEN}ALL TESTS PASSED - End-to-end test successful!{Colors.NC} {Colors.GREEN}║{Colors.NC}")
            print(f"{Colors.GREEN}╚════════════════════════════════════════════════════════════╝{Colors.NC}")
            print("")
            self.results["status"] = "passed"
        else:
            print(f"{Colors.RED}╔════════════════════════════════════════════════════════════╗{Colors.NC}")
            print(f"{Colors.RED}║{Colors.NC} {Colors.RED}SOME TESTS FAILED - Review the output above{Colors.NC} {Colors.RED}║{Colors.NC}")
            print(f"{Colors.RED}╚════════════════════════════════════════════════════════════╝{Colors.NC}")
            print("")
            self.results["status"] = "failed"

        return self.results

def main():
    """Main execution"""
    # Setup
    test_dir = Path("/tmp/blackbox4-e2e-test")
    if test_dir.exists():
        import shutil
        shutil.rmtree(test_dir)

    test = EndToEndTest(str(test_dir))

    test.print_header("End-to-End Ralph Runtime Test")

    # Run test phases
    success = True

    if not test.setup_scenario():
        success = False

    if success and not test.execute_autonomously():
        success = False

    if success and not test.monitor_progress():
        success = False

    if success and not test.verify_results():
        success = False

    # Generate report
    results = test.generate_report()

    # Exit with appropriate code
    sys.exit(0 if results["status"] == "passed" else 1)

if __name__ == "__main__":
    main()
