import { WebSocketServer, WebSocket } from "ws";
export class LoomServer {
    static instance;
    wss;
    debug;
    constructor(options) {
        const port = options.port ?? 8080;
        this.debug = options.debug ?? false;
        this.wss = new WebSocketServer({ port });
        console.log(`LoomServer running at ws://${options.host ?? "localhost"}:${port}`);
        this.wss.on("connection", (ws) => {
            if (this.debug)
                console.log("Client connected");
            ws.on("message", (data) => {
                if (this.debug) {
                    console.log("Received raw message:", data.toString());
                }
                for (const client of this.wss.clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(data.toString());
                    }
                }
            });
            ws.on("close", () => {
                if (this.debug)
                    console.log("Client disconnected");
            });
        });
    }
    static getInstance(options) {
        if (!LoomServer.instance) {
            LoomServer.instance = new LoomServer(options);
        }
        return LoomServer.instance;
    }
}
