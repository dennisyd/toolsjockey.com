import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../../hooks/useAnalytics';

const DOCUMENT_TOOLS = [
  { title: 'Word to Markdown', path: '/tools/word-to-markdown', desc: 'Convert Word documents to Markdown format.' },
  { title: 'Mail Merge Tool', path: '/tools/mail-merge-tool', desc: 'Generate personalized documents from templates and data.' },
];

const DocumentToolsPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Helmet>
        <title>Document Tools - Free Online Document Converter & Editor | ToolsJockey</title>
        <meta name="description" content="Free online document tools to convert Word files to Markdown and generate personalized documents with mail merge. No installation or signup required - all processing happens in your browser." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Document Tools – Convert & Generate Documents Online</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Document Processing Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOCUMENT_TOOLS.map((tool) => (
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
            <h2 className="text-xl font-semibold mb-4">Why Use Our Document Tools?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">100% Private:</span> All processing happens in your browser. Your documents never leave your device.</li>
              <li><span className="font-medium">No Microsoft Word Required:</span> Process Word files without having Microsoft Office installed.</li>
              <li><span className="font-medium">Free to Use:</span> All document tools are completely free.</li>
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

export default DocumentToolsPage;
