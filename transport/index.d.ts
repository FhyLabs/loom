import { WebTransport } from "./WebTransport.js";
import { QUICTransport } from "./QUICTransport.js";
export declare function createTransport(url: string, type: "websocket" | "quic"): WebTransport | QUICTransport;
