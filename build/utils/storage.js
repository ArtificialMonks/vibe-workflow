import fs from 'fs';
import path from 'path';
import os from 'os';
// Define data directory - configurable via VIBE_CHECK_STORAGE_DIR environment variable
// Falls back to user's home directory if not set
function getDataDir() {
    if (process.env.VIBE_CHECK_STORAGE_DIR) {
        return process.env.VIBE_CHECK_STORAGE_DIR;
    }
    return path.join(os.homedir(), '.vibe-check');
}
// Get project name from storage directory path
// E.g., /path/to/hivebrowser/.vibe-check → hivebrowser
function getProjectName() {
    const dataDir = getDataDir();
    // Extract directory name before .vibe-check
    const parts = dataDir.split(path.sep);
    const vibeCheckIndex = parts.findIndex(p => p === '.vibe-check');
    if (vibeCheckIndex > 0) {
        return parts[vibeCheckIndex - 1];
    }
    return 'default';
}
const DATA_DIR = getDataDir();
const PROJECT_NAME = getProjectName();
const LOG_FILE = path.join(DATA_DIR, `vibe-log-${PROJECT_NAME}.json`);
/**
 * DEPRECATED: This functionality is now optional and will be removed in a future version.
 * Standard mistake categories
 */
export const STANDARD_CATEGORIES = [
    'Complex Solution Bias',
    'Feature Creep',
    'Premature Implementation',
    'Misalignment',
    'Overtooling',
    'Preference',
    'Success',
    'Other'
];
// Initial empty log structure
const emptyLog = {
    mistakes: {},
    lastUpdated: Date.now()
};
/**
 * Ensure the data directory exists
 */
export function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}
/**
 * Read the vibe log from disk
 */
export function readLogFile() {
    ensureDataDir();
    if (!fs.existsSync(LOG_FILE)) {
        // Initialize with empty log if file doesn't exist
        writeLogFile(emptyLog);
        return emptyLog;
    }
    try {
        const data = fs.readFileSync(LOG_FILE, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading vibe log:', error);
        // Return empty log as fallback
        return emptyLog;
    }
}
/**
 * Write data to the vibe log file
 */
export function writeLogFile(data) {
    ensureDataDir();
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(LOG_FILE, jsonData, 'utf8');
    }
    catch (error) {
        console.error('Error writing vibe log:', error);
    }
}
/**
 * Add a mistake to the vibe log
 */
export function addLearningEntry(mistake, category, solution, type = 'mistake') {
    const log = readLogFile();
    const now = Date.now();
    // Create new entry
    const entry = {
        type,
        category,
        mistake,
        solution,
        timestamp: now
    };
    // Initialize category if it doesn't exist
    if (!log.mistakes[category]) {
        log.mistakes[category] = {
            count: 0,
            examples: [],
            lastUpdated: now
        };
    }
    // Update category data
    log.mistakes[category].count += 1;
    log.mistakes[category].examples.push(entry);
    log.mistakes[category].lastUpdated = now;
    log.lastUpdated = now;
    // Write updated log
    writeLogFile(log);
    return entry;
}
/**
 * Get all mistake entries
 */
export function getLearningEntries() {
    const log = readLogFile();
    const result = {};
    // Convert to flat structure by category
    for (const [category, data] of Object.entries(log.mistakes)) {
        result[category] = data.examples;
    }
    return result;
}
/**
 * Get mistake category summaries, sorted by count (most frequent first)
 */
export function getLearningCategorySummary() {
    const log = readLogFile();
    // Convert to array with most recent example
    const summary = Object.entries(log.mistakes).map(([category, data]) => {
        // Get most recent example
        const recentExample = data.examples[data.examples.length - 1];
        return {
            category,
            count: data.count,
            recentExample
        };
    });
    // Sort by count (descending)
    return summary.sort((a, b) => b.count - a.count);
}
/**
 * Build a learning context string from the vibe log
 * including recent examples for each category. This can be
 * fed directly to the LLM for improved pattern recognition.
 */
export function getLearningContextText(maxPerCategory = 5) {
    const log = readLogFile();
    let context = '';
    for (const [category, data] of Object.entries(log.mistakes)) {
        context += `Category: ${category} (count: ${data.count})\n`;
        const examples = [...data.examples]
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-maxPerCategory);
        for (const ex of examples) {
            const date = new Date(ex.timestamp).toISOString();
            const label = ex.type === 'mistake'
                ? 'Mistake'
                : ex.type === 'preference'
                    ? 'Preference'
                    : 'Success';
            const solutionText = ex.solution ? ` | Solution: ${ex.solution}` : '';
            context += `- [${date}] ${label}: ${ex.mistake}${solutionText}\n`;
        }
        context += '\n';
    }
    return context.trim();
}
