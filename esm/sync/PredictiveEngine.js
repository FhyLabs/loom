export class PredictiveEngine {
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
