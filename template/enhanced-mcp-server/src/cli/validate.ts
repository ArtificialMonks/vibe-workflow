#!/usr/bin/env node

/**
 * Constitutional Rules Validation Script
 *
 * Pre-flight check for constitutional-rules.json files
 * Validates structure, inheritance, and detects issues before runtime
 *
 * Usage:
 *   npx tsx src/cli/validate.ts
 *   npx tsx src/cli/validate.ts --rules=/path/to/constitutional-rules.json
 *   node build/cli/validate.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateRules, resolveRules } from '../utils/constitutional/rule-resolver.js';
import { getConstitutionalRulesPath } from '../utils/constitutionalRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: {
    rulesFile: string;
    totalRules: number;
    enabledRules: number;
    inheritanceChain: string[];
    severityBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
  };
}

/**
 * Validate constitutional rules file
 */
async function validateConstitutionalRules(rulesFilePath?: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: ValidationResult['info'] = {
    rulesFile: '',
    totalRules: 0,
    enabledRules: 0,
    inheritanceChain: [],
    severityBreakdown: {},
    categoryBreakdown: {}
  };

  // Step 1: Find rules file
  let rulesPath: string | null = null;

  if (rulesFilePath) {
    rulesPath = path.resolve(rulesFilePath);
    if (!fs.existsSync(rulesPath)) {
      errors.push(`Specified rules file not found: ${rulesPath}`);
      return { valid: false, errors, warnings, info };
    }
  } else {
    rulesPath = getConstitutionalRulesPath();
    if (!rulesPath) {
      warnings.push('No constitutional rules file found (this is okay, will use empty rule set)');
      return { valid: true, errors, warnings, info };
    }
  }

  info.rulesFile = rulesPath;

  // Step 2: Validate JSON syntax
  try {
    const content = fs.readFileSync(rulesPath, 'utf-8');
    JSON.parse(content);
  } catch (error) {
    errors.push(`Invalid JSON syntax: ${error instanceof Error ? error.message : error}`);
    return { valid: false, errors, warnings, info };
  }

  // Step 3: Validate rules structure and inheritance
  try {
    const validation = validateRules(rulesPath);

    if (!validation.valid) {
      errors.push(...validation.errors);
    }

    warnings.push(...validation.warnings);

    // Step 4: Resolve full rule set
    const { rules, sources, conflicts } = resolveRules(rulesPath);

    info.totalRules = Object.keys(rules).length;
    info.enabledRules = Object.values(rules).filter(r => r.enabled).length;

    // Get inheritance chain
    const uniqueSources = new Set<string>();
    Object.values(sources).forEach(sourceList => {
      sourceList.forEach(source => {
        if (!source.includes('(override)')) {
          uniqueSources.add(source);
        }
      });
    });
    info.inheritanceChain = Array.from(uniqueSources);

    // Severity breakdown
    for (const rule of Object.values(rules)) {
      if (rule.enabled) {
        info.severityBreakdown[rule.severity] = (info.severityBreakdown[rule.severity] || 0) + 1;
      }
    }

    // Category breakdown
    for (const rule of Object.values(rules)) {
      if (rule.enabled) {
        info.categoryBreakdown[rule.category] = (info.categoryBreakdown[rule.category] || 0) + 1;
      }
    }

    // Check for conflicts
    if (conflicts.length > 0) {
      for (const conflict of conflicts) {
        if (conflict.conflict.includes('non-existent')) {
          errors.push(`${conflict.conflict}`);
        } else {
          warnings.push(`${conflict.conflict} (sources: ${conflict.sources.join(', ')})`);
        }
      }
    }

    // Step 5: Validate individual rules
    for (const [ruleId, rule] of Object.entries(rules)) {
      // Check required fields
      if (!rule.name) {
        errors.push(`Rule ${ruleId}: missing required field 'name'`);
      }
      if (!rule.description) {
        errors.push(`Rule ${ruleId}: missing required field 'description'`);
      }
      if (!rule.category) {
        errors.push(`Rule ${ruleId}: missing required field 'category'`);
      }
      if (!rule.severity) {
        errors.push(`Rule ${ruleId}: missing required field 'severity'`);
      }

      // Validate severity
      if (rule.severity && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(rule.severity)) {
        errors.push(`Rule ${ruleId}: invalid severity '${rule.severity}' (must be CRITICAL, HIGH, MEDIUM, or LOW)`);
      }

      // Check for empty examples
      if (rule.examples && rule.examples.length === 0) {
        warnings.push(`Rule ${ruleId}: has empty examples array (consider removing or adding examples)`);
      }

      // Check for validation scripts
      if (rule.validation?.automatable && !rule.validation.scriptPath) {
        warnings.push(`Rule ${ruleId}: marked as automatable but no scriptPath provided`);
      }
    }

  } catch (error) {
    errors.push(`Error resolving rules: ${error instanceof Error ? error.message : error}`);
    return { valid: false, errors, warnings, info };
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info
  };
}

