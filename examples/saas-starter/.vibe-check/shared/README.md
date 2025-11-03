# Shared Constitutional Rules

This directory contains **base constitutional rules** and **schemas** that apply to ALL projects using vibe-workflow.

---

## 📁 Directory Structure

```
shared/
├── base-constitutional-rules.json     # 12 foundational rules
├── schema/
│   └── constitutional-rules.schema.json  # JSON Schema for validation
└── README.md (this file)
```

---

## 🎯 Base Constitutional Rules

The `base-constitutional-rules.json` file contains **12 foundational rules** that apply to any project:

### Critical Rules (6)
1. **vitest-only** - Always use Vitest for testing (NEVER Jest)
2. **nestjs-version-pinning** - Use NestJS 10.4.20 (NEVER 11.x)
3. **database-with-pg-pool** - Use pg.Pool for PostgreSQL (NEVER TypeORM)
4. **security-best-practices** - Follow OWASP security guidelines
5. **deployment-safety** - Test in staging before production

### High Priority Rules (4)
6. **typescript-strict-mode** - Enable TypeScript strict mode
7. **test-before-commit** - Run tests before committing
8. **explicit-error-handling** - Always handle errors explicitly
9. **code-review-standards** - Require code review before merging
10. **accessibility-requirements** - Meet WCAG 2.1 Level AA standards

### Medium Priority Rules (2)
11. **documentation-requirements** - Document public APIs and decisions
12. **performance-considerations** - Profile before optimizing

---

## 🔗 Rule Inheritance

Your project-specific `constitutional-rules.json` can **inherit** these base rules:

```json
{
  "version": "1.0.0",
  "extends": ["shared/base-constitutional-rules.json"],
  "description": "Rules for my-project",
  "rules": {
    "my-project-specific-rule": {
      "id": "my-project-specific-rule",
      "name": "My Custom Rule",
      "description": "Project-specific requirement",
      "category": "best-practices",
      "severity": "HIGH",
      "enabled": true
    }
  },
  "overrides": {
    "documentation-requirements": {
      "severity": "HIGH"
    }
  }
}
```

### How Inheritance Works

1. **Base rules loaded first** - All 12 rules from `base-constitutional-rules.json`
2. **Project rules added** - Your custom rules in `rules` section
3. **Overrides applied** - Any modifications in `overrides` section

**Example:**
- Base rule: `documentation-requirements` has severity **MEDIUM**
- Override: Change severity to **HIGH** for your project
- Result: Documentation becomes higher priority for your team

---

## 📋 Rule Structure

Each rule has this structure:

```json
{
  "id": "rule-id",
  "name": "Human Readable Name",
  "description": "What this rule requires",
  "category": "testing|security|performance|etc",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "enabled": true,
  "rationale": "Why this rule exists",
  "examples": [
    "Example of correct implementation",
    "Another example"
  ],
  "antiPatterns": [
    "Pattern to avoid",
    "Another anti-pattern"
  ],
  "documentation": "https://link-to-docs.com",
  "automatable": true,
  "validationScript": "scripts/validate-rule.ts"
}
```

### Required Fields
- `id` - Unique identifier (kebab-case)
- `name` - Human-readable name
- `description` - Detailed explanation
- `category` - Rule category
- `severity` - Importance level
- `enabled` - Whether rule is active

### Optional Fields
- `rationale` - Why the rule exists
- `examples` - Code examples (correct implementations)
- `antiPatterns` - What NOT to do
- `documentation` - Link to detailed docs
- `automatable` - Can be automatically checked?
- `validationScript` - Path to validation script

---

## 🔍 JSON Schema Validation

The `schema/constitutional-rules.schema.json` file validates your constitutional rules:

### Features
- ✅ Validates rule structure
- ✅ Ensures required fields present
- ✅ Checks severity levels (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ Validates category names
- ✅ Enforces ID format (kebab-case)

### Usage in VS Code

Add this to your `constitutional-rules.json`:

```json
{
  "$schema": "shared/schema/constitutional-rules.schema.json",
  "version": "1.0.0",
  ...
}
```

VS Code will provide:
- ✅ Auto-completion for rule properties
- ✅ Validation errors for invalid values
- ✅ Documentation tooltips

---

## 🎨 Customizing Base Rules

You **cannot** modify `base-constitutional-rules.json` directly (it's shared across all projects).

Instead, use **overrides** in your project's `constitutional-rules.json`:

### Example: Change Severity

```json
{
  "extends": ["shared/base-constitutional-rules.json"],
  "overrides": {
    "documentation-requirements": {
      "severity": "HIGH"
    }
  }
}
```

### Example: Disable a Rule

```json
{
  "extends": ["shared/base-constitutional-rules.json"],
  "overrides": {
    "performance-considerations": {
      "enabled": false
    }
  }
}
```

### Example: Add Project-Specific Examples

```json
{
  "extends": ["shared/base-constitutional-rules.json"],
  "overrides": {
    "security-best-practices": {
      "examples": [
        "Use our custom auth middleware: @UseGuards(ProjectAuthGuard)",
        "Encrypt PII with our encryption service"
      ]
    }
  }
}
```

---

## 📚 Why Base Rules?

### Benefits of Shared Base Rules

1. **Consistency** - All projects follow same foundational principles
2. **Maintenance** - Update base rules in one place, all projects benefit
3. **Onboarding** - New developers learn common patterns once
4. **Quality** - Proven best practices applied everywhere
5. **Flexibility** - Projects can extend and override as needed

### When to Add Project Rules

Add project-specific rules when:
- ✅ Using framework-specific patterns (e.g., NestJS decorators)
- ✅ Company/team coding standards
- ✅ Domain-specific requirements (e.g., healthcare compliance)
- ✅ Integration patterns (e.g., Stripe webhooks)

### When to Override Base Rules

Override base rules when:
- ✅ Different severity for your project (e.g., documentation HIGH not MEDIUM)
- ✅ Temporarily disabling a rule (with good reason!)
- ✅ Adding project-specific examples or anti-patterns

---

## 🚀 Next Steps

1. **Review base rules** - Understand what's included
2. **Create project rules** - Add your custom requirements in `constitutional-rules.json`
3. **Use vibe-check** - System automatically enforces these rules
4. **Capture learnings** - Use vibe_learn to build institutional memory

---

**Last Updated:** 2024-11-03
**Maintained by:** Vibe-Workflow Project
