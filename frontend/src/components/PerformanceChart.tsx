import React, { useState } from 'react';

interface ChartData {
  month: string;
  value: number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    value: number;
    month: string;
  } | null>(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="w-full h-80 relative">
      {/* 🔹 Overflow hidden e padding extra na direita */}
      <div className="relative h-full bg-gray-50 rounded-lg p-4 overflow-hidden pr-12">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 300"
          className="overflow-visible"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="50"
              y1={50 + i * 50}
              x2="750"
              y2={50 + i * 50}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Area gradient */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F0C040" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F0C040" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Área preenchida */}
          <polygon
            fill="url(#gradient)"
            points={`50,250 ${data
              .map((point, index) => {
                const x = 50 + (index / (data.length - 1)) * 700;
                const y = 250 - ((point.value - minValue) / range) * 200;
                return `${x},${y}`;
              })
              .join(' ')} 750,250`}
          />

          {/* Linha do gráfico */}
          <polyline
            fill="none"
            stroke="#F0C040"
            strokeWidth="3"
            points={data
              .map((point, index) => {
                const x =
                  data.length === 1
                    ? 400
                    : 50 + (index / (data.length - 1)) * 700;
                const y = 250 - ((point.value - minValue) / range) * 200;
                return `${x},${y}`;
              })
              .join(" ")}
          />

          // Pontos com eventos
          {data.map((point, index) => {
            const x =
              data.length === 1
                ? 400
                : 50 + (index / (data.length - 1)) * 700;
            const y = 250 - ((point.value - minValue) / range) * 200;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill="#F0C040"
                stroke="#0A2540"
                strokeWidth="2"
                onMouseEnter={() =>
                  setHoveredPoint({ x, y, value: point.value, month: point.month })
                }
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* Labels eixo Y */}
          {[0, 1, 2, 3, 4].map((i) => {
            const value = minValue + (range * i) / 4;
            return (
              <text
                key={i}
                x={40}
                y={255 - i * 50}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default PerformanceChart;
