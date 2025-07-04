import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../hooks/useAnalytics';

const NotFound: React.FC = () => {
  const { trackButtonClick, trackEngagement } = useAnalytics();
  
  React.useEffect(() => {
    trackEngagement('404_page_view', 1, { url: window.location.pathname });
  }, [trackEngagement]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | ToolsJockey</title>
        <meta name="description" content="The page you were looking for could not be found." />
      </Helmet>
      
      <Header />
      
      <div className="container mx-auto px-4 py-16 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
          <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            The page you were looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link 
              to="/" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={() => trackButtonClick('404_to_home', 'NotFound')}
            >
              Back to Home
            </Link>
            <Link 
              to="/tools" 
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={() => trackButtonClick('404_to_tools', 'NotFound')}
            >
              Browse All Tools
            </Link>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Popular Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Link 
                to="/tools/pdf-merger" 
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                PDF Merger
              </Link>
              <Link 
                to="/tools/video-converter" 
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Video Converter
              </Link>
              <Link 
                to="/tools/image-compressor" 
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Image Compressor
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default NotFound; 