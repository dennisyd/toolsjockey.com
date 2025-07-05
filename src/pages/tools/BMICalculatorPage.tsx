import React, { useState, useEffect } from 'react';
import { HeartIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

interface BMICalculation {
  weight: number;
  height: number;
  bmi: number;
  category: string;
  timestamp: Date;
  weightUnit?: 'kg' | 'lbs';
  heightUnit?: 'cm' | 'in';
}

const BMICalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('lbs');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('in');
  const [bmi, setBmi] = useState('');
  const [category, setCategory] = useState('');
  const [history, setHistory] = useState<BMICalculation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'BMI Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Health and fitness calculations including BMI and body metrics.');
  }, []);

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obese (Class I)';
    if (bmi < 40) return 'Obese (Class II)';
    return 'Obese (Class III)';
  };

  const calculateBMI = () => {
    if (!weight || !height) {
      setError('Please enter both weight and height');
      return;
    }

    try {
      let w = parseFloat(weight);
      let h = parseFloat(height);

      if (w <= 0 || h <= 0) {
        throw new Error('Weight and height must be positive');
      }

      // Convert units if needed
      if (weightUnit === 'lbs') {
        w = w / 2.20462;
      }
      if (heightUnit === 'in') {
        h = h * 2.54;
      }

      if (w > 1000 || h > 300) {
        throw new Error('Please enter realistic values');
      }

      // BMI = weight (kg) / height (m)²
      const bmiValue = w / Math.pow(h / 100, 2);
      const bmiCategory = getBMICategory(bmiValue);

      setBmi(bmiValue.toFixed(1));
      setCategory(bmiCategory);

      const calculation: BMICalculation = {
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: bmiValue,
        category: bmiCategory,
        timestamp: new Date(),
        weightUnit,
        heightUnit
      } as any;
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('bmi_calc_calculate', 'BMICalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HeartIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">BMI Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Health and fitness calculations including BMI and body metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">BMI Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Weight</label>
                <div className="flex gap-2 mb-2">
                  <button
                    className={`px-3 py-1 rounded-l-lg border ${weightUnit === 'kg' ? 'bg-accent text-white border-accent' : 'bg-white dark:bg-primary-light border-gray-300 dark:border-gray-600'}`}
                    onClick={() => setWeightUnit('kg')}
                    type="button"
                  >
                    kg
                  </button>
                  <button
                    className={`px-3 py-1 rounded-r-lg border-l-0 border ${weightUnit === 'lbs' ? 'bg-accent text-white border-accent' : 'bg-white dark:bg-primary-light border-gray-300 dark:border-gray-600'}`}
                    onClick={() => setWeightUnit('lbs')}
                    type="button"
                  >
                    lbs
                  </button>
                </div>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={`Enter weight in ${weightUnit}`}
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Height</label>
                <div className="flex gap-2 mb-2">
                  <button
                    className={`px-3 py-1 rounded-l-lg border ${heightUnit === 'cm' ? 'bg-accent text-white border-accent' : 'bg-white dark:bg-primary-light border-gray-300 dark:border-gray-600'}`}
                    onClick={() => setHeightUnit('cm')}
                    type="button"
                  >
                    cm
                  </button>
                  <button
                    className={`px-3 py-1 rounded-r-lg border-l-0 border ${heightUnit === 'in' ? 'bg-accent text-white border-accent' : 'bg-white dark:bg-primary-light border-gray-300 dark:border-gray-600'}`}
                    onClick={() => setHeightUnit('in')}
                    type="button"
                  >
                    inches
                  </button>
                </div>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder={`Enter height in ${heightUnit}`}
                  step="0.1"
                />
              </div>

              <button
                onClick={calculateBMI}
                className="w-full bg-accent hover:bg-accent-dark text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CalculatorIcon className="w-5 h-5" />
                Calculate BMI
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {(bmi || category) && (
              <div className="mt-6 space-y-3">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Results:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>BMI:</span>
                      <span className="font-mono font-semibold">{bmi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-semibold">{category}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">BMI Categories:</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Underweight:</span>
                      <span>&lt; 18.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Normal weight:</span>
                      <span>18.5 - 24.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overweight:</span>
                      <span>25.0 - 29.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Obese:</span>
                      <span>≥ 30.0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Calculation History</h2>
            
            {history.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No calculations yet
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((calc, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {calc.weight}{calc.weightUnit || 'kg'}, {calc.height}{calc.heightUnit || 'cm'}
                    </div>
                    <div className="font-mono text-sm space-y-1">
                      <div>BMI: {calc.bmi.toFixed(1)}</div>
                      <div className="text-green-600 dark:text-green-400">
                        Category: {calc.category}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {calc.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">BMI Calculation</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Body Mass Index calculation</li>
              <li>• Weight and height input</li>
              <li>• BMI category classification</li>
              <li>• Health assessment tool</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Health Monitoring</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Track BMI changes</li>
              <li>• Monitor health goals</li>
              <li>• Understand weight categories</li>
              <li>• Health awareness</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Privacy & Features</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• 100% client-side calculations</li>
              <li>• No data sent to servers</li>
              <li>• Calculation history</li>
              <li>• Works offline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculatorPage; 