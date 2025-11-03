import crypto from 'node:crypto';
const STABLE_ID_PREFIX = 'compat-';
function computeStableHash(request) {
    const params = request.params ?? {};
    return crypto
        .createHash('sha256')
        .update(JSON.stringify({ method: request.method, params }))
        .digest('hex')
        .slice(0, 12);
}
function generateNonce() {
    const nonceValue = parseInt(crypto.randomBytes(3).toString('hex'), 16);
    const base36 = nonceValue.toString(36);
    return base36.padStart(4, '0').slice(-6);
}
export function formatCompatId(stableHash, nonce = generateNonce()) {
    return `${STABLE_ID_PREFIX}${stableHash}-${nonce}`;
}
function computeStableId(request) {
    const stableHash = computeStableHash(request);
    return formatCompatId(stableHash);
}
export function applyJsonRpcCompatibility(request) {
    if (!request || typeof request !== 'object') {
        return { applied: false };
    }
    if (request.jsonrpc !== '2.0') {
        return { applied: false };
    }
    if (request.method !== 'tools/call') {
        return { applied: false };
    }
    if (request.id !== undefined && request.id !== null) {
        return { applied: false };
    }
    const id = computeStableId(request);
    request.id = id;
    return { applied: true, id };
}
export function wrapTransportForCompatibility(transport) {
    const originalOnMessage = transport.onmessage;
    let wrappedHandler;
    const wrapHandler = (handler) => {
        if (!handler) {
            wrappedHandler = undefined;
            return;
        }
        wrappedHandler = function (message, extra) {
            applyJsonRpcCompatibility(message);
            return handler.call(this ?? transport, message, extra);
        };
    };
    Object.defineProperty(transport, 'onmessage', {
        configurable: true,
        enumerable: true,
        get() {
            return wrappedHandler;
        },
        set(handler) {
            if (handler === wrappedHandler && handler !== undefined) {
                return;
            }
            wrapHandler(handler);
        },
    });
    if (originalOnMessage) {
        transport.onmessage = originalOnMessage;
    }
    return transport;
}
