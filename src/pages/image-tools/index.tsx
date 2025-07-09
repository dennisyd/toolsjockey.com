import React from 'react';
import { Link } from 'react-router-dom';
import { toolsConfig } from '../../utils/toolsConfig';
import { useAnalytics } from '../../hooks/useAnalytics';
import ToolCard from '../../components/shared/ToolCard';

const ImageToolsPage: React.FC = () => {
  useAnalytics();

  const imageTools = toolsConfig.filter(tool => tool.group === 'image');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🖼️</span>
            <h1 className="text-4xl font-bold text-gray-900">Image Tools</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional image processing and editing tools for enhancing, converting, and optimizing your images.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageTools.map(tool => (
            <ToolCard 
              key={tool.id} 
              title={tool.title}
              description={tool.description}
              path={tool.path}
              icon={tool.icon}
              isNew={tool.badges?.includes('NEW')}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffe066] text-black font-semibold rounded-lg hover:bg-[#ffd633] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ImageToolsPage;
