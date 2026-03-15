import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { CSVHandler } from '../../utils/csvHandler';
import { ClientReturn } from '../../types';

interface ReportData {
  totalAportado: number;
  totalRendimento: number;
  crescimentoPercentual: number;
  melhorCliente: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportData>({
    totalAportado: 0,
    totalRendimento: 0,
    crescimentoPercentual: 0,
    melhorCliente: '—'
  });

  const generateReport = useCallback(async () => {
    setLoading(true);

    try {
      const users = await CSVHandler.getUsers();
      const clients = users.filter((u) => u.token !== 'adm');

      let totalAportado = 0;
      let totalRendimento = 0;
      let melhorCliente = '—';
      let maiorRendimento = 0;

      for (const client of clients) {
        totalAportado += client.valor_aportado || 0;

        const returns: ClientReturn[] = await CSVHandler.getClientReturns(client.user);

        const rendimentoCliente = returns.reduce(
          (acc, r) => acc + (r.rendimento || 0),
          0
        );

        totalRendimento += rendimentoCliente;

        if (rendimentoCliente > maiorRendimento) {
          maiorRendimento = rendimentoCliente;
          melhorCliente = client.name;
        }
      }

      const crescimentoPercentual =
        totalAportado > 0 ? (totalRendimento / totalAportado) * 100 : 0;

      setReport({
        totalAportado,
        totalRendimento,
        crescimentoPercentual,
        melhorCliente
      });
    } catch (error) {
      alert('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Relatórios Financeiros
        </h2>
        <p className="text-gray-400 text-sm">
          Visão geral consolidada do desempenho da carteira
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400">Gerando relatório...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-indigo-500" size={22} />
            </div>
            <p className="text-gray-400 text-sm">Total Aportado</p>
            <p className="text-xl font-semibold text-white mt-2">
              {formatCurrency(report.totalAportado)}
            </p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-emerald-500" size={22} />
            </div>
            <p className="text-gray-400 text-sm">Total Rendimento</p>
            <p className="text-xl font-semibold text-white mt-2">
              {formatCurrency(report.totalRendimento)}
            </p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-green-500" size={22} />
            </div>
            <p className="text-gray-400 text-sm">Crescimento Total</p>
            <p className="text-xl font-semibold text-white mt-2">
              {report.crescimentoPercentual.toFixed(2)}%
            </p>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-yellow-500" size={22} />
            </div>
            <p className="text-gray-400 text-sm">Melhor Performance</p>
            <p className="text-xl font-semibold text-white mt-2">
              {report.melhorCliente}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}