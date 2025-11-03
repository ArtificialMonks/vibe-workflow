# Vibe-Workflow Template Directory

This directory contains the **complete template** that gets copied to user projects during initialization.

---

## 📁 Template Structure

```
template/
├── enhanced-mcp-server/                # Complete MCP server
│   ├── src/                            # TypeScript source code
│   │   ├── index.ts                    # Main entry point
│   │   ├── tools/                      # vibe_check, vibe_learn tools
│   │   └── utils/                      # Storage, state, validation
│   ├── build/                          # Compiled JavaScript
│   ├── scripts/                        # Helper scripts
│   │   ├── intelligent-constitution-generator.ts
│   │   ├── load-work-type-constitution.ts
│   │   └── generate-rules-from-docs.ts
│   ├── package.json                    # Dependencies
│   ├── tsconfig.json                   # TypeScript config
│   ├── .env.example                    # Environment variables template
│   ├── README.md                       # MCP server documentation
│   └── SETUP.md                        # Setup instructions
│
├── shared/                             # Base rules & schemas
│   ├── base-constitutional-rules.json  # 12 foundational rules
│   ├── schema/
│   │   └── constitutional-rules.schema.json
│   └── README.md                       # Shared rules documentation
│
├── constitutions/                      # Work-type templates
│   ├── api-development.json
│   ├── database-migrations.json
│   ├── testing.json
│   ├── deployment.json
│   ├── integration-development.json
│   ├── ui-components.json
│   ├── workflow-automation.json
│   └── README.md
│
└── README.md (this file)
```

---

## 🚀 How the Template Works

### Step 1: User Runs Init Script

```bash
# From vibe-workflow repository
bash init.sh /path/to/my-project
```

### Step 2: Init Copies Template

```bash
# Init script does:
cp -r template/enhanced-mcp-server /path/to/my-project/.vibe-check/enhanced-mcp-server
cp -r template/shared /path/to/my-project/.vibe-check/shared
cp -r template/constitutions /path/to/my-project/.vibe-check/constitutions
```

### Step 3: Init Creates Project-Specific Files

```bash
# Creates constitutional-rules.json with project name:
{
  "version": "1.0.0",
  "extends": ["shared/base-constitutional-rules.json"],
  "description": "Rules for my-project",  // ← PROJECT_NAME inserted
  "rules": { ... }
}
```

### Step 4: Init Installs & Builds

```bash
cd /path/to/my-project/.vibe-check/enhanced-mcp-server
npm install
npm run build
```

### Step 5: Init Creates .mcp.json

```bash
# Creates .mcp.json with absolute paths:
{
  "mcpServers": {
    "pv-bhat-vibe-check-mcp-server": {
      "command": "node",
      "args": ["/path/to/my-project/.vibe-check/enhanced-mcp-server/build/index.js"],
      "env": {
        "VIBE_CHECK_STORAGE_DIR": "/path/to/my-project/.vibe-check",
        "VIBE_CHECK_RULES_FILE": "/path/to/my-project/.vibe-check/constitutional-rules.json"
      }
    }
  }
}
```

---

## 🎯 What Gets Created in User Project

After initialization, user's project has this structure:

```
/path/to/my-project/
├── src/                                # User's code
├── package.json                        # User's dependencies
├── CLAUDE.md                           # User's project guidelines
│
├── .vibe-check/                        # ← CREATED BY INIT
│   ├── enhanced-mcp-server/            # ← Copy of template/enhanced-mcp-server
│   │   ├── src/
│   │   ├── build/
│   │   ├── scripts/
│   │   ├── node_modules/               # ← npm install creates this
│   │   └── package.json
│   │
│   ├── shared/                         # ← Copy of template/shared
│   │   ├── base-constitutional-rules.json
│   │   └── schema/
│   │
│   ├── constitutions/                  # ← Copy of template/constitutions
│   │   ├── api-development.json
│   │   └── ... (7 templates)
│   │
│   ├── constitutional-rules.json       # ← CREATED (project-specific)
│   ├── README.md                       # ← CREATED
│   │
│   ├── history-my-project.json         # ← Auto-created on first vibe_check
│   └── vibe-log-my-project.json        # ← Auto-created on first vibe_learn
│
└── .mcp.json                           # ← CREATED
```

---

## 📝 Files Created vs Auto-Generated

