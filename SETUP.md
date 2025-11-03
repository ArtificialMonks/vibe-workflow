# Setup Guide - Vibe Check Enhanced MCP Server

**Complete setup guide for local installation with intelligent rule generation**

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Intelligent Rule Generation](#intelligent-rule-generation)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Method 1: Automatic Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/ArtificialMonks/vibe-workflow
cd vibe-workflow

# Run initialization script
./init.sh /path/to/your/project

# Generate intelligent rules from project docs
cd /path/to/your/project/.vibe-check/enhanced-mcp-server
npx tsx scripts/generate-rules-from-docs.ts /path/to/your/project

# Restart Claude Code
```

### Method 2: Manual Setup

See [Detailed Setup](#detailed-setup) below.

---

## 📦 Detailed Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Gemini API key (get one at https://makersuite.google.com/app/apikey)

### Step 1: Clone the Repository

```bash
git clone https://github.com/ArtificialMonks/vibe-workflow
cd vibe-workflow
```

### Step 2: Run Initialization Script

```bash
./init.sh /path/to/your/project
```

**What this does:**

✅ Creates `.vibe-check/` directory structure
✅ Copies enhanced MCP server to your project
✅ Copies base constitutional rules (12 universal rules)
✅ Installs dependencies
✅ Builds the MCP server
✅ Creates `.mcp.json` configuration
✅ Runs validation

**Files created:**

```
your-project/
├── .vibe-check/
│   ├── constitutional-rules.json          # Basic placeholder rules
│   ├── shared/
│   │   ├── base-constitutional-rules.json # 12 universal base rules
│   │   └── schema/
│   │       └── constitutional-rules.schema.json
│   │
│   └── enhanced-mcp-server/               # Built and ready
│       ├── build/
│       ├── src/
│       ├── scripts/
│       └── package.json
│
└── .mcp.json                              # MCP configuration
```

### Step 3: Generate Intelligent Rules from Project Documentation

This is the **secret sauce** that makes your constitutional rules project-specific!

```bash
cd /path/to/your/project/.vibe-check/enhanced-mcp-server
npx tsx scripts/generate-rules-from-docs.ts /path/to/your/project
```

**What this scans:**

📄 **CLAUDE.md** - Extracts zero-tolerance rules, conventions, and patterns
📄 **README.md** - Understands project purpose and conventions
📄 **package.json** - Detects frameworks and dependencies

**Example output:**

```
🔍 Scanning project documentation...

📊 Project Analysis:
   Name: hivebrowser
   CLAUDE.md: ✅ Found
   README.md: ✅ Found
   Frameworks: NestJS, React, TypeORM
   Patterns: 8 zero-tolerance rules found
   Conventions: 12 conventions found

✅ Generated constitutional rules at:
   /path/to/hivebrowser/.vibe-check/constitutional-rules.json

📝 Generated 4 project-specific rules:

   • hivebrowser Project Patterns (HIGH)
     ALWAYS follow hivebrowser-specific patterns and conventions as defined in CLAUDE.md

   • hivebrowser Framework Conventions (CRITICAL)
     ALWAYS use approved frameworks: NestJS, React

   • hivebrowser Forbidden Patterns (CRITICAL)
     NEVER use TypeORM, NEVER delete package-lock.json

   • Read CLAUDE.md Before Work (HIGH)
     ALWAYS read CLAUDE.md and relevant context files before starting any task

🎯 Next steps:
   1. Review generated rules in .vibe-check/constitutional-rules.json
   2. Customize rules as needed
   3. Run: npm run validate
   4. Restart Claude Code
```

### Step 4: Add Your API Key

Edit `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "pv-bhat-vibe-check-mcp-server": {
      "env": {
        "GEMINI_API_KEY": "your-actual-api-key-here"
      }
    }
  }
}
```

### Step 5: Restart Claude Code

Restart Claude Code to load the new MCP server.

---

## 🎯 Work-Type Specific Constitutional Templates (Advanced)

### What Are Constitutional Templates?

Constitutional templates are **work-type specific rule sets** that auto-load based on what you're working on:

```
📦 Project Structure
├── .vibe-check/
│   ├── constitutions/                    # Work-type rules
│   │   ├── database-migrations.json      # For database work
│   │   ├── api-development.json          # For API work
│   │   ├── ui-components.json            # For UI work
│   │   ├── workflow-automation.json       # For automation
│   │   ├── integration-development.json   # For integrations
│   │   ├── testing.json                   # For testing
│   │   └── deployment.json                # For deployments
│   └── enhanced-mcp-server/               # MCP server
```

### How It Works

When you work with Linear issues labeled with keywords (e.g., `database`, `migration`), the system:

1. Detects your work type from issue labels
2. Loads the appropriate constitutional template (e.g., `database-migrations.json`)
3. Passes rules to `reset_constitution()` MCP tool
4. `vibe_check` now references work-type specific guidance

**Example:** Working on a database migration:
```
Linear Issue: "Add email uniqueness constraint"
Labels: ["database", "migration"]
     ↓
