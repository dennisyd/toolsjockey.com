import React from 'react';
import { toolsConfig } from '../../utils/toolsConfig';
import ToolCard from '../../components/shared/ToolCard';

const colorTools = toolsConfig.filter(tool => tool.group === 'color');

const ColorDesignToolsPage: React.FC = () => (
  <div className="container-app max-w-4xl mx-auto px-2 sm:px-4 py-10 sm:py-16">
    <h1 className="text-4xl font-bold mb-8 text-center text-accent flex items-center justify-center gap-2">
      <span role="img" aria-label="palette">🎨</span> Color & Design Tools
    </h1>
    <p className="text-lg text-center mb-8">
      Professional color and design tools for creating beautiful palettes, checking contrast, and generating gradients.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {colorTools.map(tool => (
        <ToolCard key={tool.id} {...tool} />
      ))}
    </div>
    <div className="flex justify-center mt-10">
      <a href="/" className="bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded transition-colors">
        ← Back to Home
      </a>
    </div>
  </div>
);

export default ColorDesignToolsPage;
