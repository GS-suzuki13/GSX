import React, { useState } from 'react';
import { User, Mail, CreditCard, DollarSign, UserCheck, Shield, KeyRound } from 'lucide-react';
import { User as UserType } from '../types';
import { CSVHandler } from '../utils/csvHandler';

interface ClientRegistrationFormProps {
  onClientRegistered: (user: UserType) => void;
}

export default function ClientRegistrationForm({
  onClientRegistered
}: ClientRegistrationFormProps) {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    email: '',
    valorAportado: '',
    tipoUsuario: 'user' as 'user' | 'adm',
    percentualContrato: ''
  });

  const [displayValor, setDisplayValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ username: string; password: string } | null>(null);

  const generateUsername = (nome: string): string => {
    const partes = nome.trim().toLowerCase().split(/\s+/);
    if (!partes[0]) return '';
    if (partes.length === 1) return partes[0];
    return `${partes[0]}.${partes[partes.length - 1]}`;
  };

  const generatePassword = (cpf: string): string =>
    cpf.replace(/\D/g, '').substring(0, 6);

  const formatCPF = (value: string) => {
    const cpfNumbers = value.replace(/\D/g, '');
    return cpfNumbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
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
    const raw = e.target.value.replace(/\D/g, '');
    const numberValue = parseFloat(raw) / 100;

    if (isNaN(numberValue)) {
      setDisplayValor('');
      setFormData((prev) => ({ ...prev, valorAportado: '' }));
      return;
    }

    const formatted = numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    setDisplayValor(formatted);
    setFormData((prev) => ({ ...prev, valorAportado: numberValue.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateCPF(formData.cpf)) {
      alert('CPF inválido! Verifique e tente novamente.');
      setLoading(false);
      return;
    }

    try {
      const username = generateUsername(formData.nomeCompleto);
      const password = generatePassword(formData.cpf);

      const newUser: UserType = {
        id: crypto.randomUUID(),
        user: username,
        password,
        token: formData.tipoUsuario,
        name: formData.nomeCompleto,
        cpf: formData.cpf,
        email: formData.email,
        data_cadastro: new Date().toISOString().split('T')[0],
        valor_aportado: parseFloat(formData.valorAportado),
        percentual_contrato: parseFloat(formData.percentualContrato),
        data_modificacao: new Date().toISOString()
      };

      const response = await CSVHandler.addUser(newUser);

      if (response?.success) {
        setCreatedUser({ username, password });
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
        console.error('[handleSubmit] Erro: backend não retornou sucesso');
      }
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cpf' ? formatCPF(value) : value
    }));
  };

  if (success) {
    return (
      <div className="bg-[#111827] rounded-2xl shadow-xl border border-white/10 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Cliente cadastrado com sucesso!
        </h2>

        <p className="text-gray-400 mb-6">
          O novo acesso foi criado e já pode ser utilizado.
        </p>

        <div className="bg-[#0f172a] border border-white/5 rounded-xl p-5 text-left max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <User className="w-4 h-4" />
            <span>Usuário</span>
          </div>
          <p className="text-white font-semibold break-all">
            {createdUser?.username || '-'}
          </p>

          <div className="flex items-center gap-2 text-gray-400 text-sm pt-2">
            <KeyRound className="w-4 h-4" />
            <span>Senha inicial</span>
          </div>
          <p className="text-white font-semibold">
            {createdUser?.password || '-'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-2xl shadow-xl border border-white/10 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">
          Cadastrar Novo Cliente
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Preencha os dados para criar um novo acesso no sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Nome Completo">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Digite o nome completo"
                required
              />
            </div>
          </Field>

          <Field label="CPF">
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="000.000.000-00"
                required
                maxLength={14}
              />
            </div>
          </Field>

          <Field label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Digite o email"
                required
              />
            </div>
          </Field>

          <Field label="Valor Aportado">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="valorAportado"
                value={displayValor}
                onChange={handleValorAportadoChange}
                className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="R$ 0,00"
                inputMode="numeric"
                required
              />
            </div>
          </Field>

          <Field label="Tipo de Usuário">
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                name="tipoUsuario"
                value={formData.tipoUsuario}
                onChange={handleChange}
                className="w-full appearance-none bg-[#0f172a] border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="user">Cliente</option>
                <option value="adm">Administrador</option>
              </select>
            </div>
          </Field>

          <Field label="Percentual de Contrato">
            <input
              type="number"
              step="0.01"
              name="percentualContrato"
              value={formData.percentualContrato}
              onChange={handleChange}
              className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: 2.75"
              required
            />
          </Field>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4 text-sm space-y-2">
            <p className="text-gray-400">
              Usuário será:{' '}
              <strong className="text-white">
                {generateUsername(formData.nomeCompleto) || '[nome.sobrenome]'}
              </strong>
            </p>
            <p className="text-gray-400">
              Senha será:{' '}
              <strong className="text-white">
                {generatePassword(formData.cpf) || '[6 primeiros dígitos do CPF]'}
              </strong>
            </p>
            <p className="text-gray-400">
              Contrato:{' '}
              <strong className="text-white">
                {formData.percentualContrato || '0'}%
              </strong>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}