### Created by Init Script
✅ `.vibe-check/enhanced-mcp-server/` (full copy)
✅ `.vibe-check/shared/` (full copy)
✅ `.vibe-check/constitutions/` (full copy)
✅ `.vibe-check/constitutional-rules.json` (generated with PROJECT_NAME)
✅ `.vibe-check/README.md` (created)
✅ `.mcp.json` (created with absolute paths)

### Auto-Created on First Use
⏳ `history-{projectName}.json` - Created when vibe_check is first called
⏳ `vibe-log-{projectName}.json` - Created when vibe_learn is first called

---

## 🔧 Maintaining the Template

### When to Update Template Files

**Update `template/enhanced-mcp-server/`:**
- New MCP server features
- Bug fixes in tools (vibe_check, vibe_learn)
- Performance improvements
- New helper scripts

**Update `template/shared/base-constitutional-rules.json`:**
- New foundational rules (carefully!)
- Improved rule descriptions
- Better examples and anti-patterns
- Bug fixes in existing rules

**Update `template/constitutions/`:**
- New generic work-type templates
- Improved existing templates
- Better rule descriptions

**Update schemas:**
- New rule properties
- Better validation rules
- Documentation improvements

### Version Management

The template uses semantic versioning:

```
template/.vibe-check-version
→ 1.0.0
```

When making breaking changes:
- **Major version** (1.0.0 → 2.0.0) - Breaking changes to structure
- **Minor version** (1.0.0 → 1.1.0) - New features, backward compatible
- **Patch version** (1.0.0 → 1.0.1) - Bug fixes

---

## 🎨 Template vs User Customization

### Template Files (Generic)
- `template/enhanced-mcp-server/` - **No customization needed**
- `template/shared/base-constitutional-rules.json` - **Universal rules**
- `template/constitutions/*.json` - **Generic work-type templates**

These are **project-agnostic** and work for ANY project.

### User-Created Files (Project-Specific)
- `constitutional-rules.json` - **Project-specific rules**
- CLAUDE.md - **Project guidelines** (user creates)
- Customized constitutions - **Generated by intelligent-constitution-generator.ts**

These are **customized** during initialization and ongoing development.

---

## 🧪 Testing the Template

### Test Initialization

```bash
# Create test project
mkdir /tmp/test-vibe-init
cd /tmp/test-vibe-init
echo '{"name":"test-project"}' > package.json

# Run init
bash /path/to/vibe-workflow/init.sh /tmp/test-vibe-init

# Verify structure
ls -la .vibe-check/
ls -la .vibe-check/enhanced-mcp-server/
ls -la .vibe-check/shared/
ls -la .vibe-check/constitutions/

# Test functionality
cd .vibe-check/enhanced-mcp-server
npm run build
npm run validate
```

### Verify All Files Present

```bash
# Check MCP server
test -f .vibe-check/enhanced-mcp-server/build/index.js && echo "✓ MCP server built"

# Check base rules
test -f .vibe-check/shared/base-constitutional-rules.json && echo "✓ Base rules present"

# Check schema
test -f .vibe-check/shared/schema/constitutional-rules.schema.json && echo "✓ Schema present"

# Check constitutions
test -f .vibe-check/constitutions/api-development.json && echo "✓ Constitutions present"

# Check project-specific
test -f .vibe-check/constitutional-rules.json && echo "✓ Project rules created"

# Check MCP config
test -f .mcp.json && echo "✓ MCP config created"
```

---

## 📚 Additional Resources

- **Setup Guide:** `template/enhanced-mcp-server/SETUP.md`
- **Shared Rules:** `template/shared/README.md`
- **Constitutional Templates:** `template/constitutions/README.md`
- **Main Documentation:** Repository root `README.md`

---

## 🔄 Template Update Process

When template is updated:

1. **Update template files** in this directory
2. **Bump version** in `template/.vibe-check-version`
3. **Test on example projects** (`examples/saas-starter/`)
4. **Document changes** in CHANGELOG.md
5. **Create GitHub release**

Users can update their projects:

```bash
# Re-run init (will ask before overwriting)
bash init.sh /path/to/my-project

# Or manually copy updated files
cp -r template/shared/.vibe-check/shared/
```

---

**Last Updated:** 2024-11-03
**Template Version:** 1.0.0
**Maintained by:** Vibe-Workflow Project
