export interface LoomServerOptions {
    host?: string;
    port?: number;
    debug?: boolean;
}
export declare class LoomServer {
    private static instance;
    private wss;
    private debug;
    private constructor();
    static getInstance(options: LoomServerOptions): LoomServer;
}
