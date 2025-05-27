import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const SideNavAccordion = ({ tools, currentId, title }: {
  tools: { id: string; title: string; path: string }[];
  currentId: string;
  title: string;
}) => {
  const [open, setOpen] = useState(window.innerWidth >= 768); // md+ open by default

  // Responsive: open on md+, closed on mobile
  // (Optional: useEffect to update on resize)

  return (
    <div className="mb-6">
      <button
        className="w-full flex items-center justify-between px-2 py-2 font-semibold text-left focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="side-nav-list"
      >
        <span>{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="w-5 h-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id="side-nav-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden text-sm mt-2"
          >
            {tools.map(tool => (
              <li key={tool.id}>
                <Link
                  to={tool.path}
                  className={`block rounded px-3 py-2 mb-1 transition-colors ${tool.id === currentId ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  tabIndex={0}
                >
                  {tool.title}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideNavAccordion; 