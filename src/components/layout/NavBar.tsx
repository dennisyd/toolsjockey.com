import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toolsConfig } from '../../utils/toolsConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../../hooks/useAnalytics';

// Color scheme
const accent = 'text-[#ffe066]'; // Yellow for hover
const accentBg = 'bg-[#ffe066]';

// Group labels for nav
const groupLabels: Record<string, string> = {
  pdf: 'PDF Tools',
  excelcsv: 'Excel/CSV',
  image: 'Image',
  color: 'Color & Design',
  developer: 'Developer',
  word: 'Word/Docs',
  quick: 'Quick',
  converter: 'Converters',
  video: 'Video Tools',
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
          {grouped.map(([group, tools]) => (
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
                {groupLabels[group] || group}
              </button>
              <AnimatePresence>
                {open === group && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 mt-1 min-w-[520px] max-w-[98vw] bg-primary text-white shadow-xl rounded border border-primary p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 z-50"
                    onMouseEnter={() => setOpen(group)}
                    onMouseLeave={() => setOpen(null)}
                  >
                    {tools.map(tool => (
                      <Link
                        key={tool.id}
                        to={tool.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-[#ffe066] hover:text-black focus:bg-[#ffe066] focus:text-black text-base transition-colors whitespace-normal`}
                        onClick={() => trackButtonClick(`nav_${tool.id}`, 'NavBar')}
                      >
                        {tool.icon && <tool.icon className={`w-6 h-6 ${accent}`} />}
                        <span className="font-medium whitespace-normal">{tool.title}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {/* More menu */}
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-1 min-w-[220px] bg-primary text-white shadow-xl rounded border border-primary p-4 flex flex-col gap-2 z-50"
                  onMouseEnter={() => setOpen('more')}
                  onMouseLeave={() => setOpen(null)}
                >
                  {infoLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="px-2 py-2 rounded hover:bg-[#ffe066] hover:text-black focus:bg-[#ffe066] focus:text-black text-base transition-colors"
                      onClick={() => trackButtonClick(`nav_more_${link.label.toLowerCase()}`, 'NavBar')}
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
                  <div className="font-bold text-white mb-1 text-xs uppercase tracking-wide">{groupLabels[group] || group}</div>
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