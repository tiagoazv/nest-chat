'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function useSocket(userId: string | null, onOnlineUpdate: (ids: string[]) => void): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socketInstance = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('register', userId);
    });

    socketInstance.on('updateOnlineUsers', onOnlineUpdate);

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [userId]);

  return socket;
}
