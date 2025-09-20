export declare class RetryQueue {
    private queue;
    add(packet: any): void;
    process(sendFn: Function): void;
}
