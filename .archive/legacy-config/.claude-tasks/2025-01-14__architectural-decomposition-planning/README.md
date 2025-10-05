# 📋 Claude Tasks - Context Preservation System

## 🎯 Purpose
This folder preserves context and progress for complex architectural tasks that span multiple Claude sessions. When context limits are reached, all plans, progress, and decisions are saved here for continuity.

## 📁 Folder Structure

```
.claude-tasks/
├── README.md                          # This overview
└── YYYY-MM-DD__task-name/            # Date-stamped task folders
    ├── TASK-OVERVIEW.md               # High-level summary
    ├── architectural-analysis.md      # Detailed technical analysis  
    ├── decomposition-plans/           # Specific component plans
    │   ├── 01-component-name.md
    │   └── 02-component-name.md
    ├── implementation-notes/          # Progress tracking
    │   ├── session-01-notes.md
    │   └── session-02-notes.md
    └── context-recovery.md            # Quick context restoration
```

## 🔄 Usage Pattern

### **Starting New Complex Task:**
1. Create date-stamped folder: `YYYY-MM-DD__task-description`
2. Create `TASK-OVERVIEW.md` with problem statement and goals
3. Document current state and analysis
4. Break down into specific plans and steps

### **Continuing Previous Task:**
1. Read `TASK-OVERVIEW.md` for quick context
2. Check `context-recovery.md` for immediate state
3. Review latest implementation notes
4. Continue from last documented step

### **Session Handoffs:**
1. Update progress in current session notes
2. Document any changes or discoveries
3. Update overall task status
4. Note next steps for continuation

## 📝 Documentation Standards

### **File Naming:**
- Use descriptive, searchable names
- Include dates and version numbers where relevant
- Maintain consistent formatting

### **Content Guidelines:**
- **Context-Complete**: Each file should be self-contained
- **Technical Precision**: Include exact file paths, line numbers, code snippets
- **Decision Rationale**: Document why decisions were made
- **Safety Protocols**: Include rollback and testing procedures

### **Status Tracking:**
- ✅ **Completed**: Task fully finished and tested
- 🔄 **In Progress**: Currently working on this
- ⏳ **Pending**: Planned but not started
- ⚠️ **Blocked**: Waiting for dependencies or decisions
- 🔴 **Critical**: Urgent attention required

## 🛡️ Safety Benefits

### **Context Continuity:**
- Never lose architectural decisions or plans
- Maintain consistency across sessions
- Prevent starting over when context resets

### **Knowledge Preservation:**
- Document lessons learned and mistakes avoided
- Build institutional knowledge for the project
- Create reusable patterns and templates

### **Risk Mitigation:**
- Always have rollback plans documented
- Maintain safety protocols for complex changes
- Track what's been tested and what hasn't

## 📊 Current Active Tasks

### **2025-01-14: Architectural Decomposition Planning**
- **Status:** 🔄 In Progress
- **Goal:** Plan safe decomposition of monolithic core components
- **Components:** AdminLifeLock, TabLayoutWrapper, TaskContainer, etc.
- **Next:** Complete decomposition plans for all components

## 🎯 Best Practices

### **Before Starting Work:**
1. Read relevant task documentation
2. Understand current state and constraints  
3. Check for any blocking issues or dependencies
4. Plan incremental steps with testing

### **During Work:**
1. Document decisions and changes in real-time
2. Update progress regularly
3. Note any discoveries or issues
4. Maintain safety protocols

### **After Work:**
1. Summarize what was accomplished
2. Document any changes to plans or approach
3. Note next steps clearly
4. Update overall task status

## 🔗 Integration with Development

### **Git Integration:**
- Task folders are version-controlled with the code
- Changes to plans are tracked alongside code changes
- Branch strategies align with task documentation

### **Claude Code Integration:**
- Documentation supports Claude's development workflow
- File paths and technical details enable quick context restoration
- Safety protocols align with Claude's best practices

---

*This system ensures no complex architectural work is ever lost to context limits, enabling consistent, safe, and well-documented development across multiple sessions.*