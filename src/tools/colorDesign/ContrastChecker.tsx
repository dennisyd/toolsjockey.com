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
function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrastRatio(l1: number, l2: number) {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function wcagRating(ratio: number) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

const ContrastChecker: React.FC = () => {
  const [fg, setFg] = useState('#222222');
  const [bg, setBg] = useState('#ffffff');
  const [showWcagInfo, setShowWcagInfo] = useState(false);
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const l1 = luminance(fgRgb);
  const l2 = luminance(bgRgb);
  const ratio = contrastRatio(l1, l2);
  const rating = wcagRating(ratio);

  return (
    <div className="max-w-lg mx-auto p-4 bg-white dark:bg-primary-light rounded-lg shadow flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-2">Contrast Checker</h1>
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <label className="flex items-center gap-2">
          <span className="font-medium">Text Color</span>
          <input type="color" value={fg} onChange={e => setFg(e.target.value)} aria-label="Text color" />
        </label>
        <label className="flex items-center gap-2">
          <span className="font-medium">Background</span>
          <input type="color" value={bg} onChange={e => setBg(e.target.value)} aria-label="Background color" />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono">Contrast Ratio:</span>
          <span className="font-bold">{ratio.toFixed(2)} : 1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">WCAG:</span>
          <span className={`font-bold ${rating === 'Fail' ? 'text-red-600' : rating === 'AA Large' ? 'text-yellow-600' : 'text-green-600'}`}>
            {rating}
          </span>
          <button 
            onClick={() => setShowWcagInfo(!showWcagInfo)}
            className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Learn more about WCAG"
          >
            {showWcagInfo ? 'Hide Info' : 'What is this?'}
          </button>
        </div>

        {showWcagInfo && (
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <h3 className="font-bold mb-1">About WCAG Contrast Standards</h3>
            <p className="mb-2">
              WCAG (Web Content Accessibility Guidelines) defines minimum contrast standards to ensure text is readable by people with visual impairments:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li><span className="font-bold text-green-600">AAA</span>: Highest level (7:1+ ratio) - Excellent accessibility</li>
              <li><span className="font-bold text-green-600">AA</span>: Standard level (4.5:1+ ratio) - Good accessibility, legal requirement in many countries</li>
              <li><span className="font-bold text-yellow-600">AA Large</span>: For large text only (3:1+ ratio) - Minimum for large headings (18pt+)</li>
              <li><span className="font-bold text-red-600">Fail</span>: Below minimum standards - May be difficult to read for many users</li>
            </ul>
            <p>
              Insufficient contrast can make your content unreadable for users with low vision, color blindness, or when viewing screens in bright environments.
            </p>
            {rating === 'Fail' && (
              <p className="mt-2 text-red-600 font-semibold">
                Current combination fails accessibility standards. Try increasing contrast by using a darker text on a lighter background (or vice versa).
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col items-center">
        <div
          className="w-full max-w-xs h-20 flex items-center justify-center rounded-lg border-2 border-gray-300 text-lg font-semibold"
          style={{ background: bg, color: fg }}
          aria-label="Contrast preview"
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>
    </div>
  );
};

export default ContrastChecker; 