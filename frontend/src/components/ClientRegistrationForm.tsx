import React, { useState } from 'react';
import { User, Mail, CreditCard, DollarSign, UserCheck } from 'lucide-react';
import { User as UserType } from '../types';
import { CSVHandler } from '../utils/csvHandler';

interface ClientRegistrationFormProps {
  onClientRegistered: (user: UserType) => void;
}

export default function ClientRegistrationForm({ onClientRegistered }: ClientRegistrationFormProps) {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    email: '',
    valorAportado: '',
    tipoUsuario: 'user' as 'user' | 'adm',
    percentualContrato: ''
  });

  const [displayValor, setDisplayValor] = useState(''); // <-- valor formatado para o input
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const generateUsername = (nome: string): string => {
    const partes = nome.trim().toLowerCase().split(/\s+/);
    if (partes.length === 1) return partes[0];
    return `${partes[0]}.${partes[partes.length - 1]}`;
  };

  const generatePassword = (cpf: string): string => cpf.replace(/\D/g, "").substring(0, 6);

  const formatCPF = (value: string) => {
    const cpfNumbers = value.replace(/\D/g, "");
    return cpfNumbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;

    return true;
  };

  const handleValorAportadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ""); // remove tudo que não é número
    const numberValue = parseFloat(raw) / 100;

    if (isNaN(numberValue)) {
      setDisplayValor("");
      setFormData(prev => ({ ...prev, valorAportado: "" }));
      return;
    }

    const formatted = numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    setDisplayValor(formatted);
    setFormData(prev => ({ ...prev, valorAportado: numberValue.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateCPF(formData.cpf)) {
      alert("CPF inválido! Verifique e tente novamente.");
      setLoading(false);
      return;
    }

    try {
      const newUser: UserType = {
        id: crypto.randomUUID(),
        user: generateUsername(formData.nomeCompleto),
        password: generatePassword(formData.cpf),
        token: formData.tipoUsuario,
        name: formData.nomeCompleto,
        cpf: formData.cpf,
        email: formData.email,
        data_cadastro: new Date().toISOString().split('T')[0],
        valor_aportado: parseFloat(formData.valorAportado),
        percentual_contrato: parseFloat(formData.percentualContrato),
        data_modificacao: new Date().toISOString(),
      };

      const response = await CSVHandler.addUser(newUser);

      if (response?.success) {
        onClientRegistered(newUser);
        setSuccess(true);
        setFormData({
          nomeCompleto: '',
          cpf: '',
          email: '',
          valorAportado: '',
          tipoUsuario: 'user',
          percentualContrato: ''
        });
        setDisplayValor('');
      } else {
        console.error("[handleSubmit] Erro: backend não retornou sucesso");
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "cpf" ? formatCPF(value) : value
    }));
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente cadastrado com sucesso!</h2>
        <p className="text-gray-600 mb-6">
          O usuário {generateUsername(formData.nomeCompleto)} foi criado com a senha {generatePassword(formData.cpf)}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Cadastrar Novo Cliente</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Digite o nome completo"
                required
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                placeholder="000.000.000-00"
                required
                maxLength={14}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Digite o email"
                required
              />
            </div>
          </div>

          {/* Valor Aportado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor Aportado</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="valorAportado"
                value={displayValor}
                onChange={handleValorAportadoChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                placeholder="R$ 0,00"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          {/* Tipo de Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuário</label>
            <select
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="user">Cliente</option>
              <option value="adm">Administrador</option>
            </select>
          </div>

          {/* Percentual de Contrato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Percentual de Contrato</label>
            <input
              type="number"
              step="0.01"
              name="percentualContrato"
              value={formData.percentualContrato}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Ex: 2.75"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>Usuário será: <strong>{generateUsername(formData.nomeCompleto) || '[nome.sobrenome]'}</strong></p>
            <p>Senha será: <strong>{generatePassword(formData.cpf) || '[6 primeiros dígitos do CPF]'}</strong></p>
            <p>Contrato: <strong>{formData.percentualContrato}%</strong></p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
