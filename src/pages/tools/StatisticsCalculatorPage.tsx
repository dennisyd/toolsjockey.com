import React, { useState, useEffect } from 'react';
import { ChartBarIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

interface StatisticsCalculation {
  data: number[];
  mean: number;
  median: number;
  mode: number[];
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  timestamp: Date;
}

const StatisticsCalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [dataInput, setDataInput] = useState('');
  const [results, setResults] = useState<Partial<StatisticsCalculation> | null>(null);
  const [history, setHistory] = useState<StatisticsCalculation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Statistics Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Mean, median, standard deviation, and statistical analysis.');
  }, []);

  const calculateStatistics = () => {
    if (!dataInput.trim()) {
      setError('Please enter data values');
      return;
    }

    try {
      const data = dataInput.split(/[,\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      
      if (data.length === 0) {
        throw new Error('No valid numbers found');
      }

      // Sort data for calculations
      const sortedData = [...data].sort((a, b) => a - b);
      
      // Mean
      const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
      
      // Median
      const median = sortedData.length % 2 === 0 
        ? (sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2
        : sortedData[Math.floor(sortedData.length / 2)];
      
      // Mode
      const frequency: { [key: number]: number } = {};
      data.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      const mode = Object.keys(frequency).filter(key => frequency[parseFloat(key)] === maxFreq).map(Number);
      
      // Variance and Standard Deviation
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
      const stdDev = Math.sqrt(variance);
      
      // Min, Max, Range
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min;

      const calculation: StatisticsCalculation = {
        data,
        mean,
        median,
        mode,
        stdDev,
        variance,
        min,
        max,
        range,
        timestamp: new Date()
      };

      setResults(calculation);
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('stats_calc_calculate', 'StatisticsCalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChartBarIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Statistics Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Mean, median, standard deviation, and statistical analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data Values</label>
                <textarea
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent h-24"
                  placeholder="Enter numbers separated by commas or spaces (e.g., 1, 2, 3, 4, 5)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter numbers separated by commas, spaces, or new lines
                </p>
              </div>

              <button
                onClick={calculateStatistics}
                className="w-full bg-accent hover:bg-accent-dark text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CalculatorIcon className="w-5 h-5" />
                Calculate Statistics
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {results && (
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">Results:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Count:</span>
                      <span className="font-mono ml-2">{results.data?.length}</span>
                    </div>
                    <div>
                      <span className="font-medium">Mean:</span>
                      <span className="font-mono ml-2">{results.mean?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Median:</span>
                      <span className="font-mono ml-2">{results.median?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Mode:</span>
                      <span className="font-mono ml-2">{results.mode?.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-medium">Std Dev:</span>
                      <span className="font-mono ml-2">{results.stdDev?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Variance:</span>
                      <span className="font-mono ml-2">{results.variance?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Min:</span>
                      <span className="font-mono ml-2">{results.min}</span>
                    </div>
                    <div>
                      <span className="font-medium">Max:</span>
                      <span className="font-mono ml-2">{results.max}</span>
                    </div>
                    <div>
                      <span className="font-medium">Range:</span>
                      <span className="font-mono ml-2">{results.range}</span>
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
                      {calc.data.length} values
                    </div>
                    <div className="font-mono text-xs space-y-1">
                      <div>Mean: {calc.mean.toFixed(2)}</div>
                      <div>Median: {calc.median.toFixed(2)}</div>
                      <div>Std Dev: {calc.stdDev.toFixed(2)}</div>
                      <div className="text-green-600 dark:text-green-400">
                        Range: {calc.min} - {calc.max}
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
            <h3 className="text-lg font-semibold mb-3">Statistical Measures</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Mean (average)</li>
              <li>• Median (middle value)</li>
              <li>• Mode (most frequent)</li>
              <li>• Standard deviation</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Data Analysis</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Variance calculation</li>
              <li>• Range and spread</li>
              <li>• Min/max values</li>
              <li>• Data distribution</li>
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

export default StatisticsCalculatorPage; 