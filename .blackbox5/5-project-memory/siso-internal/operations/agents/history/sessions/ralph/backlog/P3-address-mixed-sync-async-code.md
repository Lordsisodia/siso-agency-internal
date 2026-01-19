# P3: Address Mixed Sync/Async Code in Vibe Kanban

**Priority:** P3 (MEDIUM)
**Source:** ANALYSIS-VIBE-PERFORMANCE.md
**Found:** 2026-01-18 15:20:10
**Status:** TODO

## Issue

Vibe Kanban has **mixed synchronous and asynchronous code** throughout the codebase (635 out of 2095 files use async). This inconsistency can lead to performance issues, confusion, and potential bugs.

## Analysis Findings

From `ANALYSIS-VIBE-PERFORMANCE.md`:
```
#### Findings

- **Async Usage**: 635/2095 files use async
⚠️ **WARNING**: Mixed sync/async code. Consider consistency.

- **File I/O**: 401 files perform file operations
- **Subprocess Calls**: 96 files use subprocess
```

## Technical Details

- **Total Python Files:** 2095
- **Async Files:** 635 (30.3%)
- **Sync Files:** 1460 (69.7%)
- **Impact:** MEDIUM - Performance, maintainability, and potential bugs

## Why This Matters

1. **Performance:** Mixing sync/async can block the event loop unexpectedly
2. **Maintainability:** Inconsistent patterns confuse developers
3. **Bugs:** Sync code in async context can cause race conditions
4. **Testing:** Harder to test mixed sync/async code

## Recommended Actions

1. **Audit the codebase** to identify all sync/async boundaries
2. **Choose a strategy:**
   - Option A: Make everything async (recommended for I/O-heavy operations)
   - Option B: Separate sync/async boundaries clearly
3. **Refactor systematically:**
   - Start with I/O operations (401 files)
   - Address subprocess calls (96 files)
   - Ensure proper async/await usage
4. **Add guidelines** for when to use sync vs async
5. **Update documentation** with patterns and best practices

## Acceptance Criteria

- [ ] Codebase audit completed
- [ ] Sync/async strategy documented
- [ ] Critical I/O operations refactored
- [ ] Subprocess calls made async where appropriate
- [ ] Development guidelines created
- [ ] Documentation updated

## Related Analysis

- `ANALYSIS-VIBE-PERFORMANCE.md` - Performance analysis

## Additional Notes

This is a larger refactoring effort. Consider:
- Breaking into smaller, incremental PRs
- Starting with high-traffic I/O paths
- Adding linting rules to prevent future mixing
- Training team on async/await best practices
