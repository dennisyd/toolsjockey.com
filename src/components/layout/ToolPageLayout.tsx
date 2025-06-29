import React from 'react';
import { Link } from 'react-router-dom';
import { toolsConfig, toolGroups } from '../../utils/toolsConfig';
import AdSlot from '../ads/AdSlot';
import { Lock } from 'lucide-react';

interface ToolPageLayoutProps {
  toolId: string;
  title: string;
  icon: React.ElementType;
  group: string;
  children: React.ReactNode;
  relatedTools?: string[];
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ toolId, title, icon: Icon, group, children, relatedTools }) => {
  // Find group info
  const groupMeta = toolGroups.find(g => g.id === group);
  const siblings = toolsConfig.filter(t => t.group === group);

  // Check if we're on the batch-pdf-form-filler page
  const isBatchPdfFormFillerPage = toolId === 'batch-pdf-form-filler';

  // Breadcrumb
  const groupLabel = groupMeta?.label || group;

  // Related tools (by id)
  const related = (relatedTools
    ? relatedTools.map(id => toolsConfig.find(t => t.id === id)).filter((t): t is typeof toolsConfig[number] => Boolean(t))
    : siblings.filter(t => t.id !== toolId).slice(0, 4));

  return (
    <>
      <div className="container-app mx-auto px-2 md:px-0 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-2 mb-2" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <span>{groupLabel}</span>
          <span>&gt;</span>
          <b>{title}</b>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] md:grid-cols-[1fr_3fr]">
          {/* Left sidebar with privacy badge (if batch-pdf-form-filler) and tool categories */}
          <aside className="hidden md:flex flex-col gap-6">
            {/* Privacy Badge for batch-pdf-form-filler */}
            {isBatchPdfFormFillerPage && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div className="flex justify-center mb-1">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-blue-700 font-bold text-lg">Your Privacy Guaranteed</h3>
                <p className="text-gray-700 text-sm mt-2">
                  All processing happens in your browser. Your files never leave your computer.
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Built by MIT-trained engineer
                </div>
              </div>
            )}
            
            {/* Tools category navigation */}
            <div>
              <div className="mb-4 font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                Other tools in this category
              </div>
              <ul className="space-y-1">
                {siblings.map(t => (
                  <li key={t.id}>
                    <Link
                      to={t.path}
                      className={`block px-3 py-1 rounded transition-colors ${t.id === toolId ? 'bg-accent/10 font-bold text-accent' : 'hover:bg-gray-100 dark:hover:bg-primary'}`}
                      aria-current={t.id === toolId ? 'page' : undefined}
                    >
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          
          {/* Main content area */}
          <div className="flex flex-col gap-6">
            {/* Mobile privacy badge */}
            {isBatchPdfFormFillerPage && (
              <div className="md:hidden bg-blue-50 border border-blue-100 rounded-lg p-4 text-center mb-4">
                <div className="flex justify-center mb-1">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-blue-700 font-bold text-lg">Your Privacy Guaranteed</h3>
                <p className="text-gray-700 text-sm mt-2">
                  All processing happens in your browser. Your files never leave your computer.
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Built by MIT-trained engineer
                </div>
              </div>
            )}
            
            {/* Main tool card */}
            <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-7 h-7 text-accent" />
                <h1 className="text-2xl font-bold">{title}</h1>
              </div>
              {children}
            </div>
            
            {/* Related tools */}
            {related.length > 0 && (
              <div>
                <div className="font-semibold mb-2">You may also like</div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {related.map(t => (
                    <Link
                      key={t.id}
                      to={t.path}
                      className="min-w-max px-3 py-1 bg-gray-100 dark:bg-primary rounded hover:bg-accent/10 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      {t.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom ad slot */}
        <AdSlot slot="footer" className="mt-8" />
      </div>
    </>
  );
};

export default ToolPageLayout; 