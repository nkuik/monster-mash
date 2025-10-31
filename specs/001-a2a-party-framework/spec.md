# Feature Specification: Monster Mash - Agent-to-Agent Party Planning Framework

**Feature Branch**: `001-a2a-party-framework`  
**Created**: 31 October 2025  
**Status**: Draft  
**Input**: User description: "Monster Mash: Agent-to-Agent (A2A) Party Planning Framework with collaborative multi-agent swarm coordination for Halloween party planning using specialized agents with personality traits and verbalized sampling"

**Note**: "A2A" refers to the agent-to-agent collaboration pattern (swarm coordination), NOT the A2A protocol standard (JSON-RPC 2.0, AgentCards, HTTP servers). This is a closed internal swarm using simple TypeScript message passing.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Plan Complete Halloween Party (Priority: P1)

A user with basic party constraints (date, rough budget, approximate guest count) wants the agent swarm to collaboratively plan all aspects of their Halloween party - theme, decorations, food menu, music/playlist, and guest invitations - while being able to observe the agents negotiating and making decisions together.

**Why this priority**: This is the core value proposition - autonomous multi-agent collaboration that produces a cohesive, actionable party plan. Without this, the framework provides no value.

**Independent Test**: Can be fully tested by providing party constraints to the framework, observing agent collaboration through communication logs, and receiving a complete party plan with theme, decorations, food menu, and guest invitation drafts within expected time limits.

**Acceptance Scenarios**:

1. **Given** a user provides party date, budget ($500), guest count (50), and dietary restrictions, **When** the framework initiates planning, **Then** all 6 agents (Food Planner, Theme Decider, Contact Manager, Decorator, Purchaser, DJ/Playlist) spawn and begin coordinating
2. **Given** agents are collaborating on theme selection, **When** Theme Decider proposes 3 theme options using verbalized sampling with confidence scores, **Then** other agents evaluate options and system reaches consensus within 5 minutes
3. **Given** Decorator wants premium decorations but budget is constrained, **When** Decorator and Purchaser agents negotiate, **Then** communication logs show personality-driven debate and either consensus on compromise or escalation to user for decision
4. **Given** agents complete planning, **When** user reviews final plan, **Then** user receives cohesive party plan including theme choice, decoration list with prices, complete menu, curated playlist/music plan, and draft invitations ready to send

---

### User Story 2 - Adapt Plan to Budget Changes (Priority: P2)

A user wants to reduce their party budget mid-planning (e.g., from $800 to $500) and have the agent swarm automatically re-optimize the plan without starting from scratch.

**Why this priority**: Demonstrates adaptive re-planning capability and agent coordination under changing constraints - a key differentiator of the swarm approach.

**Independent Test**: Can be fully tested by running a complete planning session, then modifying budget constraint and verifying agents update only affected portions of the plan while maintaining coherence.

**Acceptance Scenarios**:

1. **Given** agents have completed initial plan with $800 budget, **When** user reduces budget to $500, **Then** Purchaser agent triggers re-coordination and notifies other agents of budget constraint
2. **Given** budget reduction is triggered, **When** agents re-negotiate, **Then** Purchaser presents cost-saving alternatives using verbalized sampling and Food Planner/Decorator adjust their plans accordingly within 30 seconds
3. **Given** re-planning completes, **When** user reviews updated plan, **Then** new plan stays within $500 budget (within 5% tolerance) and maintains theme coherence across decorations and food

---

### User Story 3 - Observe Agent Collaboration (Priority: P2)

A user wants real-time visibility into agent decision-making, including personality-driven negotiations and verbalized sampling outputs, to understand how the plan was formed and optionally intervene.

**Why this priority**: Transparency and user trust - users need to see agent reasoning to feel confident approving the plan. This also makes the personality dynamics engaging rather than opaque.

**Independent Test**: Can be fully tested by running a planning session and verifying that all agent communications, verbalized sampling outputs (multiple options with scores), and negotiation debates are logged and accessible to the user in real-time.

**Acceptance Scenarios**:

