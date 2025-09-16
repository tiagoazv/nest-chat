import { Injectable } from "@nestjs/common";
import { NatsProvider } from "src/broker/broker-server";

@Injectable()
export class setOnlineUsersHandler {
    private onlineUsers = new Set<string>();

    constructor(private readonly nats: NatsProvider) { }

    async onApplicationBootstrap(): Promise<void> {
        this.nats.subscribe("chat.user.connect", (data) => {
            const { userId } = data;
            this.userConnected(userId);
        });

        this.nats.subscribe("chat.user.disconnect", (data) => {
            const { userId } = data;
            this.userDisconnected(userId);
        });
    }

    private userConnected(userId: string) {
        if (userId) {
            this.onlineUsers.add(userId);
            this.publishOnlineUsers();
        }
    }

    private userDisconnected(userId: string) {
        if (userId) {
            this.onlineUsers.delete(userId);
            this.publishOnlineUsers();
        }
    }

    private publishOnlineUsers() {
        if (this.onlineUsers.size === 0) return;
        const users = Array.from(this.onlineUsers);
        try {
            this.nats.publish("chat.user.online", { users });
        } catch (err) {
        }
    }
}