import React, { useState } from 'react';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const AMBIGUOUS = 'O0l1I|`o';

function getRandomChar(str: string) {
  const idx = Math.floor(Math.random() * str.length);
  return str[idx];
}

function generatePassword(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
  noAmbiguous: boolean;
}): string {
  let chars = '';
  if (opts.lower) chars += LOWER;
  if (opts.upper) chars += UPPER;
  if (opts.numbers) chars += NUMBERS;
  if (opts.symbols) chars += SYMBOLS;
  if (opts.noAmbiguous) chars = chars.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
  if (!chars) return '';
  let pwd = '';
  for (let i = 0; i < opts.length; ++i) {
    pwd += getRandomChar(chars);
  }
  return pwd;
}

function getStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [password, setPassword] = useState('');

  const regenerate = () => {
    setPassword(generatePassword({ length, lower, upper, numbers, symbols, noAmbiguous }));
  };

  React.useEffect(() => {
    regenerate();
    // eslint-disable-next-line
  }, [length, lower, upper, numbers, symbols, noAmbiguous]);

  const strength = getStrength(password);
  const strengthLabel = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][strength] || 'Very Weak';
  const strengthColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'][strength] || 'bg-red-400';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-medium">Password Length: {length}</label>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={e => setLength(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={lower} onChange={e => setLower(e.target.checked)} />
            Lowercase
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={upper} onChange={e => setUpper(e.target.checked)} />
            Uppercase
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={numbers} onChange={e => setNumbers(e.target.checked)} />
            Numbers
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={symbols} onChange={e => setSymbols(e.target.checked)} />
            Symbols
          </label>
          <label className="flex items-center gap-2 col-span-2">
            <input type="checkbox" checked={noAmbiguous} onChange={e => setNoAmbiguous(e.target.checked)} />
            Avoid ambiguous characters (O, 0, l, 1, etc)
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-medium">Generated Password</label>
        <div className="flex gap-2 items-center">
          <input
            className="p-2 border rounded w-full font-mono text-lg bg-slate-50 dark:bg-slate-800"
            value={password}
            readOnly
            spellCheck={false}
            onFocus={e => e.target.select()}
          />
          <button
            className="btn btn-primary"
            onClick={() => { navigator.clipboard.writeText(password); }}
            disabled={!password}
          >Copy</button>
          <button
            className="btn btn-secondary"
            onClick={regenerate}
          >Regenerate</button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className={`h-2 w-24 rounded ${strengthColor}`}></div>
          <span className="text-xs text-gray-600 dark:text-gray-300">{strengthLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator; 