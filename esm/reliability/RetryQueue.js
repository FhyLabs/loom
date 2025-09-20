export class RetryQueue {
    queue = [];
    add(packet) {
        this.queue.push(packet);
    }
    process(sendFn) {
        while (this.queue.length) {
            const packet = this.queue.shift();
            sendFn(packet.channel, packet.data);
        }
    }
}
