import { WebTransport } from "./WebTransport.js";
import { QUICTransport } from "./QUICTransport.js";
export function createTransport(url, type) {
    if (typeof window !== "undefined") {
        return new WebTransport(url);
    }
    else {
        return type === "quic" ? new QUICTransport(url) : new WebTransport(url);
    }
}
