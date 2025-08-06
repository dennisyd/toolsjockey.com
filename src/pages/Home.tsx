import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toolsConfig, toolGroups } from '../utils/toolsConfig';
import type { ToolMeta, ToolBadge } from '../utils/toolsConfig';
import { useAnalytics } from '../hooks/useAnalytics';

const getPopularTools = (recentlyUsedTools: string[]): ToolMeta[] => {
  // Simulate popularity: use recently used, fallback to POPULAR badge
  const recent = recentlyUsedTools
    .map(id => toolsConfig.find(t => t.id === id))
    .filter(Boolean) as ToolMeta[];
  const popular = toolsConfig.filter(t => t.badges?.includes('POPULAR'));
  const combined = [...recent, ...popular].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);
  return combined.slice(0, 4);
};

const getGroupTools = (groupId: string, search: string) => {
  let groupTools = toolsConfig.filter(t => t.group === groupId);
  if (search) {
    groupTools = groupTools.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  }
  return groupTools;
};

const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return <>{text.slice(0, i)}<mark className="bg-yellow-200 text-black rounded px-1">{text.slice(i, i + query.length)}</mark>{text.slice(i + query.length)}</>;
};

const getBadgeColor = (badge: ToolBadge) => {
  switch (badge) {
    case 'NEW': return 'bg-green-500 text-white animate-pulse';
    case 'POPULAR': return 'bg-yellow-400 text-yellow-900';
    case 'UPDATED': return 'bg-blue-500 text-white';
    case 'POWER TOOL': return 'bg-red-600 text-white';
    default: return 'bg-gray-300 text-gray-800';
  }
};

