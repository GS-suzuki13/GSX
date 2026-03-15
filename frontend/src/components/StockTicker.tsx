import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const StockTicker: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const symbols = [
          'PETR4',
          'VALE3',
          'ITUB4',
          'BBDC4',
          'ABEV3',
          'WEGE3',
          'MGLU3',
          'GGBR4'
        ];

        const allStocks: StockData[] = [];

        for (const symbol of symbols) {
          try {
            const response = await fetch(
              `https://brapi.dev/api/quote/${symbol}`,
              {
                headers: {
                  Authorization: 'Bearer x8PiMU9K1KKo8sm9G1CqEP'
                }
              }
            );

            if (!response.ok) continue;

            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const stock = data.results[0];

              allStocks.push({
                symbol: stock.symbol,
                price: stock.regularMarketPrice || 0,
                change: stock.regularMarketChange || 0,
                changePercent:
                  stock.regularMarketChangePercent || 0
              });
            }
          } catch (err) {
            console.warn(`Erro ao buscar ${symbol}`);
          }
        }

        if (allStocks.length > 0) {
          setStocks(allStocks);
          setError(null);
        } else {
          setError('Sem dados');
        }
      } catch (error) {
        console.error('Erro geral:', error);
        setError('Erro ao carregar');
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white py-2 overflow-hidden border-b border-white/10">
      <div className="animate-marquee whitespace-nowrap flex text-sm font-medium tracking-wide">
        {[...stocks, ...stocks].map((stock, index) => (
          <span
            key={`${stock.symbol}-${index}`}
            className="mx-8 inline-flex items-center space-x-2"
          >
            <span className="text-white font-semibold">
              {stock.symbol}
            </span>

            <span className="text-white/80">
              R$ {stock.price.toFixed(2)}
            </span>

            <span
              className={`flex items-center ${
                stock.change >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {stock.change >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}

              <span className="ml-1">
                {stock.changePercent.toFixed(2)}%
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;
