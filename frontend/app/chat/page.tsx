'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import ChatHeader from '@components/ChatHeader';
import MessageList from '@components/MessageList';
import MessageInput from '@components/MessageInput';
import api from '@services/api';
import { BrokerClient, createConnection } from "./broker-client";

export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [unreadUserIds, setUnreadUserIds] = useState<string[]>([]);
  const [lastMessages, setLastMessages] = useState<{ [key: string]: string }>({});
  const [client, setClient] = useState<BrokerClient | null>(null);

  interface Message {
    source: string;
    msg: string;
    ts: number;
  }

  // Carrega dados do usuário e lista de usuários
  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (!token) {
      router.replace('/login');
      return;
    }
    if (id) setUserId(id);
    if (name) setUserName(name);
    if (email) setUserEmail(email);
    if (role) setUserRole(role);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    api.get('/user')
      .then(res => setUsers(res.data))
      .catch(err => {
        // Token inválido/expirado: limpar storage e redirecionar
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        router.replace('/login');
      });
  }, [router]);

  useEffect(() => {
    async function init() {
      const client = await createConnection("frontend-app", userId!, "");
      setClient(client);

      // Escuta todas as mensagens enviadas para este usuário
      client.subscribe<{ from: string; to: string; content: string }>(
        `chat.user.${userId}`,
        (_, content) => {
          // Se a mensagem for da conversa atual
          const isCurrentChat =
                selectedUser &&
                ((content.from === selectedUser._id && content.to === userId) ||
                (content.from === userId && content.to === selectedUser._id));

              if (isCurrentChat) {
                setMessages((prev) => [...prev, content]);
              } else if (content.to === userId && content.from !== userId) {
                setUnreadUserIds((prev) =>
                  prev.includes(content.from) ? prev : [...prev, content.from],
                );
              }
        }
      );

        client.subscribe<{ users: string[] }>("chat.user.online", (_, data) => {
          setOnlineUserIds(data.users);
        });

        // publica conexão
        client.publish("chat.user.connect", { userId });

        const handleUnload = () => {
          client.publish("chat.user.disconnect", { userId });
        };
        window.addEventListener("beforeunload", handleUnload);

      return () => {
        handleUnload();
        window.removeEventListener("beforeunload", handleUnload);
      };
      }

    init();
  }, [userId, selectedUser]);

    
  // Busca mensagens ao trocar usuário selecionado
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      const res = await api.get(`/chat/messages/${selectedUser._id}`);
      console.log(res.data);
      setMessages(res.data);
    };
    fetchMessages().catch(err => console.error('Erro ao buscar mensagens:', err));
  }, [selectedUser]);

  // Busca últimas mensagens após carregar usuários
  useEffect(() => {
    if (!userId || users.length === 0) return;

    const fetchLastMessages = async () => {
      try {
        console.log("Fetching last messages")
        const myId = userId;
        const results = await Promise.all(
          users.map(async (user) => {
            const res = await api.get(`/chat/messages/last/${user._id}`);
            return { 
              userId: user._id, 
              content: res.data?.content || ''
            };
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
  }, [users, unreadUserIds, messages]);

  const handleSend = async (content: string) => {
    if (!content.trim() || !selectedUser || !userId) return;

    const msg = { from: userId, to: selectedUser._id, content, timestamp: Date.now() };
    setMessages((prev) => [...prev, msg]);
    const res = await api.post('/chat/messages', msg);

    return res.data;
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setUnreadUserIds(prev => prev.filter(id => id !== user._id));
  };

  return (
   <div className="h-screen w-screen bg-cover bg-center bg-no-repeat flex items-center justify-center">
      <div className="w-[70%] h-[90%] flex flex-col rounded-2xl shadow-lg overflow-hidden bg-white">
        {client && (
          <Header userName={userName} userId={userId} userEmail={userEmail} userRole={userRole} client={client} />
        )}
        <div className="flex flex-1 min-h-0">
          <Sidebar
            users={users}
            selectedUserId={selectedUser?._id || null}
            onSelect={handleSelectUser}
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
