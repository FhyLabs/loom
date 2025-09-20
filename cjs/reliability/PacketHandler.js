"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketHandler = void 0;
class PacketHandler {
    handle(packet) {
        if (!packet.channel)
            throw new Error('Packet missing channel');
    }
}
exports.PacketHandler = PacketHandler;
