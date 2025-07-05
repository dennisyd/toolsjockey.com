import React from 'react';
import AdSlot from '../ads/AdSlot';
import { Lock } from 'lucide-react';

interface ArchiveToolPageLayoutProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const ArchiveToolPageLayout: React.FC<ArchiveToolPageLayoutProps> = ({ title, icon: Icon, children }) => {
  return (
    <div className="container-app mx-auto px-2 md:px-0 py-8 flex flex-col gap-6">
      {/* Top SaaS Banner */}
      <AdSlot slot="header" className="mb-6" />
      <div className="grid gap-8 lg:grid-cols-[220px_1fr] md:grid-cols-[1fr_3fr]">
        {/* Left sidebar with privacy box */}
        <aside className="hidden md:flex flex-col gap-6">
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
        </aside>
        {/* Main content area */}
        <div className="flex flex-col gap-6">
          {/* Mobile privacy badge */}
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
          {/* Main tool card */}
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-7 h-7 text-accent" />
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            {children}
          </div>
        </div>
      </div>
      {/* Bottom SaaS Banner */}
      <AdSlot slot="footer" className="mt-8" />
    </div>
  );
};

export default ArchiveToolPageLayout; 