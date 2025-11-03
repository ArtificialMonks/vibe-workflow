# Constitutional Templates

**Generic, reusable constitutional rule templates for different work types**

---

## Overview

Constitutional templates provide **work-type specific guidance** that automatically loads based on the type of work you're doing. These templates serve as **starting points** that you can customize for your project.

Think of them as **best practice checklists** that adapt to your work context - database rules for migrations, API rules for endpoints, UI rules for components, etc.

---

## Available Templates

| Template | File | Triggered By | Purpose |
|----------|------|--------------|---------|
| **Database Migrations** | `database-migrations.json` | `database`, `migration`, `schema` | Schema changes and migrations |
| **API Development** | `api-development.json` | `api`, `backend`, `endpoint` | REST API and backend development |
| **UI Components** | `ui-components.json` | `ui`, `frontend`, `component`, `react` | Frontend component development |
| **Testing & QA** | `testing.json` | `test`, `testing`, `qa`, `e2e` | Testing and quality assurance |
| **Deployment** | `deployment.json` | `deployment`, `devops`, `ci`, `production` | Deployments and DevOps |
| **Integration Development** | `integration-development.json` | `integration`, `webhook`, `oauth` | Third-party integrations |
| **Workflow Automation** | `workflow-automation.json` | `workflow`, `automation`, `playwright` | Browser automation and workflows |

---

## How to Use These Templates

### Step 1: Copy to Your Project

During initialization, templates are copied to your project:

```bash
./init.sh /path/to/your/project
```

**Result:**
```
your-project/
└── .vibe-check/
    └── constitutions/
        ├── database-migrations.json
        ├── api-development.json
        ├── ui-components.json
        ├── testing.json
        ├── deployment.json
        ├── integration-development.json
        └── workflow-automation.json
```

### Step 2: Customize for Your Project

Edit the templates to match your project's specific needs:

```json
{
  "name": "Database Migrations",
  "description": "Rules for database schema changes",
  "workTypes": ["database", "migration", "schema"],
  "rules": [
    "CRITICAL: Always include IF NOT EXISTS clauses",
    "HIGH: Add indexes for foreign keys",
    "MEDIUM: Include rollback migrations"
  ],
  "antiPatterns": [
    "Running migrations without testing",
    "Missing rollback strategy"
  ]
}
```

**Customization examples:**
- Add framework-specific rules (e.g., "Use Prisma migrations, never raw SQL")
- Add project conventions (e.g., "Follow company naming standards")
- Remove rules that don't apply to your stack
- Adjust severity levels based on your priorities

### Step 3: Use with vibe_check

Constitutional rules auto-load when you work on issues with matching labels:

```
Linear Issue: "Add user email uniqueness"
Labels: ["database", "migration"]
     ↓
Auto-loads: database-migrations.json
     ↓
vibe_check references these rules during planning
```

---

## Template Structure

Each template follows this structure:

```json
{
  "name": string,                    // Display name
  "description": string,             // What this constitution is for
  "workTypes": string[],             // Labels that trigger this template
  "rules": string[],                 // Constitutional rules (CRITICAL/HIGH/MEDIUM/LOW)
  "antiPatterns": string[],          // Known bad patterns to avoid (optional)
  "guidelines": {                    // Additional guidance (optional)
    "key": "value"
  }
}
```

### Rule Severity Prefixes

- `CRITICAL:` - Non-negotiable rules (security, data loss prevention)
- `HIGH:` - Important best practices (maintainability, performance)
- `MEDIUM:` - Standard practices (code quality, documentation)
- `LOW:` - Nice-to-have improvements (optimization, polish)

If no prefix is used, `MEDIUM` is assumed.

---

## Auto-Detection Logic

The system detects work type from issue labels in priority order:

```typescript
// Priority order (most specific first)
1. Deployment    → deployment, devops, ci, production
2. Testing       → test, testing, qa, e2e
3. Integration   → integration, webhook, oauth
4. Database      → database, migration, schema
5. Workflow      → workflow, automation, playwright
6. UI            → ui, frontend, component, react
7. API (default) → api, backend, endpoint
```

**Example:**
- Issue with labels `["database", "api"]` → Loads `database-migrations` (higher priority)
- Issue with labels `["deployment", "database"]` → Loads `deployment` (highest priority)

---

## Examples

### Example 1: Database Migration Rules

```json
{
  "name": "Database Migrations",
  "rules": [
    "CRITICAL: Create database backup before production migration",
    "HIGH: Test on staging environment first",
    "MEDIUM: Document breaking changes"
  ]
}
```

**Usage:**
```
Issue Labels: ["database", "migration"]
     ↓
vibe_check asks:
  ⚠️ "Did you create a database backup first?"
  ⚠️ "Have you tested this on staging?"
  ⚠️ "Did you document any breaking changes?"
```

