import React from 'react';
import { Link } from 'react-router-dom';
import { toolsConfig, toolGroups } from '../../utils/toolsConfig';

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

  // Breadcrumb
  const groupLabel = groupMeta?.label || group;

  // Related tools (by id)
  const related = (relatedTools
    ? relatedTools.map(id => toolsConfig.find(t => t.id === id)).filter((t): t is typeof toolsConfig[number] => Boolean(t))
    : siblings.filter(t => t.id !== toolId).slice(0, 4));

  return (
    <div className="container-app mx-auto px-2 md:px-0 py-8 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2 mb-2" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>&gt;</span>
        <span>{groupLabel}</span>
        <span>&gt;</span>
        <b>{title}</b>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_300px] md:grid-cols-[1fr_3fr]">
        {/* Sidebar */}
        <aside className="hidden md:block">
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
        </aside>
        {/* Main tool card */}
        <main className="col-span-2 flex flex-col gap-6">
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
        </main>
        {/* Ad slot or reserved space */}
        <aside className="hidden lg:block">
          <div className="w-full h-24 bg-gray-100 dark:bg-primary rounded flex items-center justify-center text-gray-400 border border-gray-200 dark:border-gray-700">
            Ad Space (300x250)
          </div>
        </aside>
      </div>
      {/* Bottom ad slot */}
      <div className="w-full h-12 bg-gray-100 dark:bg-primary rounded flex items-center justify-center text-gray-400 border border-gray-200 dark:border-gray-700 mt-8">
        Ad Space (728x90)
      </div>
    </div>
  );
};

export default ToolPageLayout; 