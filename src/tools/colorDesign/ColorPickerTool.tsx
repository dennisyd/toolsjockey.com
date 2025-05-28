import React, { useState } from 'react';

function hexToRgb(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
    l: Math.round(l * 100),
  };
}

const ColorPickerTool: React.FC = () => {
  const [color, setColor] = useState('#3498db');
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white dark:bg-primary-light rounded-lg shadow flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-2">Color Picker</h1>
      <label className="flex items-center gap-4">
        <span className="font-medium">Pick a color:</span>
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="w-12 h-12 border-2 border-gray-300 rounded cursor-pointer"
          aria-label="Pick a color"
        />
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-20 font-mono">HEX</span>
          <span className="bg-gray-100 px-2 py-1 rounded font-mono">{color}</span>
          <button className="btn btn-xs btn-accent ml-2" onClick={() => copy(color)}>Copy</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 font-mono">RGB</span>
          <span className="bg-gray-100 px-2 py-1 rounded font-mono">{rgbStr}</span>
          <button className="btn btn-xs btn-accent ml-2" onClick={() => copy(rgbStr)}>Copy</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 font-mono">HSL</span>
          <span className="bg-gray-100 px-2 py-1 rounded font-mono">{hslStr}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <div className="w-32 h-32 rounded-lg border-2 border-gray-300" style={{ background: color }} aria-label="Color preview" />
      </div>
    </div>
  );
};

export default ColorPickerTool; 