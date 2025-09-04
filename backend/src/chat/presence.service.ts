import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { NatsProvider } from "../broker/broker-server";

@Injectable()
export class PresenceService implements OnApplicationBootstrap {
  private onlineUsers = new Set<string>();

  constructor(private readonly nats: NatsProvider) {}

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
    this.onlineUsers.add(userId);
    this.publishOnlineUsers();
  }

  private userDisconnected(userId: string) {
    this.onlineUsers.delete(userId);
    this.publishOnlineUsers();
  }

  private publishOnlineUsers() {
    const users = Array.from(this.onlineUsers);
    this.nats.publish("chat.user.online", { users });
  }
}
