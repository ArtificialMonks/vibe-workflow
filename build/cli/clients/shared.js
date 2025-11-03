import { promises as fsPromises, constants as fsConstants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import os from 'node:os';
import { isDeepStrictEqual } from 'node:util';
const { access, mkdir, readFile, rename, writeFile } = fsPromises;
export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export async function pathExists(path) {
    try {
        await access(path, fsConstants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
export function expandHomePath(path) {
    if (!path.startsWith('~')) {
        return resolve(path);
    }
    const home = os.homedir();
    if (path === '~') {
        return home;
    }
    const remainder = path.slice(1);
    if (remainder.startsWith('/') || remainder.startsWith('\\')) {
        return resolve(join(home, remainder.slice(1)));
    }
    return resolve(join(home, remainder));
}
export async function readJsonFile(path, raw, context = 'Client configuration') {
    const payload = raw ?? (await readFile(path, 'utf8'));
    const parsed = JSON.parse(payload);
    if (!isRecord(parsed)) {
        throw new Error(`${context} must be a JSON object.`);
    }
    return parsed;
}
export async function writeJsonFileAtomic(path, data) {
    await mkdir(dirname(path), { recursive: true });
    const tempPath = `${path}.${process.pid}.${Date.now()}.tmp`;
    const payload = `${JSON.stringify(data, null, 2)}\n`;
    await writeFile(tempPath, payload, { mode: 0o600 });
    await rename(tempPath, path);
}
export function mergeIntoMap(config, entry, options, mapKey) {
    const baseConfig = isRecord(config) ? config : {};
    const existingMap = isRecord(baseConfig[mapKey]) ? { ...baseConfig[mapKey] } : {};
    const currentEntry = isRecord(existingMap[options.id])
        ? { ...existingMap[options.id] }
        : null;
    if (currentEntry && currentEntry.managedBy !== options.sentinel) {
        return {
            next: baseConfig,
            changed: false,
            reason: `Existing entry "${options.id}" is not managed by ${options.sentinel}.`,
        };
    }
    const sanitizedEntry = { ...entry };
    delete sanitizedEntry.managedBy;
    const nextEntry = { ...sanitizedEntry, managedBy: options.sentinel };
    const nextMap = { ...existingMap, [options.id]: nextEntry };
    const nextConfig = { ...baseConfig, [mapKey]: nextMap };
    if (currentEntry && isDeepStrictEqual(currentEntry, nextEntry)) {
        return { next: baseConfig, changed: false };
    }
    return { next: nextConfig, changed: true };
}
