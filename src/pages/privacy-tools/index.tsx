import React from 'react';
import { Link } from 'react-router-dom';
import { toolsConfig } from '../../utils/toolsConfig';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ShieldCheckIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const privacyTools = toolsConfig.filter(tool => tool.group === 'privacy');

const PrivacyToolsPage: React.FC = () => {
  useAnalytics();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with security emphasis */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShieldCheckIcon className="w-12 h-12 text-green-500" />
              <h1 className="text-4xl font-bold">Privacy Tools</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Client-side encryption and security tools for maximum privacy
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <LockClosedIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    🔒 100% Client-Side Processing
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    All processing happens in your browser. Your files and data never leave your device, 
                    ensuring complete privacy and security. No server communication required.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Security Best Practices
                </h3>
                <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                  <li>• Use strong, unique passwords for encryption</li>
                  <li>• Keep your encryption keys safe and secure</li>
                  <li>• Regularly backup important encrypted files</li>
                  <li>• Clear browser cache after sensitive operations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {privacyTools.map(tool => (
              <Link
                key={tool.id}
                to={tool.path}
                className="block bg-white dark:bg-primary-light rounded-lg shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105 group"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {tool.icon && <tool.icon className="w-8 h-8 text-green-600 dark:text-green-400" />}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {tool.title}
                      </h3>
                      {tool.badges && (
                        <div className="flex gap-1 mt-1">
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
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <LockClosedIcon className="w-4 h-4" />
                    <span>Client-side processing</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Additional Security Info */}
          <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Client-Side Privacy Matters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                  🔐 Zero Data Exposure
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your files are processed entirely in your browser. No data is sent to servers, 
                  eliminating the risk of interception or unauthorized access.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                  🛡️ Military-Grade Encryption
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Uses AES-256 encryption and Web Crypto API for industry-standard security. 
                  Your encryption keys never leave your device.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                  ⚡ Instant Processing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  No upload delays or server dependencies. All operations happen instantly 
                  in your browser for maximum speed and reliability.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                  🌐 Works Offline
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Once loaded, these tools work without internet connection. 
                  Perfect for sensitive operations in any environment.
                </p>
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
    </div>
  );
};

export default PrivacyToolsPage; 