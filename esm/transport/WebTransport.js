export class WebTransport {
    url;
    ws;
    onMessageCallback;
    constructor(url) {
        this.url = url;
    }
    connect() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => console.log('Connected via WebSocket');
        this.ws.onmessage = (event) => {
            if (this.onMessageCallback)
                this.onMessageCallback(JSON.parse(event.data));
        };
        this.ws.onclose = () => console.log('Disconnected WebSocket');
        this.ws.onerror = (err) => console.error('WebSocket error:', err);
    }
    disconnect() {
        this.ws?.close();
    }
    send(data) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
        else {
            console.warn('WebSocket not open, message queued', data);
        }
    }
    onMessage(callback) {
        this.onMessageCallback = callback;
    }
}
