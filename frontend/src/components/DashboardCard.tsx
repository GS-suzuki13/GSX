import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  change?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, change }) => {
  const colorClasses = {
    blue: 'bg-blue-100 hover:bg-blue-200',
    green: 'bg-emerald-100 hover:bg-emerald-200',
    yellow: 'bg-amber-100 hover:bg-amber-200',
    purple: 'bg-violet-100 hover:bg-violet-200',
    red: 'bg-rose-100 hover:bg-rose-200'
  };

  const isPositiveChange = change && change.startsWith('+');

  return (
    <div className={`${colorClasses[color]} p-6 rounded-2xl transition-colors duration-200 cursor-pointer`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        {change && (
          <div
            className={`flex items-center text-sm ${
              isPositiveChange ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default DashboardCard;
