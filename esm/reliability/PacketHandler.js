export class PacketHandler {
    handle(packet) {
        if (!packet.channel)
            throw new Error('Packet missing channel');
    }
}
