"""
Black Box 5 Engine - Tool Tests

Comprehensive tests for the tool system.
"""

import asyncio
import pytest
import tempfile
from pathlib import Path

from engine.tools.base import BaseTool, ToolResult, ToolRisk
from engine.tools.file_tools import FileReadTool, FileWriteTool
from engine.tools.bash_tool import BashExecuteTool
from engine.tools.search_tool import SearchTool
from engine.tools.registry import ToolRegistry, get_tool, list_tools


class TestToolBase:
    """Tests for base tool functionality"""

    def test_tool_result(self):
        """Test ToolResult creation and serialization"""
        result = ToolResult(
            success=True,
            data={"key": "value"},
            metadata={"info": "test"}
        )

        assert result.success is True
        assert result.data == {"key": "value"}
        assert result.error is None

        result_dict = result.to_dict()
        assert result_dict["success"] is True
        assert result_dict["data"] == {"key": "value"}
        assert result_dict["error"] is None
        assert result_dict["metadata"]["info"] == "test"

    def test_tool_result_error(self):
        """Test ToolResult with error"""
        result = ToolResult(
            success=False,
            error="Something went wrong"
        )

        assert result.success is False
        assert result.error == "Something went wrong"
        assert result.data is None


class TestFileReadTool:
    """Tests for FileReadTool"""

    @pytest.fixture
    def temp_file(self):
        """Create a temporary file for testing"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
            f.write("Line 1\n")
            f.write("Line 2\n")
            f.write("Line 3\n")
            f.write("Line 4\n")
            f.write("Line 5\n")
            temp_path = f.name

        yield temp_path

        # Cleanup
        Path(temp_path).unlink(missing_ok=True)

    @pytest.mark.asyncio
    async def test_read_file(self, temp_file):
        """Test reading a complete file"""
        tool = FileReadTool()
        result = await tool.run(path=temp_file)

        assert result.success is True
        assert "Line 1" in result.data
        assert "Line 5" in result.data
        # Path may be resolved to absolute path
        assert Path(result.metadata["path"]) == Path(temp_file).resolve()
        assert result.metadata["lines"] == 5

    @pytest.mark.asyncio
    async def test_read_file_with_offset(self, temp_file):
        """Test reading file with offset"""
        tool = FileReadTool()
        result = await tool.run(path=temp_file, offset=2)

        assert result.success is True
        assert "Line 1" not in result.data
        assert "Line 3" in result.data
        assert result.metadata["lines"] == 3

    @pytest.mark.asyncio
    async def test_read_file_with_limit(self, temp_file):
        """Test reading file with limit"""
        tool = FileReadTool()
        result = await tool.run(path=temp_file, limit=2)

        assert result.success is True
        assert "Line 1" in result.data
        assert "Line 2" in result.data
        assert "Line 3" not in result.data
        assert result.metadata["truncated"] is True

    @pytest.mark.asyncio
    async def test_read_file_with_offset_and_limit(self, temp_file):
        """Test reading file with both offset and limit"""
        tool = FileReadTool()
        result = await tool.run(path=temp_file, offset=1, limit=2)

        assert result.success is True
        lines = result.data.strip().split('\n')
        assert len(lines) == 2
        assert "Line 2" in lines[0]
        assert "Line 3" in lines[1]

    @pytest.mark.asyncio
    async def test_read_nonexistent_file(self):
        """Test reading a file that doesn't exist"""
        tool = FileReadTool()
        result = await tool.run(path="/nonexistent/file.txt")

        assert result.success is False
        assert "not found" in result.error.lower()

    @pytest.mark.asyncio
    async def test_read_directory(self):
        """Test reading a directory (should fail)"""
        tool = FileReadTool()
        result = await tool.run(path="/tmp")

        assert result.success is False
        assert "not a file" in result.error.lower()

    @pytest.mark.asyncio
    async def test_validate_parameters(self):
        """Test parameter validation"""
        tool = FileReadTool()

        # Missing required parameter
        error = tool.validate_parameters({})
        assert error is not None
        assert "path" in error.lower()

        # Valid parameters
        error = tool.validate_parameters({"path": "/tmp/test.txt"})
        assert error is None


