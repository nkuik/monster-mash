# Implementation Tasks: A2A Party Planning Framework

**Feature**: Monster Mash - A2A Party Planning Framework  
**Branch**: `001-a2a-party-framework`  
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

**⚠️ CRITICAL**: This task breakdown follows the **spike-first approach** mandated by the constitution. Implementation is organized to validate hypotheses through experimentation before building infrastructure.

**Constitution Alignment**: Experiment-First, Fast Iteration, Minimal Ceremony

---

## Task Summary

- **Total Tasks**: 23
- **Spike Phase Tasks**: 8 (validate approach)
- **MVP Implementation Tasks**: 15 (only if spikes succeed)
- **Parallel Opportunities**: 12 tasks can run in parallel after dependencies met
- **MVP Scope**: Spike validation + User Story 1 (core party planning)

---

## Phase 1: Setup & Prerequisites

**Goal**: Initialize minimal project structure for spike experiments

**Duration**: 30 minutes

### Tasks

- [ ] T001 Initialize npm/pnpm project with package.json in project root
- [ ] T002 Configure tsconfig.json with strict mode and ES2022 target in project root
- [ ] T003 [P] Install TypeScript 5.3+ and tsx as dev dependencies
- [ ] T004 [P] Create src/ directory for spike experiments
- [ ] T005 [P] Add .gitignore for node_modules/, dist/, \*.js files

**Completion Criteria**: `npx tsx --version` succeeds, `src/` directory exists

---

## Phase 2: Spike Validation (BLOCKING - Must Complete First)

**Goal**: Validate core hypotheses through minimal experiments before building infrastructure

**Duration**: 2-3 days

**Constitution Principle**: "Spike solutions to test hypotheses, then decide if they warrant cleanup"

### Spike 1: Can 2 Agents Coordinate? (Day 1)

**Hypothesis**: Two TypeScript functions can exchange messages and agree on a theme

**Learn**: Do we need HTTP? JSON-RPC? AgentCards? Or are simple function calls sufficient?

#### Tasks

- [ ] T006 Create src/spike-1-agents.ts with Agent type definition
- [ ] T007 Implement themeAgent with decide() function returning theme from options array
- [ ] T008 Implement foodAgent with decide() function generating menu based on theme
- [ ] T009 Add message array to track agent communication
- [ ] T010 Implement orchestration: themeAgent picks theme, foodAgent generates menu
- [ ] T011 Add console.log output showing theme, menu, and message log
- [ ] T012 Test: Run `npx tsx src/spike-1-agents.ts` and verify output shows coordination

**Success Criteria**:

- Script outputs selected theme
- Script outputs theme-appropriate menu
- Message log shows agent-to-agent communication
- Total lines: ~150

**Decision Point**: If agents can coordinate with simple objects, we don't need HTTP/JSON-RPC yet

---

### Spike 2: Does Voting Work? (Day 2)

**Hypothesis**: 3rd agent voting mechanism improves decision quality and provides value

**Learn**: Is consensus mechanism valuable? Or do agents just agree anyway?

#### Tasks

- [ ] T013 Create src/spike-2-voting.ts copying spike-1 as baseline
- [ ] T014 Add decoratorAgent with decide() function that votes on theme
- [ ] T015 Implement voting logic: collect votes from 3 agents on theme options
- [ ] T016 Implement majority calculation to determine winning theme
- [ ] T017 Update console output to show individual votes and final consensus
- [ ] T018 Test: Run script with different voting scenarios, verify majority wins

**Success Criteria**:

- 3 agents cast votes on theme selection
- Majority vote determines outcome
- Tie-breaking handled (if needed)
- Total additional lines: ~50

**Decision Point**: If voting adds no value (agents always agree), skip consensus complexity

---

### Spike 3: Do Personalities Matter? (Day 3)

**Hypothesis**: Agent personalities affect decision outcomes observably and create engaging dynamics

**Learn**: Are personalities worth the complexity? Do they create engaging dynamics?

#### Tasks

