import { Test, TestingModule } from '@nestjs/testing';
import { SendMessageHandler } from './send-message.handler';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Message } from '../message.schema';
import { NatsProvider } from 'src/broker/broker-server';


describe('SendMessageHandler', () => {
    let handler: SendMessageHandler;
    let messageModelMock: jest.Mock;
    let saveMock: jest.Mock;
    let natsProvider: NatsProvider;

    beforeEach(async () => {
        saveMock = jest.fn().mockResolvedValue({});
        messageModelMock = jest.fn().mockImplementation(() => ({ save: saveMock }));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SendMessageHandler,
                {
                    provide: getModelToken(Message.name),
                    useValue: messageModelMock,
                },
                {
                    provide: NatsProvider,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
                {
                    provide: getConnectionToken(),
                    useValue: {},
                },
            ],
        }).compile();

        handler = module.get<SendMessageHandler>(SendMessageHandler);
        natsProvider = module.get<NatsProvider>(NatsProvider);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should send a message and publish an event', async () => {
        const dto = {
            from: 'user1',
            to: 'user2',
            content: 'Hello, World!',
        };

        const publishSpy = jest.spyOn(natsProvider, 'publish').mockImplementationOnce(() => {});

        await handler.execute(dto);

        expect(saveMock).toHaveBeenCalled();
        expect(publishSpy).toHaveBeenCalledWith(`chat.user.${dto.to}`, {
            from: dto.from,
            to: dto.to,
            content: dto.content,
            timestamp: expect.any(Number),
        });
    });


    it('should throw an error if saving fails', async () => {
        const dto = {
            from: 'user1',
            to: 'user2',
            content: 'Hello, World!',
        };

        saveMock.mockRejectedValueOnce(new Error('DB Error'));

        await expect(handler.execute(dto)).rejects.toThrow('DB Error');
    });


    it('should throw an error if publishing fails', async () => {
        const dto = {
            from: 'user1',
            to: 'user2',
            content: 'Hello, World!',
        };

        saveMock.mockResolvedValueOnce({});
        jest.spyOn(natsProvider, 'publish').mockImplementationOnce(() => {
            throw new Error('NATS Error');
        });

        await expect(handler.execute(dto)).rejects.toThrow('NATS Error');
    });
});