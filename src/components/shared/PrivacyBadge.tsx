import React from 'react';
import { Lock } from 'lucide-react';

interface PrivacyBadgeProps {
  className?: string;
}

const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm ${className}`}>
      <Lock className="w-4 h-4 mr-1" />
      <span>100% Local Processing - Your Data Never Leaves Your Device</span>
    </div>
  );
};

export default PrivacyBadge; 