class TestFileWriteTool:
    """Tests for FileWriteTool"""

    @pytest.mark.asyncio
    async def test_write_new_file(self):
        """Test writing to a new file"""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "new_file.txt"
            content = "Hello, World!"

            tool = FileWriteTool()
            result = await tool.run(path=str(file_path), content=content)

            assert result.success is True
            assert file_path.exists()
            assert file_path.read_text() == content
            # File is new, so it wasn't created before this write
            # The metadata tracks whether the file existed before this operation
            assert result.metadata["bytes_written"] == len(content.encode('utf-8'))

            # Cleanup
            file_path.unlink()

    @pytest.mark.asyncio
    async def test_overwrite_existing_file(self):
        """Test overwriting an existing file"""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "existing.txt"
            file_path.write_text("Old content")

            new_content = "New content"
            tool = FileWriteTool()
            result = await tool.run(path=str(file_path), content=new_content)

            assert result.success is True
            assert file_path.read_text() == new_content
            assert result.metadata["created"] is False

    @pytest.mark.asyncio
    async def test_write_with_backup(self):
        """Test writing with backup creation"""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "backup_test.txt"
            file_path.write_text("Original")

            tool = FileWriteTool()
            result = await tool.run(
                path=str(file_path),
                content="Updated",
                backup=True
            )

            assert result.success is True
            assert file_path.read_text() == "Updated"

            backup_path = Path(tmpdir) / "backup_test.txt.bak"
            assert backup_path.exists()
            assert backup_path.read_text() == "Original"

    @pytest.mark.asyncio
    async def test_write_creates_directories(self):
        """Test that write creates parent directories"""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "subdir" / "nested" / "file.txt"
            content = "In nested directory"

            tool = FileWriteTool()
            result = await tool.run(
                path=str(file_path),
                content=content,
                create_dirs=True
            )

            assert result.success is True
            assert file_path.exists()
            assert file_path.read_text() == content


