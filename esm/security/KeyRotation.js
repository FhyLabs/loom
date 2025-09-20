import { EncryptionManager } from "./EncryptionManager.js";
export class KeyRotation {
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
