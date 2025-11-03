import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let cachedVersion = null;
export function getPackageVersion() {
    if (cachedVersion) {
        return cachedVersion;
    }
    const pkg = require('../../package.json');
    const version = pkg?.version;
    if (!version) {
        throw new Error('Package version is missing from package.json');
    }
    cachedVersion = version;
    return cachedVersion;
}
