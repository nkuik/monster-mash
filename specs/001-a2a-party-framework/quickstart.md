# Quickstart Guide - Monster Mash

**Branch**: `001-a2a-party-framework` | **Date**: 2025-01-16
**Phase**: 1 - Design

## Overview

This guide helps you set up the Monster Mash A2A party planning framework on your local machine and run your first agent swarm collaboration.

**Time to first party plan**: ~15 minutes

---

## Prerequisites

### Required

- **Node.js**: v20+ LTS (check: `node --version`)
- **Package Manager**: pnpm (recommended) or npm
- **Git**: For cloning the repository
- **Terminal**: macOS Terminal, Linux bash, or Windows WSL2

### Optional

- **VS Code**: Recommended IDE with TypeScript support
- **Postman**: For testing A2A API endpoints manually

### System Requirements

- **OS**: macOS, Linux, or Windows (with WSL2)
- **RAM**: 4GB minimum (8GB recommended for 10 concurrent sessions)
- **Disk**: 500MB for dependencies + source code
- **Network**: Internet access for external data queries (read-only)

---

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/monster-mash.git
cd monster-mash
git checkout 001-a2a-party-framework
```

### Step 2: Install Dependencies

Using pnpm (recommended):

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

Using npm:

```bash
npm install
```

**Expected output**:

```text
✓ Installed 127 packages
✓ Built @a2aproject/types
✓ Built monster-mash
```

### Step 3: Verify Installation

```bash
pnpm run build
pnpm run test:unit
```

**Expected output**:

```text
✓ Build successful (123 modules)
✓ 45 tests passed
```

---

## Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Monster Mash Configuration
NODE_ENV=development
LOG_LEVEL=info                    # debug | info | warn | error
AGENT_TIMEOUT_MS=30000            # 30 seconds
STORAGE_PATH=~/.monster-mash      # Local storage location

# A2A Protocol
A2A_PROTOCOL_VERSION=0.3.0
A2A_BASE_PORT=3000                # Agents will use 3000-3005

# MCP Integration (optional)
MCP_ENABLED=false
```

### Agent Personalities (Optional)

Customize agent behaviors in `config/agent-personalities.json`:

```json
{
  "theme_decider": {
    "style": "enthusiastic",
    "priorityWeights": {
      "cost": 0.2,
      "quality": 0.3,
      "convenience": 0.2,
      "novelty": 0.3
    },
    "verbalizedSamplingCount": 3,
    "consensusBias": "quality"
  },
  "food_planner": {
    "style": "practical",
    "priorityWeights": {
      "cost": 0.4,
      "quality": 0.3,
      "convenience": 0.2,
      "novelty": 0.1
    }
  }
}
```

---

## Running Your First Party Plan

### Quick Start (Interactive Mode)

```bash
pnpm run start:cli
```

**Interactive prompts**:

```text
🎉 Welcome to Monster Mash - AI Party Planning

? What type of party? › Halloween
? Guest count? › 50
? Target date? › 2025-10-31
? Budget (USD)? › 500
? Preferences? › family-friendly, indoor

✓ Initializing planning session...
✓ Starting 6 agents: Theme, Food, Contact, Decorator, Purchaser, DJ
✓ Agents negotiating...

[Theme Decider]: Proposing 3 theme options...
  1. Spooky Gothic (score: 0.85)
  2. Playful Pumpkin Patch (score: 0.78)
  3. Haunted Mansion (score: 0.72)

[Decorator]: Reviewing themes... Feedback provided.
[Food Planner]: Reviewing themes... Feedback provided.
[DJ/Playlist]: Reviewing themes... Feedback provided.

[Consensus]: Voting on "Spooky Gothic"...
  ✓ Food Planner: approve
  ✓ Theme Decider: approve
  ✓ Contact Manager: abstain
  ✓ Decorator: approve
  ✓ Purchaser: approve
  ✓ DJ/Playlist: approve

✓ Theme selected: Spooky Gothic

[Food Planner]: Generating menu options...
...

✓ Party plan complete! Saved to ~/.monster-mash/sessions/session-123/party-plan.json
```

---

### Command-Line Mode (Non-Interactive)

```bash
pnpm run monster-mash plan \
  --type halloween \
  --guests 50 \
  --date 2025-10-31 \
  --budget 500 \
  --output ./my-party-plan.json
```

**Output**:

```json
{
  "id": "plan-uuid-456",
  "status": "finalized",
  "theme": {
    "name": "Spooky Gothic",
    "colorScheme": ["#000000", "#8B0000", "#4B0082"]
  },
  "menu": [...],
  "decorations": [...],
  "purchases": [...],
  "playlist": {...}
}
```

---

## Observing Agent Negotiations

### Real-Time Observation Mode

```bash
pnpm run monster-mash observe --session session-123 --verbose
```

**Terminal output** (with ANSI colors):

```text
🎨 [Theme Decider]: Generating 3 theme options...
🍕 [Food Planner]: Waiting for theme selection...
📋 [Contact Manager]: Preparing guest list template...
🎈 [Decorator]: Standby for theme confirmation...

💬 [Theme Decider → All]: "Please review these theme options"
   Option 1: Spooky Gothic (confidence: 85%)
   Option 2: Playful Pumpkin Patch (confidence: 78%)

🎈 [Decorator → Theme Decider]: "Option 1 excellent! Easy to source decorations."
🍕 [Food Planner → Theme Decider]: "Option 1 pairs well with dark desserts."

🗳️  [Orchestrator]: Initiating consensus vote...
   Topic: Final theme selection
   Proposal: Spooky Gothic
   Voting deadline: 30 seconds

✅ [Food Planner]: Approve - "Great for elegant appetizers"
✅ [Theme Decider]: Approve - "My highest confidence option"
⏸️  [Contact Manager]: Abstain - "No strong preference"
✅ [Decorator]: Approve - "Best decoration options"
✅ [Purchaser]: Approve - "Within budget constraints"
✅ [DJ/Playlist]: Approve - "Fits music vibe"

✓ Vote passed: 5 approve, 0 reject, 1 abstain
```

