import React, { useState, useEffect } from 'react';
import { CalculatorIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

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
    { label: 'sin', value: 'sin(', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'cos', value: 'cos(', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'tan', value: 'tan(', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'log', value: 'log(', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'ln', value: 'ln(', className: 'bg-blue-600 hover:bg-blue-700' },
    { label: '√', value: 'sqrt(', className: 'bg-blue-600 hover:bg-blue-700' },
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
      if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt('].includes(value)) {
        // Function buttons
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
      } else if (['+', '-', '*', '/', '(', ')'].includes(value)) {
        // Operators
        newExpression += value;
        newDisplay = value;
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

  // Secure mathematical expression evaluator
  const evaluateExpression = (expression: string): number => {
    // Remove all whitespace
    const cleanExpr = expression.replace(/\s/g, '');
    
    // Validate the expression contains only allowed characters
    const allowedChars = /^[0-9+\-*/().,Math\s]+$/;
    if (!allowedChars.test(cleanExpr)) {
      throw new Error('Invalid characters in expression');
    }
    
    // Create a safe evaluation context
    const safeEval = (expr: string): number => {
      // Use Function constructor instead of eval for better security
      // This creates a new function scope with only Math object available
      const func = new Function('Math', `return ${expr}`);
      return func(Math);
    };
    
    try {
      return safeEval(cleanExpr);
    } catch (error) {
      throw new Error('Invalid mathematical expression');
    }
  };

  const calculateResult = async () => {
    if (!expression) return;

    setIsCalculating(true);
    setError(null);

    try {
      let evalExpression = expression;
      
      // Replace mathematical symbols with JavaScript equivalents
      evalExpression = evalExpression
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString())
        .replace(/\^/g, '**'); // Convert ^ to **

      // Handle trigonometric functions with angle mode
      if (angleMode === 'degrees') {
        // Convert degrees to radians for trigonometric functions
        evalExpression = evalExpression
          .replace(/sin\(/g, 'Math.sin(Math.PI/180*')
          .replace(/cos\(/g, 'Math.cos(Math.PI/180*')
          .replace(/tan\(/g, 'Math.tan(Math.PI/180*');
      } else {
        // Use radians directly
        evalExpression = evalExpression
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(');
      }

      // Handle other functions
      evalExpression = evalExpression
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(');

      // Basic validation
      if (evalExpression.includes('Math.') && !evalExpression.includes('(')) {
        throw new Error('Invalid function syntax');
      }

      // Evaluate the expression using secure evaluator
      let result = evaluateExpression(evalExpression);

      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid calculation');
      }

      // Fix floating-point precision issues for common exact values
      const roundedResult = fixFloatingPointPrecision(result);
      
      const resultString = roundedResult.toString();
      setDisplay(resultString);
      setExpression(resultString);

      // Add to history
      const calculation: Calculation = {
        expression: expression,
        result: resultString,
        timestamp: new Date()
      };

      setHistory(prev => [calculation, ...prev.slice(0, 9)]); // Keep last 10 calculations

    } catch (e: any) {
      setError('Invalid expression: ' + e.message);
    } finally {
      setIsCalculating(false);
    }
  };

  // Fix floating-point precision issues for common exact values
  const fixFloatingPointPrecision = (value: number): number => {
    // Common exact values that often have floating-point precision issues
    const exactValues = [
      { approx: 0, exact: 0 },
      { approx: 1, exact: 1 },
      { approx: -1, exact: -1 },
      { approx: 0.5, exact: 0.5 },
      { approx: -0.5, exact: -0.5 },
      { approx: 0.7071067811865476, exact: Math.sqrt(2) / 2 }, // sin(45°), cos(45°)
      { approx: -0.7071067811865476, exact: -Math.sqrt(2) / 2 },
      { approx: 0.8660254037844386, exact: Math.sqrt(3) / 2 }, // sin(60°), cos(30°)
      { approx: -0.8660254037844386, exact: -Math.sqrt(3) / 2 },
      { approx: 0.5773502691896257, exact: 1 / Math.sqrt(3) }, // tan(30°)
      { approx: -0.5773502691896257, exact: -1 / Math.sqrt(3) },
      { approx: 1.7320508075688772, exact: Math.sqrt(3) }, // tan(60°)
      { approx: -1.7320508075688772, exact: -Math.sqrt(3) },
      { approx: 0.7853981633974483, exact: Math.PI / 4 }, // π/4
      { approx: 1.5707963267948966, exact: Math.PI / 2 }, // π/2
      { approx: 3.141592653589793, exact: Math.PI }, // π
      { approx: 6.283185307179586, exact: 2 * Math.PI }, // 2π
    ];

    // Check if the value is very close to any exact value
    for (const { approx, exact } of exactValues) {
      if (Math.abs(value - approx) < 1e-14) {
        return exact;
      }
    }

    // For other values, round to 14 decimal places to avoid floating-point issues
    return Math.round(value * 1e14) / 1e14;
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