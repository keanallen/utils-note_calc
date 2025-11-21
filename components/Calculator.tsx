
import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { CloseIcon } from './icons';

type CalculatorType = 'basic' | 'scientific' | 'programmer';

interface HistoryEntry {
  id: number;
  expression: string;
  result: string;
  timestamp: Date;
}

const formatNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // If it's not a valid number, return original string
  if (isNaN(num)) return String(value);
  
  // If it's a whole number, show without decimal places
  if (Number.isInteger(num)) {
    return num.toLocaleString('en-US');
  }
  
  // For decimal numbers, format with comma separators but preserve decimal precision
  // Remove trailing zeros after decimal point
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 10
  });
  
  return formatted;
};

const formatDisplayNumber = (value: string): string => {
  // Don't format if it ends with a decimal point or is being typed
  if (value.endsWith('.') || value === '' || value === '0') {
    return value;
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  
  return formatNumber(num);
};

const formatExpression = (expr: string): string => {
  // Split expression by operators while preserving them and spaces
  const parts = expr.split(/(\s*[+\-\*\/×÷]\s*)/);
  
  return parts.map(part => {
    const trimmed = part.trim();
    
    // If it's empty, a space, or an operator, handle operator display conversion
    if (trimmed === '' || ['+', '-', '*', '/', '×', '÷'].includes(trimmed)) {
      // Convert internal operators to display operators
      if (trimmed === '*') return part.replace('*', '×');
      if (trimmed === '/') return part.replace('/', '÷');
      return part;
    }
    
    // If it looks like a number (including formatted numbers with commas), format it
    const cleanNumber = trimmed.replace(/,/g, '');
    const num = parseFloat(cleanNumber);
    
    if (!isNaN(num) && cleanNumber !== '') {
      return formatNumber(num);
    }
    
    // Return the original part if it's not a recognizable number
    return part;
  }).join('');
};

interface CalculatorProps {
  id: number;
  isActive: boolean;
  onClose: (id: number) => void;
  onSetActive: (id: number) => void;
  onRegisterRef: (id: number, ref: any) => void;
  onUnregisterRef: (id: number) => void;
  onCalculationResult?: (result: string) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ 
  id, 
  isActive, 
  onClose, 
  onSetActive, 
  onRegisterRef, 
  onUnregisterRef,
  onCalculationResult
}) => {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState<number | null>(0);
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(true);
  const [showingOperator, setShowingOperator] = useState(false);
  const [expression, setExpression] = useState('');
  const [currentInput, setCurrentInput] = useState('0');
  const [showingResult, setShowingResult] = useState(false);
  const [resultFormula, setResultFormula] = useState('');
  const [isFormattedResult, setIsFormattedResult] = useState(false);
  const [calculatorType, setCalculatorType] = useState<CalculatorType>('basic');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [memoryVisible, setMemoryVisible] = useState<boolean>(false);
  const [lastAnswer, setLastAnswer] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const displayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll display to the right when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Scroll the text container to show the latest input
      if (textRef.current) {
        const element = textRef.current;
        element.scrollLeft = element.scrollWidth;
      }
      
      // Also try scrolling the main display as fallback
      if (displayRef.current) {
        const element = displayRef.current;
        element.scrollLeft = element.scrollWidth;
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [display]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (historyRef.current && !historyRef.current.contains(target)) {
        setHistoryOpen(false);
      }
    };

    if (dropdownOpen || historyOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen, historyOpen]);

  const calculate = (val1: number, val2: number, op: string): number => {
    switch (op) {
      case '+': return val1 + val2;
      case '-': return val1 - val2;
      case '*': return val1 * val2;
      case '/': return val2 === 0 ? Infinity : val1 / val2;
      case '^': return Math.pow(val1, val2);
      case 'mod': return val1 % val2;
      case 'AND': return val1 & val2;
      case 'OR': return val1 | val2;
      case 'XOR': return val1 ^ val2;
      default: return val2;
    }
  };

  const handleScientificFunction = useCallback((func: string) => {
    const currentVal = parseFloat(currentInput.replace(/,/g, ''));
    let result: number;
    let hasError = false;
    
    // Validate input for domain-restricted functions
    if (func === 'asin' || func === 'acos') {
      if (currentVal < -1 || currentVal > 1) {
        hasError = true;
      }
    } else if (func === 'log' || func === 'ln') {
      if (currentVal <= 0) {
        hasError = true;
      }
    } else if (func === 'sqrt') {
      if (currentVal < 0) {
        hasError = true;
      }
    } else if (func === 'x!' && (currentVal < 0 || !Number.isInteger(currentVal) || currentVal > 170)) {
      // Factorial is undefined for negative numbers, non-integers, and large numbers (170! ≈ Infinity)
      hasError = true;
    }
    
    if (!hasError) {
      switch (func) {
        case 'sin': 
          result = angleMode === 'deg' ? Math.sin(currentVal * Math.PI / 180) : Math.sin(currentVal);
          break;
        case 'cos': 
          result = angleMode === 'deg' ? Math.cos(currentVal * Math.PI / 180) : Math.cos(currentVal);
          break;
        case 'tan': 
          result = angleMode === 'deg' ? Math.tan(currentVal * Math.PI / 180) : Math.tan(currentVal);
          break;
        case 'asin': 
          result = angleMode === 'deg' ? Math.asin(currentVal) * 180 / Math.PI : Math.asin(currentVal);
          break;
        case 'acos': 
          result = angleMode === 'deg' ? Math.acos(currentVal) * 180 / Math.PI : Math.acos(currentVal);
          break;
        case 'atan': 
          result = angleMode === 'deg' ? Math.atan(currentVal) * 180 / Math.PI : Math.atan(currentVal);
          break;
        case 'log': result = Math.log10(currentVal); break;
        case 'ln': result = Math.log(currentVal); break;
        case 'sqrt': result = Math.sqrt(currentVal); break;
        case 'x²': result = currentVal * currentVal; break;
        case 'x³': result = currentVal * currentVal * currentVal; break;
        case '1/x': 
          result = currentVal === 0 ? Infinity : 1 / currentVal;
          break;
        case 'e^x': result = Math.exp(currentVal); break;
        case '10^x': result = Math.pow(10, currentVal); break;
        case 'π': result = Math.PI; break;
        case 'e': result = Math.E; break;
        case 'x!': 
          // Factorial function with proper validation
          if (currentVal === 0 || currentVal === 1) {
            result = 1;
          } else {
            result = 1;
            for (let i = 2; i <= currentVal; i++) {
              result *= i;
            }
          }
          break;
        case 'Rnd':
          result = Math.random();
          break;
        default: return;
      }
    }
    
    // Handle error cases
    if (hasError || isNaN(result!)) {
      setDisplay('Error');
      setCurrentInput('0');
      setShowingResult(true);
      setExpression('');
      setResultFormula('Math Error');
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      setIsFormattedResult(false);
      return;
    }
    
    // Handle infinity cases
    if (!isFinite(result!)) {
      setDisplay('∞');
      setCurrentInput(String(result));
      setShowingResult(true);
      setExpression('');
      setResultFormula(`${func}(${formatNumber(currentVal)})`);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      setIsFormattedResult(false);
      return;
    }
    
    const formattedResult = formatNumber(result!);
    const formula = `${func}(${formatNumber(currentVal)})`;
    
    // Add to history
    const historyEntry: HistoryEntry = {
      id: Date.now(),
      expression: formula,
      result: formattedResult,
      timestamp: new Date()
    };
    setHistory(prev => [historyEntry, ...prev]);
    
    // Trigger auto-insert if enabled
    if (onCalculationResult) {
      onCalculationResult(formattedResult);
    }
    
    setCurrentInput(String(result));
    setDisplay(formattedResult);
    setShowingResult(true);
    setExpression('');
    setResultFormula(formula);
    setLastAnswer(result!); // Store for Ans button
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setIsFormattedResult(true);
  }, [currentInput, angleMode, onCalculationResult]);

  const handleSpecialFunction = useCallback((func: string) => {
    switch (func) {
      case 'Ans':
        // Insert last answer
        const formattedAnswer = formatNumber(lastAnswer);
        setCurrentInput(String(lastAnswer));
        if (showingResult) {
          setDisplay(formattedAnswer);
          setShowingResult(false);
          setResultFormula('');
          setExpression('');
        } else if (expression === '') {
          setDisplay(formattedAnswer);
        } else {
          const formattedExpression = formatExpression(expression.trim());
          setDisplay(formattedExpression + ' ' + formattedAnswer);
        }
        setWaitingForOperand(false);
        setIsFormattedResult(true);
        break;
      
      case 'EXP':
        // Scientific notation (multiply by 10^x)
        if (!waitingForOperand) {
          const newInput = currentInput + 'E';
          setCurrentInput(newInput);
          if (expression === '') {
            setDisplay(newInput);
          } else {
            const formattedExpression = formatExpression(expression.trim());
            setDisplay(formattedExpression + ' ' + newInput);
          }
        }
        break;
    }
  }, [lastAnswer, currentInput, showingResult, expression, waitingForOperand]);

  const handleMemoryFunction = useCallback((func: string) => {
    const currentVal = parseFloat(currentInput.replace(/,/g, ''));
    
    switch (func) {
      case 'MC': // Memory Clear
        setMemoryValue(0);
        setMemoryVisible(false);
        break;
      case 'MR': // Memory Recall
        if (memoryValue !== 0) {
          const formattedResult = formatNumber(memoryValue);
          setCurrentInput(String(memoryValue));
          setDisplay(formattedResult);
          setShowingResult(true);
          setExpression('');
          setResultFormula('');
          setPreviousValue(null);
          setOperator(null);
          setWaitingForOperand(true);
          setIsFormattedResult(true);
        }
        break;
      case 'MS': // Memory Store
        setMemoryValue(currentVal);
        setMemoryVisible(true);
        break;
      case 'M+': // Memory Plus
        setMemoryValue(memoryValue + currentVal);
        setMemoryVisible(true);
        break;
      case 'M-': // Memory Minus
        setMemoryValue(memoryValue - currentVal);
        setMemoryVisible(true);
        break;
    }
  }, [currentInput, memoryValue]);

  const handleFractionFunction = useCallback((func: string) => {
    const currentVal = parseFloat(currentInput.replace(/,/g, ''));
    let result: number;
    
    switch (func) {
      case 'a/b': 
        // Convert decimal to fraction (simplified implementation)
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const decimalPlaces = (currentVal.toString().split('.')[1] || '').length;
        const denominator = Math.pow(10, decimalPlaces);
        const numerator = currentVal * denominator;
        const divisor = gcd(Math.abs(numerator), denominator);
        const simplifiedNum = numerator / divisor;
        const simplifiedDen = denominator / divisor;
        
        result = currentVal;
        setResultFormula(`${simplifiedNum}/${simplifiedDen}`);
        break;
      case '1/x': 
        result = 1 / currentVal;
        break;
      default: 
        return;
    }
    
    const formattedResult = formatNumber(result);
    let formula: string;
    if (func === 'a/b') {
      // Convert decimal to fraction for display
      const decimalPlaces = (currentVal.toString().split('.')[1] || '').length;
      const denominator = Math.pow(10, decimalPlaces);
      const numerator = currentVal * denominator;
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(Math.abs(numerator), denominator);
      const simplifiedNum = numerator / divisor;
      const simplifiedDen = denominator / divisor;
      formula = `${simplifiedNum}/${simplifiedDen}`;
      setResultFormula(formula);
    } else {
      formula = `${func}(${formatNumber(currentVal)})`;
      setResultFormula(formula);
    }
    
    // Add to history
    const historyEntry: HistoryEntry = {
      id: Date.now(),
      expression: formula,
      result: formattedResult,
      timestamp: new Date()
    };
    setHistory(prev => [historyEntry, ...prev]);
    
    // Trigger auto-insert if enabled
    if (onCalculationResult) {
      onCalculationResult(formattedResult);
    }
    
    setCurrentInput(String(result));
    setDisplay(formattedResult);
    setShowingResult(true);
    setExpression('');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setIsFormattedResult(true);
  }, [currentInput, onCalculationResult]);

  const handleProgrammerFunction = useCallback((func: string) => {
    // For hex inputs, parse as base 16, otherwise base 10
    const hasHexDigits = /[A-F]/i.test(currentInput);
    const currentVal = hasHexDigits ? 
      parseInt(currentInput.replace(/,/g, ''), 16) : 
      parseInt(currentInput.replace(/,/g, ''), 10);
    let result: number;
    
    switch (func) {
      case 'AND': 
        // For binary operations, if we have a previous value and operator, use them
        if (previousValue !== null && operator === 'AND') {
          result = previousValue & currentVal;
          setResultFormula(`${previousValue} AND ${currentVal}`);
        } else {
          // Otherwise, set up for binary operation
          setPreviousValue(currentVal);
          setOperator('AND');
          setWaitingForOperand(true);
          setShowingOperator(true);
          setDisplay(formatNumber(currentVal) + ' AND ');
          return;
        }
        break;
      case 'OR': 
        if (previousValue !== null && operator === 'OR') {
          result = previousValue | currentVal;
          setResultFormula(`${previousValue} OR ${currentVal}`);
        } else {
          setPreviousValue(currentVal);
          setOperator('OR');
          setWaitingForOperand(true);
          setShowingOperator(true);
          setDisplay(formatNumber(currentVal) + ' OR ');
          return;
        }
        break;
      case 'XOR': 
        if (previousValue !== null && operator === 'XOR') {
          result = previousValue ^ currentVal;
          setResultFormula(`${previousValue} XOR ${currentVal}`);
        } else {
          setPreviousValue(currentVal);
          setOperator('XOR');
          setWaitingForOperand(true);
          setShowingOperator(true);
          setDisplay(formatNumber(currentVal) + ' XOR ');
          return;
        }
        break;
      case 'NOT': 
        // NOT is a unary operation
        result = ~currentVal;
        setResultFormula(`NOT(${currentVal})`);
        break;
      case 'LSH': 
        // Left shift by 1
        result = currentVal << 1;
        setResultFormula(`${currentVal} << 1`);
        break;
      case 'RSH': 
        // Right shift by 1
        result = currentVal >> 1;
        setResultFormula(`${currentVal} >> 1`);
        break;
      default: return;
    }
    
    const formattedResult = formatNumber(result);
    
    // Add to history for programmer operations
    const historyEntry: HistoryEntry = {
      id: Date.now(),
      expression: resultFormula, // Already set above for each case
      result: formattedResult,
      timestamp: new Date()
    };
    setHistory(prev => [historyEntry, ...prev]);
    
    // Trigger auto-insert if enabled
    if (onCalculationResult) {
      onCalculationResult(formattedResult);
    }
    
    setCurrentInput(String(result));
    setDisplay(formattedResult);
    setShowingResult(true);
    setExpression('');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setIsFormattedResult(true);
  }, [currentInput, previousValue, operator, onCalculationResult]);

  const handleDigit = useCallback((digit: string) => {
    // For programmer calculator, only allow hex digits when appropriate
    if (calculatorType === 'programmer' && ['A', 'B', 'C', 'D', 'E', 'F'].includes(digit.toUpperCase())) {
      digit = digit.toUpperCase();
    }
    
    if (showingResult) {
      // Start fresh after showing result
      setCurrentInput(digit);
      setDisplay(digit);
      setExpression('');
      setShowingResult(false);
      setResultFormula('');
      setWaitingForOperand(false);
      setShowingOperator(false);
      setIsFormattedResult(false);
    } else if (waitingForOperand || showingOperator) {
      setCurrentInput(digit);
      if (expression === '') {
        // Starting fresh
        setDisplay(digit);
      } else {
        // After operator - format the previous expression and show current digit
        const formattedExpression = formatExpression(expression.slice(0, -3)); // Remove " + " part
        setDisplay(formattedExpression + ' ' + expression.slice(-3) + digit); // Add back operator and new digit
      }
      setWaitingForOperand(false);
      setShowingOperator(false);
      setIsFormattedResult(false);
    } else {
      const newInput = currentInput === '0' ? digit : currentInput + digit;
      setCurrentInput(newInput);
      const formattedInput = calculatorType === 'programmer' ? newInput : formatDisplayNumber(newInput);
      if (expression === '') {
        setDisplay(formattedInput);
      } else {
        // Format the existing expression but keep current input unformatted while typing
        const formattedExpression = formatExpression(expression.slice(0, -3)); // Remove " + " part
        setDisplay(formattedExpression + ' ' + expression.slice(-3) + formattedInput);
      }
      setIsFormattedResult(false);
    }
  }, [expression, currentInput, waitingForOperand, showingOperator, showingResult, calculatorType]);

  const handleDecimal = useCallback(() => {
    if (showingResult) {
      // Start fresh with decimal after showing result
      setCurrentInput('0.');
      setDisplay('0.');
      setExpression('');
      setShowingResult(false);
      setResultFormula('');
      setWaitingForOperand(false);
      setShowingOperator(false);
      setIsFormattedResult(false);
    } else if (showingOperator || waitingForOperand) {
      setCurrentInput('0.');
      if (expression === '') {
        setDisplay('0.');
      } else {
        const formattedExpression = formatExpression(expression.slice(0, -3));
        setDisplay(formattedExpression + ' ' + expression.slice(-3) + '0.');
      }
      setWaitingForOperand(false);
      setShowingOperator(false);
      setIsFormattedResult(false);
    } else if (!currentInput.includes('.')) {
      const newInput = currentInput + '.';
      setCurrentInput(newInput);
      if (expression === '') {
        setDisplay(newInput);
      } else {
        const formattedExpression = formatExpression(expression.slice(0, -3));
        setDisplay(formattedExpression + ' ' + expression.slice(-3) + newInput);
      }
      setIsFormattedResult(false);
    }
  }, [expression, currentInput, showingOperator, waitingForOperand, showingResult]);

  const handleOperator = useCallback((nextOperator: string) => {
    if (showingResult) {
      // Continue from result - use raw value for calculation, formatted for display
      const rawValue = parseFloat(currentInput.replace(/,/g, ''));
      const formattedInput = formatNumber(rawValue);
      setExpression(String(rawValue) + ' ' + nextOperator + ' ');
      setDisplay(formattedInput + ' ' + nextOperator + ' ');
      setPreviousValue(rawValue);
      setShowingResult(false);
      setResultFormula('');
    } else {
      const inputValue = parseFloat(currentInput.replace(/,/g, ''));
      
      if (operator && previousValue !== null && !waitingForOperand) {
        const result = calculate(previousValue, inputValue, operator);
        const formattedResult = formatNumber(result);
        const newExpression = expression + String(inputValue) + ' ' + nextOperator + ' ';
        setExpression(newExpression);
        
        // Format the display version
        const formattedExpression = formatExpression(expression + String(inputValue));
        setDisplay(formattedExpression + ' ' + nextOperator + ' ');
        
        setPreviousValue(result);
        setCurrentInput(String(result));
      } else {
        const newExpression = expression + String(inputValue) + ' ' + nextOperator + ' ';
        setExpression(newExpression);
        
        // Format for display
        const formattedInput = formatNumber(inputValue);
        const currentDisplay = expression ? formatExpression(expression) + formattedInput : formattedInput;
        setDisplay(currentDisplay + ' ' + nextOperator + ' ');
        
        setPreviousValue(inputValue);
      }
    }
    
    setWaitingForOperand(true);
    setOperator(nextOperator);
    setShowingOperator(true);
    setIsFormattedResult(false);
  }, [expression, currentInput, operator, previousValue, waitingForOperand, showingResult]);
  
  const handleEquals = useCallback(() => {
    const inputValue = parseFloat(currentInput.replace(/,/g, ''));
    
    // Validate inputs to prevent NaN results
    if (isNaN(inputValue) || !operator || previousValue === null || isNaN(previousValue)) {
      return; // Don't proceed with invalid state
    }
    
    const result = calculate(previousValue, inputValue, operator);
    
    // Check if result is valid
    if (isNaN(result)) {
      setDisplay('Error');
      setCurrentInput('0');
      setShowingResult(true);
      setExpression('');
      setResultFormula('Math Error');
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      setShowingOperator(false);
      setIsFormattedResult(false);
      return;
    }
    
    const formattedResult = formatNumber(result);
    
    // Create formatted formula for display
    const rawFormula = expression + String(inputValue);
    const formattedFormula = formatExpression(rawFormula);
    
    // Add to history
    const historyEntry: HistoryEntry = {
      id: Date.now(),
      expression: formattedFormula,
      result: formattedResult,
      timestamp: new Date()
    };
    setHistory(prev => [historyEntry, ...prev]);
    
    // Trigger auto-insert if enabled
    if (onCalculationResult) {
      onCalculationResult(formattedResult);
    }
    
    setResultFormula(formattedFormula);
    setDisplay(formattedResult);
    setShowingResult(true);
    setExpression('');
    setCurrentInput(String(result)); // Store raw result for further calculations
    setLastAnswer(result); // Store for Ans button
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setShowingOperator(false);
    setIsFormattedResult(true);
  }, [expression, currentInput, operator, previousValue, onCalculationResult]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setCurrentValue(0);
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(true);
    setShowingOperator(false);
    setExpression('');
    setCurrentInput('0');
    setShowingResult(false);
    setResultFormula('');
    setIsFormattedResult(false);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryOpen(false);
  }, []);

  const useHistoryEntry = useCallback((entry: HistoryEntry) => {
    // Parse the result number and set it as current input
    const resultValue = parseFloat(entry.result.replace(/,/g, ''));
    if (!isNaN(resultValue)) {
      setCurrentInput(String(resultValue));
      setDisplay(entry.result);
      setShowingResult(false);
      setExpression('');
      setResultFormula('');
      setWaitingForOperand(false);
      setIsFormattedResult(true);
    }
    setHistoryOpen(false);
  }, []);

  const handlePlusMinus = useCallback(() => {
    const rawValue = parseFloat(currentInput.replace(/,/g, ''));
    const newValue = rawValue * -1;
    const newInput = formatNumber(newValue);
    setCurrentInput(newInput);
    if (showingResult) {
      setDisplay(newInput);
      setShowingResult(false);
      setResultFormula('');
      setExpression('');
    } else if (expression === '') {
      setDisplay(newInput);
    } else {
      const formattedExpression = formatExpression(expression.trim());
      setDisplay(formattedExpression + ' ' + newInput);
    }
    setIsFormattedResult(true);
  }, [expression, currentInput, showingResult]);

  const handlePercent = useCallback(() => {
    const rawValue = parseFloat(currentInput.replace(/,/g, ''));
    const newValue = rawValue / 100;
    const newInput = formatNumber(newValue);
    setCurrentInput(newInput);
    if (showingResult) {
      setDisplay(newInput);
      setShowingResult(false);
      setResultFormula('');
      setExpression('');
    } else if (expression === '') {
      setDisplay(newInput);
    } else {
      const formattedExpression = formatExpression(expression.trim());
      setDisplay(formattedExpression + ' ' + newInput);
    }
    setIsFormattedResult(true);
  }, [expression, currentInput, showingResult]);

  const handleBackspace = useCallback(() => {
    if (showingResult) {
      // Clear result state and go back to normal input
      setShowingResult(false);
      setResultFormula('');
      setExpression('');
      // Remove formatting and get raw value
      const rawValue = currentInput.replace(/,/g, '');
      const newInput = rawValue.length > 1 ? rawValue.slice(0, -1) : '0';
      setCurrentInput(newInput);
      setDisplay(formatDisplayNumber(newInput));
      if (newInput === '0') setWaitingForOperand(true);
      setIsFormattedResult(false);
    } else if (showingOperator) {
      // Remove the last operator from expression
      const newExpression = expression.slice(0, -3); // Remove " + " or similar
      setExpression(newExpression);
      
      // Find the last number in the expression or use the original input
      let displayValue;
      if (newExpression === '') {
        // If no expression left, show the current input (first number)
        displayValue = formatDisplayNumber(currentInput);
        setOperator(null);
        setPreviousValue(null);
      } else {
        // Extract the last number from the expression for display
        const lastSpaceIndex = newExpression.lastIndexOf(' ');
        const lastNumber = lastSpaceIndex >= 0 ? newExpression.substring(lastSpaceIndex + 1) : newExpression;
        const formattedExpression = formatExpression(newExpression.trim());
        displayValue = formattedExpression;
        // Update currentInput to the last number in the expression
        setCurrentInput(lastNumber);
        
        // Check if there's still an operator in the remaining expression
        const secondLastSpaceIndex = newExpression.lastIndexOf(' ', lastSpaceIndex - 1);
        if (secondLastSpaceIndex >= 0) {
          const remainingOperator = newExpression.substring(secondLastSpaceIndex + 1, lastSpaceIndex);
          setOperator(remainingOperator);
          
          // Find the first number for previousValue
          const firstSpaceIndex = newExpression.indexOf(' ');
          const firstNumber = firstSpaceIndex >= 0 ? newExpression.substring(0, firstSpaceIndex) : newExpression;
          setPreviousValue(parseFloat(firstNumber.replace(/,/g, '')));
        } else {
          setOperator(null);
          setPreviousValue(null);
        }
      }
      
      setDisplay(displayValue);
      setShowingOperator(false);
      setWaitingForOperand(false);
    } else if (currentInput.length > 1 && currentInput !== '0') {
      // Remove formatting, remove character, then reformat
      const rawValue = currentInput.replace(/,/g, '');
      const newRawInput = rawValue.slice(0, -1);
      setCurrentInput(newRawInput);
      const formattedInput = formatDisplayNumber(newRawInput);
      if (expression === '') {
        setDisplay(formattedInput);
      } else {
        const formattedExpression = formatExpression(expression.trim());
        setDisplay(formattedExpression + ' ' + formattedInput);
      }
    } else {
      // When currentInput is '0' or becomes '0', check if we have an expression to work with
      if (expression === '') {
        // Already at initial state, do nothing
        setCurrentInput('0');
        setDisplay('0');
        setWaitingForOperand(true);
      } else {
        // We have an expression, so this backspace should remove the current '0' and 
        // continue from the operator state (like "100 + " waiting for next number)
        setCurrentInput('0');
        const formattedExpression = formatExpression(expression.slice(0, -3)); // Remove " + " part
        setDisplay(formattedExpression + ' ' + expression.slice(-3)); // Show "100 + "
        setWaitingForOperand(true);
        setShowingOperator(true);
      }
    }
  }, [expression, currentInput, showingOperator, showingResult]);

  const handleKeyboardInput = useCallback((key: string) => {
    if (key >= '0' && key <= '9') {
      handleDigit(key);
    } else if (key === '.') {
      handleDecimal();
    } else if (['+', '-', '×', '÷'].includes(key)) {
      const operatorMap: { [key: string]: string } = { '×': '*', '÷': '/' };
      handleOperator(operatorMap[key] || key);
    } else if (key === '=' || key === 'Enter') {
      handleEquals();
    } else if (key === 'Clear' || key === 'Escape') {
      handleClear();
    } else if (key === 'Backspace') {
      handleBackspace();
    }
  }, [handleDigit, handleDecimal, handleOperator, handleEquals, handleClear, handleBackspace]);

  // Register/unregister this calculator's ref for keyboard handling
  useEffect(() => {
    const calculatorRef = { handleKeyboardInput };
    onRegisterRef(id, calculatorRef);
    
    return () => {
      onUnregisterRef(id);
    };
  }, [id, handleKeyboardInput, onRegisterRef, onUnregisterRef]);

  const handleCalculatorClick = useCallback(() => {
    onSetActive(id);
  }, [id, onSetActive]);

  const getCalculatorTypeLabel = (type: CalculatorType): string => {
    switch (type) {
      case 'basic': return 'Basic';
      case 'scientific': return 'Scientific';
      case 'programmer': return 'Programmer';
      default: return 'Basic';
    }
  };

  const handleCalculatorTypeChange = (newType: CalculatorType) => {
    setCalculatorType(newType);
    setDropdownOpen(false);
    handleClear(); // Reset calculator when switching types
  };

  const renderButton = (label: string, onClick: () => void, className: string = '') => (
    <button onClick={onClick} className={`rounded-lg h-12 sm:h-14 md:h-16 text-lg sm:text-xl md:text-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}>
      {label}
    </button>
  );

  const renderScientificButton = (label: string, onClick: () => void, className: string = '') => {
    // Check if the button is a number (0-9)
    const isNumber = /^[0-9]$/.test(label);
    const fontSize = isNumber ? 'text-lg sm:text-xl md:text-2xl' : 'text-xs sm:text-sm md:text-base';
    
    return (
      <button onClick={onClick} className={`rounded-lg h-12 sm:h-14 md:h-16 ${fontSize} font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}>
        {label}
      </button>
    );
  };

  const renderBasicButtons = () => (
    <div className="grid grid-cols-4 gap-3">
      {renderButton(display !== '0' ? 'C' : 'AC', handleClear, 'bg-gray-600 text-red-400 hover:bg-gray-500')}
      {renderButton('+/-', handlePlusMinus, 'bg-gray-600 hover:bg-gray-500')}
      {renderButton('%', handlePercent, 'bg-gray-600 hover:bg-gray-500')}
      {renderButton('÷', () => handleOperator('/'), 'bg-cyan-600 hover:bg-cyan-500')}

      {renderButton('7', () => handleDigit('7'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('8', () => handleDigit('8'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('9', () => handleDigit('9'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('×', () => handleOperator('*'), 'bg-cyan-600 hover:bg-cyan-500')}

      {renderButton('4', () => handleDigit('4'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('5', () => handleDigit('5'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('6', () => handleDigit('6'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('-', () => handleOperator('-'), 'bg-cyan-600 hover:bg-cyan-500')}

      {renderButton('1', () => handleDigit('1'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('2', () => handleDigit('2'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('3', () => handleDigit('3'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('+', () => handleOperator('+'), 'bg-cyan-600 hover:bg-cyan-500')}

      {renderButton('0', () => handleDigit('0'), 'col-span-2 bg-gray-700 hover:bg-gray-600')}
      {renderButton('.', handleDecimal, 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('=', handleEquals, 'bg-cyan-600 hover:bg-cyan-500')}
    </div>
  );

  const renderScientificButtons = () => (
    <div className="grid grid-cols-6 gap-2 text-xs sm:text-sm">
      {/* Row 1 - Angle mode and memory */}
      {renderScientificButton(angleMode.toUpperCase(), () => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg'), 'bg-orange-600 hover:bg-orange-500')}
      {renderScientificButton('MC', () => handleMemoryFunction('MC'), 'bg-blue-600 hover:bg-blue-500')}
      {renderScientificButton('MR', () => handleMemoryFunction('MR'), `bg-blue-600 hover:bg-blue-500 ${memoryVisible ? 'ring-2 ring-yellow-400' : ''}`)}
      {renderScientificButton('MS', () => handleMemoryFunction('MS'), 'bg-blue-600 hover:bg-blue-500')}
      {renderScientificButton('M+', () => handleMemoryFunction('M+'), 'bg-blue-600 hover:bg-blue-500')}
      {renderScientificButton('M-', () => handleMemoryFunction('M-'), 'bg-blue-600 hover:bg-blue-500')}

      {/* Row 2 - Trig functions */}
      {renderScientificButton('sin', () => handleScientificFunction('sin'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('cos', () => handleScientificFunction('cos'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('tan', () => handleScientificFunction('tan'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('asin', () => handleScientificFunction('asin'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('acos', () => handleScientificFunction('acos'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('atan', () => handleScientificFunction('atan'), 'bg-purple-600 hover:bg-purple-500')}
      
      {/* Row 3 - Log and power functions */}
      {renderScientificButton('log', () => handleScientificFunction('log'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('ln', () => handleScientificFunction('ln'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('√', () => handleScientificFunction('sqrt'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('x²', () => handleScientificFunction('x²'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('x³', () => handleScientificFunction('x³'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('x^y', () => handleOperator('^'), 'bg-purple-600 hover:bg-purple-500')}
      
      {/* Row 4 - Fraction and special functions */}
      {renderScientificButton('1/x', () => handleFractionFunction('1/x'), 'bg-green-600 hover:bg-green-500')}
      {renderScientificButton('a/b', () => handleFractionFunction('a/b'), 'bg-green-600 hover:bg-green-500')}
      {renderScientificButton('x!', () => handleScientificFunction('x!'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('π', () => handleScientificFunction('π'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('e', () => handleScientificFunction('e'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('e^x', () => handleScientificFunction('e^x'), 'bg-purple-600 hover:bg-purple-500')}
      
      {/* Row 5 - Clear and operators */}
      {renderScientificButton('C', handleClear, 'bg-gray-600 text-red-400 hover:bg-gray-500')}
      {renderScientificButton('+/-', handlePlusMinus, 'bg-gray-600 hover:bg-gray-500')}
      {renderScientificButton('%', handlePercent, 'bg-gray-600 hover:bg-gray-500')}
      {renderScientificButton('mod', () => handleOperator('mod'), 'bg-orange-600 hover:bg-orange-500')}
      {renderScientificButton('10^x', () => handleScientificFunction('10^x'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('÷', () => handleOperator('/'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 6 */}
      {renderScientificButton('7', () => handleDigit('7'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('8', () => handleDigit('8'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('9', () => handleDigit('9'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('(', () => {/* Parentheses functionality can be added later */}, 'bg-orange-600 hover:bg-orange-500')}
      {renderScientificButton(')', () => {/* Parentheses functionality can be added later */}, 'bg-orange-600 hover:bg-orange-500')}
      {renderScientificButton('×', () => handleOperator('*'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 7 */}
      {renderScientificButton('4', () => handleDigit('4'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('5', () => handleDigit('5'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('6', () => handleDigit('6'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('n!', () => handleScientificFunction('x!'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('Rnd', () => handleScientificFunction('Rnd'), 'bg-purple-600 hover:bg-purple-500')}
      {renderScientificButton('-', () => handleOperator('-'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 8 */}
      {renderScientificButton('1', () => handleDigit('1'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('2', () => handleDigit('2'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('3', () => handleDigit('3'), 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('EXP', () => handleSpecialFunction('EXP'), 'bg-orange-600 hover:bg-orange-500')}
      {renderScientificButton('Ans', () => handleSpecialFunction('Ans'), 'bg-orange-600 hover:bg-orange-500')}
      {renderScientificButton('+', () => handleOperator('+'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 9 */}
      {renderScientificButton('0', () => handleDigit('0'), 'col-span-2 bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('.', handleDecimal, 'bg-gray-700 hover:bg-gray-600')}
      {renderScientificButton('±', handlePlusMinus, 'bg-gray-600 hover:bg-gray-500')}
      {renderScientificButton('%', handlePercent, 'bg-gray-600 hover:bg-gray-500')}
      {renderScientificButton('=', handleEquals, 'bg-cyan-600 hover:bg-cyan-500')}
    </div>
  );

  const renderProgrammerButtons = () => (
    <div className="grid grid-cols-4 gap-2 text-sm">
      {/* Row 1 - Number base buttons */}
      {renderButton('DEC', () => {
        const hasHexDigits = /[A-F]/i.test(currentInput);
        const decValue = hasHexDigits ? parseInt(currentInput, 16) : parseInt(currentInput, 10);
        setCurrentInput(String(decValue));
        setDisplay(String(decValue));
      }, 'bg-blue-600 hover:bg-blue-500')}
      {renderButton('HEX', () => {
        const hasHexDigits = /[A-F]/i.test(currentInput);
        const decValue = hasHexDigits ? parseInt(currentInput, 16) : parseInt(currentInput, 10);
        const hexValue = decValue.toString(16).toUpperCase();
        setCurrentInput(hexValue);
        setDisplay(hexValue);
      }, 'bg-blue-600 hover:bg-blue-500')}
      {renderButton('BIN', () => {
        const hasHexDigits = /[A-F]/i.test(currentInput);
        const decValue = hasHexDigits ? parseInt(currentInput, 16) : parseInt(currentInput, 10);
        const binValue = decValue.toString(2);
        setCurrentInput(binValue);
        setDisplay(binValue);
      }, 'bg-blue-600 hover:bg-blue-500')}
      {renderButton('C', handleClear, 'bg-gray-600 text-red-400 hover:bg-gray-500')}

      {/* Row 2 - Bit operations */}
      {renderButton('AND', () => handleProgrammerFunction('AND'), 'bg-green-600 hover:bg-green-500')}
      {renderButton('OR', () => handleProgrammerFunction('OR'), 'bg-green-600 hover:bg-green-500')}
      {renderButton('XOR', () => handleProgrammerFunction('XOR'), 'bg-green-600 hover:bg-green-500')}
      {renderButton('NOT', () => handleProgrammerFunction('NOT'), 'bg-green-600 hover:bg-green-500')}
      
      {/* Row 3 - Shift operations */}
      {renderButton('LSH', () => handleProgrammerFunction('LSH'), 'bg-green-600 hover:bg-green-500')}
      {renderButton('RSH', () => handleProgrammerFunction('RSH'), 'bg-green-600 hover:bg-green-500')}
      {renderButton('mod', () => handleOperator('mod'), 'bg-orange-600 hover:bg-orange-500')}
      {renderButton('÷', () => handleOperator('/'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 4 */}
      {renderButton('D', () => handleDigit('D'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('E', () => handleDigit('E'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('F', () => handleDigit('F'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('×', () => handleOperator('*'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 5 */}
      {renderButton('A', () => handleDigit('A'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('B', () => handleDigit('B'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('C', () => handleDigit('C'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('-', () => handleOperator('-'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 6 */}
      {renderButton('7', () => handleDigit('7'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('8', () => handleDigit('8'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('9', () => handleDigit('9'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('+', () => handleOperator('+'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 7 */}
      {renderButton('4', () => handleDigit('4'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('5', () => handleDigit('5'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('6', () => handleDigit('6'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('=', handleEquals, 'row-span-2 bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 8 */}
      {renderButton('1', () => handleDigit('1'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('2', () => handleDigit('2'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('3', () => handleDigit('3'), 'bg-gray-700 hover:bg-gray-600')}

      {/* Row 9 */}
      {renderButton('0', () => handleDigit('0'), 'col-span-3 bg-gray-700 hover:bg-gray-600')}
    </div>
  );

  return (
    <div 
      className={`bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-5 md:p-6 flex flex-col gap-4 sm:gap-5 relative w-full max-w-full cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'ring-2 ring-cyan-400 ring-opacity-75 shadow-cyan-400/20' 
          : 'hover:ring-1 hover:ring-gray-600'
      }`}
      onClick={handleCalculatorClick}
    >
       <button 
         onClick={(e) => {
           e.stopPropagation(); // Prevent calculator selection when closing
           onClose(id);
         }} 
         className="absolute top-2 right-2 text-gray-500 hover:text-white p-1 rounded-full transition-colors"
       >
            <CloseIcon />
       </button>
      
      {/* Calculator Type Selector */}
      <div className="flex justify-start items-center mb-4 gap-2 relative">
        {/* History Button */}
        <div ref={historyRef} className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setHistoryOpen(!historyOpen);
            }}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700"
            title={`History (${history.length} entries)`}
          >
            <img 
              src="/assets/history.png" 
              alt="History" 
              className="w-5 h-5"
            />
          </button>
          
          {historyOpen && (
            <div className="absolute top-8 left-0 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20 w-72 max-h-64 overflow-y-auto">
              <div className="p-2 border-b border-gray-600 flex justify-between items-center">
                <span className="text-white text-sm font-medium">History</span>
                {history.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHistory();
                    }}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="p-3 text-gray-400 text-sm text-center">
                  No calculations yet
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        useHistoryEntry(entry);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                    >
                      <div className="text-gray-300 text-xs mb-1">
                        {entry.expression}
                      </div>
                      <div className="text-white text-sm font-mono">
                        = {entry.result}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={dropdownRef} className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img 
              src="/assets/calculator.png" 
              alt="Calculator" 
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <span className="text-white text-sm font-medium">
              {getCalculatorTypeLabel(calculatorType)}
            </span>
          </button>
        
        {dropdownOpen && (
          <div className="absolute top-8 left-0 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCalculatorTypeChange('basic');
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 first:rounded-t-lg ${
                calculatorType === 'basic' ? 'bg-gray-600 text-cyan-400' : 'text-white'
              }`}
            >
              Basic
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCalculatorTypeChange('scientific');
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 ${
                calculatorType === 'scientific' ? 'bg-gray-600 text-cyan-400' : 'text-white'
              }`}
            >
              Scientific
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCalculatorTypeChange('programmer');
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 last:rounded-b-lg ${
                calculatorType === 'programmer' ? 'bg-gray-600 text-cyan-400' : 'text-white'
              }`}
            >
              Programmer
            </button>
          </div>
        )}
        </div>
      </div>

      <div 
        ref={displayRef}
        className="bg-gray-900 text-white text-right p-3 sm:p-4 rounded-lg font-mono min-h-20 sm:min-h-[90px] md:min-h-[100px] flex flex-col justify-end"
      >
        {showingResult && resultFormula && (
          <div className="calculator-display-text text-xs sm:text-sm md:text-base text-gray-400 mb-2">
            {resultFormula}
          </div>
        )}
        <div 
          ref={textRef}
          className={`calculator-display-text ${showingResult ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold' : 'text-2xl sm:text-base md:text-lg lg:text-3xl'}`}
        >
          {display || '0'}
        </div>
        {memoryVisible && (
          <div className="text-xs text-yellow-400 mt-1">
            M: {formatNumber(memoryValue)}
          </div>
        )}
        {calculatorType === 'programmer' && (
          <div className="text-xs text-blue-400 mt-1 space-y-1">
            <div>DEC: {parseInt(currentInput.replace(/,/g, ''), /[A-F]/i.test(currentInput) ? 16 : 10)}</div>
            <div>HEX: {parseInt(currentInput.replace(/,/g, ''), /[A-F]/i.test(currentInput) ? 16 : 10).toString(16).toUpperCase()}</div>
            <div>BIN: {parseInt(currentInput.replace(/,/g, ''), /[A-F]/i.test(currentInput) ? 16 : 10).toString(2)}</div>
          </div>
        )}
      </div>
      
      {/* Render buttons based on calculator type */}
      {calculatorType === 'basic' && renderBasicButtons()}
      {calculatorType === 'scientific' && renderScientificButtons()}
      {calculatorType === 'programmer' && renderProgrammerButtons()}
    </div>
  );
};

export default Calculator;
