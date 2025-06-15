import React, { useState, useEffect } from 'react';

type UnitDef = {
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
  directConversion?: Record<string, (v: number) => number>;
};
type UnitCategory = {
  label: string;
  units: Record<string, UnitDef>;
};
type UnitsMap = Record<string, UnitCategory>;

const UNITS: UnitsMap = {
  length: {
    label: 'Length',
    units: {
      m: { 
        label: 'Meter', 
        toBase: (v: number) => v, 
        fromBase: (v: number) => v,
        directConversion: {
          ft: (v: number) => v * 3.28084,
          in: (v: number) => v * 39.3701
        }
      },
      km: { 
        label: 'Kilometer', 
        toBase: (v: number) => v * 1000, 
        fromBase: (v: number) => v / 1000,
        directConversion: {
          mi: (v: number) => v * 0.621371
        } 
      },
      cm: { 
        label: 'Centimeter', 
        toBase: (v: number) => v / 100, 
        fromBase: (v: number) => v * 100,
        directConversion: {
          in: (v: number) => v * 0.393701
        } 
      },
      mm: { 
        label: 'Millimeter', 
        toBase: (v: number) => v / 1000, 
        fromBase: (v: number) => v * 1000 
      },
      mi: { 
        label: 'Mile', 
        toBase: (v: number) => v * 1609.34, 
        fromBase: (v: number) => v / 1609.34,
        directConversion: {
          km: (v: number) => v * 1.60934,
          ft: (v: number) => v * 5280,
          yd: (v: number) => v * 1760,
          in: (v: number) => v * 63360
        } 
      },
      yd: { 
        label: 'Yard', 
        toBase: (v: number) => v * 0.9144, 
        fromBase: (v: number) => v / 0.9144,
        directConversion: {
          ft: (v: number) => v * 3,
          in: (v: number) => v * 36,
          mi: (v: number) => v / 1760
        } 
      },
      ft: { 
        label: 'Foot', 
        toBase: (v: number) => v * 0.3048, 
        fromBase: (v: number) => v / 0.3048,
        directConversion: {
          in: (v: number) => v * 12,
          yd: (v: number) => v / 3,
          mi: (v: number) => v / 5280
        } 
      },
      in: { 
        label: 'Inch', 
        toBase: (v: number) => v * 0.0254, 
        fromBase: (v: number) => v / 0.0254,
        directConversion: {
          ft: (v: number) => v / 12,
          yd: (v: number) => v / 36,
          cm: (v: number) => v * 2.54,
          mi: (v: number) => v / 63360
        } 
      },
    },
  },
  mass: {
    label: 'Mass',
    units: {
      kg: { label: 'Kilogram', toBase: (v: number) => v, fromBase: (v: number) => v },
      g: { label: 'Gram', toBase: (v: number) => v / 1000, fromBase: (v: number) => v * 1000 },
      mg: { label: 'Milligram', toBase: (v: number) => v / 1e6, fromBase: (v: number) => v * 1e6 },
      lb: { 
        label: 'Pound', 
        toBase: (v: number) => v * 0.453592, 
        fromBase: (v: number) => v / 0.453592,
        directConversion: {
          oz: (v: number) => v * 16
        }
      },
      oz: { 
        label: 'Ounce', 
        toBase: (v: number) => v * 0.0283495, 
        fromBase: (v: number) => v / 0.0283495,
        directConversion: {
          lb: (v: number) => v / 16
        } 
      },
      t: { label: 'Metric Ton', toBase: (v: number) => v * 1000, fromBase: (v: number) => v / 1000 },
    },
  },
  temperature: {
    label: 'Temperature',
    units: {
      C: { label: 'Celsius', toBase: (v: number) => v, fromBase: (v: number) => v },
      F: { label: 'Fahrenheit', toBase: (v: number) => (v - 32) * 5/9, fromBase: (v: number) => v * 9/5 + 32 },
      K: { label: 'Kelvin', toBase: (v: number) => v - 273.15, fromBase: (v: number) => v + 273.15 },
    },
  },
  volume: {
    label: 'Volume',
    units: {
      l: { label: 'Liter', toBase: (v: number) => v, fromBase: (v: number) => v },
      ml: { label: 'Milliliter', toBase: (v: number) => v / 1000, fromBase: (v: number) => v * 1000 },
      m3: { label: 'Cubic Meter', toBase: (v: number) => v * 1000, fromBase: (v: number) => v / 1000 },
      gal: { 
        label: 'Gallon (US)', 
        toBase: (v: number) => v * 3.78541, 
        fromBase: (v: number) => v / 3.78541,
        directConversion: {
          qt: (v: number) => v * 4,
          pt: (v: number) => v * 8,
          cup: (v: number) => v * 16,
          floz: (v: number) => v * 128
        }
      },
      qt: { 
        label: 'Quart (US)', 
        toBase: (v: number) => v * 0.946353, 
        fromBase: (v: number) => v / 0.946353,
        directConversion: {
          gal: (v: number) => v / 4,
          pt: (v: number) => v * 2,
          cup: (v: number) => v * 4
        }
      },
      pt: { 
        label: 'Pint (US)', 
        toBase: (v: number) => v * 0.473176, 
        fromBase: (v: number) => v / 0.473176,
        directConversion: {
          gal: (v: number) => v / 8,
          qt: (v: number) => v / 2,
          cup: (v: number) => v * 2
        }
      },
      cup: { 
        label: 'Cup (US)', 
        toBase: (v: number) => v * 0.24, 
        fromBase: (v: number) => v / 0.24,
        directConversion: {
          floz: (v: number) => v * 8
        }
      },
      floz: { 
        label: 'Fluid Ounce (US)', 
        toBase: (v: number) => v * 0.0295735, 
        fromBase: (v: number) => v / 0.0295735,
        directConversion: {
          cup: (v: number) => v / 8
        }
      },
    },
  },
  area: {
    label: 'Area',
    units: {
      m2: { label: 'Square Meter', toBase: (v: number) => v, fromBase: (v: number) => v },
      km2: { label: 'Square Kilometer', toBase: (v: number) => v * 1e6, fromBase: (v: number) => v / 1e6 },
      cm2: { label: 'Square Centimeter', toBase: (v: number) => v / 10000, fromBase: (v: number) => v * 10000 },
      mm2: { label: 'Square Millimeter', toBase: (v: number) => v / 1e6, fromBase: (v: number) => v * 1e6 },
      ha: { label: 'Hectare', toBase: (v: number) => v * 10000, fromBase: (v: number) => v / 10000 },
      ac: { 
        label: 'Acre', 
        toBase: (v: number) => v * 4046.86, 
        fromBase: (v: number) => v / 4046.86,
        directConversion: {
          ft2: (v: number) => v * 43560
        }
      },
      ft2: { 
        label: 'Square Foot', 
        toBase: (v: number) => v * 0.092903, 
        fromBase: (v: number) => v / 0.092903,
        directConversion: {
          ac: (v: number) => v / 43560,
          in2: (v: number) => v * 144
        }
      },
      in2: { 
        label: 'Square Inch', 
        toBase: (v: number) => v * 0.00064516, 
        fromBase: (v: number) => v / 0.00064516,
        directConversion: {
          ft2: (v: number) => v / 144
        }
      },
    },
  },
  speed: {
    label: 'Speed',
    units: {
      'm/s': { label: 'Meter/second', toBase: (v: number) => v, fromBase: (v: number) => v },
      'km/h': { label: 'Kilometer/hour', toBase: (v: number) => v / 3.6, fromBase: (v: number) => v * 3.6 },
      'mi/h': { 
        label: 'Mile/hour', 
        toBase: (v: number) => v * 0.44704, 
        fromBase: (v: number) => v / 0.44704,
        directConversion: {
          'ft/s': (v: number) => v * 1.46667
        }
      },
      'ft/s': { 
        label: 'Foot/second', 
        toBase: (v: number) => v * 0.3048, 
        fromBase: (v: number) => v / 0.3048,
        directConversion: {
          'mi/h': (v: number) => v * 0.681818
        }
      },
      knot: { label: 'Knot', toBase: (v: number) => v * 0.514444, fromBase: (v: number) => v / 0.514444 },
    },
  },
  time: {
    label: 'Time',
    units: {
      s: { label: 'Second', toBase: (v: number) => v, fromBase: (v: number) => v },
      min: { label: 'Minute', toBase: (v: number) => v * 60, fromBase: (v: number) => v / 60 },
      h: { label: 'Hour', toBase: (v: number) => v * 3600, fromBase: (v: number) => v / 3600 },
      d: { label: 'Day', toBase: (v: number) => v * 86400, fromBase: (v: number) => v / 86400 },
    },
  },
  digital: {
    label: 'Digital Storage',
    units: {
      b: { label: 'Byte', toBase: (v: number) => v, fromBase: (v: number) => v },
      kb: { label: 'Kilobyte', toBase: (v: number) => v * 1024, fromBase: (v: number) => v / 1024 },
      mb: { label: 'Megabyte', toBase: (v: number) => v * 1024 * 1024, fromBase: (v: number) => v / (1024 * 1024) },
      gb: { label: 'Gigabyte', toBase: (v: number) => v * 1024 * 1024 * 1024, fromBase: (v: number) => v / (1024 * 1024 * 1024) },
      tb: { label: 'Terabyte', toBase: (v: number) => v * 1024 * 1024 * 1024 * 1024, fromBase: (v: number) => v / (1024 * 1024 * 1024 * 1024) },
    },
  },
};

