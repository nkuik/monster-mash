# Orchestrator Contracts

**Agent**: Orchestrator (Swarm Coordinator)  
**Role**: Coordinates all agents, manages workflow, conducts voting

---

## 1. Initialize Party Planning Session

**Endpoint**: `POST /agents/orchestrator/message`  
**From**: User/CLI → Orchestrator  
**Purpose**: Start a new party planning session

### Request

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Plan a Halloween party for 50 guests on October 31st with a budget of $500"
        },
        {
          "kind": "data",
          "data": {
            "action": "initialize_planning",
            "partyDetails": {
              "targetDate": "2025-10-31T19:00:00Z",
              "estimatedGuestCount": 50,
              "budget": {
                "total": 500,
                "currency": "USD"
              },
              "preferences": {
                "theme": "halloween",
                "dietary": ["vegetarian-friendly"],
                "venueType": "home"
              }
            }
          }
        }
      ],
      "messageId": "msg-init-001",
      "contextId": "session-uuid-123"
    },
    "configuration": {
      "blocking": true,
      "historyLength": 0
    }
  }
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "result": {
    "id": "task-init-001",
    "contextId": "session-uuid-123",
    "status": {
      "state": "completed",
      "message": {
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "Party planning session initialized. Coordinating with 6 agents..."
          }
        ],
        "messageId": "msg-init-response-001"
      },
      "timestamp": "2025-01-16T10:00:00Z"
    },
    "artifacts": [
      {
        "artifactId": "party-plan-artifact-001",
        "name": "initial-party-plan",
        "parts": [
          {
            "kind": "data",
            "data": {
              "partyPlanId": "plan-uuid-456",
              "status": "initiated",
              "assignedAgents": [
                { "agentId": "theme-decider-1", "status": "idle" },
                { "agentId": "food-planner-1", "status": "idle" },
                { "agentId": "contact-manager-1", "status": "idle" },
                { "agentId": "decorator-1", "status": "idle" },
                { "agentId": "purchaser-1", "status": "idle" },
                { "agentId": "dj-playlist-1", "status": "idle" }
              ]
            }
          }
        ]
      }
    ],
    "kind": "task"
  }
}
```

---

## 2. Request Verbalized Sampling from Agent

**Endpoint**: `POST /agents/{agentId}/message`  
**From**: Orchestrator → Specific Agent  
**Purpose**: Request agent to generate multiple options

### Request (to Theme Decider)

```json
{
  "jsonrpc": "2.0",
  "id": "req-002",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Generate 3 theme options for the Halloween party"
        },
        {
          "kind": "data",
          "data": {
            "action": "verbalized_sampling",
            "partyPlanId": "plan-uuid-456",
            "context": {
              "partyType": "halloween",
              "guestCount": 50,
              "budget": { "total": 500, "currency": "USD" },
              "constraints": ["family-friendly", "indoor"]
            },
            "samplingCount": 3
          }
        }
      ],
      "messageId": "msg-theme-sampling-001",
      "contextId": "session-uuid-123"
    },
    "configuration": {
      "blocking": false
    }
  }
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "id": "req-002",
  "result": {
    "id": "task-theme-sampling-001",
    "contextId": "session-uuid-123",
    "status": {
      "state": "working",
      "timestamp": "2025-01-16T10:00:30Z"
    },
    "kind": "task"
  }
}
```

### Poll for Completion (tasks/get)

```json
{
  "jsonrpc": "2.0",
  "id": "req-003",
  "method": "tasks/get",
  "params": {
    "id": "task-theme-sampling-001",
    "historyLength": 1
  }
}
```

### Completed Response

```json
{
  "jsonrpc": "2.0",
  "id": "req-003",
  "result": {
    "id": "task-theme-sampling-001",
    "contextId": "session-uuid-123",
    "status": {
      "state": "completed",
      "timestamp": "2025-01-16T10:01:00Z"
    },
    "artifacts": [
      {
        "artifactId": "theme-sampling-output-001",
        "name": "theme-options",
        "parts": [
          {
            "kind": "data",
            "data": {
              "samplingOutputId": "sampling-theme-001",
              "agentId": "theme-decider-1",
              "options": [
                {
                  "optionId": "theme-opt-1",
                  "proposal": {
                    "name": "Spooky Gothic",
                    "description": "Dark, elegant with candles and Victorian elements",
                    "colorScheme": ["#000000", "#8B0000", "#4B0082"],
                    "style": "gothic"
                  },
                  "rationale": "Classic Halloween with sophisticated edge, budget-friendly",
                  "confidenceScore": 0.85,
                  "estimatedCost": 200
                },
                {
                  "optionId": "theme-opt-2",
                  "proposal": {
                    "name": "Playful Pumpkin Patch",
                    "description": "Bright oranges, hay bales, family-friendly",
                    "colorScheme": ["#FF7518", "#FFD700", "#8B4513"],
                    "style": "playful"
                  },
                  "rationale": "Great for families, easy decorations, outdoor-inspired",
                  "confidenceScore": 0.78,
                  "estimatedCost": 150
                },
                {
                  "optionId": "theme-opt-3",
                  "proposal": {
                    "name": "Haunted Mansion",
                    "description": "Cobwebs, fog machines, spooky lighting",
                    "colorScheme": ["#2F4F4F", "#696969", "#C0C0C0"],
                    "style": "spooky"
                  },
                  "rationale": "Immersive experience, dramatic impact",
                  "confidenceScore": 0.72,
                  "estimatedCost": 300
                }
              ]
            }
          }
        ]
      }
    ],
    "kind": "task"
  }
}
```

---

## 3. Broadcast Options for Feedback

**Endpoint**: `POST /agents/{agentId}/message`  
**From**: Orchestrator → Multiple Agents  
**Purpose**: Get feedback from other agents on proposed options

### Request (to Decorator)

```json
{
  "jsonrpc": "2.0",
  "id": "req-004",
  "method": "message/send",
  "params": {
    "message": {
      "role": "agent",
      "parts": [
        {
          "kind": "text",
          "text": "Review these theme options and provide feedback from decoration perspective"
        },
        {
          "kind": "data",
          "data": {
            "action": "provide_feedback",
            "samplingOutputId": "sampling-theme-001",
            "options": [
              {
                "optionId": "theme-opt-1",
                "proposal": {
                  "name": "Spooky Gothic",
                  "colorScheme": ["#000000", "#8B0000"]
                }
              }
            ]
          }
        }
      ],
      "messageId": "msg-theme-feedback-req-001",
      "contextId": "session-uuid-123"
    }
  }
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "id": "req-004",
  "result": {
    "id": "task-feedback-001",
    "contextId": "session-uuid-123",
    "status": {
      "state": "completed",
      "timestamp": "2025-01-16T10:01:30Z"
    },
    "artifacts": [
      {
        "artifactId": "feedback-artifact-001",
        "parts": [
          {
            "kind": "data",
            "data": {
              "feedbackList": [
                {
                  "feedbackId": "fb-001",
                  "fromAgentId": "decorator-1",
                  "targetOptionId": "theme-opt-1",
                  "score": 5,
                  "comments": "Excellent for decorating! Black and red drapes, candles, easy to source.",
                  "estimatedDecorationCost": 180
                },
                {
                  "feedbackId": "fb-002",
                  "fromAgentId": "decorator-1",
                  "targetOptionId": "theme-opt-2",
                  "score": 4,
                  "comments": "Good for families, need lots of pumpkins and hay. May be pricey.",
                  "estimatedDecorationCost": 220
                }
              ]
            }
          }
        ]
      }
    ],
    "kind": "task"
  }
}
```

---

## 4. Conduct Consensus Vote

**Endpoint**: `POST /agents/{agentId}/message`  
**From**: Orchestrator → All Agents  
**Purpose**: Vote on final selection

### Request

```json
{
  "jsonrpc": "2.0",
  "id": "req-005",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Cast your vote on the theme selection"
        },
        {
          "kind": "data",
          "data": {
            "action": "consensus_vote",
            "voteId": "vote-theme-001",
            "topic": "Final theme selection",
            "proposal": {
              "type": "theme",
              "optionId": "theme-opt-1",
              "data": { "name": "Spooky Gothic" }
            },
            "votingDeadline": "2025-01-16T10:05:00Z"
          }
        }
      ],
      "messageId": "msg-vote-req-001",
      "contextId": "session-uuid-123"
    }
  }
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "id": "req-005",
  "result": {
    "id": "task-vote-001",
    "contextId": "session-uuid-123",
    "status": {
      "state": "completed",
      "timestamp": "2025-01-16T10:02:00Z"
    },
    "artifacts": [
      {
        "artifactId": "vote-artifact-001",
        "parts": [
          {
            "kind": "data",
            "data": {
              "vote": {
                "agentId": "food-planner-1",
                "decision": "approve",
                "rationale": "Gothic theme pairs well with dark desserts and elegant appetizers",
                "weight": 1.0,
                "castAt": "2025-01-16T10:01:50Z"
              }
            }
          }
        ]
      }
    ],
    "kind": "task"
  }
}
```

---

## 5. Aggregate Vote Results

**Internal**: Orchestrator aggregates all votes

### Vote Tally

```typescript
interface VoteTally {
  voteId: string;
  totalVotes: number;
  approvals: number;
  rejections: number;
  abstentions: number;
  outcome: "approved" | "rejected" | "tie";
  votes: Vote[];
}
```

**Example**:

```json
{
  "voteId": "vote-theme-001",
  "totalVotes": 6,
  "approvals": 5,
  "rejections": 0,
  "abstentions": 1,
  "outcome": "approved",
  "votes": [
    { "agentId": "food-planner-1", "decision": "approve" },
    { "agentId": "theme-decider-1", "decision": "approve" },
    { "agentId": "contact-manager-1", "decision": "abstain" },
    { "agentId": "decorator-1", "decision": "approve" },
    { "agentId": "purchaser-1", "decision": "approve" },
    { "agentId": "dj-playlist-1", "decision": "approve" }
  ]
}
```

---

## 6. Assign Task to Agent

**Endpoint**: `POST /agents/{agentId}/message`  
**From**: Orchestrator → Specific Agent  
**Purpose**: Assign specific task based on planning progress

### Request (to Purchaser)

```json
{
  "jsonrpc": "2.0",
  "id": "req-006",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Create a purchase list for approved decorations and food items"
        },
        {
          "kind": "data",
          "data": {
            "action": "create_purchase_list",
            "partyPlanId": "plan-uuid-456",
            "decorations": [...],
            "menuItems": [...],
            "budget": { "remaining": 350, "currency": "USD" }
          }
        }
      ],
      "messageId": "msg-purchase-req-001",
      "contextId": "session-uuid-123"
    }
  }
}
```

### Response

```json
{
  "jsonrpc": "2.0",
  "id": "req-006",
  "result": {
    "id": "task-purchase-001",
    "contextId": "session-uuid-123",
    "status": {
      "state": "completed",
      "timestamp": "2025-01-16T10:03:00Z"
    },
    "artifacts": [
      {
        "artifactId": "purchase-list-001",
        "parts": [
          {
            "kind": "data",
            "data": {
              "purchaseItems": [
                {
                  "id": "item-001",
                  "name": "Black tablecloths (3)",
                  "category": "decoration",
                  "quantity": 3,
                  "unitPrice": 15,
                  "totalPrice": 45,
                  "vendor": "Party City",
                  "priority": "high"
                }
              ]
            }
          }
        ]
      }
    ],
    "kind": "task"
  }
}
```

---

## Error Handling

### Agent Timeout

```json
{
  "jsonrpc": "2.0",
  "id": "req-007",
  "error": {
    "code": -32603,
    "message": "Agent timeout",
    "data": {
      "agentId": "theme-decider-1",
      "reason": "No response within 30 seconds",
      "retryable": true,
      "fallbackAction": "use_default_theme"
    }
  }
}
```

### Invalid Request

```json
{
  "jsonrpc": "2.0",
  "id": "req-008",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      "field": "samplingCount",
      "error": "Must be between 2 and 5, got 1"
    }
  }
}
```

---

## Testing

### Integration Tests

Located in `tests/integration/orchestrator-contracts.test.ts`:

- ✅ Initialize planning session
- ✅ Request verbalized sampling from all agent types
- ✅ Broadcast feedback requests
- ✅ Conduct consensus votes
- ✅ Aggregate vote results correctly
- ✅ Handle agent timeouts gracefully
- ✅ Validate all request/response schemas

---

**Date**: 2025-01-16
**Status**: ✅ Orchestrator Contracts Complete
