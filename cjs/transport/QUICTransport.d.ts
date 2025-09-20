export declare class QUICTransport {
    private url;
    private onMessageCallback?;
    constructor(url: string);
    connect(): void;
    disconnect(): void;
    send(data: any): void;
    onMessage(callback: Function): void;
}
