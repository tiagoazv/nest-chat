import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.connectMicroservice({
    transport: Transport.NATS,
    options: { servers: ['nats://localhost:4222'] },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
