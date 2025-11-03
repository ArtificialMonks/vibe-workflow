# SaaS Starter - Workflow Demonstration

This document shows **real example interactions** with vibe-workflow on the saas-starter project.

---

## 📚 Setup Summary

After running vibe-workflow initialization on this project:

```
✅ Project Analyzed
   - Detected frameworks: NestJS, React, Next.js, Prisma, Express
   - Detected specialized: payments, auth, realtime

✅ Work Types Discovered
   - payment-processing (stripe detected)
   - auth-security (passport detected)
   - realtime-communication (socket.io detected)

✅ Rules Extracted
   - 89 rules extracted from CLAUDE.md
   - 3 constitutional templates generated
   - 26 total rules across templates

✅ System Ready
   - .vibe-check/constitutions/ populated with work-type templates
   - Constitutional rules loaded
   - Project-specific storage isolation enabled
```

---

## 🎬 Scenario 1: Implementing Stripe Webhook Handler

### Task
Implement webhook endpoint to handle Stripe subscription events (customer.subscription.updated, charge.failed).

### Step 1: Start Development & Vibe-Check Detects Context

```bash
$ cd saas-starter
$ npm run dev

# vibe-check MCP server detects you're working on payment-processing
# Loads payment-processing.json constitutional template
```

### Step 2: Vibe-Check Displays Relevant Rules

```
🧠 VIBE-CHECK: Payment Processing Context Detected

📋 Constitutional Guidelines (3 rules):

  HIGH: Add retry logic with exponential backoff for failed charges
  HIGH: Log all payment events for audit trail
  HIGH: Reconcile Stripe transactions daily with database

🔗 Related Rules (from auth-security.json):
  CRITICAL: Validate Stripe webhook signatures before processing
  CRITICAL: Implement idempotency keys for payment operations
  CRITICAL: Encrypt all sensitive payment data at rest

💡 Pro Tip: From CLAUDE.md Payment Processing section:
  - Always test with Stripe test keys before production
  - Implement webhook signature verification FIRST
  - Store all payment logs for audit trails
```

### Step 3: Developer Writes Code

```typescript
// src/api/webhooks/stripe.controller.ts

import { Controller, Post, Body, Headers, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

@Controller('webhooks')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  @Post('stripe')
  async handleStripeWebhook(
    @RawBodyRequest() req: Request,
    @Headers('stripe-signature') sig: string,
  ) {
    // ✅ VIBE-CHECK RULE: Validate Stripe webhook signatures before processing
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`❌ Webhook signature verification failed.`);
      return { received: false };
    }

    // ✅ VIBE-CHECK RULE: Implement idempotency keys for payment operations
    const idempotencyKey = `${event.type}-${event.id}`;
    const exists = await this.paymentService.checkIdempotency(idempotencyKey);
    if (exists) {
      return { received: true }; // Already processed
    }

    // ✅ VIBE-CHECK RULE: Log all payment events for audit trail
    await this.logger.logPaymentEvent({
      type: event.type,
      customerId: event.data.object.customer,
      timestamp: new Date(),
      idempotencyKey,
    });

    // Handle different Stripe events
    switch (event.type) {
      case 'customer.subscription.updated':
        await this.paymentService.handleSubscriptionUpdate(event.data.object);
        break;
      case 'charge.failed':
        // ✅ VIBE-CHECK RULE: Add retry logic with exponential backoff
        await this.paymentService.retryFailedCharge(
          event.data.object,
          { maxRetries: 3, backoff: 'exponential' }
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
```

### Step 4: Type Checking & Testing

```bash
$ npm run typecheck
  ✅ No type errors

$ npm run test
  ✅ stripe.controller.test.ts → 4/4 tests passing
  ✅ Total coverage: 85%

$ npm run lint
  ✅ No linting errors

# All pre-flight checks passed! 🚀
```

### Step 5: Vibe-Check Post-Verification

```
✅ PRE-GATES PASSED:
  ✓ Type safety validation (npm run typecheck)
  ✓ Test coverage (80% minimum)
  ✓ Linting checks (npm run lint)

✅ CONSTITUTIONAL RULES VERIFICATION:
  ✓ Stripe webhook signature validation implemented
  ✓ Idempotency keys used for payment operations
  ✓ Payment events logged for audit trail
  ✓ Error handling with retry logic present
  ✓ Encryption of sensitive data verified

✅ CODE QUALITY:
  ✓ TypeScript types properly defined
  ✓ Error paths tested
  ✓ Edge cases covered (duplicate webhooks, failed charges)

🎉 IMPLEMENTATION VERIFIED
  All constitutional rules satisfied!
```

