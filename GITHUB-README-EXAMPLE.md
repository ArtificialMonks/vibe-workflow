# Vibe-Check Enhanced MCP Server Template

**Project-agnostic constitutional AI system with automatic rule loading, inheritance, and per-project isolation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

## 🚀 Quick Start

### One-Line Installation

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/vibe-check-template/main/init.sh | bash -s -- /path/to/your/project
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/vibe-check-template
cd vibe-check-template

# Run initialization script
./init.sh /path/to/your/project

# Restart Claude Code
# Done! 🎉
```

---

## ✨ What Is This?

Vibe-Check is an **enhanced MCP (Model Context Protocol) server** that provides:

- ✅ **Constitutional AI Rules** - File-based rules with inheritance (Base → Project → Session)
- ✅ **Automatic Project Detection** - Zero manual configuration, auto-detects project name
- ✅ **Per-Project Isolation** - Each project gets its own learning logs and history
- ✅ **Metacognitive Vibe Checking** - Catch tunnel vision before it becomes cascading errors
- ✅ **Pattern Learning** - Record mistakes and solutions for institutional memory
- ✅ **Hot Reload (Optional)** - Live rule updates during development without restart
- ✅ **Pre-Flight Validation** - Catch configuration errors before runtime

---

## 📦 What Gets Installed?

After running `init.sh`, your project will have:

```
your-project/
├── .vibe-check/
│   ├── constitutional-rules.json          # Project-specific rules (auto-created)
│   ├── shared/
│   │   ├── base-constitutional-rules.json # 12 universal base rules
│   │   └── schema/
│   │       └── constitutional-rules.schema.json
│   │
│   ├── enhanced-mcp-server/               # Built and ready to use
│   │   ├── build/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── history-your-project.json          # Auto-created on first vibe_check
│   └── vibe-log-your-project.json         # Auto-created on first vibe_learn
│
└── .mcp.json                              # MCP configuration (auto-generated)
```

---

## 🎯 Key Features

### 1. **Constitutional Rules with Inheritance**

```json
// .vibe-check/constitutional-rules.json
{
  "extends": ["shared/base-constitutional-rules.json"],
  "rules": {
    "your-project-rule-1": {
      "name": "Your Project Rule",
      "description": "ALWAYS follow your project patterns",
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

### 2. **Automatic Project Detection**

No manual configuration needed! The system auto-detects your project name:

```
VIBE_CHECK_STORAGE_DIR = /path/to/MY-PROJECT/.vibe-check
                                    ↓ (auto-extract)
PROJECT_NAME = "MY-PROJECT"
                                    ↓
history-MY-PROJECT.json     ✅ Auto-created
vibe-log-MY-PROJECT.json    ✅ Auto-created
```

### 3. **Three MCP Tools**

#### `vibe_check` - Metacognitive Review
Catch tunnel vision and prevent cascading errors:

```typescript
// Claude Code automatically calls:
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

#### `vibe_learn` - Pattern Capture
Record mistakes and solutions for future prevention:

```typescript
vibe_learn({
  type: "mistake",
  mistake: "Forgot to add database indexes before deploying",
  category: "Premature Implementation",
  solution: "Always run performance validation before production"
})
```

#### `check_constitution` / `update_constitution`
Manage session-specific rules dynamically.

---

## 📊 File-Based Rules System

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
    "api-rule-1": {
      "id": "api-rule-1",
      "name": "REST API Versioning",
      "description": "ALWAYS version API endpoints as /api/v1/...",
      "category": "architecture",
      "severity": "CRITICAL",
      "enabled": true
    }
  }
}
```

---

## 🔧 Configuration

### Environment Variables

Set in `.mcp.json`:

```json
{
  "pv-bhat-vibe-check-mcp-server": {
    "env": {
      "GEMINI_API_KEY": "your-api-key",
      "DEFAULT_LLM_PROVIDER": "gemini",
      "DEFAULT_MODEL": "gemini-2.5-flash",
      "USE_LEARNING_HISTORY": "true",
      "VIBE_CHECK_STORAGE_DIR": "/absolute/path/to/.vibe-check",
      "VIBE_CHECK_RULES_FILE": "/absolute/path/to/constitutional-rules.json",
      "VIBE_CHECK_HOT_RELOAD": "false"
    }
  }
}
```

### Hot Reload (Development)

Enable file watching for live rule updates:

```json
"VIBE_CHECK_HOT_RELOAD": "true"
```

**Note:** Use new `sessionId` after hot reload to get updated rules.

---

## 🧪 Testing & Validation

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

### Manual Integration Tests

See `docs/testing/4-manual-tests.md` for 7 comprehensive test scenarios:
- Constitutional rules auto-load
- Rule inheritance verification
- Per-project storage isolation
- vibe_check history persistence
- Backward compatibility
- Invalid rules handling
- Multi-session isolation

---

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[Usage Guide](docs/USAGE.md)** - Examples and best practices
- **[Architecture](docs/ARCHITECTURE.md)** - System design and internals
- **[Testing](docs/testing/README.md)** - Comprehensive testing procedures
- **[Migration](docs/MIGRATION.md)** - Migrate from generic to project-specific

---

## 🌟 Examples

### Simple Project

Minimal setup with basic rules:

```bash
simple-project/
└── .vibe-check/
    ├── constitutional-rules.json       # 2-3 project rules
    ├── shared/
    │   └── base-constitutional-rules.json
    └── enhanced-mcp-server/
```

### Advanced Project

Full-featured with work-type specific rules:

```bash
advanced-project/
└── .vibe-check/
    ├── constitutional-rules.json       # Main project rules
    ├── constitutions/                  # Work-type overrides
    │   ├── api-development.json
    │   ├── database-migrations.json
    │   └── testing.json
    ├── shared/
    └── enhanced-mcp-server/
```

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
1. Check `.mcp.json` has correct paths (must be absolute)
2. Restart Claude Code
3. Run `npm run validate` to verify rules

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/YOUR_ORG/vibe-check-template
cd vibe-check-template/template/enhanced-mcp-server
npm install
npm run build
npm test
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Original Vibe-Check MCP:** [pv-bhat/vibe-check-mcp-server](https://github.com/pv-bhat/vibe-check-mcp-server)
- **Constitutional AI:** Anthropic's constitutional AI research
- **Model Context Protocol:** Anthropic's MCP specification

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_ORG/vibe-check-template/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_ORG/vibe-check-template/discussions)
- **Documentation:** [docs/](docs/)

---

**Built with ❤️ for project-agnostic Constitutional AI**

---

## 📈 Roadmap

- [ ] Web UI for rule editing
- [ ] Rule analytics dashboard
- [ ] Multi-LLM provider support (OpenAI, Anthropic, etc.)
- [ ] Rule versioning and rollback
- [ ] CI/CD integration examples
- [ ] VS Code extension
