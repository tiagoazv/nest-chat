import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { GetMessageHandler } from '../handlers/get-message.handler';
import { GetLastMessageHandler } from '../handlers/get-last-message.handler';
import { SendMessageHandler } from '../handlers/send-message.handler';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from '../message.schema';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [ChatController],
    providers: [
      {
        provide: GetMessageHandler,
        useValue: { execute: jest.fn() },
      },
      {
        provide: GetLastMessageHandler,
        useValue: { execute: jest.fn() },
      },
      {
        provide: SendMessageHandler,
        useValue: { execute: jest.fn() },
      },
      {
        provide: getModelToken(Message.name),
        useValue: {}, // mock as needed
      },
    ],
  }).compile();

  controller = module.get<ChatController>(ChatController);
});

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
