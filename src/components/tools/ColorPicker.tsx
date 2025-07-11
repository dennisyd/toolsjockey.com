import React, { useState } from 'react';
import { Palette, Copy } from 'lucide-react';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name: string;
}

const ColorPicker: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<Color>({
    hex: '#3498db',
    rgb: { r: 52, g: 152, b: 219 },
    hsl: { h: 204, s: 70, l: 53 },
    name: 'Blue'
  });
  const [palette, setPalette] = useState<Color[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Color names for common colors
  const colorNames: { [key: string]: string } = {
    '#ff0000': 'Red',
    '#00ff00': 'Green', 
    '#0000ff': 'Blue',
    '#ffff00': 'Yellow',
    '#ff00ff': 'Magenta',
    '#00ffff': 'Cyan',
    '#000000': 'Black',
    '#ffffff': 'White',
    '#808080': 'Gray',
    '#ffa500': 'Orange',
    '#800080': 'Purple',
    '#008000': 'Dark Green',
    '#ffc0cb': 'Pink',
    '#a52a2a': 'Brown',
    '#3498db': 'Blue',
    '#e74c3c': 'Red',
    '#2ecc71': 'Green',
    '#f39c12': 'Orange',
    '#9b59b6': 'Purple',
    '#1abc9c': 'Teal'
  };

  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Update color when hex changes
  const updateColor = (hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const name = colorNames[hex.toLowerCase()] || 'Custom';
    
    setSelectedColor({ hex, rgb, hsl, name });
  };

  // Add color to palette
  const addToPalette = () => {
    if (!palette.find(c => c.hex === selectedColor.hex)) {
      setPalette([...palette, selectedColor]);
    }
  };

  // Remove color from palette
  const removeFromPalette = (index: number) => {
    setPalette(palette.filter((_, i) => i !== index));
  };

  // Copy color value
  const copyColor = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate complementary colors
  const generatePalette = () => {
    const colors: Color[] = [];
    const baseHsl = selectedColor.hsl;
    
    // Complementary
    const compHsl = { ...baseHsl, h: (baseHsl.h + 180) % 360 };
    const compRgb = hslToRgb(compHsl.h, compHsl.s, compHsl.l);
    colors.push({
      hex: `#${compRgb.r.toString(16).padStart(2, '0')}${compRgb.g.toString(16).padStart(2, '0')}${compRgb.b.toString(16).padStart(2, '0')}`,
      rgb: compRgb,
      hsl: compHsl,
      name: 'Complementary'
    });

    // Triadic
    const triadic1 = { ...baseHsl, h: (baseHsl.h + 120) % 360 };
    const triadic2 = { ...baseHsl, h: (baseHsl.h + 240) % 360 };
    const tri1Rgb = hslToRgb(triadic1.h, triadic1.s, triadic1.l);
    const tri2Rgb = hslToRgb(triadic2.h, triadic2.s, triadic2.l);
    
    colors.push({
      hex: `#${tri1Rgb.r.toString(16).padStart(2, '0')}${tri1Rgb.g.toString(16).padStart(2, '0')}${tri1Rgb.b.toString(16).padStart(2, '0')}`,
      rgb: tri1Rgb,
      hsl: triadic1,
      name: 'Triadic 1'
    });
    
    colors.push({
      hex: `#${tri2Rgb.r.toString(16).padStart(2, '0')}${tri2Rgb.g.toString(16).padStart(2, '0')}${tri2Rgb.b.toString(16).padStart(2, '0')}`,
      rgb: tri2Rgb,
      hsl: triadic2,
      name: 'Triadic 2'
    });

    setPalette(colors);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-primary-light rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Color Picker</h2>
        <p className="text-gray-600 dark:text-gray-300">Pick colors, convert formats, and create palettes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Picker Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Color
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={selectedColor.hex}
                onChange={(e) => updateColor(e.target.value)}
                className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedColor.hex}
                  onChange={(e) => updateColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Preview
            </label>
            <div 
              className="w-full h-32 rounded-lg border-2 border-gray-300 flex items-center justify-center"
              style={{ backgroundColor: selectedColor.hex }}
            >
              <span className={`text-lg font-semibold ${selectedColor.hsl.l > 50 ? 'text-black' : 'text-white'}`}>
                {selectedColor.name}
              </span>
            </div>
          </div>

          {/* Color Values */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Values
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium">HEX:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono">{selectedColor.hex}</span>
                  <button
                    onClick={() => copyColor(selectedColor.hex)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium">RGB:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono">
                    {selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}
                  </span>
                  <button
                    onClick={() => copyColor(`rgb(${selectedColor.rgb.r}, ${selectedColor.rgb.g}, ${selectedColor.rgb.b})`)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium">HSL:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono">
                    {selectedColor.hsl.h}°, {selectedColor.hsl.s}%, {selectedColor.hsl.l}%
                  </span>
                  <button
                    onClick={() => copyColor(`hsl(${selectedColor.hsl.h}, ${selectedColor.hsl.s}%, ${selectedColor.hsl.l}%)`)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={addToPalette}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Palette size={16} />
              <span>Add to Palette</span>
            </button>
            <button
              onClick={generatePalette}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Palette size={16} />
              <span>Generate Palette</span>
            </button>
          </div>
        </div>

        {/* Palette Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Palette
            </label>
            {palette.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Palette size={48} className="mx-auto mb-2 opacity-50" />
                <p>No colors in palette yet</p>
                <p className="text-sm">Add colors or generate a palette</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedColor(color)}
                  >
                    <div
                      className="h-20 rounded-lg border-2 border-gray-300 flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                    >
                      <span className={`text-sm font-semibold ${color.hsl.l > 50 ? 'text-black' : 'text-white'}`}>
                        {color.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPalette(index);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export Palette */}
          {palette.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Palette
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const css = palette.map(color => `--${color.name.toLowerCase().replace(/\s+/g, '-')}: ${color.hex};`).join('\n');
                    copyColor(css);
                  }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Copy CSS Variables
                </button>
                <button
                  onClick={() => {
                    const json = JSON.stringify(palette, null, 2);
                    copyColor(json);
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Copy JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy Notification */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          Copied: {copied}
        </div>
      )}
    </div>
  );
};

export default ColorPicker; 