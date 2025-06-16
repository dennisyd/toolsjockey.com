import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Scissors, 
  Archive, 
  Image, 
  Camera, 
  Merge, 
  Volume2,
  Menu,
  X,
  Home
} from 'lucide-react';
import PrivacyBadge from './PrivacyBadge';

interface LayoutProps {
  children: React.ReactNode;
}

const videoTools = [
  { name: 'Video Clipper', path: '/tools/video-clipper', icon: Scissors, description: 'Trim and cut videos' },
  { name: 'Video Compressor', path: '/tools/video-compressor', icon: Archive, description: 'Reduce file sizes' },
  { name: 'Video to GIF', path: '/tools/video-to-gif', icon: Image, description: 'Create animated GIFs' },
  { name: 'Frame Extractor', path: '/tools/frame-extractor', icon: Camera, description: 'Extract still images' },
  { name: 'Video Merger', path: '/tools/video-merger', icon: Merge, description: 'Combine multiple videos' },
  { name: 'Audio Extractor', path: '/tools/audio-extractor', icon: Volume2, description: 'Extract audio tracks' }
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState('');

  // Update current tool based on location
  useEffect(() => {
    const path = location.pathname;
    const tool = videoTools.find(t => t.path === path);
    setCurrentTool(tool?.name || 'Video Tools');
  }, [location]);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">ToolsJockey</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                <Link 
                  to="/"
                  className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <span className="text-gray-900 dark:text-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                  {currentTool}
                </span>
              </nav>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Privacy Badge */}
            <div className="hidden md:flex md:items-center">
              <PrivacyBadge />
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Home
              </Link>
              {videoTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === tool.path
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <tool.icon className="mr-3 h-5 w-5" />
                    {tool.name}
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <PrivacyBadge />
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="w-64 flex flex-col">
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <Link to="/" className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
                    <Home className="mr-2 h-6 w-6" />
                    Home
                  </Link>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {videoTools.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        location.pathname === tool.path
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tool.icon className="mr-3 h-5 w-5" />
                      <span className="flex-1">{tool.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 hidden group-hover:block">
                        {tool.description}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} ToolsJockey. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Terms of Service
              </a>
              <a href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                About
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 