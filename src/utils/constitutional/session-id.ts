#!/usr/bin/env ts-node

/**
 * Session ID Utilities
 *
 * Standardized session ID generation and parsing for vibe-check system.
 *
 * Format: {projectId}-{workType}-{linearIssueId}-{timestamp}-{uuid}
 * Example: "hivebrowser-feature-HIV-123-20251103-a1b2c3d4"
 *
 * Components:
 * - projectId: Project identifier (e.g., "hivebrowser", "browserobot")
 * - workType: Work category (e.g., "feature", "bugfix", "refactor")
 * - linearIssueId: Linear ticket ID (e.g., "HIV-123", "BRO-456")
 * - timestamp: Date in YYYYMMDD format
 * - uuid: Short UUID (8 characters) for uniqueness
 */

import { randomBytes } from 'crypto';

export interface SessionIdComponents {
  projectId: string;
  workType: string;
  linearIssueId: string;
  timestamp: string;
  uuid: string;
}

/**
 * Generate a short UUID (8 characters)
 */
export function generateShortUUID(): string {
  return randomBytes(4).toString('hex');
}

/**
 * Get current timestamp in YYYYMMDD format
 */
export function getCurrentTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Create a session ID from components
 */
export function createSessionId(components: Partial<SessionIdComponents>): string {
  const {
    projectId,
    workType,
    linearIssueId = 'adhoc',
    timestamp = getCurrentTimestamp(),
    uuid = generateShortUUID()
  } = components;

  if (!projectId) {
    throw new Error('projectId is required');
  }

  if (!workType) {
    throw new Error('workType is required');
  }

  const parts = [
    projectId,
    workType,
    linearIssueId,
    timestamp,
    uuid.slice(0, 8)
  ];

  return parts.join('-');
}

/**
 * Parse a session ID into its components
 */
export function parseSessionId(sessionId: string): SessionIdComponents | null {
  // Pattern: {projectId}-{workType}-{issuePrefix}-{issueNumber}-{timestamp}-{uuid}
  // Example: hivebrowser-feature-HIV-123-20251103-a1b2c3d4
  const pattern = /^([a-z0-9_-]+)-([a-z-]+)-([A-Z]+-\d+|adhoc)-(\d{8})-([a-f0-9]{8})$/i;
  const match = sessionId.match(pattern);

  if (!match) {
    return null;
  }

  return {
    projectId: match[1],
    workType: match[2],
    linearIssueId: match[3],
    timestamp: match[4],
    uuid: match[5]
  };
}

/**
 * Extract work type from session ID
 */
export function extractWorkType(sessionId: string): string | null {
  const components = parseSessionId(sessionId);
  return components?.workType || null;
}

/**
 * Extract project ID from session ID
 */
export function extractProjectId(sessionId: string): string | null {
  const components = parseSessionId(sessionId);
  return components?.projectId || null;
}

/**
 * Extract Linear issue ID from session ID
 */
export function extractLinearIssueId(sessionId: string): string | null {
  const components = parseSessionId(sessionId);
  return components?.linearIssueId && components.linearIssueId !== 'adhoc'
    ? components.linearIssueId
    : null;
}

/**
 * Validate session ID format
 */
export function isValidSessionId(sessionId: string): boolean {
  return parseSessionId(sessionId) !== null;
}

/**
 * Create a session ID pattern for glob matching
 * Example: createSessionIdPattern("hivebrowser", "feature") → "hivebrowser-feature-*"
 */
export function createSessionIdPattern(
  projectId?: string,
  workType?: string,
  linearIssueId?: string
): string {
  const parts: string[] = [];

  if (projectId) {
    parts.push(projectId);
  } else {
    parts.push('*');
  }

  if (workType) {
    parts.push(workType);
  } else {
    parts.push('*');
  }

  if (linearIssueId) {
    parts.push(linearIssueId);
  } else {
    parts.push('*');
  }

  // Always wildcard timestamp and uuid
  parts.push('*');
  parts.push('*');

  return parts.join('-');
}

/**
 * CLI usage and testing
 */
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('session-id.ts');
if (isMainModule) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'create') {
    const projectId = args[1];
    const workType = args[2];
    const linearIssueId = args[3];

    if (!projectId || !workType) {
      console.error('Usage: ts-node session-id.ts create <projectId> <workType> [linearIssueId]');
      process.exit(1);
    }

    const sessionId = createSessionId({ projectId, workType, linearIssueId });
    console.log(`✅ Created session ID: ${sessionId}`);

  } else if (command === 'parse') {
    const sessionId = args[1];

    if (!sessionId) {
      console.error('Usage: ts-node session-id.ts parse <sessionId>');
      process.exit(1);
    }

    const components = parseSessionId(sessionId);

    if (!components) {
      console.error('❌ Invalid session ID format');
      process.exit(1);
    }

    console.log('✅ Parsed session ID:\n');
    console.log(`  Project ID:     ${components.projectId}`);
    console.log(`  Work Type:      ${components.workType}`);
    console.log(`  Linear Issue:   ${components.linearIssueId}`);
    console.log(`  Timestamp:      ${components.timestamp}`);
    console.log(`  UUID:           ${components.uuid}`);

  } else if (command === 'pattern') {
    const projectId = args[1];
    const workType = args[2];
    const linearIssueId = args[3];

    const pattern = createSessionIdPattern(projectId, workType, linearIssueId);
    console.log(`✅ Session ID pattern: ${pattern}`);

  } else {
    console.error('Usage:');
    console.error('  ts-node session-id.ts create <projectId> <workType> [linearIssueId]');
    console.error('  ts-node session-id.ts parse <sessionId>');
    console.error('  ts-node session-id.ts pattern [projectId] [workType] [linearIssueId]');
    process.exit(1);
  }
}
