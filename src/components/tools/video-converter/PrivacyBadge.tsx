import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyBadge: React.FC = () => {
  return (
    <div className="flex items-center mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
      <div className="mr-3">
        <Shield className="h-7 w-7 text-blue-500" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
          🔒 100% Local Processing - Your Data Never Leaves Your Device
        </h3>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          All video conversion happens entirely within your browser. 
          No uploads to servers, no privacy concerns, and compliant with GDPR/HIPAA.
        </p>
      </div>
    </div>
  );
};

export default PrivacyBadge; 