### Example 2: API Development Rules

```json
{
  "name": "API Development",
  "rules": [
    "CRITICAL: Validate all input parameters",
    "HIGH: Version API endpoints (/api/v1/...)",
    "MEDIUM: Document with OpenAPI/Swagger"
  ]
}
```

**Usage:**
```
Issue Labels: ["api", "backend"]
     ↓
vibe_check asks:
  ⚠️ "Are you validating input parameters?"
  ⚠️ "Is the endpoint versioned?"
  ⚠️ "Will you add API documentation?"
```

---

## Customization Tips

### Add Project-Specific Rules

```json
{
  "rules": [
    // Generic rule
    "CRITICAL: Validate input parameters",

    // Add your project's specifics
    "CRITICAL: Use Zod schemas for validation (project standard)",
    "HIGH: Follow /docs/api-guidelines.md conventions"
  ]
}
```

### Add Framework-Specific Rules

```json
{
  "rules": [
    // For NestJS projects
    "CRITICAL: Use @Inject('PG_POOL') for database (never TypeORM)",

    // For Django projects
    "CRITICAL: Use Django ORM migrations (never raw SQL)",

    // For Express projects
    "HIGH: Use express-validator middleware"
  ]
}
```

### Adjust to Team Standards

```json
{
  "rules": [
    // Change severity based on your priorities
    "CRITICAL: Achieve 90% test coverage (your team requires 90%)",

    // Remove rules that don't apply
    // (Removed: "Use OAuth 2.0" - we use API keys)
  ]
}
```

---

## Integration with Enhanced MCP Server

Constitutional templates integrate with the enhanced MCP server's `reset_constitution()` tool:

```typescript
// Load work-type constitution
import { loadWorkTypeConstitution, detectWorkType } from './scripts/load-work-type-constitution';

// Detect from Linear labels
const workType = detectWorkType(['database', 'migration']);
// Returns: "database-migrations"

// Load template
const constitution = await loadWorkTypeConstitution(workType);

// Pass to MCP server
await reset_constitution(sessionId, constitution.rules);

// Now vibe_check references these rules
```

---

## Maintenance

### Keep Templates Updated

Update templates based on:
- **Team feedback** - If vibe_check misses common issues
- **New project standards** - When conventions change
- **Technology updates** - New framework versions
- **Learning patterns** - Recurring mistakes from vibe_learn

### Review Schedule

- **Weekly** - Check vibe_learn for repeated patterns
- **Monthly** - Sync with project documentation updates
- **Quarterly** - Audit templates against actual practices

---

## Best Practices

### Writing Good Rules

✅ **DO:**
- Be specific: "Use bcrypt for password hashing" (not "hash passwords")
- Make it actionable: "Add Prometheus metrics" (not "add monitoring")
- Reference docs: "Follow /docs/api-guidelines.md"
- Use appropriate severity: CRITICAL for security, HIGH for best practices

❌ **DON'T:**
- Be vague: "make it secure" (how?)
- Be aspirational: "write perfect code" (not actionable)
- Duplicate base rules from constitutional-rules.json
- Make every rule CRITICAL (dilutes meaning)

### Organizing Templates

- **One template per work type** - Don't mix database and API rules
- **Keep rules focused** - 10-15 rules max per template
- **Use antiPatterns** - Helps vibe_check identify problems
- **Update from experience** - Add rules when you find recurring issues

---

## Troubleshooting

### Template Not Loading

**Symptom:** vibe_check doesn't reference expected rules

**Checklist:**
1. Verify issue has correct labels
2. Check auto-detection logic in `load-work-type-constitution.ts`
3. Verify template filename matches work type
4. Check JSON syntax is valid

### Rules Not Enforced

**Important:** Constitutions are **guidance**, not **enforcement**.

vibe_check will:
- ✅ Reference rules when analyzing your plan
- ✅ Ask questions based on constitutional rules
- ✅ Remind you of project standards
- ❌ NOT block you from proceeding

Think of it as a **knowledgeable colleague** reviewing your plan, not a compiler error.

---

## Summary

Constitutional templates provide:
- ✅ **Generic starting points** for 7 common work types
- ✅ **Customizable** to your project's specific needs
- ✅ **Auto-loading** based on issue labels
- ✅ **Context-specific guidance** from vibe_check
- ✅ **Team-shared standards** via git tracking

**Use these templates as starting points, then customize them to match your project's conventions, frameworks, and priorities.**

---

**Next Steps:**
1. Copy templates to your project during initialization
2. Customize rules to match your stack and conventions
3. Test with vibe_check on different issue types
4. Update based on team feedback and learning patterns

**See also:**
- **SETUP.md** - Full setup guide
- **README.md** - Enhanced MCP server overview
- **scripts/load-work-type-constitution.ts** - Loading logic
