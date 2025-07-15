import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const MENU = [
  { label: 'Home', to: '/' },
  {
    label: 'Tools',
    children: [
      { label: 'PDF Tools', to: '/pdf-tools' },
      { label: 'Excel Tools', to: '/tools/excel-merger-splitter' },
      { label: 'Color Tools', to: '/tools/color-palette-generator' },
      { label: 'Image Tools', to: '/image-tools' },
    ],
  },
  {
    label: 'Image Tools',
    children: [
      { label: 'Text from Image', to: '/tools/text-from-image' },
    ],
  },
  {
    label: 'Learn',
    children: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Blog', to: '/blog' },
      { label: 'Tutorials', to: '/tutorials' },
    ],
  },
  {
    label: 'Info',
    children: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact.html' },
      { label: 'Terms', to: '/terms' },
      { label: 'Privacy', to: '/privacy' },
    ],
  },
];

interface DropdownProps {
  label: string;
  children: React.ReactNode;
  open: string | null;
  setOpen: (open: string | null) => void;
  menuId: string;
}

const Dropdown = ({ label, children, open, setOpen, menuId }: DropdownProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') setOpen(null);
    if (e.key === 'ArrowDown' && open === label) {
      const firstItem = document.querySelector(`#${menuId} [tabindex="0"]`) as HTMLElement;
      firstItem?.focus();
    }
  };

  return (
    <div className="relative" onMouseLeave={() => setOpen(null)}>
      <button
        ref={buttonRef}
        className="px-2 py-1 rounded hover:bg-primary-light focus:bg-primary-light transition-colors flex items-center gap-1"
        aria-haspopup="menu"
        aria-expanded={open === label}
        aria-controls={menuId}
        onClick={() => setOpen(open === label ? null : label)}
        onMouseEnter={() => setOpen(label)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        type="button"
      >
        {label} <span aria-hidden>▼</span>
      </button>
      <ul
        id={menuId}
        role="menu"
        className={`absolute left-0 mt-2 min-w-[160px] bg-white dark:bg-primary-light text-primary dark:text-white rounded shadow-lg z-20 border border-gray-200 dark:border-gray-700 ${
          open === label ? '' : 'hidden'
        }`}
      >
        {children}
      </ul>
    </div>
  );
};

const GlobalMenu = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="flex gap-4 items-center" aria-label="Main menu">
      {MENU.map((item) =>
        item.children ? (
          <Dropdown
            key={item.label}
            label={item.label}
            open={openDropdown}
            setOpen={setOpenDropdown}
            menuId={`menu-${item.label.toLowerCase()}`}
          >
            {item.children.map((child) => (
              <li key={child.to} role="none">
                <Link
                  to={child.to}
                  role="menuitem"
                  tabIndex={openDropdown === item.label ? 0 : -1}
                  className="block px-4 py-2 hover:bg-accent/10 focus:bg-accent/20 transition-colors"
                  onClick={() => setOpenDropdown(null)}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </Dropdown>
        ) : (
          <Link
            key={item.label}
            to={item.to}
            className="px-2 py-1 rounded hover:bg-primary-light focus:bg-primary-light transition-colors"
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
};

export default GlobalMenu; 