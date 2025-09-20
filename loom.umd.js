(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Loom = {}));
})(this, (function (exports) { 'use strict';

    class WebTransport {
        url;
        ws;
        onMessageCallback;
        constructor(url) {
            this.url = url;
        }
        connect() {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = () => console.log('Connected via WebSocket');
            this.ws.onmessage = (event) => {
                if (this.onMessageCallback)
                    this.onMessageCallback(JSON.parse(event.data));
            };
            this.ws.onclose = () => console.log('Disconnected WebSocket');
            this.ws.onerror = (err) => console.error('WebSocket error:', err);
        }
        disconnect() {
            this.ws?.close();
        }
        send(data) {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(data));
            }
            else {
                console.warn('WebSocket not open, message queued', data);
            }
        }
        onMessage(callback) {
            this.onMessageCallback = callback;
        }
    }

    class QUICTransport {
        url;
        onMessageCallback;
        constructor(url) {
            this.url = url;
        }
        connect() {
            console.log(`[Comoming soon...] Connecting via QUIC to ${this.url}`);
            // Comoming soon...
        }
        disconnect() {
            console.log('QUIC disconnected');
        }
        send(data) {
            console.log('Sending via QUIC:', data);
        }
        onMessage(callback) {
            this.onMessageCallback = callback;
        }
    }

    function createTransport(url, type) {
        if (typeof window !== "undefined") {
            return new WebTransport(url);
        }
        else {
            return type === "quic" ? new QUICTransport(url) : new WebTransport(url);
        }
    }

    class PredictiveEngine {
        state = {};
        applyDelta(delta) {
            if (!delta.channel || !delta.data)
                return;
            this.state[delta.channel] = delta.data;
        }
        getState(channel) {
            return this.state[channel];
        }
    }

    class CRDTManager {
        data = {};
        apply(delta) {
            const channel = delta.channel;
            const value = delta.data;
            if (!this.data[channel])
                this.data[channel] = new Set();
            if (Array.isArray(value))
                value.forEach(v => this.data[channel].add(v));
            else
                this.data[channel].add(value);
        }
        getState(channel) {
            return Array.from(this.data[channel] || []);
        }
    }

    class OTManager {
        documents = {};
        apply(delta) {
            const channel = delta.channel;
            const text = delta.data?.text;
            if (!channel || text === undefined)
                return;
            this.documents[channel] = text;
        }
        getDocument(channel) {
            return this.documents[channel] || '';
        }
    }

    class PacketHandler {
        handle(packet) {
            if (!packet.channel)
                throw new Error('Packet missing channel');
        }
    }

    class RetryQueue {
        queue = [];
        add(packet) {
            this.queue.push(packet);
        }
        process(sendFn) {
            while (this.queue.length) {
                const packet = this.queue.shift();
                sendFn(packet.channel, packet.data);
            }
        }
    }

    class EncryptionManager {
        static rawKey = null;
        key = null;
        constructor(clientKey) {
            if (clientKey) {
                this.setKey(clientKey);
            }
        }
        setKey(clientKey) {
            EncryptionManager.rawKey = new TextEncoder()
                .encode(clientKey.padEnd(32, "0"))
                .slice(0, 32).buffer;
            this.key = null;
        }
        async getKey() {
            if (!this.key) {
                if (!EncryptionManager.rawKey) {
                    throw new Error("Encryption key is not set!");
                }
                this.key = await crypto.subtle.importKey("raw", EncryptionManager.rawKey, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
            }
            return this.key;
        }
        async encrypt(data) {
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoded = new TextEncoder().encode(JSON.stringify(data));
            const key = await this.getKey();
            const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
            return {
                iv: Array.from(iv),
                encrypted: Array.from(new Uint8Array(cipherBuffer)),
            };
        }
        async decrypt(payload) {
            const iv = new Uint8Array(payload.iv);
            const data = new Uint8Array(payload.encrypted);
            const key = await this.getKey();
            const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
            return JSON.parse(new TextDecoder().decode(decryptedBuffer));
        }
    }

    class KeyRotation {
        encryptionManager;
        constructor(encryptionManager) {
            this.encryptionManager = encryptionManager || new EncryptionManager();
        }
        rotate() {
            this.encryptionManager = new EncryptionManager();
            console.log("[Loom] Encryption key rotated");
        }
        getManager() {
            return this.encryptionManager;
        }
    }

    class PersistenceManager {
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

    class Loom {
        transport;
        predictiveEngine;
        crdtManager;
        otManager;
        packetHandler;
        retryQueue;
        encryption;
        keyRotation;
        persistence;
        events = new Map();
        clientId;
        history;
        encryptionEnabled;
        constructor(options) {
            this.clientId = options.clientId;
            this.history = options.history ?? false;
            this.encryptionEnabled = options.encryption ?? false;
            this.transport = createTransport(options.url, options.transport || "websocket");
            this.predictiveEngine = new PredictiveEngine();
            this.crdtManager = new CRDTManager();
            this.otManager = new OTManager();
            this.packetHandler = new PacketHandler();
            this.retryQueue = new RetryQueue();
            this.persistence = new PersistenceManager(this.history);
            if (this.encryptionEnabled) {
                const key = options.encryptionKey || "loom-default-encryption-key";
                this.encryption = new EncryptionManager(key);
                this.keyRotation = new KeyRotation(this.encryption);
            }
            this.transport.onMessage((msg) => this.handleMessage(msg));
        }
        async handleMessage(msg) {
            let data = msg;
            if (this.encryptionEnabled) {
                try {
                    data = await this.encryption.decrypt(msg);
                }
                catch (e) {
                    console.warn("[Loom] Failed to decrypt message:", e);
                    data = { channel: msg.channel || "default", data: { message: "?????", clientId: msg.data?.clientId || "???" } };
                }
            }
            if (this.history && data.data.clientId !== this.clientId) {
                this.persistence.buffer(data.channel, data.data, this.history, data.data.clientId, this.clientId);
            }
            this.predictiveEngine.applyDelta(data);
            this.crdtManager.apply(data);
            this.otManager.apply(data);
            const evt = data.channel || "default";
            this.events.get(evt)?.forEach((fn) => fn(data, data.data.clientId));
        }
        on(event, callback) {
            if (!this.events.has(event))
                this.events.set(event, []);
            this.events.get(event)?.push(callback);
        }
        async send(channel, data, receiver) {
            if (this.clientId && !data.clientId) {
                data.clientId = this.clientId;
            }
            this.persistence.buffer(channel, data, this.history, this.clientId, receiver);
            let payload = { channel, data };
            if (this.encryptionEnabled) {
                payload = await this.encryption.encrypt(payload);
            }
            this.transport.send(payload);
            this.packetHandler.handle(payload);
            this.retryQueue.add(payload);
        }
        connect() {
            this.transport.connect();
        }
        disconnect() {
            this.transport.disconnect();
        }
        renderBufferLocally() {
            if (!this.history)
                return;
            const items = this.persistence.getAll();
            for (const item of items) {
                const evt = this.events.get(item.channel);
                if (evt) {
                    evt.forEach(fn => fn({ channel: item.channel, data: item.data, clientId: item.data.clientId }, item.data.clientId));
                }
            }
        }
        clearHistory() {
            this.persistence.clear();
        }
    }

    exports.Loom = Loom;

}));
