'use client';
import { FC, useEffect, useRef } from 'react';

interface Message {
  _id?: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const formatTime = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDay = (isoDate: string) => {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, yesterday)) return 'Ontem';

  return date.toLocaleDateString('pt-BR');
};

const MessageList: FC<MessageListProps> = ({ messages, currentUserId }) => {
  const grouped = messages.reduce((acc: Record<string, Message[]>, msg) => {
    const group = formatDay(msg.timestamp);
    if (!acc[group]) acc[group] = [];
    acc[group].push(msg);
    return acc;
  }, {});

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 bg-gray-100">
      {Object.entries(grouped).map(([day, msgs]) => (
        <div key={day}>
          <div className="text-center text-sm text-gray-500 my-2">{day}</div>
          <div className="flex flex-col space-y-2">
            {msgs.map((msg, idx) => {
              const isOwn = msg.from === currentUserId;
              return (
                <div
                  key={idx}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg shadow text-sm break-all whitespace-pre-wrap ${
                      isOwn ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
                    }`}
                    style={{ maxWidth: '75%' }}
                  >
                    <div className="min-w-[40px] text-base">{msg.content}</div>
                     <div className="text-right text-xs mt-1">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
