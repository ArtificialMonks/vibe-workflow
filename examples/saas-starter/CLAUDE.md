# CLAUDE.md - SaaS Starter Project

## Project Overview

This is a production-grade SaaS application template with:
- **Backend**: NestJS 10.4.20 REST API with WebSocket support
- **Frontend**: Next.js + React with Tailwind CSS and shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with Passport.js
- **Payments**: Stripe integration for recurring subscriptions
- **Real-time**: WebSocket support for live notifications

---

## Database & Migrations

### **CRITICAL**: Database Connection Rules

- **ALWAYS**: Use `pg.Pool` for database connections (never TypeORM or Prisma in NestJS services)
- **ALWAYS**: Inject database pool with: `@Inject('PG_POOL') private db: Pool`
- **NEVER**: Use `@nestjs/typeorm` or TypeORM (causes lifecycle issues)
- **CRITICAL**: Include `IF NOT EXISTS` clauses to make migrations idempotent
- **CRITICAL**: Test migrations on a copy of production data before deploying

### Database Migration Standards

- **ALWAYS**: Use sequential migration numbering (001, 002, 003...)
- **ALWAYS**: Include rollback/down migrations for every change
- **ALWAYS**: Add `created_at` and `updated_at` timestamp columns to new tables
- **HIGH**: Add database indexes for all foreign key columns
- **HIGH**: Include Row Level Security (RLS) policies for multi-tenant data
- **MEDIUM**: Document breaking changes in migration comments
- **MEDIUM**: Verify migration performance on large datasets

### Migration File Naming

```
Format: YYYYMMDDHHMMSS_description.sql
Example: 20240315143022_add_user_email_index.sql
```

---

## Authentication & Security

### **CRITICAL**: Security Requirements

- **CRITICAL**: Use JWT with refresh token rotation (30-day expiry)
- **CRITICAL**: Never store passwords in plaintext (use bcrypt with salt rounds 12)
- **CRITICAL**: Implement MFA for admin accounts
- **CRITICAL**: Use HTTPS everywhere (enforce in production)
- **CRITICAL**: Validate all incoming WebSocket messages against schemas
- **CRITICAL**: Use WebSocket connection authentication (never trust client)

### **HIGH**: Authentication Best Practices

- **HIGH**: Add rate limiting on login endpoints (prevent brute force attacks)
- **HIGH**: Audit all authentication events (login, logout, MFA, token refresh)
- **HIGH**: Implement automatic reconnection with exponential backoff (WebSocket)
- **HIGH**: Add heartbeat/ping-pong to detect stale WebSocket connections

### **MEDIUM**: Session Management

- **MEDIUM**: Implement session timeout after 30 minutes of inactivity
- **MEDIUM**: Log WebSocket connection/disconnection events
- **MEDIUM**: Store refresh tokens in secure HTTP-only cookies

---

## API Development

### **CRITICAL**: API Standards

- **CRITICAL**: Validate all incoming request payloads using Zod or class-validator
- **CRITICAL**: Return consistent error responses: `{ code, message, details }`
- **CRITICAL**: Document all endpoints with OpenAPI/Swagger

### **HIGH**: API Design

- **HIGH**: Use semantic HTTP methods (POST create, PUT/PATCH update, DELETE remove)
- **HIGH**: Implement proper pagination for list endpoints (limit, offset, total)
- **HIGH**: Add request/response logging for debugging
- **HIGH**: Version API endpoints (e.g., `/api/v1/users`)

### **MEDIUM**: API Features

- **MEDIUM**: Implement idempotency keys for POST endpoints
- **MEDIUM**: Add request rate limiting by IP/user
- **MEDIUM**: Cache frequently accessed data with Redis

---

## Payment Processing

### **CRITICAL**: Payment Security

- **CRITICAL**: Validate Stripe webhook signatures before processing
- **CRITICAL**: Use PCI-compliant token-based payments (never store card data)
- **CRITICAL**: Implement idempotency keys for payment operations
- **CRITICAL**: Encrypt all sensitive payment data at rest

