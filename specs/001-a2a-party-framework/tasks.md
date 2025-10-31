# Implementation Tasks: Monster Mash - Agent-to-Agent Party Planning Framework

**Feature**: Monster Mash - A2A Party Planning Framework  
**Branch**: `001-a2a-party-framework`  
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

**⚠️ CRITICAL**: This task breakdown follows the **spike-first approach** mandated by the constitution. Spikes 1-3 are ✅ COMPLETE and validated. Now proceeding to decision point documentation and MVP implementation.

**🤖 LLM INTEGRATION**: Claude Haiku 4.5 validated through Spike 2-3 ($0.02-0.05/session, <2s latency). Requires ANTHROPIC_API_KEY environment variable.

**Constitution Alignment**: ✅ Experiment-First, Fast Iteration, TypeScript-First, AI-Friendly Code, Minimal Ceremony

---

## Task Summary

- **Total Tasks**: 91 (includes all user stories)
- **Completed**: 35/91 (38%) - Decision Point complete, Ready for MVP
- **Current Phase**: Phase 4 (T037-T060) → MVP implementation starts
- **MVP Scope**: User Story 1 (T037-T060) - Core party planning with 6 agents
- **Parallel Opportunities**: 22 tasks can run in parallel after dependencies met
- **Incremental Delivery**: Each user story (P1/P2/P3) independently testable

---

## Progress Overview

```
✅ Phase 1: Setup & Prerequisites (T001-T005) - 5/5 complete
✅ Phase 2: Spike Validation (T006-T032) - 27/27 complete
✅ Phase 3: Decision Point (T033-T036) - 4/4 complete
⏭️ Phase 4: User Story 1 - MVP (T037-T060) - 0/24 pending (NEXT)
⏭️ Phase 5: User Story 3 - Observability (T061-T065) - 0/5 pending
⏭️ Phase 6: User Story 5 - DJ/Playlist (T066-T071) - 0/6 pending
⏭️ Phase 7: User Story 2 - Adaptive Re-planning (T072-T077) - 0/6 pending
⏭️ Phase 8: User Story 4 - Purchase Simulation (T078-T083) - 0/6 pending
⏭️ Phase 9: User Story 6 - Contact Management (T084-T089) - 0/6 pending
⏭️ Phase 10: Polish & Documentation (T090-T091) - 0/2 pending
```

---

## Phase 1: Setup & Prerequisites ✅ COMPLETE

**Goal**: Initialize minimal project structure for spike experiments

**Duration**: 30 minutes

### Tasks

- [x] T001 Initialize pnpm project with package.json in project root
- [x] T002 Configure tsconfig.json with strict mode and ES2022 target in project root
- [x] T003 [P] Install TypeScript 5.9.3 and tsx 4.20.6 as dev dependencies
- [x] T004 [P] Create src/ directory for spike experiments
- [x] T005 [P] Add .gitignore for node_modules/, dist/, \*.js files

**Completion Criteria**: ✅ `npx tsx --version` succeeds (v4.20.6), `src/` directory exists

---

## Phase 2: Spike Validation ✅ COMPLETE

**Goal**: Validate core hypotheses through minimal experiments before building infrastructure

**Duration**: 3 days (completed)

**Constitution Principle**: "Spike solutions to test hypotheses, then decide if they warrant cleanup"

### Spike 1: Can 2 Agents Coordinate? ✅ COMPLETE

**Hypothesis**: Two TypeScript functions can exchange messages and agree on a theme

**Learn**: Do we need HTTP? JSON-RPC? AgentCards? Or are simple function calls sufficient?

#### Tasks

- [x] T006 Create src/spike-1-agents.ts with Agent type definition
- [x] T007 Implement themeAgent with decide() function returning theme from options array
- [x] T008 Implement foodAgent with decide() function generating menu based on theme
- [x] T009 Add message array to track agent communication
- [x] T010 Implement orchestration: themeAgent picks theme, foodAgent generates menu
- [x] T011 Add console.log output showing theme, menu, and message log
- [x] T012 Test: Run `npx tsx src/spike-1-agents.ts` and verify output shows coordination

