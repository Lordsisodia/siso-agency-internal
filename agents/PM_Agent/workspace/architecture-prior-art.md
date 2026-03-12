# SISO Tasks CLI - Architecture Document

## Section 5: Prior Art — Open Source SQLite + CLI Task Trackers

Based on web research into the open-source ecosystem for Claude Code/LLM agent task management:

### Stoneforge (stoneforge-ai/stoneforge)
- **Architecture**: Open-source orchestrator for running multiple Claude Code agents in parallel
- **Key Decision**: Abandoned flat-files entirely
- **Storage**: SQLite + JSONL for event sourcing
- **Rationale**: Prevents agents from hallucinating state across sessions

### SQLite Agent (sqliteai/sqlite-agent)
- **Architecture**: Embeds autonomous agent capabilities directly over SQLite
- **Key Decision**: Agents execute multi-step tasks natively in the database
- **Storage**: SQLite as the primary execution environment

### Open Horizon CLI Agent (rohittcodes/cli-agent)
- **Architecture**: CLI-based agent with persistent activity logging
- **Key Decision**: SQLite explicitly for activity logging and persistent audit trails
- **Rationale**: Reading back gigabytes of text logs was too expensive and slow

### Counter-Example: Flat Markdown Files (fxstein/ai-todo)
- **Issue**: Explicitly notes they cannot handle parallel execution well due to race conditions

---

## Conclusion

Building `siso-tasks.db` with SQLite directly aligns with bleeding-edge industry best practices:
- Zero-cost local storage
- ACID compliance for parallel execution
- Efficient audit trails without text log bloat
- Industry-validated approach across multiple open-source projects
