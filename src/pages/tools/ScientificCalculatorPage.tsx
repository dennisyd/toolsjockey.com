import React, { useState, useEffect } from 'react';
import { CalculatorIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';
import { evaluateMathExpression } from '../../utils/mathExpression';

interface Calculation {
  expression: string;
  result: string;
  timestamp: Date;
}

const ScientificCalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [angleMode, setAngleMode] = useState<'radians' | 'degrees'>('degrees');

  useEffect(() => {
    document.title = 'Scientific Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Advanced scientific calculator with mathematical functions, trigonometry, and calculation history.');
  }, []);

  const buttons = [
    // Scientific functions
    { label: 'sin', value: 'sin', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'cos', value: 'cos', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'tan', value: 'tan', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'log', value: 'log', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'ln', value: 'ln', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: '√', value: 'sqrt', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'x²', value: '^2', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'x³', value: '^3', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'xʸ', value: '^', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'π', value: 'π', className: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'e', value: 'e', className: 'bg-purple-600 hover:bg-purple-700' },
    { label: '±', value: '±', className: 'bg-gray-600 hover:bg-gray-700' },
    
    // Numbers and basic operations
    { label: '7', value: '7', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '8', value: '8', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '9', value: '9', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '÷', value: '/', className: 'bg-orange-600 hover:bg-orange-700' },
    
    { label: '4', value: '4', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '5', value: '5', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '6', value: '6', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '×', value: '*', className: 'bg-orange-600 hover:bg-orange-700' },
    
    { label: '1', value: '1', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '2', value: '2', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '3', value: '3', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '-', value: '-', className: 'bg-orange-600 hover:bg-orange-700' },
    
    { label: '0', value: '0', className: 'bg-gray-800 hover:bg-gray-700 col-span-2' },
    { label: '.', value: '.', className: 'bg-gray-800 hover:bg-gray-700' },
    { label: '+', value: '+', className: 'bg-orange-600 hover:bg-orange-700' },
    
    // Control buttons
    { label: 'C', value: 'C', className: 'bg-red-600 hover:bg-red-700' },
    { label: '⌫', value: '⌫', className: 'bg-red-600 hover:bg-red-700' },
    { label: '=', value: '=', className: 'bg-green-600 hover:bg-green-700 col-span-2' },
  ];

  const handleButtonClick = (value: string) => {
    trackButtonClick(`calc_button_${value}`, 'ScientificCalculator');
    setError(null);

    if (value === 'C') {
      setDisplay('0');
      setExpression('');
    } else if (value === '⌫') {
      if (expression.length === 1) {
        setDisplay('0');
        setExpression('');
      } else {
        const newExpression = expression.slice(0, -1);
        setExpression(newExpression);
        // Update display to show the last number or operation
        const lastNumber = newExpression.match(/(\d+\.?\d*)$/);
        setDisplay(lastNumber ? lastNumber[1] : '0');
      }
    } else if (value === '=') {
      calculateResult();
    } else if (value === '±') {
      if (display !== '0') {
        const newDisplay = display.startsWith('-') ? display.slice(1) : `-${display}`;
        setDisplay(newDisplay);
        // Update expression with the new sign
        const lastNumber = expression.match(/(\d+\.?\d*)$/);
        if (lastNumber) {
          const newExpression = expression.slice(0, -lastNumber[1].length) + newDisplay;
          setExpression(newExpression);
        }
      }
    } else {
      let newExpression = expression;
      let newDisplay = display;

      // Handle special cases
      if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(value)) {
        // Function buttons (no parenthesis)
        newExpression += value;
        newDisplay = value;
      } else if (value === 'π') {
        newExpression += Math.PI.toString();
        newDisplay = Math.PI.toString();
      } else if (value === 'e') {
        newExpression += Math.E.toString();
        newDisplay = Math.E.toString();
      } else if (value === '^2') {
        newExpression += '^2';
        newDisplay = '^2';
      } else if (value === '^3') {
        newExpression += '^3';
        newDisplay = '^3';
      } else if (value === '^') {
        newExpression += '^';
        newDisplay = '^';
      } else if (['+', '-', '*', '/', '('].includes(value)) {
        // Operators
        newExpression += value;
        newDisplay = value;
      } else if (value === ')') {
        // Closing parenthesis - special handling
        newExpression += value;
        // Don't change display immediately, let user see the full expression
        newDisplay = display;
      } else {
        // Numbers and decimal point
        if (display === '0' || ['+', '-', '*', '/', '^', '(', 'π', 'e'].includes(display)) {
          newDisplay = value;
          newExpression += value;
        } else {
          newDisplay += value;
          newExpression += value;
        }
      }

      setDisplay(newDisplay);
      setExpression(newExpression);
    }
  };

  const calculateResult = async () => {
    if (!expression) return;
    setIsCalculating(true);
    setError(null);
    try {
      const result = evaluateMathExpression(expression, { angleMode });
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid calculation');
      }
      const resultString = result.toString();
      setDisplay(resultString);
      setExpression(resultString);
      const calculation: Calculation = {
        expression: expression,
        result: resultString,
        timestamp: new Date()
      };
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
    } catch (e: any) {
      setError('Invalid expression: ' + e.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    trackButtonClick('calc_clear_history', 'ScientificCalculator');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    trackButtonClick('calc_copy_result', 'ScientificCalculator');
  };

  const loadFromHistory = (calc: Calculation) => {
    setDisplay(calc.result);
    setExpression(calc.result);
    trackButtonClick('calc_load_history', 'ScientificCalculator');
  };

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalculatorIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Scientific Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced mathematical operations with scientific functions, trigonometry, and calculation history.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Calculator</h2>
                
                {/* Angle Mode Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Angle:</span>
                  <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setAngleMode('degrees')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        angleMode === 'degrees'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      DEG
                    </button>
                    <button
                      onClick={() => setAngleMode('radians')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        angleMode === 'radians'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      RAD
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Display */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {expression || '0'}
                  </div>
                  <div className="text-2xl font-mono">
                    {isCalculating ? 'Calculating...' : display}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}

              {/* Calculator Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => handleButtonClick(button.value)}
                    disabled={isCalculating}
                    className={`${button.className} text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>

              {/* Additional Functions */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleButtonClick('(')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  (
                </button>
                <button
                  onClick={() => handleButtonClick(')')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  )
                </button>
              </div>
              
              {/* Help Text */}
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                💡 Use functions like sin, cos, tan, log, ln, sqrt with explicit parentheses: e.g. cos(45), sin(30+15). Use ( and ) for grouping.
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">History</h2>
                <button
                  onClick={clearHistory}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Clear History"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              {history.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No calculations yet
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((calc, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => loadFromHistory(calc)}
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {calc.expression}
                      </div>
                      <div className="font-mono text-lg font-semibold">
                        {calc.result}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {calc.timestamp.toLocaleTimeString()}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(calc.result);
                        }}
                        className="mt-2 text-accent hover:text-accent-dark text-xs"
                      >
                        Copy Result
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Scientific Functions</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Trigonometric functions (sin, cos, tan)</li>
              <li>• Logarithmic functions (log, ln)</li>
              <li>• Power functions (x², x³, xʸ)</li>
              <li>• Square root and constants (π, e)</li>
              <li>• Radian/Degree angle mode toggle</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Calculation History</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Save recent calculations</li>
              <li>• Click to reuse results</li>
              <li>• Copy results to clipboard</li>
              <li>• Clear history when needed</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Privacy & Performance</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• 100% client-side calculations</li>
              <li>• No data sent to servers</li>
              <li>• Instant results</li>
              <li>• Works offline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculatorPage; 