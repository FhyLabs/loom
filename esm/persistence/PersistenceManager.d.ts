interface BufferItem {
    channel: string;
    data: any;
    sender?: string;
    receiver?: string;
    timestamp: number;
}
export declare class PersistenceManager {
    private _buffer;
    private storageKey;
    constructor(history: boolean);
    buffer(channel: string, data: any, history: boolean, sender?: string, receiver?: string): void;
    getAll(): BufferItem[];
    clear(): void;
}
export {};
