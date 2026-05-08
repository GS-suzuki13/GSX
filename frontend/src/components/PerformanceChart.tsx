import React, { useMemo, useState } from 'react';

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

  const chart = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    const getX = (index: number) =>
      data.length === 1 ? 400 : 50 + (index / (data.length - 1)) * 700;

    const getY = (value: number) =>
      250 - ((value - minValue) / range) * 200;

    const linePoints = data
      .map((point, index) => `${getX(index)},${getY(point.value)}`)
      .join(' ');

    const areaPoints = `50,250 ${linePoints} 750,250`;

    const yLabels = [0, 1, 2, 3, 4].map((i) => {
      const value = minValue + (range * i) / 4;
      return {
        label: value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        y: 255 - i * 50
      };
    });

    const gridLines = [0, 1, 2, 3, 4].map((i) => 50 + i * 50);

    return {
      minValue,
      maxValue,
      range,
      getX,
      getY,
      linePoints,
      areaPoints,
      yLabels,
      gridLines
    };
  }, [data]);

  if (!chart || data.length === 0) return null;

  return (
    <div className="w-full h-80 relative">
      <div className="relative h-full bg-[#0b1120] rounded-2xl p-4 overflow-hidden border border-white/10">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 300"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {chart.gridLines.map((y, index) => (
            <line
              key={index}
              x1="50"
              y1={y}
              x2="750"
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}

          <polygon
            fill="url(#performanceGradient)"
            points={chart.areaPoints}
          />

          <polyline
            fill="none"
            stroke="#818cf8"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={chart.linePoints}
          />

          {data.map((point, index) => {
            const x = chart.getX(index);
            const y = chart.getY(point.value);

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill="#818cf8"
                stroke="#0b1120"
                strokeWidth="3"
                onMouseEnter={() =>
                  setHoveredPoint({
                    x,
                    y,
                    value: point.value,
                    month: point.month
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}

          {chart.yLabels.map((item, index) => (
            <text
              key={index}
              x={40}
              y={item.y}
              textAnchor="end"
              className="text-[10px] fill-gray-400"
            >
              {item.label}
            </text>
          ))}

          {data.map((point, index) => {
            const x = chart.getX(index);

            return (
              <text
                key={index}
                x={x}
                y={278}
                textAnchor="middle"
                className="text-[10px] fill-gray-500"
              >
                {point.month}
              </text>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute z-20 px-3 py-2 rounded-xl bg-[#111827] border border-white/10 shadow-2xl text-xs text-white pointer-events-none"
            style={{
              left: `${(hoveredPoint.x / 800) * 100}%`,
              top: `${(hoveredPoint.y / 300) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <p className="text-gray-400 mb-1">{hoveredPoint.month}</p>
            <p className="font-semibold text-emerald-400">
              {hoveredPoint.value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceChart;