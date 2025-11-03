# Vibe Check Enhanced MCP Server

**Project-agnostic constitutional AI system with file-based rules, automatic detection, and per-project isolation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

> **Note:** This is an enhanced fork of the [original vibe-check-mcp-server](https://github.com/PV-Bhat/vibe-check-mcp-server) by [Pruthvi Bhat](https://pruthvibhat.com/), tailored for local deployment with file-based constitutional rules and project-agnostic workflows.

---

## 🚀 What Is This?

This enhanced version of Vibe Check MCP provides:

- ✅ **File-Based Constitutional Rules** - JSON-based rules with inheritance (Base → Project → Session)
- ✅ **Automatic Project Detection** - Zero manual configuration, auto-detects project name from directory path
- ✅ **Per-Project Isolation** - Each project gets its own `history-{projectName}.json` and `vibe-log-{projectName}.json`
- ✅ **Metacognitive Vibe Checking** - Catch tunnel vision before cascading errors (from original vibe-check)
- ✅ **Pattern Learning** - Record mistakes and solutions for institutional memory
- ✅ **Hot Reload (Optional)** - Live rule updates during development without restart
- ✅ **Pre-Flight Validation** - Catch configuration errors before runtime

---

## 🎯 Key Differences from Original

| Feature | Original vibe-check-mcp | This Enhanced Version |
|---------|------------------------|----------------------|
| **Deployment** | Global npm package (`npx @pv-bhat/vibe-check-mcp`) | **Local per-project installation** |
| **Constitutional Rules** | Runtime-only (in-memory via `update_constitution`) | **File-based with JSON inheritance** |
| **Project Awareness** | Single global instance | **Per-project isolation with auto-detection** |
| **Configuration** | Manual environment variables | **Auto-configured via init script** |
| **Storage** | Generic filenames (`history.json`, `vibe-log.json`) | **Project-specific filenames** (`history-{projectName}.json`) |
| **Setup** | npm install + manual config | **Zero-config with automatic setup** |

---

## 📦 Local Installation (Recommended)

This enhanced version is designed to run **locally per project**, not as a global npm package.

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# 1. Navigate to your project directory
cd /path/to/your/project

# 2. Create .vibe-check directory structure
mkdir -p .vibe-check/enhanced-mcp-server

# 3. Clone or copy this enhanced MCP server
# (From GitHub repo or local source)
cp -r /path/to/enhanced-mcp-server/* .vibe-check/enhanced-mcp-server/

# 4. Install dependencies
cd .vibe-check/enhanced-mcp-server
npm install

# 5. Build the server
npm run build

# 6. Run validation (optional but recommended)
npm run validate
```

---

## 🏗️ Directory Structure After Installation

```
your-project/
├── .vibe-check/
│   ├── constitutional-rules.json          # Project-specific rules (auto-created)
│   ├── shared/
│   │   ├── base-constitutional-rules.json # 12 universal base rules
│   │   └── schema/
│   │       └── constitutional-rules.schema.json
│   │
│   ├── enhanced-mcp-server/               # This MCP server (built)
│   │   ├── build/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── history-your-project.json          # Auto-created on first vibe_check
│   └── vibe-log-your-project.json         # Auto-created on first vibe_learn
│
└── .mcp.json                              # MCP configuration (create manually)
```

---

## ⚙️ Configuration

### 1. Create `.mcp.json` in your project root

```json
{
  "mcpServers": {
    "pv-bhat-vibe-check-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/your-project/.vibe-check/enhanced-mcp-server/build/index.js"
      ],
      "env": {
        "MCP_TRANSPORT": "stdio",
        "GEMINI_API_KEY": "your-gemini-api-key",
        "DEFAULT_LLM_PROVIDER": "gemini",
        "DEFAULT_MODEL": "gemini-2.5-flash",
        "USE_LEARNING_HISTORY": "true",
        "VIBE_CHECK_STORAGE_DIR": "/absolute/path/to/your-project/.vibe-check",
        "VIBE_CHECK_RULES_FILE": "/absolute/path/to/your-project/.vibe-check/constitutional-rules.json",
        "VIBE_CHECK_HOT_RELOAD": "false"
      }
    }
  }
}
```

**Important:** Use **absolute paths** for all file references.

### 2. Create constitutional rules file

Create `.vibe-check/constitutional-rules.json`:

```json
{
  "$schema": "shared/schema/constitutional-rules.schema.json",
  "version": "1.0.0",
  "extends": ["shared/base-constitutional-rules.json"],
  "description": "Constitutional rules for your-project",
  "rules": {
    "your-project-rule-1": {
      "id": "your-project-rule-1",
      "name": "Your Project Rule Example",
      "description": "ALWAYS follow your-project-specific patterns",
      "category": "best-practices",
      "severity": "HIGH",
      "enabled": true
    }
  }
}
```

### 3. Restart Claude Code

After configuration, restart Claude Code to load the enhanced MCP server.

---

## 🎯 How It Works: Automatic Project Detection

The server automatically extracts your project name from the directory path:

```
VIBE_CHECK_STORAGE_DIR = /path/to/MY-PROJECT/.vibe-check
                                ↓ (auto-extract)
PROJECT_NAME = "MY-PROJECT"
                                ↓
history-MY-PROJECT.json     ✅ Auto-created
vibe-log-MY-PROJECT.json    ✅ Auto-created
```

No manual configuration needed! Each project automatically gets isolated storage.

---

## 📚 File-Based Constitutional Rules with Inheritance

### Base Rules (12 Universal)

Located in `.vibe-check/shared/base-constitutional-rules.json`:

1. **No Time Constraints** (CRITICAL)
2. **Read Before Edit** (CRITICAL)
3. **Parallel Tool Execution** (HIGH)
4. **Critical Assessment Approach** (HIGH)
5. **Evidence-Based Conclusions** (HIGH)
6. **Substance Over Praise** (MEDIUM)
7. **Use Task Tool for Open-Ended Search** (MEDIUM)
8. **Use Specialized Tools Over Bash** (MEDIUM)
9. **NO Automated Code Modification Scripts** (CRITICAL)
10. **Single Source of Truth for MCP** (HIGH)
11. **TodoWrite for Complex Tasks** (MEDIUM)
12. **Read Source Documentation First** (HIGH)

### Project Rules (Your Custom)

Add project-specific rules in `.vibe-check/constitutional-rules.json`:

```json
{
  "extends": ["shared/base-constitutional-rules.json"],
  "rules": {
    "api-versioning": {
      "id": "api-versioning",
      "name": "REST API Versioning",
      "description": "ALWAYS version API endpoints as /api/v1/...",
      "category": "architecture",
      "severity": "CRITICAL",
      "enabled": true
    }
  }
}
```

**Inheritance Chain:**
```
Base Rules (12 universal)
    ↓ extends
Project Rules (your custom rules)
    ↓ loaded into
Session Constitution (runtime)
```

---

## 🛠️ MCP Tools

### `vibe_check` - Metacognitive Review

Catch tunnel vision and prevent cascading errors:

```typescript
vibe_check({
  goal: "Implement user authentication",
  plan: "1. Add JWT middleware 2. Create login endpoint 3. Test",
  uncertainties: ["Should we use OAuth or JWT?"],
  sessionId: "auth-feature-001"
})

// Returns thoughtful critique:
// "Have you considered password reset flow?
//  What about rate limiting on login attempts?"
```

### `vibe_learn` - Pattern Capture

Record mistakes and solutions for future prevention:

```typescript
vibe_learn({
  type: "mistake",
  mistake: "Forgot to add database indexes before deploying",
  category: "Premature Implementation",
  solution: "Always run performance validation before production"
})
```

### `check_constitution` / `update_constitution`

Manage session-specific rules dynamically (inherited from original vibe-check).

---

## 🧪 Validation & Testing

### Pre-Flight Validation

Catch configuration errors before runtime:

```bash
cd .vibe-check/enhanced-mcp-server
npm run validate

# Output:
# ✅ Rules File: constitutional-rules.json
# ✅ Inheritance Chain: base → project (14 rules)
# ✅ Severity: 3 CRITICAL, 6 HIGH, 5 MEDIUM
# ✅ Validation PASSED
```

### Hot Reload (Development)

Enable file watching for live rule updates:

```json
"VIBE_CHECK_HOT_RELOAD": "true"
```

**Note:** Use new `sessionId` after hot reload to get updated rules.

---

## 🔧 Development

### Build from Source

```bash
cd .vibe-check/enhanced-mcp-server
npm install
npm run build
npm run validate
```

### Environment Variables

Set in `.mcp.json`:

- `GEMINI_API_KEY` - Your Gemini API key (required)
- `VIBE_CHECK_STORAGE_DIR` - Absolute path to `.vibe-check/` directory
- `VIBE_CHECK_RULES_FILE` - Absolute path to `constitutional-rules.json`
- `VIBE_CHECK_HOT_RELOAD` - Enable file watching (`true` / `false`)
- `DEFAULT_LLM_PROVIDER` - LLM provider (`gemini`, `openai`, `anthropic`)
- `DEFAULT_MODEL` - Model name (e.g., `gemini-2.5-flash`)

---

## 🚧 Troubleshooting

### Issue: "Rule set file not found"

**Cause:** Incorrect `extends` path in constitutional-rules.json

**Fix:**
```json
// ✅ Correct (relative to rules file):
"extends": ["shared/base-constitutional-rules.json"]

// ❌ Wrong:
"extends": [".vibe-check/shared/base-constitutional-rules.json"]
```

### Issue: "Validation failed"

**Cause:** JSON syntax error or missing required fields

**Fix:**
```bash
npm run validate  # See detailed error with line/column
```

### Issue: Rules not loading in Claude Code

**Cause:** Stale MCP server

**Fix:**
1. Check `.mcp.json` has correct **absolute paths**
2. Restart Claude Code
3. Run `npm run validate` to verify rules

---

## 🙏 Acknowledgments

- **Original Vibe-Check MCP:** [pv-bhat/vibe-check-mcp-server](https://github.com/PV-Bhat/vibe-check-mcp-server) by [Pruthvi Bhat](https://pruthvibhat.com/)
- **Constitutional AI:** Anthropic's constitutional AI research
- **Model Context Protocol:** Anthropic's MCP specification
- **CPI Research:** [Chain-Pattern Interrupt (MURST)](https://doi.org/10.5281/zenodo.14851363)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Original vibe-check-mcp:** https://github.com/PV-Bhat/vibe-check-mcp-server
- **MCP Specification:** https://anthropic.com/mcp
- **CPI Research Paper:** http://dx.doi.org/10.13140/RG.2.2.18237.93922

---

**Built with ❤️ for project-agnostic Constitutional AI workflows**

**Enhanced for local deployment and file-based rule management**
