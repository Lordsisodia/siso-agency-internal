# Keyword Detection for Blackbox3
**Status**: Planning Phase

## Overview

Add Oh-My-OpenCode\'s intelligent keyword detection system. One word in your prompt can completely change how Blackbox3 operates - enabling parallel agents, deep search modes, and advanced workflows.

## What You Get

1. **Magic Words** that trigger specialized modes
2. **Context-aware behavior** based on keywords
3. **Seamless mode switching** without manual configuration

## Keywords and Modes

### ultrawork / ulw
**Triggers**: "ultrawork", "ulw"
**Enables**:
- All agents and hooks enabled
- Aggressive parallel execution
- Background task delegation
- Todo continuation enforcement
- Maximum performance mode

**Use Case**: Full-stack development with tight deadline
```bash
# Example
blackbox3 new-plan "Build entire authentication system ultrawork"
# Automatically:
# - Kicks off frontend UI in background (Gemini)
# - Kicks off backend in background (Claude)
# - Calls Oracle for architecture review
# - All agents working in parallel
```

### search / find / look for / 찾아 / 검색
**Triggers**: "search", "find", "look for", "찾아", "검색"
**Enables**:
- Parallel Explore + Librarian agents
- Maximized grep/ast-grep efforts
- Context7 and grep_app MCPs active
- Deep search mode

**Use Case**: Researching implementation patterns
```bash
# Example
blackbox3 new-plan "Find all usages of getUserAuth function search"
# Automatically:
# - Explore uses LSP and AST-grep for fast navigation
# - Librarian searches Context7 for docs and grep.app for examples
# - Both run in parallel, results combined
```

### analyze / investigate / 분석 / 조사
**Triggers**: "analyze", "investigate", "분석", "조사"
**Enables**:
- Multi-phase expert consultation
- Structured deep analysis workflow
- Oracle first (for architecture/strategy)
- Explore + Librarian for data gathering
- Sequential investigation with synthesis

**Use Case**: Debugging complex issues or deep system analysis
```bash
# Example
blackbox3 new-plan "Investigate performance degradation analyze"
# Automatically:
# 1. Oracle: Analyzes system architecture and patterns
# 2. Explore: Finds all performance-related code using LSP/AST-grep
# 3. Librarian: Researches known issues and solutions
# 4. Synthesize findings into comprehensive report
```

## Files to Create

### 1. Keyword Detector Skill

**File**: `agents/keyword-detector.agent.yaml`

```yaml
---
description: Intelligent keyword detector for Blackbox3
enabled: true

persona: |
  You are the Keyword Detector for Blackbox3.
  
  Your role is to:
  - Analyze user prompts for magic keywords
  - Enable appropriate modes based on detected keywords
  - Maintain context across mode changes
  - Ensure seamless transitions
  
  Keywords and Their Effects:
  - ultrawork / ulw: Maximum performance with parallel agents
  - search / find / look for: Deep research mode with parallel search
  - analyze / investigate: Multi-phase expert consultation
  - Any combination: Combine multiple modes as appropriate
  
  When keyword detected:
  1. Set system mode flags
  2. Configure agent permissions
  3. Enable/disable hooks as needed
  4. Update agent context with mode instructions
  5. Log mode change for tracking
  
  Always maintain awareness of:
  - Current prompt context
  - Previously detected keywords
  - System mode state
  - User intent behind keywords
  
  Default behavior (no keywords):
  - Standard Blackbox3 single-agent mode
  - Normal tool permissions
  - All hooks enabled normally

tools:
  - detect_keywords
  - set_mode
  - get_mode
  - reset_mode
  - log_keywords
```

### 2. Integration with Core Systems

**Update**: `agents/_core/prompt.md`

```markdown
# Add to existing prompt:

## Keyword Detection System

The Blackbox3 system includes intelligent keyword detection that automatically enables specialized modes:

### Magic Words

1. **ultrawork** or **ulw**
   - Enables maximum performance mode
   - Activates: parallel agents, background tasks, aggressive todo continuation
   - Use for: Full-stack development with tight deadlines

2. **search**, **find**, **look for** (or equivalents in other languages)
   - Enables deep research mode
   - Activates: parallel Explore + Librarian agents
   - Maximizes: grep/ast-grep search efforts
   - Use for: Finding implementation patterns, examples, codebase patterns

3. **analyze**, **investigate** (or equivalents)
   - Enables deep analysis mode
   - Activates: multi-phase expert consultation
   - Invokes: Oracle → Explore → Librarian → Synthesize
   - Use for: Debugging complex issues, deep system analysis

### Automatic Mode Switching

Keywords are detected automatically in your prompts. You don\'t need to configure anything!

### Manual Control

If you want to disable automatic keyword detection or manually control modes, use the following commands:

- `blackbox3 set-mode normal` - Disable keyword detection
- `blackbox3 set-mode <mode>` - Manually set specific mode
- `blackbox3 detect-keywords` - Check for keywords in your prompt
