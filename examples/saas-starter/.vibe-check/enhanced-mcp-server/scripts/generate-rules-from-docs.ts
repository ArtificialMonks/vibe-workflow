#!/usr/bin/env tsx
/**
 * Intelligent Constitutional Rules Generator
 *
 * Scans project documentation (CLAUDE.md, README.md, etc.) and generates
 * project-specific constitutional rules automatically.
 *
 * Usage:
 *   tsx scripts/generate-rules-from-docs.ts /path/to/project
 */

import fs from 'fs/promises';
import path from 'path';

interface ProjectContext {
  projectName: string;
  hasClaudeMd: boolean;
  hasReadme: boolean;
  detectedPatterns: string[];
  detectedFrameworks: string[];
  detectedConventions: string[];
}

interface ConstitutionalRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  enabled: boolean;
  rationale?: string;
  examples?: string[];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

async function scanProjectDocumentation(projectDir: string): Promise<ProjectContext> {
  const projectName = path.basename(projectDir);
  const claudeMdPath = path.join(projectDir, 'CLAUDE.md');
  const readmePath = path.join(projectDir, 'README.md');
  const packageJsonPath = path.join(projectDir, 'package.json');

  const hasClaudeMd = await fileExists(claudeMdPath);
  const hasReadme = await fileExists(readmePath);

  const detectedPatterns: string[] = [];
  const detectedFrameworks: string[] = [];
  const detectedConventions: string[] = [];

  // Read CLAUDE.md
  const claudeContent = await readFileIfExists(claudeMdPath);
  if (claudeContent) {
    console.log('📄 Found CLAUDE.md - scanning for patterns...');

    // Detect zero-tolerance rules
    if (claudeContent.includes('ZERO-TOLERANCE') || claudeContent.includes('NEVER')) {
      const zeroToleranceMatches = claudeContent.match(/\*\*NEVER\*\*:([^\n]+)/g);
      if (zeroToleranceMatches) {
        detectedPatterns.push(...zeroToleranceMatches.map(m => m.replace('**NEVER**:', '').trim()));
      }
    }

    // Detect always rules
    if (claudeContent.includes('ALWAYS')) {
      const alwaysMatches = claudeContent.match(/\*\*ALWAYS\*\*:([^\n]+)/g);
      if (alwaysMatches) {
        detectedConventions.push(...alwaysMatches.map(m => m.replace('**ALWAYS**:', '').trim()));
      }
    }

    // Detect frameworks
    const frameworkKeywords = ['NestJS', 'React', 'Vue', 'Angular', 'Express', 'FastAPI', 'Django', 'TypeORM', 'Prisma'];
    frameworkKeywords.forEach(fw => {
      if (claudeContent.includes(fw)) {
        detectedFrameworks.push(fw);
      }
    });
  }

  // Read package.json
  const packageContent = await readFileIfExists(packageJsonPath);
  if (packageContent) {
    try {
      const pkg = JSON.parse(packageContent);
      if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(dep => {
          if (dep.includes('nest') && !detectedFrameworks.includes('NestJS')) {
            detectedFrameworks.push('NestJS');
          }
          if (dep.includes('react') && !detectedFrameworks.includes('React')) {
            detectedFrameworks.push('React');
          }
          if (dep.includes('typeorm') && !detectedFrameworks.includes('TypeORM')) {
            detectedFrameworks.push('TypeORM');
          }
        });
      }
    } catch (e) {
      console.warn('⚠️  Could not parse package.json');
    }
  }

  return {
    projectName,
    hasClaudeMd,
    hasReadme,
    detectedPatterns,
    detectedFrameworks,
    detectedConventions
  };
}

