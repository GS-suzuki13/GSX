import React, { useState } from 'react';
import { Calculator, BarChart3, TrendingUp } from 'lucide-react';
import InvestmentChart from './InvestmentChart';

const SimulationSection: React.FC = () => {
  const [formData, setFormData] = useState({
    valorInvestido: 10000,
    periodo: 12,
    taxaRendimento: 1.2
  });

  const [results, setResults] = useState<any>(null);

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateProjection = () => {
    const { valorInvestido, periodo, taxaRendimento } = formData;
    const monthlyData = [];
    let currentValue = valorInvestido;

    for (let i = 0; i <= periodo; i++) {
      monthlyData.push({
        month: i,
        value: currentValue,
        profit: currentValue - valorInvestido
      });
      currentValue = currentValue * (1 + taxaRendimento / 100);
    }

    const finalValue = monthlyData[monthlyData.length - 1].value;
    const totalProfit = finalValue - valorInvestido;
    const profitPercentage = (totalProfit / valorInvestido) * 100;

    setResults({
      monthlyData,
      finalValue,
      totalProfit,
      profitPercentage
    });
  };

  React.useEffect(() => {
    calculateProjection();
  }, [formData]);

  return (
    <section id="simule" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Simule Agora
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Use nossa ferramenta de simulação para projetar o crescimento dos seus investimentos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Calculator className="w-8 h-8 text-secondary mr-3" />
              <h3 className="text-2xl font-semibold text-primary">Calculadora de Investimento</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Investido (R$)
                </label>
                <input
                  type="number"
                  value={formData.valorInvestido}
                  onChange={(e) => handleInputChange('valorInvestido', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  min="1000"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período (meses)
                </label>
                <input
                  type="number"
                  value={formData.periodo}
                  onChange={(e) => handleInputChange('periodo', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  min="1"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de Rendimento (% ao mês)
                </label>
                <input
                  type="number"
                  value={formData.taxaRendimento}
                  onChange={(e) => handleInputChange('taxaRendimento', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  min="0.1"
                  max="10"
                  step="0.1"
                />
              </div>

              {results && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-primary mb-4">Projeção de Resultados</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Valor Final</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {results.finalValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Lucro Total</p>
                      <p className="text-2xl font-bold text-secondary">
                        R$ {results.totalProfit.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Rentabilidade</p>
                    <p className="text-xl font-bold text-primary">
                      {results.profitPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <BarChart3 className="w-8 h-8 text-secondary mr-3" />
              <h3 className="text-2xl font-semibold text-primary">Projeção de Crescimento</h3>
            </div>
            
            {results && (
              <InvestmentChart data={results.monthlyData} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimulationSection;