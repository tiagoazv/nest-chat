import { Test, TestingModule } from '@nestjs/testing';
import { setOnlineUsersHandler } from './set-online-users.handler';
import { NatsProvider } from 'src/broker/broker-server';
import { jest } from '@jest/globals';
describe('setOnlineUsersHandler', () => {
    let handler: setOnlineUsersHandler;
    let natsProvider: NatsProvider;
    let publishSpy: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                setOnlineUsersHandler,
                {
                    provide: NatsProvider,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<setOnlineUsersHandler>(setOnlineUsersHandler);
        natsProvider = module.get<NatsProvider>(NatsProvider);
        publishSpy = jest.spyOn(natsProvider, 'publish').mockImplementation(() => {});
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should set online users and publish an event', async () => {
        (handler as any).userConnected('user1');
        (handler as any).userConnected('user2');
        (handler as any).userConnected('user3');
        (handler as any).publishOnlineUsers();

        expect(publishSpy).toHaveBeenCalledWith('chat.user.online', { users: expect.arrayContaining(['user1', 'user2', 'user3']) });
    });

    it('should remove offline user and publish an event', async () => {
        (handler as any).userConnected('user1');
        (handler as any).userConnected('user2');
        (handler as any).userConnected('user3');
        (handler as any).userDisconnected('user2');
        (handler as any).publishOnlineUsers();

        expect(publishSpy).toHaveBeenCalledWith('chat.user.online', { users: expect.arrayContaining(['user1', 'user3']) });
    });

    it('should not publish if no online users', async () => {
        (handler as any).publishOnlineUsers();

        expect(publishSpy).not.toHaveBeenCalled();
    });

    it('should handle publish errors gracefully', () => {
        publishSpy.mockImplementationOnce(() => {
            throw new Error('Publish error');
        });

        (handler as any).userConnected('user1');
        expect(() => (handler as any).publishOnlineUsers()).not.toThrow();
    });
});