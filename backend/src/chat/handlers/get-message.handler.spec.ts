
import { Test, TestingModule } from '@nestjs/testing';
import { GetMessageHandler } from './get-message.handler';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from '../message.schema';
import { Model } from 'mongoose';


describe('GetMessageHandler', () => {
    let handler: GetMessageHandler;
    let findMock: jest.Mock;
    let populateMock: jest.Mock;
    let execMock: jest.Mock;
    let messageModelMock: any;

    beforeEach(async () => {
        execMock = jest.fn().mockResolvedValue([
            { from: 'user1', to: 'user2', content: 'Hello' },
            { from: 'user2', to: 'user1', content: 'Hi' },
        ]);
        populateMock = jest.fn().mockReturnValue({ exec: execMock });
        findMock = jest.fn().mockReturnValue({ populate: populateMock });
        messageModelMock = { find: findMock };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetMessageHandler,
                {
                    provide: getModelToken(Message.name),
                    useValue: messageModelMock,
                },
            ],
        }).compile();

        handler = module.get<GetMessageHandler>(GetMessageHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should retrieve messages between two users', async () => {
        const from = 'user1';
        const to = 'user2';

        const messages = await handler.execute(from, to);

        expect(findMock).toHaveBeenCalledWith({
            $or: [
                { from: from, to: to },
                { from: to, to: from },
            ],
        });
        expect(populateMock).toHaveBeenCalledWith('from to');
        expect(execMock).toHaveBeenCalled();
        expect(messages).toEqual([
            { from: 'user1', to: 'user2', content: 'Hello' },
            { from: 'user2', to: 'user1', content: 'Hi' },
        ]);
    });

    it('should handle model errors', async () => {
        execMock.mockRejectedValue(new Error('Database error'));

        await expect(handler.execute('user1', 'user2')).rejects.toThrow('Database error');
    });
});