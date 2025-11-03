import { loadConstitutionalRulesAsStrings, getConstitutionalRulesPath } from '../utils/constitutionalRules.js';

interface ConstitutionEntry {
  rules: string[];
  fileLoaded: boolean;  // Track if file-based rules were loaded for this session
  updated: number;
}

const constitutionMap: Record<string, ConstitutionEntry> = Object.create(null);

const MAX_RULES_PER_SESSION = 50;
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Initialize constitution for a session by loading from files
 * This is automatically called by getConstitution if no entry exists yet
 */
function initializeSessionConstitution(sessionId: string): void {
  if (constitutionMap[sessionId]) {
    return; // Already initialized
  }

  const rulesPath = getConstitutionalRulesPath();

  if (rulesPath) {
    console.log(`[Constitution:init] Loading file-based rules for session ${sessionId} from ${rulesPath}`);
    const fileRules = loadConstitutionalRulesAsStrings();

    constitutionMap[sessionId] = {
      rules: fileRules,
      fileLoaded: true,
      updated: Date.now()
    };

    console.log(`[Constitution:init] Loaded ${fileRules.length} file-based rules for session ${sessionId}`);
  } else {
    console.log(`[Constitution:init] No constitutional rules file found for session ${sessionId}, starting with empty rule set`);
    constitutionMap[sessionId] = {
      rules: [],
      fileLoaded: false,
      updated: Date.now()
    };
  }
}

export function updateConstitution(sessionId: string, rule: string) {
  if (!sessionId || !rule) return;

  // Initialize session if it doesn't exist
  if (!constitutionMap[sessionId]) {
    initializeSessionConstitution(sessionId);
  }

  const entry = constitutionMap[sessionId];
  if (entry.rules.length >= MAX_RULES_PER_SESSION) entry.rules.shift();
  entry.rules.push(rule);
  entry.updated = Date.now();
}

export function resetConstitution(sessionId: string, rules: string[]) {
  if (!sessionId || !Array.isArray(rules)) return;
  constitutionMap[sessionId] = {
    rules: rules.slice(0, MAX_RULES_PER_SESSION),
    fileLoaded: false,  // Explicit reset means file-based rules are overridden
    updated: Date.now()
  };
}

export function getConstitution(sessionId: string): string[] {
  // Auto-initialize from files if session doesn't exist
  if (!constitutionMap[sessionId]) {
    initializeSessionConstitution(sessionId);
  }

  const entry = constitutionMap[sessionId];
  entry.updated = Date.now();
  return entry.rules;
}

// Cleanup stale sessions to prevent unbounded memory growth
function cleanup() {
  const now = Date.now();
  for (const [sessionId, entry] of Object.entries(constitutionMap)) {
    if (now - entry.updated > SESSION_TTL_MS) {
      delete constitutionMap[sessionId];
    }
  }
}

setInterval(cleanup, SESSION_TTL_MS).unref();

export const __testing = {
  _getMap: () => constitutionMap,
  cleanup
};