**Success Criteria**: ✅ ALL MET

- ✅ Script outputs selected theme (Spooky)
- ✅ Script outputs theme-appropriate menu (4 items)
- ✅ Message log shows agent-to-agent communication (4 messages)
- ✅ Total lines: ~140 (within target)

**Decision**: ✅ Simple EventEmitter message passing sufficient - NO HTTP/JSON-RPC needed

---

### Spike 2: Does LLM Add Value? ✅ COMPLETE

**Hypothesis**: Claude Haiku 4.5 generates higher quality, more creative party options than templates

**Learn**: Does LLM justify API cost and latency? Are confidence scores meaningful?

#### Tasks

- [x] T013 Install @anthropic-ai/sdk: `pnpm add @anthropic-ai/sdk`
- [x] T014 Create .env file in project root with ANTHROPIC_API_KEY placeholder
- [x] T015 Add dotenv package: `pnpm add dotenv` for environment variable loading
- [x] T016 Create src/spike-2-llm.ts with Anthropic client initialization
- [x] T017 Implement generateThemeOptions() async function calling Claude Haiku 4.5
- [x] T018 Add JSON parsing for Claude response with markdown code fence stripping
- [x] T019 Implement fallback template themes when API call fails
- [x] T020 Implement generateMenu() async function with theme parameter
- [x] T021 Add timing measurement to track LLM latency
- [x] T022 Add console output comparing LLM vs Spike 1 hardcoded options
- [x] T023 Test: Run `npx tsx src/spike-2-llm.ts` with valid API key
- [x] T024 Test: Run with invalid/missing API key, verify fallback templates

**Success Criteria**: ✅ ALL MET

- ✅ Claude API returns structured JSON with 3+ theme options and confidence scores
- ✅ Menu generation incorporates theme context
- ✅ Fallback templates activate on API failure without crashing
- ✅ Total execution time <2s (better than <5s requirement)
- ✅ LLM options observably more creative than hardcoded options
- ✅ Cost ~$0.02-0.05 per session (well under $0.50 budget)

**Decision**: ✅ **CONTINUE WITH HAIKU 4.5** - Creativity significant, latency <2s, cost acceptable

---

### Spike 3: Do LLM Personalities Matter? ✅ COMPLETE

**Hypothesis**: Different personality traits in system prompts produce observably different behaviors

**Learn**: Are LLM personality prompts worth the complexity?

#### Tasks

- [x] T025 Create src/spike-3-personality.ts with Anthropic client
- [x] T026 Define Personality type with name and systemPrompt properties
- [x] T027 Create 3 personalities: Frugal, Perfectionist, Adventurous
- [x] T028 Implement generateMenuWithPersonality() function with system prompts
- [x] T029 Add loop to test same theme input with all 3 personalities
- [x] T030 Add console output showing personality name and resulting menu
- [x] T031 Test: Run script and verify outputs differ meaningfully
- [x] T032 Test: Verify personality-specific language in outputs

**Success Criteria**: ✅ ALL MET

- ✅ Frugal personality mentions budget/cost constraints
- ✅ Perfectionist personality emphasizes quality/aesthetics
- ✅ Adventurous personality suggests unconventional ideas
- ✅ Outputs are observably different (distinct menu styles and price points)
- ✅ Personality differences create engaging variations

**Decision**: ✅ **KEEP LLM PERSONALITIES** - Dramatic behavioral differences validated

---

## Phase 3: Decision Point Documentation ⏭️ NEXT

**REQUIRED**: Document spike learnings before proceeding to MVP

**Goal**: Create comprehensive spike results documentation and finalize technical decisions

**Duration**: 1-2 hours

### Tasks

