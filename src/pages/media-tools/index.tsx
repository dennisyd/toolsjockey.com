import React from 'react';
import { Link } from 'react-router-dom';
import { toolsConfig } from '../../utils/toolsConfig';
import { useAnalytics } from '../../hooks/useAnalytics';
import ToolCard from '../../components/shared/ToolCard';

const MediaToolsPage: React.FC = () => {
  useAnalytics();

  const mediaTools = toolsConfig.filter(tool => tool.group === 'media');
  
  const audioTools = mediaTools.filter(tool => 
    tool.id.includes('audio') || 
    tool.id === 'volume-normalizer' || 
    tool.id === 'silent-audio-generator'
  );
  
  const videoTools = mediaTools.filter(tool => 
    tool.id.includes('video') || 
    tool.id === 'frame-extractor' || 
    tool.id === 'audio-extractor'
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🎬</span>
            <h1 className="text-4xl font-bold text-gray-900">Media Tools</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional audio and video processing tools. Edit, convert, compress, and enhance your media files with our comprehensive suite of client-side utilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Private</h3>
            <p className="text-gray-600 text-sm">All processing happens in your browser. Your media files never leave your device.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Processing</h3>
            <p className="text-gray-600 text-sm">Advanced Web Audio API and FFmpeg for lightning-fast media processing and real-time previews.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🎛️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Quality</h3>
            <p className="text-gray-600 text-sm">High-quality media processing with support for multiple formats and advanced controls.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Audio Tools Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🎵</span>
              <h2 className="text-2xl font-semibold text-gray-900">Audio Processing Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audioTools.map(tool => (
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
          </div>

          {/* Video Tools Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🎬</span>
              <h2 className="text-2xl font-semibold text-gray-900">Video Processing Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoTools.map(tool => (
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
          </div>
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

export default MediaToolsPage; 