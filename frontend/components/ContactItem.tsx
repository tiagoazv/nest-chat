'use client';
import { FC } from 'react';

interface ContactItemProps {
  user: any;
  selected: boolean;
  onClick: () => void;
  lastMessage?: string;
  isOnline?: boolean;
  hasUnread?: boolean;
}

const ContactItem: FC<ContactItemProps> = ({
  user,
  selected,
  onClick,
  lastMessage = '',
  isOnline = false,
  hasUnread = false
}) => {
  return (
    <div
      className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${selected ? 'bg-gray-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">{lastMessage || 'Nenhuma mensagem ainda'}</p>
        </div>
        <div className="text-right">
          {hasUnread && <span className="text-red-500 text-xs">●</span>}
          {isOnline && <span className="text-green-500 text-xs ml-1">●</span>}
        </div>
      </div>
    </div>
  );
};

export default ContactItem;
