# Ralphy Execution Data

This directory stores Ralphy autonomous execution data for the SISO Internal project.

## Contents

- `progress.txt` - Task progress tracking
- `config.yaml` - Ralphy configuration
- `sessions/` - Execution session data
- `logs/` - Execution logs

## Integration

Ralphy (`.blackbox5/2-engine/07-operations/runtime/ralphy/`) is configured to store its execution data here instead of in the local `.ralphy/` directory.

This ensures:
- All project data is centralized in Project Memory
- Execution history is tracked alongside other operations
- Easy access for agents to review Ralphy sessions

## See Also

- Ralphy Integration: `.blackbox5/2-engine/07-operations/runtime/ralphy/README-BB5.md`
- Operations README: `../README.md`