const Home = () => {
  const { trackButtonClick, trackEngagement } = useAnalytics();
  const { recentlyUsedTools } = useAppStore();
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<string[]>([]); // Start with all groups closed
  const [headline, setHeadline] = useState<string>('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Predefined headlines
  const headlines = [
    "102+ Pro Tools That Work Instantly in Your Browser",
    "102+ Pro Tools, Instantly in Your Browser",
    "Work Smarter: 102+ Instant Browser-Based Tools",
    "102+ Pro-Grade Tools. No Installs. Just Instant Results.",
    "One-Stop Toolkit: 102+ Pro Tools, Right in Your Browser"
  ];

  // Random headline selection with fade-in animation
  useEffect(() => {
    const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    setHeadline(randomHeadline);
    
    // Apply fade-in animation
    const headlineElement = document.getElementById('headline');
    if (headlineElement) {
      headlineElement.style.opacity = '0';
      headlineElement.style.transition = 'opacity 0.8s ease-in-out';
      
      setTimeout(() => {
        if (headlineElement) {
          headlineElement.style.opacity = '1';
        }
      }, 100);
    }
  }, []);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(handler);
  }, [search]);

  // Persist openGroups in localStorage
  useEffect(() => {
    localStorage.setItem('openGroups', JSON.stringify(openGroups));
  }, [openGroups]);
  useEffect(() => {
    const saved = localStorage.getItem('openGroups');
    if (saved) setOpenGroups(JSON.parse(saved));
  }, []);

  // Keyboard shortcut for focusing search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  // Popular tools (sticky/floating)
  const popularTools = useMemo(() => getPopularTools(recentlyUsedTools), [recentlyUsedTools]);

  // --- HEADER ---
  const { darkMode } = useAppStore();
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex-1 flex flex-col container-app w-full mx-auto px-2 md:px-0">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-10 mb-8">
        <h1 
          id="headline"
          className="text-4xl font-bold mb-4 md:mb-0 text-blue-700 dark:text-blue-300"
        >
          {headline}
        </h1>
        <div className="relative w-full md:w-96 ml-auto">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search tools... (Press / to focus)"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value) {
                trackEngagement('search', e.target.value.length, { query: e.target.value, page: 'Home' });
              }
            }}
            className="w-full p-3 pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Search tools"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Why Use ToolsJockey Section - Two Column Layout */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Why ToolsJockey */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose ToolsJockey?
              </h3>
              <div className="w-full">
                <img 
                  src="/ToolsJockeyCover.png" 
                  alt="Why Choose ToolsJockey - Privacy & Benefits" 
                  className="w-full h-auto max-h-[40vh] object-contain rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Right Column - What We Do */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                What We Do
              </h3>
              <div className="w-full">
                <img 
                  src="/ToolsJockeyright.png" 
                  alt="What ToolsJockey Does - 102+ Tools & Features" 
                  className="w-full h-auto max-h-[40vh] object-contain rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => {
              trackButtonClick('why_use_toolsjockey_cta', 'Home');
              document.getElementById('popular-tools')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="inline-flex items-center px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors shadow-lg text-lg"
          >
            Explore All 102+ Tools
            <ChevronDownIcon className="w-6 h-6 ml-2 rotate-[-90deg]" />
          </button>
        </div>
      </section>

      {/* Featured Tools Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Excel & CSV Tools Suite featured card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-4">
          <span className="text-4xl">📊</span>
          <div className="flex-1">
            <div className="font-bold text-lg">Excel & CSV Tools Suite</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Merge, split, convert, and analyze Excel and CSV files. Includes converters, mergers, filters, and more—privacy-first and all in your browser.</div>
            <a 
              href="/excelcsv-tools" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
              onClick={() => trackButtonClick('excel_csv_tools_featured', 'Home')}
            >
              Try Now
            </a>
          </div>
        </div>

        {/* Media Tools Suite featured card */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 flex items-center gap-4">
          <span className="text-4xl">🎬</span>
          <div className="flex-1">
            <div className="font-bold text-lg">New: Media Tools Suite</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Process audio and video right in your browser! Convert, compress, clip, merge, extract audio, and more - all client-side.</div>
            <a 
              href="/media-tools" 
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 transition"
              onClick={() => trackButtonClick('media_tools_featured', 'Home')}
            >
              Try Now
            </a>
          </div>
        </div>

        {/* Privacy Tools Suite featured card */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-4">
          <span className="text-4xl">🔒</span>
          <div className="flex-1">
            <div className="font-bold text-lg">Privacy-First Tools</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Encrypt files, generate secure notes, verify file integrity, and more - all with client-side processing.</div>
            <a 
              href="/privacy-tools" 
              className="inline-block bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
              onClick={() => trackButtonClick('privacy_tools_featured', 'Home')}
            >
              Try Now
            </a>
          </div>
        </div>
      </div>

      {/* Popular Tools (sticky/floating) */}
      <div id="popular-tools" className="sticky top-4 z-20 mb-8">
        <div className="flex items-center gap-3 bg-white dark:bg-primary-light rounded-lg shadow px-4 py-3 border border-slate-200 dark:border-slate-700">
          <StarIcon className="w-6 h-6 text-yellow-400" />
          <span className="text-lg font-semibold">Popular Tools</span>
          <div className="flex gap-2 flex-wrap ml-4">
            {popularTools.map(tool => (
              <Link
                key={tool.id}
                to={tool.path}
                className="flex items-center gap-2 px-3 py-1 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors font-semibold text-sm"
                title={tool.description}
                onClick={() => trackButtonClick(`popular_${tool.id}`, 'Home')}
              >
                <tool.icon className="w-4 h-4" />
                {tool.title}
                {tool.badges?.map(badge => (
                  <span key={badge} className={`ml-1 px-2 py-0.5 rounded text-xs font-bold ${getBadgeColor(badge)}`}>{badge}</span>
                ))}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tool Groups */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {toolGroups.map(group => {
          const groupTools = getGroupTools(group.id, debouncedSearch);
          if (groupTools.length === 0) return null;
          const isOpen = openGroups.includes(group.id);
          return (
            <div
              key={group.id}
              className={`rounded-lg shadow-md transition-colors bg-white dark:bg-primary-light`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-xl font-bold focus:outline-none hover:bg-accent/10 rounded-t-lg"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  <group.icon className="w-7 h-7 text-accent" />
                  {group.label} <span className="text-base font-normal text-gray-500 ml-2">({groupTools.length})</span>
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="w-6 h-6" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6 pt-2">
                      {groupTools.map(tool => (
                        <Link
                          key={tool.id}
                          to={tool.path}
                          className="tool-card flex flex-col items-start gap-2 relative group"
                          title={tool.description}
                        >
                          <div className="flex items-center gap-2">
                            <tool.icon className="w-5 h-5 text-accent" />
                            <span className="font-medium text-lg">{highlightMatch(tool.title, debouncedSearch)}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 top-full mt-1 z-10 bg-white dark:bg-slate-800 p-2 rounded shadow border border-slate-200 dark:border-slate-700 w-max max-w-xs pointer-events-none">
                            {tool.description}
                          </span>
                          <div className="flex gap-1 mt-1">
                            {tool.badges?.map(badge => (
                              <span key={badge} className={`px-2 py-0.5 rounded text-xs font-bold ${getBadgeColor(badge)}`}>{badge}</span>
                            ))}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Home; 