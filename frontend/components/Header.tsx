'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import { FiLogOut, FiShield, FiTrash2 } from 'react-icons/fi';
import Cookies from 'js-cookie';
import { BrokerClient } from 'app/chat/broker-client';
import api from '@services/api';

interface HeaderProps {
  userId: string | null;
  userName: string;
  userEmail: string;
  userRole: string | null;
  client: BrokerClient;
}

export default function Header({ userId, userName, userEmail, userRole, client }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      Cookies.remove('token');
      localStorage.clear();
      client.publish("chat.user.disconnect", { userId });
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  const handleUserDelete = async () => {
    try {
      await fetch('http://localhost:3001/user', { 
        method: 'DELETE',
        credentials: 'include'
      });
      handleLogout();

    } catch (error) {
      console.error('Erro ao deletar usuários:', error);
      alert('Erro ao deletar usuários. Veja o console para mais detalhes.');
    }
  }
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-gray-400 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">Mensagens</h1>

      <div className="relative" ref={dropdownRef}>
        <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 p-4 rounded-full hover:bg-gray-100 transition"
            >
            <div className="flex flex-col items-start leading-tight">
                
                <span className="text-gray-800 font-medium">{userName}</span>
                <span className="text-gray-600 text-xs">{userEmail}</span>
                {userRole === 'admin' && (<><FiShield /><span className="text-gray-600 text-xs">{userRole}</span></>)}
            </div>
            <FaUserCircle size={40} />
        </button>


        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
            {userRole === 'admin' && (
              <button
                onClick={handleUserDelete}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                <FiTrash2 size={16} />
                <span>Deletar Usuários</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              <FiLogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
