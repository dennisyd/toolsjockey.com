import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const PresentationToolsPage: React.FC = () => {
  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Presentation Tools</h1>
        <p className="text-gray-600 dark:text-gray-300">
          No presentation tools are currently available.
        </p>
      </div>
      
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-8 text-center">
        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Presentation tools are under development. Check back later for PowerPoint and presentation-related utilities.
        </p>
      </div>
    </div>
  );
};

export default PresentationToolsPage; 