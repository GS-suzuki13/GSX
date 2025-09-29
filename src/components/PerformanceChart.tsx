import React from 'react';

interface ChartData {
  month: string;
  value: number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
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

          {/* Chart area */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F0C040" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F0C040" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <polygon
            fill="url(#gradient)"
            points={
              `50,250 ${data
                .map((point, index) => {
                  const x = 50 + (index / (data.length - 1)) * 700;
                  const y = 250 - ((point.value - minValue) / range) * 200;
                  return `${x},${y}`;
                })
                .join(' ')} 750,250`
            }
          />

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
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, index) => (
            <text
              key={index}
              x={50 + (index / (data.length - 1)) * 700}
              y={275}
              textAnchor="middle"
              className="text-sm fill-gray-600"
            >
              {point.month}
            </text>
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const value = minValue + (range * i) / 4;
            return (
              <text
                key={i}
                x={40}
                y={255 - (i * 50)}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {(value / 1000000).toFixed(1)}M
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default PerformanceChart;