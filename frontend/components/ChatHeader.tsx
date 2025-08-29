'use client';
import { FC } from 'react';
import { FaUserCircle } from 'react-icons/fa';

interface ChatHeaderProps {
  name: string;
  online: boolean;
}

const ChatHeader: FC<ChatHeaderProps> = ({ name, online }) => {
  return (
    <div className="px-4 py-3 border-b border-l border-gray-100 bg-white flex justify-between items-center">
      <div className="flex items-center gap-3">
        <FaUserCircle size={40} />
        <div className="flex flex-col">
          <div className="font-semibold text-gray-800">{name}</div>
          <div className="text-sm text-gray-500">
            {online ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