1. **Given** agents are collaborating on decoration planning, **When** Decorator generates 5 decoration schemes using verbalized sampling, **Then** user can view all 5 options with feasibility ratings in the UI
2. **Given** Decorator and Purchaser are negotiating budget allocation, **When** debate occurs, **Then** communication logs show each agent's personality-driven arguments (perfectionist vs. budget-conscious) in readable format
3. **Given** agents reach consensus on food menu, **When** Food Planner makes final decision, **Then** user can review reasoning including dietary restrictions addressed and theme alignment justification

---

### User Story 4 - Manage Guest Invitations and RSVPs (Priority: P3)

A user wants Contact Manager agent to send party invitations via their preferred channels (email/SMS) and track RSVPs so that other agents can adjust plans based on accurate headcount.

**Why this priority**: Enhances completeness but not core to swarm planning demonstration - can be simulated or manual in MVP.

**Independent Test**: Can be fully tested by providing guest list with contact info, having Contact Manager generate draft invitation text (with theme-appropriate wording via verbalized sampling), manually updating RSVP status in CLI, and verifying headcount updates trigger Food Planner/Purchaser re-coordination.

**Acceptance Scenarios**:

1. **Given** user provides guest list with contact information, **When** Contact Manager receives approved theme and date, **Then** agent generates 3 draft invitation wording options using verbalized sampling for user to select and manually send
2. **Given** user manually updates RSVP status via CLI, **When** RSVP data changes, **Then** Contact Manager updates headcount and notifies Food Planner and Purchaser of changes
3. **Given** final headcount decreases from 50 to 40, **When** Food Planner receives update, **Then** agent adjusts menu quantities and Purchaser recalculates budget, keeping remaining budget for other enhancements

---

### User Story 5 - Curate Halloween Music and Playlist (Priority: P2)

A user wants DJ/Playlist agent to create a theme-appropriate music plan with curated playlists, considering guest demographics, party atmosphere progression, and theme alignment.

**Why this priority**: Music is critical to party atmosphere and guest experience - this adds significant value beyond basic planning and should be prioritized over purchase simulation mechanics.

**Independent Test**: Can be fully tested by running planning session with approved theme, having DJ/Playlist agent generate multiple playlist options using verbalized sampling, and verifying playlists align with theme and include atmosphere progression (arrival, peak energy, wind-down phases).

**Acceptance Scenarios**:

1. **Given** Theme Decider selects "Haunted Mansion" theme and user provides guest age range (25-35), **When** DJ/Playlist agent begins planning, **Then** agent uses verbalized sampling to propose 3-5 playlist strategies (e.g., classic Halloween hits, modern dark pop, atmospheric instrumental) with mood ratings
2. **Given** DJ/Playlist agent creates playlist, **When** considering party timeline, **Then** agent structures music in phases (welcoming/ambient for arrival, upbeat for peak party, mellower for wind-down) with timing recommendations
3. **Given** user approves playlist strategy, **When** DJ/Playlist agent finalizes plan, **Then** user receives organized playlist with song lists for each phase, streaming service links, and backup playlist suggestions for different crowd energy levels

---

### User Story 6 - Execute Purchase Simulation (Priority: P3)

A user wants Purchaser agent to research actual prices for decorations, food ingredients, and party supplies from real vendors, simulate purchases, and generate organized shopping lists with price comparisons for manual execution.

**Why this priority**: Adds realism and actionable output but purchase simulation can be stubbed with estimates in early MVP.

**Independent Test**: Can be fully tested by running full planning session, having Purchaser research current prices from online vendors, and verifying user receives itemized shopping lists with multiple vendor options and total cost estimates.

**Acceptance Scenarios**:

1. **Given** agents finalize decoration and food lists, **When** Purchaser aggregates purchase needs, **Then** agent queries price sources and presents items organized by vendor with price comparisons
2. **Given** Purchaser finds multiple vendor options, **When** evaluating alternatives, **Then** agent uses verbalized sampling to present 3 purchasing strategies (e.g., all-Amazon, mixed vendors for best prices, local stores) with cost-benefit analysis
3. **Given** user approves purchase simulation, **When** Purchaser completes analysis, **Then** user receives final actionable shopping list with links, estimated costs within 10% of actual market prices, and tracking showing budget used vs. remaining

---

### Edge Cases