- [ ] T019 Create src/spike-3-personality.ts copying spike-2 as baseline
- [ ] T020 Add Personality type with style and budgetWeight properties
- [ ] T021 Modify foodAgent to have "frugal" personality affecting menu decisions
- [ ] T022 Modify decoratorAgent to have "perfectionist" personality affecting decoration proposals
- [ ] T023 Update decision logic to factor in personality traits
- [ ] T024 Add console output showing how personality influences decisions
- [ ] T025 Test: Run multiple times with different personalities, verify observable differences

**Success Criteria**:

- Frugal agent produces budget-conscious choices
- Perfectionist agent produces quality-focused choices
- Personality conflicts create observable debate
- Total additional lines: ~30

**Decision Point**: If personalities don't create observable differences, use simpler agent types

---

### Spike Decision Point (Day 4-5)

**REQUIRED**: Document spike learnings before proceeding

#### Tasks

- [ ] T026 Create docs/spike-results.md documenting what worked and what didn't
- [ ] T027 Update plan.md with learnings: which dependencies are actually needed?
- [ ] T028 Decision: Continue with implementation OR pivot to different approach

**Success Criteria for Continuing**:

- [ ] 2-agent coordination works reliably
- [ ] Voting mechanism adds measurable value
- [ ] Personalities create observable differences
- [ ] Approach seems viable for 4-6 agents

**If Spikes Fail**: Document findings, update spec.md, propose alternative approach (e.g., single smart agent)

---

## Phase 3: User Story 1 - Plan Complete Halloween Party (P1)

**CONDITIONAL**: Only implement if Phase 2 spikes succeed

**Goal**: Core multi-agent party planning functionality

**Independent Test**: Provide party constraints, observe agent collaboration, receive complete party plan

**Dependencies**: Requires successful spike validation

### Foundation Tasks

- [ ] T029 [US1] Create src/types.ts with core types: Agent, Message, PartyPlan, Theme
- [ ] T030 [US1] Create src/agents.ts with ThemeAgent and FoodAgent classes (if spike proved classes needed)
- [ ] T031 [US1] Create src/coordination.ts with message passing logic from successful spike approach

### Agent Implementation Tasks

- [ ] T032 [P] [US1] Implement ThemeAgent.proposeThemes() returning 2-3 theme options in src/agents.ts
- [ ] T033 [P] [US1] Implement FoodAgent.generateMenu() creating theme-aligned menu in src/agents.ts
- [ ] T034 [P] [US1] Implement DecoratorAgent.proposeDecorations() if spike proved 3+ agents valuable in src/agents.ts
- [ ] T035 [P] [US1] Implement PurchaserAgent.estimateCosts() if spike proved budget tracking valuable in src/agents.ts

### Coordination Tasks

- [ ] T036 [US1] Implement consensus voting mechanism based on spike learnings in src/coordination.ts
- [ ] T037 [US1] Add personality trait system if spike proved valuable in src/agents.ts
- [ ] T038 [US1] Implement verbalized sampling (multiple options) if spike proved better than single choice in src/coordination.ts

### Output Tasks

- [ ] T039 [US1] Create src/main.ts as entry point accepting party constraints
- [ ] T040 [US1] Add output formatting to display complete party plan (theme, menu, decorations, budget)
- [ ] T041 [US1] Add message logging to show agent collaboration (console.log or file if spike proved need)

### Integration Test

- [ ] T042 [US1] Test complete flow: Input constraints → agents coordinate → output plan
- [ ] T043 [US1] Verify plan includes theme, menu, decorations, and stays within budget
- [ ] T044 [US1] Verify agent communication is observable in logs

**Success Criteria (US1)**:

- ✅ User provides party constraints (date, budget, guest count, dietary restrictions)
- ✅ Agents coordinate and reach consensus on theme
- ✅ Complete party plan generated (theme, menu, decorations)
- ✅ Agent negotiation visible in output
- ✅ Plan is cohesive and budget-appropriate

---

## Phase 4: User Story 3 - Observe Agent Collaboration (P2)

**CONDITIONAL**: Only implement if US1 succeeds and observation proves valuable

**Goal**: Real-time visibility into agent decision-making

**Independent Test**: Run planning session, verify all agent communications and decisions are logged

**Dependencies**: Requires US1 complete

### Tasks

