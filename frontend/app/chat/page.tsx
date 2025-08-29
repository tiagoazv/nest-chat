'use client';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import ChatHeader from '@components/ChatHeader';
import MessageList from '@components/MessageList';
import MessageInput from '@components/MessageInput';
import api from '@services/api';

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [unreadUserIds, setUnreadUserIds] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: string }>({});

  // Inicializa socket
  useEffect(() => {
    if (!userId || socket) return;

    const s = io('http://localhost:5000');
    s.emit('register', userId);
    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [userId]);

  // Carrega dados do usuário e lista de usuários
  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');

    if (!token) return;
    if (id) setUserId(id);
    if (name) setUserName(name);
    if (email) setUserEmail(email);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Erro ao buscar usuários:', err));
  }, []);

  // Busca mensagens ao trocar usuário selecionado
  useEffect(() => {
    if (!selectedUser) return;

    api.get(`/messages/${selectedUser._id}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Erro ao buscar mensagens:', err));
  }, [selectedUser]);

  // Busca últimas mensagens após carregar usuários
  useEffect(() => {
    if (!userId || users.length === 0) return;

    const fetchLastMessages = async () => {
      try {
        const results = await Promise.all(
          users.map(async (user) => {
            const res = await api.get(`/messages/last/${user._id}`);
            return { userId: user._id, content: res.data?.content || '' };
          })
        );

        const map: Record<string, string> = {};
        results.forEach(({ userId, content }) => {
          map[userId] = content;
        });

        setLastMessages(map);
      } catch (err) {
        console.error('Erro ao buscar últimas mensagens:', err);
      }
    };

    fetchLastMessages();
  }, [users, userId]);

  // Recebe mensagens por socket
  useEffect(() => {
    if (!socket || !userId) return;

    const handler = (msg: any) => {
      const otherId = msg.from === userId ? msg.to : msg.from;

      // Atualiza última mensagem
      setLastMessages(prev => ({
        ...prev,
        [otherId]: msg.content,
      }));

      // Adiciona à conversa atual ou sinaliza como não lida
      if (
        (msg.from === selectedUser?._id && msg.to === userId) ||
        (msg.from === userId && msg.to === selectedUser?._id)
      ) {
        setMessages(prev => [...prev, msg]);
      } else if (msg.to === userId) {
        setUnreadUserIds(prev => prev.includes(msg.from) ? prev : [...prev, msg.from]);
      }
    };

    const statusHandler = (ids: string[]) => setOnlineUserIds(ids);

    socket.on('receiveMessage', handler);
    socket.on('updateOnlineUsers', statusHandler);

    return () => {
      socket.off('receiveMessage', handler);
      socket.off('updateOnlineUsers', statusHandler);
    };
  }, [socket, selectedUser, userId]);

  const handleSend = (content: string) => {
    if (!content.trim() || !socket || !selectedUser || !userId) return;

    const msg = { from: userId, to: selectedUser._id, content };
    socket.emit('sendMessage', msg);
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setUnreadUserIds(prev => prev.filter(id => id !== user._id));
  };

  return (
   <div className="h-screen w-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/background.jpg)' }}>
      <div className="w-[70%] h-[90%] flex flex-col rounded-2xl shadow-lg overflow-hidden bg-white">
        <Header userName={userName} userEmail={userEmail} />
        <div className="flex flex-1 min-h-0">
          <Sidebar
            users={users}
            selectedUserId={selectedUser?._id || null}
            onSelect={handleSelectUser}
            socket={socket}
            onlineUserIds={onlineUserIds}
            unreadUserIds={unreadUserIds}
            lastMessages={lastMessages}
          />
          <div className="flex flex-col flex-1">
            {selectedUser && (
              <ChatHeader
                name={selectedUser.name}
                online={onlineUserIds.includes(selectedUser._id)}
              />
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-100">
              <MessageList messages={messages} currentUserId={userId || ''} />
            </div>

            {selectedUser && <MessageInput onSend={handleSend} />}
          </div>
        </div>
      </div>
    </div>
  );
}
