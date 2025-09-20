export declare class WebTransport {
    private url;
    private ws?;
    private onMessageCallback?;
    constructor(url: string);
    connect(): void;
    disconnect(): void;
    send(data: any): void;
    onMessage(callback: Function): void;
}
