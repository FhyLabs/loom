export declare class CRDTManager {
    private data;
    apply(delta: any): void;
    getState(channel: string): any[];
}
