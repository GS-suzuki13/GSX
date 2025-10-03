import React from 'react';

interface PieData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#0A2540', '#F0C040', '#6B7280', '#059669'];
  
  let cumulativePercentage = 0;
  const slices = data.map((item, index) => {
    const percentage = item.value / total;
    const startAngle = cumulativePercentage * 2 * Math.PI;
    const endAngle = (cumulativePercentage + percentage) * 2 * Math.PI;
    
    const x1 = Math.cos(startAngle);
    const y1 = Math.sin(startAngle);
    const x2 = Math.cos(endAngle);
    const y2 = Math.sin(endAngle);
    
    const largeArc = percentage > 0.5 ? 1 : 0;
    
    cumulativePercentage += percentage;
    
    return {
      ...item,
      path: `M 0,0 L ${x1},${y1} A 1,1 0 ${largeArc},1 ${x2},${y2} Z`,
      color: colors[index % colors.length],
      percentage: percentage * 100
    };
  });

  return (
    <div className="flex items-center justify-center space-x-8">
      {/* Gráfico */}
      <div className="w-64 h-64">
        <svg
          width="256"
          height="256"
          viewBox="-1.2 -1.2 2.4 2.4"
          className="transform -rotate-90"
        >
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="#fff"
              strokeWidth="0.02"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>
      </div>

      {/* Legenda */}
      <div className="flex flex-col">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center mb-2">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-gray-700">
              {slice.name} ({slice.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
