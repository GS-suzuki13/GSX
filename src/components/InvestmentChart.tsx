import React from 'react';

interface ChartData {
  month: number;
  value: number;
  profit: number;
}

interface InvestmentChartProps {
  data: ChartData[];
}

const InvestmentChart: React.FC<InvestmentChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="w-full h-80">
      <div className="relative h-full bg-gray-50 rounded-lg p-4">
        <svg width="100%" height="100%" viewBox="0 0 800 300" className="overflow-visible">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="50"
              y1={50 + (i * 50)}
              x2="750"
              y2={50 + (i * 50)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#F0C040"
            strokeWidth="3"
            points={data
              .map((point, index) => {
                const x = 50 + (index / (data.length - 1)) * 700;
                const y = 250 - ((point.value - minValue) / range) * 200;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = 50 + (index / (data.length - 1)) * 700;
            const y = 250 - ((point.value - minValue) / range) * 200;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#F0C040"
                  stroke="#0A2540"
                  strokeWidth="2"
                />
                {index % Math.ceil(data.length / 6) === 0 && (
                  <text
                    x={x}
                    y={y - 15}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    R$ {(point.value / 1000).toFixed(0)}k
                  </text>
                )}
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, index) => {
            if (index % Math.ceil(data.length / 6) === 0) {
              const x = 50 + (index / (data.length - 1)) * 700;
              return (
                <text
                  key={index}
                  x={x}
                  y={275}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {point.month}m
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};

export default InvestmentChart;