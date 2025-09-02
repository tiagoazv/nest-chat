import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BrokerService implements OnModuleInit, OnModuleDestroy {
  private client: ClientProxy;

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
      },
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.close();
    }
  }

  async emit(subject: string, payload: any) {
    return this.client.emit(subject, payload);
  }

  async send<T = any, R = any>(subject: string, payload: T) {
    return lastValueFrom(this.client.send<R, T>(subject, payload));
  }
}