### **HIGH**: Payment Operations

- **HIGH**: Add retry logic with exponential backoff for failed charges
- **HIGH**: Log all payment events for audit trail
- **HIGH**: Reconcile Stripe transactions daily with database

### **MEDIUM**: Testing

- **MEDIUM**: Test with Stripe test keys before production
- **MEDIUM**: Implement webhook signature verification tests
- **MEDIUM**: Mock Stripe responses in unit tests

---

## Real-time Communication

### **CRITICAL**: WebSocket Security

- **CRITICAL**: Authenticate WebSocket connections on initial handshake
- **CRITICAL**: Validate all incoming socket messages against schemas
- **CRITICAL**: Implement automatic reconnection with exponential backoff

### **HIGH**: WebSocket Reliability

- **HIGH**: Add heartbeat/ping-pong to detect stale connections
- **HIGH**: Implement message acknowledgment and retry logic
- **HIGH**: Handle graceful disconnection and cleanup

### **MEDIUM**: Monitoring

- **MEDIUM**: Log WebSocket connection/disconnection events
- **MEDIUM**: Monitor WebSocket message latency
- **MEDIUM**: Alert on high connection drop rates

---

## Frontend & UI Components

### **CRITICAL**: Component Standards

- **CRITICAL**: Use semantic HTML for accessibility (WCAG 2.1 Level AA)
- **CRITICAL**: Implement responsive design for mobile-first approach
- **CRITICAL**: Handle loading and error states in all async operations

### **HIGH**: UI Best Practices

- **HIGH**: Use shadcn/ui components with Tailwind CSS
- **HIGH**: Implement proper form validation with error messages
- **HIGH**: Add loading indicators for long-running operations
- **HIGH**: Prevent double-submit with button state management

### **MEDIUM**: Styling

- **MEDIUM**: Use Tailwind CSS utility classes (no inline styles)
- **MEDIUM**: Maintain consistent spacing and typography
- **MEDIUM**: Implement dark mode support

---

## Testing

### **CRITICAL**: Test Coverage

- **CRITICAL**: Write unit tests for all business logic (80% coverage minimum)
- **CRITICAL**: Write integration tests for API endpoints
- **CRITICAL**: Test error paths and edge cases

### **HIGH**: Testing Tools

- **HIGH**: Use Vitest for unit tests (NOT Jest)
- **HIGH**: Use Playwright for end-to-end tests
- **HIGH**: Mock external dependencies (Stripe, emails, etc.)

### **MEDIUM**: Test Organization

- **MEDIUM**: Organize tests by feature/domain
- **MEDIUM**: Clean up test data after each test
- **MEDIUM**: Use meaningful test descriptions

---

## Deployment & DevOps

### **CRITICAL**: Pre-Deployment

- **CRITICAL**: Run full test suite before deployment
- **CRITICAL**: Verify all environment variables are set correctly
- **CRITICAL**: Create database backup before running migrations in production

### **HIGH**: Deployment Process

- **HIGH**: Use zero-downtime deployment strategy
- **HIGH**: Implement health checks for readiness/liveness probes
- **HIGH**: Set up automated rollback on deployment failure

### **MEDIUM**: Post-Deployment

- **MEDIUM**: Monitor error rates and performance metrics
- **MEDIUM**: Run smoke tests in production environment
- **MEDIUM**: Document deployment and rollback procedures

---

## Code Quality

### **ALWAYS**: Enforce Standards

- **ALWAYS**: Run `npm run typecheck` before committing
- **ALWAYS**: Run `npm run lint` to catch code issues
- **ALWAYS**: Run `npm run format` with Prettier for consistency

### **NEVER**: Forbidden Patterns

- **NEVER**: Use `any` type in TypeScript (use `unknown` instead)
- **NEVER**: Commit console.log statements to production code
- **NEVER**: Use deprecated NestJS decorators or patterns
- **NEVER**: Hardcode environment-specific values
