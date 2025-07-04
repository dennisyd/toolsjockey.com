import { useEffect } from 'react';
import EXIFRemover from '../../components/tools/EXIFRemover';
import { Link } from 'react-router-dom';
import AdSlot from '../../components/ads/AdSlot';
import ToolIcon from '../../components/tools/ToolIcon';
import SideNavAccordion from '../../components/tools/SideNavAccordion';
import { useAnalytics } from '../../hooks/useAnalytics';

const related = [
  { title: 'Image Compressor', path: '/tools/image-compressor' },
  { title: 'Image Format Converter', path: '/tools/image-format-converter' },
  { title: 'Watermark Adder', path: '/tools/watermark-adder' },
];

const sideNavTools = [
  { id: 'image-sharpener', title: 'Image Upscaler', path: '/tools/image-sharpener' },
  { id: 'image-compressor', title: 'Image Compressor', path: '/tools/image-compressor' },
  { id: 'image-format-converter', title: 'Image Format Converter', path: '/tools/image-format-converter' },
  { id: 'exif-remover', title: 'EXIF Data Remover', path: '/tools/exif-remover' },
  { id: 'watermark-adder', title: 'Watermark Adder', path: '/tools/watermark-adder' },
];

const EXIFRemoverPage = () => {
  useAnalytics();
  
  useEffect(() => {
    document.title = 'EXIF Data Remover - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app">
      {/* Breadcrumb (stationary) */}
      <div className="pb-2">
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <span>Image Tools</span>
          <span>&gt;</span>
          <b>EXIF Data Remover</b>
        </nav>
      </div>
      {/* Responsive grid */}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_300px] md:grid-cols-[1fr_3fr] mt-4">
        {/* Side-nav accordion */}
        <aside className="hidden md:block">
          <SideNavAccordion
            tools={sideNavTools}
            currentId="exif-remover"
            title="Other tools in this category"
          />
          {/* 300x250 ad below side-nav on md */}
          <div className="mt-8 block lg:hidden">
            <AdSlot slot="sidebar" className="mx-auto" />
          </div>
        </aside>
        {/* Main tool card */}
        <main className="min-w-0">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <ToolIcon tool="exif-remover" className="h-6 w-6 text-orange-500" />
              <h1 className="text-2xl font-bold">EXIF Data Remover</h1>
            </div>
            <EXIFRemover />
          </div>
          {/* Related tools bar */}
          <div className="mt-6">
            <div className="font-semibold mb-2">You may also like</div>
            <div className="flex gap-3 overflow-x-auto">
              {related.map(t => (
                <Link key={t.path} to={t.path} className="bg-slate-50 dark:bg-slate-800 rounded px-4 py-2 whitespace-nowrap hover:bg-accent/10">
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
          {/* 728x90 banner ad (hidden on sm) */}
          <div className="hidden sm:block mx-auto my-12">
            <AdSlot slot="header" className="mx-auto" />
          </div>
        </main>
        {/* Sticky 300x250 ad (desktop only) */}
        <aside className="hidden lg:block sticky top-24 self-start">
          <AdSlot slot="sidebar" className="mx-auto" />
        </aside>
      </div>
    </div>
  );
};

export default EXIFRemoverPage; 