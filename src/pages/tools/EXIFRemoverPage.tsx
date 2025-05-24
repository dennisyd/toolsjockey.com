import { useEffect } from 'react';
import EXIFRemover from '../../components/tools/EXIFRemover';
import { Link } from 'react-router-dom';

const related = [
  { title: 'Image Format Converter', path: '/tools/image-format-converter' },
  { title: 'Image Compressor', path: '/tools/image-compressor' },
  { title: 'Watermark Adder', path: '/tools/watermark-adder' },
];

const EXIFRemoverPage = () => {
  useEffect(() => {
    document.title = 'EXIF Data Remover - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Breadcrumb */}
      <div className="md:col-span-12 mb-2 text-sm text-gray-500">
        <Link to="/">Home</Link> &gt; <span>Image Tools</span> &gt; <b>EXIF Data Remover</b>
      </div>
      {/* Sidebar */}
      <div className="hidden md:block md:col-span-3">
        <div className="bg-white dark:bg-primary-light rounded-lg p-4 mb-6">
          <div className="font-semibold mb-2">Other tools in this category</div>
          <ul className="text-sm space-y-1">
            <li><Link to="/tools/image-sharpener" className="hover:underline">Image Upscaler</Link></li>
            <li><Link to="/tools/image-compressor" className="hover:underline">Image Compressor</Link></li>
            <li><Link to="/tools/image-format-converter" className="hover:underline">Image Format Converter</Link></li>
            <li><Link to="/tools/watermark-adder" className="hover:underline">Watermark Adder</Link></li>
          </ul>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-4">
          <div className="font-semibold mb-2">Related tools</div>
          <ul className="text-sm space-y-1">
            {related.map(t => (
              <li key={t.path}><Link to={t.path} className="hover:underline">{t.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      {/* Main Content */}
      <div className="md:col-span-6">
        <EXIFRemover />
      </div>
    </div>
  );
};

export default EXIFRemoverPage; 