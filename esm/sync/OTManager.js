export class OTManager {
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
