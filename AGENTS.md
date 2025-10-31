# AGENTS.md

## Project Overview

Monster Mash is an experimental multi-agent party planning framework using TypeScript. This is a **discovery project** - we're learning by building, not implementing a predetermined design.

**Current Status**: Design phase with identified over-engineering issues. See `specs/001-a2a-party-framework/over-engineering-analysis.md` for critical simplification recommendations.

## Constitution Principles (CRITICAL)

Read `.specify/memory/constitution.md` before making any changes. Key principles:

- **Experiment-First**: Spike solutions to test hypotheses before building infrastructure
- **Fast Iteration**: Ship smallest version that validates an idea
- **TypeScript-First**: Use TypeScript for type safety
- **AI-Friendly Code**: Clear naming, explicit types, linear flow, explain WHY in comments
- **Minimal Ceremony**: No premature abstraction, no tests unless they help understand correctness

## Setup Commands

```bash
# Install dependencies
pnpm install

# Run TypeScript directly (no build step)
npx tsx src/main.ts

# Development mode
pnpm dev
```

## Project Structure

```
.specify/                    # Project automation and memory
├── memory/constitution.md   # Core principles (READ THIS FIRST)
├── templates/              # Spec templates
└── scripts/                # Automation scripts

specs/001-a2a-party-framework/  # Current feature
├── spec.md                     # User requirements (53 functional requirements)
├── plan.md                     # Implementation plan (WARNING: over-engineered)
├── research.md                 # Technical research
├── data-model.md              # Entity definitions (WARNING: premature)
├── over-engineering-analysis.md # Critical: Read before implementing
├── contracts/                  # A2A protocol message formats
└── quickstart.md              # User guide

src/                        # Source code (create as needed)
```

## Development Philosophy

### Before Writing Code

1. **Read over-engineering-analysis.md** - Contains critical simplification guidance
2. **Start with spike** - Prove concept in 100-200 lines before adding abstractions
3. **Two agents first** - Theme + Food. Add 3rd only if coordination works
4. **No frameworks initially** - No Commander.js, Zod, Winston. Use console.log, plain objects

### What to Build First

**Spike 1 (Day 1, 150 lines)**:

```typescript
// Prove: Can 2 agents coordinate?
type Agent = { id: string; decide: (input: any) => any };
const theme = themeAgent.decide(["Spooky", "Elegant"]);
const menu = foodAgent.decide(theme);
console.log({ theme, menu });
```

**Spike 2 (Day 2, +50 lines)**: Add voting with 3rd agent

**Spike 3 (Day 2, +30 lines)**: Add personality traits - do they matter?

**Decision Point**: After spikes, decide if swarm approach is valuable or pivot

### What NOT to Build First

- ❌ 6 agents (start with 2)
- ❌ A2A JSON-RPC 2.0 protocol (use plain HTTP POST)
- ❌ Zod validation (use TypeScript types)
- ❌ Winston/Pino logging (use console.log)
- ❌ Commander.js CLI (use node script.ts)
- ❌ Complex data model (use simple objects)
- ❌ Test infrastructure (run the code, see if it works)
- ❌ MCP integration (stub external data)

## Code Style

- **TypeScript strict mode** enabled
- **Explicit types** over inference where it helps AI understand intent
- **Comments explain WHY**, not what
- **Linear flow** over clever abstractions
- **No semicolons**, single quotes (Prettier will format)
- **Functional patterns** where they simplify

## File Naming

- `kebab-case.ts` for files
- `PascalCase` for types/interfaces
- `camelCase` for variables/functions

## Testing Instructions

Per constitution: **No tests unless they actively help AI understand correctness**

For spikes:

```bash
# Run directly
npx tsx spike-1-agents.ts

# Check types
npx tsc --noEmit
```

When tests become valuable (post-spike):

```bash
# Run tests (if they exist)
pnpm test

# Type check
pnpm type-check
```

## Current Work Context

**Branch**: `001-a2a-party-framework`

**Immediate Goal**: Implement simplified spike approach, not the over-engineered plan

**Key Files to Reference**:

- `specs/001-a2a-party-framework/spec.md` - What users want (end goal)
- `specs/001-a2a-party-framework/over-engineering-analysis.md` - How to simplify
- `.specify/memory/constitution.md` - Development principles

**Decision Workflow**:

1. Does this code teach us something? → Build it
2. Does it match constitution? → Build it
3. Is it speculative infrastructure? → Skip it

## Agent Communication Pattern (When Ready)

Start simple:

```typescript
type Message = { from: string; to: string; content: any };
const messages: Message[] = [];
```

Only add A2A protocol if simple approach proves insufficient.

## Common Pitfalls

- **Premature abstraction**: Build BaseAgent class only after 2-3 concrete agents exist
- **Over-documenting**: Write code, document what you learn, not what you plan
- **Perfect design**: Ship smallest working version, refactor when patterns emerge
- **Framework adoption**: Prove you need it before adding dependency

## Success Criteria

**Spike Success** (Week 1):

- [ ] 2 agents exchange messages
- [ ] Agents agree on theme
- [ ] Can observe coordination in terminal
- [ ] Learned: Is swarm approach valuable?

**MVP Success** (If spikes succeed):

- [ ] 3-4 agents coordinate
- [ ] Consensus mechanism works
- [ ] User can influence decisions
- [ ] Performance acceptable (<30s for plan)

## Commit Guidelines

- Commit message format: `<type>: <description>`
- Types: `spike`, `feat`, `fix`, `refactor`, `docs`, `chore`
- Examples:
  - `spike: prove 2-agent coordination works`
  - `feat: add voting mechanism`
  - `refactor: extract message passing to module`

## PR Instructions

- **Title format**: `[001-a2a] <description>`
- **Include**: What you learned, not just what you built
- **Check**: Does this align with constitution?
- **Run**: `npx tsc --noEmit` before submitting

## Questions to Ask

Before building something complex:

1. Can I prove this in 50 lines first?
2. Does the constitution say to build this now?
3. What's the smallest version that teaches me something?
4. Am I building infrastructure or learning?

## Resources

- A2A Protocol: <https://a2a-protocol.org/latest/specification/> (reference only, don't implement yet)
- Model Context Protocol: <https://modelcontextprotocol.io/> (defer until needed)
- TypeScript Handbook: <https://www.typescriptlang.org/docs/handbook/intro.html>

## Notes for AI Coding Agents

- **Prioritize constitution alignment** over spec completeness
- **Ask "why build this now?"** before adding complexity
- **Propose spikes** instead of full implementations
- **Challenge over-engineering** - simpler is better
- **Document learnings** from experiments in markdown files
- **Avoid sunk cost fallacy** - pivot if spikes fail

---

**Last Updated**: 2025-10-31
**Status**: Pre-spike phase - design exists but needs simplification before coding
