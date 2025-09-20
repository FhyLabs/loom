"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionManager = void 0;
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
exports.EncryptionManager = EncryptionManager;
