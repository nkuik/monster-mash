# Agent Communication Contracts

**Branch**: `001-a2a-party-framework` | **Date**: 2025-01-16
**Phase**: 1 - Design

## Overview

This directory defines the A2A protocol message contracts for inter-agent communication in Monster Mash. Each file specifies the request/response formats for agent-to-agent interactions using JSON-RPC 2.0 over HTTP.

## Contract Files

1. **[orchestrator-contracts.md](./orchestrator-contracts.md)** - Orchestrator → Agent messages (task assignment, voting requests)
2. **[food-planner-contracts.md](./food-planner-contracts.md)** - Food Planner specific interactions
3. **[theme-decider-contracts.md](./theme-decider-contracts.md)** - Theme Decider specific interactions
4. **[contact-manager-contracts.md](./contact-manager-contracts.md)** - Contact Manager specific interactions
5. **[decorator-contracts.md](./decorator-contracts.md)** - Decorator specific interactions
6. **[purchaser-contracts.md](./purchaser-contracts.md)** - Purchaser specific interactions
7. **[dj-playlist-contracts.md](./dj-playlist-contracts.md)** - DJ/Playlist specific interactions
8. **[consensus-contracts.md](./consensus-contracts.md)** - Voting and consensus protocols

## A2A Protocol Foundation

All contracts follow A2A protocol specification:

- **Transport**: JSON-RPC 2.0 over HTTP/HTTPS
- **Methods**: `message/send`, `tasks/get`, `tasks/cancel`
- **Message Format**: `{ role, parts[], messageId, taskId?, contextId? }`
- **Parts Types**: `TextPart`, `DataPart`, `FilePart`

### Standard A2A Message Envelope

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [...],
      "messageId": "uuid",
      "taskId": "uuid-if-continuing",
      "contextId": "session-context-uuid"
    },
    "configuration": {
      "blocking": false,
      "historyLength": 5
    }
  }
}
```

### Standard A2A Response

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "id": "task-uuid",
    "contextId": "session-context-uuid",
    "status": {
      "state": "completed",
      "timestamp": "2025-01-16T10:00:00Z"
    },
    "artifacts": [...],
    "kind": "task"
  }
}
```

## Common Patterns

### Pattern 1: Request Verbalized Sampling

**From**: Orchestrator → Agent  
**Purpose**: Ask agent to generate multiple options

```json
{
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Generate 3 theme options for a Halloween party with 50 guests"
        },
        {
          "kind": "data",
          "data": {
            "action": "verbalized_sampling",
            "context": {
              "partyType": "halloween",
              "guestCount": 50,
              "budget": { "total": 500, "currency": "USD" }
            },
            "samplingCount": 3
          }
        }
      ],
      "messageId": "msg-uuid",
      "contextId": "session-uuid"
    }
  }
}
```

**Response**: Task with artifact containing `VerbalizeSamplingOutput`

---

### Pattern 2: Request Feedback on Options

**From**: Agent A → Agent B  
**Purpose**: Get feedback on proposed options

```json
{
  "method": "message/send",
  "params": {
    "message": {
      "role": "agent",
      "parts": [
        {
          "kind": "text",
          "text": "Please review these theme options and provide feedback"
        },
        {
          "kind": "data",
          "data": {
            "action": "provide_feedback",
            "samplingOutputId": "sampling-uuid",
            "options": [
              {
                "optionId": "opt-1",
                "proposal": {
                  "name": "Spooky Gothic",
                  "colorScheme": ["#000000", "#8B0000"]
                },
                "rationale": "Classic Halloween aesthetic"
              }
            ]
          }
        }
      ],
      "messageId": "msg-uuid",
      "contextId": "session-uuid"
    }
  }
}
```

**Response**: Task with artifact containing `AgentFeedback[]`

---

### Pattern 3: Consensus Vote Request

**From**: Orchestrator → All Agents  
**Purpose**: Conduct voting on a proposal

```json
{
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Cast your vote on the selected theme"
        },
        {
          "kind": "data",
          "data": {
            "action": "consensus_vote",
            "voteId": "vote-uuid",
            "topic": "Final theme selection",
            "proposal": {
              "type": "theme",
              "id": "theme-uuid",
              "name": "Spooky Gothic"
            },
            "votingDeadline": "2025-01-16T10:05:00Z"
          }
        }
      ],
      "messageId": "msg-uuid",
      "contextId": "session-uuid"
    }
  }
}
```

**Response**: Task with artifact containing `Vote`

---

### Pattern 4: Task Assignment

**From**: Orchestrator → Agent  
**Purpose**: Assign specific task to agent

```json
{
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Create a shopping list for approved decorations"
        },
        {
          "kind": "data",
          "data": {
            "action": "create_purchase_list",
            "context": {
              "decorations": [...],
              "themeId": "theme-uuid"
            }
          }
        }
      ],
      "messageId": "msg-uuid",
      "contextId": "session-uuid"
    }
  }
}
```

**Response**: Task with artifact containing `PurchaseItem[]`

---

## Error Handling

All agents must handle A2A standard errors:

```json
{
  "jsonrpc": "2.0",
  "id": "request-id",
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": {
      "agentId": "theme-decider-1",
      "reason": "Failed to generate theme options",
      "retryable": true
    }
  }
}
```

**Standard Error Codes**:

- `-32700`: Parse error (invalid JSON)
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32001`: Task not found (A2A-specific)

---

## Testing Contracts

Each contract file includes:

1. **Request/Response Examples**: JSON snippets for each interaction
2. **Validation Rules**: What constitutes a valid message
3. **Error Cases**: Expected error responses
4. **Integration Tests**: References to test files

---

## Next Steps

1. Create individual contract files for each agent type
2. Define validation schemas using Zod
3. Implement contract tests in `tests/integration/`

---

**Date**: 2025-01-16
**Status**: ✅ Contracts Overview Complete - Ready for Individual Contract Files
