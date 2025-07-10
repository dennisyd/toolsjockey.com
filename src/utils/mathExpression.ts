// Math expression evaluator for scientific calculator
// Supports +, -, *, /, ^, parentheses, and functions: sin, cos, tan, log, ln, sqrt, etc.
// Functions require explicit parentheses, e.g., cos(45)
// Supports degrees/radians mode for trig functions

export type AngleMode = 'degrees' | 'radians';

// Precision fix for trig functions to handle exact values like -1, 0, 1
function fixTrigPrecision(value: number): number {
  const epsilon = 1e-14; // Very small tolerance for floating point errors
  if (Math.abs(value) < epsilon) return 0;
  if (Math.abs(value - 1) < epsilon) return 1;
  if (Math.abs(value + 1) < epsilon) return -1;
  return value;
}

const FUNCTIONS: Record<string, (x: number, mode?: AngleMode) => number> = {
  sin: (x: number, mode?: AngleMode) => {
    const result = mode === 'degrees' ? Math.sin((x * Math.PI) / 180) : Math.sin(x);
    return fixTrigPrecision(result);
  },
  cos: (x: number, mode?: AngleMode) => {
    const result = mode === 'degrees' ? Math.cos((x * Math.PI) / 180) : Math.cos(x);
    return fixTrigPrecision(result);
  },
  tan: (x: number, mode?: AngleMode) => {
    const result = mode === 'degrees' ? Math.tan((x * Math.PI) / 180) : Math.tan(x);
    return fixTrigPrecision(result);
  },
  log: (x: number) => Math.log10(x),
  ln: (x: number) => Math.log(x),
  sqrt: (x: number) => Math.sqrt(x),
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

// Tokenizer
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === ' ' || c === '\t' || c === '\n') {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let num = c;
      while (i + 1 < expr.length && /[0-9.]/.test(expr[i + 1])) {
        num += expr[++i];
      }
      tokens.push(num);
    } else if (/[a-zA-Z_]/.test(c)) {
      let name = c;
      while (i + 1 < expr.length && /[a-zA-Z_0-9]/.test(expr[i + 1])) {
        name += expr[++i];
      }
      tokens.push(name);
    } else if ('+-*/^(),'.includes(c)) {
      tokens.push(c);
    } else {
      throw new Error(`Invalid character: ${c}`);
    }
    i++;
  }
  return tokens;
}

// Shunting Yard Algorithm to convert to Reverse Polish Notation (RPN)
function toRPN(tokens: string[]): string[] {
  const output: string[] = [];
  const stack: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
  const rightAssoc: Record<string, boolean> = { '^': true };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/^[0-9.]+$/.test(token) || token in CONSTANTS) {
      output.push(token);
    } else if (token in FUNCTIONS) {
      stack.push(token);
    } else if (token === ',') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!);
      }
      if (!stack.length) throw new Error('Misplaced comma or parentheses');
    } else if ('+-*/^'.includes(token)) {
      while (
        stack.length &&
        ((stack[stack.length - 1] in FUNCTIONS) ||
          (precedence[stack[stack.length - 1]] > precedence[token]) ||
          (precedence[stack[stack.length - 1]] === precedence[token] && !rightAssoc[token])) &&
        stack[stack.length - 1] !== '('
      ) {
        output.push(stack.pop()!);
      }
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!);
      }
      if (!stack.length) throw new Error('Unbalanced parentheses');
      stack.pop(); // Remove '('
      if (stack.length && stack[stack.length - 1] in FUNCTIONS) {
        output.push(stack.pop()!);
      }
    } else {
      throw new Error(`Unknown token: ${token}`);
    }
  }
  while (stack.length) {
    const op = stack.pop()!;
    if (op === '(' || op === ')') throw new Error('Unbalanced parentheses');
    output.push(op);
  }
  return output;
}

// RPN Evaluator
function evalRPN(rpn: string[], angleMode: AngleMode): number {
  const stack: number[] = [];
  for (const token of rpn) {
    if (/^[0-9.]+$/.test(token)) {
      stack.push(parseFloat(token));
    } else if (token in CONSTANTS) {
      stack.push(CONSTANTS[token]);
    } else if (token in FUNCTIONS) {
      if (!stack.length) throw new Error(`Missing argument for function ${token}`);
      const arg = stack.pop()!;
      if (['sin', 'cos', 'tan'].includes(token)) {
        stack.push(FUNCTIONS[token](arg, angleMode));
      } else {
        stack.push(FUNCTIONS[token](arg));
      }
    } else if ('+-*/^'.includes(token)) {
      if (stack.length < 2) throw new Error(`Missing argument for operator ${token}`);
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/': stack.push(a / b); break;
        case '^': stack.push(Math.pow(a, b)); break;
      }
    } else {
      throw new Error(`Unknown token in evaluation: ${token}`);
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

export function evaluateMathExpression(expr: string, options?: { angleMode?: AngleMode }): number {
  const angleMode = options?.angleMode || 'degrees';
  const tokens = tokenize(expr.toLowerCase().replace(/π/g, 'pi'));
  const rpn = toRPN(tokens);
  return evalRPN(rpn, angleMode);
}

/*
// Unit tests (run in a test file or console)
console.log(evaluateMathExpression('2+2*2')); // 6
console.log(evaluateMathExpression('cos(45)', { angleMode: 'degrees' })); // ~0.7071
console.log(evaluateMathExpression('sin(30+15)', { angleMode: 'degrees' })); // ~0.7071
console.log(evaluateMathExpression('tan((60-30)*2)', { angleMode: 'degrees' })); // ~1.732
console.log(evaluateMathExpression('sqrt(16)')); // 4
console.log(evaluateMathExpression('log(100)')); // 2
console.log(evaluateMathExpression('ln(e)')); // 1
console.log(evaluateMathExpression('2^3^2')); // 512
*/ 