import { useEffect } from 'react';
import UnitConverter from '../../components/tools/UnitConverter';
import { Link } from 'react-router-dom';
import AdSlot from '../../components/ads/AdSlot';
import ToolIcon from '../../components/tools/ToolIcon';
import SideNavAccordion from '../../components/tools/SideNavAccordion';

import { useAnalytics } from '../../hooks/useAnalytics';

const related = [
  { title: 'Currency Converter', path: '/tools/currency-converter' },
  { title: 'Image Format Converter', path: '/tools/image-format-converter' },
];

const sideNavTools = [
  { id: 'unit-converter', title: 'Unit Converter', path: '/tools/unit-converter' },
  { id: 'currency-converter', title: 'Currency Converter', path: '/tools/currency-converter' },
];

const UnitConverterPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Unit Converter - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app">
      {/* Breadcrumb */}
      <div className="pb-2">
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <span>Converters</span>
          <span>&gt;</span>
          <b>Unit Converter</b>
        </nav>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_300px] md:grid-cols-[1fr_3fr] mt-8">
        {/* Side-nav accordion */}
        <aside className="hidden md:block">
          <SideNavAccordion
            tools={sideNavTools}
            currentId="unit-converter"
            title="Other tools in this category"
          />
          <div className="mt-8 block lg:hidden">
            <AdSlot slot="sidebar" className="mx-auto" />
          </div>
        </aside>
        {/* Main tool card - only the card, no extra title/desc */}
        <section className="flex flex-col items-center">
          <div className="w-full max-w-xl">
            <div className="bg-white dark:bg-primary-light rounded-lg p-8 shadow-md flex flex-col items-center">
              <UnitConverter />
            </div>
          </div>
          {/* Related tools (mobile/tablet) */}
          <div className="block lg:hidden w-full max-w-xl mt-8">
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
          </div>
        </section>
        {/* Related tools and ad (desktop) */}
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

export default UnitConverterPage; 