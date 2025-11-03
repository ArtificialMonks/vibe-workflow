import { join, resolve } from 'node:path';
import { expandHomePath, mergeIntoMap, pathExists, readJsonFile, writeJsonFileAtomic, } from './shared.js';
const locateVsCodeConfig = async (customPath) => {
    if (customPath) {
        return expandHomePath(customPath);
    }
    const workspacePath = join(process.cwd(), '.vscode', 'mcp.json');
    if (await pathExists(workspacePath)) {
        return resolve(workspacePath);
    }
    return null;
};
const readVsCodeConfig = async (path, raw) => {
    return readJsonFile(path, raw);
};
const mergeVsCodeEntry = (config, entry, options) => {
    const baseEntry = {
        command: entry.command,
        args: entry.args,
        env: entry.env ?? {},
        transport: options.transport,
    };
    if (options.transport === 'http') {
        baseEntry.url = options.httpUrl ?? 'http://127.0.0.1:2091';
    }
    if (options.dev?.watch || options.dev?.debug) {
        const dev = {};
        if (options.dev.watch) {
            dev.watch = true;
        }
        if (options.dev.debug) {
            dev.debug = options.dev.debug;
        }
        baseEntry.dev = dev;
    }
    return mergeIntoMap(config, baseEntry, options, 'servers');
};
const writeVsCodeConfigAtomic = async (path, data) => {
    await writeJsonFileAtomic(path, data);
};
const adapter = {
    locate: locateVsCodeConfig,
    read: readVsCodeConfig,
    merge: mergeVsCodeEntry,
    writeAtomic: writeVsCodeConfigAtomic,
    describe() {
        return {
            name: 'Visual Studio Code',
            pathHint: '.vscode/mcp.json (workspace)',
            summary: 'VS Code MCP configuration supporting stdio and HTTP transports.',
            transports: ['stdio', 'http'],
            defaultTransport: 'stdio',
            notes: 'Use the Command Palette → "MCP: Add Server" for profile installs.',
            docsUrl: 'https://code.visualstudio.com/docs/copilot/mcp',
        };
    },
};
export default adapter;