- What happens when an agent fails or becomes unresponsive mid-planning? System should detect failure, log it, and either re-spawn the agent or redistribute its responsibilities to remaining agents without full restart.
- How does the system handle conflicting dietary restrictions that cannot all be satisfied simultaneously? Food Planner should use verbalized sampling to propose compromise menus and escalate to user with clear trade-off explanations.
- What if user provides an unrealistic budget constraint (e.g., $50 for 100 guests)? Purchaser should detect infeasibility early, display warning in CLI with minimum viable budget suggestion based on guest count, and prompt user to confirm proceeding with original budget or adjust to recommended amount before full planning begins.
- How do agents handle theme/decoration/food alignment when Theme Decider is unavailable? Decorator and Food Planner should coordinate directly using predefined theme fallbacks and maintain basic coherence.
- What if no vendor/price data is available for certain items? Purchaser should flag unavailable items, use historical averages or estimates, and mark them clearly in shopping list for user manual research.
- What happens when user mid-planning adds a constraint that invalidates already-agreed decisions (e.g., venue change requires different decorations)? System should trigger partial re-planning, agents re-evaluate affected decisions, and user receives notification of which parts of plan changed.
- What if user specifies conflicting music preferences (e.g., both "family-friendly" and "edgy horror" themes)? DJ/Playlist agent should use verbalized sampling to propose compromise playlists and escalate with clear trade-off explanations.
- How does DJ/Playlist agent handle unavailable streaming services or songs? Agent should provide alternative song suggestions and mark unavailable items clearly in playlist with manual research recommendations.

## Requirements _(mandatory)_

### Functional Requirements

#### Agent Lifecycle & Framework

- **FR-001**: Framework MUST spawn 6 specialized agent types (Food Planner, Theme Decider, Contact Manager, Decorator, Purchaser, DJ/Playlist) when party planning task is initiated
- **FR-002**: Each agent MUST be initialized with predefined personality configuration (risk tolerance, budget sensitivity, quality standards, persuasiveness)
- **FR-003**: Framework MUST support dynamic agent addition or removal based on party planning needs (e.g., optional photographer/videographer agent) within the internal TypeScript class system - no external agent discovery or A2A protocol AgentCards required
- **FR-004**: System MUST detect agent failures and either re-spawn failed agent or redistribute responsibilities to remaining agents
- **FR-005**: Framework MUST persist agent state and planning progress to local file system (JSON or YAML format) to allow resumption after interruptions

#### Swarm Coordination & Communication

- **FR-006**: System MUST provide internal message-passing infrastructure for agent-to-agent communication using TypeScript objects and event channels (no A2A protocol, no HTTP, no JSON-RPC 2.0 required)
- **FR-006a**: All 6 agents (Food Planner, Theme Decider, Contact Manager, Decorator, Purchaser, DJ/Playlist) MUST be internal TypeScript classes within the same process - no external agent integration or inter-process communication required
- **FR-007**: System MUST provide broadcast channels for system-wide updates (e.g., budget change notifications)
- **FR-008**: All agent communications MUST be logged with timestamps, agent identities, and message content for user transparency
- **FR-009**: Agents MUST participate in collaborative decision-making discussions where each agent proposes recommendations
- **FR-010**: System MUST implement simple majority voting consensus mechanism where each agent gets one equal vote to determine final decisions
- **FR-011**: System MUST provide conflict resolution protocol when agents have contradictory requirements - if majority voting results in a tie, escalate decision to user for final approval
- **FR-012**: Agents MUST be able to trigger adaptive re-planning when constraints change (e.g., budget reduction, headcount change)
- **FR-013**: System MUST support partial plan updates without full re-planning when only subset of decisions are affected

#### Verbalized Sampling

- **FR-014**: Each agent MUST use verbalized sampling when proposing solutions - generating multiple options (minimum 3) with probability/confidence scores using LLM-based content generation
- **FR-015**: Verbalized sampling outputs MUST include structured format: decision context, array of proposals, confidence/probability score per option (0-1 or percentage), timestamp
- **FR-015a**: LLM outputs for verbalized sampling MUST use Claude's JSON mode to return structured typed objects ensuring reliable parsing and validation
- **FR-016**: System MUST capture and aggregate verbalized sampling outputs across all agents for user visibility
- **FR-017**: Agents MUST use verbalized sampling to propose alternative scenarios when constraints change (e.g., budget reduction triggers cost-saving alternatives)
- **FR-017a**: Agents MUST use rule-based logic for coordination tasks (message routing, voting, consensus calculation) to ensure deterministic and reliable swarm behavior

