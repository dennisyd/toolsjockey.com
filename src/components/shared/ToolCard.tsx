import React from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';

interface ToolCardProps {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  path,
  icon: Icon,
  isNew = false,
}) => {
  const { trackButtonClick } = useAnalytics();
  
  return (
    <Link
      to={path}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow"
      onClick={() => trackButtonClick(`tool_card_${title.toLowerCase().replace(/\s+/g, '_')}`, 'ToolCard')}
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          {title}
          {isNew && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
              NEW
            </span>
          )}
        </h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </Link>
  );
};

export default ToolCard; 