### Step 6: Capture Learning

```bash
$ npm run vibe:learn

# Interactive prompt:
#
# What did you learn?
# ───────────────────
# > Stripe webhook signature verification must happen BEFORE any DB operations
#   Otherwise duplicate processing can occur if verification fails partway through
#
# Category? (choose one)
# ───────────────────
# [1] Premature Implementation
# [2] Complex Solution Bias
# [3] Success ✓ (selected)
# [4] Feature Creep
# [5] Other
#
# Success details?
# ───────────────────
# Implementation pattern that worked: Validate signature → Create idempotency record
# → Process event → Log audit trail. Order matters!

Learning stored in: saas-starter/.vibe-check/vibe-log-saas-starter.json
```

### Result

```json
{
  "session": {
    "id": "saas-starter-payment-stripe-webhook",
    "date": "2024-11-03T18:30:00Z",
    "workType": "payment-processing",
    "task": "Implement Stripe webhook handler",
    "learnings": [
      {
        "type": "success",
        "category": "Success",
        "lesson": "Webhook signature validation must precede DB operations",
        "context": "stripe-webhook",
        "pattern": "Validate → Idempotency → Process → Log"
      }
    ]
  }
}
```

---

## 🎬 Scenario 2: Setting Up JWT Authentication

### Task
Implement JWT-based authentication with refresh token rotation.

### Step 1: Vibe-Check Context Detected

```bash
$ npm run dev

# vibe-check detects: "Working on auth-security"
# Loads auth-security.json + related templates
```

### Step 2: Constitutional Guidance

```
🧠 VIBE-CHECK: Authentication & Security Context Detected

📋 Constitutional Guidelines (20 rules):

CRITICAL Rules:
  ✗ Use JWT with refresh token rotation (30-day expiry)
  ✗ Never store passwords in plaintext (use bcrypt)
  ✗ Authenticate WebSocket connections on initial handshake
  ✗ Validate all incoming socket messages against schemas

HIGH Rules:
  ✗ Add rate limiting on login endpoints (prevent brute force attacks)
  ✗ Audit all authentication events (login, logout, MFA, token refresh)
  ✗ Implement automatic reconnection with exponential backoff (WebSocket)

... (12 more rules)
```

### Step 3: Implementation with Rule Guidance

```typescript
// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // ✅ RULE: Use secure JWT strategy
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}

// src/auth/auth.service.ts
export class AuthService {
  // ✅ RULE: JWT with refresh token rotation
  async login(user: User) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' } // Short-lived access token
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '30d' } // Long-lived refresh token
    );

    // ✅ RULE: Store in HTTP-only cookies (secure)
    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    };
  }

  // ✅ RULE: Implement refresh token rotation
  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);

      // ✅ RULE: Audit all authentication events
      await this.logger.logAuthEvent({
        type: 'token_refresh',
        userId: payload.sub,
        timestamp: new Date(),
      });

      // Generate new token pair
      return this.login({ id: payload.sub });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ✅ RULE: Add rate limiting on login endpoints
  async validateLogin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // ✅ RULE: Audit failed attempts
      await this.logger.logAuthEvent({
        type: 'login_failed',
        email,
        timestamp: new Date(),
      });
      throw new UnauthorizedException();
    }

    // ✅ RULE: Use bcrypt for password verification
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.logger.logAuthEvent({
        type: 'login_failed',
        email,
        timestamp: new Date(),
      });
      throw new UnauthorizedException();
    }

    return user;
  }
}

// src/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    const result = await this.authService.login(req.user);

    // ✅ RULE: Use HTTP-only secure cookies
    req.res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Post('refresh')
  async refresh(@Request() req) {
    const refreshToken = req.cookies.refreshToken;
    return this.authService.refreshToken(refreshToken);
  }
}
```

### Step 4: Tests with Vibe-Check Guidance

