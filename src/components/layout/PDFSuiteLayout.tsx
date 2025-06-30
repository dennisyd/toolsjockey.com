import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toolsConfig } from '../../utils/toolsConfig';
import AdSlot from '../ads/AdSlot';

interface PDFSuiteLayoutProps {
  title: string;
  children: React.ReactNode;
}

// Filter PDF tools for sidebar navigation
const pdfTools = toolsConfig.filter(t => t.group === 'pdf' && t.id !== 'pdf-suite-dashboard');

const PDFSuiteLayout: React.FC<PDFSuiteLayoutProps> = ({ title, children }) => {
  const location = useLocation();
  return (
    <>
      <div className="container-app mx-auto px-2 md:px-0 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-2" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <Link to="/pdf-tools">PDF Suite</Link>
          <span>&gt;</span>
          <b>{title}</b>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr_300px] md:grid-cols-[1fr_3fr]">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <div className="mb-4 font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              PDF Tools
            </div>
            <ul className="space-y-1">
              {pdfTools.map(t => (
                <li key={t.id}>
                  <Link
                    to={t.path}
                    className={`block px-3 py-1 rounded transition-colors ${location.pathname === t.path ? 'bg-accent/10 font-bold text-accent' : 'hover:bg-gray-100 dark:hover:bg-primary'}`}
                    aria-current={location.pathname === t.path ? 'page' : undefined}
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
          {/* Main tool card */}
          <main className="col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 flex flex-col gap-4">
              <h1 className="text-2xl font-bold mb-4">{title}</h1>
              {children}
            </div>
          </main>
          {/* Ad slot or reserved space */}
          <aside className="hidden lg:block">
            <AdSlot slot="sidebar" />
          </aside>
        </div>
        {/* Bottom ad slot */}
        <AdSlot slot="footer" className="mt-8" />
      </div>
    </>
  );
};

export default PDFSuiteLayout; 