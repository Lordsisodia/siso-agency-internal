#!/usr/bin/env python3
"""
Test generation utilities for the Testing Agent.

Automatically generates test code based on the implementation.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class TestSpec:
    """Specification for a test to be generated."""
    name: str
    description: str
    test_type: str  # unit, integration, e2e
    framework: str
    setup_required: List[str]
    test_cases: List[Dict[str, any]]


class TestGenerator:
    """Generate test code based on implementation."""

    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path).resolve()

    def generate_tests_for_file(self, file_path: str) -> str:
        """
        Generate test code for a given file.

        Args:
            file_path: Path to the file to generate tests for

        Returns:
            Generated test code as string
        """
        path = self.project_path / file_path
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = path.suffix

        if ext in [".js", ".jsx"]:
            return self._generate_jest_test(path)
        elif ext in [".ts", ".tsx"]:
            return self._generate_typescript_test(path)
        elif ext == ".py":
            return self._generate_pytest_test(path)

        raise ValueError(f"Unsupported file type: {ext}")

    def _generate_jest_test(self, file_path: Path) -> str:
        """Generate Jest test for JavaScript file."""
        content = file_path.read_text()

        # Extract function/class names
        functions = self._extract_js_functions(content)
        classes = self._extract_js_classes(content)

        test_file_name = f"{file_path.stem}.test.{file_path.suffix[1:]}"

        tests = []
        imports = self._generate_js_imports(file_path)

        # Generate tests for functions
        for func in functions:
            tests.extend(self._generate_function_tests(func, "javascript"))

        # Generate tests for classes
        for cls in classes:
            tests.extend(self._generate_class_tests(cls, "javascript"))

        return self._format_jest_test(test_file_name, imports, tests)

    def _generate_typescript_test(self, file_path: Path) -> str:
        """Generate Jest test for TypeScript file."""
        content = file_path.read_text()

        # Extract types, interfaces, functions, classes
        functions = self._extract_ts_functions(content)
        classes = self._extract_ts_classes(content)
        interfaces = self._extract_ts_interfaces(content)

        test_file_name = f"{file_path.stem}.test.{file_path.suffix[1:]}"

        tests = []
        imports = self._generate_ts_imports(file_path)

        # Generate tests for functions
        for func in functions:
            tests.extend(self._generate_function_tests(func, "typescript"))

        # Generate tests for classes
        for cls in classes:
            tests.extend(self._generate_class_tests(cls, "typescript"))

        return self._format_jest_test(test_file_name, imports, tests)

    def _generate_pytest_test(self, file_path: Path) -> str:
        """Generate pytest test for Python file."""
        content = file_path.read_text()

        # Extract functions and classes
        functions = self._extract_py_functions(content)
        classes = self._extract_py_classes(content)

        test_file_name = f"test_{file_path.stem}.py"

        tests = []
        imports = self._generate_py_imports(file_path)

        # Generate tests for functions
        for func in functions:
            tests.extend(self._generate_function_tests(func, "python"))

        # Generate tests for classes
        for cls in classes:
            tests.extend(self._generate_class_tests(cls, "python"))

        return self._format_pytest_test(test_file_name, imports, tests)

    def _extract_js_functions(self, content: str) -> List[Dict]:
        """Extract function definitions from JavaScript."""
        # Match function declarations and arrow functions
        patterns = [
            r'function\s+(\w+)\s*\([^)]*\)\s*\{',
            r'const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>',
            r'(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>',
        ]

        functions = []
        for pattern in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                functions.append({
                    "name": match.group(1),
                    "type": "function",
                    "async": "async" in content[match.start()-20:match.end()]
                })

        return functions

    def _extract_js_classes(self, content: str) -> List[Dict]:
        """Extract class definitions from JavaScript."""
        pattern = r'class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{'
        matches = re.finditer(pattern, content)

        classes = []
        for match in matches:
            class_name = match.group(1)
            extends = match.group(2)

            # Extract methods
            class_start = match.end()
            class_end = self._find_closing_brace(content, class_start)
            class_content = content[class_start:class_end]

            methods = self._extract_js_methods(class_content)

            classes.append({
                "name": class_name,
                "extends": extends,
                "methods": methods
            })

        return classes

    def _extract_js_methods(self, class_content: str) -> List[Dict]:
        """Extract method definitions from class content."""
        pattern = r'(\w+)\s*\([^)]*\)\s*\{'
        matches = re.finditer(pattern, class_content)

        methods = []
        for match in matches:
            methods.append({
                "name": match.group(1),
                "type": "method"
            })

        return methods

    def _extract_ts_functions(self, content: str) -> List[Dict]:
        """Extract function definitions from TypeScript."""
        # Similar to JS but with type annotations
        patterns = [
            r'function\s+(\w+)\s*\([^)]*\)\s*:\s*\w+',
            r'const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*:\s*\w+',
        ]

        functions = []
        for pattern in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                functions.append({
                    "name": match.group(1),
                    "type": "function"
                })

        return functions

    def _extract_ts_classes(self, content: str) -> List[Dict]:
        """Extract class definitions from TypeScript."""
        # Similar to JS classes
        return self._extract_js_classes(content)

    def _extract_ts_interfaces(self, content: str) -> List[Dict]:
        """Extract interface definitions from TypeScript."""
        pattern = r'interface\s+(\w+)\s*\{'
        matches = re.finditer(pattern, content)

        interfaces = []
        for match in matches:
            interfaces.append({
                "name": match.group(1),
                "type": "interface"
            })

        return interfaces

    def _extract_py_functions(self, content: str) -> List[Dict]:
        """Extract function definitions from Python."""
        pattern = r'def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?'
        matches = re.finditer(pattern, content)

        functions = []
        for match in matches:
            functions.append({
                "name": match.group(1),
                "args": match.group(2),
                "return_type": match.group(3),
                "type": "function"
            })

        return functions

    def _extract_py_classes(self, content: str) -> List[Dict]:
        """Extract class definitions from Python."""
        pattern = r'class\s+(\w+)(?:\(([^)]+)\))?\s*:'
        matches = re.finditer(pattern, content)

        classes = []
        for match in matches:
            class_name = match.group(1)
            inherits = match.group(2)

            # Extract methods
            class_start = match.end()
            # Find next class or end of file
            remaining = content[class_start:]
            next_class = re.search(r'\nclass\s+', remaining)
            class_end = next_class.start() if next_class else len(remaining)
            class_content = remaining[:class_end]

            methods = self._extract_py_methods(class_content)

            classes.append({
                "name": class_name,
                "inherits": inherits,
                "methods": methods
            })

        return classes

    def _extract_py_methods(self, class_content: str) -> List[Dict]:
        """Extract method definitions from Python class content."""
        pattern = r'def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?'
        matches = re.finditer(pattern, class_content)

        methods = []
        for match in matches:
            methods.append({
                "name": match.group(1),
                "args": match.group(2),
                "return_type": match.group(3),
                "type": "method"
            })

        return methods

    def _generate_function_tests(self, func: Dict, language: str) -> List[str]:
        """Generate test cases for a function."""
        name = func["name"]
        tests = []

        if language in ["javascript", "typescript"]:
            # Test basic functionality
            tests.append(f"""
  describe('{name}', () => {{
    it('should be defined', () => {{
      expect({name}).toBeDefined();
    }});

    it('should return expected output for valid input', () => {{
      // TODO: Add test implementation
      const result = {name}();
      expect(result).toBeDefined();
    }});

    it('should handle edge cases', () => {{
      // TODO: Add edge case tests
    }});

    it('should handle errors gracefully', () => {{
      // TODO: Add error handling tests
    }});
  }});
