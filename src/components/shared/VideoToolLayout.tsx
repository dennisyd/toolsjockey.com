import React from 'react';
import { Link } from 'react-router-dom';
import DonationSection from './DonationSection';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import AdSlot from '../ads/AdSlot';

interface VideoToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  toolPath: string;
}

const VideoToolLayout: React.FC<VideoToolLayoutProps> = ({
  children,
  title,
  description,
  toolPath,
}) => {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {/* Ad space */}
            <AdSlot slot="sidebar" className="mb-6" />
            
            {/* Other tools in this category */}
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Other tools in this category
              </h2>
              <div className="space-y-2">
                <Link 
                  to="/tools/video-converter" 
                  className={`block px-3 py-2 rounded-md ${toolPath === 'video-converter' ? 
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                    'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Video Converter
                </Link>
                <Link 
                  to="/tools/video-compressor" 
                  className={`block px-3 py-2 rounded-md ${toolPath === 'video-compressor' ? 
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                    'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Video Compressor
                </Link>
                <Link 
                  to="/tools/video-merger" 
                  className={`block px-3 py-2 rounded-md ${toolPath === 'video-merger' ? 
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                    'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Video Merger
                </Link>
                <Link 
                  to="/tools/video-clipper" 
                  className={`block px-3 py-2 rounded-md ${toolPath === 'video-clipper' ? 
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                    'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Video Clipper
                </Link>
                <Link 
                  to="/tools/frame-extractor" 
                  className={`block px-3 py-2 rounded-md ${toolPath === 'frame-extractor' ? 
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                    'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Frame Extractor
                </Link>
                <Link 
                  to="/tools/audio-extractor" 
                  className={`block px-3 py-2 rounded-md ${toolPath === 'audio-extractor' ? 
                    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                    'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Audio Extractor
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            {/* Main content */}
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg">
              {/* Title section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                {description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
                )}
              </div>

              {/* Ad space (728x90) */}
              <div className="p-4">
                <AdSlot slot="header" />
              </div>

              {/* Tool content */}
              <div className="p-6">
                {children}
              </div>
            </div>

            {/* Donation section */}
            <div className="mt-8">
              <DonationSection />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VideoToolLayout; 