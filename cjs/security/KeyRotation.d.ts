import { EncryptionManager } from "./EncryptionManager.js";
export declare class KeyRotation {
    private encryptionManager;
    constructor(encryptionManager?: EncryptionManager);
    rotate(): void;
    getManager(): EncryptionManager;
}
