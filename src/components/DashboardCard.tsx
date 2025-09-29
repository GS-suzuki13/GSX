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
    blue: 'bg-blue-50 hover:bg-blue-100',
    green: 'bg-green-50 hover:bg-green-100',
    yellow: 'bg-yellow-50 hover:bg-yellow-100',
    purple: 'bg-purple-50 hover:bg-purple-100',
    red: 'bg-red-50 hover:bg-red-100'
  };

  const isPositiveChange = change && change.startsWith('+');

  return (
    <div className={`${colorClasses[color]} p-6 rounded-2xl transition-colors duration-200 cursor-pointer`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        {change && (
          <div className={`flex items-center text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
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