"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyRotation = void 0;
const EncryptionManager_js_1 = require("./EncryptionManager.js");
class KeyRotation {
    encryptionManager;
    constructor(encryptionManager) {
        this.encryptionManager = encryptionManager || new EncryptionManager_js_1.EncryptionManager();
    }
    rotate() {
        this.encryptionManager = new EncryptionManager_js_1.EncryptionManager();
        console.log("[Loom] Encryption key rotated");
    }
    getManager() {
        return this.encryptionManager;
    }
}
exports.KeyRotation = KeyRotation;