- [ ] T045 [US3] Enhance message logging with timestamps and agent IDs in src/coordination.ts
- [ ] T046 [P] [US3] Add verbalized sampling output display showing all options with scores
- [ ] T047 [P] [US3] Add personality-driven argument display in negotiation logs
- [ ] T048 [US3] Format output for readability (consider ANSI colors if terminal output)

**Success Criteria (US3)**:

- ✅ All agent communications logged with timestamps
- ✅ Verbalized sampling options visible with confidence scores
- ✅ Personality-driven debates readable in output
- ✅ User can understand agent reasoning from logs

---

## Phase 5: User Story 5 - Curate Halloween Music and Playlist (P2)

**CONDITIONAL**: Only implement if US1 succeeds and music planning adds value

**Goal**: DJ/Playlist agent creates theme-appropriate music plan

**Independent Test**: Run with approved theme, verify playlist aligns with theme and includes progression

**Dependencies**: Requires US1 complete (needs theme selection)

### Tasks

- [ ] T049 [P] [US5] Implement DJAgent.proposePlaylistStrategies() with verbalized sampling in src/agents.ts
- [ ] T050 [P] [US5] Create Playlist and Song types in src/types.ts
- [ ] T051 [US5] Implement music phase structure (arrival, peak, wind-down) in DJAgent
- [ ] T052 [US5] Add theme alignment check between ThemeAgent output and playlist
- [ ] T053 [US5] Test: Verify playlist matches theme, includes phase progression

**Success Criteria (US5)**:

- ✅ DJ agent proposes 3-5 playlist strategies
- ✅ Playlist structured in phases with timing recommendations
- ✅ Music aligns with selected theme
- ✅ Backup playlist suggestions provided

---

## Phase 6: User Story 2 - Adapt Plan to Budget Changes (P2)

**CONDITIONAL**: Only implement if US1 succeeds and re-planning proves necessary

**Goal**: Re-optimize plan when budget changes mid-planning

**Independent Test**: Complete initial plan, change budget, verify selective re-planning

**Dependencies**: Requires US1 complete

### Tasks

- [ ] T054 [US2] Add budget change detection in src/main.ts
- [ ] T055 [US2] Implement selective re-planning: only update affected components
- [ ] T056 [P] [US2] Update PurchaserAgent to propose cost-saving alternatives
- [ ] T057 [P] [US2] Update FoodAgent and DecoratorAgent to adjust plans for new budget
- [ ] T058 [US2] Maintain theme coherence across re-planned components
- [ ] T059 [US2] Test: Start with $800, reduce to $500, verify selective updates

**Success Criteria (US2)**:

- ✅ Budget change triggers re-coordination
- ✅ Only affected portions re-planned (not full restart)
- ✅ New plan within 5% of budget constraint
- ✅ Theme coherence maintained
- ✅ Re-planning completes within 30 seconds

---

## Phase 7: User Story 4 - Manage Guest Invitations and RSVPs (P3)

**CONDITIONAL**: Only implement if US1 succeeds and guest management adds value

**Goal**: Contact Manager generates invitations, tracks RSVPs

**Independent Test**: Provide guest list, verify invitation generation and RSVP tracking

**Dependencies**: Requires US1 complete (needs theme for invitation wording)

### Tasks

- [ ] T060 [P] [US4] Implement ContactManagerAgent.generateInvitations() in src/agents.ts
- [ ] T061 [P] [US4] Create Guest type with contact info and RSVP status in src/types.ts
- [ ] T062 [US4] Add verbalized sampling for invitation wording options
- [ ] T063 [US4] Implement RSVP update mechanism (manual input via CLI)
- [ ] T064 [US4] Add headcount change notifications to FoodAgent and PurchaserAgent
- [ ] T065 [US4] Test: Update RSVP, verify agents adjust plans for new headcount

**Success Criteria (US4)**:

- ✅ Contact Manager generates 3 invitation wording options
- ✅ User can manually update RSVP status
- ✅ Headcount changes trigger plan adjustments
- ✅ Food and purchase quantities adjusted automatically

---

## Phase 8: Polish & Cross-Cutting Concerns

**CONDITIONAL**: Only implement features that spike experiments proved necessary

**Goal**: Add infrastructure only where spike approach broke down

### Optional Enhancements (Only if needed)

