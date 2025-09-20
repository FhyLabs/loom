"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loom = void 0;
const index_js_1 = require("./transport/index.js");
const PredictiveEngine_js_1 = require("./sync/PredictiveEngine.js");
const CRDTManager_js_1 = require("./sync/CRDTManager.js");
const OTManager_js_1 = require("./sync/OTManager.js");
const PacketHandler_js_1 = require("./reliability/PacketHandler.js");
const RetryQueue_js_1 = require("./reliability/RetryQueue.js");
const EncryptionManager_js_1 = require("./security/EncryptionManager.js");
const KeyRotation_js_1 = require("./security/KeyRotation.js");
const PersistenceManager_js_1 = require("./persistence/PersistenceManager.js");
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
        this.transport = (0, index_js_1.createTransport)(options.url, options.transport || "websocket");
        this.predictiveEngine = new PredictiveEngine_js_1.PredictiveEngine();
        this.crdtManager = new CRDTManager_js_1.CRDTManager();
        this.otManager = new OTManager_js_1.OTManager();
        this.packetHandler = new PacketHandler_js_1.PacketHandler();
        this.retryQueue = new RetryQueue_js_1.RetryQueue();
        this.persistence = new PersistenceManager_js_1.PersistenceManager(this.history);
        if (this.encryptionEnabled) {
            const key = options.encryptionKey || "loom-default-encryption-key";
            this.encryption = new EncryptionManager_js_1.EncryptionManager(key);
            this.keyRotation = new KeyRotation_js_1.KeyRotation(this.encryption);
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
