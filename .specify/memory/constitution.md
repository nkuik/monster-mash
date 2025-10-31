<!--
Sync Impact Report:
Version: 0.0.0 → 0.1.0
Changes:
  - Initial constitution draft
  - Added 5 core principles: Experiment-First, TypeScript-First, Fast Iteration, AI-Friendly, Minimal Ceremony
  - Added Technology Constraints section
  - Added Development Philosophy section
Templates Status:
  - ⚠ .specify/templates/plan-template.md - Needs alignment with experimental workflow
  - ⚠ .specify/templates/spec-template.md - Should reflect "spike first, spec later" approach
  - ⚠ .specify/templates/tasks-template.md - May need "experiment" task type
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Set when team formally adopts this constitution
-->

# Monster Mash Constitution

## Core Principles

### I. Experiment-First

This is a discovery project. Speed of learning > robustness. Spike solutions to test hypotheses, then decide if they warrant cleanup. Breaking things is encouraged if it teaches something. Document what you learn, not just what you build.

### II. TypeScript-First

Use TypeScript wherever possible for type safety and IDE support. The learning curve is worth the productivity gains and reduced debugging time. Exceptions: shell scripts, build configs where TS adds friction.

### III. Fast Iteration Over Perfect Design

Ship the smallest version that validates an idea. No premature abstraction. No tests unless they actively help the AI assistant understand correctness or prevent specific known regressions. Refactor when patterns emerge naturally from usage, not speculatively.

### IV. AI-Friendly Code

Write code that AI assistants can easily understand and modify. This means: clear naming, explicit types, linear flow over clever tricks, comments explaining WHY decisions were made. The AI is a primary collaborator here.

### V. Minimal Ceremony

No process for process's sake. Documentation only when it aids discovery or collaboration. Versioning can be loose (date-based snapshots work fine). Architecture decisions captured as lightweight ADRs only when they'll save future confusion.

## Technology Constraints

**Language**: TypeScript (Node.js runtime)  
**Package Manager**: npm or pnpm (lock files committed)  
**Build Tool**: Simple - prefer `tsx` for direct TS execution over complex build pipelines  
**Dependencies**: Use standard libraries first. External deps require justification (what problem does this solve that we can't easily write ourselves?).

## Development Philosophy

### Spike → Assess → Evolve

1. Try the idea (spike implementation)
2. Does it work? Does it teach us something?
3. Keep and iterate, or discard and pivot

### Documentation as Discovery Log

Use markdown files to capture:

- What we tried
- What worked / didn't work
- Open questions
- Next experiments to try

Not required: formal specs, test coverage reports, change logs.

### AI Assistant Protocol

When working with AI:

- Provide context files explicitly
- Ask for explanations of why, not just what
- Request type-safe solutions
- Prefer code blocks over prose descriptions

## Governance

This constitution is a living document optimized for solo or small-team experimentation. It can be updated freely without formal process since discovery projects need flexibility.

**Principle**: When in doubt, bias toward action over planning.

**Breaking the Rules**: These principles are guidelines, not laws. Break them when you have good reason, but leave a comment explaining why so future you (or the AI) understands the tradeoff.

**Version History**: Track major philosophical shifts (what we learned that changed our approach) but don't sweat patch-level changes.

**Version**: 0.1.0 | **Ratified**: 2025-10-31 | **Last Amended**: 2025-10-31
