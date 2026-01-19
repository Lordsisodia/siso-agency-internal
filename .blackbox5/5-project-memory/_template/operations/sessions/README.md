# Session Management

This folder contains **Session Records** - transcripts and context from agent sessions.

## Structure

```
sessions/
└── {session-id}/
    ├── transcript.json    # Full conversation transcript
    ├── context.json       # Session context
    └── metrics.json       # Session metrics
```

## Purpose

Sessions provide:

### Transcript
- Complete conversation history
- User inputs and agent responses
- Tool calls and results

### Context
- What was being worked on
- What constraints were given
- What outcomes were achieved

### Metrics
- Session duration
- Tools used
- Success/failure status

## Usage

Create a new session for each major interaction:

```json
{
  "session_id": "session-{timestamp}",
  "start_time": "",
  "end_time": "",
  "agent": "",
  "task": "",
  "transcript": [],
  "outcome": ""
}
```
