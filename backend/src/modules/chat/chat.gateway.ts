import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventPattern, Payload, Ctx, NatsContext } from '@nestjs/microservices';
import { SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log('Cliente conectado:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    client.join(userId);
    console.log(`Usuário ${userId} registrado no socket ${client.id}`);
  }

  @EventPattern('chat.user.*')
  async handleMessage(@Payload() data: any, @Ctx() context: NatsContext) {
    const subject = context.getSubject();
    const userId = subject.split('.')[2];

    console.log(data);
    this.server.to(userId).emit('receiveMessage', data);
  }
}
