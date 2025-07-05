import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toolsConfig } from '../../utils/toolsConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../../hooks/useAnalytics';

// Color scheme
const accent = 'text-[#ffe066]'; // Yellow for hover
const accentBg = 'bg-[#ffe066]';

// Enhanced group labels with descriptions
const groupLabels: Record<string, { label: string; description: string; icon?: string }> = {
  pdf: { 
    label: 'PDF Tools', 
    description: 'Edit, convert, and manage PDF documents',
    icon: '📄'
  },
  excelcsv: { 
    label: 'Excel/CSV', 
    description: 'Work with spreadsheets and data files',
    icon: '📊'
  },
  image: { 
    label: 'Image Tools', 
    description: 'Edit, compress, and convert images',
    icon: '🖼️'
  },
  developer: { 
    label: 'Developer Tools', 
    description: 'Code formatting, validation, and utilities',
    icon: '💻'
  },
  archive: { 
    label: 'Archive Tools', 
    description: 'Compression and archive management',
    icon: '📦'
  },
  video: { 
    label: 'Video Tools', 
    description: 'Video editing and processing',
    icon: '🎥'
  },
  calculation: { 
    label: 'Calculation Tools', 
    description: 'Advanced calculators and financial tools',
    icon: '🧮'
  },
  color: { 
    label: 'Color & Design', 
    description: 'Color tools and design utilities',
    icon: '🎨'
  },
  word: { 
    label: 'Word/Docs', 
    description: 'Document processing and conversion',
    icon: '📝'
  },
  quick: { 
    label: 'Quick Tools', 
    description: 'Fast utilities and generators',
    icon: '⚡'
  },
  converter: { 
    label: 'Converters', 
    description: 'File and format conversion tools',
    icon: '🔄'
  },
};

// Group tools by category
const grouped = Object.entries(
  toolsConfig.reduce((acc, tool) => {
    if (!acc[tool.group]) acc[tool.group] = [];
    acc[tool.group].push(tool);
    return acc;
  }, {} as Record<string, typeof toolsConfig>)
);

const infoLinks = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Blog', to: '/blog' },
  { label: 'Tutorials', to: '/tutorials' },
  { label: 'Contact', to: '/contact' },
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'About', to: '/about' },
];