class TestBashExecuteTool:
    """Tests for BashExecuteTool"""

    @pytest.mark.asyncio
    async def test_execute_simple_command(self):
        """Test executing a simple command"""
        tool = BashExecuteTool()
        result = await tool.run(command="echo 'Hello, World!'")

        assert result.success is True
        assert "Hello, World!" in result.data["stdout"]
        assert result.data["exit_code"] == 0

    @pytest.mark.asyncio
    async def test_execute_with_timeout(self):
        """Test command with timeout"""
        tool = BashExecuteTool()
        result = await tool.run(
            command="sleep 0.1 && echo done",
            timeout=5
        )

        assert result.success is True
        assert "done" in result.data["stdout"]

    @pytest.mark.asyncio
    async def test_execute_timeout_exceeded(self):
        """Test command that exceeds timeout"""
        tool = BashExecuteTool()
        result = await tool.run(
            command="sleep 10",
            timeout=1
        )

        assert result.success is False
        assert "timed out" in result.error.lower()
        assert result.metadata["timed_out"] is True

    @pytest.mark.asyncio
    async def test_execute_failing_command(self):
        """Test command that fails"""
        tool = BashExecuteTool()
        result = await tool.run(command="ls /nonexistent_directory_12345")

        assert result.success is False
        assert result.data["exit_code"] != 0

    @pytest.mark.asyncio
    async def test_execute_with_working_directory(self):
        """Test command with custom working directory"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tool = BashExecuteTool()
            result = await tool.run(
                command="pwd",
                cwd=tmpdir
            )

            assert result.success is True
            assert tmpdir in result.data["stdout"]

    @pytest.mark.asyncio
    async def test_dangerous_command_blocked(self):
        """Test that dangerous commands are blocked"""
        tool = BashExecuteTool()
        result = await tool.run(command="rm -rf /")

        assert result.success is False
        assert "dangerous" in result.error.lower() or "blocked" in result.error.lower()


class TestSearchTool:
    """Tests for SearchTool"""

    @pytest.fixture
    def search_directory(self):
        """Create a directory with test files"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)

            # Create test files
            (tmpdir_path / "file1.py").write_text("""
def hello():
    print("Hello, World!")

def goodbye():
    print("Goodbye!")
""")

            (tmpdir_path / "file2.py").write_text("""
import os

def test():
    os.system("echo test")
""")

            subdir = tmpdir_path / "subdir"
            subdir.mkdir()
            (subdir / "file3.txt").write_text("""
This is a text file
With some content
And more lines
""")

            yield tmpdir

    @pytest.mark.asyncio
    async def test_simple_search(self, search_directory):
        """Test simple text search"""
        tool = SearchTool()
        result = await tool.run(
            pattern="hello",  # Search for lowercase
            path=str(search_directory),
            file_pattern="*.py",
            case_sensitive=False
        )

        assert result.success is True
        assert len(result.data) > 0
        # Check that we found "Hello" (case-insensitive match)
        assert any("hello" in match["line_content"].lower() for match in result.data)

    @pytest.mark.asyncio
    async def test_regex_search(self, search_directory):
        """Test regex pattern search"""
        tool = SearchTool()
        result = await tool.run(
            pattern=r"def \w+\(",
            path=str(search_directory),
            file_pattern="*.py",
            use_regex=True
        )

        assert result.success is True
        assert len(result.data) >= 3  # 3 function definitions

    @pytest.mark.asyncio
    async def test_case_insensitive_search(self, search_directory):
        """Test case-insensitive search"""
        tool = SearchTool()
        result = await tool.run(
            pattern="hello",
            path=str(search_directory),
            file_pattern="*.py",
            case_sensitive=False
        )

        assert result.success is True
        assert len(result.data) > 0

    @pytest.mark.asyncio
    async def test_recursive_search(self, search_directory):
        """Test recursive search"""
        tool = SearchTool()
        result = await tool.run(
            pattern="content",
            path=str(search_directory),
            recursive=True
        )

        assert result.success is True
        assert len(result.data) > 0
        # Should find in subdirectory
        assert any("subdir" in r["file"] for r in result.data)

    @pytest.mark.asyncio
    async def test_search_with_context(self, search_directory):
        """Test search with context lines"""
        tool = SearchTool()
        result = await tool.run(
            pattern="Goodbye",
            path=str(search_directory),
            file_pattern="*.py",
            context_lines=1
        )

        assert result.success is True
        assert len(result.data) > 0
        assert "context_before" in result.data[0]
        assert "context_after" in result.data[0]

    @pytest.mark.asyncio
    async def test_search_no_matches(self, search_directory):
        """Test search with no matches"""
        tool = SearchTool()
        result = await tool.run(
            pattern="NONEXISTENT_PATTERN_xyz123",
            path=str(search_directory)
        )

        assert result.success is True
        assert len(result.data) == 0
        assert result.metadata["total_matches"] == 0


