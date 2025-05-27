import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  BoltIcon,
  CodeBracketIcon,
  ArrowsRightLeftIcon,
  StarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Tool metadata for categories
type ToolMeta = {
  id: string;
  title: string;
  path: string;
  description?: string;
  new?: boolean;
  popular?: boolean;
};

type ToolCategory = {
  id: string;
  label: string;
  tools: ToolMeta[];
};

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'pdf',
    label: '📄 PDF Tools',
    tools: [
      {
        id: 'pdf-suite-dashboard',
        title: 'PDF Suite (All PDF Tools)',
        path: '/pdf-tools',
        description: 'Access all PDF utilities: merge, split, compress, convert, and more.',
        new: true,
      },
      {
        id: 'batch-pdf-form-filler',
        title: 'Batch PDF Form Filler',
        path: '/tools/batch-pdf-form-filler',
      },
      // { id: 'pdf-splitter', title: 'PDF Splitter', path: '/tools/pdf-splitter' },
      // { id: 'pdf-compressor', title: 'PDF Compressor', path: '/tools/pdf-compressor' },
    ],
  },
  {
    id: 'word',
    label: '📝 Word & Document Tools',
    tools: [
      {
        id: 'word-to-markdown',
        title: 'Word to Markdown Converter',
        path: '/tools/word-to-markdown',
        new: true,
      },
      // { id: 'word-combiner', title: 'Word Combiner', path: '/tools/word-combiner' },
      // { id: 'resume-formatter', title: 'Resume Formatter', path: '/tools/resume-formatter' },
    ],
  },
  {
    id: 'excelcsv',
    label: '📊 Excel & CSV Tools',
    tools: [
      {
        id: 'excel-joiner',
        title: 'Excel Sheet Joiner',
        path: '/tools/excel-merger-splitter',
        popular: true,
      },
      {
        id: 'excel-splitter',
        title: 'Excel Sheet Splitter',
        path: '/tools/excel-merger-splitter',
      },
      {
        id: 'csv-to-json',
        title: 'CSV to JSON Converter',
        path: '/tools/csv-to-json',
        new: true,
      },
      {
        id: 'csv-merger',
        title: 'CSV Merger',
        path: '/tools/csv-merger',
      },
    ],
  },
  {
    id: 'image',
    label: '🖼️ Image Tools',
    tools: [
      {
        id: 'image-sharpener',
        title: 'Image Upscaler',
        path: '/tools/image-sharpener',
        popular: true,
      },
      {
        id: 'image-format-converter',
        title: 'Image Format Converter',
        path: '/tools/image-format-converter',
      },
      {
        id: 'image-compressor',
        title: 'Image Compressor',
        path: '/tools/image-compressor',
      },
      {
        id: 'watermark-adder',
        title: 'Watermark Adder',
        path: '/tools/watermark-adder',
      },
      // { id: 'image-color-picker', title: 'Image Color Picker', path: '/tools/image-color-picker' },
    ],
  },
  {
    id: 'color',
    label: '🎨 Color & Design Tools',
    tools: [
      {
        id: 'color-palette-generator',
        title: 'Color Palette Extractor',
        path: '/tools/color-palette-generator',
      },
      // { id: 'image-color-picker', title: 'Image Color Picker', path: '/tools/image-color-picker' },
    ],
  },
  {
    id: 'developer',
    label: '⚙️ Developer Tools',
    tools: [
      {
        id: 'json-formatter',
        title: 'JSON Formatter/Validator',
        path: '/tools/json-formatter',
      },
      {
        id: 'hash-generator',
        title: 'Hash Generator (MD5, SHA256)',
        path: '/tools/hash-generator',
      },
      {
        id: 'css-minifier',
        title: 'CSS Minifier',
        path: '/tools/css-minifier',
      },
      {
        id: 'base64-encoder',
        title: 'Base64 Encoder/Decoder',
        path: '/tools/base64-encoder',
      },
    ],
  },
  {
    id: 'quick',
    label: '🔑 Quick Utilities',
    tools: [
      {
        id: 'qr-code-generator',
        title: 'QR Code Generator',
        path: '/tools/qr-code-generator',
        popular: true,
      },
      {
        id: 'password-generator',
        title: 'Password Generator',
        path: '/tools/password-generator',
      },
      {
        id: 'text-case-converter',
        title: 'Text Case Converter',
        path: '/tools/text-case-converter',
      },
      // { id: 'word-counter', title: 'Word/Character Counter', path: '/tools/word-counter' },
    ],
  },
  {
    id: 'converter',
    label: '🌍 Converters',
    tools: [
      {
        id: 'unit-converter',
        title: 'Unit Converter',
        path: '/tools/unit-converter',
      },
      {
        id: 'currency-converter',
        title: 'Currency Converter',
        path: '/tools/currency-converter',
      },
    ],
  },
];

