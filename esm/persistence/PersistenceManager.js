export class PersistenceManager {
    _buffer = [];
    storageKey = "loom_buffer";
    constructor(history) {
        if (!history)
            return;
        if (typeof window !== "undefined" && window.localStorage) {
            try {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    this._buffer = JSON.parse(stored);
                }
            }
            catch (e) {
                console.warn("[Loom] Failed to load buffer from localStorage:", e);
            }
        }
    }
    buffer(channel, data, history, sender, receiver) {
        const item = {
            channel,
            data,
            sender,
            receiver,
            timestamp: Date.now(),
        };
        this._buffer.push(item);
        if (!history)
            return;
        if (typeof window !== "undefined" && window.localStorage) {
            try {
                const stored = localStorage.getItem(this.storageKey);
                const existing = stored ? JSON.parse(stored) : [];
                localStorage.setItem(this.storageKey, JSON.stringify([...existing, item]));
            }
            catch (e) {
                console.warn("[Loom] Failed to write to localStorage:", e);
            }
        }
    }
    getAll() {
        return [...this._buffer];
    }
    clear() {
        this._buffer = [];
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem(this.storageKey);
        }
    }
}
