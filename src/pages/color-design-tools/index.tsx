import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';
import { Helmet } from 'react-helmet';

const COLOR_TOOLS = [
  { title: 'Color Palette Generator', path: '/tools/color-palette-generator', desc: 'Create harmonious color schemes for your designs.' },
  { title: 'Color Picker', path: '/tools/color-picker', desc: 'Pick colors from images and get color codes.' },
  { title: 'Color Format Converter', path: '/tools/color-format-converter', desc: 'Convert between HEX, RGB, HSL, and more.' },
  { title: 'Gradient Generator', path: '/tools/gradient-generator', desc: 'Create beautiful CSS gradients with ease.' },
  { title: 'Contrast Checker', path: '/tools/contrast-checker', desc: 'Test color combinations for accessibility.' },
];

const DESIGN_TOOLS = [
  { title: 'QR Code Generator', path: '/tools/qr-code-generator', desc: 'Create customizable QR codes for URLs, text, and more.' },
];

const ColorDesignToolsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Helmet>
        <title>Color & Design Tools - Free Online Color Utilities | ToolsJockey</title>
        <meta name="description" content="Free online color and design tools to generate palettes, pick colors, create gradients, and more. No installation or signup required - all processing happens in your browser." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Color & Design Tools – Create Palettes, Gradients & More</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Color Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COLOR_TOOLS.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="block p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <h3 className="font-medium text-lg text-blue-700">{tool.title}</h3>
                  <p className="text-gray-600 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Design Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DESIGN_TOOLS.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="block p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <h3 className="font-medium text-lg text-blue-700">{tool.title}</h3>
                  <p className="text-gray-600 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Why Use Our Color & Design Tools?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">Instant Results:</span> See color changes and design elements in real-time.</li>
              <li><span className="font-medium">Easy to Use:</span> Simple interfaces designed for both beginners and professionals.</li>
              <li><span className="font-medium">Free to Use:</span> All color and design tools are completely free.</li>
              <li><span className="font-medium">No Sign-up Required:</span> Start creating immediately without any registration.</li>
              <li><span className="font-medium">Works Everywhere:</span> Compatible with Windows, Mac, Linux, iOS, and Android.</li>
            </ul>
          </div>
        </div>
      </main>
      <DonationBanner />
    </div>
  );
};

export default ColorDesignToolsPage;