#### Agent Specialization Capabilities

- **FR-018**: Food Planner agent MUST determine menu based on guest count, dietary restrictions, and theme alignment using LLM-generated content
- **FR-019**: Food Planner agent MUST use verbalized sampling with LLM to generate diverse menu options with probability assessments
- **FR-020**: Theme Decider agent MUST propose Halloween theme options considering venue, guest demographics, and budget
- **FR-021**: Theme Decider agent MUST use verbalized sampling to propose multiple themes with confidence scores
- **FR-022**: Contact Manager agent MUST manage guest list and contact information
- **FR-023**: Contact Manager agent MUST generate draft party invitation text for user to manually send via their preferred communication channels
- **FR-024**: Contact Manager agent MUST provide mechanism for user to manually update RSVP status and notify other agents of final guest count changes
- **FR-025**: Contact Manager agent MUST use verbalized sampling for invitation wording and timing strategies
- **FR-026**: Decorator agent MUST plan decoration strategy based on selected theme and venue
- **FR-027**: Decorator agent MUST provide decoration item list to Purchaser with quantities and specifications
- **FR-028**: Decorator agent MUST use verbalized sampling to generate diverse decoration schemes with feasibility ratings
- **FR-029**: Purchaser agent MUST aggregate purchase needs from all other agents
- **FR-030**: Purchaser agent MUST track budget across all purchases and enforce budget constraints
- **FR-030a**: Purchaser agent MUST validate budget feasibility at planning start and display CLI warning with minimum budget suggestion if user's budget appears insufficient for guest count
- **FR-031**: Purchaser agent MUST negotiate with other agents when budget limits are reached, using personality-driven firmness
- **FR-032**: Purchaser agent MUST simulate purchases by finding items and prices from online vendors
- **FR-033**: Purchaser agent MUST present organized shopping lists with price comparisons across vendors
- **FR-034**: Purchaser agent MUST use verbalized sampling to identify alternative purchasing options with cost-benefit analysis

#### DJ/Playlist Agent Capabilities

- **FR-035**: DJ/Playlist agent MUST create music plan based on selected theme, guest demographics, and party timeline
- **FR-036**: DJ/Playlist agent MUST use verbalized sampling to propose multiple playlist strategies with mood/atmosphere ratings
- **FR-037**: DJ/Playlist agent MUST structure music in phases (arrival/ambient, peak energy, wind-down) with timing recommendations
- **FR-038**: DJ/Playlist agent MUST provide organized playlists with song lists for each phase and streaming service links
- **FR-039**: DJ/Playlist agent MUST coordinate with Theme Decider to ensure music aligns with chosen party theme
- **FR-040**: DJ/Playlist agent MUST propose backup playlist suggestions for different crowd energy levels

#### User Interface & Interaction

- **FR-041**: Users MUST be able to observe agent collaboration in real-time through CLI terminal output displaying communication logs
- **FR-042**: Users MUST be able to view verbalized sampling outputs (multiple options with scores) for each agent decision in terminal output
- **FR-043**: Users MUST be able to provide input or constraints at any stage of planning via text-based CLI prompts
- **FR-044**: Users MUST be able to approve or reject agent recommendations before finalization via CLI prompts (yes/no responses)
- **FR-045**: Users MUST receive final consolidated party plan as formatted terminal output including theme, decorations list, food menu, curated playlists, guest invitation drafts, and shopping lists
- **FR-046**: System MUST provide user approval checkpoints via CLI prompts before major plan changes during adaptive re-planning

#### Purchase Simulation

- **FR-047**: Purchaser agent MUST simulate purchase transactions without executing real financial transactions
- **FR-048**: Purchaser agent MUST obtain current price information by querying publicly available data from online vendors (no authentication required)
- **FR-049**: System MUST track simulated budget usage vs. estimated actual costs with variance reporting
- **FR-050**: System MUST generate final actionable shopping list for user to execute manually, including vendor links and estimated prices

#### LLM Integration

