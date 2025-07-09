import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';
import { Helmet } from 'react-helmet';
import AdSlot from '../../components/ads/AdSlot';
import { useAnalytics } from '../../hooks/useAnalytics';

const FORMATTER_TOOLS = [
  { title: 'JSON Formatter', path: '/tools/json-formatter', desc: 'Format, validate, and beautify JSON data.' },
  { title: 'CSS Minifier', path: '/tools/css-minifier', desc: 'Minify CSS to reduce file size.' },
  { title: 'HTML Minifier', path: '/tools/html-minifier', desc: 'Compress HTML code to reduce file size.' },
  { title: 'JavaScript Minifier', path: '/tools/js-minifier', desc: 'Minify JavaScript code to reduce file size.' },
  { title: 'Code Formatter', path: '/tools/code-formatter', desc: 'Format and beautify code in multiple languages.' },
  { title: 'Text Diff Viewer', path: '/tools/text-diff', desc: 'Compare text and find differences between files.' },
  { title: 'Code Diff Viewer', path: '/tools/code-diff-viewer', desc: 'Compare code differences side-by-side.' },
];

const UTILITY_TOOLS = [
  { title: 'Hash Generator', path: '/tools/hash-generator', desc: 'Generate MD5, SHA-1, SHA-256, and other hashes.' },
  { title: 'Regex Tester', path: '/tools/regex-tester', desc: 'Test and debug regular expressions.' },
  { title: 'Base64 Encoder', path: '/tools/base64-encoder', desc: 'Encode and decode Base64 data.' },
  { title: 'URL Encoder/Decoder', path: '/tools/url-encoder-decoder', desc: 'Encode and decode URLs easily.' },
  { title: 'HTML Entity Converter', path: '/tools/html-entity-converter', desc: 'Convert text to and from HTML entities.' },
  { title: 'Syntax Highlighter', path: '/tools/syntax-highlighter', desc: 'Highlight code with themes and line numbers.' },
  { title: 'Lorem Ipsum Generator', path: '/tools/lorem-ipsum-generator', desc: 'Generate placeholder Lorem Ipsum text.' },
];

const DeveloperToolsPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Helmet>
        <title>Developer Tools - Free Online Coding Utilities | ToolsJockey</title>
        <meta name="description" content="Free online developer tools for code formatting, minification, syntax highlighting, regex testing, hash generation, and more. No installation or signup required - all processing happens in your browser." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Developer Tools – Format, Minify, Compare, and Test Code</h1>
        
        <div className="max-w-4xl mx-auto">
          {/* Ad slot at the top */}
          <div className="mb-8">
            <AdSlot slot="header" />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Formatter & Minifier Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FORMATTER_TOOLS.map((tool) => (
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
            <h2 className="text-xl font-semibold mb-4">Utility Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {UTILITY_TOOLS.map((tool) => (
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

          {/* Ad slot in the middle */}
          <div className="mb-8">
            <AdSlot slot="sidebar" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Why Use Our Developer Tools?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">100% Private:</span> All processing happens in your browser. Your code and data never leave your device.</li>
              <li><span className="font-medium">Always Available:</span> Access these tools anywhere, even without an internet connection after initial load.</li>
              <li><span className="font-medium">Free to Use:</span> All developer tools are completely free.</li>
              <li><span className="font-medium">Fast Processing:</span> Get results instantly with client-side processing.</li>
              <li><span className="font-medium">Works Everywhere:</span> Compatible with Windows, Mac, Linux, iOS, and Android.</li>
            </ul>
          </div>
          
          {/* Ad slot at the bottom */}
          <div className="mt-8">
            <AdSlot slot="footer" />
          </div>
        </div>
      </main>
      <DonationBanner />
    </div>
  );
};

export default DeveloperToolsPage;
