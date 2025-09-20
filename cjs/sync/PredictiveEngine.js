"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictiveEngine = void 0;
class PredictiveEngine {
    state = {};
    applyDelta(delta) {
        if (!delta.channel || !delta.data)
            return;
        this.state[delta.channel] = delta.data;
    }
    getState(channel) {
        return this.state[channel];
    }
}
exports.PredictiveEngine = PredictiveEngine;
