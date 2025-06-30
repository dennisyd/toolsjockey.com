import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toolsConfig } from '../../utils/toolsConfig';
import { Lock } from 'lucide-react';

interface PDFSuiteLayoutProps {
  title: string;
  children: React.ReactNode;
}

// Filter PDF tools for sidebar navigation
const pdfTools = toolsConfig.filter(t => t.group === 'pdf' && t.id !== 'pdf-suite-dashboard');

const PDFSuiteLayout: React.FC<PDFSuiteLayoutProps> = ({ title, children }) => {
  const location = useLocation();
  return (
    <div className="container-app mx-auto px-2 md:px-0 py-6 flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>&gt;</span>
        <Link to="/pdf-tools">PDF Suite</Link>
        <span>&gt;</span>
        <b>{title}</b>
      </nav>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_300px] md:grid-cols-[1fr_3fr]">
        {/* Sidebar with Privacy Badge First */}
        <aside className="hidden md:flex flex-col gap-4">
          {/* Privacy Badge */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
            <div className="flex justify-center mb-1">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-blue-700 font-bold text-lg text-center">Your Privacy Guaranteed</h3>
            <p className="text-gray-700 text-sm mt-2">
              All processing happens in your browser. Your files never leave your computer.
            </p>
            <p className="text-gray-500 text-xs mt-2 text-center">
              Built by MIT-trained engineer
            </p>
          </div>
          
          {/* PDF Tools List - More Compact */}
          <div>
            <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
              PDF Tools
            </div>
            <ul className="space-y-0.5">
              {pdfTools.map(t => (
                <li key={t.id}>
                  <Link
                    to={t.path}
                    className={`block px-2 py-1 text-sm rounded transition-colors ${location.pathname === t.path ? 'bg-accent/10 font-bold text-accent' : 'hover:bg-gray-100 dark:hover:bg-primary'}`}
                    aria-current={location.pathname === t.path ? 'page' : undefined}
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        
        {/* Main tool card */}
        <main className="col-span-2 flex flex-col gap-4">
          {/* Mobile Privacy Badge */}
          <div className="md:hidden bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
            <div className="flex items-center">
              <Lock className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 font-bold">Your Privacy Guaranteed</span>
            </div>
            <p className="text-gray-700 text-xs mt-1">
              All processing happens in your browser. Your files never leave your computer.
            </p>
          </div>
          
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-5 flex flex-col gap-4">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            {children}
          </div>
        </main>
        
        {/* Reserved space for the third column - no AdSlot to avoid duplicate privacy badges */}
        <aside className="hidden lg:block">
          <div className="bg-gray-100 dark:bg-primary border border-gray-300 dark:border-gray-700 rounded h-full w-full"></div>
        </aside>
      </div>
    </div>
  );
};

export default PDFSuiteLayout; 