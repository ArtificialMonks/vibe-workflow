# SaaS Starter - Full-Stack Example Project

This is a **complete working example** of how to use `vibe-workflow` (the enhanced vibe-check MCP system) in a production-grade SaaS application.

## 📋 What This Demonstrates

This example shows:
- ✅ **Real-world SaaS tech stack** (NestJS, React, PostgreSQL, Stripe, WebSockets)
- ✅ **Project-specific CLAUDE.md** with detailed guidelines and rules
- ✅ **Constitutional templates** customized for this project's needs
- ✅ **Intelligent rule discovery** from CLAUDE.md and package.json analysis
- ✅ **Multi-work-type setup** (API, Database, Payments, Auth, Frontend, Testing, Deployment)

## 🚀 Project Structure

```
saas-starter/
├── package.json                    # Tech stack definition
├── CLAUDE.md                       # Project-specific guidelines & rules
├── .vibe-check/                    # ← Created by vibe-workflow init
│   ├── enhanced-mcp-server/        # ← Vibe-workflow core
│   ├── constitutional-rules.json   # ← Project base rules
│   └── constitutions/              # ← Work-type templates (auto-generated)
│       ├── api-development.json
│       ├── database-migrations.json
│       ├── payment-processing.json
│       ├── auth-security.json
│       ├── ui-components.json
│       ├── testing.json
│       ├── deployment.json
│       ├── integration-development.json
│       ├── realtime-communication.json
│       └── ... (additional auto-discovered templates)
├── src/
│   ├── api/                        # NestJS REST API
│   ├── ui/                         # Next.js frontend
│   └── database/                   # Database layer
└── scripts/
    ├── migrate.ts                  # Database migrations
    └── seed.ts                     # Seed test data
```

## 📊 What You'll See

After running vibe-workflow initialization on this project:

### Auto-Detected Frameworks
- ✅ NestJS (REST API framework)
- ✅ React (Frontend UI)
- ✅ Next.js (Full-stack framework)
- ✅ Prisma (ORM)
- ✅ Express (implicit in NestJS)

### Auto-Discovered Work Types
- ✅ **API Development** (REST endpoints, validation, error handling)
- ✅ **Database Migrations** (Schema changes, indexes, RLS)
- ✅ **Payment Processing** (Stripe integration, PCI compliance)
- ✅ **Authentication & Security** (JWT, MFA, WebSocket auth)
- ✅ **Real-time Communication** (WebSocket, socket.io)
- ✅ **UI Components** (React, Next.js, Tailwind, shadcn/ui)
- ✅ **Testing** (Vitest, integration tests, Playwright)
- ✅ **Deployment & DevOps** (Production readiness, health checks)

### Extracted Rules from CLAUDE.md
- 📖 65+ rules extracted from specific CLAUDE.md sections
- 🔗 Rules automatically mapped to correct work-type templates
- ⚡ Severity levels preserved (CRITICAL, HIGH, MEDIUM)
- 🔄 Customized with project-specific details

## 🎯 How To Use This Example

### Step 1: Initialize Vibe-Workflow
```bash
# From repository root
bash init.sh /path/to/saas-starter
```

### Step 2: Examine Generated Templates
```bash
# View customized templates
ls -la saas-starter/.vibe-check/constitutions/
cat saas-starter/.vibe-check/constitutions/payment-processing.json
cat saas-starter/.vibe-check/constitutions/auth-security.json
```

### Step 3: Run Vibe-Check
```bash
# Start coding with vibe-check guidance
cd saas-starter
npm install
npm run typecheck
npm run test
```

### Step 4: Track Learnings
When you make mistakes or discover patterns:
```bash
# Log learnings to vibe-log-saas-starter.json
vibe_learn "Avoid concurrent Stripe requests - use queue"
```

## 🔍 What Gets Generated

### 1. **Base Constitutional Rules** (`constitutional-rules.json`)
Extracted from CLAUDE.md sections:
```json
{
  "rules": [
    "CRITICAL: Use JWT with refresh token rotation (30-day expiry)",
    "CRITICAL: Never store passwords in plaintext (use bcrypt)",
    "CRITICAL: Use pg.Pool for database connections",
    ...
  ]
}
```

### 2. **Customized Templates**
Each template is customized with project-specific rules:

