
import { setOnlineUsersHandler } from './set-online-users.handler';
import { NatsProvider } from 'src/broker/broker-server';

describe('setOnlineUsersHandler', () => {
    let handler: setOnlineUsersHandler;
    let natsProviderMock: { publish: jest.Mock };

    beforeEach(() => {
        natsProviderMock = { publish: jest.fn() };
        handler = new setOnlineUsersHandler(natsProviderMock as any);
    });

    it('should set online users and publish an event', () => {
        (handler as any).userConnected('user1');
        (handler as any).userConnected('user2');
        (handler as any).userConnected('user3');
        (handler as any).publishOnlineUsers();

        expect(natsProviderMock.publish).toHaveBeenCalledWith('chat.user.online', { users: expect.arrayContaining(['user1', 'user2', 'user3']) });
    });

    it('should remove offline user and publish an event', () => {
        (handler as any).userConnected('user1');
        (handler as any).userConnected('user2');
        (handler as any).userConnected('user3');
        (handler as any).userDisconnected('user2');
        (handler as any).publishOnlineUsers();

        expect(natsProviderMock.publish).toHaveBeenCalledWith('chat.user.online', { users: expect.arrayContaining(['user1', 'user3']) });
    });

    it('should not publish if no online users', () => {
        (handler as any).publishOnlineUsers();
        expect(natsProviderMock.publish).not.toHaveBeenCalled();
    });

    it('should handle publish errors gracefully', () => {
        natsProviderMock.publish.mockImplementationOnce(() => {
            throw new Error('Publish error');
        });
        (handler as any).userConnected('user1');
        expect(() => (handler as any).publishOnlineUsers()).not.toThrow();
    });
});