const NavBar: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-3 py-1 min-h-[48px]">
        {/* Logo and Brand (left only) */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img
              src="/toolsjockey_logo.png"
              alt="ToolsJockey Logo"
              className="h-8 w-auto"
              style={{ maxWidth: 36 }}
            />
            <span className="text-lg font-extrabold tracking-tight whitespace-nowrap">ToolsJockey.com</span>
          </Link>
        </div>
        {/* Desktop Nav (center/right) */}
        <div className="hidden md:flex items-center gap-2 ml-8 flex-1 justify-end">
          {/* Main visible categories */}
          {grouped
            .filter(([group]) => ['pdf', 'excelcsv', 'image', 'developer', 'archive', 'video', 'calculation'].includes(group))
            .map(([group, tools]) => (
            <div key={group} className="relative">
              <button
                className={`px-3 py-1 rounded font-semibold text-sm hover:text-[#ffe066] focus:text-[#ffe066] transition-colors`}
                aria-haspopup="true"
                aria-expanded={open === group}
                onMouseEnter={() => setOpen(group)}
                onMouseLeave={() => setOpen(null)}
                onFocus={() => setOpen(group)}
                onBlur={() => setOpen(null)}
              >
                {groupLabels[group]?.label || group}
              </button>
              <AnimatePresence>
                {open === group && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-[500px] max-w-[90vw] bg-primary text-white shadow-2xl rounded-lg border border-gray-700 overflow-hidden z-50"
                    onMouseEnter={() => setOpen(group)}
                    onMouseLeave={() => setOpen(null)}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 border-b border-gray-600">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{groupLabels[group]?.icon || '📁'}</span>
                        <div>
                          <h3 className="text-lg font-bold text-white">{groupLabels[group]?.label || group}</h3>
                          <p className="text-sm text-gray-300">{groupLabels[group]?.description || 'Tools and utilities'}</p>
                        </div>
                      </div>
                    </div>
                    {/* Tools Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tools.map(tool => (
                          <Link
                            key={tool.id}
                            to={tool.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#ffe066] hover:text-black focus:bg-[#ffe066] focus:text-black text-sm transition-all duration-200 group`}
                            onClick={() => trackButtonClick(`nav_${tool.id}`, 'NavBar')}
                          >
                            {tool.icon && (
                              <tool.icon className={`w-5 h-5 ${accent} group-hover:text-black transition-colors`} />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{tool.title}</div>
                              {tool.description && (
                                <div className="text-xs text-gray-400 group-hover:text-gray-600 truncate">
                                  {tool.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      {/* Footer */}
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <Link
                          to={`/${group}-tools`}
                          className="text-sm text-[#ffe066] hover:text-white transition-colors flex items-center gap-1"
                          onClick={() => trackButtonClick(`nav_view_all_${group}`, 'NavBar')}
                        >
                          View all {groupLabels[group]?.label || group} →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {/* More menu with additional categories */}
          <div className="relative">
            <button
              className={`px-3 py-1 rounded font-semibold text-sm hover:text-[#ffe066] focus:text-[#ffe066] transition-colors`}
              aria-haspopup="true"
              aria-expanded={open === 'more'}
              onMouseEnter={() => setOpen('more')}
              onMouseLeave={() => setOpen(null)}
              onFocus={() => setOpen('more')}
              onBlur={() => setOpen(null)}
            >
              More
            </button>
            <AnimatePresence>
              {open === 'more' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-[500px] max-w-[90vw] bg-primary text-white shadow-2xl rounded-lg border border-gray-700 overflow-hidden z-50"
                  onMouseEnter={() => setOpen('more')}
                  onMouseLeave={() => setOpen(null)}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📚</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">More Tools</h3>
                        <p className="text-sm text-gray-300">Additional categories and utilities</p>
                      </div>
                    </div>
                  </div>
                  {/* Categories Grid */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {grouped
                        .filter(([group]) => ['color', 'word', 'quick', 'converter'].includes(group))
                        .map(([group, tools]) => (
                        <div key={group} className="p-3 rounded-lg hover:bg-gray-700 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{groupLabels[group]?.icon || '📁'}</span>
                            <h4 className="font-semibold text-white">{groupLabels[group]?.label || group}</h4>
                          </div>
                          <p className="text-xs text-gray-300 mb-3">{groupLabels[group]?.description || 'Tools and utilities'}</p>
                          <div className="space-y-1">
                            {tools.slice(0, 3).map(tool => (
                              <Link
                                key={tool.id}
                                to={tool.path}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#ffe066] hover:text-black focus:bg-[#ffe066] focus:text-black text-xs transition-all duration-200 group`}
                                onClick={() => trackButtonClick(`nav_more_${tool.id}`, 'NavBar')}
                              >
                                {tool.icon && (
                                  <tool.icon className={`w-4 h-4 ${accent} group-hover:text-black transition-colors`} />
                                )}
                                <span className="truncate">{tool.title}</span>
                              </Link>
                            ))}
                            {tools.length > 3 && (
                              <Link
                                to={`/${group}-tools`}
                                className="text-xs text-[#ffe066] hover:text-white transition-colors block px-2 py-1"
                                onClick={() => trackButtonClick(`nav_more_view_all_${group}`, 'NavBar')}
                              >
                                +{tools.length - 3} more tools →
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <Link
                        to="/all-tools"
                        className="text-sm text-[#ffe066] hover:text-white transition-colors flex items-center gap-1"
                        onClick={() => trackButtonClick(`nav_more_view_all`, 'NavBar')}
                      >
                        View all tools →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Info links */}
          <div className="relative">
            <button
              className={`px-3 py-1 rounded font-semibold text-sm hover:text-[#ffe066] focus:text-[#ffe066] transition-colors`}
              aria-haspopup="true"
              aria-expanded={open === 'info'}
              onMouseEnter={() => setOpen('info')}
              onMouseLeave={() => setOpen(null)}
              onFocus={() => setOpen('info')}
              onBlur={() => setOpen(null)}
            >
              Info
            </button>
            <AnimatePresence>
              {open === 'info' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-1 min-w-[220px] bg-primary text-white shadow-xl rounded-lg border border-gray-700 p-4 flex flex-col gap-2 z-50"
                  onMouseEnter={() => setOpen('info')}
                  onMouseLeave={() => setOpen(null)}
                >
                  {infoLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="px-2 py-2 rounded hover:bg-[#ffe066] hover:text-black focus:bg-[#ffe066] focus:text-black text-base transition-colors"
                      onClick={() => trackButtonClick(`nav_info_${link.label.toLowerCase()}`, 'NavBar')}
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1 rounded hover:bg-primary ml-2"
          aria-label="Open menu"
          onClick={() => setMobileOpen(v => !v)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 flex"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="bg-primary text-white w-64 h-full p-4 flex flex-col gap-4 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <Link to="/" className={`font-extrabold text-lg ${accent} mb-2 flex items-center gap-2`}>
                <img src="/toolsjockey_logo.png" alt="ToolsJockey Logo" className="h-7 w-auto" style={{ maxWidth: 32 }} />
                ToolsJockey.com
              </Link>
              {grouped.map(([group, tools]) => (
                <div key={group}>
                  <div className="font-bold text-white mb-1 text-xs uppercase tracking-wide flex items-center gap-1">
                    <span>{groupLabels[group]?.icon || '📁'}</span>
                    {groupLabels[group]?.label || group}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {tools.map(tool => (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className={`flex items-center gap-2 px-2 py-1 rounded hover:${accentBg} hover:text-black focus:${accentBg} focus:text-black text-sm`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {tool.icon && <tool.icon className={`w-4 h-4 ${accent}`} />}
                        <span className="font-medium truncate">{tool.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar; 