class TestToolRegistry:
    """Tests for ToolRegistry"""

    def test_register_and_get(self):
        """Test registering and retrieving tools"""
        registry = ToolRegistry()

        # Register a tool
        registry.register(FileReadTool)

        # Check it's listed
        assert "file_read" in registry.list_tools()

        # Get the tool
        tool = registry.get("file_read")
        assert tool is not None
        assert isinstance(tool, FileReadTool)

    def test_register_with_custom_name(self):
        """Test registering with custom name"""
        registry = ToolRegistry()
        registry.register(FileReadTool, name="custom_read")

        assert "custom_read" in registry.list_tools()
        tool = registry.get("custom_read")
        assert tool is not None

    def test_register_instance(self):
        """Test registering a tool instance"""
        registry = ToolRegistry()
        instance = FileReadTool(config={"test": True})

        registry.register_instance(instance)

        tool = registry.get("file_read")
        assert tool is instance

    def test_get_nonexistent_tool(self):
        """Test getting a tool that doesn't exist"""
        registry = ToolRegistry()
        tool = registry.get("nonexistent_tool")
        assert tool is None

    def test_get_tool_info(self):
        """Test getting tool information"""
        registry = ToolRegistry()
        registry.register(FileReadTool)

        info = registry.get_tool_info("file_read")
        assert info is not None
        assert info["name"] == "file_read"
        assert info["description"] != ""
        assert "parameters" in info

    def test_get_all_info(self):
        """Test getting all tool information"""
        registry = ToolRegistry()
        registry.register(FileReadTool)
        registry.register(FileWriteTool)

        all_info = registry.get_all_info()
        assert "file_read" in all_info
        assert "file_write" in all_info

    def test_unregister(self):
        """Test unregistering a tool"""
        registry = ToolRegistry()
        registry.register(FileReadTool)

        assert "file_read" in registry.list_tools()

        registry.unregister("file_read")
        assert "file_read" not in registry.list_tools()

    def test_clear(self):
        """Test clearing all tools"""
        registry = ToolRegistry()
        registry.register(FileReadTool)
        registry.register(FileWriteTool)

        assert len(registry.list_tools()) == 2

        registry.clear()
        assert len(registry.list_tools()) == 0


class TestGlobalRegistry:
    """Tests for global registry functions"""

    def test_get_global_registry(self):
        """Test getting global registry"""
        from engine.tools.registry import get_global_registry

        registry = get_global_registry()
        assert registry is not None

        # Should have default tools
        tools = registry.list_tools()
        assert "file_read" in tools
        assert "file_write" in tools
        assert "bash_execute" in tools
        assert "search" in tools

    def test_get_tool(self):
        """Test getting tool from global registry"""
        tool = get_tool("file_read")
        assert tool is not None
        assert isinstance(tool, FileReadTool)

    def test_list_tools(self):
        """Test listing tools from global registry"""
        tools = list_tools()
        assert isinstance(tools, list)
        assert len(tools) > 0

    def test_get_tool_info(self):
        """Test getting tool info from global registry"""
        from engine.tools.registry import get_tool_info

        info = get_tool_info("file_read")
        assert info is not None
        assert info["name"] == "file_read"


# Integration tests

class TestToolIntegration:
    """Integration tests for tool workflows"""

    @pytest.mark.asyncio
    async def test_write_read_workflow(self):
        """Test writing and then reading a file"""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "workflow_test.txt"
            content = "Workflow test content"

            # Write
            write_tool = FileWriteTool()
            write_result = await write_tool.run(
                path=str(file_path),
                content=content
            )

            assert write_result.success is True

            # Read
            read_tool = FileReadTool()
            read_result = await read_tool.run(path=str(file_path))

            assert read_result.success is True
            assert read_result.data == content

    @pytest.mark.asyncio
    async def test_search_in_written_file(self):
        """Test searching in a file that was just written"""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "search_test.txt"
            content = """
Line with keyword
Line without it
Another line with keyword
"""

            # Write file
            write_tool = FileWriteTool()
            await write_tool.run(path=str(file_path), content=content)

            # Search for keyword
            search_tool = SearchTool()
            search_result = await search_tool.run(
                pattern="keyword",
                path=str(file_path)
            )

            assert search_result.success is True
            assert search_result.metadata["total_matches"] == 2

    @pytest.mark.asyncio
    async def test_bash_file_creation_and_search(self):
        """Test creating file with bash and searching it"""
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create file with bash
            bash_tool = BashExecuteTool()
            result = await bash_tool.run(
                command=f"echo 'test content' > {tmpdir}/bash_test.txt"
            )

            assert result.success is True

            # Search in created file
            search_tool = SearchTool()
            search_result = await search_tool.run(
                pattern="test content",
                path=tmpdir
            )

            assert search_result.success is True
            assert len(search_result.data) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