- [x] T033 Create docs/spike-results.md documenting all 3 spike findings with code examples and metrics
- [x] T034 Calculate precise cost estimate: token usage × Haiku 4.5 pricing ($1/$5 per million tokens)
- [x] T035 Document decision rationale in docs/spike-results.md: Continue with LLM approach
- [x] T036 Update README.md with minimal setup instructions and spike references

**Success Criteria**:

- ✅ docs/spike-results.md includes quantitative results (latency, cost, quality comparison)
- ✅ Cost estimate calculated: $0.02-0.05 per planning session validated
- ✅ Decision documented: Proceed with Claude Haiku 4.5 + personalities + verbalized sampling
- ✅ README.md includes:
  - Project overview and goals
  - Prerequisites (Node.js v24.3.0+, pnpm, Anthropic API key)
  - Installation steps (`pnpm install`, `.env` setup with `ANTHROPIC_API_KEY=your-key-here`)
  - Usage examples (`npx tsx src/main.ts` with sample party constraints)
  - How to run spikes for validation (`npx tsx src/spike-1-agents.ts`, `npx tsx src/spike-2-llm.ts`, `npx tsx src/spike-3-personality.ts`)
  - Architecture overview (6 agents → message bus → coordinator → consensus)
  - Cost estimate ($0.02-0.05 per session)
  - Quick start guide pointing to spike files for understanding

**Decision Matrix Applied**:

- ✅ LLM + Personalities succeed → **Proceed with full Haiku 4.5 integration and system prompt personalities**
- ❌ LLM succeeds, Personalities fail → Use Haiku 4.5 with neutral prompts
- ❌ LLM fails → Pivot to template-based approach
- ❌ Coordination fails → Reconsider multi-agent approach

**Outcome**: ✅ All success criteria met - Proceed to MVP implementation

---

## Phase 4: User Story 1 - Plan Complete Halloween Party (P1) 🎯 MVP

**Goal**: Core multi-agent party planning functionality with 6 agents

**Independent Test**: Provide party constraints, observe agent collaboration, receive complete party plan

**Dependencies**: Requires successful spike validation (✅ complete)

**Duration**: 5-7 days

### Foundation Tasks

- [ ] T037 [P] Create src/types/agent.ts with Agent, Message, Decision interfaces from spike learnings
- [ ] T038 [P] Create src/types/party.ts with PartyPlan, Theme, Budget, MenuItem types from data-model.md
- [ ] T039 [P] Create src/types/llm.ts with LLMResponse, VerbalizeSamplingOutput, Confidence types
- [ ] T040 Create src/coordinator/message-bus.ts with EventEmitter-based broadcast from Spike 1 pattern
- [ ] T041 Create src/coordinator/voting.ts with majority voting consensus mechanism
- [ ] T042 Create src/coordinator/coordinator.ts orchestrating planning session lifecycle

### LLM Integration Tasks

- [ ] T043 [P] Create src/llm/anthropic-client.ts wrapping Claude API with retry logic from Spike 2
- [ ] T044 [P] Create src/llm/prompts.ts with base prompts including verbalized sampling instructions and FR-053c (no code fences)
- [ ] T045 [P] Create src/llm/personalities.ts with 3 personality system prompts from Spike 3 (Frugal, Perfectionist, Adventurous)
- [ ] T046 [P] Create src/utils/json-parser.ts with robust JSON parsing and code fence stripping from Spike 2

### Agent Implementation Tasks

- [ ] T047 [P] [US1] Create src/agents/theme-agent.ts implementing ThemeAgent with LLM-based theme generation
- [ ] T048 [P] [US1] Create src/agents/food-agent.ts implementing FoodAgent with LLM-based menu generation
- [ ] T049 [P] [US1] Create src/agents/decor-agent.ts implementing DecoratorAgent with LLM-based decoration planning
- [ ] T050 [P] [US1] Create src/agents/purchase-agent.ts implementing PurchaserAgent with rules-based cost estimation
- [ ] T051 [P] [US1] Create src/agents/dj-agent.ts implementing DJAgent with LLM-based playlist generation
- [ ] T052 [P] [US1] Create src/agents/contact-agent.ts implementing ContactManagerAgent with rules-based guest management