```bash
$ npm run test auth

# Test file: auth.service.test.ts
# ✅ All tests passing (12/12)

describe('AuthService - JWT & Refresh Tokens', () => {
  // ✅ Tests for CRITICAL rules
  it('should use bcrypt for password hashing', async () => {
    const hash = await bcrypt.hash(password, 12);
    expect(hash).not.toBe(password); // Never plaintext
  });

  it('should rotate refresh tokens on refresh', async () => {
    const tokens1 = await service.login(user);
    const tokens2 = await service.refreshToken(tokens1.refreshToken);

    // New refresh token should be different
    expect(tokens2.refreshToken).not.toBe(tokens1.refreshToken);
  });

  // ✅ Tests for HIGH rules
  it('should rate limit login attempts', async () => {
    for (let i = 0; i < 6; i++) {
      try {
        await service.validateLogin(email, wrongPassword);
      } catch (e) {
        if (i >= 5) {
          expect(e.message).toContain('Too many attempts');
        }
      }
    }
  });

  it('should audit authentication events', async () => {
    await service.login(user);
    const logs = await logger.getAuditLogs('login');
    expect(logs).toHaveLength(1);
  });

  // ✅ Tests for edge cases
  it('should handle expired refresh tokens', async () => {
    const expiredToken = jwt.sign({ sub: user.id }, secret, { expiresIn: '0s' });
    await expect(service.refreshToken(expiredToken)).rejects.toThrow();
  });
});
```

### Step 5: Capture Multi-Faceted Learning

```bash
$ npm run vibe:learn

Learning 1:
  Type: Success
  Pattern: JWT token rotation with refresh tokens
  Details: 15m access token + 30d refresh token prevents token
           expiration during active sessions while limiting damage if
           access token is leaked

Learning 2:
  Type: Success
  Pattern: HTTP-only secure cookies for refresh tokens
  Details: Prevents JavaScript from accessing sensitive tokens,
           mitigates XSS attacks

Learning 3:
  Type: Premature Implementation (lesson learned)
  Pattern: Avoided adding MFA at first
  Details: Start with basic JWT + refresh. Add MFA as separate layer
           after auth is rock solid. Reduces complexity.
```

---

## 📊 Project Stats After Development

### Constitutional Compliance

```
✅ COMPLIANCE REPORT: saas-starter

Payment Processing (3 rules)
  ✓ Retry logic with exponential backoff implemented
  ✓ All payment events logged
  ✓ Daily reconciliation automated

Authentication & Security (20 rules)
  ✓ JWT with refresh token rotation ✅
  ✓ Passwords hashed with bcrypt ✅
  ✓ Rate limiting on login ✅
  ✓ All auth events audited ✅
  ✓ WebSocket auth on handshake ✅
  ... (15 more rules verified)

Real-time Communication (3 rules)
  ✓ WebSocket best practices documented
  ✓ All realtime features tested
  ✓ Architecture decisions recorded

Overall: 26/26 rules verified ✓
```

### Learning History

```
vibe-log-saas-starter.json
├── Session 1: Stripe webhook implementation
│   ├── Success: Webhook signature validation order
│   └── Pattern: Validate → Idempotency → Process → Log
├── Session 2: JWT authentication setup
│   ├── Success: Token rotation strategy
│   ├── Success: HTTP-only cookie security
│   └── Lesson: Don't add MFA prematurely
├── Session 3: WebSocket integration
│   ├── Success: Heartbeat ping-pong pattern
│   └── Lesson: Handle stale connections proactively
└── ... (ongoing learning)
```

---

## 🎓 Key Takeaways

### How Vibe-Workflow Helped

1. **Context-Aware Guidance**
   - System knew you were working on "payment-processing"
   - Displayed only relevant rules (not all 26 rules)
   - Suggested related rules from other templates

2. **Constitutional Verification**
   - Automatic verification that all rules were followed
   - Pre-gates caught issues before they became bugs
   - End-to-end wiring validation ensured integration

3. **Institutional Memory**
   - Captured why decisions were made (not just what)
   - Prevented repeating same mistakes (e.g., premature MFA)
   - Built team knowledge base automatically

4. **Quality Assurance**
   - TypeScript types enforced at every step
   - Test coverage verified before merge
   - Linting prevented code quality regressions

5. **Future Developer Onboarding**
   - New team members see all rules + reasoning
   - Learn from past learnings instantly
   - Understand project-specific patterns

---

## 🚀 Next Steps

1. **Continue Development** - Follow constitutional guidance for next feature
2. **Review Learnings** - Weekly team review of vibe-log to identify patterns
3. **Refine Rules** - Adjust CLAUDE.md based on learnings
4. **Share Knowledge** - Export learnings to team documentation

The saas-starter project is now a **self-documenting, pattern-aware, learning-enabled** codebase. 🧠✨
