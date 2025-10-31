# Phase 0: Research - A2A Party Planning Framework

**Branch**: `001-a2a-party-framework` | **Date**: 2025-01-16
**Purpose**: Resolve technical uncertainties and establish implementation approach

## Research Questions & Findings

### 1. A2A Protocol Integration

**Question**: How do we implement A2A protocol JSON-RPC 2.0 communication between TypeScript agents?

**Research Findings**:

- **A2A Protocol Specification**: <https://a2a-protocol.org/latest/specification/>

  - Uses JSON-RPC 2.0 over HTTP/HTTPS as primary transport
  - Core methods: `message/send`, `message/stream`, `tasks/get`, `tasks/cancel`
  - Agent discovery via AgentCard (JSON metadata document)
  - Task lifecycle: submitted → working → completed/failed/canceled
  - Messages contain `role` (user/agent) and `parts` (TextPart, FilePart, DataPart)

- **Reference Implementation**: <https://github.com/a2aproject/A2A>
  - TypeScript types available in `types/src/types.ts`
  - Python SDK available for reference patterns
  - AgentCard structure defines agent capabilities, skills, authentication

**Decision**: Use A2A protocol SDK types directly. Implement lightweight JSON-RPC client for inter-agent HTTP communication. Each agent exposes HTTP endpoint for receiving messages.

**Open Questions**: None - spec is comprehensive

---

### 2. Agent Personality Implementation

**Question**: How do we represent agent "personalities" that influence decision-making?

**Research Findings**:

- Constitution principle: "AI-Friendly Code" suggests explicit types over clever abstractions
- Personality affects verbalized sampling options and negotiation preferences
- From spec: "Theme Decider might be 'enthusiastic,' 'minimalist,' or 'traditional'"

**Decision**: Define `AgentPersonality` interface with traits:

```typescript
interface AgentPersonality {
  style: string; // e.g., "enthusiastic", "minimalist", "traditional"
  priorityWeights: {
    // Influences decision scoring
    cost: number;
    quality: number;
    convenience: number;
    novelty: number;
  };
  verbalizedSamplingCount: number; // How many options to generate (2-5)
  consensusBias: "majority" | "quality" | "cost"; // Voting preference
}
```

Each agent type has personality presets (configurable via constructor).

---

### 3. Verbalized Sampling Implementation

**Question**: What's the data flow for verbalized sampling (exploring multiple options before commitment)?

**Research Findings**:

- From spec FR-015: "Generate at least 2-3 distinct options with rationales"
- FR-016: "Present options to other relevant agents for feedback"
- FR-017: "Revise options based on feedback before final selection"

**Decision**: Implement as 3-phase workflow:

1. **Generation Phase**: Agent generates N options (2-5 based on personality)

   - Each option includes: proposal, rationale, confidence score
   - Stored as `VerbalizeSamplingOutput` in A2A message parts

2. **Feedback Phase**: Broadcast options to relevant agents

   - Use A2A `message/send` with `DataPart` containing options
   - Agents respond with feedback (scores, concerns, suggestions)
   - Collect responses via polling `tasks/get`

3. **Revision Phase**: Original agent revises based on feedback
   - Adjusts scores, eliminates low-rated options, generates new ones if needed
   - Final selection uses weighted voting from all agent feedback

**Open Questions**: Should feedback be synchronous (blocking) or async? → Start with async to allow concurrent feedback.

---

### 4. Consensus Mechanism (Simple Majority Voting)

**Question**: How do agents reach consensus when they disagree?

**Research Findings**:

- From clarifications: "Simple majority voting - each agent gets one equal vote"
- SC-007: "80% of consensus decisions reached within reasonable time"
- FR-024: "Provide vote with rationale when prompted"

**Decision**: Implement `ConsensusOrchestrator` class:

```typescript
class ConsensusOrchestrator {
  async conductVote(
    proposal: Proposal,
    votingAgents: Agent[]
  ): Promise<VoteResult> {
    // 1. Send proposal to all agents via A2A message/send
    // 2. Collect votes (approve/reject + rationale) with timeout
    // 3. Calculate result: >50% approval = passed
    // 4. If tie, use tiebreaker (e.g., party host's implicit preference)
    // 5. Return result with vote breakdown
  }
}
```

Vote timeout: 30 seconds per agent (configurable). If agent doesn't respond, count as abstain.

---

### 5. CLI Real-Time Observation

**Question**: How do users observe agent negotiations in real-time via terminal output?

**Research Findings**:

- From clarifications: "CLI interface with terminal output for logs and text-based prompts"
- SC-012: "Users can observe agent discussions in real-time"

**Decision**: Implement structured logging with verbosity levels:

```typescript
enum LogLevel {
  DEBUG, // All A2A messages
  INFO, // Agent decisions and negotiations
  SUMMARY, // Only final outcomes
}

class PlanningObserver {
  logAgentMessage(agent: string, message: string, level: LogLevel): void;
  logNegotiation(topic: string, participants: Agent[], round: number): void;
  logVote(proposal: string, votes: Vote[]): void;
}
```

CLI command: `monster-mash observe --session <id> --verbose`

Use ANSI colors for agent identification (each agent gets unique color).

---

### 6. MCP Integration for External Data

**Question**: How do agents access external data (e.g., price info, venue availability) using MCP?

**Research Findings**:

- Model Context Protocol (MCP): <https://modelcontextprotocol.io/>
- Provides standardized tool/resource access for AI agents
- From spec: "Read-only access to publicly available data (no authentication)"

**Decision**: Implement `MCPToolProvider` class:

```typescript
class MCPToolProvider {
  // Register MCP tools for each agent type
  registerTool(agentType: string, tool: MCPTool): void;

  // Agents call tools via MCP protocol
  async invokeTool(toolName: string, params: any): Promise<any>;
}

// Example tools:
// - getPriceEstimate(item: string, quantity: number)
// - searchVenues(location: string, capacity: number)
// - getSongsByGenre(genre: string, limit: number)
```

Each agent can access relevant tools based on their AgentCard skills.

---

### 7. Local Persistence Strategy

**Question**: What's the JSON/YAML structure for persisting party plan state?

**Research Findings**:

- From clarifications: "Local file system using JSON or YAML format"
- Need to store: PartyPlan, agent states, communication history

**Decision**: File structure per planning session:

```text
~/.monster-mash/sessions/<session-id>/
├── party-plan.json          # PartyPlan aggregate root
├── agents/
│   ├── food-planner.json   # Agent-specific state
│   ├── theme-decider.json
│   └── ...
├── communication-log.jsonl  # Line-delimited JSON for messages
└── votes/
    └── <vote-id>.json      # Vote records with rationales
```

`PartyPlan` schema matches 11 entities from spec (nested JSON structure).

---

### 8. Error Handling for Agent Failures

**Question**: What happens if an agent crashes or times out during planning?

**Research Findings**:

- From edge cases: "Agent failure mid-planning - system continues with remaining agents"
- A2A protocol has TaskState: `failed`, `canceled`

**Decision**: Implement graceful degradation:

1. **Timeout Detection**: Each agent operation has timeout (5-30s depending on task)
2. **Retry Logic**: Retry once with exponential backoff before marking failed
3. **Fallback Behavior**:
   - If Food Planner fails → use pre-defined menu templates
   - If Theme Decider fails → use default theme voted by other agents
   - If Contact Manager fails → party host provides guest list manually
4. **User Notification**: CLI shows warning and degraded mode status

**Implementation**: `AgentSupervisor` class monitors agent health and orchestrates fallbacks.

---

## Technology Decisions

### Core Stack

- **Runtime**: Node.js v20+ LTS
- **Language**: TypeScript 5.3+
- **Package Manager**: pnpm (fast, efficient, better than npm for monorepo-style structure)
- **CLI Framework**: Commander.js (simple, well-documented, no unnecessary features)
- **Testing**: Vitest (fast, ESM-native, better DX than Jest for TypeScript)
- **A2A Protocol**: Custom implementation using `@a2aproject/types` for TypeScript definitions
- **HTTP Client**: node-fetch or native fetch (Node 18+) for A2A JSON-RPC calls
- **Logging**: Winston or Pino (structured logging with levels)
- **Validation**: Zod (TypeScript-first schema validation, works with A2A message parts)

### Development Tools

- **Build Tool**: tsx for direct execution, esbuild for bundling (if needed)
- **Linter**: ESLint with TypeScript plugin
- **Formatter**: Prettier (per constitution: AI-friendly code = consistent formatting)
- **Git Hooks**: Husky + lint-staged (run linter before commit)

---

## Implementation Strategy

### Phase 1: Minimal Viable Swarm (Week 1-2)

1. **Setup**: Project scaffolding, tsconfig, package.json, basic folder structure
2. **BaseAgent**: Abstract class implementing A2A AgentCard + JSON-RPC endpoint
3. **Simple Orchestrator**: Start 2 agents (Theme + Food), coordinate basic decision
4. **File Storage**: Save/load PartyPlan JSON
5. **CLI Skeleton**: `monster-mash plan --theme halloween` command

**Success Criteria**: Two agents exchange A2A messages and agree on a theme + menu.

---

### Phase 2: Full Agent Suite (Week 3-4)

1. Implement remaining 4 agents (Contact, Decorator, Purchaser, DJ)
2. Verbalized sampling for each agent type
3. Consensus voting with rationale
4. CLI observation mode (`monster-mash observe`)

**Success Criteria**: All 6 agents negotiate and produce complete party plan.

---

### Phase 3: Robustness & Edge Cases (Week 5)

1. Agent failure handling and fallbacks
2. Concurrent session support (10 sessions)
3. MCP tool integration for external data
4. Performance optimization (sub-30s for full plan)

**Success Criteria**: Pass all 19 success criteria from spec.

---

## Open Questions for Phase 1

1. **Agent Hosting**: Should each agent run in separate process or single process with routing?

   - **Recommendation**: Start single process, separate HTTP routes per agent. Easier debugging.

2. **A2A Transport**: Should we implement streaming (`message/stream`) or just basic (`message/send`)?

   - **Recommendation**: Start with `message/send` (synchronous). Add streaming in Phase 3 if needed.

3. **Personality Configuration**: Should personalities be JSON config files or TypeScript classes?
   - **Recommendation**: TypeScript classes with JSON overrides. More type-safe, easier to test.

---

## Next Steps (Phase 1 Design)

After approval of this research:

1. Generate `data-model.md` - Define TypeScript interfaces for 11 entities
2. Generate `contracts/` - Define A2A message schemas for inter-agent communication
3. Generate `quickstart.md` - Setup instructions for local development
4. Proceed to Phase 2 implementation planning (tasks breakdown)

---

## References

- A2A Protocol Specification: <https://a2a-protocol.org/latest/specification/>
- A2A GitHub Repository: <https://github.com/a2aproject/A2A>
- Model Context Protocol: <https://modelcontextprotocol.io/>
- TypeScript Best Practices: <https://typescript-eslint.io/docs/>
- Commander.js CLI Framework: <https://github.com/tj/commander.js>

---

**Approval Required**: Review this research document before proceeding to Phase 1 design.

**Date**: 2025-01-16
**Status**: ✅ Research Complete - Ready for Phase 1 Design
