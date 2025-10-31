# Monster Mash

**An experimental multi-agent party planning framework using TypeScript and Claude AI**

Monster Mash is an agent-to-agent (A2A) Halloween party planning application that coordinates 6 specialized TypeScript agents to collaboratively plan party themes, menus, decorations, purchases, music, and guest lists. It's a playground for exploring multi-agent coordination, LLM-driven content generation, and spec-driven development practices.

**Status**: 🏗️ MVP in development | Spike validation complete ✅

---

## Quick Start

```bash
# Prerequisites: Node.js v24.3.0+, pnpm 10.8.1+
pnpm install

# Set up Anthropic API key
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=your-key-here

# Run spike experiments (validates approach)
pnpm spike-1    # Test 2-agent coordination
pnpm spike-2    # Test LLM integration
pnpm spike-3    # Test personality system

# Run main application
pnpm start -- --budget 500 --guests 50 --date 2025-10-31

# Or run directly
npx tsx src/main.ts --budget 500 --guests 50 --date 2025-10-31
```

---

## What It Does

Monster Mash uses **6 specialized agents** that coordinate through an EventEmitter message bus:

1. **ThemeAgent** 🎨 - Proposes party themes based on constraints
2. **FoodAgent** 🍕 - Generates themed menus and recipes
3. **DecoratorAgent** 🎃 - Suggests decorations matching theme
4. **PurchaserAgent** 💰 - Creates shopping lists with estimated costs
5. **DJAgent** 🎵 - Curates themed playlists
6. **ContactManagerAgent** 📧 - Manages guest list and RSVPs

Agents use **Claude Haiku 4.5** for creative content generation and **majority voting** for consensus. The system can run agents with different **personalities** (Frugal, Perfectionist, Adventurous) to create engaging debates.

**Example Output**:

```json
{
  "theme": "Gothic Vampire Soirée",
  "menu": [
    "Bloody Mary Cocktail Bar",
    "Midnight Charcuterie Board",
    "Vampire's Velvet Cake"
  ],
  "decorations": ["Candlelit chandeliers", "Crimson drapes", "Antique mirrors"],
  "playlist": ["Toccata and Fugue", "Moonlight Sonata", "Dark ambient tracks"],
  "cost_estimate": "$487",
  "planning_time": "18 seconds"
}
```

---

## Prerequisites

**Required**:

