# Filesystem MCP Server Skills

Complete guide to using Filesystem MCP server with Claude Code.

## Overview

The Filesystem MCP server provides controlled access to your file system, enabling Claude Code to read, write, search, and manage files.

**Configuration:** Global access to `/Users/shaansisodia`
**Package:** `@modelcontextprotocol/server-filesystem`

---

## Available Skills

### File Reading

#### `filesystem_read_file`
Read the contents of a file.

**Usage:**
```
Read package.json
Show contents of .env
Display README.md
```

**Parameters:**
- `path`: File path to read

**Returns:**
- File contents
- File metadata (size, type, permissions)
- Encoding information

---

#### `filesystem_read_file_lines`
Read specific lines from a file.

**Usage:**
```
Show lines 10-20 of app.ts
Read first 50 lines of log file
```

**Parameters:**
- `path`: File path
- `start_line`: Starting line number (1-based)
- `end_line`: Ending line number (optional)

---

#### `filesystem_read_multiple_files`
Read multiple files at once.

**Usage:**
```
Read all TypeScript files in src/
Show contents of config files
```

**Parameters:**
- `paths`: Array of file paths

---

### File Writing

#### `filesystem_write_file`
Write content to a file (creates or overwrites).

**Usage:**
```
Write 'Hello World' to test.txt
Create config.json with settings
Save this HTML to index.html
```

**Parameters:**
- `path`: File path
- `content`: File content

---

#### `filesystem_append_file`
Append content to an existing file.

**Usage:**
```
Append log entry to file.log
Add line to .gitignore
```

**Parameters:**
- `path`: File path
- `content`: Content to append

---

### File Management

#### `filesystem_create_directory`
Create a new directory.

**Usage:**
```
Create directory src/components/new
Make folder for tests
```

**Parameters:**
- `path`: Directory path
- `recursive`: Create parent directories (default: true)

---

#### `filesystem_delete_file`
Delete a file.

**Usage:**
```
Delete test-file.txt
Remove old-log.log
```

**Parameters:**
- `path`: File path

---

#### `filesystem_delete_directory`
Delete a directory and its contents.

**Usage:**
```
Delete directory old-folder
Remove empty test directory
```

**Parameters:**
- `path`: Directory path
- `recursive`: Delete all contents (default: true)

---

#### `filesystem_move_file`
Move or rename a file.

**Usage:**
```
Move file to new location
Rename old-name.ts to new-name.ts
```

**Parameters:**
- `source`: Source path
- `destination`: Destination path

---

#### `filesystem_copy_file`
Copy a file.

**Usage:**
```
Copy file to backup location
Duplicate config file
```

**Parameters:**
- `source`: Source path
- `destination`: Destination path

---

### File Search

#### `filesystem_search_files`
Search for files by name or pattern.

**Usage:**
```
Find all .ts files
Search for files containing 'test'
Find README files
```

**Parameters:**
- `pattern`: File name pattern
- `path`: Directory to search (default: current directory)
- `exclude`: Patterns to exclude

---

#### `filesystem_search_content`
Search for text within files.

**Usage:**
```
Search for 'TODO' in all files
Find 'function' in src/
Search for import statements
```

**Parameters:**
- `query`: Text to search for
- `path`: Directory to search
- `file_pattern`: File type filter (optional)
- `exclude`: Patterns to exclude

---

#### `filesystem_find_files_by_extension`
Find files with specific extension.

**Usage:**
```
Find all .json files
List all TypeScript files
```

**Parameters:**
- `extension`: File extension (e.g., 'ts', 'json', 'md')
- `path`: Directory to search

---

### Directory Operations

#### `filesystem_list_directory`
List contents of a directory.

**Usage:**
```
List files in src/
Show directory contents of ./
```

**Parameters:**
- `path`: Directory path

**Returns:**
- Files and subdirectories
- File sizes
- File types
- Modification dates

---

#### `filesystem_get_directory_tree`
Get tree structure of a directory.

**Usage:**
```
Show directory tree of src/
Display folder structure
```

**Parameters:**
- `path`: Directory path
- `depth`: Maximum depth (default: unlimited)

---

#### `filesystem_get_directory_info`
Get information about a directory.

**Usage:**
```
Get directory size
Show directory statistics
```

**Parameters:**
- `path`: Directory path

**Returns:**
- Total size
- File count
- Directory count
- Permissions

---

### File Information

#### `filesystem_get_file_info`
Get metadata about a file.

**Usage:**
```
Get file info for package.json
Show metadata for app.ts
```

**Parameters:**
- `path`: File path

**Returns:**
- File size
- Creation date
- Modification date
- File type
- Permissions
- Owner

---

#### `filesystem_file_exists`
Check if a file exists.

**Usage:**
```
Check if config.json exists
Does .env file exist?
```

**Parameters:**
- `path`: File path

**Returns:**
- Boolean (true/false)

---

#### `filesystem_directory_exists`
Check if a directory exists.

**Usage:**
```
Check if node_modules exists
Does src/ directory exist?
```

**Parameters:**
- `path`: Directory path

---

### Permission Management

#### `filesystem_get_permissions`
Get file or directory permissions.

**Usage:**
```
Get permissions for script.sh
Check file permissions
```

**Parameters:**
- `path`: File path