""")

        elif language == "python":
            tests.append(f"""
def test_{name}_is_defined():
    \"\"\"Test that {name} is defined.\"\"\"
    assert {name} is not None


def test_{name}_valid_input():
    \"\"\"Test {name} with valid input.\"\"\"
    # TODO: Add test implementation
    result = {name}()
    assert result is not None


def test_{name}_edge_cases():
    \"\"\"Test {name} with edge cases.\"\"\"
    # TODO: Add edge case tests


def test_{name}_error_handling():
    \"\"\"Test {name} error handling.\"\"\"
    # TODO: Add error handling tests
""")

        return tests

    def _generate_class_tests(self, cls: Dict, language: str) -> List[str]:
        """Generate test cases for a class."""
        name = cls["name"]
        methods = cls.get("methods", [])
        tests = []

        if language in ["javascript", "typescript"]:
            tests.append(f"""
  describe('{name}', () => {{
    let instance;

    beforeEach(() => {{
      instance = new {name}();
    }});

    it('should create instance', () => {{
      expect(instance).toBeInstanceOf({name});
    }});

    {self._generate_method_tests(methods, language)}
  }});
""")

        elif language == "python":
            tests.append(f"""
class Test{name}:
    \"\"\"Test suite for {name} class.\"\"\"

    def setup_method(self):
        \"\"\"Setup test instance.\"\"\"
        self.instance = {name}()

    def test_instance_creation(self):
        \"\"\"Test that instance can be created.\"\"\"
        assert self.instance is not None

    {self._generate_method_tests(methods, language)}
