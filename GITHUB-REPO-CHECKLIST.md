# GitHub Repository Checklist - vibe-check-template

**What to commit to GitHub for a production-ready template repository**

---

## 📦 Files to Commit

### Root Level

```
✅ README.md                    # Main documentation (see GITHUB-README-EXAMPLE.md)
✅ LICENSE                      # MIT or appropriate license
✅ .gitignore                   # Standard Node.js gitignore
✅ init.sh                      # Main installation script (see INIT-SCRIPT-EXAMPLE.sh)
✅ package.json                 # Repository metadata (optional)
```

### Scripts Directory

```
✅ scripts/install.sh           # Dependency installation helper
✅ scripts/validate-setup.sh    # Post-install validation
✅ scripts/update.sh            # Update existing installations
```

### Template Directory (Core Content)

```
✅ template/
   ├── .vibe-check/
   │   ├── constitutional-rules.json.template    # Template with PROJECT_NAME placeholder
   │   │
   │   ├── shared/
   │   │   ├── base-constitutional-rules.json    # 12 universal base rules
   │   │   └── schema/
   │   │       └── constitutional-rules.schema.json
   │   │
   │   └── enhanced-mcp-server/
   │       ├── package.json                      # With proper metadata
   │       ├── package-lock.json                 # Lock file for reproducibility
   │       ├── tsconfig.json                     # TypeScript config
   │       ├── .env.example                      # Environment template
   │       ├── README-ENHANCED.md                # Server documentation
   │       │
   │       ├── src/                              # Full TypeScript source
   │       │   ├── index.ts
   │       │   ├── cli/
   │       │   │   ├── index.ts
   │       │   │   └── validate.ts
   │       │   ├── tools/
   │       │   │   ├── vibeCheck.ts
   │       │   │   ├── vibeLearn.ts
   │       │   │   └── constitution.ts
   │       │   └── utils/
   │       │       ├── storage.ts                # ✅ Project-aware
   │       │       ├── state.ts                  # ✅ Project-aware
   │       │       ├── fileWatcher.ts
   │       │       ├── constitutionalRules.ts
   │       │       └── constitutional/
   │       │           ├── rule-resolver.ts
   │       │           └── session-id.ts
   │       │
   │       └── test/                             # Unit tests (optional)
   │           ├── storage.test.ts
   │           └── constitutional-rules.test.ts
   │
   └── .mcp.json.template                        # MCP config template
```

### Documentation

```
✅ docs/
   ├── SETUP.md                # Detailed setup guide
   ├── USAGE.md                # Usage examples
   ├── ARCHITECTURE.md         # System architecture
   ├── MIGRATION.md            # Migration guide
   ├── CONTRIBUTING.md         # Contribution guidelines
   ├── CHANGELOG.md            # Version history
   │
   └── testing/                # Testing documentation
       ├── README.md
       ├── 1-pre-flight-validation.md
       ├── 4-manual-tests.md
       ├── 5-hot-reload-tests.md
       └── test-results.md.template
```

### Examples

```
✅ examples/
   ├── simple-project/
   │   ├── README.md
   │   └── .vibe-check/
   │       └── constitutional-rules.json
   │
   ├── advanced-project/
   │   ├── README.md
   │   └── .vibe-check/
   │       ├── constitutional-rules.json
   │       └── constitutions/
   │           ├── api-development.json
   │           ├── database-migrations.json
   │           └── testing.json
   │
   └── monorepo/
       ├── README.md
       ├── apps/
       │   ├── api/.vibe-check/
       │   └── web/.vibe-check/
       └── packages/
           └── shared/.vibe-check/
```

### GitHub Workflows (Optional but Recommended)

```
✅ .github/
   ├── workflows/
   │   ├── ci.yml              # Run tests on PR
   │   ├── release.yml         # Automated releases
   │   └── validate-template.yml  # Validate template structure
   │
   ├── ISSUE_TEMPLATE/
   │   ├── bug_report.md
   │   └── feature_request.md
   │
   └── PULL_REQUEST_TEMPLATE.md
```

---

## ❌ Files to EXCLUDE (.gitignore)

```
# Build artifacts
build/
dist/
*.tsbuildinfo

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Project-specific generated files (these are auto-created)
history-*.json
vibe-log-*.json

# Testing
coverage/
.nyc_output/

# Temporary
*.tmp
tmp/
temp/
```

---

## 🏷️ GitHub Repository Metadata

### package.json (Root - Optional)