Auto-loads: database-migrations.json (11 rules)
     ↓
vibe_check asks about: IF NOT EXISTS, RLS policies, indexes, triggers
```

### Load Work-Type Rules Manually

```bash
cd .vibe-check/enhanced-mcp-server
npx tsx scripts/load-work-type-constitution.ts database-migrations /path/to/project

# Output:
# 📋 Constitutional Rules for Work Type: database-migrations
#    Total Rules: 12 (11 base + 1 work-type specific)
#    🔴 CRITICAL: 3
#    🟠 HIGH: 6
#    🟡 MEDIUM: 3
#
# ⚡ Work-Type Specific Rules:
#    🔴 Always include `IF NOT EXISTS` clauses
#    🔴 Enable Row Level Security (RLS) for multi-tenant tables
```

### Available Work Types

| Work Type | File | Triggered By | Purpose |
|-----------|------|--------------|---------|
| `database-migrations` | database-migrations.json | `database`, `migration`, `schema` | PostgreSQL schema changes |
| `api-development` | api-development.json | `api`, `backend`, `endpoint` | NestJS API development |
| `ui-components` | ui-components.json | `ui`, `frontend`, `react`, `component` | React/Tailwind components |
| `workflow-automation` | workflow-automation.json | `workflow`, `automation`, `playwright` | Browser automation |
| `integration-development` | integration-development.json | `integration`, `webhook`, `oauth` | Third-party integrations |
| `testing` | testing.json | `test`, `qa`, `e2e` | Testing & QA |
| `deployment` | deployment.json | `deployment`, `ci`, `production` | Deployments & DevOps |

### Auto-Detection Priority

Templates are loaded in priority order (most specific first):
1. Deployment (affects everything)
2. Testing (quality gates)
3. Integration (third-party)
4. Database (schema)
5. Workflow (automation)
6. UI (frontend)
7. API (default)

---

## 🧠 Intelligent Rule Generation

### How It Works

The intelligent rule generator (`scripts/generate-rules-from-docs.ts`) scans your project documentation and automatically creates constitutional rules tailored to your project.

### Scanning Logic

#### 1. **CLAUDE.md Scanning**

Extracts:
- `**NEVER**:` patterns → Zero-tolerance rules (CRITICAL severity)
- `**ALWAYS**:` patterns → Conventions (HIGH severity)
- Framework mentions → Framework rules (CRITICAL severity)

**Example from CLAUDE.md:**

```markdown
### NestJS & Database (ZERO-TOLERANCE)
- **ALWAYS**: NestJS 10.4.20, `@Inject('PG_POOL')` for database
- **NEVER**: NestJS 11.x (lifecycle hang), TypeORM, `@nestjs/typeorm`
- **NEVER delete**: `package-lock.json` (removes version guarantees)
```

**Generated rule:**

```json
{
  "hivebrowser-forbidden": {
    "id": "hivebrowser-forbidden",
    "name": "hivebrowser Forbidden Patterns",
    "description": "NEVER NestJS 11.x (lifecycle hang), TypeORM, @nestjs/typeorm",
    "category": "constraints",
    "severity": "CRITICAL",
    "enabled": true
  }
}
```

#### 2. **package.json Scanning**

Detects frameworks from dependencies:
- `@nestjs/*` → NestJS
- `react` → React
- `typeorm` → TypeORM
- etc.

#### 3. **README.md Scanning**

Understands project purpose and high-level conventions.

### Customizing Generated Rules

After generation, you can:

1. **Edit** `.vibe-check/constitutional-rules.json` directly
2. **Add** new project-specific rules
3. **Adjust** severity levels (CRITICAL, HIGH, MEDIUM, LOW)
4. **Disable** rules by setting `"enabled": false`

**Example customization:**

```json
{
  "rules": {
    "api-versioning": {
      "id": "api-versioning",
      "name": "REST API Versioning",
      "description": "ALWAYS version API endpoints as /api/v1/...",
      "category": "architecture",
      "severity": "CRITICAL",
      "enabled": true,
      "rationale": "Breaking API changes must be versioned",
      "examples": [
        "/api/v1/users",
        "/api/v1/workflows"
      ]
    }
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

Set in `.mcp.json`:

```json
{
  "mcpServers": {
    "pv-bhat-vibe-check-mcp-server": {
      "env": {
        "GEMINI_API_KEY": "your-api-key",
        "DEFAULT_LLM_PROVIDER": "gemini",
        "DEFAULT_MODEL": "gemini-2.5-flash",
        "USE_LEARNING_HISTORY": "true",
        "VIBE_CHECK_STORAGE_DIR": "/absolute/path/to/.vibe-check",
        "VIBE_CHECK_RULES_FILE": "/absolute/path/to/.vibe-check/constitutional-rules.json",
        "VIBE_CHECK_HOT_RELOAD": "false"
      }
    }
  }
}
```

**Important:** Use **absolute paths** for all file references.

### Hot Reload (Development)

Enable file watching for live rule updates:

```json
"VIBE_CHECK_HOT_RELOAD": "true"
```

**Note:** Use a new `sessionId` after hot reload to get updated rules.

### Integration with /vibe-linear Workflow

If you're using `/vibe-linear` workflow with Linear issues:

```bash
# /vibe-linear workflow automatically:
# 1. Reads Linear issue labels
# 2. Detects work type (e.g., "database-migrations")
# 3. Loads constitutional template
# 4. Calls reset_constitution() with work-type rules
# 5. vibe_check references these rules
```

**No additional setup needed** - if you have `.vibe-check/constitutions/` directory, the workflow will use it.

---

## ✅ Verification

### Validate Constitutional Rules

```bash
cd .vibe-check/enhanced-mcp-server
npm run validate
```

**Expected output:**

```
✅ Rules File: constitutional-rules.json
✅ Inheritance Chain: base → project (16 rules)
✅ Severity: 4 CRITICAL, 7 HIGH, 5 MEDIUM
✅ Validation PASSED
```

### Test vibe_check

In Claude Code, run a simple test:

```typescript
// Ask Claude to call vibe_check
vibe_check({
  goal: "Test enhanced MCP server setup",
  plan: "Verify rules are loaded and server is responding",
  sessionId: "test-setup-001"
})
```

### Verify Storage Files Auto-Creation

After first `vibe_check` call:

```bash
ls -lh .vibe-check/history-*.json
# Should show: history-{your-project-name}.json
```

After first `vibe_learn` call:

```bash
ls -lh .vibe-check/vibe-log-*.json
# Should show: vibe-log-{your-project-name}.json
```

**These files are auto-created on first use!** No manual setup needed.

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

**Cause:** Stale MCP server or incorrect paths

**Fix:**
1. Check `.mcp.json` has correct **absolute paths**
2. Restart Claude Code
3. Run `npm run validate` to verify rules
4. Check server logs in Claude Code

### Issue: Intelligent rule generator not finding patterns

**Cause:** CLAUDE.md doesn't use the expected format (`**NEVER**:`, `**ALWAYS**:`)

**Fix:**
1. Review your CLAUDE.md formatting
2. Use explicit `**NEVER**:` and `**ALWAYS**:` prefixes
3. Run generator with verbose output: `npx tsx scripts/generate-rules-from-docs.ts /path/to/project --verbose` (future enhancement)

### Issue: History or learning files not created

**Cause:** Needs first usage to auto-create

**Fix:**
- For `history-*.json`: Call `vibe_check` once
- For `vibe-log-*.json`: Call `vibe_learn` once
- Files auto-create on first use, no manual setup needed

---

## 🎯 Next Steps

After setup:

1. **Review generated rules** in `.vibe-check/constitutional-rules.json`
2. **Customize** rules for your specific project needs
3. **Add work-type specific rules** (optional) in `.vibe-check/constitutions/`
4. **Test the system** with a few `vibe_check` calls
5. **Capture learnings** using `vibe_learn` as you work

---

## 📚 Additional Resources

- **README.md** - Overview and features
- **docs/testing/4-manual-tests.md** - Comprehensive test scenarios
- **shared/schema/constitutional-rules.schema.json** - JSON schema for rules
- **Original vibe-check:** https://github.com/PV-Bhat/vibe-check-mcp-server

---

**Built with ❤️ for intelligent, project-aware Constitutional AI workflows**