- **FR-050a**: System MUST integrate with Anthropic Claude API (Claude Haiku 4.5 model) for LLM-based content generation requiring valid API key configuration
- **FR-050b**: System MUST handle LLM API failures gracefully by retrying once on failure, then aborting if still failing and logging error details for manual review
- **FR-050c**: System MUST track LLM token usage per planning session for cost monitoring and optimization
- **FR-050d**: System MUST fall back to cached responses or simple templates when LLM calls fail after retry, ensuring planning can continue with degraded quality rather than complete failure

#### Personality-Driven Interactions

- **FR-051**: Agent personalities MUST influence negotiation style during conflict resolution using LLM-generated arguments that reflect personality traits (e.g., perfectionist decorator advocates strongly for quality, budget-conscious purchaser acts as financial gatekeeper)
- **FR-052**: System MUST log personality-driven arguments and debates so users can understand different agent perspectives
- **FR-053**: Personality conflicts MUST create observable engaging dynamics rather than opaque black-box decision-making
- **FR-053a**: Personality traits MUST be implemented as LLM system prompt modifiers that shape generated content while coordination logic remains rule-based
- **FR-053b**: Personality system prompts MUST explicitly instruct agents to generate multiple options (minimum 3) with confidence scores (0-1 scale) as part of their core behavior, embedding verbalized sampling into personality expression
- **FR-053c**: All agent system prompts MUST explicitly instruct the LLM to return ONLY valid JSON with no markdown code fences (no `json` wrappers) and no additional explanatory text to ensure reliable parsing

### Key Entities

- **Party Plan**: Represents complete planning session. Attributes include party date, venue, total budget, guest count, status (planning/finalized), theme choice, finalized decoration list, finalized menu, finalized guest invitations, shopping lists.

- **Agent**: Represents individual planning agent. Attributes include agent ID, agent type (Food Planner, Theme Decider, Contact Manager, Decorator, Purchaser, DJ/Playlist), personality traits (risk tolerance, budget sensitivity, quality standards, persuasiveness), current state, assigned party plan ID, communication log history.

- **Communication Message**: Represents agent-to-agent communication. Attributes include message ID, sender agent ID, recipient agent ID (or broadcast), message content, timestamp, message type (proposal/query/update/negotiation).

- **Verbalized Sampling Output**: Represents multi-option decision output from agent. Attributes include sample ID, agent ID, decision context description, array of proposals (option descriptions), confidence/probability scores per option, timestamp.

- **Guest**: Represents party attendee. Attributes include guest ID, name, contact information (email/phone), dietary restrictions, RSVP status, party plan ID.

- **Purchase Item**: Represents item to be purchased. Attributes include item ID, description, category (decoration/food/supply), quantity needed, requesting agent ID, vendor options (array with vendor name, price, product link), selected vendor, party plan ID.

- **Theme**: Represents Halloween party theme option. Attributes include theme ID, name, description, aesthetic requirements, feasibility score, confidence score from Theme Decider, party plan ID.

- **Menu Item**: Represents food/beverage. Attributes include item ID, name, description, serves count, dietary tags (vegetarian/vegan/gluten-free/etc.), theme alignment score, ingredients list, party plan ID.

- **Decoration Item**: Represents decoration element. Attributes include item ID, description, theme ID, quantity, estimated cost, feasibility rating, party plan ID.

- **Playlist**: Represents music plan. Attributes include playlist ID, name, phase type (arrival/peak/wind-down), theme ID, song list (array with song title, artist, duration), total duration, mood rating, streaming service links, party plan ID.

- **Song**: Represents individual music track. Attributes include song ID, title, artist, duration, genre tags, mood tags (spooky/upbeat/atmospheric/etc.), theme alignment score, streaming availability, playlist ID.

## Success Criteria _(mandatory)_

### Measurable Outcomes

#### Collaboration Effectiveness

- **SC-001**: Agents reach consensus on complete party plan within 5 minutes for standard party scenario (50 guests, $500 budget)
- **SC-002**: Agents successfully resolve at least 90% of conflicts without requiring user intervention
- **SC-003**: Plan coherence score (measuring theme, food, decorations, music logical alignment) exceeds 8/10 in user evaluations
- **SC-004**: Personality-driven negotiations create engaging observable dynamics - users report finding the process entertaining rather than frustrating in at least 75% of test cases
- **SC-005**: DJ/Playlist agent generates playlists that align with theme - theme coherence rating exceeds 7/10 in user evaluations

