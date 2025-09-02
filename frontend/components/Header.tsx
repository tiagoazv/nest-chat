'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import Cookies from 'js-cookie';

interface HeaderProps {
  userName: string;
  userEmail: string;
}

export default function Header({ userName, userEmail }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      Cookies.remove('token');
      localStorage.clear();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

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
            </div>
            <FaUserCircle size={40} />
        </button>


        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
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
