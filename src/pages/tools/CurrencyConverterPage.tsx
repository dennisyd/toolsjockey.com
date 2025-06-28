import { useEffect } from 'react';
import CurrencyConverter from '../../components/tools/CurrencyConverter';
import { Link } from 'react-router-dom';
import AdSlot from '../../components/ads/AdSlot';
import ToolIcon from '../../components/tools/ToolIcon';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

const related = [
  { title: 'Unit Converter', path: '/tools/unit-converter' },
  { title: 'Image Format Converter', path: '/tools/image-format-converter' },
];

const sideNavTools = [
  { id: 'unit-converter', title: 'Unit Converter', path: '/tools/unit-converter' },
  { id: 'currency-converter', title: 'Currency Converter', path: '/tools/currency-converter' },
];

const CurrencyConverterPage = () => {
  useEffect(() => {
    document.title = 'Currency Converter - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app mx-auto px-2 md:px-0 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-accent transition-colors">Home</Link>
        <span>&gt;</span>
        <Link to="/tools" className="hover:text-accent transition-colors">Converters</Link>
        <span>&gt;</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">Currency Converter</span>
      </nav>
      
      {/* Main content grid */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr_300px] md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-md p-4 mb-6">
            <div className="mb-3 font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-accent" />
              <span>Converter Tools</span>
            </div>
            <ul className="space-y-1">
              {sideNavTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className={`block px-3 py-2 rounded transition-colors ${
                      tool.id === 'currency-converter' 
                        ? 'bg-accent/10 font-medium text-accent' 
                        : 'hover:bg-gray-100 dark:hover:bg-primary'
                    }`}
                    aria-current={tool.id === 'currency-converter' ? 'page' : undefined}
                  >
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Ad slot for sidebar on medium screens */}
          <div className="mt-6 block lg:hidden">
            <AdSlot slot="sidebar" />
          </div>
        </aside>
        
        {/* Main tool content */}
        <main>
          <CurrencyConverter />
        </main>
        
        {/* Right sidebar */}
        <aside className="hidden lg:block">
          {/* Privacy guarantee */}
          <div className="mb-6">
            <AdSlot slot="sidebar" />
          </div>
          
          {/* Related tools */}
          <div className="bg-white dark:bg-primary-light rounded-lg p-5 shadow-md">
            <h2 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Related Tools</h2>
            <ul className="space-y-3">
              {related.map(tool => (
                <li key={tool.path}>
                  <Link 
                    to={tool.path} 
                    className="flex items-center gap-3 text-accent hover:underline transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-primary"
                  >
                    <ToolIcon tool={tool.title.toLowerCase().replace(/ /g, '-')} className="w-5 h-5" />
                    <span>{tool.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      
      {/* Footer ad */}
      <div className="mt-8">
        <AdSlot slot="footer" />
      </div>
    </div>
  );
};

export default CurrencyConverterPage; 