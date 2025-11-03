#!/usr/bin/env tsx
/**
 * Intelligent Constitutional Template Generator
 *
 * Analyzes your codebase to:
 * 1. Discover work types needed for your project
 * 2. Customize existing templates with project-specific rules from CLAUDE.md
 * 3. Generate NEW templates for discovered specialized domains
 *
 * Usage:
 *   tsx scripts/intelligent-constitution-generator.ts /path/to/project
 */

import fs from 'fs/promises';
import path from 'path';

interface DiscoveredWorkType {
  name: string;
  displayName: string;
  description: string;
  triggers: string[];
  evidence: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface ExtractedRule {
  text: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  workType: string;
  source: string;
}

interface WorkTypeTemplate {
  name: string;
  description: string;
  workTypes: string[];
  rules: string[];
  antiPatterns?: string[];
  guidelines?: Record<string, string>;
}

interface ProjectAnalysis {
  frameworks: string[];
  languages: string[];
  hasMonorepo: boolean;
  hasDocker: boolean;
  hasCICD: boolean;
  specializedDomains: string[];
  directoryStructure: string[];
}

// ============================================================================
// STEP 1: ANALYZE CODEBASE TO DISCOVER WORK TYPES
// ============================================================================

async function analyzeCodebase(projectDir: string): Promise<ProjectAnalysis> {
  const analysis: ProjectAnalysis = {
    frameworks: [],
    languages: [],
    hasMonorepo: false,
    hasDocker: false,
    hasCICD: false,
    specializedDomains: [],
    directoryStructure: []
  };

  try {
    // Analyze package.json
    const packageJsonPath = path.join(projectDir, 'package.json');
    try {
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(packageContent);

      // Detect frameworks
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      Object.keys(allDeps).forEach(dep => {
        if (dep.includes('nest')) analysis.frameworks.push('NestJS');
        if (dep.includes('react')) analysis.frameworks.push('React');
        if (dep.includes('vue')) analysis.frameworks.push('Vue');
        if (dep.includes('angular')) analysis.frameworks.push('Angular');
        if (dep.includes('express')) analysis.frameworks.push('Express');
        if (dep.includes('fastify')) analysis.frameworks.push('Fastify');
        if (dep.includes('next')) analysis.frameworks.push('Next.js');
        if (dep.includes('playwright')) analysis.frameworks.push('Playwright');
        if (dep.includes('puppeteer')) analysis.frameworks.push('Puppeteer');
        if (dep.includes('prisma')) analysis.frameworks.push('Prisma');
        if (dep.includes('typeorm')) analysis.frameworks.push('TypeORM');
        if (dep.includes('mongoose')) analysis.frameworks.push('MongoDB');

        // Detect specialized domains
        if (dep.includes('tensorflow') || dep.includes('torch')) {
          analysis.specializedDomains.push('machine-learning');
        }
        if (dep.includes('web3') || dep.includes('ethers')) {
          analysis.specializedDomains.push('blockchain');
        }
        if (dep.includes('stripe') || dep.includes('payment')) {
          analysis.specializedDomains.push('payments');
        }
        if (dep.includes('auth') || dep.includes('passport')) {
          analysis.specializedDomains.push('authentication');
        }
        if (dep.includes('socket.io') || dep.includes('ws')) {
          analysis.specializedDomains.push('realtime');
        }
        if (dep.includes('graphql')) {
          analysis.specializedDomains.push('graphql');
        }
      });

      // Detect monorepo
      if (pkg.workspaces || allDeps['turborepo'] || allDeps['nx']) {
        analysis.hasMonorepo = true;
      }
    } catch {}

    // Check for Docker
    const dockerfilePath = path.join(projectDir, 'Dockerfile');
    const dockerComposePath = path.join(projectDir, 'docker-compose.yml');
    try {
      await fs.access(dockerfilePath);
      analysis.hasDocker = true;
    } catch {}
    try {
      await fs.access(dockerComposePath);
      analysis.hasDocker = true;
    } catch {}

    // Check for CI/CD
    const githubActionsPath = path.join(projectDir, '.github', 'workflows');
    const gitlabCIPath = path.join(projectDir, '.gitlab-ci.yml');
    try {
      await fs.access(githubActionsPath);
      analysis.hasCICD = true;
    } catch {}
    try {
      await fs.access(gitlabCIPath);
      analysis.hasCICD = true;
    } catch {}

    // Detect languages
    try {
      await fs.access(path.join(projectDir, 'tsconfig.json'));
      analysis.languages.push('TypeScript');
    } catch {}
    try {
      await fs.access(path.join(projectDir, 'package.json'));
      analysis.languages.push('JavaScript');
    } catch {}
    try {
      await fs.access(path.join(projectDir, 'requirements.txt'));
      analysis.languages.push('Python');
    } catch {}
    try {
      await fs.access(path.join(projectDir, 'go.mod'));
      analysis.languages.push('Go');
    } catch {}

    // Analyze directory structure
    const entries = await fs.readdir(projectDir);
    analysis.directoryStructure = entries;

  } catch (error) {
    console.warn('⚠️  Error analyzing codebase:', error);
  }

  // Deduplicate
  analysis.frameworks = [...new Set(analysis.frameworks)];
  analysis.languages = [...new Set(analysis.languages)];
  analysis.specializedDomains = [...new Set(analysis.specializedDomains)];

  return analysis;
}

// ============================================================================
// STEP 2: DISCOVER NEW WORK TYPES FROM ANALYSIS
// ============================================================================

function discoverWorkTypes(analysis: ProjectAnalysis): DiscoveredWorkType[] {
  const discovered: DiscoveredWorkType[] = [];

  // Monorepo coordination
  if (analysis.hasMonorepo) {
    discovered.push({
      name: 'monorepo-coordination',
      displayName: 'Monorepo Coordination',
      description: 'Rules for managing monorepo structure and cross-package dependencies',
      triggers: ['monorepo', 'workspace', 'turborepo', 'nx'],
      evidence: ['Detected workspace structure', 'Found monorepo tooling'],
      confidence: 'high'
    });
  }

  // Container orchestration
  if (analysis.hasDocker) {
    discovered.push({
      name: 'container-orchestration',
      displayName: 'Container Orchestration',
      description: 'Rules for Docker, containerization, and orchestration',
      triggers: ['docker', 'container', 'kubernetes', 'k8s'],
      evidence: ['Found Dockerfile or docker-compose.yml'],
      confidence: 'high'
    });
  }

  // Machine Learning
  if (analysis.specializedDomains.includes('machine-learning')) {
    discovered.push({
      name: 'ml-development',
      displayName: 'Machine Learning Development',
      description: 'Rules for ML model training, evaluation, and deployment',
      triggers: ['ml', 'machine-learning', 'model', 'training'],
      evidence: ['Detected ML libraries (tensorflow, torch, etc.)'],
      confidence: 'high'
    });
  }

  // Blockchain
  if (analysis.specializedDomains.includes('blockchain')) {
    discovered.push({
      name: 'blockchain-development',
      displayName: 'Blockchain Development',
      description: 'Rules for smart contracts, web3, and blockchain integrations',
      triggers: ['blockchain', 'web3', 'smart-contract', 'ethereum'],
      evidence: ['Detected web3 libraries'],
      confidence: 'high'
    });
  }

  // Payments
  if (analysis.specializedDomains.includes('payments')) {
    discovered.push({
      name: 'payment-processing',
      displayName: 'Payment Processing',
      description: 'Rules for payment integrations, PCI compliance, and financial transactions',
      triggers: ['payment', 'stripe', 'billing', 'transaction'],
      evidence: ['Detected payment libraries'],
      confidence: 'high'
    });
  }

  // Authentication & Authorization
  if (analysis.specializedDomains.includes('authentication')) {
    discovered.push({
      name: 'auth-security',
      displayName: 'Authentication & Security',
      description: 'Rules for authentication, authorization, and security best practices',
      triggers: ['auth', 'security', 'oauth', 'jwt'],
      evidence: ['Detected auth libraries'],
      confidence: 'high'
    });
  }

  // Real-time Communication
  if (analysis.specializedDomains.includes('realtime')) {
    discovered.push({
      name: 'realtime-communication',
      displayName: 'Real-time Communication',
      description: 'Rules for WebSocket, real-time updates, and bidirectional communication',
      triggers: ['realtime', 'websocket', 'socket', 'sse'],
      evidence: ['Detected real-time libraries'],
      confidence: 'high'
    });
  }

  // GraphQL
  if (analysis.specializedDomains.includes('graphql')) {
    discovered.push({
      name: 'graphql-development',
      displayName: 'GraphQL Development',
      description: 'Rules for GraphQL schema design, resolvers, and query optimization',
      triggers: ['graphql', 'apollo', 'schema'],
      evidence: ['Detected GraphQL libraries'],
      confidence: 'high'
    });
  }

  return discovered;
}

// ============================================================================
// STEP 3: SCAN CLAUDE.MD FOR CATEGORIZED RULES
// ============================================================================

async function extractRulesFromClaudeMd(projectDir: string): Promise<ExtractedRule[]> {
  const rules: ExtractedRule[] = [];
  const claudeMdPath = path.join(projectDir, 'CLAUDE.md');

  try {
    const content = await fs.readFile(claudeMdPath, 'utf-8');
    const lines = content.split('\n');

    let currentSection = 'general';
    let currentSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect section (work type)
      if (line.startsWith('###') || line.startsWith('##')) {
        const sectionTitle = line.replace(/^#{2,}\s*/, '').toLowerCase();

        // Map section titles to work types
        if (sectionTitle.includes('database') || sectionTitle.includes('migration')) {
          currentSection = 'database-migrations';
        } else if (sectionTitle.includes('api') || sectionTitle.includes('backend')) {
          currentSection = 'api-development';
        } else if (sectionTitle.includes('ui') || sectionTitle.includes('frontend') || sectionTitle.includes('component')) {
          currentSection = 'ui-components';
        } else if (sectionTitle.includes('test')) {
          currentSection = 'testing';
        } else if (sectionTitle.includes('deploy') || sectionTitle.includes('devops')) {
          currentSection = 'deployment';
        } else if (sectionTitle.includes('integration') || sectionTitle.includes('webhook')) {
          currentSection = 'integration-development';
        } else if (sectionTitle.includes('workflow') || sectionTitle.includes('automation')) {
          currentSection = 'workflow-automation';
        } else if (sectionTitle.includes('auth') || sectionTitle.includes('security')) {
          currentSection = 'auth-security';
        } else if (sectionTitle.includes('payment')) {
          currentSection = 'payment-processing';
        } else if (sectionTitle.includes('graphql')) {
          currentSection = 'graphql-development';
        } else if (sectionTitle.includes('monorepo')) {
          currentSection = 'monorepo-coordination';
        } else if (sectionTitle.includes('docker') || sectionTitle.includes('container')) {
          currentSection = 'container-orchestration';
        }

        // Detect severity from section
        if (sectionTitle.includes('zero-tolerance') || sectionTitle.includes('critical')) {
          currentSeverity = 'CRITICAL';
        }
      }

      // Extract rules
      if (line.startsWith('- **NEVER**:') || line.startsWith('- **CRITICAL**:')) {
        const ruleText = line.replace(/^- \*\*(?:NEVER|CRITICAL)\*\*:\s*/, '');
        rules.push({
          text: ruleText,
          severity: 'CRITICAL',
          workType: currentSection,
          source: `CLAUDE.md:${i + 1}`
        });
      } else if (line.startsWith('- **ALWAYS**:') || line.startsWith('- **HIGH**:')) {
        const ruleText = line.replace(/^- \*\*(?:ALWAYS|HIGH)\*\*:\s*/, '');
        rules.push({
          text: ruleText,
          severity: 'HIGH',
          workType: currentSection,
          source: `CLAUDE.md:${i + 1}`
        });
      } else if (line.startsWith('- **MEDIUM**:')) {
        const ruleText = line.replace(/^- \*\*MEDIUM\*\*:\s*/, '');
        rules.push({
          text: ruleText,
          severity: 'MEDIUM',
          workType: currentSection,
          source: `CLAUDE.md:${i + 1}`
        });
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not read CLAUDE.md:', error);
  }

  return rules;
}

// ============================================================================
// STEP 4: LOAD EXISTING TEMPLATES
// ============================================================================

async function loadExistingTemplates(projectDir: string): Promise<Map<string, WorkTypeTemplate>> {
  const templates = new Map<string, WorkTypeTemplate>();
  const constitutionsDir = path.join(projectDir, '.vibe-check', 'constitutions');

  try {
    const files = await fs.readdir(constitutionsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(constitutionsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const template = JSON.parse(content) as WorkTypeTemplate;
        const workType = file.replace('.json', '');
        templates.set(workType, template);
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not load existing templates:', error);
  }

  return templates;
}

// ============================================================================
// STEP 5: CUSTOMIZE EXISTING TEMPLATES
// ============================================================================

function customizeTemplate(
  template: WorkTypeTemplate,
  workType: string,
  extractedRules: ExtractedRule[],
  projectName: string
): WorkTypeTemplate {
  const customized = { ...template };

  // Add project-specific rules from CLAUDE.md
  const relevantRules = extractedRules.filter(r => r.workType === workType);

  const newRules = relevantRules.map(r => `${r.severity}: ${r.text}`);

  // Merge: Keep generic rules + add project-specific
  customized.rules = [
    ...template.rules,
    ...newRules
  ];

  // Update description
  customized.description = `${template.description} (customized for ${projectName})`;

  return customized;
}

// ============================================================================
// STEP 6: GENERATE NEW TEMPLATES FOR DISCOVERED WORK TYPES
// ============================================================================

function generateNewTemplate(
  workType: DiscoveredWorkType,
  extractedRules: ExtractedRule[],
  projectName: string
): WorkTypeTemplate {
  const relevantRules = extractedRules.filter(r => r.workType === workType.name);

  const rules = relevantRules.length > 0
    ? relevantRules.map(r => `${r.severity}: ${r.text}`)
    : [
        `HIGH: Follow ${workType.displayName} best practices`,
        `MEDIUM: Document ${workType.displayName} decisions and architecture`,
        `MEDIUM: Test ${workType.displayName} functionality thoroughly`
      ];

  return {
    name: workType.displayName,
    description: `${workType.description} (auto-generated for ${projectName})`,
    workTypes: workType.triggers,
    rules,
    antiPatterns: [],
    guidelines: {
      confidence: workType.confidence,
      evidence: workType.evidence.join(', '),
      generated: 'Auto-generated based on codebase analysis'
    }
  };
}

// ============================================================================
// STEP 7: SAVE CUSTOMIZED AND NEW TEMPLATES
// ============================================================================

async function saveTemplates(
  projectDir: string,
  templates: Map<string, WorkTypeTemplate>
): Promise<void> {
  const constitutionsDir = path.join(projectDir, '.vibe-check', 'constitutions');

  for (const [workType, template] of templates) {
    const filePath = path.join(constitutionsDir, `${workType}.json`);
    await fs.writeFile(filePath, JSON.stringify(template, null, 2));
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const projectDir = process.argv[2] || process.cwd();
  const projectName = path.basename(projectDir);

  console.log('🔍 Intelligent Constitutional Template Generator\n');
  console.log(`📂 Project: ${projectName}`);
  console.log(`📍 Location: ${projectDir}\n`);

  // Step 1: Analyze codebase
  console.log('🔬 Step 1: Analyzing codebase...');
  const analysis = await analyzeCodebase(projectDir);
  console.log(`   Frameworks: ${analysis.frameworks.join(', ') || 'None'}`);
  console.log(`   Languages: ${analysis.languages.join(', ') || 'None'}`);
  console.log(`   Monorepo: ${analysis.hasMonorepo ? 'Yes' : 'No'}`);
  console.log(`   Docker: ${analysis.hasDocker ? 'Yes' : 'No'}`);
  console.log(`   CI/CD: ${analysis.hasCICD ? 'Yes' : 'No'}`);
  console.log(`   Specialized: ${analysis.specializedDomains.join(', ') || 'None'}\n`);

  // Step 2: Discover new work types
  console.log('🔎 Step 2: Discovering work types...');
  const discoveredWorkTypes = discoverWorkTypes(analysis);
  console.log(`   Discovered ${discoveredWorkTypes.length} new work types:\n`);
  discoveredWorkTypes.forEach(wt => {
    console.log(`   ✨ ${wt.displayName} (${wt.confidence} confidence)`);
    console.log(`      Evidence: ${wt.evidence.join(', ')}`);
  });
  console.log('');

  // Step 3: Extract rules from CLAUDE.md
  console.log('📖 Step 3: Extracting rules from CLAUDE.md...');
  const extractedRules = await extractRulesFromClaudeMd(projectDir);
  console.log(`   Extracted ${extractedRules.length} rules\n`);

  // Group by work type
  const rulesByWorkType = new Map<string, number>();
  extractedRules.forEach(r => {
    rulesByWorkType.set(r.workType, (rulesByWorkType.get(r.workType) || 0) + 1);
  });
  for (const [workType, count] of rulesByWorkType) {
    console.log(`   ${workType}: ${count} rules`);
  }
  console.log('');

  // Step 4: Load existing templates
  console.log('📋 Step 4: Loading existing templates...');
  const existingTemplates = await loadExistingTemplates(projectDir);
  console.log(`   Loaded ${existingTemplates.size} existing templates\n`);

  // Step 5: Customize existing templates
  console.log('✏️  Step 5: Customizing existing templates...');
  const customizedTemplates = new Map<string, WorkTypeTemplate>();
  for (const [workType, template] of existingTemplates) {
    const customized = customizeTemplate(template, workType, extractedRules, projectName);
    customizedTemplates.set(workType, customized);
    const addedRules = customized.rules.length - template.rules.length;
    if (addedRules > 0) {
      console.log(`   ✓ ${workType}: +${addedRules} project-specific rules`);
    }
  }
  console.log('');

  // Step 6: Generate new templates
  console.log('🆕 Step 6: Generating new templates for discovered work types...');
  for (const workType of discoveredWorkTypes) {
    if (!customizedTemplates.has(workType.name)) {
      const newTemplate = generateNewTemplate(workType, extractedRules, projectName);
      customizedTemplates.set(workType.name, newTemplate);
      console.log(`   ✓ Generated ${workType.name}.json`);
    }
  }
  console.log('');

  // Step 7: Save all templates
  console.log('💾 Step 7: Saving templates...');
  await saveTemplates(projectDir, customizedTemplates);
  console.log(`   ✓ Saved ${customizedTemplates.size} templates\n`);

  // Summary
  console.log('📊 Summary:');
  console.log(`   Total templates: ${customizedTemplates.size}`);
  console.log(`   Customized: ${existingTemplates.size}`);
  console.log(`   New: ${discoveredWorkTypes.length}`);
  console.log(`   Total rules: ${Array.from(customizedTemplates.values()).reduce((sum, t) => sum + t.rules.length, 0)}\n`);

  console.log('✨ Intelligent generation complete!\n');
  console.log('🎯 Next steps:');
  console.log('   1. Review customized templates in .vibe-check/constitutions/');
  console.log('   2. Adjust rules as needed for your project');
  console.log('   3. Run: npm run validate');
  console.log('   4. Restart Claude Code\n');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
