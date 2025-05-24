import { useEffect } from 'react';
import PasswordGenerator from '../../components/tools/PasswordGenerator';
import { Link } from 'react-router-dom';

const related = [
  { title: 'Text Case Converter', path: '/tools/text-case-converter' },
  { title: 'Word/Character Counter', path: '/tools/word-counter' },
  { title: 'Base64 Encoder/Decoder', path: '/tools/base64-encoder' },
];

const PasswordGeneratorPage = () => {
  useEffect(() => {
    document.title = 'Password Generator - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Breadcrumb */}
      <div className="md:col-span-12 mb-2 text-sm text-gray-500">
        <Link to="/">Home</Link> &gt; <span>Quick Utilities</span> &gt; <b>Password Generator</b>
      </div>
      {/* Sidebar */}
      <div className="hidden md:block md:col-span-3">
        <div className="bg-white dark:bg-primary-light rounded-lg p-4 mb-6">
          <div className="font-semibold mb-2">Other tools in this category</div>
          <ul className="text-sm space-y-1">
            <li><Link to="/tools/qr-code-generator" className="hover:underline">QR Code Generator</Link></li>
            <li><Link to="/tools/text-case-converter" className="hover:underline">Text Case Converter</Link></li>
            <li><Link to="/tools/word-counter" className="hover:underline">Word/Character Counter</Link></li>
            <li><Link to="/tools/color-palette-generator" className="hover:underline">Color Palette Extractor</Link></li>
          </ul>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-4">
          <div className="font-semibold mb-2">Related tools</div>
          <ul className="text-sm space-y-1">
            {related.map(t => (
              <li key={t.path}><Link to={t.path} className="hover:underline">{t.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      {/* Main Content */}
      <div className="md:col-span-6">
        <PasswordGenerator />
      </div>
    </div>
  );
};

export default PasswordGeneratorPage; 