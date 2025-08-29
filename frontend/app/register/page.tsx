'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@services/api';
import Link from 'next/link';
import { FiMail, FiLock, FiUser, FiEye } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [erro, setErro] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');

    if (password !== confirmPassword) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      await api.post('/auth/register', { name, email, password });
      router.push('/login');
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao cadastrar usuário');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: 'url(/background.jpg)' }}
    >
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-lg px-10 py-12 text-center relative">
        <h2 className="text-2xl font-bold text-gray-900">Crie sua conta</h2>
        <p className="text-sm text-gray-500 mt-1 mb-8">Preencha os campos para se cadastrar</p>

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          {/* Nome */}
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full pl-10 pr-4 py-2 rounded-md border"
              style={{ borderColor: '#AC245B', outline: 'none' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px #AC245B')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@provedor.com"
              className="w-full pl-10 pr-4 py-2 rounded-md border"
              style={{ borderColor: '#AC245B', outline: 'none' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px #AC245B')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              required
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full pl-10 pr-10 py-2 rounded-md border"
              style={{ borderColor: '#AC245B', outline: 'none' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px #AC245B')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              required
            />
            <FiEye
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            />
          </div>

          {/* Confirmar senha */}
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar senha"
              className="w-full pl-10 pr-4 py-2 rounded-md border"
              style={{ borderColor: '#AC245B', outline: 'none' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px #AC245B')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#AC245B] text-white py-2 rounded-full font-semibold hover:brightness-110 transition flex items-center justify-center gap-2"
          >
            Cadastrar <span className="text-lg">→</span>
          </button>
        </form>

        {erro && <p className="text-red-600 text-sm mt-4">{erro}</p>}

        <p className="text-center text-sm mt-4">
          <Link href="/login" className="text-[#AC245B] font-semibold hover:underline">
            Já possui uma conta?
          </Link>
        </p>
      </div>
    </div>
  );
}
