import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, positive, icon: Icon }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-md transition card-hover">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        {Icon && <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
      </div>
      <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{value}</p>
      {change && (
        <div className="flex items-center space-x-1">
          {positive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <p className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {change} vs hier
          </p>
        </div>
      )}
    </div>
  );
};

export default StatCard;