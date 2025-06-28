import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';
import { Helmet } from 'react-helmet';

const IMAGE_PROCESSING_TOOLS = [
  { title: 'Image Compressor', path: '/tools/image-compressor', desc: 'Reduce image file size while preserving quality.' },
  { title: 'Image Format Converter', path: '/tools/image-format-converter', desc: 'Convert between JPG, PNG, WebP, and other formats.' },
  { title: 'Image Sharpener', path: '/tools/image-sharpener', desc: 'Enhance image clarity and reduce blur.' },
];

const IMAGE_UTILITY_TOOLS = [
  { title: 'Text from Image', path: '/tools/text-from-image', desc: 'Extract text from images using OCR.' },
  { title: 'EXIF Remover', path: '/tools/exif-remover', desc: 'Remove metadata from images for privacy.' },
  { title: 'Watermark Adder', path: '/tools/watermark-adder', desc: 'Add text or image watermarks to your photos.' },
];

const ImageToolsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Helmet>
        <title>Image Tools - Free Online Image Editor & Converter | ToolsJockey</title>
        <meta name="description" content="Free online image tools to compress, convert, enhance, and extract text from images. No installation or signup required - all processing happens in your browser." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Image Tools – Optimize, Convert & Edit Images Easily</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Image Processing Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {IMAGE_PROCESSING_TOOLS.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="block p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <h3 className="font-medium text-lg text-blue-700">{tool.title}</h3>
                  <p className="text-gray-600 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Image Utility Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {IMAGE_UTILITY_TOOLS.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="block p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <h3 className="font-medium text-lg text-blue-700">{tool.title}</h3>
                  <p className="text-gray-600 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Why Use Our Image Tools?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">100% Private:</span> All processing happens in your browser. Your images never leave your device.</li>
              <li><span className="font-medium">No Installation:</span> No need to download or install any image editing software.</li>
              <li><span className="font-medium">Free to Use:</span> All image tools are completely free.</li>
              <li><span className="font-medium">Fast Processing:</span> Get results instantly without waiting for uploads/downloads.</li>
              <li><span className="font-medium">Works Everywhere:</span> Compatible with Windows, Mac, Linux, iOS, and Android.</li>
            </ul>
          </div>
        </div>
      </main>
      <DonationBanner />
    </div>
  );
};

export default ImageToolsPage;