const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<keyof typeof UNITS>('length');
  const [from, setFrom] = useState<string>('m');
  const [to, setTo] = useState<string>('km');
  const [inputA, setInputA] = useState<string>('1');
  const [inputB, setInputB] = useState<string>('');
  const [activeInput, setActiveInput] = useState<'A' | 'B'>('A');

  // Helper function to format results with proper precision
  const formatResult = (value: number): string => {
    if (value === 0) return '0';
    
    // For exact integer conversions, don't use scientific notation
    if (Math.abs(value - Math.round(value)) < 1e-10) {
      return Math.round(value).toString();
    }
    
    // Otherwise use precision formatting for floating point values
    return parseFloat(value.toPrecision(12)).toString();
  };

  // Update inputB when inputA, from, to, or category changes
  useEffect(() => {
    if (activeInput === 'A') {
      const num = parseFloat(inputA);
      if (isNaN(num)) {
        setInputB('');
        return;
      }
      
      // Check if there's a direct conversion available
      const fromUnit = UNITS[category].units[from];
      if (fromUnit.directConversion && fromUnit.directConversion[to]) {
        const result = fromUnit.directConversion[to](num);
        setInputB(formatResult(result));
      } else {
        // Fall back to base unit conversion
        const base = fromUnit.toBase(num);
        const result = UNITS[category].units[to].fromBase(base);
        setInputB(formatResult(result));
      }
    }
    // eslint-disable-next-line
  }, [inputA, from, to, category]);

  // Update inputA when inputB changes
  useEffect(() => {
    if (activeInput === 'B') {
      const num = parseFloat(inputB);
      if (isNaN(num)) {
        setInputA('');
        return;
      }
      
      // Check if there's a direct conversion available
      const toUnit = UNITS[category].units[to];
      if (toUnit.directConversion && toUnit.directConversion[from]) {
        const result = toUnit.directConversion[from](num);
        setInputA(formatResult(result));
      } else {
        // Fall back to base unit conversion
        const base = toUnit.toBase(num);
        const result = UNITS[category].units[from].fromBase(base);
        setInputA(formatResult(result));
      }
    }
    // eslint-disable-next-line
  }, [inputB, from, to, category]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setInputA(inputB);
    setInputB(inputA);
  };

  const unitOptions = Object.entries(UNITS[category].units);

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-2 text-center">Unit Converter</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300 text-center">
        Convert between common units of length, mass, temperature, and more.
      </p>
      <hr className="mb-6" />
      <div className="flex flex-col gap-6 md:flex-row md:gap-8 items-center justify-center">
        {/* Panel A */}
        <div className="flex-1 min-w-[220px]">
          <input
            type="number"
            className="p-3 border rounded w-full text-lg mb-2"
            value={inputA}
            onChange={e => { setInputA(e.target.value); setActiveInput('A'); }}
            onFocus={() => setActiveInput('A')}
            aria-label="Input value A"
          />
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="p-2 border rounded w-full"
          >
            {unitOptions.map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        {/* Swap button */}
        <button
          className="mx-2 my-2 p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-primary-light hover:bg-accent hover:text-white transition"
          onClick={handleSwap}
          aria-label="Swap units"
          type="button"
        >
          <span className="text-xl">↔</span>
        </button>
        {/* Panel B */}
        <div className="flex-1 min-w-[220px]">
          <input
            type="number"
            className="p-3 border rounded w-full text-lg mb-2"
            value={inputB}
            onChange={e => { setInputB(e.target.value); setActiveInput('B'); }}
            onFocus={() => setActiveInput('B')}
            aria-label="Input value B"
          />
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            className="p-2 border rounded w-full"
          >
            {unitOptions.map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <select
          value={category}
          onChange={e => {
            setCategory(e.target.value as keyof typeof UNITS);
            // Reset units and values for new category
            const firstUnit = Object.keys(UNITS[e.target.value as keyof typeof UNITS].units)[0];
            setFrom(firstUnit);
            setTo(firstUnit);
            setInputA('1');
            setInputB('');
            setActiveInput('A');
          }}
          className="p-2 border rounded"
        >
          {Object.entries(UNITS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UnitConverter; 