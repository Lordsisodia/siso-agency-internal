# Workflow Memory

This folder contains **WorkflowMemory** - workflow execution records and templates.

## Structure

```
workflows/
├── active/              # Currently running workflows
│   └── {workflow-id}/
│       ├── workflow.json      # Workflow definition
│       ├── state.json         # Current state
│       └── context/           # Workflow context
│
└── history/             # Past workflow executions
    ├── {workflow-id}/
    │   ├── execution.json     # Execution record
    │   ├── artifacts/         # Generated artifacts
    │   └── metrics/           # Performance metrics
    └── templates/            # Reusable workflow templates
        └── {workflow-name}/
            ├── template.json
            └── usage-stats.json
```

## Usage

### Creating a Workflow

Define workflow in `active/{workflow-id}/workflow.json`:

```json
{
  "workflow_id": "",
  "name": "",
  "description": "",
  "steps": [
    {
      "step": 1,
      "name": "",
      "agent": "",
      "inputs": {}
    }
  ]
}
```

### Recording Execution

When workflow completes, save to `history/`:

```json
{
  "workflow_id": "",
  "execution_id": "",
  "start_time": "",
  "end_time": "",
  "status": "completed",
  "steps_executed": [],
  "artifacts": [],
  "metrics": {
    "duration": 0,
    "success": true
  }
}
```
