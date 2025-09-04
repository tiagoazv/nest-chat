'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye } from 'react-icons/fi';
import api from '@services/api';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) router.push('/chat');
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      Cookies.set('token', token, { expires: 7 });
      console.log('Login bem-sucedido:', { userId: user._id, userName: user.name, userEmail: user.email, token });
      router.push('/chat');
    } catch {
      setErro('Email ou senha inválidos');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: 'url(/background.jpg)' }}
    >
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-lg px-10 py-12 text-center relative">
        <h2 className="text-2xl font-bold text-gray-900">Acesse sua conta</h2>
        <p className="text-sm text-gray-500 mt-1 mb-8">Insira suas credenciais para fazer login</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuário@provedor.com"
                className="w-full pl-10 pr-4 py-2 rounded-md border"
                style={{
                    borderColor: '#AC245B',
                    outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px #AC245B')}
                onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
                required
                />

          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full pl-10 pr-10 py-2 rounded-md border"
                style={{
                    borderColor: '#AC245B',
                    outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px #AC245B')}
                onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
                required
            />

            <FiEye
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#AC245B] text-white py-2 rounded-full font-semibold hover:brightness-110 transition flex items-center justify-center gap-2"
          >
            Acessar <span className="text-lg">→</span>
          </button>
        </form>

        {erro && <p className="text-red-600 text-sm mt-4">{erro}</p>}

         <p className="text-center text-sm mt-4">
            <Link
                href="/register"
                className="text-[#AC245B] font-semibold hover:underline"
            >
                Criar uma nova conta
            </Link>
            </p>
      </div>
    </div>
  );
}
