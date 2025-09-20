export declare class EncryptionManager {
    private static rawKey;
    private key;
    constructor(clientKey?: string);
    setKey(clientKey: string): void;
    private getKey;
    encrypt(data: any): Promise<{
        iv: number[];
        encrypted: number[];
    }>;
    decrypt(payload: {
        iv: number[];
        encrypted: number[];
    }): Promise<any>;
}
