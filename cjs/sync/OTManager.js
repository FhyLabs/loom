"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTManager = void 0;
class OTManager {
    documents = {};
    apply(delta) {
        const channel = delta.channel;
        const text = delta.data?.text;
        if (!channel || text === undefined)
            return;
        this.documents[channel] = text;
    }
    getDocument(channel) {
        return this.documents[channel] || '';
    }
}
exports.OTManager = OTManager;