**Returns:**
- Octal permissions (e.g., 755)
- Symbolic permissions (e.g., rwxr-xr-x)
- Owner, group, others

---

#### `filesystem_set_permissions`
Set file or directory permissions.

**Usage:**
```
Make script executable
Set permissions to 644
```

**Parameters:**
- `path`: File path
- `permissions`: Octal permissions (e.g., 755, 644)

---

### File Comparison

#### `filesystem_compare_files`
Compare two files.

**Usage:**
```
Compare file1.ts and file2.ts
Check if files are identical
```

**Parameters:**
- `path1`: First file
- `path2`: Second file

**Returns:**
- Are identical (true/false)
- Differences (if any)
- Line-by-line comparison

---

#### `filesystem_get_file_hash`
Get hash of file content.

**Usage:**
```
Get MD5 hash of file
Calculate SHA256 checksum
```

**Parameters:**
- `path`: File path
- `algorithm`: Hash algorithm (md5, sha1, sha256)

---

## Common Workflows

### 1. File Exploration
```
List directory contents
Show directory tree
Read specific file
Get file information
```

### 2. File Organization
```
Create new directory structure
Move files to folders
Rename files
Clean up old files
```

### 3. Code Search
```
Find all TypeScript files
Search for specific function
Find TODO comments
Search for imports
```

### 4. Configuration Management
```
Read config files
Update settings
Create new config
Backup configuration
```

### 5. Project Setup
```
Create project structure
Generate boilerplate files
Set up directories
Create README
```

---

## Integration with Lumelle

### Project Structure
```
Show Lumelle directory structure
List all components
Find all test files
```

### Code Management
```
Read component files
Update config
Search for specific patterns
Organize file structure
```

### Build Artifacts
```
List build output
Check dist directory
Clean build files
```

---

## Tips

1. **Use absolute paths** - More reliable than relative
2. **Check before writing** - Verify file doesn't exist if needed
3. **Use search wisely** - Narrow down scope for faster results
4. **Backup before delete** - Always backup important files
5. **Check permissions** - Ensure write access before modifying

---

## Best Practices

✅ **DO:**
- Use absolute paths
- Check file existence before operations
- Backup important files
- Use descriptive file names
- Organize files logically
- Set appropriate permissions
- Clean up temporary files

❌ **DON'T:**
- Delete without confirmation
- Overwrite without backup
- Use wildcard delete carelessly
- Ignore file permissions
- Create deep nesting
- Hardcode paths in code
- Forget to clean up

---

## Troubleshooting

**Permission denied:**
- Check file permissions
- Verify you own the file
- Use sudo with caution
- Check parent directory permissions

**File not found:**
- Verify file path is correct
- Use absolute path
- Check file actually exists
- Check for typos

**Cannot delete file:**
- Check if file is in use
- Verify permissions
- Close file handles
- Check if file is locked

**Disk full:**
- Check available space
- Clean up temporary files
- Remove old backups
- Clear cache files

---

## File Path Patterns

### Glob Patterns
```
*.ts              # All TypeScript files
src/**/*.ts        # All .ts files in src/
test/*.spec.ts     # Test specs
**/*.json          # All JSON files anywhere
```

### Exclusion Patterns
```
**/node_modules/**  # Exclude node_modules
**/*.test.js        # Exclude test files
**/dist/**          # Exclude build output
```

---

## Advanced Usage

### Batch Operations
```
Read all config files
Search multiple directories
Batch rename files
Mass update files
```

### File Watching
```
Monitor directory for changes
Watch for file modifications
Track new files
```

### File Compression
```
Compress directory
Create archive
Extract files
```

### Symbolic Links
```
Create symbolic link
Follow symlinks
Get link target
```

---

## Example Workflows

### Project Setup
```
1. Create project directory
2. Create subdirectories (src, tests, docs)
3. Generate package.json
4. Create README.md
5. Set up .gitignore
6. Create initial files
```

### Code Organization
```
1. List all source files
2. Find unused files
3. Organize into folders
4. Move files appropriately
5. Update imports
```

### Cleanup
```
1. Find temporary files
2. List old log files
3. Delete old backups
4. Clean cache directories
5. Remove build artifacts
```

### Migration
```
1. Copy files to new location
2. Update file contents
3. Verify all files moved
4. Delete old files
5. Update references
```

---

## Security Considerations

⚠️ **Important:** The Filesystem MCP has access to your entire user directory.

### Safe Practices

1. **Confirm destructive operations** - Delete, move, overwrite
2. **Use specific paths** - Avoid wildcards in destructive operations
3. **Backup first** - Always backup before bulk operations
4. **Review paths** - Ensure you're targeting the right files
5. **Check permissions** - Verify you have the right access

### Restricted Operations

Claude will ask for confirmation before:
- Deleting files or directories
- Overwriting existing files
- Modifying system files
- Making bulk changes

---

## File Size Limits

- **Read files:** Up to available memory
- **Write files:** Up to available disk space
- **Search operations:** Depends on disk speed and file count

**Tips for large files:**
- Use `read_file_lines` for large text files
- Process files in chunks
- Use streaming for very large files
- Consider compression for large datasets

---

**Need Help?** Just ask Claude: "Use Filesystem MCP to..."
