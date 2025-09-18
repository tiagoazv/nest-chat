import { connect, NatsConnection, StringCodec } from "nats";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

@Injectable()
export class NatsProvider implements OnModuleInit, OnModuleDestroy {
  private nc: NatsConnection;
  private sc = StringCodec();

  async onModuleInit() {
    this.nc = await connect({ servers: "nats://localhost:4222" });
  }

  async onModuleDestroy() {
    await this.nc.drain();
  }

  publish<T extends Record<string, any>>(topic: string, payload: T) {
    console.log("\nPublishing to topic:", topic, "\npayload:", payload);
    this.nc.publish(topic, this.sc.encode(JSON.stringify(payload)));
  }

  subscribe(
    topic: string,
    handler: (data: any) => void,
  ) {
    const sub = this.nc.subscribe(topic);
    (async () => {
      for await (const m of sub) {
        const data = JSON.parse(this.sc.decode(m.data));
        handler(data);
      }
    })();
  }
}
