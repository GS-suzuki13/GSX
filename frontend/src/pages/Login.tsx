import React, { useEffect, useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CSVHandler } from '../utils/csvHandler';
import StockTicker from '../components/StockTicker';
import logo from '../assets/logo.png';
import { LoggedUser } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');

    if (!storedUser) return;

    try {
      const user: LoggedUser = JSON.parse(storedUser);

      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      if (user.role === 'user') {
        navigate('/dashboard-cliente', { replace: true });
        return;
      }

      localStorage.removeItem('loggedUser');
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      localStorage.removeItem('loggedUser');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const username = formData.username.trim();

      const foundUser = await CSVHandler.authenticateUser(
        username,
        formData.password
      );

      if (!foundUser) {
        setError('Usuário ou senha inválidos');
        return;
      }

      const role: 'admin' | 'user' =
        foundUser.token === 'adm' ? 'admin' : 'user';

      const userData: LoggedUser = {
        id: foundUser.id,
        username: foundUser.user,
        name: foundUser.name,
        token: foundUser.token,
        role
      };

      localStorage.setItem('loggedUser', JSON.stringify(userData));

      navigate(
        role === 'admin' ? '/admin/dashboard' : '/dashboard-cliente',
        { replace: true }
      );
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      setError('Erro ao autenticar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <StockTicker />

      <div className="flex flex-1">
        <div className="hidden md:flex w-1/2 bg-black items-center justify-center">
          <img
            src={logo}
            alt="Logo GSX"
            className="w-48 opacity-90"
          />
        </div>

        <div className="w-full md:w-1/2 bg-[#f5f5f5] flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-md p-10 shadow-xl border border-gray-200">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                Acesso ao Sistema
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Entre com suas credenciais
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário
                </label>

                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />

                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                    placeholder="Digite seu usuário"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>

                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value
                      }))
                    }
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                    placeholder="Digite sua senha"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-black transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-gray-900 text-white py-3 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;