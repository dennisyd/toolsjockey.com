import React from 'react';
import { Link } from 'react-router-dom';
import { Archive, FileArchive, FolderOpen, Compass, Eye, RefreshCw, FileText } from 'lucide-react';

const ArchiveToolsPage: React.FC = () => {
  const archiveTools = [
    {
      id: 'zip-creator',
      title: 'ZIP Creator',
      description: 'Create ZIP archives from multiple files and folders',
      icon: FileArchive,
      path: '/tools/zip-creator',
      features: ['Multiple file selection', 'Folder structure preservation', 'Compression options', 'Password protection']
    },
    {
      id: 'zip-extractor',
      title: 'ZIP Extractor',
      description: 'Extract files from ZIP archives with preview',
      icon: FolderOpen,
      path: '/tools/zip-extractor',
      features: ['Archive preview', 'Selective extraction', 'Password support', 'Progress tracking']
    },
    {
      id: '7z-support',
      title: '7z Support',
      description: 'Handle 7z format compression and extraction',
      icon: Compass,
      path: '/tools/7z-support',
      features: ['7z compression', 'High compression ratios', 'Password protection', 'Multiple formats']
    },
    {
      id: 'file-archiver',
      title: 'File Archiver',
      description: 'Create various archive formats (tar, gz, bz2)',
      icon: Archive,
      path: '/tools/file-archiver',
      features: ['Multiple formats', 'Compression options', 'Batch processing', 'Format conversion']
    },
    {
      id: 'archive-inspector',
      title: 'Archive Inspector',
      description: 'View archive contents without extracting',
      icon: Eye,
      path: '/tools/archive-inspector',
      features: ['Content preview', 'File details', 'Size information', 'No extraction needed']
    },
    {
      id: 'batch-compressor',
      title: 'Batch Compressor',
      description: 'Compress multiple files individually',
      icon: RefreshCw,
      path: '/tools/batch-compressor',
      features: ['Individual compression', 'Format selection', 'Progress tracking', 'Size optimization']
    },
    {
      id: 'archive-converter',
      title: 'Archive Converter',
      description: 'Convert between different archive formats',
      icon: FileText,
      path: '/tools/archive-converter',
      features: ['Format conversion', 'Batch processing', 'Compression options', 'Preserve structure']
    }
  ];

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Archive className="w-16 h-16 text-accent" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Archive Tools</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Professional file archiving and compression tools. Create, extract, and manage archives with advanced features like password protection and batch processing.
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
              <span>Password Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Multiple Archive Formats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Batch Processing</span>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archiveTools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="group block bg-white dark:bg-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                    <tool.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold ml-3 group-hover:text-accent transition-colors">
                    {tool.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {tool.description}
                </p>
                
                <div className="space-y-2">
                  {tool.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
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
          <h2 className="text-lg font-semibold mb-3">About Archive Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h3 className="font-medium mb-2">Privacy & Security</h3>
              <p>All processing happens in your browser. Files never leave your computer, ensuring complete privacy and security for your sensitive data.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Supported Formats</h3>
              <p>ZIP, 7z, TAR, GZ, BZ2, and more. Convert between formats and handle password-protected archives with ease.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Performance</h3>
              <p>Optimized for large files with progress tracking and memory management. Handle archives up to several GB efficiently.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Advanced Features</h3>
              <p>Batch processing, selective extraction, compression ratio optimization, and detailed file information display.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveToolsPage; 