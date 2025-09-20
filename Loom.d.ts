import { EncryptionManager } from "./security/EncryptionManager.js";
import { PersistenceManager } from "./persistence/PersistenceManager.js";
interface LoomOptions {
    url: string;
    encryption?: boolean;
    encryptionKey?: string;
    predictive?: boolean;
    transport?: "websocket" | "quic";
    clientId?: string;
    history?: boolean;
}
export declare class Loom {
    private transport;
    private predictiveEngine;
    private crdtManager;
    private otManager;
    private packetHandler;
    private retryQueue;
    encryption?: EncryptionManager;
    private keyRotation?;
    persistence: PersistenceManager;
    private events;
    private clientId?;
    private history;
    private encryptionEnabled;
    constructor(options: LoomOptions);
    private handleMessage;
    on(event: string, callback: Function): void;
    send(channel: string, data: any, receiver?: string): Promise<void>;
    connect(): void;
    disconnect(): void;
    renderBufferLocally(): void;
    clearHistory(): void;
}
export {};