### Utility Tasks

- [ ] T053 [P] [US1] Create src/utils/logger.ts with console.log wrapper and optional ANSI colors
- [ ] T054 [P] [US1] Create src/utils/state-manager.ts with JSON file persistence for planning state

### CLI Entry Point

- [ ] T055 [US1] Create src/main.ts as CLI entry point accepting party constraints (budget, guest count, date)
- [ ] T056 [US1] Implement planning session orchestration: spawn agents → coordinate → reach consensus → display plan
- [ ] T057 [US1] Add output formatting to display complete party plan (theme, menu, decorations, playlist, budget)
- [ ] T058 [US1] Add message logging to show agent collaboration in terminal

### Integration Testing

- [ ] T059 [US1] Test complete flow: Input constraints → 6 agents coordinate → output cohesive plan
- [ ] T060 [US1] Verify plan includes theme, menu, decorations, playlist, contact suggestions, and stays within budget

**Success Criteria (US1)**:

- ✅ User provides party constraints (date, budget, guest count, dietary restrictions)
- ✅ All 6 agents spawn and begin coordination
- ✅ Agents reach consensus on theme using verbalized sampling and majority voting
- ✅ Complete party plan generated (theme, menu, decorations, playlist, contact drafts)
- ✅ Agent negotiation visible in terminal output with timestamps
- ✅ Plan is cohesive (theme aligns across menu, decorations, music)
- ✅ Budget constraint respected (within 5% tolerance)
- ✅ Planning session completes in <30s

**Checkpoint**: At this point, MVP is complete and independently testable

---

## Phase 5: User Story 3 - Observe Agent Collaboration (P2)

**Goal**: Enhanced real-time visibility into agent decision-making with detailed logs

**Independent Test**: Run planning session, verify all agent communications and decisions are logged with full context

**Dependencies**: Requires US1 complete

**Duration**: 1-2 days

### Tasks

- [ ] T061 [P] [US3] Enhance src/coordinator/message-bus.ts with detailed timestamps and agent IDs in logs
- [ ] T062 [P] [US3] Add verbalized sampling output display showing all options with confidence scores in src/utils/logger.ts
- [ ] T063 [P] [US3] Add personality-driven argument display in negotiation logs with rationale tracking
- [ ] T064 [US3] Format output for readability with ANSI colors highlighting agents, decisions, and votes
- [ ] T065 [US3] Test: Run planning session and verify logs show complete agent reasoning chain

**Success Criteria (US3)**:

- ✅ All agent communications logged with timestamps and agent IDs
- ✅ Verbalized sampling options visible with confidence scores (0-1 scale)
- ✅ Personality-driven debates readable in output with clear rationale
- ✅ User can understand agent reasoning by reviewing decision logs
- ✅ Logs show consensus voting results with individual agent votes

---

## Phase 6: User Story 5 - Curate Halloween Music and Playlist (P2)

**Goal**: DJ/Playlist agent creates theme-appropriate music plan with phase structure

**Independent Test**: Run with approved theme, verify playlist aligns with theme and includes progression (arrival/peak/wind-down)

**Dependencies**: Requires US1 complete (needs theme selection)

**Duration**: 2-3 days

### Tasks

- [ ] T066 [P] [US5] Add Playlist and Song types to src/types/party.ts per data-model.md
- [ ] T067 [P] [US5] Enhance src/agents/dj-agent.ts with proposePlaylistStrategies() using verbalized sampling
- [ ] T068 [US5] Implement music phase structure (arrival, peak energy, wind-down) in DJAgent
- [ ] T069 [US5] Add theme alignment check between ThemeAgent output and DJAgent playlist proposals
- [ ] T070 [US5] Add streaming service link generation (Spotify, YouTube) to playlist output
- [ ] T071 [US5] Test: Verify playlist matches theme, includes 3 phases with timing, backup suggestions provided

