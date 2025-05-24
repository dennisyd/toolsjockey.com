const Footer = () => {
  return (
    <footer className="bg-primary text-white py-4 mt-auto">
      <div className="container-app text-center">
        <p>© {new Date().getFullYear()} ToolsJockey.com - All rights reserved</p>
        <p className="text-sm mt-2">Enhance, compress, generate palettes, and more with tool tips and progress shown. No signup needed!</p>
      </div>
    </footer>
  );
};

export default Footer; 