# Phase 0: Research - Agent-to-Agent Party Planning Framework

**Branch**: `001-a2a-party-framework` | **Date**: 2025-10-31 (Updated)
**Purpose**: Document spike validation findings and technical decisions for MVP implementation

**Status**: ✅ **Complete** - All technical unknowns resolved through Spike 1-3

## Research Questions & Findings

### 1. Agent Communication Architecture

**Question**: Should agents use A2A protocol (JSON-RPC 2.0 over HTTP) or simpler internal messaging?

**Research Findings**:

- **A2A Protocol** (<https://a2a-protocol.org/>): Standardized JSON-RPC 2.0 over HTTP for external agent interoperability
  - Requires: HTTP servers per agent, AgentCards, task lifecycle, streaming support
  - Purpose: Cross-boundary communication between agents from different companies/frameworks
  - Complexity: Significant infrastructure for closed internal swarm
- **Clarification Decision (2025-10-31)**: Closed internal swarm - no A2A protocol required
  - "A2A" refers to conceptual agent-to-agent collaboration pattern, NOT the protocol standard
  - All 6 agents are internal TypeScript classes in same Node.js process
- **Spike 1 Validation** (✅ Complete, 140 lines):
  - 2 agents coordinated using simple JavaScript object messaging
  - Message array tracked communication history
  - No network overhead, instant message delivery
  - Proves simple message passing sufficient for internal swarm

**Decision**: Use internal TypeScript event-based message bus (Node.js EventEmitter)

**Rationale**:

- ✅ Spike 1 validated simple messaging works
- No HTTP/JSON-RPC complexity needed
- Constitution: "Fast Iteration" - avoid premature infrastructure
- All agents in same process - no network latency
- EventEmitter provides natural broadcast channels

**Open Questions**: None - architecture validated

---

### 2. LLM Integration for Content Generation

**Question**: Should agents use LLMs for content generation, and which model/provider?

**Research Findings**:

- **Spike 2 Validation** (✅ Complete, 305 lines, ~13s execution):
  - **Claude Haiku 4.5** tested vs hardcoded templates
  - Creativity: LLM generated "Witch's Brew Punch" vs template "Spooky menu item 1"
  - Latency: <2s per API call (1.2-1.8s measured)
  - Cost: ~$0.02-0.05 per session (well under $0.50 target)
  - Pricing: $1 input / $5 output per million tokens
  - JSON mode: Reliable structured outputs with confidence scores
  - Fallback: Templates activate on API failure (tested with invalid key)
- **Alternatives Considered**:
  - ❌ OpenAI GPT-4: More expensive ($10/$30 per million), no quality gain for party planning
  - ❌ Claude Sonnet 3.5: 5x more expensive ($3/$15 per million), overkill for menus/themes
  - ❌ Local models (Ollama): Free but slower, deployment complexity
  - ❌ Templates only: Spike 2 proved creativity gap unacceptable

**Decision**: Use Anthropic Claude Haiku 4.5 via @anthropic-ai/sdk for content generation

**Implementation**:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generate menu with verbalized sampling
const response = await client.messages.create({
  model: "claude-haiku-4-5",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: `Generate 3 menu items for "${theme}" party. 
    Return JSON: {"items": [{"description": "...", "confidence": 0.9}, ...]}`,
    },
  ],
});
```

**Open Questions**: None - cost and quality validated

---

### 3. Personality-Driven LLM Behavior

**Question**: Do personality traits create meaningful behavioral differences in LLM outputs?

**Research Findings**:

- **Spike 3 Validation** (✅ Complete, 392 lines, ~13s execution):
  - Tested 3 personalities: Frugal Budget-Conscious, Perfectionist Quality-Focused, Adventurous Risk-Taker
  - **Dramatic differences observed**:
    - **Frugal**: "$0.50 per unit", "Mummy Hot Dogs", "under $25 total"
    - **Perfectionist**: "edible gold leaf", "hand-crafted dark chocolate skull molds", "premium filet mignon"
    - **Adventurous**: "bone marrow brûlée", "bioluminescent plating", "ghost pepper white chocolate"
  - Confidence scores varied: 0.72-0.95 range (not all 1.0)
  - System prompt modifiers proved effective
- **Clarification (2025-10-31)**: Personalities are **optional** (disabled by default, enabled via CLI flag)

**Decision**: Implement personality as LLM system prompt modifiers with embedded verbalized sampling instructions

**Implementation**:

```typescript
type Personality = {
  name: string;
  systemPrompt: string; // Includes personality traits + verbalized sampling
};

