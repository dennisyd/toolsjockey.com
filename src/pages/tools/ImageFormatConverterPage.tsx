import { useEffect } from 'react';
import ImageFormatConverter from '../../components/tools/ImageFormatConverter';
import { Link } from 'react-router-dom';

const related = [
  { title: 'Image Compressor', path: '/tools/image-compressor' },
  { title: 'EXIF Data Remover', path: '/tools/exif-remover' },
  { title: 'Watermark Adder', path: '/tools/watermark-adder' },
];

const ImageFormatConverterPage = () => {
  useEffect(() => {
    document.title = 'Image Format Converter - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Breadcrumb */}
      <div className="md:col-span-12 mb-2 text-sm text-gray-500">
        <Link to="/">Home</Link> &gt; <span>Image Tools</span> &gt; <b>Image Format Converter</b>
      </div>
      {/* Sidebar */}
      <div className="hidden md:block md:col-span-3">
        <div className="bg-white dark:bg-primary-light rounded-lg p-4 mb-6">
          <div className="font-semibold mb-2">Other tools in this category</div>
          <ul className="text-sm space-y-1">
            <li><Link to="/tools/image-sharpener" className="hover:underline">Image Upscaler</Link></li>
            <li><Link to="/tools/image-compressor" className="hover:underline">Image Compressor</Link></li>
            <li><Link to="/tools/exif-remover" className="hover:underline">EXIF Data Remover</Link></li>
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
        <ImageFormatConverter />
      </div>
    </div>
  );
};

export default ImageFormatConverterPage; 