function generateRulesFromContext(context: ProjectContext): Record<string, ConstitutionalRule> {
  const rules: Record<string, ConstitutionalRule> = {};

  // Rule 1: Always generated - Project-specific patterns
  rules[`${context.projectName}-patterns`] = {
    id: `${context.projectName}-patterns`,
    name: `${context.projectName} Project Patterns`,
    description: `ALWAYS follow ${context.projectName}-specific patterns and conventions${context.hasClaudeMd ? ' as defined in CLAUDE.md' : ''}`,
    category: 'best-practices',
    severity: 'HIGH',
    enabled: true,
    rationale: `Ensures consistency across ${context.projectName} codebase`,
    examples: context.detectedConventions.slice(0, 3)
  };

  // Rule 2: Framework-specific rules
  if (context.detectedFrameworks.length > 0) {
    const frameworks = context.detectedFrameworks.join(', ');
    rules[`${context.projectName}-frameworks`] = {
      id: `${context.projectName}-frameworks`,
      name: `${context.projectName} Framework Conventions`,
      description: `ALWAYS use approved frameworks: ${frameworks}`,
      category: 'architecture',
      severity: 'CRITICAL',
      enabled: true,
      rationale: `Project uses specific framework versions: ${frameworks}`,
      examples: [`Use ${frameworks} for all implementations`]
    };
  }

  // Rule 3: Zero-tolerance patterns
  if (context.detectedPatterns.length > 0) {
    rules[`${context.projectName}-forbidden`] = {
      id: `${context.projectName}-forbidden`,
      name: `${context.projectName} Forbidden Patterns`,
      description: `NEVER ${context.detectedPatterns.join(', ')}`,
      category: 'constraints',
      severity: 'CRITICAL',
      enabled: true,
      rationale: 'Zero-tolerance rules from project documentation',
      examples: context.detectedPatterns.slice(0, 3)
    };
  }

  // Rule 4: Documentation reference
  if (context.hasClaudeMd) {
    rules[`${context.projectName}-docs-first`] = {
      id: `${context.projectName}-docs-first`,
      name: 'Read CLAUDE.md Before Work',
      description: 'ALWAYS read CLAUDE.md and relevant context files before starting any task',
      category: 'best-practices',
      severity: 'HIGH',
      enabled: true,
      rationale: 'CLAUDE.md contains critical project-specific instructions',
      examples: ['Check CLAUDE.md for zero-tolerance rules', 'Read context files mentioned in CLAUDE.md']
    };
  }

  return rules;
}

async function generateConstitutionalRules(projectDir: string): Promise<void> {
  console.log('🔍 Scanning project documentation...\n');

  const context = await scanProjectDocumentation(projectDir);

  console.log(`\n📊 Project Analysis:`);
  console.log(`   Name: ${context.projectName}`);
  console.log(`   CLAUDE.md: ${context.hasClaudeMd ? '✅ Found' : '❌ Not found'}`);
  console.log(`   README.md: ${context.hasReadme ? '✅ Found' : '❌ Not found'}`);
  console.log(`   Frameworks: ${context.detectedFrameworks.length > 0 ? context.detectedFrameworks.join(', ') : 'None detected'}`);
  console.log(`   Patterns: ${context.detectedPatterns.length} zero-tolerance rules found`);
  console.log(`   Conventions: ${context.detectedConventions.length} conventions found\n`);

  const rules = generateRulesFromContext(context);

  const constitutionalRules = {
    '$schema': 'shared/schema/constitutional-rules.schema.json',
    version: '1.0.0',
    extends: ['shared/base-constitutional-rules.json'],
    description: `Constitutional rules for ${context.projectName} project (auto-generated from documentation)`,
    generatedAt: new Date().toISOString(),
    generatedFrom: {
      claudeMd: context.hasClaudeMd,
      readme: context.hasReadme,
      packageJson: true
    },
    rules,
    overrides: {}
  };

  const outputPath = path.join(projectDir, '.vibe-check', 'constitutional-rules.json');
  await fs.writeFile(outputPath, JSON.stringify(constitutionalRules, null, 2));

  console.log(`✅ Generated constitutional rules at:`);
  console.log(`   ${outputPath}\n`);
  console.log(`📝 Generated ${Object.keys(rules).length} project-specific rules:\n`);

  Object.values(rules).forEach(rule => {
    console.log(`   • ${rule.name} (${rule.severity})`);
    console.log(`     ${rule.description}`);
    console.log('');
  });

  console.log(`🎯 Next steps:`);
  console.log(`   1. Review generated rules in .vibe-check/constitutional-rules.json`);
  console.log(`   2. Customize rules as needed`);
  console.log(`   3. Run: npm run validate`);
  console.log(`   4. Restart Claude Code\n`);
}

// Main execution
const projectDir = process.argv[2] || process.cwd();

generateConstitutionalRules(projectDir)
  .then(() => {
    console.log('✨ Rule generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error generating rules:', error.message);
    process.exit(1);
  });