""")

        return tests

    def _generate_method_tests(self, methods: List[Dict], language: str) -> str:
        """Generate tests for class methods."""
        method_tests = []

        for method in methods:
            name = method["name"]

            if language in ["javascript", "typescript"]:
                method_tests.append(f"""
    it('should have {name} method', () => {{
      expect(instance.{name}).toBeDefined();
      expect(typeof instance.{name}).toBe('function');
    }});

    it('{name} should work correctly', () => {{
      // TODO: Add test implementation
      const result = instance.{name}();
      expect(result).toBeDefined();
    }});
""")

            elif language == "python":
                method_tests.append(f"""
    def test_{name}_exists(self):
        \"\"\"Test that {name} method exists.\"\"\"
        assert hasattr(self.instance, '{name}')
        assert callable(getattr(self.instance, '{name}'))

    def test_{name}_works(self):
        \"\"\"Test that {name} works correctly.\"\"\"
        # TODO: Add test implementation
        result = self.instance.{name}()
        assert result is not None
""")

        return "\n".join(method_tests)

    def _generate_js_imports(self, file_path: Path) -> str:
        """Generate import statements for JavaScript test."""
        rel_path = file_path.relative_to(self.project_path)
        import_path = str(rel_path.with_suffix("")).replace("/index", "")

        return f"import {{ }} from './{import_path}';"

    def _generate_ts_imports(self, file_path: Path) -> str:
        """Generate import statements for TypeScript test."""
        rel_path = file_path.relative_to(self.project_path)
        import_path = str(rel_path.with_suffix("")).replace("/index", "")

        return f"import {{ }} from './{import_path}';"

    def _generate_py_imports(self, file_path: Path) -> str:
        """Generate import statements for Python test."""
        rel_path = file_path.relative_to(self.project_path)
        module_path = str(rel_path.parent).replace("/", ".")
        module_name = file_path.stem

        return f"from {module_path}.{module_name} import"

    def _format_jest_test(self, file_name: str, imports: str, tests: List[str]) -> str:
        """Format complete Jest test file."""
        return f"""// Auto-generated test file for {file_name}
{imports}

{"".join(tests)}
"""

    def _format_pytest_test(self, file_name: str, imports: str, tests: List[str]) -> str:
        """Format complete pytest test file."""
        return f"""# Auto-generated test file for {file_name}
{imports}

{"".join(tests)}
"""

    def _find_closing_brace(self, content: str, start: int) -> int:
        """Find the closing brace for an opening brace."""
        depth = 1
        i = start

        while i < len(content) and depth > 0:
            if content[i] == "{":
                depth += 1
            elif content[i] == "}":
                depth -= 1
            i += 1

        return i if depth == 0 else len(content)


def main():
    """CLI entry point for test generation."""
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="Generate tests for code")
    parser.add_argument("file", help="File to generate tests for")
    parser.add_argument("--output", "-o", help="Output file path")
    parser.add_argument("--print", "-p", action="store_true",
                       help="Print to stdout instead of writing to file")

    args = parser.parse_args()

    generator = TestGenerator()

    try:
        test_code = generator.generate_tests_for_file(args.file)

        if args.print:
            print(test_code)
        elif args.output:
            Path(args.output).write_text(test_code)
            print(f"Tests written to {args.output}")
        else:
            # Auto-determine output path
            file_path = Path(args.file)
            test_file = file_path.parent / f"test_{file_path.name}"
            test_file.write_text(test_code)
            print(f"Tests written to {test_file}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
