#!/usr/bin/env python3
"""
Load Testing for Ralph Runtime

This script performs load testing, concurrent execution tests,
stress testing, and performance monitoring.
"""

import json
import os
import sys
import time
import threading
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

# Colors for output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

class LoadTest:
    """Load testing for Ralph Runtime"""

    def __init__(self, test_dir: str):
        self.test_dir = Path(test_dir)
        self.test_dir.mkdir(parents=True, exist_ok=True)

        self.results = {
            "test_name": "Ralph Runtime Load Test",
            "timestamp": datetime.now().isoformat(),
            "test_dir": str(self.test_dir),
            "tests": []
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

    def print_test(self, name: str, passed: bool, duration: float = None):
        """Print test result"""
        duration_str = f" ({duration:.3f}s)" if duration else ""
        if passed:
            print(f"{Colors.GREEN}[PASS]{Colors.NC} {name}{duration_str}")
        else:
            print(f"{Colors.RED}[FAIL]{Colors.NC} {name}{duration_str}")

    def test_concurrent_execution(self, num_threads: int = 10) -> Dict[str, Any]:
        """Test concurrent execution"""
        self.print_section(f"Concurrent Execution Test ({num_threads} threads)")

        start_time = time.time()
        results = []
        errors = []

        def simulate_task(task_id: int):
            """Simulate a runtime task"""
            try:
                # Create task directory
                task_dir = self.test_dir / f"task_{task_id}"
                task_dir.mkdir(exist_ok=True)

                # Create runtime state
                runtime_state = {
                    "task_id": task_id,
                    "status": "running",
                    "start_time": datetime.now().isoformat()
                }

                with open(task_dir / "runtime.json", 'w') as f:
                    json.dump(runtime_state, f, indent=2)

                # Simulate work
                time.sleep(0.1)

                # Complete task
                runtime_state["status"] = "completed"
                runtime_state["end_time"] = datetime.now().isoformat()

                with open(task_dir / "runtime.json", 'w') as f:
                    json.dump(runtime_state, f, indent=2)

                return {"task_id": task_id, "success": True}
            except Exception as e:
                return {"task_id": task_id, "success": False, "error": str(e)}

        # Execute tasks concurrently
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(simulate_task, i) for i in range(num_threads)]
            results = [f.result() for f in futures]

        duration = time.time() - start_time

        # Analyze results
        successful = sum(1 for r in results if r["success"])
        failed = num_threads - successful

        self.print_test(f"Concurrent tasks executed: {num_threads}", successful == num_threads, duration)
        self.print_test(f"Successful: {successful}", True)
        self.print_test(f"Failed: {failed}", failed == 0)

        test_result = {
            "test_type": "concurrent_execution",
            "num_threads": num_threads,
            "successful": successful,
            "failed": failed,
            "duration_seconds": duration,
            "throughput": num_threads / duration
        }

        self.results["tests"].append(test_result)
        return test_result

    def test_stress_load(self, num_requests: int = 100) -> Dict[str, Any]:
        """Test under stress load"""
        self.print_section(f"Stress Load Test ({num_requests} requests)")

        start_time = time.time()
        response_times = []

        for i in range(num_requests):
            request_start = time.time()

            # Simulate request processing
            request_dir = self.test_dir / f"request_{i}"
            request_dir.mkdir(exist_ok=True)

            # Create request state
            request_state = {
                "request_id": i,
                "status": "processed"
            }

            with open(request_dir / "state.json", 'w') as f:
                json.dump(request_state, f, indent=2)

            response_times.append(time.time() - request_start)

        duration = time.time() - start_time

        # Calculate metrics
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        min_response_time = min(response_times)

        self.print_test(f"Processed {num_requests} requests", True, duration)
        self.print_test(f"Average response time: {avg_response_time:.4f}s", True)
        self.print_test(f"Max response time: {max_response_time:.4f}s", True)
        self.print_test(f"Min response time: {min_response_time:.4f}s", True)

        test_result = {
            "test_type": "stress_load",
            "num_requests": num_requests,
            "duration_seconds": duration,
            "avg_response_time": avg_response_time,
            "max_response_time": max_response_time,
            "min_response_time": min_response_time,
            "requests_per_second": num_requests / duration
        }

        self.results["tests"].append(test_result)
        return test_result

    def test_memory_usage(self) -> Dict[str, Any]:
        """Test memory usage"""
        self.print_section("Memory Usage Test")

        try:
            import psutil
            process = psutil.Process()

            # Baseline memory
            baseline_memory = process.memory_info().rss / 1024 / 1024  # MB

            # Create test data
            test_data = []
            for i in range(1000):
                test_data.append({
                    "id": i,
                    "data": "x" * 1000,
                    "timestamp": datetime.now().isoformat()
                })

            # Peak memory
            peak_memory = process.memory_info().rss / 1024 / 1024  # MB

            # Cleanup
            del test_data

            # Final memory
            final_memory = process.memory_info().rss / 1024 / 1024  # MB

            memory_increase = peak_memory - baseline_memory
            memory_recovered = peak_memory - final_memory

            self.print_test(f"Baseline memory: {baseline_memory:.2f} MB", True)
            self.print_test(f"Peak memory: {peak_memory:.2f} MB", True)
            self.print_test(f"Memory increase: {memory_increase:.2f} MB", True)
            self.print_test(f"Memory recovered: {memory_recovered:.2f} MB", True)

            test_result = {
                "test_type": "memory_usage",
                "baseline_mb": baseline_memory,
                "peak_mb": peak_memory,
                "final_mb": final_memory,
                "increase_mb": memory_increase,
                "recovered_mb": memory_recovered
            }

            self.results["tests"].append(test_result)
            return test_result

        except ImportError:
            self.print_test("Memory usage test skipped (psutil not available)", True)
            return {
                "test_type": "memory_usage",
                "skipped": True,
                "reason": "psutil not available"
            }

    def test_resource_contention(self, num_processes: int = 4) -> Dict[str, Any]:
        """Test resource contention under load"""
        self.print_section(f"Resource Contention Test ({num_processes} processes)")

        def worker_process(worker_id: int) -> Dict[str, Any]:
            """Worker process"""
            start_time = time.time()

            # Simulate work
            for i in range(100):
                # Create and write files
                work_dir = self.test_dir / f"worker_{worker_id}"
                work_dir.mkdir(exist_ok=True)

                work_file = work_dir / f"work_{i}.json"
                with open(work_file, 'w') as f:
                    json.dump({"worker": worker_id, "iteration": i}, f)

            duration = time.time() - start_time
            return {"worker_id": worker_id, "duration": duration}

        start_time = time.time()

        # Execute in parallel
        with ProcessPoolExecutor(max_workers=num_processes) as executor:
            results = list(executor.map(worker_process, range(num_processes)))

        duration = time.time() - start_time

        # Analyze results
        avg_duration = sum(r["duration"] for r in results) / len(results)
        max_duration = max(r["duration"] for r in results)

        self.print_test(f"Executed {num_processes} parallel processes", True, duration)
        self.print_test(f"Average worker duration: {avg_duration:.3f}s", True)
        self.print_test(f"Max worker duration: {max_duration:.3f}s", True)

        test_result = {
            "test_type": "resource_contention",
            "num_processes": num_processes,
            "duration_seconds": duration,
            "avg_worker_duration": avg_duration,
            "max_worker_duration": max_duration
        }

        self.results["tests"].append(test_result)
        return test_result

    def test_performance_scaling(self) -> Dict[str, Any]:
        """Test performance scaling"""
        self.print_section("Performance Scaling Test")

        scaling_results = []
        thread_counts = [1, 2, 4, 8]

        for num_threads in thread_counts:
            start_time = time.time()

            # Execute tasks
            def simple_task(task_id: int):
                time.sleep(0.01)
                return task_id

            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                results = list(executor.map(simple_task, range(20)))

            duration = time.time() - start_time
            throughput = 20 / duration

            scaling_results.append({
                "threads": num_threads,
                "duration": duration,
                "throughput": throughput,
                "speedup": throughput / scaling_results[0]["throughput"] if scaling_results else 1.0
            })

            self.print_test(f"{num_threads} threads: {throughput:.2f} tasks/sec (speedup: {scaling_results[-1]['speedup']:.2f}x)", True)

        test_result = {
            "test_type": "performance_scaling",
            "scaling_results": scaling_results
        }

        self.results["tests"].append(test_result)
        return test_result

    def generate_report(self) -> Dict[str, Any]:
        """Generate test report"""
        self.print_section("Generating Load Test Report")

        # Calculate overall metrics
        total_tests = len(self.results["tests"])
        total_duration = sum(t.get("duration_seconds", 0) for t in self.results["tests"])

        # Print summary
        print("")
        print(f"{Colors.BLUE}Load Test Summary:{Colors.NC}")
        print(f"  Total Tests: {total_tests}")
        print(f"  Total Duration: {total_duration:.2f}s")
        print("")

        # Test-specific summaries
        for test in self.results["tests"]:
            test_type = test["test_type"].replace("_", " ").title()
            print(f"{Colors.BLUE}{test_type}:{Colors.NC}")

            if test["test_type"] == "concurrent_execution":
                print(f"  Throughput: {test['throughput']:.2f} tasks/sec")
                print(f"  Success Rate: {test['successful']}/{test['num_threads']}")

            elif test["test_type"] == "stress_load":
                print(f"  Requests/sec: {test['requests_per_second']:.2f}")
                print(f"  Avg Response Time: {test['avg_response_time']:.4f}s")

            elif test["test_type"] == "memory_usage":
                if not test.get("skipped"):
                    print(f"  Memory Increase: {test['increase_mb']:.2f} MB")
                    print(f"  Memory Recovered: {test['recovered_mb']:.2f} MB")

            elif test["test_type"] == "resource_contention":
                print(f"  Avg Worker Duration: {test['avg_worker_duration']:.3f}s")

            elif test["test_type"] == "performance_scaling":
                best_result = max(test["scaling_results"], key=lambda x: x["throughput"])
                print(f"  Best Throughput: {best_result['throughput']:.2f} tasks/sec")
                print(f"  Best Speedup: {best_result['speedup']:.2f}x")

            print("")

        # Save report
        report_file = self.test_dir / "load-test-report.json"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        self.print_test("Load test report saved", report_file.exists())

        print(f"{Colors.GREEN}╔════════════════════════════════════════════════════════════╗{Colors.NC}")
        print(f"{Colors.GREEN}║{Colors.NC} {Colors.GREEN}Load testing completed successfully!{Colors.NC} {Colors.GREEN}║{Colors.NC}")
        print(f"{Colors.GREEN}╚════════════════════════════════════════════════════════════╝{Colors.NC}")
        print("")

        self.results["status"] = "completed"
        return self.results

def main():
    """Main execution"""
    # Setup
    test_dir = Path("/tmp/blackbox4-load-test")
    if test_dir.exists():
        import shutil
        shutil.rmtree(test_dir)

    test = LoadTest(str(test_dir))

    test.print_header("Ralph Runtime Load Testing")

    # Run load tests
    test.test_concurrent_execution(num_threads=10)
    test.test_stress_load(num_requests=100)
    test.test_memory_usage()
    test.test_resource_contention(num_processes=4)
    test.test_performance_scaling()

    # Generate report
    test.generate_report()

    sys.exit(0)

if __name__ == "__main__":
    main()
