import React from 'react';
import { Link } from 'react-router-dom';
import DonationSection from './DonationSection';
import { ChevronRight } from 'lucide-react';

interface VideoToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  toolPath: string;
  toolName: string;
}

const VideoToolLayout: React.FC<VideoToolLayoutProps> = ({
  children,
  title,
  description,
  toolPath,
  toolName,
}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb navigation */}
      <nav className="mb-6 flex items-center text-sm text-gray-600 dark:text-gray-400">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
        <ChevronRight className="mx-1 h-4 w-4" />
        <Link to="/tools/video" className="hover:text-blue-600 dark:hover:text-blue-400">Video Tools</Link>
        <ChevronRight className="mx-1 h-4 w-4" />
        <span className="text-gray-900 dark:text-white">{toolName}</span>
      </nav>

      {/* Other tools in this category */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
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
                to="/tools/video-to-gif" 
                className={`block px-3 py-2 rounded-md ${toolPath === 'video-to-gif' ? 
                  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                  'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                Video to GIF
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
          
          {/* Ad space (300x250) */}
          <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400 w-[300px] h-[250px] flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
              Ad Space (300x250)
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
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
            <div className="p-4 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400 w-[728px] h-[90px] max-w-full flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                Ad Space (728x90)
              </div>
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
  );
};

export default VideoToolLayout; 