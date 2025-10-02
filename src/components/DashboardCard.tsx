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
    blue: 'bg-blue-50 hover:bg-blue-100 border border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 border border-green-200',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200',
    purple: 'bg-purple-50 hover:bg-purple-100 border border-purple-200',
    red: 'bg-red-50 hover:bg-red-100 border border-red-200'
  };

  const isPositiveChange = change && change.startsWith('+');

  return (
    <div className={`${colorClasses[color]} p-6 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        {change && (
          <div className={`flex items-center text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveChange ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default DashboardCard;