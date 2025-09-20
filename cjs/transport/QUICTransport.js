"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUICTransport = void 0;
class QUICTransport {
    url;
    onMessageCallback;
    constructor(url) {
        this.url = url;
    }
    connect() {
        console.log(`[Comoming soon...] Connecting via QUIC to ${this.url}`);
        // Comoming soon...
    }
    disconnect() {
        console.log('QUIC disconnected');
    }
    send(data) {
        console.log('Sending via QUIC:', data);
    }
    onMessage(callback) {
        this.onMessageCallback = callback;
    }
}
exports.QUICTransport = QUICTransport;