- **Node.js**: v24.3.0 or higher ([download](https://nodejs.org/))
- **pnpm**: v10.8.1 or higher (`npm install -g pnpm`)
- **Anthropic API key**: Sign up at [anthropic.com](https://anthropic.com/)

**Optional**:

- Git (for version control)
- VS Code (recommended editor)

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd monster-mash
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs:

- `@anthropic-ai/sdk` (Claude AI integration)
- `dotenv` (environment variable management)
- `typescript`, `tsx`, `@types/node` (TypeScript tooling)

### 3. Configure API Key

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

**Get API key**: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

### 4. Verify Setup

```bash
# Run Spike 1 (no API key needed)
pnpm spike-1

# Expected output: Theme selected, menu generated, 4 messages logged
```

---

## Usage

### Run Spike Experiments

**Validate the technical approach** before running the full application:

```bash
# Spike 1: Test 2-agent coordination (no API key needed)
pnpm spike-1
# Output: Theme selection + menu generation using simple TypeScript functions

# Spike 2: Test LLM integration (requires API key)
pnpm spike-2
# Output: Claude-generated themes + menus with token usage and cost metrics

# Spike 3: Test personality system (requires API key)
pnpm spike-3
# Output: 3 different menu styles (Frugal, Perfectionist, Adventurous) for same theme
```

### Run Main Application

**Basic usage**:

```bash
pnpm start -- --budget 500 --guests 50 --date 2025-10-31
```

**With personality enabled**:

```bash
pnpm start -- --budget 500 --guests 50 --date 2025-10-31 --personality frugal
```

**Available personalities**: `frugal`, `perfectionist`, `adventurous`, `default`

**CLI Options**:

- `--budget <amount>` - Total budget in USD (required)
- `--guests <count>` - Number of guests (required)
- `--date <YYYY-MM-DD>` - Party date (required)
- `--personality <type>` - Agent personality style (optional, default: `default`)
- `--output <file>` - Save plan to JSON file (optional)
- `--verbose` - Show detailed agent communication logs (optional)

**Example with all options**:

```bash
pnpm start -- \
  --budget 1000 \
  --guests 75 \
  --date 2025-10-31 \
  --personality perfectionist \
  --output party-plan.json \
  --verbose
```

**Note**: The `--` is required when using `pnpm start` to pass arguments through to the script. Alternatively, you can run directly with `npx tsx src/main.ts` without the `--`.

---

## Architecture Overview

```
User Inputs (budget, guests, date)
         ↓
    Coordinator ← Event-driven orchestration
         ↓
   Message Bus (EventEmitter)
         ↓
    ┌────┴────────────────────┐
    │  6 Specialized Agents   │
    │  - Theme                │
    │  - Food                 │
    │  - Decor                │
    │  - Purchase             │
    │  - DJ                   │
    │  - Contact              │
    └──────────────────────────┘
         ↓
  Majority Voting Consensus
         ↓
    Party Plan Output (JSON)
```

**Key Design Decisions** (from spike validation):

- ✅ **Internal TypeScript classes** (no HTTP, no JSON-RPC, no A2A AgentCards)
- ✅ **EventEmitter message bus** (simple, synchronous, in-process)
- ✅ **Claude Haiku 4.5** for LLM calls (fast, cheap, creative)
- ✅ **Majority voting** for consensus (rule-based, not LLM-based)
- ✅ **Optional personalities** via system prompts (disabled by default)
- ✅ **Template fallback** when LLM fails (graceful degradation)

**Why these decisions?** See [`docs/spike-results.md`](docs/spike-results.md)

---

## Cost Estimate

**Per planning session**: **$0.02 - $0.05** (validated through Spike 2)

**Breakdown**:

- Claude Haiku 4.5 pricing: $1 input / $5 output per million tokens
- Typical session: 5,000 input tokens + 5,625 output tokens
- Total: ~855 tokens = **$0.003 per agent call**
- 6 agents × 2-3 calls each = **12-15 calls per session**

**Monthly estimates**:
| Sessions/Month | Cost/Month |
|----------------|------------|
| 10 parties | $0.30-0.50 |
| 50 parties | $1.50-2.50 |
| 100 parties | $3.00-5.00 |

✅ **Well under $0.50 per session budget** (10x safety margin)

---

## Project Structure

```
monster-mash/
├── src/                        # Source code
│   ├── main.ts                 # CLI entry point (in progress)
│   ├── spike-1-agents.ts       # Validation: 2-agent coordination ✅
│   ├── spike-2-llm.ts          # Validation: LLM integration ✅
│   ├── spike-3-personality.ts  # Validation: Personality system ✅
│   ├── agents/                 # 6 agent implementations (in progress)
│   ├── coordinator/            # Message bus + voting (in progress)
│   ├── llm/                    # Claude API wrapper (in progress)
│   └── types/                  # TypeScript interfaces (in progress)
├── docs/
│   └── spike-results.md        # Spike validation findings ✅
├── specs/001-a2a-party-framework/
│   ├── spec.md                 # User requirements ✅
│   ├── plan.md                 # Implementation plan ✅
│   ├── tasks.md                # Task breakdown (91 tasks) ✅
│   └── checklists/             # Quality validation ✅
├── .specify/                   # Spec-driven development tooling
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config (strict mode)
└── .env                        # API keys (not committed)
```

---

## Development Workflow

**This project follows experiment-first principles** (see `.specify/memory/constitution.md`):

1. **Spike first**: Prove concepts in 100-200 lines before building infrastructure
2. **Fast iteration**: Ship smallest version that validates an idea
3. **TypeScript-first**: Explicit types, strict mode, linear flow
4. **Minimal ceremony**: No premature abstraction, no tests unless needed
5. **AI-friendly code**: Clear naming, explain WHY in comments

**Running in development mode**:

```bash
pnpm dev  # Watches src/ and auto-reloads on changes
```

**Type checking**:

```bash
npx tsc --noEmit  # Check types without building
```

---

## Understanding the Spike Experiments

Before diving into the code, **run the spikes** to understand the technical approach:

### Spike 1: Agent Coordination (`src/spike-1-agents.ts`)

**Question**: Do we need HTTP, JSON-RPC, or A2A protocol for agents?

**Answer**: No. Simple TypeScript functions with EventEmitter message passing work perfectly.

**What it proves**:

- 2 agents (ThemeAgent + FoodAgent) coordinate successfully
- Theme selection influences menu generation
- Message log tracks 4 agent interactions
- ~140 lines of code, <10ms execution time

**Key code**:

```typescript
const themeAgent: Agent = { id: "theme", decide: (options) => options[0] };
const foodAgent: Agent = { id: "food", decide: (theme) => generateMenu(theme) };

const theme = themeAgent.decide(["Spooky", "Elegant", "Playful"]);
const menu = foodAgent.decide(theme); // Generates theme-appropriate items
```

### Spike 2: LLM Value Proposition (`src/spike-2-llm.ts`)

**Question**: Does Claude AI generate better content than hardcoded templates?

**Answer**: YES. Dramatically more creative, theme-specific, evocative content at minimal cost.

**What it proves**:

- Claude Haiku 4.5 generates rich, descriptive themes (e.g., "Gothic Vampire Soirée - Elegant darkness with candlelit ambiance...")
- Menu items directly reference theme context
- Latency: <2s per call (well under 5s target)
- Cost: $0.003 per call, $0.03-0.05 per full session
- Fallback templates activate on API failure without crashes

**Hardcoded vs LLM comparison**:

- Hardcoded: `["Spooky", "Elegant", "Playful"]`
- LLM: `["Gothic Vampire Soirée - Elegant darkness with candlelit ambiance...", "Enchanted Forest Gathering - Mystical woodland theme...", "Retro Monster Movie Marathon - 1950s sci-fi aesthetic..."]`

### Spike 3: Personality System (`src/spike-3-personality.ts`)

**Question**: Do system prompts create observably different agent behaviors?

**Answer**: YES. Frugal vs Perfectionist vs Adventurous produce dramatically different outputs.

**What it proves**:

- Frugal mentions prices ($0.35-0.75 per serving), "dollar store", "budget"
- Perfectionist suggests caviar, truffle oil, gold leaf (no prices)
- Adventurous proposes bone marrow, charcoal, insects (unconventional)
- Confidence scores vary by risk tolerance (Frugal: 0.82-0.95, Adventurous: 0.55-0.78)
- Debates between personalities would be engaging to observe

**Example outputs for "Haunted Victorian Manor" theme**:

- **Frugal**: "Budget Witch's Cauldron Punch (~$0.50/serving)"
- **Perfectionist**: "Smoked Salmon & Caviar Canapés with crème fraîche"
- **Adventurous**: "Bone Marrow Brûlée in hollowed-out skull bowls"

---

## Performance Targets

| Metric                    | Target                | Validated                         |
| ------------------------- | --------------------- | --------------------------------- |
| Planning session duration | <30s                  | ⏳ Pending MVP                    |
| LLM latency per agent     | <5s                   | ✅ 1.85s (Spike 2)                |
| Cost per session          | <$0.50                | ✅ $0.03-0.05 (Spike 2)           |
| Agent coordination        | Works                 | ✅ 2 agents (Spike 1)             |
| LLM creativity            | Better than templates | ✅ Dramatic improvement (Spike 2) |
| Personality differences   | Observable            | ✅ Dramatic differences (Spike 3) |

---

## Contributing

**Project Status**: Experimental / Learning phase

This is a discovery project for exploring multi-agent coordination and spec-driven development. Contributions welcome, but expect rapid iteration and breaking changes.

**Before contributing**:

1. Read `.specify/memory/constitution.md` for development principles
2. Run spike experiments to understand approach
3. Review `specs/001-a2a-party-framework/spec.md` for requirements
4. Check `specs/001-a2a-party-framework/tasks.md` for open tasks

**Preferred workflow**:

1. Propose spike experiment for new features
2. Validate hypothesis in 100-200 lines
3. Document learnings in `docs/`
4. Then implement full feature if spike succeeds

---

## Resources

**Project Documentation**:

- [Spike Validation Results](docs/spike-results.md) - Technical decisions explained
- [Feature Specification](specs/001-a2a-party-framework/spec.md) - User requirements
- [Implementation Plan](specs/001-a2a-party-framework/plan.md) - Architecture details
- [Task Breakdown](specs/001-a2a-party-framework/tasks.md) - Development roadmap

**External References**:

- [A2A Protocol](https://a2a-protocol.org/latest/specification/) (reference only, not implemented)
- [Model Context Protocol](https://modelcontextprotocol.io/) (future integration)
- [Spec-Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) (methodology)
- [Anthropic Claude API](https://docs.anthropic.com/en/api/getting-started) (LLM integration)

---

## License

[License information to be added]

---

## Troubleshooting

**"ANTHROPIC_API_KEY not found"**:

- Ensure `.env` file exists in project root
- Verify `ANTHROPIC_API_KEY=your-key-here` is set (no quotes, no spaces)
- API key must start with `sk-ant-`

**"Module not found" errors**:

- Run `pnpm install` to install dependencies
- Verify Node.js v24.3.0+ with `node --version`
- Verify pnpm with `pnpm --version`

**"Type check failed"**:

- Run `npx tsc --noEmit` to see specific errors
- Project uses TypeScript strict mode (intentional for robustness)

**"Rate limit exceeded" from Anthropic**:

- Spike experiments make 2-6 API calls
- Wait 60 seconds and retry
- Check API key quota at [console.anthropic.com](https://console.anthropic.com/)

**Spike experiments hang**:

- Spike 1: No API key needed, should complete instantly
- Spike 2-3: Require valid API key, wait up to 10 seconds for LLM calls
- Check network connectivity
- Verify API key is active

---

**Happy planning! 🎃👻🧛**
