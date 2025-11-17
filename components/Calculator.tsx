
import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import { CloseIcon } from './icons';

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
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const handleDecimal = useCallback(() => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setWaitingForOperand(false);
    }
  }, [display]);

  const handleOperator = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);
    if (operator && previousValue !== null && !waitingForOperand) {
      const result = calculate(previousValue, inputValue, operator);
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(inputValue);
    }
    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, previousValue, waitingForOperand]);
  
  const handleEquals = useCallback(() => {
    const inputValue = parseFloat(display);
    if (operator && previousValue !== null) {
      const result = calculate(previousValue, inputValue, operator);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [display, operator, previousValue]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setCurrentValue(0);
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(true);
  }, []);

  const handlePlusMinus = useCallback(() => {
    setDisplay(String(parseFloat(display) * -1));
  }, [display]);

  const handlePercent = useCallback(() => {
    setDisplay(String(parseFloat(display) / 100));
  }, [display]);

  const handleBackspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setWaitingForOperand(true);
    }
  }, [display]);

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
    <button onClick={onClick} className={`rounded-lg h-16 text-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}>
      {label}
    </button>
  );

  return (
    <div 
      className={`bg-gray-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 relative min-w-[280px] cursor-pointer transition-all duration-200 ${
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
      <div className="bg-gray-900 text-white text-5xl text-right p-4 rounded-lg font-mono overflow-x-auto">
        {display}
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
