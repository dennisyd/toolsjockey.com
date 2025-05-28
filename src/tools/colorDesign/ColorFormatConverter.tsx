import React, { useState } from 'react';

function parseColor(input: string, format: string) {
  input = input.trim();
  if (format === 'hex' || (/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(input))) {
    let hex = input.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  if (format === 'rgb' || input.startsWith('rgb')) {
    const m = input.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  }
  if (format === 'hsl' || input.startsWith('hsl')) {
    const m = input.match(/(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/);
    if (m) {
      let h = +m[1], s = +m[2] / 100, l = +m[3] / 100;
      let c = (1 - Math.abs(2 * l - 1)) * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1));
      let m_ = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (h < 60) [r, g, b] = [c, x, 0];
      else if (h < 120) [r, g, b] = [x, c, 0];
      else if (h < 180) [r, g, b] = [0, c, x];
      else if (h < 240) [r, g, b] = [0, x, c];
      else if (h < 300) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];
      return { r: Math.round((r + m_) * 255), g: Math.round((g + m_) * 255), b: Math.round((b + m_) * 255) };
    }
  }
  return null;
}
function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }) {
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const ColorFormatConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState('auto');
  let rgb: any = null;
  if (input) {
    if (format === 'auto') {
      if (input.startsWith('#')) rgb = parseColor(input, 'hex');
      else if (input.startsWith('rgb')) rgb = parseColor(input, 'rgb');
      else if (input.startsWith('hsl')) rgb = parseColor(input, 'hsl');
      else if (/^[a-fA-F0-9]{3,6}$/.test(input)) rgb = parseColor(input, 'hex');
    } else {
      rgb = parseColor(input, format);
    }
  }
  const hex = rgb ? rgbToHex(rgb) : '';
  const hsl = rgb ? rgbToHsl(rgb) : null;
  const rgbStr = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
  const hslStr = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '';

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-lg mx-auto p-4 bg-white dark:bg-primary-light rounded-lg shadow flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-2">HEX ↔ RGB ↔ HSL Converter</h1>
      <div className="flex flex-col gap-2">
        <label className="font-medium">Color Value</label>
        <input
          className="border rounded px-2 py-1 font-mono"
          placeholder="#3498db, rgb(52, 152, 219), hsl(204, 70%, 53%)"
          value={input}
          onChange={e => setInput(e.target.value)}
          aria-label="Color value input"
        />
        <div className="flex items-center gap-2 mt-2">
          <label className="font-medium">Format:</label>
          <select className="border rounded px-2 py-1" value={format} onChange={e => setFormat(e.target.value)} aria-label="Format selector">
            <option value="auto">Auto</option>
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
          </select>
        </div>
      </div>
      {rgb && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <span className="w-20 font-mono">HEX</span>
            <span className="bg-gray-100 px-2 py-1 rounded font-mono">{hex}</span>
            <button className="btn btn-xs btn-accent ml-2" onClick={() => copy(hex)}>Copy</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 font-mono">RGB</span>
            <span className="bg-gray-100 px-2 py-1 rounded font-mono">{rgbStr}</span>
            <button className="btn btn-xs btn-accent ml-2" onClick={() => copy(rgbStr)}>Copy</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 font-mono">HSL</span>
            <span className="bg-gray-100 px-2 py-1 rounded font-mono">{hslStr}</span>
            <button className="btn btn-xs btn-accent ml-2" onClick={() => copy(hslStr)}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorFormatConverter; 