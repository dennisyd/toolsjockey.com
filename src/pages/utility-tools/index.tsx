import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';
import { Helmet } from 'react-helmet';
import { useAnalytics } from '../../hooks/useAnalytics';

const TEXT_TOOLS = [
  { title: 'Word Counter', path: '/tools/word-counter', desc: 'Count words, characters, and paragraphs in text.' },
  { title: 'Text Case Converter', path: '/tools/text-case-converter', desc: 'Convert text between different cases (UPPER, lower, Title, etc.).' },
];

const OTHER_TOOLS = [
  { title: 'Password Generator', path: '/tools/password-generator', desc: 'Generate secure, random passwords.' },
  { title: 'Markdown Table Generator', path: '/tools/markdown-table-generator', desc: 'Create well-formatted Markdown tables.' },
  { title: 'Unit Converter', path: '/tools/unit-converter', desc: 'Convert between different units of measurement.' },
  { title: 'Currency Converter', path: '/tools/currency-converter', desc: 'Convert between different currencies.' },
];

const UtilityToolsPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Helmet>
        <title>Utility Tools - Free Online Text & Conversion Utilities | ToolsJockey</title>
        <meta name="description" content="Free online utility tools for text processing, password generation, and unit conversion. No installation or signup required - all processing happens in your browser." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Utility Tools – Text Processing, Passwords & Converters</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Text Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEXT_TOOLS.map((tool) => (
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
            <h2 className="text-xl font-semibold mb-4">Other Utility Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OTHER_TOOLS.map((tool) => (
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
            <h2 className="text-xl font-semibold mb-4">Why Use Our Utility Tools?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">100% Private:</span> All processing happens in your browser. Your data never leaves your device.</li>
              <li><span className="font-medium">Instant Results:</span> Get results immediately without waiting for server processing.</li>
              <li><span className="font-medium">Free to Use:</span> All utility tools are completely free.</li>
              <li><span className="font-medium">No Sign-up Required:</span> Start using immediately without any registration.</li>
              <li><span className="font-medium">Works Everywhere:</span> Compatible with Windows, Mac, Linux, iOS, and Android.</li>
            </ul>
          </div>
        </div>
      </main>
      <DonationBanner />
    </div>
  );
};

export default UtilityToolsPage;
