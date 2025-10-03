import React, { useState, useEffect } from 'react';

const StockTicker: React.FC = () => {
  const [stocks] = useState([
    { symbol: 'PETR4', price: 38.42, change: +1.24 },
    { symbol: 'VALE3', price: 65.87, change: -0.89 },
    { symbol: 'ITUB4', price: 32.15, change: +0.55 },
    { symbol: 'BBDC4', price: 15.78, change: +0.32 },
    { symbol: 'ABEV3', price: 11.45, change: -0.15 },
    { symbol: 'WEGE3', price: 42.33, change: +1.87 },
    { symbol: 'MGLU3', price: 8.92, change: -0.23 },
    { symbol: 'GGBR4', price: 21.56, change: +0.78 }
  ]);

  useEffect(() => {
    // Simulate real-time price updates
    const interval = setInterval(() => {
      // In a real app, this would fetch live data
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary text-white py-2 overflow-hidden mt-16">
      <div className="animate-marquee whitespace-nowrap flex">
        {[...stocks, ...stocks].map((stock, index) => (
          <span key={index} className="mx-8 inline-flex items-center">
            <span className="font-semibold">{stock.symbol}</span>
            <span className="mx-2">R$ {stock.price.toFixed(2)}</span>
            <span className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;