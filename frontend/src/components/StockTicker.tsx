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
        const symbols = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'MGLU3', 'GGBR4'];
        const allStocks: StockData[] = [];

        for (const symbol of symbols) {
          try {
            const response = await fetch(`https://brapi.dev/api/quote/${symbol}`, {
              headers: {
                'Authorization': 'Bearer x8PiMU9K1KKo8sm9G1CqEP'
              }
            });

            if (!response.ok) {
              console.warn(`Failed to fetch ${symbol}: ${response.status}`);
              continue;
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const stock = data.results[0];
              allStocks.push({
                symbol: stock.symbol,
                price: stock.regularMarketPrice || 0,
                change: stock.regularMarketChange || 0,
                changePercent: stock.regularMarketChangePercent || 0,
              });
            }
          } catch (err) {
            console.warn(`Error fetching ${symbol}:`, err);
          }
        }

        if (allStocks.length > 0) {
          setStocks(allStocks);
          setError(null);
        } else {
          setError('Nenhum dado disponível');
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setError('Erro ao carregar cotações');
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary text-white py-2 overflow-hidden mt-16">
      <div className="animate-marquee whitespace-nowrap flex">
        {[...stocks, ...stocks].map((stock, index) => (
          <span key={`${stock.symbol}-${index}`} className="mx-8 inline-flex items-center">
            <span className="font-bold text-secondary">{stock.symbol}</span>
            <span className="mx-2">R$ {stock.price.toFixed(2)}</span>
            <span className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stock.change >= 0 ? (
                <TrendingUp size={14} className="inline mr-2" />
              ) : (
                <TrendingDown size={14} className="inline mr-2" />
              )}
              {stock.changePercent.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;
