import fs from 'fs/promises';
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
const HISTORY_FILE = path.join(DATA_DIR, `history-${PROJECT_NAME}.json`);
let history = new Map();
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
    catch { }
}
export async function loadHistory() {
    await ensureDataDir();
    try {
        const data = await fs.readFile(HISTORY_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        history = new Map(Object.entries(parsed).map(([k, v]) => [k, v]));
    }
    catch {
        history.set('default', []);
    }
}
async function saveHistory() {
    const data = Object.fromEntries(history);
    await fs.writeFile(HISTORY_FILE, JSON.stringify(data));
}
export function getHistorySummary(sessionId = 'default') {
    const sessHistory = history.get(sessionId) || [];
    if (!sessHistory.length)
        return '';
    const summary = sessHistory.slice(-5).map((int, i) => `Interaction ${i + 1}: Goal ${int.input.goal}, Guidance: ${int.output.slice(0, 100)}...`).join('\n');
    return `History Context:\n${summary}\n`;
}
export function addToHistory(sessionId = 'default', input, output) {
    if (!history.has(sessionId)) {
        history.set(sessionId, []);
    }
    const sessHistory = history.get(sessionId);
    sessHistory.push({ input, output, timestamp: Date.now() });
    if (sessHistory.length > 10) {
        sessHistory.shift();
    }
    saveHistory();
}
