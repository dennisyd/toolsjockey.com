import { useEffect } from 'react';
import WordCounter from '../../components/tools/WordCounter';
import { Link } from 'react-router-dom';
import AdSlot from '../../components/ads/AdSlot';
import ToolIcon from '../../components/tools/ToolIcon';
import SideNavAccordion from '../../components/tools/SideNavAccordion';

const related = [
  { title: 'Text Case Converter', path: '/tools/text-case-converter' },
  { title: 'Password Generator', path: '/tools/password-generator' },
  { title: 'Base64 Encoder/Decoder', path: '/tools/base64-encoder' },
];

const sideNavTools = [
  { id: 'password-generator', title: 'Password Generator', path: '/tools/password-generator' },
  { id: 'base64-encoder', title: 'Base64 Encoder/Decoder', path: '/tools/base64-encoder' },
  { id: 'hash-generator', title: 'Hash Generator (MD5, SHA256)', path: '/tools/hash-generator' },
  { id: 'text-case-converter', title: 'Text Case Converter', path: '/tools/text-case-converter' },
  { id: 'word-counter', title: 'Word/Character Counter', path: '/tools/word-counter' },
];

const WordCounterPage = () => {
  useEffect(() => {
    document.title = 'Word/Character Counter - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app">
      {/* Breadcrumb (stationary) */}
      <div className="pb-2">
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link to="/">Home</Link>
          <span>&gt;</span>
          <span>Quick Utilities</span>
          <span>&gt;</span>
          <b>Word/Character Counter</b>
        </nav>
      </div>
      {/* Responsive grid */}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_300px] md:grid-cols-[1fr_3fr] mt-4">
        {/* Side-nav accordion */}
        <aside className="hidden md:block">
          <SideNavAccordion
            tools={sideNavTools}
            currentId="word-counter"
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
              <ToolIcon tool="word-counter" className="h-6 w-6 text-orange-500" />
              <h1 className="text-2xl font-bold">Word/Character Counter</h1>
            </div>
            <WordCounter />
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

export default WordCounterPage; 