---

## Development Mode

### Start Agent Servers Individually

For debugging specific agents:

```bash
# Terminal 1: Orchestrator
pnpm run dev:orchestrator

# Terminal 2: Theme Decider
pnpm run dev:agent -- --type theme-decider --port 3001

# Terminal 3: Food Planner
pnpm run dev:agent -- --type food-planner --port 3002
```

### Test A2A Communication

```bash
# Send test message to Theme Decider
curl -X POST http://localhost:3001/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-1",
    "method": "message/send",
    "params": {
      "message": {
        "role": "user",
        "parts": [{ "kind": "text", "text": "Generate a theme" }],
        "messageId": "msg-test-1"
      }
    }
  }'
```

**Expected response**:

```json
{
  "jsonrpc": "2.0",
  "id": "test-1",
  "result": {
    "id": "task-xyz",
    "status": { "state": "completed" },
    "artifacts": [...]
  }
}
```

---

## Running Tests

### Unit Tests

```bash
pnpm run test:unit                # All unit tests
pnpm run test:unit -- agents      # Agent-specific tests
pnpm run test:unit -- coordination # Coordination logic tests
```

### Integration Tests

```bash
pnpm run test:integration         # All integration tests
pnpm run test:integration -- orchestrator # Orchestrator contracts
pnpm run test:integration -- consensus    # Consensus voting
```

### End-to-End Tests

```bash
pnpm run test:e2e                 # Full party planning workflows
```

**Sample output**:

```text
✓ Full planning session completes in <30s
✓ All 6 agents participate in consensus
✓ Party plan saved to file system
✓ Handles agent failure gracefully
```

---

## Troubleshooting

### Issue: `pnpm install` fails

**Solution**:

```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Agents not responding

**Check**:

1. All agent ports (3000-3005) are available
2. No firewall blocking localhost connections
3. Check logs: `tail -f ~/.monster-mash/logs/orchestrator.log`

**Restart agents**:

```bash
pnpm run stop:all
pnpm run start:all
```

### Issue: "Agent timeout" errors

**Increase timeout** in `.env`:

```bash
AGENT_TIMEOUT_MS=60000  # Increase to 60 seconds
```

### Issue: Party plan not saving

**Check permissions**:

```bash
ls -la ~/.monster-mash/
chmod -R 755 ~/.monster-mash/
```

---

## Project Structure

```text
monster-mash/
├── src/
│   ├── agents/              # 6 specialized agents
│   │   ├── base/           # BaseAgent with A2A protocol
│   │   ├── food-planner/
│   │   ├── theme-decider/
│   │   └── ...
│   ├── coordination/       # Swarm orchestration
│   ├── communication/      # A2A JSON-RPC client
│   ├── models/            # Domain entities
│   ├── storage/           # File-based persistence
│   ├── cli/               # Command-line interface
│   └── lib/               # Utilities
├── tests/
│   ├── unit/              # Isolated component tests
│   ├── integration/       # Agent interaction tests
│   └── fixtures/          # Test data
├── config/                # Configuration files
├── specs/                 # Specification documents
└── package.json
```

---

## Next Steps

### 1. Explore Example Party Plans

```bash
cat ~/.monster-mash/examples/halloween-party-50-guests.json
```

### 2. Customize Agent Personalities

Edit `config/agent-personalities.json` and restart agents.

### 3. Enable MCP Integration (Optional)

See [MCP Integration Guide](./docs/mcp-integration.md) for external data access.

### 4. Contribute

- Review [Contributing Guidelines](./CONTRIBUTING.md)
- Check [Open Issues](https://github.com/yourusername/monster-mash/issues)
- Join [Discord Community](https://discord.gg/monster-mash)

---

## CLI Reference

### Commands

```bash
monster-mash plan [options]        # Start party planning
monster-mash observe [options]     # Watch agent negotiations
monster-mash status --session <id> # Check planning status
monster-mash export --session <id> # Export party plan
monster-mash agents list           # List running agents
monster-mash agents start          # Start all agents
monster-mash agents stop           # Stop all agents
```

### Options

```bash
--type <string>        Party type (halloween, birthday, wedding, etc.)
--guests <number>      Estimated guest count
--date <date>          Target date (YYYY-MM-DD)
--budget <number>      Total budget in USD
--preferences <list>   Comma-separated preferences
--session <uuid>       Session ID for existing plan
--verbose              Enable detailed logging
--output <path>        Save output to file
```

---

## Resources

- **A2A Protocol**: <https://a2a-protocol.org/latest/specification/>
- **Model Context Protocol**: <https://modelcontextprotocol.io/>
- **TypeScript Docs**: <https://www.typescriptlang.org/docs/>
- **Project Wiki**: <https://github.com/yourusername/monster-mash/wiki>
- **Discord Community**: <https://discord.gg/monster-mash>

---

## Support

- 🐛 **Bug Reports**: <https://github.com/yourusername/monster-mash/issues>
- 💬 **Discussions**: <https://github.com/yourusername/monster-mash/discussions>
- 📧 **Email**: support@monster-mash.dev

---

**Date**: 2025-01-16
**Status**: ✅ Quickstart Guide Complete
**Estimated Setup Time**: 15 minutes