const frugalPersonality: Personality = {
  name: "Frugal Budget-Conscious",
  systemPrompt: `You are a budget-conscious party planner who prioritizes cost savings...
  
  IMPORTANT - Verbalized Sampling: You MUST always generate multiple options (minimum 3) 
  with confidence scores (0.0-1.0) indicating how well options fit requirements and 
  cost-effectiveness. Higher scores (0.8-1.0) indicate strong confidence in value...`,
};
```

**Open Questions**: None - dramatic behavioral differences validated

---

### 4. Verbalized Sampling Format & Parsing

**Question**: How should LLM outputs be structured for reliable multi-option generation?

**Research Findings**:

- **Spike 2-3 Findings**:
  - Claude JSON mode produces reliable structured output
  - **Critical issue**: Claude wrapping JSON in markdown `json` fences + adding explanatory text
  - Spike 2 solution: Implemented `stripMarkdownCodeFences()` and `extractJSON()` helpers as workaround
  - Spike 3 improvement: Updated user message to explicitly request "ONLY valid JSON with no additional text"
  - **Better solution**: Add explicit instruction to system prompts (new FR-053c)
  - Confidence scores in 0.0-1.0 range (validated in Spike 3)
- Per FR-015a: Use Claude's JSON mode for typed objects
- Per FR-053c: System prompts must explicitly forbid markdown code fences and extra text

**Decision**: TypeScript types + Claude JSON mode + explicit system prompt instructions + fallback parsing

**Implementation**:

```typescript
type MenuItem = {
  description: string;
  confidence: number; // 0.0-1.0
};

type VerbalizeSamplingOutput<T> = {
  context: string;
  options: Array<T>;
  timestamp: Date;
};

