import { SendMessageHandler } from './send-message.handler';

describe('SendMessageHandler', () => {
    let handler: SendMessageHandler;
    let saveMock: jest.Mock;
    let messageModelMock: jest.Mock;
    let natsProviderMock: { publish: jest.Mock };
    let connectionMock: any;

    beforeEach(() => {
        saveMock = jest.fn().mockResolvedValue({});
        messageModelMock = jest.fn().mockImplementation(() => ({ save: saveMock }));
        natsProviderMock = { publish: jest.fn() };
        connectionMock = {};
        handler = new SendMessageHandler(messageModelMock as any, connectionMock, natsProviderMock as any);
    });

    it('should send a message and publish an event', async () => {
        const dto = {
            from: 'user1',
            to: 'user2',
            content: 'Hello, World!',
        };

        natsProviderMock.publish.mockImplementationOnce(() => {});

        await handler.execute(dto);

        expect(saveMock).toHaveBeenCalled();
        expect(natsProviderMock.publish).toHaveBeenCalledWith(`chat.user.${dto.to}`, {
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
        natsProviderMock.publish.mockImplementationOnce(() => {
            throw new Error('NATS Error');
        });

        await expect(handler.execute(dto)).rejects.toThrow('NATS Error');
    });
});