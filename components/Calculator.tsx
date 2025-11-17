
import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { CloseIcon } from './icons';

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
  const displayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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

  const calculate = (val1: number, val2: number, op: string): number => {
    switch (op) {
      case '+': return val1 + val2;
      case '-': return val1 - val2;
      case '*': return val1 * val2;
      case '/': return val2 === 0 ? Infinity : val1 / val2;
      default: return val2;
    }
  };

  const handleDigit = useCallback((digit: string) => {
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
      const formattedInput = formatDisplayNumber(newInput);
      if (expression === '') {
        setDisplay(formattedInput);
      } else {
        // Format the existing expression but keep current input unformatted while typing
        const formattedExpression = formatExpression(expression.slice(0, -3)); // Remove " + " part
        setDisplay(formattedExpression + ' ' + expression.slice(-3) + formattedInput);
      }
      setIsFormattedResult(false);
    }
  }, [expression, currentInput, waitingForOperand, showingOperator, showingResult]);

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

  const renderButton = (label: string, onClick: () => void, className: string = '') => (
    <button onClick={onClick} className={`rounded-lg h-12 sm:h-14 md:h-16 text-lg sm:text-xl md:text-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}>
      {label}
    </button>
  );

  return (
    <div 
      className={`bg-gray-800 rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 relative min-w-[260px] sm:min-w-[280px] cursor-pointer transition-all duration-200 ${
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
          className={`calculator-display-text ${showingResult ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold' : 'text-sm sm:text-base md:text-lg lg:text-xl'}`}
        >
          {display || '0'}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
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
    </div>
  );
};

export default Calculator;
