import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import net from 'node:net';
import { parse as parseEnv } from 'dotenv';
import semver from 'semver';
import { homeConfigDir } from './env.js';
export function checkNodeVersion(requiredRange, currentVersion = process.version) {
    const current = currentVersion;
    const coerced = semver.coerce(current);
    const satisfies = coerced ? semver.satisfies(coerced, requiredRange) : false;
    return {
        ok: satisfies,
        current,
    };
}
export async function portStatus(port) {
    return new Promise((resolveStatus) => {
        const tester = net.createServer();
        tester.once('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                resolveStatus('in-use');
            }
            else {
                resolveStatus('unknown');
            }
        });
        tester.once('listening', () => {
            tester.close(() => resolveStatus('free'));
        });
        try {
            tester.listen({ port, host: '127.0.0.1' });
        }
        catch {
            resolveStatus('unknown');
        }
    });
}
export function detectEnvFiles() {
    const cwdEnvPath = resolve(process.cwd(), '.env');
    const homeEnvPath = resolve(homeConfigDir(), '.env');
    return {
        cwdEnv: existsSync(cwdEnvPath) ? cwdEnvPath : null,
        homeEnv: existsSync(homeEnvPath) ? homeEnvPath : null,
    };
}
export function readEnvFile(path) {
    const raw = readFileSync(path, 'utf8');
    return parseEnv(raw);
}
