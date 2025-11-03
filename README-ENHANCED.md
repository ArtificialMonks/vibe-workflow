# Vibe-Check MCP Enhanced

**Enhanced fork of [pv-bhat/vibe-check-mcp-server](https://github.com/PV-Bhat/vibe-check-mcp-server) v2.7.4**

Version: `2.8.0-enhanced.1`

## What's Enhanced?

This fork adds **file-based constitutional rules with inheritance support** and **per-project storage configuration**, making vibe-check truly project-agnostic and template-ready.

### New Features

1. **File-Based Constitutional Rules** 📋
   - Load rules from JSON files instead of manual MCP tool calls
   - Full inheritance support (Base → Project → Session)
   - Structured Rule objects with severity, category, rationale, examples
   - Auto-loading on session initialization

2. **Per-Project Storage** 📁
   - Configurable storage directory via `VIBE_CHECK_STORAGE_DIR`
   - No more hardcoded `~/.vibe-check/` paths
   - Perfect for monorepos and project-specific isolation

3. **Rule Inheritance System** 🔗
   - Base rules shared across all projects
   - Project-specific rules extending base rules
   - Override capability with full transparency
   - Circular dependency detection

## Quick Start

### Installation

```bash
# Clone the enhanced server
git clone <this-repository> vibe-check-mcp-enhanced
cd vibe-check-mcp-enhanced

# Install dependencies
npm ci

# Build
npm run build
```

### Configuration

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "pv-bhat-vibe-check-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/path/to/vibe-check-mcp-enhanced/build/index.js"
      ],
      "env": {
        "MCP_TRANSPORT": "stdio",
        "GEMINI_API_KEY": "your-api-key-here",
        "DEFAULT_LLM_PROVIDER": "gemini",
        "DEFAULT_MODEL": "gemini-2.5-flash",
        "USE_LEARNING_HISTORY": "true",
        "VIBE_CHECK_STORAGE_DIR": "${workspaceRoot}/.vibe-check",
        "VIBE_CHECK_RULES_FILE": "${workspaceRoot}/.vibe-check/constitutional-rules.json"
      }
    }
  }
}
```

### Create Constitutional Rules File

**`.vibe-check/constitutional-rules.json`**:

```json
{
  "$schema": "shared/schema/constitutional-rules.schema.json",
  "version": "1.0.0",
  "extends": ["../.vibe-check/shared/base-constitutional-rules.json"],
  "description": "Constitutional rules for my-project",
  "rules": {
    "my-project-rule-1": {
      "id": "my-project-rule-1",
      "name": "Example Project Rule",
      "description": "Your project-specific rule description",
      "category": "architecture",
      "severity": "CRITICAL",
      "enabled": true,
      "rationale": "Why this rule matters for your project",
      "examples": [
        "Example 1: How to follow this rule",
        "Example 2: Common pattern that satisfies this rule"
      ]
    }
  },
  "overrides": {}
}
```

## Environment Variables

### Enhanced Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VIBE_CHECK_STORAGE_DIR` | Per-project storage directory | `/path/to/project/.vibe-check` |
| `VIBE_CHECK_RULES_FILE` | Constitutional rules JSON file | `/path/to/project/.vibe-check/constitutional-rules.json` |

### Standard Configuration (Inherited from Original)

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `OPENROUTER_API_KEY` | OpenRouter API key | Optional |
| `ANTHROPIC_API_KEY` | Anthropic API key | Optional |
| `DEFAULT_LLM_PROVIDER` | LLM provider (`gemini`, `openai`, `anthropic`, `openrouter`) | `gemini` |
| `DEFAULT_MODEL` | Model name | `gemini-2.5-pro` |

## How It Works

### Constitutional Rules Loading

1. **Session Initialization**: When `getConstitution(sessionId)` is first called, the server:
   - Checks `VIBE_CHECK_RULES_FILE` environment variable
   - Falls back to `${VIBE_CHECK_STORAGE_DIR}/constitutional-rules.json`
   - Falls back to `~/.vibe-check/constitutional-rules.json`
   - Loads and resolves rule inheritance using `rule-resolver.ts`
   - Converts structured Rule objects to LLM-friendly strings
   - Stores in-memory for the session

2. **Inheritance Resolution**: The `rule-resolver` from hivebrowser's vibe-check system:
   - Loads base rules from `extends` field (supports multiple parents)
   - Merges project-specific rules
   - Applies overrides with conflict detection
   - Validates final rule set
   - Returns only enabled rules, sorted by severity

3. **Auto-Loading**: Rules are automatically loaded on first `vibe_check` call for a session
   - No manual `update_constitution` calls needed
   - File changes require session restart (new sessionId)
   - Backward compatible with in-memory `update_constitution` calls

### Storage Directory Configuration

The `VIBE_CHECK_STORAGE_DIR` environment variable controls where:
- `vibe-log.json` (learning entries from `vibe_learn`)
- `history.json` (vibe_check interaction history)

are stored. This replaces the hardcoded `~/.vibe-check/` path in the original.

## Architecture

### New Files

```
src/
  utils/
    constitutional/
      rule-resolver.ts      # Hierarchical rule loading with inheritance
      session-id.ts         # Session ID utilities (projectId-workType-linearId-timestamp-uuid)
    constitutionalRules.ts  # File loading, auto-discovery, LLM formatting
    storage.ts              # Enhanced with VIBE_CHECK_STORAGE_DIR support
    state.ts                # Enhanced with VIBE_CHECK_STORAGE_DIR support
  tools/
    constitution.ts         # Enhanced with auto-loading from files
```

