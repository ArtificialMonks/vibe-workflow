const WRAPPED_SYMBOL = Symbol.for('vibe-check.requestScopedTransport');
export function createRequestScopedTransport(transport, scope) {
    const existing = transport[WRAPPED_SYMBOL];
    if (existing) {
        return transport;
    }
    let storedValue = transport._enableJsonResponse ?? false;
    Object.defineProperty(transport, '_enableJsonResponse', {
        configurable: true,
        enumerable: false,
        get() {
            const store = scope.getStore();
            if (store?.forceJson) {
                return true;
            }
            return storedValue;
        },
        set(value) {
            storedValue = value;
        }
    });
    transport[WRAPPED_SYMBOL] = true;
    return transport;
}
