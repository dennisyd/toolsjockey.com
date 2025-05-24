import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import HeaderRotator from '../HeaderRotator';

const Header = () => {
  const { darkMode, toggleDarkMode } = useAppStore();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <header className="bg-primary text-white py-4">
      <div className="container-app flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img
            src="/toolsjockey_logo.png"
            alt="ToolsJockey Logo"
            className="h-10 w-auto drop-shadow-lg"
            style={{ maxWidth: 48 }}
          />
          <HeaderRotator />
        </Link>
        <div>
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-primary-light transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 