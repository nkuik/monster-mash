# Implementation Plan: Monster Mash - Agent-to-Agent Party Planning Framework

**Branch**: `001-a2a-party-framework` | **Date**: 2025-10-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-a2a-party-framework/spec.md`

**Status**: ✅ **Spikes Complete** - Moving to MVP Implementation

## Summary

Multi-agent swarm party planning framework using TypeScript + Claude Haiku 4.5. Six specialized agents (Theme Decider, Food Planner, Decorator, Purchaser, DJ/Playlist, Contact Manager) collaborate using broadcast communication and majority voting to plan Halloween parties. Verbalized sampling (multiple LLM-generated options with confidence scores) enables transparent decision-making. Optional personality system prompts create engaging behavioral variety.

**Spike Validation Results** (✅ ALL PASSED):

- **Spike 1**: 2-agent coordination works with simple message passing
- **Spike 2**: Claude Haiku 4.5 generates creative content at <2s latency, ~$0.02-0.05/session
- **Spike 3**: LLM personalities create dramatic behavioral differences (frugal vs perfectionist vs adventurous)

**Decision**: Proceed with hybrid architecture - **LLM for content generation** (menus, themes, playlists), **rules for coordination** (voting, message routing, consensus). Personalities are **optional feature** (disabled by default, enabled via CLI flag).

## Technical Context

**Language/Version**: TypeScript 5.9.3 (Node.js v24.3.0 runtime)

**Primary Dependencies**:

- `@anthropic-ai/sdk` 0.68.0 (Claude Haiku 4.5 integration)
- `tsx` 4.20.6 (direct TypeScript execution)
- `dotenv` 17.2.3 (environment variable management)

**Storage**: Local file system (JSON files for state persistence, planning history)

**Testing**: Manual execution + constitution-aligned testing (tests only where they aid understanding)

**Target Platform**: CLI application (macOS/Linux/Windows via Node.js)

**Project Type**: Single application (src/ structure with agent modules)

**Performance Goals**:

- Complete planning session: <30s for 6 agents
- LLM API latency: <2s per agent decision
- Consensus voting: <5 minutes for theme selection

**Constraints**:

- Cost: <$0.50 per planning session (validated: ~$0.02-0.05 with Haiku 4.5)
- Token usage: Track and log per session
- Fallback: Must degrade gracefully if LLM fails (use templates)
- Offline: No - requires Anthropic API access

**Scale/Scope**:

- 6 agents per planning session
- 50-100 guests typical party size
- $200-$1000 budget range
- 10-20 message exchanges per decision point

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **ALL GATES PASSED** (Based on `.specify/memory/constitution.md`)

1. **Experiment-First** ✅

   - 3 spikes executed before building infrastructure
   - Each spike tested 1 hypothesis (coordination, LLM quality, personalities)
   - Decision gates at T033-T036 before MVP

2. **TypeScript-First** ✅

   - TypeScript 5.9.3 with strict mode
   - Explicit types for agent communication (Message, Decision, MenuItem)
   - tsx for direct execution (no build step)

3. **Fast Iteration** ✅

   - Spike 1: 140 lines in ~1 day
   - Spike 2: 305 lines in ~1 day
   - Spike 3: 392 lines in ~1 day
   - Total discovery phase: <1 week

4. **AI-Friendly Code** ✅

   - Clear naming: `ThemeAgent`, `FoodAgent`, `broadcastMessage()`
   - Explicit types: `type Message = {from: string; to: string; content: any}`
   - Linear flow: `decide() → broadcastMessage() → collectVotes() → chooseWinner()`
   - WHY comments: "// Use EventEmitter to decouple agents (avoid tight coupling)"

5. **Minimal Ceremony** ✅
   - Only 7 dependencies (4 prod, 3 dev)
   - No premature abstractions (no BaseAgent until 3 agents exist)
   - No test framework (manual execution validates correctness)
   - No CLI framework (console.log + ANSI colors sufficient)

**Dependency Justification**:

- `@anthropic-ai/sdk`: Required for Claude API (core feature)
- `tsx`: Required for TypeScript execution (development speed)
- `dotenv`: Required for API key security (best practice)
- `typescript`: Required for type safety (constitution principle)
- Other dependencies planned only if spikes prove insufficient

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Single project structure (Option 1) - CLI application with 6 internal agent modules

**Current Spike Files** (validated, keep as references):

```text
src/
├── spike-1-agents.ts         # 140 lines - 2-agent coordination proof
├── spike-2-llm.ts            # 305 lines - Claude Haiku 4.5 validation
└── spike-3-personality.ts    # 392 lines - personality + verbalized sampling
```

**Planned MVP Structure** (to be built from spike learnings):

```text
src/
├── agents/                    # Agent implementations
│   ├── theme-agent.ts         # Theme Decider (LLM-based)
│   ├── food-agent.ts          # Food Planner (LLM-based)
│   ├── decor-agent.ts         # Decorator (LLM-based)
│   ├── purchase-agent.ts      # Purchaser (rules-based estimator)
│   ├── dj-agent.ts            # DJ/Playlist (LLM-based)
│   └── contact-agent.ts       # Contact Manager (rules-based)
│
├── coordinator/               # Swarm coordination logic
│   ├── message-bus.ts         # EventEmitter-based broadcast
│   ├── voting.ts              # Majority voting consensus
│   └── coordinator.ts         # Orchestrates planning session
│
├── llm/                       # LLM integration
│   ├── anthropic-client.ts    # Claude API wrapper
│   ├── personalities.ts       # Optional personality system prompts
│   └── prompts.ts             # Base prompts with verbalized sampling
│
├── types/                     # TypeScript definitions
│   ├── agent.ts               # Agent interface, Message, Decision
│   ├── party.ts               # Party, Theme, Menu, Budget
│   └── llm.ts                 # LLMResponse, MenuItem (with confidence)
│
├── utils/                     # Shared utilities
│   ├── json-parser.ts         # Robust JSON parsing + code fence stripping
│   ├── logger.ts              # Console.log wrapper (optional ANSI colors)
│   └── state-manager.ts       # JSON file persistence
│
└── main.ts                    # CLI entry point

docs/                          # Documentation (from decision point)
└── spike-results.md           # Consolidated spike findings

tests/                         # Only if constitution-compliant
└── (none initially - spikes validate correctness)
```

**Key Architectural Decisions**:

- **No BaseAgent class initially** (wait until 3+ agents show common patterns)
- **Coordinator as orchestrator** (not controller - agents are independent)
- **Message bus decouples agents** (no direct dependencies between agents)
- **LLM module isolates API** (swap providers without changing agents)
- **Types enforce contracts** (Message, Decision, MenuItem interfaces)
- **Utils are pure functions** (testable without mocks if needed)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: ✅ No violations - all constitution principles followed

This project exemplifies constitution compliance:

- **Spike-driven development**: 3 spikes completed before any infrastructure
- **Minimal dependencies**: 7 total (well below typical project bloat)
- **No premature abstraction**: No BaseAgent, no framework adoption until proven necessary
- **Fast iteration**: Spike 1 → Spike 3 completed in <1 week
- **TypeScript-first**: Strict mode, explicit types throughout

**Anti-patterns avoided**:

- ❌ Building 6 agents before proving 2-agent coordination works
- ❌ Adopting A2A protocol JSON-RPC 2.0 before testing simple message passing
- ❌ Adding Zod/Winston/Commander.js before proving console.log insufficient
- ❌ Creating test infrastructure before understanding what correctness means
- ❌ Designing complex data model before seeing real agent communication patterns
