import { useEffect } from 'react';
import CurrencyConverter from '../../components/tools/CurrencyConverter';
import { Link } from 'react-router-dom';
import AdSlot from '../../components/ads/AdSlot';
import ToolIcon from '../../components/tools/ToolIcon';
import SideNavAccordion from '../../components/tools/SideNavAccordion';

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
    <div className="container-app">
      {/* Breadcrumb (stationary) */}
      <div className="pb-2">
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <span>Converters</span>
          <span>&gt;</span>
          <b>Currency Converter</b>
        </nav>
      </div>
      {/* Responsive grid */}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_300px] md:grid-cols-[1fr_3fr] mt-4">
        {/* Side-nav accordion */}
        <aside className="hidden md:block">
          <SideNavAccordion
            tools={sideNavTools}
            currentId="currency-converter"
            title="Other tools in this category"
          />
          {/* 300x250 ad below side-nav on md */}
          <div className="mt-8 block lg:hidden">
            <AdSlot slot="sidebar" className="mx-auto" />
          </div>
        </aside>
        {/* Main tool card */}
        <section>
          <CurrencyConverter />
        </section>
        {/* Related tools and ad */}
        <aside className="hidden lg:block">
          <div className="mb-6">
            <AdSlot slot="sidebar" className="mx-auto" />
          </div>
          <div className="bg-white dark:bg-primary-light rounded-lg p-4 shadow-md">
            <div className="font-semibold mb-2">Related Tools</div>
            <ul className="space-y-1">
              {related.map(tool => (
                <li key={tool.path}>
                  <Link to={tool.path} className="flex items-center gap-2 text-accent hover:underline">
                    <ToolIcon tool={tool.title.toLowerCase().replace(/ /g, '-')} className="w-4 h-4" />
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CurrencyConverterPage; 