```json
{
  "name": "vibe-check-template",
  "version": "1.0.0",
  "description": "Project-agnostic constitutional AI system with automatic rule loading and per-project isolation",
  "keywords": [
    "mcp",
    "constitutional-ai",
    "claude",
    "vibe-check",
    "metacognition",
    "pattern-learning"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_ORG/vibe-check-template.git"
  },
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### GitHub Topics

Add these topics to your repository:

```
mcp
model-context-protocol
constitutional-ai
claude
claude-code
vibe-check
metacognition
pattern-learning
typescript
project-template
```

---

## 📝 Template Placeholders

Files that contain placeholders to be replaced by `init.sh`:

### constitutional-rules.json.template

```json
{
  "$schema": "shared/schema/constitutional-rules.schema.json",
  "version": "1.0.0",
  "extends": ["shared/base-constitutional-rules.json"],
  "description": "Constitutional rules for {{PROJECT_NAME}} project",
  "rules": {
    "{{PROJECT_NAME}}-rule-1": {
      "id": "{{PROJECT_NAME}}-rule-1",
      "name": "{{PROJECT_NAME}} Project Rule Example",
      "description": "ALWAYS follow {{PROJECT_NAME}}-specific patterns",
      "category": "best-practices",
      "severity": "HIGH",
      "enabled": true
    }
  }
}
```

**Replaced by init.sh:**
- `{{PROJECT_NAME}}` → Actual project name from directory

### .mcp.json.template

```json
{
  "mcpServers": {
    "pv-bhat-vibe-check-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["{{MCP_SERVER_PATH}}"],
      "env": {
        "GEMINI_API_KEY": "{{GEMINI_API_KEY}}",
        "VIBE_CHECK_STORAGE_DIR": "{{STORAGE_DIR}}",
        "VIBE_CHECK_RULES_FILE": "{{RULES_FILE}}"
      }
    }
  }
}
```

**Replaced by init.sh:**
- `{{MCP_SERVER_PATH}}` → Absolute path to build/index.js
- `{{STORAGE_DIR}}` → Absolute path to .vibe-check/
- `{{RULES_FILE}}` → Absolute path to constitutional-rules.json
- `{{GEMINI_API_KEY}}` → User-provided or placeholder

---

## 🚀 Release Strategy

### Versioning

Use semantic versioning:
- `v1.0.0` - Initial stable release
- `v1.1.0` - New features (hot reload, validation)
- `v1.0.1` - Bug fixes
- `v2.0.0` - Breaking changes

### GitHub Releases

Create releases with:
```
v1.0.0 - Initial Release
- ✅ File-based constitutional rules with inheritance
- ✅ Automatic project detection
- ✅ Per-project storage isolation
- ✅ Pre-flight validation
- ✅ Hot reload (optional)
- ✅ One-line installation script

Assets:
- Source code (zip)
- Source code (tar.gz)
```

### Installation Methods

#### Method 1: One-Line Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/vibe-check-template/main/init.sh | bash -s -- /path/to/project
```

#### Method 2: Clone and Run

```bash
git clone https://github.com/YOUR_ORG/vibe-check-template
cd vibe-check-template
./init.sh /path/to/project
```

#### Method 3: Download Release

```bash
wget https://github.com/YOUR_ORG/vibe-check-template/archive/refs/tags/v1.0.0.tar.gz
tar -xzf v1.0.0.tar.gz
cd vibe-check-template-1.0.0
./init.sh /path/to/project
```

---

## ✅ Pre-Publish Checklist

Before making the repository public:

- [ ] All tests pass (`npm test` in template/enhanced-mcp-server/)
- [ ] Documentation is complete and accurate
- [ ] Examples work correctly
- [ ] `init.sh` tested on clean systems (macOS, Linux)
- [ ] .gitignore excludes all generated files
- [ ] README.md has clear installation instructions
- [ ] LICENSE file is included
- [ ] GitHub Actions workflows are configured
- [ ] Repository topics are set
- [ ] Security: No API keys or secrets committed
- [ ] Validate template structure: All paths relative, no hardcoded absolutes

---

## 🔄 Update Strategy

For existing installations, provide update script:

```bash
# scripts/update.sh
#!/bin/bash
cd .vibe-check/enhanced-mcp-server
git pull origin main  # If using git submodule
npm install
npm run build
npm run validate
```

---

## 📊 Analytics & Tracking

Optional: Add badges to README.md

```markdown
[![Downloads](https://img.shields.io/github/downloads/YOUR_ORG/vibe-check-template/total)](https://github.com/YOUR_ORG/vibe-check-template/releases)
[![Stars](https://img.shields.io/github/stars/YOUR_ORG/vibe-check-template)](https://github.com/YOUR_ORG/vibe-check-template/stargazers)
[![Issues](https://img.shields.io/github/issues/YOUR_ORG/vibe-check-template)](https://github.com/YOUR_ORG/vibe-check-template/issues)
[![License](https://img.shields.io/github/license/YOUR_ORG/vibe-check-template)](LICENSE)
```

---

## 🎯 Success Metrics

Track these metrics post-release:

- GitHub Stars
- Forks
- Issues (bug reports vs feature requests)
- Pull requests
- Downloads (releases)
- Community discussions

---

**Ready to publish? Run through this checklist and make your repository public! 🚀**