#### User Experience

- **SC-006**: Users can understand agent reasoning by reviewing decision logs - comprehension verified in 85% of test cases
- **SC-007**: Users can provide new constraints mid-planning and observe plan adaptation within 30 seconds
- **SC-008**: Users report satisfaction with final party plan quality in at least 80% of test cases
- **SC-009**: Verbalized sampling increases perceived option diversity by at least 40% compared to single-option proposals (measured via user feedback surveys)
- **SC-010**: Users successfully approve and execute plans (manual shopping/invitations/playlists) in at least 70% of completed planning sessions
- **SC-011**: Users report satisfaction with music/playlist selection in at least 75% of test cases

#### System Reliability

- **SC-012**: Framework handles agent failures gracefully - planning completes successfully even if one agent fails or is unavailable in 95% of failure scenarios
- **SC-013**: System supports at least 10 concurrent party planning sessions without performance degradation
- **SC-014**: Verbalized sampling generates at least 3-5 distinct options per decision point in 90% of agent proposals
- **SC-015**: System resumes planning after interruption (crash/restart) by loading state from local file system without losing more than last 30 seconds of progress

#### Cost Optimization

- **SC-016**: Purchaser agent keeps simulated spending within 5% of user-specified budget in 85% of planning sessions
- **SC-017**: When budget is reduced mid-planning, agents successfully re-optimize and present cost-saving alternatives within 30 seconds
- **SC-018**: Price comparisons across vendors show at least 15% potential savings between highest and lowest vendor options
- **SC-019**: Purchase simulation provides price estimates within 10% accuracy of actual market prices for at least 80% of items

## Clarifications

### Session 2025-10-31

- Q: What type of user interface should the framework provide for observing agent collaboration and providing inputs? → A: Command-line interface (CLI) with terminal output for logs and text-based prompts
- Q: How should the consensus mechanism work when agents have conflicting recommendations? → A: Simple majority voting - each agent gets one equal vote
- Q: When user provides an infeasible budget (e.g., $50 for 100 guests), how should the system respond? → A: Show warning with minimum budget suggestion, allow user to confirm or adjust
- Q: How should agent state and planning progress be persisted for resumption after interruptions? → A: Persisted to local file system (JSON/YAML files)
- Q: What level of access should the system have to external services for price lookup and invitation sending? → A: Read-only - system queries publicly available price information, invitations manually sent by user
- Q: Do agents use LLM models to generate decisions and verbalized sampling outputs? → A: Hybrid - Agents use LLMs for content generation (menu options, themes, playlists) but rule-based logic for coordination/voting
- Q: Which LLM provider/API should agents use for content generation? → A: Anthropic Claude - Requires API key, paid per token, strong reasoning
- Q: Which Claude model tier should be used for agent content generation? → A: Claude Haiku 4.5 - Faster and more cost-effective than Sonnet 3.5, sufficient quality for party planning content generation (updated 2025-10-31 after Spike 2 validation)
- Q: How should LLM outputs be structured for verbalized sampling (multiple options with confidence scores)? → A: Structured output - Use Claude's JSON mode to return typed objects with option arrays and scores
- Q: What retry and cost control strategy should be used for LLM API calls? → A: Conservative retry - Retry once on failure, abort if still failing, log for manual review
- Q: How should personality system prompts incorporate verbalized sampling behavior? → A: Embed verbalized sampling instructions in each personality system prompt (generate multiple options with confidence scores as part of personality behavior)
- Q: Should Monster Mash support external agent integration via A2A protocol, or is this a closed internal swarm? → A: Closed internal swarm - All 6 agents are internal TypeScript classes using simple message passing (validated by Spike 1-3). No A2A protocol (JSON-RPC 2.0, AgentCards, HTTP servers) implementation required. "A2A" refers to conceptual agent-to-agent collaboration pattern, not the A2A protocol standard.
- Q: Should LLM outputs include markdown code fences or additional text? → A: No - All agent system prompts must explicitly instruct LLMs to return ONLY valid JSON with no markdown code fences (no `json` wrappers) and no additional explanatory text. This prevents parsing failures (observed in Spike 2 before implementing stripMarkdownCodeFences workaround).

```

```
