import {webSocketClient} from "../core/webSocketClient";
import type {PresenceRequest} from "../types/chat";

class PresenceService {
    heartbeat() {
        if (webSocketClient.isConnected) {
            webSocketClient.send<PresenceRequest>("/app/presence/heartbeat");
        }
    }

    updatePresence(isOnline: boolean) {
        if (webSocketClient.isConnected) {
            webSocketClient.send<PresenceRequest>("/app/presence/update", {isOnline});
        }
    }
}

export const presenceService = new PresenceService();