import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { CSVHandler } from '../utils/csvHandler';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // autentica usando o backend via CSVHandler
      const foundUser = await CSVHandler.authenticateUser(
        formData.username,
        formData.password
      );

      if (!foundUser) {
        setError('Usuário ou senha inválidos');
        setIsLoading(false);
        return;
      }

      // salva dados básicos do usuário logado
      localStorage.setItem('loggedUser', JSON.stringify(foundUser));

      // redireciona de acordo com token/role
      if (foundUser.token === 'user') {
        window.location.href = '/dashboard-cliente';
      } else if (foundUser.token === 'adm') {
        window.location.href = '/dashboard-admin';
      } else {
        setError('Token inválido para o usuário');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao autenticar usuário');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {/* Centralizando a logo */}
          <div className="flex justify-center mb-4">
            <img
              src="./logo.png"
              alt="Logo GSX"
              className="w-32 h-auto"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Acesso ao Sistema</h1>
          <p className="text-gray-600 mt-2">Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                placeholder="Digite seu usuário"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-secondary/50 text-primary font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