**Success Criteria (US5)**:

- ✅ DJ agent proposes 3-5 playlist strategies using verbalized sampling
- ✅ Playlist structured in phases (arrival/ambient, peak energy, wind-down) with timing recommendations
- ✅ Music aligns with selected theme (verified by theme alignment score >7/10)
- ✅ Backup playlist suggestions provided for different crowd energy levels
- ✅ Each phase has minimum 5 songs with artist, title, duration

---

## Phase 7: User Story 2 - Adapt Plan to Budget Changes (P2)

**Goal**: Re-optimize plan when budget changes mid-planning without full restart

**Independent Test**: Complete initial plan, change budget constraint, verify selective re-planning

**Dependencies**: Requires US1 complete

**Duration**: 2-3 days

### Tasks

- [ ] T072 [US2] Add budget change detection in src/main.ts with user prompt for new budget
- [ ] T073 [US2] Implement selective re-planning in src/coordinator/coordinator.ts: only update affected agents
- [ ] T074 [P] [US2] Update src/agents/purchase-agent.ts to propose cost-saving alternatives using verbalized sampling
- [ ] T075 [P] [US2] Update src/agents/food-agent.ts to adjust menu for new budget constraint
- [ ] T076 [P] [US2] Update src/agents/decor-agent.ts to adjust decorations for new budget
- [ ] T077 [US2] Test: Start with $800, reduce to $500 mid-planning, verify selective updates maintain theme coherence

**Success Criteria (US2)**:

- ✅ Budget change triggers re-coordination message to affected agents
- ✅ Only affected portions re-planned (not full restart - theme unchanged)
- ✅ New plan within 5% of budget constraint
- ✅ Theme coherence maintained across re-planned menu and decorations
- ✅ Re-planning completes within 30 seconds
- ✅ User receives notification of which plan components changed

---

## Phase 8: User Story 4 - Execute Purchase Simulation (P3)

**Goal**: Purchaser agent researches actual prices and generates organized shopping lists

**Independent Test**: Run full planning session, verify shopping lists with price comparisons and vendor links

**Dependencies**: Requires US1 complete

**Duration**: 2-3 days

### Tasks

- [ ] T078 [P] [US4] Add PurchaseItem type to src/types/party.ts per data-model.md with vendor options
- [ ] T079 [P] [US4] Implement web scraping in src/agents/purchase-agent.ts to query online vendor prices (Amazon, party supply stores)
- [ ] T080 [US4] Add price comparison logic with verbalized sampling: propose 3 purchasing strategies (all-Amazon, mixed vendors, local stores)
- [ ] T081 [US4] Generate organized shopping lists by vendor with item links and estimated costs
- [ ] T082 [US4] Add budget tracking display showing budget used vs remaining
- [ ] T083 [US4] Test: Verify price estimates within 10% of actual market prices for 80%+ of items

**Success Criteria (US4)**:

- ✅ Purchaser aggregates all purchase needs from FoodAgent, DecoratorAgent, DJAgent
- ✅ Agent queries publicly available price data from online vendors (no authentication)
- ✅ Verbalized sampling presents 3 purchasing strategies with cost-benefit analysis
- ✅ Shopping lists organized by vendor with product links
- ✅ Estimated costs within 10% accuracy for at least 80% of items
- ✅ Budget tracking shows used vs remaining with variance reporting

---

## Phase 9: User Story 6 - Manage Guest List and Invitations (P3)

**Goal**: Contact Manager generates invitation drafts and tracks RSVPs with headcount updates

**Independent Test**: Provide guest list, verify invitation generation with theme alignment and RSVP tracking

**Dependencies**: Requires US1 complete (needs theme for invitation wording)

**Duration**: 1-2 days

### Tasks

