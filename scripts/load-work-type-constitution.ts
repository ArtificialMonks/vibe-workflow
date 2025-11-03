#!/usr/bin/env tsx
/**
 * Load Work-Type Specific Constitutional Templates
 *
 * Loads and merges work-type specific constitutional rules with base rules.
 * Used to provide context-specific guidance based on Linear issue labels or work context.
 *
 * Usage:
 *   import { loadWorkTypeConstitution, detectWorkType } from './load-work-type-constitution';
 *
 *   // Auto-detect from Linear labels
 *   const workType = detectWorkType(['database', 'migration']);
 *   const constitution = await loadWorkTypeConstitution('database-migrations');
 *
 *   // Or pass directly
 *   const apiRules = await loadWorkTypeConstitution('api-development');
 */

import fs from 'fs/promises';
import path from 'path';

export interface ConstitutionalRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  enabled: boolean;
  rationale?: string;
  examples?: string[];
}

export interface WorkTypeConstitution {
  name: string;
  description: string;
  workTypes: string[];
  rules: string[];
  antiPatterns?: string[];
  guidelines?: Record<string, string>;
}

export interface MergedConstitution {
  baseRules: ConstitutionalRule[];
  workTypeRules: ConstitutionalRule[];
  allRules: ConstitutionalRule[];
  workType: string;
  totalRules: number;
  severityDistribution: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

/**
 * List available work-type templates
 */
export async function listAvailableWorkTypes(projectDir: string): Promise<string[]> {
  try {
    const constitutionsDir = path.join(projectDir, '.vibe-check', 'constitutions');
    const files = await fs.readdir(constitutionsDir);
    return files
      .filter(f => f.endsWith('.json') && f !== 'README.md')
      .map(f => f.replace('.json', ''));
  } catch (error) {
    return [];
  }
}

/**
 * Detect work type from labels (priority ordered)
 */
export function detectWorkType(labels: string[]): string {
  const labelLower = labels.map(l => l.toLowerCase());

  // Priority order: most specific first
  const detections = [
    { keywords: ['deployment', 'devops', 'ci', 'cd', 'production', 'release'], type: 'deployment' },
    { keywords: ['test', 'testing', 'qa', 'quality', 'e2e'], type: 'testing' },
    { keywords: ['integration', 'webhook', 'oauth', 'api-integration'], type: 'integration-development' },
    { keywords: ['database', 'migration', 'schema'], type: 'database-migrations' },
    { keywords: ['workflow', 'automation', 'playwright', 'runner'], type: 'workflow-automation' },
    { keywords: ['ui', 'frontend', 'component', 'react', 'design'], type: 'ui-components' },
    { keywords: ['api', 'backend', 'endpoint', 'rest'], type: 'api-development' }
  ];

  for (const detection of detections) {
    if (detection.keywords.some(kw => labelLower.some(l => l.includes(kw)))) {
      return detection.type;
    }
  }

  // Default
  return 'api-development';
}

/**
 * Load work-type specific constitution template
 */
export async function loadWorkTypeConstitution(
  workType: string,
  projectDir: string = process.cwd()
): Promise<WorkTypeConstitution | null> {
  try {
    const templatePath = path.join(projectDir, '.vibe-check', 'constitutions', `${workType}.json`);
    const content = await fs.readFile(templatePath, 'utf-8');
    return JSON.parse(content) as WorkTypeConstitution;
  } catch (error) {
    return null;
  }
}

/**
 * Convert work-type constitutional template to MCP rules format
 */
export function convertToMCPRules(
  workType: string,
  template: WorkTypeConstitution
): Record<string, ConstitutionalRule> {
  const rules: Record<string, ConstitutionalRule> = {};

  template.rules.forEach((rule, index) => {
    const ruleId = `${workType}-rule-${index + 1}`;

    // Parse CRITICAL/HIGH/MEDIUM/LOW prefix
    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    let description = rule;

    if (rule.startsWith('CRITICAL:')) {
      severity = 'CRITICAL';
      description = rule.replace('CRITICAL:', '').trim();
    } else if (rule.startsWith('HIGH:')) {
      severity = 'HIGH';
      description = rule.replace('HIGH:', '').trim();
    } else if (rule.startsWith('MEDIUM:')) {
      severity = 'MEDIUM';
      description = rule.replace('MEDIUM:', '').trim();
    } else if (rule.startsWith('LOW:')) {
      severity = 'LOW';
      description = rule.replace('LOW:', '').trim();
    } else if (rule.includes('CRITICAL')) {
      severity = 'CRITICAL';
    } else if (rule.includes('ALWAYS')) {
      severity = 'HIGH';
    }

    rules[ruleId] = {
      id: ruleId,
      name: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
      description,
      category: workType.replace('-', '_'),
      severity,
      enabled: true
    };
  });

  return rules;
}

/**
 * Merge base rules with work-type specific rules
 */
export async function mergeConstitutions(
  baseRules: Record<string, ConstitutionalRule>,
  workType: string,
  projectDir: string = process.cwd()
): Promise<MergedConstitution> {
  const template = await loadWorkTypeConstitution(workType, projectDir);

  const workTypeRules: ConstitutionalRule[] = [];
  if (template) {
    const converted = convertToMCPRules(workType, template);
    workTypeRules.push(...Object.values(converted));
  }

  const allRules = [...Object.values(baseRules), ...workTypeRules];

  // Calculate severity distribution
  const severityDistribution = {
    CRITICAL: allRules.filter(r => r.severity === 'CRITICAL').length,
    HIGH: allRules.filter(r => r.severity === 'HIGH').length,
    MEDIUM: allRules.filter(r => r.severity === 'MEDIUM').length,
    LOW: allRules.filter(r => r.severity === 'LOW').length
  };

  return {
    baseRules: Object.values(baseRules),
    workTypeRules,
    allRules,
    workType,
    totalRules: allRules.length,
    severityDistribution
  };
}

/**
 * Display merged constitution summary
 */
export function displayMergedConstitution(merged: MergedConstitution): void {
  console.log(`\n📋 Constitutional Rules for Work Type: ${merged.workType}`);
  console.log(`   Total Rules: ${merged.totalRules}`);
  console.log(`   Base Rules: ${merged.baseRules.length}`);
  console.log(`   Work-Type Rules: ${merged.workTypeRules.length}`);
  console.log(`\n📊 Severity Distribution:`);
  console.log(`   🔴 CRITICAL: ${merged.severityDistribution.CRITICAL}`);
  console.log(`   🟠 HIGH: ${merged.severityDistribution.HIGH}`);
  console.log(`   🟡 MEDIUM: ${merged.severityDistribution.MEDIUM}`);
  console.log(`   🟢 LOW: ${merged.severityDistribution.LOW}\n`);

  if (merged.workTypeRules.length > 0) {
    console.log(`⚡ Work-Type Specific Rules:`);
    merged.workTypeRules.forEach(rule => {
      const icon =
        rule.severity === 'CRITICAL'
          ? '🔴'
          : rule.severity === 'HIGH'
            ? '🟠'
            : rule.severity === 'MEDIUM'
              ? '🟡'
              : '🟢';
      console.log(`   ${icon} ${rule.name}`);
      console.log(`      ${rule.description.substring(0, 80)}`);
    });
  }
}

/**
 * CLI usage
 */
if (require.main === module) {
  const workType = process.argv[2] || 'api-development';
  const projectDir = process.argv[3] || process.cwd();

  (async () => {
    try {
      console.log(`\n🔍 Loading constitution for work type: ${workType}`);

      const template = await loadWorkTypeConstitution(workType, projectDir);
      if (!template) {
        console.log(`⚠️  No template found for ${workType}`);
        const available = await listAvailableWorkTypes(projectDir);
        if (available.length > 0) {
          console.log(`\n📂 Available work types:`);
          available.forEach(w => console.log(`   - ${w}`));
        }
        process.exit(1);
      }

      console.log(`✅ Found template: ${template.name}`);
      console.log(`   ${template.description}`);

      // Mock base rules for demo
      const baseRules: Record<string, ConstitutionalRule> = {
        'base-rule-1': {
          id: 'base-rule-1',
          name: 'No Time Constraints',
          description: 'NEVER be constrained by time',
          category: 'general',
          severity: 'CRITICAL',
          enabled: true
        }
      };

      const merged = await mergeConstitutions(baseRules, workType, projectDir);
      displayMergedConstitution(merged);

      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  })();
}

export default {
  loadWorkTypeConstitution,
  detectWorkType,
  listAvailableWorkTypes,
  convertToMCPRules,
  mergeConstitutions,
  displayMergedConstitution
};
