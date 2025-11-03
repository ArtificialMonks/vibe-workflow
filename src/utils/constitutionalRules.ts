#!/usr/bin/env node

/**
 * Constitutional Rules File Loading System
 *
 * Integrates with the rule-resolver from hivebrowser's vibe-check system
 * to load constitutional rules from JSON files with inheritance support.
 *
 * Environment Variables:
 * - VIBE_CHECK_RULES_FILE: Path to constitutional rules JSON file
 * - VIBE_CHECK_STORAGE_DIR: Base directory for vibe-check data
 *
 * If VIBE_CHECK_RULES_FILE is not set, looks for:
 * 1. ${VIBE_CHECK_STORAGE_DIR}/constitutional-rules.json
 * 2. ${projectRoot}/.vibe-check/constitutional-rules.json
 * 3. Fallback: empty rule set
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { resolveRules, getEffectiveRules, Rule } from './constitutional/rule-resolver.js';

export interface ConstitutionalRulesConfig {
  rulesFile?: string;
  storageDir?: string;
}

/**
 * Get the path to the constitutional rules file
 */
export function getConstitutionalRulesPath(config?: ConstitutionalRulesConfig): string | null {
  // 1. Explicit VIBE_CHECK_RULES_FILE environment variable
  if (process.env.VIBE_CHECK_RULES_FILE) {
    const rulesPath = path.resolve(process.env.VIBE_CHECK_RULES_FILE);
    if (fs.existsSync(rulesPath)) {
      return rulesPath;
    }
    console.error(`[Constitutional Rules] VIBE_CHECK_RULES_FILE set but file not found: ${rulesPath}`);
  }

  // 2. Config-provided rules file
  if (config?.rulesFile) {
    const rulesPath = path.resolve(config.rulesFile);
    if (fs.existsSync(rulesPath)) {
      return rulesPath;
    }
  }

  // 3. Storage directory + constitutional-rules.json
  const storageDir = config?.storageDir || process.env.VIBE_CHECK_STORAGE_DIR;
  if (storageDir) {
    const rulesPath = path.join(storageDir, 'constitutional-rules.json');
    if (fs.existsSync(rulesPath)) {
      return rulesPath;
    }
  }

  // 4. Default ~/.vibe-check/constitutional-rules.json
  const defaultPath = path.join(os.homedir(), '.vibe-check', 'constitutional-rules.json');
  if (fs.existsSync(defaultPath)) {
    return defaultPath;
  }

  // No constitutional rules file found
  return null;
}

/**
 * Load constitutional rules from file with inheritance resolution
 */
export function loadConstitutionalRules(config?: ConstitutionalRulesConfig): Rule[] {
  const rulesPath = getConstitutionalRulesPath(config);

  if (!rulesPath) {
    console.log('[Constitutional Rules] No rules file found, using empty rule set');
    return [];
  }

  try {
    console.log(`[Constitutional Rules] Loading from: ${rulesPath}`);
    const effectiveRules = getEffectiveRules(rulesPath);
    console.log(`[Constitutional Rules] Loaded ${effectiveRules.length} rules (enabled only)`);

    // Log summary by severity
    const bySeverity = effectiveRules.reduce((acc, rule) => {
      acc[rule.severity] = (acc[rule.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`[Constitutional Rules] Severity breakdown:`, bySeverity);

    return effectiveRules;
  } catch (error) {
    console.error(`[Constitutional Rules] Error loading rules from ${rulesPath}:`, error);
    return [];
  }
}

/**
 * Convert Rule objects to simplified string format for backward compatibility
 * with existing constitution tools
 */
export function rulesToStrings(rules: Rule[]): string[] {
  return rules.map(rule => {
    const severity = rule.severity === 'CRITICAL' ? '🚨' :
                     rule.severity === 'HIGH' ? '⚠️' :
                     rule.severity === 'MEDIUM' ? 'ℹ️' : '📝';

    let ruleString = `${severity} [${rule.category}] ${rule.name}: ${rule.description}`;

    if (rule.rationale) {
      ruleString += ` | Rationale: ${rule.rationale}`;
    }

    if (rule.examples && rule.examples.length > 0) {
      ruleString += ` | Examples: ${rule.examples.slice(0, 2).join('; ')}`;
    }

    return ruleString;
  });
}

/**
 * Load constitutional rules and convert to string format
 * for use in existing vibe_check prompts
 */
export function loadConstitutionalRulesAsStrings(config?: ConstitutionalRulesConfig): string[] {
  const rules = loadConstitutionalRules(config);
  return rulesToStrings(rules);
}

/**
 * Get a formatted constitutional rules context for LLM prompts
 */
export function getConstitutionalRulesContext(config?: ConstitutionalRulesConfig): string {
  const rules = loadConstitutionalRules(config);

  if (rules.length === 0) {
    return '';
  }

  let context = '## Constitutional Rules\n\n';
  context += 'The following constitutional rules must be honored:\n\n';

  for (const rule of rules) {
    const severity = rule.severity === 'CRITICAL' ? '🚨 CRITICAL' :
                     rule.severity === 'HIGH' ? '⚠️ HIGH' :
                     rule.severity === 'MEDIUM' ? 'ℹ️ MEDIUM' : '📝 LOW';

    context += `### ${severity}: ${rule.name}\n`;
    context += `**Category**: ${rule.category}\n`;
    context += `**Description**: ${rule.description}\n`;

    if (rule.rationale) {
      context += `**Rationale**: ${rule.rationale}\n`;
    }

    if (rule.examples && rule.examples.length > 0) {
      context += `**Examples**:\n`;
      for (const example of rule.examples) {
        context += `- ${example}\n`;
      }
    }

    context += '\n';
  }

  return context;
}

/**
 * Check if constitutional rules file exists and is valid
 */
export function validateConstitutionalRules(config?: ConstitutionalRulesConfig): {
  valid: boolean;
  path: string | null;
  errorMessage?: string;
} {
  const rulesPath = getConstitutionalRulesPath(config);

  if (!rulesPath) {
    return {
      valid: false,
      path: null,
      errorMessage: 'No constitutional rules file found'
    };
  }

  try {
    const rules = loadConstitutionalRules(config);
    return {
      valid: true,
      path: rulesPath,
    };
  } catch (error) {
    return {
      valid: false,
      path: rulesPath,
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}
