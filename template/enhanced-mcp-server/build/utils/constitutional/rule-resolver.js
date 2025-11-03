#!/usr/bin/env ts-node
/**
 * Constitutional Rule Inheritance Resolver
 *
 * Implements hierarchical rule loading with inheritance:
 * Base Rules → Project Rules → Session Rules (in-memory)
 *
 * Features:
 * - Load rules from multiple files (extends chain)
 * - Apply overrides to inherited rules
 * - Detect conflicts and circular dependencies
 * - Validate final rule set
 */
import * as fs from 'fs';
import * as path from 'path';
/**
 * Load a rule set from a JSON file
 */
export function loadRuleSet(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Rule set file not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
}
/**
 * Resolve inheritance chain recursively
 */
function resolveInheritanceChain(ruleSetPath, visited = new Set()) {
    const absolutePath = path.resolve(ruleSetPath);
    // Detect circular dependencies
    if (visited.has(absolutePath)) {
        throw new Error(`Circular dependency detected: ${absolutePath}`);
    }
    visited.add(absolutePath);
    const ruleSet = loadRuleSet(absolutePath);
    // No extends? This is a leaf node
    if (!ruleSet.extends || ruleSet.extends.length === 0) {
        return [absolutePath];
    }
    // Recursively resolve all parent rule sets
    const chain = [];
    for (const parentPath of ruleSet.extends) {
        const resolvedParentPath = path.resolve(path.dirname(absolutePath), parentPath);
        const parentChain = resolveInheritanceChain(resolvedParentPath, new Set(visited));
        chain.push(...parentChain);
    }
    // Add current file at the end (highest priority)
    chain.push(absolutePath);
    return chain;
}
/**
 * Merge rules from multiple rule sets with inheritance
 */
export function resolveRules(ruleSetPath) {
    // Get complete inheritance chain (base → ... → project)
    const chain = resolveInheritanceChain(ruleSetPath);
    const mergedRules = {};
    const sources = {};
    const conflicts = [];
    // Process each file in the chain (base first, project last)
    for (const filePath of chain) {
        const ruleSet = loadRuleSet(filePath);
        // Merge rules from this file
        if (ruleSet.rules) {
            for (const [ruleId, rule] of Object.entries(ruleSet.rules)) {
                if (mergedRules[ruleId]) {
                    // Rule already exists - this is an override
                    conflicts.push({
                        ruleId,
                        conflict: `Rule redefined in ${filePath}`,
                        sources: [sources[ruleId][0], filePath]
                    });
                }
                mergedRules[ruleId] = { ...rule };
                sources[ruleId] = sources[ruleId] || [];
                sources[ruleId].push(filePath);
            }
        }
        // Apply overrides from this file
        if (ruleSet.overrides) {
            for (const [ruleId, override] of Object.entries(ruleSet.overrides)) {
                if (!mergedRules[ruleId]) {
                    conflicts.push({
                        ruleId,
                        conflict: `Override for non-existent rule in ${filePath}`,
                        sources: [filePath]
                    });
                    continue;
                }
                // Apply override
                mergedRules[ruleId] = {
                    ...mergedRules[ruleId],
                    ...override
                };
                sources[ruleId].push(`${filePath} (override)`);
            }
        }
    }
    return {
        rules: mergedRules,
        sources,
        conflicts
    };
}
/**
 * Get effective rules as array sorted by severity
 */
export function getEffectiveRules(ruleSetPath) {
    const { rules } = resolveRules(ruleSetPath);
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return Object.values(rules)
        .filter(rule => rule.enabled)
        .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
/**
 * Validate resolved rules for conflicts
 */
export function validateRules(ruleSetPath) {
    const { rules, conflicts } = resolveRules(ruleSetPath);
    const errors = [];
    const warnings = [];
    // Check for conflicts
    for (const conflict of conflicts) {
        if (conflict.conflict.includes('non-existent')) {
            errors.push(conflict.conflict);
        }
        else {
            warnings.push(conflict.conflict);
        }
    }
    // Check for duplicate rule IDs
    const seenIds = new Set();
    for (const ruleId of Object.keys(rules)) {
        if (seenIds.has(ruleId)) {
            errors.push(`Duplicate rule ID: ${ruleId}`);
        }
        seenIds.add(ruleId);
    }
    // Check for required fields
    for (const [ruleId, rule] of Object.entries(rules)) {
        if (!rule.name) {
            errors.push(`Rule ${ruleId} missing required field: name`);
        }
        if (!rule.description) {
            errors.push(`Rule ${ruleId} missing required field: description`);
        }
        if (!rule.severity) {
            errors.push(`Rule ${ruleId} missing required field: severity`);
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * CLI usage
 */
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('rule-resolver.ts');
if (isMainModule) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: ts-node rule-resolver.ts <path-to-constitutional-rules.json>');
        process.exit(1);
    }
    const ruleSetPath = args[0];
    try {
        console.log('🔍 Resolving rules...\n');
        const { rules, sources, conflicts } = resolveRules(ruleSetPath);
        console.log(`✅ Resolved ${Object.keys(rules).length} rules\n`);
        if (conflicts.length > 0) {
            console.log(`⚠️  ${conflicts.length} conflicts detected:\n`);
            for (const conflict of conflicts) {
                console.log(`  - ${conflict.conflict}`);
                console.log(`    Sources: ${conflict.sources.join(', ')}\n`);
            }
        }
        // Validate
        const validation = validateRules(ruleSetPath);
        if (!validation.valid) {
            console.log('❌ Validation failed:\n');
            for (const error of validation.errors) {
                console.log(`  - ${error}`);
            }
            process.exit(1);
        }
        if (validation.warnings.length > 0) {
            console.log('⚠️  Warnings:\n');
            for (const warning of validation.warnings) {
                console.log(`  - ${warning}`);
            }
        }
        // Display effective rules
        const effectiveRules = getEffectiveRules(ruleSetPath);
        console.log(`\n📋 Effective Rules (${effectiveRules.length} enabled):\n`);
        for (const rule of effectiveRules) {
            console.log(`  [${rule.severity}] ${rule.id}: ${rule.name}`);
        }
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
