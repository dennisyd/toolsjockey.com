import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-6 mt-auto">
      <div className="container-app text-center flex flex-col items-center gap-2">
        <nav className="mb-2 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/faq" className="hover:underline">FAQ</Link>
          <Link to="/blog" className="hover:underline">Blog</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
        </nav>
        <p>© {new Date().getFullYear()} ToolsJockey.com - All rights reserved</p>
        <p className="text-xs mt-1 opacity-80">Enhance, compress, generate palettes, and more with tool tips and progress shown. No signup needed!</p>
      </div>
    </footer>
  );
};

export default Footer; 