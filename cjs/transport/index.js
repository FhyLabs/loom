"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransport = createTransport;
const WebTransport_js_1 = require("./WebTransport.js");
const QUICTransport_js_1 = require("./QUICTransport.js");
function createTransport(url, type) {
    if (typeof window !== "undefined") {
        return new WebTransport_js_1.WebTransport(url);
    }
    else {
        return type === "quic" ? new QUICTransport_js_1.QUICTransport(url) : new WebTransport_js_1.WebTransport(url);
    }
}
