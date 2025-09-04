import {
  wsconnect,
  credsAuthenticator,
  NatsConnection,
  PublishOptions,
  RequestOptions,
  SubscriptionOptions,
  TimeoutError,
  Subscription,
} from "@nats-io/nats-core";

export type BrokerPayload = Record<string, any>;

export type MqttHandler<T extends BrokerPayload> = (
  topic: string,
  payload: T,
) => any;

export async function createConnection(
  clientId: string,
  userId: string,
  auth: string,
) {
  const server = "ws://localhost:9222";

  const connection = await wsconnect({
    name: clientId,
    servers: server,
    tls: null,
    debug: false,
    inboxPrefix: `${userId}._INBOX`,
    maxReconnectAttempts: 3,
  });

  console.log(`BROKER [${clientId}] connected`);

  return new BrokerClient(clientId, connection);
}

export class BrokerClient {
  public readonly connection: NatsConnection;
  readonly clientId: string;

  constructor(clientId: string, connection: NatsConnection) {
    this.connection = connection;
    this.clientId = clientId;

    (async () => {
      console.log(`BROKER [${clientId}] connected ${connection.getServer()}`);
      for await (const s of connection.status()) {
        console.log(`BROKER [${clientId}] ${s.type}: ${JSON.stringify(s)}`);
      }
    })().then();
  }

  public async disconnect(graceful: boolean = true): Promise<void> {
    if (graceful) {
      await this.connection?.drain();
    } else {
      await this.connection?.close();
    }

    this.connection?.closed().then((err) => {
      const m = `BROKER [${this.clientId}] connection closed`;
      console.log(`${m} ${err ? err.message : ""}`);
    });
  }

  public subscribe<T extends BrokerPayload>(
    topic: string,
    handler: MqttHandler<T>,
    options?: SubscriptionOptions & {
      onTimeout?: (topic: string, error: Error) => void;
    },
  ): Subscription {
    console.log(`BROKER [${this.clientId}] subscription to topic [${topic}]`);
    const subscription = this.connection.subscribe(topic, options);

    (async () => {
      for await (const message of subscription) {
        try {
          const processedMessage: any = message.json();
          // Because "handler" is async, it doesn't block the asynchronous iterable (for/await)
          console.log(
            `BROKER [${this.clientId}] receive subscription from topic [${message.subject}] with payload`,
            processedMessage,
          );

          void handler(message.subject, processedMessage);
        } catch (error) {
          console.error(
            `BROKER [${this.clientId}] error processing message =>`,
            error,
          );
        }
      }
    })().catch((error) => {
      if (error instanceof TimeoutError) {
        options?.onTimeout?.(topic, error);
      } else {
        console.error(
          `BROKER [${this.clientId}] error on subscription iterator =>`,
          error,
        );
      }
    });

    return subscription;
  }

  public publish<T extends BrokerPayload>(
    topic: string,
    payload: T,
    opts?: Partial<PublishOptions>,
  ): void {
    console.log(
      `BROKER [${this.clientId}] publish to topic [${topic}] with payload`,
      payload,
    );
    this.connection.publish(topic, JSON.stringify(payload), opts);
  }

  public async request<R = any>(
    topic: string,
    payload: any,
    opts?: Partial<RequestOptions>,
  ): Promise<R> {
    console.log(
      `BROKER [${this.clientId}] send request to topic [${topic}] with payload`,
      payload,
    );

    try {
      const reply = await this.connection.request(
        topic,
        JSON.stringify(payload),
        { timeout: 3000, ...opts },
      );

      const data = reply.json();

      console.log(
        `BROKER [${this.clientId}] receive reply from topic [${topic}] with payload`,
        data,
      );

      return data as R;
    } catch (e) {
      console.error(`BROKER [${this.clientId}] problem with request: ${e}`);
      throw e;
    }
  }

  public isConnected(): boolean {
    return !this.connection.isClosed();
  }
}