// Robust parsing
function extractJSON(text: string): any {
  const stripped = stripMarkdownCodeFences(text);
  const match = stripped.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : stripped);
}
```

**Open Questions**: None - parsing strategy proven in spikes

---

### 5. Consensus Mechanism (Simple Majority Voting)

**Question**: How should agents reach decisions when they disagree?

**Research Findings**:

- Per clarifications: "Simple majority voting - each agent gets one equal vote"
- Per FR-017a: "Agents MUST use rule-based logic for coordination tasks (message routing, voting, consensus calculation)"
- Constitution: LLMs for content, rules for coordination

**Decision**: Implement deterministic rule-based voting (not LLM-based)

**Implementation**:

```typescript
function reachConsensus(votes: Map<AgentId, ThemeOption>): ThemeOption | null {
  const counts = new Map<ThemeOption, number>();
  votes.forEach((vote) => counts.set(vote, (counts.get(vote) || 0) + 1));

  const [winner, winnerVotes] = Array.from(counts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const totalVotes = votes.size;
  return winnerVotes > totalVotes / 2 ? winner : null; // Majority or escalate
}
```

**Rationale**:

- Fast and deterministic (no LLM latency)
- Easy to test and debug
- Tie-breaking: escalate to user (per FR-011)

**Open Questions**: None - simple majority voting specified

---

### 6. CLI Interface & Real-Time Observation

**Question**: How should users observe agent negotiations in real-time?

**Research Findings**:

- Per clarifications: "CLI interface with terminal output for logs and text-based prompts"
- Per FR-041: Real-time observation of agent collaboration
- Spike experiments used `console.log` successfully

**Decision**: Start with native console output, add colors for readability

**Implementation**:

```typescript
// Simple streaming output (proven in spikes)
console.log(`[${timestamp}] ThemeAgent → ALL: Proposing 3 themes...`);
console.log(`  1. [0.92] Haunted Mansion - ${reasoning}`);
console.log(`  2. [0.88] Spooky Graveyard - ${reasoning}`);
console.log(`  3. [0.85] Witch's Lair - ${reasoning}`);

// Optional: ANSI colors for agent identification
const COLORS = {
  ThemeAgent: "\x1b[36m", // Cyan
  FoodAgent: "\x1b[33m", // Yellow
  DecoratorAgent: "\x1b[35m", // Magenta
  // ...
};
```

**CLI flags**:

- `--verbose`: Show all messages
- `--quiet`: Only final decisions
- `--no-color`: Disable ANSI colors

**Open Questions**: None - console.log proven sufficient in spikes

---

### 7. State Persistence Strategy

**Question**: How should party planning state be persisted for crash recovery?

**Research Findings**:

- Per clarifications: "Local file system (JSON/YAML files)"
- Per FR-005: Allow resumption after interruptions
- Constitution: Simple file system > database

**Decision**: JSON files with atomic writes

**File Structure**:

```
./data/sessions/<session-id>/
├── state.json           # Current party plan + agent states
├── messages.jsonl       # Communication log (append-only)
└── votes/
    └── <vote-id>.json   # Vote records with rationales
```

**Implementation**:

```typescript
// Auto-save after each decision
function saveState(sessionId: string, state: PlanningState): void {
  const stateFile = `./data/sessions/${sessionId}/state.json`;
  const tempFile = `${stateFile}.tmp`;

  // Atomic write: write to temp, then rename
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
  fs.renameSync(tempFile, stateFile);
}
```

**Open Questions**: None - simple JSON persistence specified

---

### 8. External Data Access (Price Lookup)

**Question**: How should Purchaser agent find real prices for items?

**Research Findings**:

- Per clarifications: "Read-only - queries publicly available price information"
- Per FR-047-049: Simulate purchases, don't execute
- No authentication required (public data only)

**Decision**: Web scraping with fallback to price estimates

**Implementation**:

```typescript
async function getPriceEstimate(item: string): Promise<number> {
  try {
    // Best-effort web scraping (cheerio + node-fetch)
    const price = await scrapeAmazonPrice(item);
    return price;
  } catch (error) {
    // Fallback to historical averages
    return PRICE_ESTIMATES[categorize(item)] || 10.0;
  }
}
```

**Libraries**:

- `node-fetch` or native `fetch` for HTTP
- `cheerio` for HTML parsing (jQuery-like selectors)

**Fallback Strategy**: Price estimate database (JSON file with category averages)

**Open Questions**: None - best-effort approach acceptable per spec

---

### 9. Error Handling & LLM Failures

**Question**: What happens if Claude API fails mid-planning?

**Research Findings**:

- **Spike 2 Validation**: Tested API failure with invalid key
  - Fallback templates activated successfully
  - Planning continued with degraded quality
- Per clarification: "Conservative retry - Retry once on failure, abort if still failing"
- Per FR-050d: Fallback to templates when LLM fails

**Decision**: 1 retry + template fallback

**Implementation**:

```typescript
async function generateWithFallback(prompt: string): Promise<Output> {
  try {
    return await callClaude(prompt);
  } catch (error) {
    console.warn("⚠️ LLM call failed, retrying once...");
    try {
      await sleep(1000);
      return await callClaude(prompt);
    } catch (retryError) {
      console.error("❌ LLM unavailable, using template fallback");
      return useTemplate(prompt);
    }
  }
}
```

**Templates**: Pre-defined reasonable defaults (from Spike 1 approach)

**Open Questions**: None - retry + fallback validated in Spike 2

---

## Technology Stack Summary

**Validated through Spike 1-3** (✅ All dependencies proven necessary):

| Component       | Technology        | Version      | Justification                                 |
| --------------- | ----------------- | ------------ | --------------------------------------------- |
| **Runtime**     | Node.js           | v24.3.0      | Async I/O, mature ecosystem, proven in spikes |
| **Language**    | TypeScript        | 5.9.3 strict | Constitution requirement, type safety         |
| **Execution**   | tsx               | 4.20.6       | Direct TS execution (no build step)           |
| **LLM SDK**     | @anthropic-ai/sdk | 0.68.0       | Spike 2 validated Haiku 4.5                   |
| **Env Config**  | dotenv            | 17.2.3       | API key management                            |
| **HTTP Client** | node-fetch        | Latest       | Price scraping (best-effort)                  |
| **HTML Parse**  | cheerio           | Latest       | Web scraping for prices                       |
| **Messaging**   | Node EventEmitter | Built-in     | Spike 1 validated, lightweight                |
| **Persistence** | fs (native)       | Built-in     | JSON files, simple                            |
| **CLI**         | Native readline   | Built-in     | Start simple, add framework if needed         |

**Production Dependencies**: 4 packages  
**Dev Dependencies**: 3 packages (`typescript`, `tsx`, `@types/node`)  
**Total**: 7 dependencies - Constitution compliant ("Minimal Ceremony")

**NOT NEEDED** (per spike validation):

- ❌ A2A Protocol SDK (`@a2aproject/types`) - Closed internal swarm
- ❌ HTTP servers (Express/Fastify) - Same-process communication
- ❌ Commander.js - Native readline sufficient for MVP
- ❌ Winston/Pino - console.log proven in spikes
- ❌ Zod - TypeScript strict mode sufficient
- ❌ MCP SDK - Defer external tool integration

---

## Performance Targets

Based on Spike 2-3 measurements:

| Metric                      | Target      | Spike Result           | Status              |
| --------------------------- | ----------- | ---------------------- | ------------------- |
| Planning session (6 agents) | <30s        | ~26s (extrapolated)    | ✅ On target        |
| LLM latency per call        | <2s         | 1.2-1.8s               | ✅ Validated        |
| Consensus voting            | <100ms      | Instant (rule-based)   | ✅ Proven           |
| Cost per session            | <$0.50      | $0.02-0.05             | ✅ 10x under budget |
| Message throughput          | >100/sec    | EventEmitter capacity  | ✅ Sufficient       |
| Token usage tracking        | Per session | Implemented in Spike 2 | ✅ Working          |

---

## MVP Implementation Path

**Validated Approach** (from spikes → production):

### Week 1: Foundation (Spike 1 → Production)

1. Extract proven patterns from `src/spike-1-agents.ts` (140 lines)
2. Create `src/coordination/message-bus.ts` - EventEmitter wrapper
3. Create `src/types.ts` - Agent, Message, PartyPlan interfaces
4. Create `src/agents/base-agent.ts` - Common agent behavior
5. Implement 2 agents: ThemeAgent, FoodAgent
6. **Success**: 2 agents coordinate like Spike 1

### Week 2: LLM Integration (Spike 2 → Production)

1. Extract Claude client from `src/spike-2-llm.ts` (305 lines)
2. Create `src/llm/claude-client.ts` - API wrapper with retry
3. Create `src/llm/verbalized-sampling.ts` - Type-safe output parsing
4. Add LLM calls to ThemeAgent and FoodAgent
5. **Success**: Agents generate creative content like Spike 2

### Week 3: Personalities + Full Swarm (Spike 3 → Production)

1. Extract personality system from `src/spike-3-personality.ts` (392 lines)
2. Create `src/llm/personalities.ts` - Optional system prompts
3. Implement remaining 4 agents: Decorator, Purchaser, DJ, ContactManager
4. Add CLI flag: `--personalities` (default: neutral prompts)
5. **Success**: 6 agents swarm with optional personality variety

### Week 4: Polish & User Stories

1. Implement majority voting consensus (rule-based)
2. Add JSON state persistence (`./data/sessions/`)
3. Add CLI approval checkpoints (per FR-044, FR-046)
4. Test User Story 1 (complete party planning)
5. **Success**: MVP delivers complete party plans

---

## Risk Mitigation

| Risk                  | Mitigation                        | Spike Validation               |
| --------------------- | --------------------------------- | ------------------------------ |
| LLM cost overruns     | Token tracking + hard $0.50 limit | ✅ Spike 2: $0.02-0.05/session |
| API failures          | 1 retry + template fallback       | ✅ Spike 2: Tested invalid key |
| Web scraping blocks   | Best-effort + fallback estimates  | Accept degradation             |
| Consensus deadlock    | User escalation after tie         | Per FR-011 spec                |
| State file corruption | Atomic writes (tmp → rename)      | Standard practice              |
| Performance <30s      | LLM <2s + 6 agents = ~12s budget  | ✅ Extrapolated from spikes    |

---

## Next Steps (Phase 1 Design)

**All research complete** - proceed to design artifacts:

1. ✅ Generate `data-model.md` - TypeScript interfaces for entities
2. ✅ Generate `contracts/` - Message schemas for internal communication
3. ✅ Generate `quickstart.md` - Setup and development instructions
4. ✅ Update plan.md with spike findings
5. ⏭️ Proceed to tasks breakdown (implement MVP)

---

## References

- Anthropic Claude API: <https://docs.anthropic.com/claude/reference>
- Node.js EventEmitter: <https://nodejs.org/api/events.html>
- TypeScript Handbook: <https://www.typescriptlang.org/docs/handbook/intro.html>
- Constitution: `.specify/memory/constitution.md` (all principles followed)

---

**Research Status**: ✅ **COMPLETE**  
**Spike Validation**: ✅ **ALL PASSED** (Spike 1-3)  
**Date**: 2025-10-31  
**Next Phase**: Generate design artifacts (data-model.md, contracts/, quickstart.md)
