import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';

const CORE_TOOLS = [
  { title: 'Merge PDFs', path: '/merge-pdf', desc: 'Combine multiple PDF files into one.' },
  { title: 'Split PDF', path: '/split-pdf', desc: 'Extract specific pages or ranges.' },
  { title: 'Reorder Pages', path: '/reorder-pdf', desc: 'Rearrange pages with drag-and-drop.' },
  { title: 'Rotate Pages', path: '/rotate-pdf', desc: 'Rotate any page left/right.' },
  { title: 'Add Watermark to PDF', path: '/watermark-pdf', desc: 'Add styled text overlays to every page.' },
  { title: 'PDF to Images', path: '/pdf-to-images', desc: 'Export PDF pages as PNG or JPEG.' },
  { title: 'Images to PDF', path: '/images-to-pdf', desc: 'Merge images into a single PDF.' },
  { title: 'Extract Text', path: '/extract-text', desc: 'Parse and extract text content.' },
  { title: 'PDF to Word (Lite)', path: '/pdf-to-word', desc: 'Convert PDF text to a Word document.' },
];

const BONUS_TOOLS = [
  { title: 'Delete Pages', path: '/delete-pages', desc: 'Remove selected pages from your PDF.' },
  { title: 'Edit Metadata', path: '/edit-metadata', desc: 'Modify embedded metadata.' },
];

const PDFSuiteDashboard: React.FC = () => {
  React.useEffect(() => {
    document.title = 'ToolsJockey PDF Suite – All Tools';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'All-in-one PDF tools: merge, split, compress, convert, sign, protect, and more. 100% client-side.');
  }, []);

  return (
    <>
      <Header />
      <main className="container-app mx-auto px-2 md:px-0 py-8">
        <h1 className="text-3xl font-bold mb-6">ToolsJockey PDF Suite</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-4xl">
          Merge, split, convert, reorder, watermark, and extract PDF content—all 100% client-side. No uploads, no privacy worries.
        </p>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Core Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_TOOLS.map(tool => (
              <Link key={tool.path} to={tool.path} className="block p-5 rounded-lg shadow bg-white dark:bg-primary-light hover:bg-accent/10 transition-colors border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-lg mb-1">{tool.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{tool.desc}</div>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">Bonus Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BONUS_TOOLS.map(tool => (
              <Link key={tool.path} to={tool.path} className="block p-5 rounded-lg shadow bg-white dark:bg-primary-light hover:bg-accent/10 transition-colors border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-lg mb-1">{tool.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{tool.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <DonationBanner />
    </>
  );
};

export default PDFSuiteDashboard; 