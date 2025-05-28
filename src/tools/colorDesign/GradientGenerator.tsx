import React, { useState } from 'react';

const directions = [
  { label: 'Left → Right', value: 'to right' },
  { label: 'Top → Bottom', value: 'to bottom' },
  { label: 'Top Left → Bottom Right', value: 'to bottom right' },
  { label: 'Top Right → Bottom Left', value: 'to bottom left' },
  { label: 'Custom Angle', value: 'angle' },
];

const GradientGenerator: React.FC = () => {
  const [colors, setColors] = useState(['#ff6b6b', '#3498db']);
  const [direction, setDirection] = useState('to right');
  const [angle, setAngle] = useState(90);

  const handleColorChange = (idx: number, val: string) => {
    setColors(c => c.map((col, i) => (i === idx ? val : col)));
  };
  const addColor = () => setColors(c => [...c, '#888888']);
  const removeColor = (idx: number) => setColors(c => c.length > 2 ? c.filter((_, i) => i !== idx) : c);

  const gradientCSS = direction === 'angle'
    ? `linear-gradient(${angle}deg, ${colors.join(', ')})`
    : `linear-gradient(${direction}, ${colors.join(', ')})`;

  const copy = () => navigator.clipboard.writeText(`background: ${gradientCSS};`);

  return (
    <div className="max-w-lg mx-auto p-4 bg-white dark:bg-primary-light rounded-lg shadow flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-2">Gradient Generator</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          {colors.map((color, i) => (
            <div key={i} className="flex items-center gap-1">
              <input type="color" value={color} onChange={e => handleColorChange(i, e.target.value)} aria-label={`Color ${i+1}`} />
              {colors.length > 2 && (
                <button className="btn btn-xs btn-error" onClick={() => removeColor(i)} aria-label="Remove color">×</button>
              )}
            </div>
          ))}
          <button className="btn btn-xs btn-accent" onClick={addColor} aria-label="Add color">+ Add</button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="font-medium">Direction:</label>
          <select
            className="border rounded px-2 py-1"
            value={direction}
            onChange={e => setDirection(e.target.value)}
            aria-label="Gradient direction"
          >
            {directions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          {direction === 'angle' && (
            <input
              type="number"
              min={0}
              max={360}
              value={angle}
              onChange={e => setAngle(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20 ml-2"
              aria-label="Custom angle"
            />
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <div
          className="w-full h-24 rounded-lg border-2 border-gray-300"
          style={{ background: gradientCSS }}
          aria-label="Gradient preview"
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="font-mono text-xs">background: {gradientCSS};</span>
        <button className="btn btn-xs btn-accent" onClick={copy}>Copy CSS</button>
      </div>
    </div>
  );
};

export default GradientGenerator; 