
import { GetLastMessageHandler } from './get-last-message.handler';

describe('GetLastMessageHandler', () => {
    let handler: GetLastMessageHandler;
    let findOneMock: jest.Mock;
    let populateMock: jest.Mock;
    let sortMock: jest.Mock;
    let execMock: jest.Mock;
    let messageModelMock: any;

    beforeEach(() => {
        execMock = jest.fn().mockResolvedValue({ from: 'user1', to: 'user2', content: 'Hello' });
        sortMock = jest.fn().mockReturnValue({ exec: execMock });
        populateMock = jest.fn().mockReturnValue({ sort: sortMock });
        findOneMock = jest.fn().mockReturnValue({ populate: populateMock });
        messageModelMock = { findOne: findOneMock };
        handler = new GetLastMessageHandler(messageModelMock as any, {} as any);
    });

    it('should retrieve the last message between two users', async () => {
        const from = 'user1';
        const to = 'user2';

        const message = await handler.execute(from, to);

        expect(findOneMock).toHaveBeenCalledWith({
            $or: [
                { from: from, to: to },
                { from: to, to: from },
            ],
        });
        expect(populateMock).toHaveBeenCalledWith('from to');
        expect(sortMock).toHaveBeenCalledWith({ timestamp: -1 });
        expect(execMock).toHaveBeenCalled();
        expect(message).toEqual({ from: 'user1', to: 'user2', content: 'Hello' });
    });

    it('should handle model errors', async () => {
        execMock.mockRejectedValue(new Error('Database error'));
        await expect(handler.execute('user1', 'user2')).rejects.toThrow('Database error');
    });
});