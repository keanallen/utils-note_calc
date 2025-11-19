
import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { CloseIcon } from './icons';

type CalculatorType = 'basic' | 'scientific' | 'programmer';

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
  const parts = expr.split(/(\s*[+\-×÷]\s*)/);
  
  return parts.map(part => {
    const trimmed = part.trim();
    
    // If it's empty, a space, or an operator, return as-is
    if (trimmed === '' || ['+', '-', '×', '÷'].includes(trimmed)) {
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
}

const Calculator: React.FC<CalculatorProps> = ({ 
  id, 
  isActive, 
  onClose, 
  onSetActive, 
  onRegisterRef, 
  onUnregisterRef 
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
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const displayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll display to the right when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Scroll the text container to show the latest input
      if (textRef.current) {
        const element = textRef.current;
        console.log('Scrolling text - scrollWidth:', element.scrollWidth, 'clientWidth:', element.clientWidth);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

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
      case '1/x': result = 1 / currentVal; break;
      case 'e^x': result = Math.exp(currentVal); break;
      case '10^x': result = Math.pow(10, currentVal); break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'x!': 
        // Factorial function
        if (currentVal < 0 || !Number.isInteger(currentVal)) {
          result = NaN;
        } else if (currentVal === 0 || currentVal === 1) {
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
    
    const formattedResult = formatNumber(result);
    setCurrentInput(String(result));
    setDisplay(formattedResult);
    setShowingResult(true);
    setExpression('');
    setResultFormula(`${func}(${formatNumber(currentVal)})`);
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setIsFormattedResult(true);
  }, [currentInput, angleMode]);

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
    setCurrentInput(String(result));
    setDisplay(formattedResult);
    setShowingResult(true);
    setExpression('');
    if (func !== 'a/b') {
      setResultFormula(`${func}(${formatNumber(currentVal)})`);
    }
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setIsFormattedResult(true);
  }, [currentInput]);

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
    setCurrentInput(String(result));
    setDisplay(formattedResult);
    setShowingResult(true);
    setExpression('');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
    setIsFormattedResult(true);
  }, [currentInput, previousValue, operator]);

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
    if (operator && previousValue !== null) {
      const result = calculate(previousValue, inputValue, operator);
      const formattedResult = formatNumber(result);
      
      // Create formatted formula for display
      const rawFormula = expression + String(inputValue);
      const formattedFormula = formatExpression(rawFormula);
      
      setResultFormula(formattedFormula);
      setDisplay(formattedResult);
      setShowingResult(true);
      setExpression('');
      setCurrentInput(String(result)); // Store raw result for further calculations
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      setShowingOperator(false);
      setIsFormattedResult(true);
    }
  }, [expression, currentInput, operator, previousValue]);

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
      const formattedInput = formatDisplayNumber(currentInput);
      if (newExpression === '') {
        setDisplay(formattedInput);
      } else {
        const formattedExpression = formatExpression(newExpression.trim());
        setDisplay(formattedExpression + ' ' + formattedInput);
      }
      setShowingOperator(false);
      setWaitingForOperand(false);
      setOperator(null);
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
      setCurrentInput('0');
      if (expression === '') {
        setDisplay('0');
      } else {
        const formattedExpression = formatExpression(expression.trim());
        setDisplay(formattedExpression + ' 0');
      }
      setWaitingForOperand(true);
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
      {renderButton(angleMode.toUpperCase(), () => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg'), 'bg-orange-600 hover:bg-orange-500')}
      {renderButton('MC', () => handleMemoryFunction('MC'), 'bg-blue-600 hover:bg-blue-500')}
      {renderButton('MR', () => handleMemoryFunction('MR'), `bg-blue-600 hover:bg-blue-500 ${memoryVisible ? 'ring-2 ring-yellow-400' : ''}`)}
      {renderButton('MS', () => handleMemoryFunction('MS'), 'bg-blue-600 hover:bg-blue-500')}
      {renderButton('M+', () => handleMemoryFunction('M+'), 'bg-blue-600 hover:bg-blue-500')}
      {renderButton('M-', () => handleMemoryFunction('M-'), 'bg-blue-600 hover:bg-blue-500')}

      {/* Row 2 - Trig functions */}
      {renderButton('sin', () => handleScientificFunction('sin'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('cos', () => handleScientificFunction('cos'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('tan', () => handleScientificFunction('tan'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('asin', () => handleScientificFunction('asin'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('acos', () => handleScientificFunction('acos'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('atan', () => handleScientificFunction('atan'), 'bg-purple-600 hover:bg-purple-500')}
      
      {/* Row 3 - Log and power functions */}
      {renderButton('log', () => handleScientificFunction('log'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('ln', () => handleScientificFunction('ln'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('√', () => handleScientificFunction('sqrt'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('x²', () => handleScientificFunction('x²'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('x³', () => handleScientificFunction('x³'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('x^y', () => handleOperator('^'), 'bg-purple-600 hover:bg-purple-500')}
      
      {/* Row 4 - Fraction and special functions */}
      {renderButton('1/x', () => handleFractionFunction('1/x'), 'bg-green-600 hover:bg-green-500')}
      {renderButton('a/b', () => handleFractionFunction('a/b'), 'bg-green-600 hover:bg-green-500')}
      {renderButton('x!', () => handleScientificFunction('x!'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('π', () => handleScientificFunction('π'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('e', () => handleScientificFunction('e'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('e^x', () => handleScientificFunction('e^x'), 'bg-purple-600 hover:bg-purple-500')}
      
      {/* Row 5 - Clear and operators */}
      {renderButton('C', handleClear, 'bg-gray-600 text-red-400 hover:bg-gray-500')}
      {renderButton('+/-', handlePlusMinus, 'bg-gray-600 hover:bg-gray-500')}
      {renderButton('%', handlePercent, 'bg-gray-600 hover:bg-gray-500')}
      {renderButton('mod', () => handleOperator('mod'), 'bg-orange-600 hover:bg-orange-500')}
      {renderButton('10^x', () => handleScientificFunction('10^x'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('÷', () => handleOperator('/'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 6 */}
      {renderButton('7', () => handleDigit('7'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('8', () => handleDigit('8'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('9', () => handleDigit('9'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('(', () => {}, 'bg-orange-600 hover:bg-orange-500')}
      {renderButton(')', () => {}, 'bg-orange-600 hover:bg-orange-500')}
      {renderButton('×', () => handleOperator('*'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 7 */}
      {renderButton('4', () => handleDigit('4'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('5', () => handleDigit('5'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('6', () => handleDigit('6'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('n!', () => handleScientificFunction('x!'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('Rnd', () => handleScientificFunction('Rnd'), 'bg-purple-600 hover:bg-purple-500')}
      {renderButton('-', () => handleOperator('-'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 8 */}
      {renderButton('1', () => handleDigit('1'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('2', () => handleDigit('2'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('3', () => handleDigit('3'), 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('EXP', () => {}, 'bg-orange-600 hover:bg-orange-500')}
      {renderButton('Ans', () => {}, 'bg-orange-600 hover:bg-orange-500')}
      {renderButton('+', () => handleOperator('+'), 'bg-cyan-600 hover:bg-cyan-500')}

      {/* Row 9 */}
      {renderButton('0', () => handleDigit('0'), 'col-span-2 bg-gray-700 hover:bg-gray-600')}
      {renderButton('.', handleDecimal, 'bg-gray-700 hover:bg-gray-600')}
      {renderButton('±', handlePlusMinus, 'bg-gray-600 hover:bg-gray-500')}
      {renderButton('%', handlePercent, 'bg-gray-600 hover:bg-gray-500')}
      {renderButton('=', handleEquals, 'bg-cyan-600 hover:bg-cyan-500')}
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
      className={`bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-5 md:p-6 m-2 sm:m-3 md:m-4 flex flex-col gap-4 sm:gap-5 relative min-w-[300px] sm:min-w-[400px] cursor-pointer transition-all duration-200 ${
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
      <div ref={dropdownRef} className="flex justify-start items-center mb-4 gap-2 relative">
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

      <div 
        ref={displayRef}
        className="bg-gray-900 text-white text-right p-3 sm:p-4 rounded-lg font-mono min-h-[80px] sm:min-h-[90px] md:min-h-[100px] flex flex-col justify-end"
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