- [ ] T084 [P] [US6] Add Guest type to src/types/party.ts per data-model.md with RSVP status
- [ ] T085 [P] [US6] Implement generateInvitations() in src/agents/contact-agent.ts with verbalized sampling for wording options
- [ ] T086 [US6] Add theme-appropriate invitation wording using theme context in LLM prompts
- [ ] T087 [US6] Implement RSVP update mechanism via CLI prompts for manual status updates
- [ ] T088 [US6] Add headcount change notifications to FoodAgent and PurchaserAgent when RSVPs update
- [ ] T089 [US6] Test: Update RSVP status, verify Food and Purchase agents adjust plans for new headcount

**Success Criteria (US6)**:

- ✅ Contact Manager generates 3 invitation wording options using verbalized sampling
- ✅ Invitation text aligns with selected theme (spooky vs elegant vs playful wording)
- ✅ User can manually update RSVP status via CLI prompts
- ✅ Headcount changes trigger notifications to FoodAgent and PurchaserAgent
- ✅ Food and purchase quantities adjusted automatically based on new headcount
- ✅ Draft invitations ready for user to manually send via their preferred channels

---

## Phase 10: Polish & Documentation

**Goal**: Finalize documentation and ensure project is ready for external use

**Duration**: 1-2 hours

### Tasks

- [ ] T090 Update README.md with comprehensive documentation per T036 success criteria plus architecture diagram
- [ ] T091 Create docs/architecture.md documenting agent coordination pattern, message bus, voting mechanism, LLM integration

**Success Criteria**:

- ✅ README.md is comprehensive and executable (user can set up and run from README alone)
- ✅ docs/architecture.md explains technical implementation decisions
- ✅ All spike files remain in src/ as reference implementations
- ✅ Documentation references constitution principles and spike validation process

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)

```
Phase 1 (Setup) ✅
  → Phase 2 (Spikes) ✅
      → Phase 3 (Decision Point) ⏭️ NEXT
          → Phase 4 (US1 - MVP) ← BLOCKING FOR ALL OTHER USER STORIES
              → Phase 5 (US3) - Can parallelize with US5, US2, US4, US6
              → Phase 6 (US5) - Can parallelize with US3, US2, US4, US6
              → Phase 7 (US2) - Can parallelize with US3, US5, US4, US6
              → Phase 8 (US4) - Can parallelize with US3, US5, US2, US6
              → Phase 9 (US6) - Can parallelize with US3, US5, US2, US4
                  → Phase 10 (Polish)
```

### Parallel Execution Opportunities

**Phase 4 (US1 - MVP) - After T042 (coordinator setup)**:

- T037, T038, T039 (different type files) ✅ Parallel
- T043, T044, T045, T046 (LLM module components) ✅ Parallel
- T047, T048, T049, T050, T051, T052 (6 agent implementations) ✅ Parallel
- T053, T054 (utility files) ✅ Parallel

**Phase 5 (US3) - All tasks after T061**:

- T061, T062, T063 (different files) ✅ Parallel

**Phase 6 (US5) - After T066**:

- T066, T067 (different files) ✅ Parallel

**Phase 7 (US2) - After T073**:

- T074, T075, T076 (different agent files) ✅ Parallel

**Phase 8 (US4) - After T078**:

- T078, T079 (different files) ✅ Parallel

**Phase 9 (US6) - After T084**:

- T084, T085 (different files) ✅ Parallel

**User Story Independence** (after US1 completes):

- US3, US5, US2, US4, US6 can all proceed in parallel
- Each independently testable
- Each adds value without breaking others

---

## Implementation Strategy

### MVP Scope (Week 1-2) 🎯

**Objective**: Validate production approach, deliver minimal valuable increment

**Includes**:

- ✅ Phase 1: Setup (30 minutes) - COMPLETE
- ✅ Phase 2: Spike Validation (3 days) - COMPLETE
- ⏭️ Phase 3: Decision Point (1-2 hours) - NEXT
- ⏭️ Phase 4: User Story 1 (5-7 days) - Core party planning with 6 agents