- [ ] T066 [P] Add file persistence if in-memory proved insufficient (src/storage.ts)
- [ ] T067 [P] Add CLI framework if argument parsing became complex (consider Commander.js)
- [ ] T068 [P] Add structured logging if console.log proved inadequate (consider Winston)
- [ ] T069 [P] Add validation library if type errors frequent in practice (consider Zod)
- [ ] T070 [P] Add A2A protocol if simple message passing proved insufficient
- [ ] T071 Add error handling for specific failure modes encountered during testing
- [ ] T072 Add performance optimization if response times exceed goals

### Documentation Tasks

- [ ] T073 Update README.md with setup instructions and usage examples
- [ ] T074 Document learnings in docs/implementation-notes.md
- [ ] T075 Create examples/ directory with sample party plans if helpful

**Completion Criteria**:

- Only add infrastructure that solves real problems encountered
- No speculative features
- Document why each enhancement was needed

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)

```
Phase 1 (Setup)
  → Phase 2 (Spikes) ← DECISION POINT
      → Phase 3 (US1) ← MVP COMPLETE
          → Phase 4 (US3) - Can parallelize with US5, US2, US4
          → Phase 5 (US5) - Can parallelize with US3, US2, US4
          → Phase 6 (US2) - Can parallelize with US3, US5, US4
          → Phase 7 (US4) - Can parallelize with US3, US5, US2
              → Phase 8 (Polish)
```

### Parallel Execution Opportunities

**After Phase 1 (Setup) - Can run in parallel**:

- T003, T004, T005 (independent setup tasks)

**After Spike Decision (if continuing) - Can run in parallel**:

- T032, T033, T034, T035 (different agent implementations)
- T046, T047 (different logging enhancements)
- T050, T051 (DJ agent components)
- T056, T057 (re-planning adjustments)
- T060, T061 (contact manager components)
- T066, T067, T068, T069, T070 (infrastructure additions)

**User Story Independence**:

- US3, US5, US2, US4 are independent after US1 completes
- Can implement in any order or parallel
- US1 is prerequisite for all others

---

## Implementation Strategy

### MVP Scope (Week 1)

**Objective**: Validate approach, deliver minimal valuable increment

**Includes**:

- Phase 1: Setup (30 minutes)
- Phase 2: Spike Validation (2-3 days) ← DECISION POINT
- Phase 3: User Story 1 only if spikes succeed (2-3 days)

**Delivers**: Core party planning with 2-3 agents if viable, or documented learnings if not

### Incremental Delivery (Week 2+)

**Only proceed if MVP succeeds**:

- Add US3 (Observation) - enhances transparency
- Add US5 (Music) - adds value without complexity
- Add US2 (Re-planning) - demonstrates adaptability
- Add US4 (Invitations) - completes feature set

### Success Metrics

**Spike Phase**:

- Time to first learning: 2-3 days (not weeks)
- Lines of code: <200 (not thousands)
- Dependencies: 3 (TypeScript, Node, tsx)

**MVP Phase**:

- Core party planning works
- Agent coordination observable
- Plan quality acceptable
- Performance <30s for planning session

### Risk Mitigation

**If spikes fail**:

- Document why multi-agent approach didn't work
- Propose simpler alternative (single agent with structured prompts?)
- Update spec.md with revised requirements
- Pivot within 5 days (not weeks)

**If MVP underperforms**:

- Identify specific bottleneck from spike learnings
- Add targeted infrastructure (not everything at once)
- Iterate based on real problems, not hypothetical ones

---

## Task Format Validation

✅ All tasks follow required format: `- [ ] [ID] [P?] [Story?] Description with file path`
✅ Task IDs sequential: T001-T075
✅ Story labels present for user story phases: [US1], [US2], [US3], [US4], [US5]
✅ Parallel markers [P] on independent tasks
✅ File paths specified in task descriptions
✅ Tasks organized by user story for independent implementation

---

**Generated**: 2025-10-31  
**Total Tasks**: 75  
**Constitution Aligned**: ✅ Experiment-First, Fast Iteration, Minimal Ceremony  
**Next Step**: Begin Phase 1 (Setup) → Phase 2 (Spike Validation)
