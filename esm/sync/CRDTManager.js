export class CRDTManager {
    data = {};
    apply(delta) {
        const channel = delta.channel;
        const value = delta.data;
        if (!this.data[channel])
            this.data[channel] = new Set();
        if (Array.isArray(value))
            value.forEach(v => this.data[channel].add(v));
        else
            this.data[channel].add(value);
    }
    getState(channel) {
        return Array.from(this.data[channel] || []);
    }
}
