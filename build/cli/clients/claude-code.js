import { join } from 'node:path';
import os from 'node:os';
import { expandHomePath, mergeIntoMap, pathExists, readJsonFile, writeJsonFileAtomic, } from './shared.js';
const locateClaudeCodeConfig = async (customPath) => {
    if (customPath) {
        return expandHomePath(customPath);
    }
    const home = os.homedir();
    const candidates = [];
    if (process.platform === 'darwin') {
        candidates.push(join(home, 'Library', 'Application Support', 'Claude', 'claude_code_config.json'));
    }
    else if (process.platform === 'win32') {
        const appData = process.env.APPDATA;
        if (appData) {
            candidates.push(join(appData, 'Claude', 'claude_code_config.json'));
        }
    }
    else {
        const xdgConfig = process.env.XDG_CONFIG_HOME;
        if (xdgConfig) {
            candidates.push(join(xdgConfig, 'Claude', 'claude_code_config.json'));
        }
        candidates.push(join(home, '.config', 'Claude', 'claude_code_config.json'));
    }
    for (const candidate of candidates) {
        if (await pathExists(candidate)) {
            return candidate;
        }
    }
    return null;
};
const readClaudeCodeConfig = async (path, raw) => {
    return readJsonFile(path, raw, 'Claude Code config');
};
const writeClaudeCodeConfigAtomic = async (path, data) => {
    await writeJsonFileAtomic(path, data);
};
const mergeClaudeCodeEntry = (config, entry, options) => {
    return mergeIntoMap(config, entry, options, 'mcpServers');
};
const adapter = {
    locate: locateClaudeCodeConfig,
    read: readClaudeCodeConfig,
    merge: mergeClaudeCodeEntry,
    writeAtomic: writeClaudeCodeConfigAtomic,
    describe() {
        return {
            name: 'Claude Code',
            pathHint: '~/.config/Claude/claude_code_config.json',
            summary: 'Anthropic\'s Claude Code CLI agent configuration.',
            transports: ['stdio'],
            defaultTransport: 'stdio',
            requiredEnvKeys: ['ANTHROPIC_API_KEY'],
            notes: 'Run `claude code login` once to scaffold the config file.',
            docsUrl: 'https://docs.anthropic.com/en/docs/agents/claude-code',
        };
    },
};
export default adapter;
