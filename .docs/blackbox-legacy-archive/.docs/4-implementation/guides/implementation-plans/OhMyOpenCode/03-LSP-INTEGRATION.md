# LSP Integration for Blackbox3 Agents
**Status**: Planning Phase

## Overview

Give Blackbox3 agents IDE-level superpowers using Oh-My-OpenCode\'s LSP tool set. Instead of working with text-only output, agents can now navigate code like you can in VS Code.

## What You Get

1. **Type Info & Docs**: Get function signatures at cursor position
2. **Navigation**: Jump to definitions, find all usages
3. **Code Actions**: Apply refactorings, quick fixes
4. **AST-Aware Search**: Structural pattern matching across 25 languages
5. **Diagnostics**: Get errors before running code

## Files to Create

### 1. LSP Tools Skill

**File**: `skills/with-lsp.md`

```yaml
---
description: LSP Tools for Blackbox3 Agents
enabled: true

tools:
  - name: lsp_hover
    description: |
      Get type information, documentation, and function signatures 
      at the current cursor position in a file.
      
      Use when you need to understand what a function does or get documentation for a symbol.
    example: |
      User: "What does this function do?"
      Agent: Uses lsp_hover on the function name
      
  - name: lsp_goto_definition
    description: |
      Jump to the definition of the symbol at the cursor position.
      
      Navigate to where a function, class, variable is defined in your codebase.
      
      Faster than searching manually.
    example: |
      User: "Find where getUserAuth is defined"
      Agent: Uses lsp_goto_definition on "getUserAuth"
      
  - name: lsp_find_references
    description: |
      Find all usages of a symbol across the entire workspace.
      
      See everywhere a function, class, or variable is used.
      Essential for refactoring and understanding impact.
    example: |
      User: "Find all usages of getUserAuth function"
      Agent: Uses lsp_find_references on "getUserAuth"
      
  - name: lsp_document_symbols
    description: |
      Get a hierarchical outline (file, classes, functions) 
      of all symbols in the current file.
      
      Quick overview of file structure and available APIs.
    example: |
      User: "Show me the structure of this file"
      Agent: Uses lsp_document_symbols
      
  - name: lsp_workspace_symbols
    description: |
      Search for symbols by name across the entire workspace.
      
      Find any function, class, or variable by name.
      Works faster than grep and is more accurate.
    example: |
      User: "Find all functions with 'auth' in the name"
      Agent: Uses lsp_workspace_symbols with query "auth"
      
  - name: lsp_diagnostics
    description: |
      Get errors, warnings, and hints from the language server 
      before running your code.
      
      Catch bugs early and get suggestions.
    example: |
      User: "Check for errors before running code"
      Agent: Uses lsp_diagnostics
      
  - name: lsp_rename
    description: |
      Rename a symbol across the entire workspace.
      
      Safe, automated refactoring across all files.
      Example: Rename function from 'getUserAuth' to 'authenticateUser'.
    example: |
      User: "Rename getUserAuth to authenticateUser everywhere"
      Agent: Uses lsp_rename with old_name="getUserAuth" new_name="authenticateUser"
      
  - name: lsp_code_actions
    description: |
      Get available quick fixes and refactorings 
      such as "extract function", "add import", etc.
      
      Apply with a single command.
    example: |
      User: "Extract the validation logic into a separate function"
      Agent: Uses lsp_code_actions and selects "extract function"
      
  - name: ast_grep_search
    description: |
      AST-aware code pattern search across 25 programming languages.
      
      Search for structural patterns, not just text.
      More accurate than grep for code patterns.
    example: |
      User: "Find all async functions with error handling"
      Agent: Uses ast_grep_search with pattern "async.*error"
      
  - name: ast_grep_replace
    description: |
      AST-aware code replacement across 25 programming languages.
      
      Safely refactor patterns across your entire codebase.
    example: |
      User: "Replace all callback patterns with async/await"
      Agent: Uses ast_grep_replace with pattern and replacement

usage:
  When agent needs to navigate or analyze code:
  - Use lsp_hover for understanding function signatures
  - Use lsp_goto_definition for finding definitions
  - Use lsp_find_references for understanding impact
  - Use ast_grep_search for structural queries (faster than grep)
  - Use lsp_code_actions for automated refactoring
  - Use lsp_diagnostics to catch errors early
