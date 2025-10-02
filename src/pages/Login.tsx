import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Cliente'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);

    // Redirect based on role
    if (formData.role === 'Cliente') {
      window.location.href = '/dashboard-cliente';
    } else {
      window.location.href = '/dashboard-admin';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-primary mb-2">GSX</div>
          <h1 className="text-2xl font-semibold text-gray-800">Acesso ao Sistema</h1>
          <p className="text-gray-600 mt-2">Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Usuário
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="Cliente">Cliente</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

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
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
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
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-accent hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;