**api-development.json**
- Generic API validation rules
- + 7 project-specific rules from CLAUDE.md API Development section

**payment-processing.json**
- Generic payment best practices
- + 7 project-specific rules from CLAUDE.md Payment Processing section

**auth-security.json**
- Generic security guidelines
- + 12 project-specific rules from CLAUDE.md Authentication section
- + 5 WebSocket security rules from CLAUDE.md Real-time section

**database-migrations.json**
- Generic schema change patterns
- + 6 project-specific rules from CLAUDE.md Database section
- Includes RLS policies, pg.Pool usage, NestJS patterns

### 3. **New Auto-Discovered Templates**
Based on package.json dependencies:

- ✨ `realtime-communication.json` (socket.io detected)
- ✨ `integration-development.json` (Stripe webhooks)

## 📈 Statistics

After initialization, this example produces:
- **13 Constitutional Templates** (7 customized + 6 newly generated)
- **143 Total Rules** across all templates
- **65+ Rules Extracted** from CLAUDE.md
- **100% Project-Aware** (all customization automatic)

## 🧪 Example Workflow

### Scenario: Adding Stripe Webhook Handler

1. **Work Type Detection**
   ```bash
   # Start new work
   npm run dev
   # vibe-workflow detects: "working on payment-processing"
   ```

2. **Constitutional Guidance**
   - vibe-check loads `payment-processing.json`
   - Displays 7 rules:
     - CRITICAL: Validate Stripe webhook signatures
     - CRITICAL: Implement idempotency keys
     - HIGH: Add retry logic with exponential backoff
     - ... etc

3. **Code Quality Checks**
   ```bash
   npm run typecheck    # Validate types
   npm run lint         # Check style
   npm run test         # Run Vitest suite
   ```

4. **Learning Capture**
   ```bash
   # After implementation
   vibe_learn "Discovered: Must use Stripe signature verification before processing"
   # Stored in: saas-starter/.vibe-check/vibe-log-saas-starter.json
   ```

5. **Next Time**
   - When you work on payments again, vibe-workflow:
     - Loads your past learnings
     - Suggests preventative checks
     - Avoids repeating past mistakes

## 🎓 Learning System Integration

This example demonstrates the complete **Vibe-Check Learning System**:

```
Session 1 (Payment Work)
├── Start: vibe-check loads payment-processing.json
├── Work: Implement webhook handler
├── Lesson: Discovered signature verification requirement
└── Store: vibe-log-saas-starter.json records learning

Session 2 (Payment Work Again)
├── Start: vibe-check loads payment-processing.json
├── Suggest: Previous learning about signatures
├── Avoid: Don't repeat same mistakes
└── Store: New learnings added to history
```

## 📚 Key Files Explained

### `package.json`
Defines all frameworks and dependencies:
- NestJS + Express = API framework detection
- React + Next.js = Frontend framework detection
- Stripe + pg = Specialized domain detection (payments, database)
- socket.io = Real-time communication detection

Vibe-workflow scans this to auto-discover work types.

### `CLAUDE.md`
Project-specific guidelines with:
- **Sections** that vibe-workflow automatically maps to templates
- **CRITICAL rules** (highest severity)
- **NEVER** patterns (things to avoid)
- **ALWAYS** requirements (mandatory practices)

Vibe-workflow extracts all rules and customizes templates.

### `.vibe-check/constitutions/`
Auto-generated work-type templates:
- Merged from generic base + project-specific extracted rules
- Framework-aware (knows about NestJS, Prisma, etc.)
- Ready for vibe_check workflow

## ✨ Real-World Value

This example shows how vibe-workflow solves real problems:

1. **Consistency** - All team members follow same CLAUDE.md rules
2. **Automation** - Rules auto-generated from codebase structure
3. **Context** - vibe-check knows what you're working on (payment vs. auth vs. database)
4. **Learning** - System remembers mistakes and prevents repetition
5. **Scalability** - Works for 1 project or 20 projects simultaneously

## 🚀 Next Steps

1. **Study the templates** - Examine what was auto-generated
2. **Run vibe-check** - See constitutional guidance in action
3. **Add your own rules** - Customize for your specific needs
4. **Share patterns** - Contribute learnings back to team

---

**This is a working example of how vibe-workflow makes AI development more intelligent, consistent, and learning-enabled.** 🧠✨
