import React from 'react';
import ToolCard from '../../components/shared/ToolCard';
import { toolsConfig } from '../../utils/toolsConfig';

const WordToolsPage: React.FC = () => {
  const wordTools = toolsConfig.filter(tool => tool.group === 'word');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Word & Document Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional tools for working with Word documents, document conversion, and document processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wordTools.map((tool) => (
            <ToolCard
              key={tool.path}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              path={tool.path}
            />
          ))}
        </div>

        {wordTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No Word tools available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordToolsPage; 