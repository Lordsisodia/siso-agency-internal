#!/usr/bin/env python3
"""
Validation utilities for the Testing Agent.

Provides common validation functions that can be used across
different types of AI-generated output.
"""

import os
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass
from enum import Enum


class ValidationStatus(Enum):
    """Validation result status."""
    PASS = "pass"
    FAIL = "fail"
    PARTIAL = "partial"
    SKIP = "skip"


@dataclass
class ValidationResult:
    """Result of a validation check."""
    name: str
    status: ValidationStatus
    message: str
    location: str = ""
    severity: str = "medium"  # critical, high, medium, low
    recommendation: str = ""


class ProjectType(Enum):
    """Supported project types."""
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    PYTHON = "python"
    GO = "go"
    RUST = "rust"
    UNKNOWN = "unknown"


class TestingValidator:
    """Main validator class for AI-generated output."""

    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path).resolve()
        self.project_type = self._detect_project_type()
        self.results: List[ValidationResult] = []

    def _detect_project_type(self) -> ProjectType:
        """Detect project type from files and configuration."""
        checks = [
            (ProjectType.PYTHON, ["requirements.txt", "pyproject.toml", "setup.py", "*.py"]),
            (ProjectType.JAVASCRIPT, ["package.json", "*.js"]),
            (ProjectType.TYPESCRIPT, ["package.json", "tsconfig.json", "*.ts"]),
            (ProjectType.GO, ["go.mod", "*.go"]),
            (ProjectType.RUST, ["Cargo.toml", "*.rs"]),
        ]

        for project_type, indicators in checks:
            for indicator in indicators:
                if "*" in indicator:
                    # Check for any file matching the pattern
                    if any(self.project_path.glob(indicator)):
                        return project_type
                else:
                    if (self.project_path / indicator).exists():
                        return project_type

        return ProjectType.UNKNOWN

    def validate_all(self, changes: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run all applicable validations on the given changes.

        Args:
            changes: Dictionary describing what was changed
                {
                    "files": ["path/to/file1", "path/to/file2"],
                    "type": "code/backend" | "code/frontend" | "database" | etc.
                }

        Returns:
            Validation report dictionary
        """
        self.results = []

        # Run immediate checks (fastest first)
        self._run_syntax_validation(changes.get("files", []))
        self._run_linting(changes.get("files", []))
        self._run_type_checking()

        # Run tests if available
        self._run_unit_tests()
        self._run_integration_tests()

        return self._generate_report()

    def _run_syntax_validation(self, files: List[str]) -> None:
        """Validate syntax of changed files."""
        for file_path in files:
            path = self.project_path / file_path
            if not path.exists():
                self.results.append(ValidationResult(
                    name=f"Syntax: {file_path}",
                    status=ValidationStatus.SKIP,
                    message=f"File not found: {file_path}"
                ))
                continue

            ext = path.suffix
            try:
                if ext in [".js", ".jsx", ".ts", ".tsx"]:
                    # Use node to check syntax
                    result = subprocess.run(
                        ["node", "--check", str(path)],
                        capture_output=True,
                        timeout=10
                    )
                    if result.returncode == 0:
                        self.results.append(ValidationResult(
                            name=f"Syntax: {file_path}",
                            status=ValidationStatus.PASS,
                            message=f"Valid {ext} syntax"
                        ))
                    else:
                        self.results.append(ValidationResult(
                            name=f"Syntax: {file_path}",
                            status=ValidationStatus.FAIL,
                            message=f"Syntax error: {result.stderr.decode()}",
                            location=file_path,
                            severity="critical"
                        ))

                elif ext == ".py":
                    result = subprocess.run(
                        ["python", "-m", "py_compile", str(path)],
                        capture_output=True,
                        timeout=10
                    )
                    if result.returncode == 0:
                        self.results.append(ValidationResult(
                            name=f"Syntax: {file_path}",
                            status=ValidationStatus.PASS,
                            message="Valid Python syntax"
                        ))
                    else:
                        self.results.append(ValidationResult(
                            name=f"Syntax: {file_path}",
                            status=ValidationStatus.FAIL,
                            message=f"Syntax error",
                            location=file_path,
                            severity="critical"
                        ))

            except (subprocess.TimeoutExpired, FileNotFoundError):
                self.results.append(ValidationResult(
                    name=f"Syntax: {file_path}",
                    status=ValidationStatus.SKIP,
                    message="Syntax check not available"
                ))

    def _run_linting(self, files: List[str]) -> None:
        """Run linting on changed files."""
        if self.project_type in [ProjectType.JAVASCRIPT, ProjectType.TYPESCRIPT]:
            self._run_eslint(files)
        elif self.project_type == ProjectType.PYTHON:
            self._run_pylint(files)

    def _run_eslint(self, files: List[str]) -> None:
        """Run ESLint on JavaScript/TypeScript files."""
        # Check if eslint is available
        try:
            subprocess.run(
                ["npx", "eslint", "--version"],
                capture_output=True,
                timeout=5
            )
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.results.append(ValidationResult(
                name="ESLint",
                status=ValidationStatus.SKIP,
                message="ESLint not available"
            ))
            return

        # Filter to JS/TS files
        js_files = [f for f in files if Path(f).suffix in [".js", ".jsx", ".ts", ".tsx"]]
        if not js_files:
            return

        try:
            result = subprocess.run(
                ["npx", "eslint", "--format", "json"] + js_files,
                capture_output=True,
                timeout=60,
                cwd=self.project_path
            )

            if result.returncode == 0:
                self.results.append(ValidationResult(
                    name="ESLint",
                    status=ValidationStatus.PASS,
                    message=f"No linting errors found in {len(js_files)} file(s)"
                ))
            else:
                # Parse output for errors
                try:
                    eslint_output = json.loads(result.stdout.decode())
                    error_count = sum(len(r.get("messages", [])) for r in eslint_output)
                    self.results.append(ValidationResult(
                        name="ESLint",
                        status=ValidationStatus.FAIL if error_count > 0 else ValidationStatus.PASS,
                        message=f"Found {error_count} linting issue(s)",
                        severity="medium"
                    ))
                except json.JSONDecodeError:
                    self.results.append(ValidationResult(
                        name="ESLint",
                        status=ValidationStatus.PARTIAL,
                        message="ESLint run completed with output"
                    ))

        except subprocess.TimeoutExpired:
            self.results.append(ValidationResult(
                name="ESLint",
                status=ValidationStatus.SKIP,
                message="ESLint timed out"
            ))

    def _run_pylint(self, files: List[str]) -> None:
        """Run Pylint on Python files."""
        py_files = [f for f in files if Path(f).suffix == ".py"]
        if not py_files:
            return

        try:
            result = subprocess.run(
                ["pylint", "--output-format=json"] + py_files,
                capture_output=True,
                timeout=60,
                cwd=self.project_path
            )

            try:
                pylint_output = json.loads(result.stdout.decode())
                error_count = len(pylint_output)
                if error_count == 0:
                    self.results.append(ValidationResult(
                        name="Pylint",
                        status=ValidationStatus.PASS,
                        message=f"No linting errors found in {len(py_files)} file(s)"
                    ))
                else:
                    self.results.append(ValidationResult(
                        name="Pylint",
                        status=ValidationStatus.FAIL,
                        message=f"Found {error_count} linting issue(s)",
                        severity="medium"
                    ))
            except json.JSONDecodeError:
                self.results.append(ValidationResult(
                    name="Pylint",
                    status=ValidationStatus.SKIP,
                    message="Could not parse Pylint output"
                ))

        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.results.append(ValidationResult(
                name="Pylint",
                status=ValidationStatus.SKIP,
                message="Pylint not available"
            ))

    def _run_type_checking(self) -> None:
        """Run type checking if available."""
        if self.project_type == ProjectType.TYPESCRIPT:
            self._run_tsc()
        elif self.project_type == ProjectType.PYTHON:
            self._run_mypy()

    def _run_tsc(self) -> None:
        """Run TypeScript compiler for type checking."""
        if not (self.project_path / "node_modules" / ".bin" / "tsc").exists():
            # Check global tsc
            try:
                subprocess.run(
                    ["tsc", "--version"],
                    capture_output=True,
                    timeout=5
                )
            except (subprocess.TimeoutExpired, FileNotFoundError):
                self.results.append(ValidationResult(
                    name="TypeScript",
                    status=ValidationStatus.SKIP,
                    message="TypeScript compiler not available"
                ))
                return

        try:
            result = subprocess.run(
                ["npx", "tsc", "--noEmit"],
                capture_output=True,
                timeout=60,
                cwd=self.project_path
            )

            if result.returncode == 0:
                self.results.append(ValidationResult(
                    name="TypeScript",
                    status=ValidationStatus.PASS,
                    message="No type errors found"
                ))
            else:
                error_count = result.stdout.decode().count("\n") if result.stdout else 0
                self.results.append(ValidationResult(
                    name="TypeScript",
                    status=ValidationStatus.FAIL,
                    message=f"Found {error_count} type error(s)",
                    severity="high"
                ))

        except subprocess.TimeoutExpired:
            self.results.append(ValidationResult(
                name="TypeScript",
                status=ValidationStatus.SKIP,
                message="TypeScript check timed out"
            ))

    def _run_mypy(self) -> None:
        """Run mypy for Python type checking."""
        try:
            result = subprocess.run(
                ["mypy", "."],
                capture_output=True,
                timeout=60,
                cwd=self.project_path
            )

            if result.returncode == 0:
                self.results.append(ValidationResult(
                    name="MyPy",
                    status=ValidationStatus.PASS,
                    message="No type errors found"
                ))
            else:
                self.results.append(ValidationResult(
                    name="MyPy",
                    status=ValidationStatus.PARTIAL,
                    message="Type checking found issues"
                ))

        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.results.append(ValidationResult(
                name="MyPy",
                status=ValidationStatus.SKIP,
                message="MyPy not available"
            ))

    def _run_unit_tests(self) -> None:
        """Run unit tests if available."""
        if self.project_type in [ProjectType.JAVASCRIPT, ProjectType.TYPESCRIPT]:
            self._run_jest_tests("unit")
        elif self.project_type == ProjectType.PYTHON:
            self._run_pytest_tests("unit")

    def _run_integration_tests(self) -> None:
        """Run integration tests if available."""
        if self.project_type in [ProjectType.JAVASCRIPT, ProjectType.TYPESCRIPT]:
            self._run_jest_tests("integration")
        elif self.project_type == ProjectType.PYTHON:
            self._run_pytest_tests("integration")

    def _run_jest_tests(self, test_type: str) -> None:
        """Run Jest tests."""
        test_pattern = f"**/*.{test_type}.test.*" if test_type else "**/*.test.*"
        try:
            result = subprocess.run(
                ["npx", "jest", test_pattern, "--json", "--outputFile=/tmp/jest-results.json"],
                capture_output=True,
                timeout=300,
                cwd=self.project_path
            )

            try:
                with open("/tmp/jest-results.json") as f:
                    jest_results = json.load(f)

                self.results.append(ValidationResult(
                    name=f"Jest ({test_type})",
                    status=ValidationStatus.PASS if jest_results.get("success") else ValidationStatus.FAIL,
                    message=f"{jest_results.get('numTotalTests', 0)} tests, "
                           f"{jest_results.get('numPassedTests', 0)} passed, "
                           f"{jest_results.get('numFailedTests', 0)} failed"
                ))
            except (FileNotFoundError, json.JSONDecodeError):
                self.results.append(ValidationResult(
                    name=f"Jest ({test_type})",
                    status=ValidationStatus.SKIP,
                    message="Could not parse Jest results"
                ))

        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.results.append(ValidationResult(
                name=f"Jest ({test_type})",
                status=ValidationStatus.SKIP,
                message="Jest not available or timed out"
            ))

    def _run_pytest_tests(self, test_type: str) -> None:
        """Run pytest tests."""
        try:
            result = subprocess.run(
                ["pytest", f"-m", test_type, "-v", "--tb=short"],
                capture_output=True,
                timeout=300,
                cwd=self.project_path
            )

            output = result.stdout.decode()
            if "passed" in output:
                # Parse pytest output for results
                self.results.append(ValidationResult(
                    name=f"Pytest ({test_type})",
                    status=ValidationStatus.PASS if result.returncode == 0 else ValidationStatus.FAIL,
                    message=output.split("\n")[-2] if "\n" in output else "Tests completed"
                ))
            else:
                self.results.append(ValidationResult(
                    name=f"Pytest ({test_type})",
                    status=ValidationStatus.SKIP,
                    message=f"No {test_type} tests found"
                ))

        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.results.append(ValidationResult(
                name=f"Pytest ({test_type})",
                status=ValidationStatus.SKIP,
                message="Pytest not available or timed out"
            ))

    def _generate_report(self) -> Dict[str, Any]:
        """Generate validation report from results."""
        passed = sum(1 for r in self.results if r.status == ValidationStatus.PASS)
        failed = sum(1 for r in self.results if r.status == ValidationStatus.FAIL)
        partial = sum(1 for r in self.results if r.status == ValidationStatus.PARTIAL)
        skipped = sum(1 for r in self.results if r.status == ValidationStatus.SKIP)

        # Determine overall status
        if failed > 0:
            overall_status = ValidationStatus.FAIL
        elif partial > 0:
            overall_status = ValidationStatus.PARTIAL
        else:
            overall_status = ValidationStatus.PASS

        return {
            "status": overall_status.value,
            "summary": {
                "total": len(self.results),
                "passed": passed,
                "failed": failed,
                "partial": partial,
                "skipped": skipped
            },
            "results": [
                {
                    "name": r.name,
                    "status": r.status.value,
                    "message": r.message,
                    "location": r.location,
                    "severity": r.severity,
                    "recommendation": r.recommendation
                }
                for r in self.results
            ],
            "critical_issues": [
                {
                    "name": r.name,
                    "message": r.message,
                    "location": r.location,
                    "recommendation": r.recommendation
                }
                for r in self.results
                if r.status == ValidationStatus.FAIL and r.severity == "critical"
            ],
            "warnings": [
                {
                    "name": r.name,
                    "message": r.message
                }
                for r in self.results
                if r.status == ValidationStatus.PARTIAL
            ]
        }


def main():
    """CLI entry point for validation."""
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="Validate AI-generated output")
    parser.add_argument("path", nargs="?", default=".", help="Project path")
    parser.add_argument("--files", nargs="+", help="Files to validate")
    parser.add_argument("--output", choices=["text", "json"], default="text",
                       help="Output format")

    args = parser.parse_args()

    validator = TestingValidator(args.path)

    changes = {
        "files": args.files or [],
        "type": "unknown"
    }

    report = validator.validate_all(changes)

    if args.output == "json":
        print(json.dumps(report, indent=2))
    else:
        print(f"\n{'='*60}")
        print(f"Validation Report: {report['status'].upper()}")
        print(f"{'='*60}\n")

        print(f"Summary:")
        print(f"  Total:   {report['summary']['total']}")
        print(f"  Passed:  {report['summary']['passed']}")
        print(f"  Failed:  {report['summary']['failed']}")
        print(f"  Partial: {report['summary']['partial']}")
        print(f"  Skipped: {report['summary']['skipped']}")

        if report['critical_issues']:
            print(f"\n❌ Critical Issues:")
            for issue in report['critical_issues']:
                print(f"  - {issue['name']}: {issue['message']}")
                if issue['location']:
                    print(f"    Location: {issue['location']}")
                if issue['recommendation']:
                    print(f"    Recommendation: {issue['recommendation']}")

        if report['warnings']:
            print(f"\n⚠️  Warnings:")
            for warning in report['warnings']:
                print(f"  - {warning['name']}: {warning['message']}")

        sys.exit(0 if report['status'] == 'pass' else 1)


if __name__ == "__main__":
    main()
