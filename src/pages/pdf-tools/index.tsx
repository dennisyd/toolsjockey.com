import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';
import { Helmet } from 'react-helmet';

const CORE_TOOLS = [
  { title: 'Merge PDFs', path: '/merge-pdf', desc: 'Combine multiple PDF files into one.' },
  { title: 'Split PDF', path: '/split-pdf', desc: 'Extract specific pages or ranges.' },
  { title: 'Reorder Pages', path: '/reorder-pdf', desc: 'Rearrange pages with drag-and-drop.' },
  { title: 'Rotate Pages', path: '/rotate-pdf', desc: 'Rotate any page left/right.' },
  { title: 'Add Watermark to PDF', path: '/watermark-pdf', desc: 'Add styled text overlays to every page.' },
  { title: 'PDF to Images', path: '/pdf-to-images', desc: 'Export PDF pages as PNG or JPEG.' },
  { title: 'Images to PDF', path: '/images-to-pdf', desc: 'Create PDF from multiple images.' },
];

const ADVANCED_TOOLS = [
  { title: 'Extract Text', path: '/extract-text', desc: 'Extract all text content from PDFs.' },
  { title: 'PDF to Word', path: '/pdf-to-word', desc: 'Convert PDFs to editable Word documents.' },
  { title: 'Delete Pages', path: '/delete-pages', desc: 'Remove specific pages from PDFs.' },
  { title: 'Edit Metadata', path: '/edit-metadata', desc: 'Modify PDF document properties.' },
  { title: 'Batch PDF Form Filler', path: '/tools/batch-pdf-form-filler', desc: 'Fill PDF forms in bulk from spreadsheet data.' },
];

const PDFSuiteDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Helmet>
        <title>PDF Tools - Free Online PDF Editor, Merger & Converter | ToolsJockey</title>
        <meta name="description" content="Free online PDF tools to merge, split, compress, convert, and edit PDF files. No installation or signup required - all processing happens in your browser." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">PDF Tools – Merge, Split, Compress & Convert PDFs Online</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Core PDF Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CORE_TOOLS.map((tool) => (
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
            <h2 className="text-xl font-semibold mb-4">Advanced PDF Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ADVANCED_TOOLS.map((tool) => (
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
            <h2 className="text-xl font-semibold mb-4">Why Use Our PDF Tools?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">100% Private:</span> All processing happens in your browser. Your files never leave your device.</li>
              <li><span className="font-medium">No Installation:</span> No need to download or install any software.</li>
              <li><span className="font-medium">Free to Use:</span> All basic PDF tools are completely free.</li>
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

export default PDFSuiteDashboard; 