const CATEGORY_ICONS: Record<string, any> = {
  document: DocumentDuplicateIcon,
  image: PhotoIcon,
  quick: BoltIcon,
  developer: CodeBracketIcon,
  converter: ArrowsRightLeftIcon,
};

const Home = () => {
  const { recentlyUsedTools } = useAppStore();
  const [search, setSearch] = useState('');
  const [openSections, setOpenSections] = useState(() => TOOL_CATEGORIES.map(cat => cat.id));
  const searchRef = useRef<HTMLInputElement>(null);

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

  // Filter tools by search
  const filterTools = (tools: any[]) =>
    tools.filter(tool =>
      tool.title.toLowerCase().includes(search.toLowerCase())
    );

  // Toggle section open/close
  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // --- HEADER ---
  // (Moved here for clarity, but should be in layout/Header.tsx in a real app)
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
      {/* Hero Section */}
      <section className="mt-10 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Supercharged Multi-Tool Web App</h1>
        <p className="text-gray-500 dark:text-gray-300 mb-6">All your favorite tools, grouped for productivity.</p>
        <div className="flex justify-center w-full">
          <div className="relative w-full max-w-xl mx-auto">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search tools... (Press / to focus)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Search tools"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Popular Tools (order-1 on mobile) */}
      <section className="mb-8 order-1">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <StarIcon className="w-6 h-6 text-yellow-400" /> Popular Tools
        </h2>
        <div className="flex flex-wrap gap-4">
          {(TOOL_CATEGORIES.flatMap(cat => cat.tools) as ToolMeta[])
            .filter(tool => tool.popular)
            .map(tool => (
              <Link
                key={tool.id}
                to={tool.path}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors font-semibold"
              >
                {tool.title}
              </Link>
            ))}
        </div>
      </section>

      {/* Recently Used (order-2 on mobile) */}
      {recentlyUsedTools.length > 0 && (
        <section className="mb-8 order-2">
          <h2 className="text-2xl font-semibold mb-4">Recently Used</h2>
          <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
            {recentlyUsedTools.map(toolId => {
              const tool = (TOOL_CATEGORIES.flatMap(cat => cat.tools) as ToolMeta[]).find(t => t.id === toolId);
              if (!tool) return null;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="px-4 py-2 font-medium border border-slate-300/60 dark:border-slate-500/60 rounded-md bg-secondary-dark dark:bg-primary-light hover:bg-secondary dark:hover:bg-primary transition-colors whitespace-nowrap"
                >
                  {tool.title}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Tool Categories (order-3 on mobile) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 order-3">
        {TOOL_CATEGORIES.map((category, idx) => {
          const filtered = filterTools(category.tools);
          if (filtered.length === 0) return null;
          const isOpen = openSections.includes(category.id);
          const Icon = CATEGORY_ICONS[category.id];
          return (
            <div
              key={category.id}
              className={`rounded-lg shadow-md transition-colors ${idx % 2 === 1 ? 'odd:bg-slate-50/40 dark:odd:bg-slate-800/40' : ''} bg-white dark:bg-primary-light`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-xl font-bold focus:outline-none hover:bg-accent/10 rounded-t-lg"
                onClick={() => toggleSection(category.id)}
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  {Icon && <Icon className="w-7 h-7 text-accent" />}
                  {category.label}
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
                      {filtered.map(tool => (
                        <Link
                          key={tool.id}
                          to={tool.path}
                          className="tool-card flex flex-col items-start gap-2 relative"
                        >
                          <span className="font-medium text-lg">{tool.title}</span>
                          {tool.description && <span className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</span>}
                          {tool.new && <span className="text-xs text-green-600 bg-green-100 rounded px-2 py-0.5 absolute top-2 right-2">NEW</span>}
                          {tool.popular && <span className="text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-0.5 absolute top-2 right-2">POPULAR</span>}
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

      {/* Promo Bar */}
      <div className="mt-10 bg-slate-100 dark:bg-slate-700 rounded-lg p-6 text-gray-900 dark:text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="text-xl font-semibold">Try the new Word to Markdown Converter!</h3>
            <p className="text-sm mt-1">
              Convert .docx to Markdown instantly, right in your browser. No signup needed!
            </p>
          </div>
        </div>
        <Link to="/tools/word-to-markdown" className="btn-primary ml-auto whitespace-nowrap">Try Now →</Link>
      </div>
    </div>
  );
};

export default Home; 