### Modified Files

- `storage.ts`: Added `getDataDir()` function supporting `VIBE_CHECK_STORAGE_DIR`
- `state.ts`: Added `getDataDir()` function supporting `VIBE_CHECK_STORAGE_DIR`
- `constitution.ts`: Added `initializeSessionConstitution()` for file-based auto-loading

## Usage Examples

### Basic Usage (Same as Original)

```typescript
// vibe_check tool call
{
  "goal": "Implement user authentication",
  "plan": "1) Add JWT middleware 2) Create auth routes 3) Test with Postman",
  "uncertainties": ["Should we use bcrypt or argon2?"],
  "sessionId": "my-project-feature-AUTH-123-20251103-abc123"
}
```

**What's Different**: The session will automatically have constitutional rules from `.vibe-check/constitutional-rules.json` loaded!

### Advanced: Rule Inheritance

**Base Rules** (`.vibe-check/shared/base-constitutional-rules.json`):
```json
{
  "rules": {
    "no-time-constraints": {
      "id": "no-time-constraints",
      "name": "No Time Constraints",
      "description": "Never include time estimates in todos",
      "severity": "CRITICAL",
      "enabled": true
    }
  }
}
```

**Project Rules** (`.vibe-check/constitutional-rules.json`):
```json
{
  "extends": ["../.vibe-check/shared/base-constitutional-rules.json"],
  "rules": {
    "use-playwright": {
      "id": "use-playwright",
      "name": "Use Playwright for Browser Tests",
      "description": "All browser automation must use Playwright",
      "severity": "HIGH",
      "enabled": true
    }
  },
  "overrides": {
    "no-time-constraints": {
      "severity": "HIGH",
      "reason": "Downgraded for this project"
    }
  }
}
```

**Result**: Session gets 2 rules (base + project), with `no-time-constraints` downgraded to HIGH.

## Testing

### Manual Test

1. Configure `.mcp.json` as shown above
2. Create `.vibe-check/constitutional-rules.json`
3. Restart Claude Code
4. Run a `vibe_check` call with a sessionId
5. Check server logs for:
   ```
   [Constitution:init] Loading file-based rules for session <sessionId> from <path>
   [Constitution:init] Loaded X file-based rules for session <sessionId>
   ```

### Automated Tests (Original Suite)

```bash
npm test
```

## Differences from Original

| Feature | Original | Enhanced |
|---------|----------|----------|
| Storage Path | Hardcoded `~/.vibe-check/` | Configurable via `VIBE_CHECK_STORAGE_DIR` |
| Constitutional Rules | In-memory only, manual MCP calls | File-based with auto-loading |
| Rule Inheritance | Not supported | Full inheritance with override support |
| Project Isolation | Requires wrapper script monkey-patching | Native environment variable support |
| Template Ready | No | Yes - works with init scripts |

## Migration from Original

1. **No Breaking Changes**: The enhanced version is fully backward compatible
2. **Optional Features**: File-based rules are optional; original behavior works without env vars
3. **Wrapper Scripts**: Can remove monkey-patching if using `VIBE_CHECK_STORAGE_DIR`

### Migration Steps

```bash
# 1. Build enhanced version
npm run build

# 2. Update .mcp.json to point to enhanced server
#    Add VIBE_CHECK_STORAGE_DIR and VIBE_CHECK_RULES_FILE env vars

# 3. Create .vibe-check/constitutional-rules.json
#    (See examples above)

# 4. Restart Claude Code

# 5. Verify auto-loading in server logs
```

## Project Template Integration

This enhanced version is designed to work with the project-agnostic template structure:

```
workspace/
  .vibe-check/
    templates/
      project-template/
        constitutional-rules.template.json
        config.template.json
    shared/
      base-constitutional-rules.json
      utils/
        rule-resolver.ts
        session-id.ts
    scripts/
      init-project.ts
    enhanced-mcp-server/   # This enhanced server
      build/
        index.js
```

New projects initialized with `init-project.ts` automatically get:
- Constitutional rules file with inheritance
- MCP configuration with `VIBE_CHECK_STORAGE_DIR` and `VIBE_CHECK_RULES_FILE`
- Isolated storage per project

## Credits

**Original Author**: PV Bhat (https://github.com/PV-Bhat/vibe-check-mcp-server)

**Enhanced By**: artificialmonks (https://github.com/artificialmonks)

**License**: MIT (inherited from original)

## Contributing

This is a fork for internal use within the artificialmonks organization. For contributions to the original vibe-check-mcp-server, see: https://github.com/PV-Bhat/vibe-check-mcp-server

## Changelog

### v2.8.0-enhanced.1 (2025-11-03)

- ✨ Added file-based constitutional rules loading
- ✨ Added rule inheritance system with `rule-resolver.ts`
- ✨ Added `VIBE_CHECK_STORAGE_DIR` environment variable support
- ✨ Added `VIBE_CHECK_RULES_FILE` environment variable support
- ✨ Auto-loading of constitutional rules on session initialization
- ✨ Structured Rule objects with severity, category, rationale, examples
- 🔧 Enhanced `constitution.ts` with file-based loading
- 🔧 Enhanced `storage.ts` and `state.ts` with configurable directories
- 📦 Renamed package to `@artificialmonks/vibe-check-mcp-enhanced`
- 📚 Added comprehensive documentation and `.env.example`

Based on: `@pv-bhat/vibe-check-mcp@2.7.4`
