import React from 'react';
import { Link } from 'react-router-dom';
import { toolsConfig } from '../../utils/toolsConfig';
import { useAnalytics } from '../../hooks/useAnalytics';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import DonationBanner from '../../components/layout/DonationBanner';
import TickerTape from '../../components/TickerTape';
import { PresentationChartBarIcon } from '@heroicons/react/24/outline';

const presentationTools = toolsConfig.filter(tool => tool.group === 'presentation');

const PresentationToolsPage: React.FC = () => {
  useAnalytics();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <TickerTape />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <PresentationChartBarIcon className="w-16 h-16 text-accent" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Presentation Tools</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional PowerPoint and PPTX processing tools. Convert, merge, split, and extract content from presentations - all client-side for complete privacy.
            </p>
          </div>

          {/* Features Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>100% Client-side Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>PPTX File Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>No Upload Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Instant Results</span>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentationTools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className="group block bg-white dark:bg-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                      {tool.icon && <tool.icon className="w-6 h-6 text-accent" />}
                    </div>
                    <h3 className="text-xl font-semibold ml-3 group-hover:text-accent transition-colors">
                      {tool.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {tool.description}
                  </p>
                  
                  {tool.badges && (
                    <div className="flex gap-1 mb-4">
                      {tool.badges.map(badge => (
                        <span
                          key={badge}
                          className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-accent font-medium group-hover:underline">
                    Open Tool →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">About Presentation Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-medium mb-2">Privacy & Security</h3>
                <p>All processing happens in your browser. Your presentation files never leave your device, ensuring complete privacy for sensitive corporate or personal content.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">PPTX Support</h3>
                <p>Full support for modern PowerPoint files (.pptx) including text extraction, image conversion, and metadata editing.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Professional Quality</h3>
                <p>High-quality conversions and extractions that maintain formatting, layout, and visual elements from your original presentations.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Batch Processing</h3>
                <p>Process multiple presentations at once with our batch tools for merging, splitting, and converting large numbers of files efficiently.</p>
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
        </div>
      </main>
      <DonationBanner />
      <Footer />
    </div>
  );
};

export default PresentationToolsPage; 