**Delivers**: Complete party planning with all 6 agents, verbalized sampling, optional personalities, working consensus mechanism

### Incremental Delivery (Week 3-4+)

**Priority order after MVP**:

1. **Phase 5 (US3)**: Observation enhancements - improves transparency
2. **Phase 6 (US5)**: Music/playlist - adds significant value, leverages existing LLM integration
3. **Phase 7 (US2)**: Adaptive re-planning - demonstrates swarm flexibility
4. **Phase 8 (US4)**: Purchase simulation - adds actionable output
5. **Phase 9 (US6)**: Contact management - completes feature set
6. **Phase 10**: Polish & documentation

### Parallel Team Strategy

With multiple developers after US1 completes:

- Developer A: US3 (Observability enhancements)
- Developer B: US5 (DJ/Playlist agent)
- Developer C: US2 (Adaptive re-planning)
- Developer D: US4 (Purchase simulation)

Each developer works independently, stories integrate cleanly.

---

## Success Metrics

### Spike Phase ✅ ACHIEVED

- ✅ Time to first learning: 3 days (target: <1 week)
- ✅ Lines of code: 140 + 305 + 392 = 837 lines (target: <1000 before infrastructure)
- ✅ Dependencies: 7 total (4 prod, 3 dev) - constitution compliant
- ✅ Cost validation: $0.02-0.05 per session (target: <$0.50)
- ✅ Latency validation: <2s per agent (target: <2s)

### MVP Phase (Target)

- Core party planning works with 6 agents
- Agent coordination observable in terminal
- Plan quality: theme coherence score >8/10
- Performance: <30s for complete planning session
- Budget accuracy: within 5% of constraint
- Consensus reached: >90% without user intervention

### Full Feature (Target)

- All 6 user stories implemented and independently tested
- Cost per session: $0.02-0.05 validated in production
- User satisfaction: 80%+ approve final plan quality
- System reliability: 95%+ planning sessions complete successfully

---

## Risk Mitigation

### Technical Risks (All Mitigated in Spikes)

✅ **LLM API latency**: Validated <2s with Haiku 4.5  
✅ **LLM cost**: Validated $0.02-0.05 per session (10x under budget)  
✅ **Agent coordination complexity**: Validated simple EventEmitter works  
✅ **Personality value**: Validated dramatic behavioral differences  
✅ **JSON parsing failures**: Validated robust parsing + code fence stripping

### Implementation Risks

**Over-engineering during MVP**:

- Mitigation: Constitution principles + plan.md defers BaseAgent until 3+ agents built
- Checkpoint: Review after T052 - do we see patterns requiring abstraction?

**Scope creep**:

- Mitigation: User stories prioritized (P1/P2/P3), conditional phases
- Checkpoint: MVP complete after US1 - evaluate before continuing

**Performance degradation with 6 agents**:

- Mitigation: Spike 3 validated 3 personalities without issues, extrapolates to 6 agents
- Checkpoint: Measure T059 - if >30s, optimize most expensive LLM calls

---

## Task Format Validation

✅ All tasks follow required format: `- [ ] [ID] [P?] [Story?] Description with file path`  
✅ Task IDs sequential: T001-T091  
✅ Story labels present for user story phases: [US1], [US2], [US3], [US4], [US5], [US6]  
✅ Parallel markers [P] on 22 independent tasks  
✅ File paths specified in task descriptions  
✅ Tasks organized by user story for independent implementation  
✅ README documentation included in Decision Point (T036) and Polish (T090) phases

---

**Generated**: 2025-10-31  
**Total Tasks**: 91  
**Constitution Aligned**: ✅ Experiment-First, TypeScript-First, Fast Iteration, AI-Friendly, Minimal Ceremony  
**Next Step**: Begin Phase 3 (T033-T036) - Document spike findings, update README with setup instructions  
**Estimated Timeline**: MVP in 2 weeks, full feature in 4 weeks