/**
 * Format validation result for console output
 */
function formatValidationResult(result: ValidationResult): void {
  console.log('\n📋 Constitutional Rules Validation Report\n');
  console.log('═'.repeat(60));

  if (result.info.rulesFile) {
    console.log(`\n📁 Rules File: ${result.info.rulesFile}`);
  }

  if (result.info.inheritanceChain.length > 0) {
    console.log(`\n🔗 Inheritance Chain (${result.info.inheritanceChain.length} files):`);
    result.info.inheritanceChain.forEach((file, i) => {
      const arrow = i < result.info.inheritanceChain.length - 1 ? '→' : '';
      console.log(`   ${i + 1}. ${file} ${arrow}`);
    });
  }

  if (result.info.totalRules > 0) {
    console.log(`\n📊 Rule Statistics:`);
    console.log(`   Total Rules:    ${result.info.totalRules}`);
    console.log(`   Enabled Rules:  ${result.info.enabledRules}`);
    console.log(`   Disabled Rules: ${result.info.totalRules - result.info.enabledRules}`);

    if (Object.keys(result.info.severityBreakdown).length > 0) {
      console.log(`\n⚠️  Severity Breakdown:`);
      const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      for (const severity of severityOrder) {
        const count = result.info.severityBreakdown[severity];
        if (count) {
          const icon = severity === 'CRITICAL' ? '🚨' :
                       severity === 'HIGH' ? '⚠️' :
                       severity === 'MEDIUM' ? 'ℹ️' : '📝';
          console.log(`   ${icon} ${severity}: ${count}`);
        }
      }
    }

    if (Object.keys(result.info.categoryBreakdown).length > 0) {
      console.log(`\n📂 Category Breakdown:`);
      const sortedCategories = Object.entries(result.info.categoryBreakdown)
        .sort((a, b) => b[1] - a[1]);
      for (const [category, count] of sortedCategories) {
        console.log(`   • ${category}: ${count}`);
      }
    }
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    result.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }

  console.log('\n' + '═'.repeat(60));

  if (result.valid) {
    console.log('\n✅ Validation PASSED - Constitutional rules are valid!\n');
  } else {
    console.log('\n❌ Validation FAILED - Please fix the errors above\n');
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  let rulesFile: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--rules=')) {
      rulesFile = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log('Constitutional Rules Validation Tool\n');
      console.log('Usage:');
      console.log('  npx tsx src/cli/validate.ts');
      console.log('  npx tsx src/cli/validate.ts --rules=/path/to/constitutional-rules.json');
      console.log('  node build/cli/validate.js --rules=./constitutional-rules.json');
      console.log('\nOptions:');
      console.log('  --rules=<path>  Path to constitutional rules file');
      console.log('  --help, -h      Show this help message');
      console.log('\nEnvironment Variables:');
      console.log('  VIBE_CHECK_RULES_FILE    Default rules file path');
      console.log('  VIBE_CHECK_STORAGE_DIR   Storage directory containing constitutional-rules.json');
      process.exit(0);
    }
  }

  try {
    const result = await validateConstitutionalRules(rulesFile);
    formatValidationResult(result);
    process.exit(result.valid ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Validation failed with unexpected error:');
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('validate.ts');
if (isMainModule) {
  main();
}

export { validateConstitutionalRules, ValidationResult };
