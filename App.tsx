import React, { useState, useEffect, useCallback, useRef } from 'react';
import Calculator from './components/Calculator';
import Notes from './components/Notes';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Features from './pages/Features';
import UseCases from './pages/UseCases';
import About from './pages/About';
import { AddIcon } from './components/icons';

export interface CalculatorRef {
  handleKeyboardInput: (key: string) => void;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const initialId = Date.now();
  const [calculators, setCalculators] = useState<{ id: number }[]>([{ id: initialId }]);
  const [notes, setNotes] = useState<string>('');
  const [activeCalculatorId, setActiveCalculatorId] = useState<number | null>(initialId);
  const [temporarilyInactiveCalculatorId, setTemporarilyInactiveCalculatorId] = useState<number | null>(null);
  const calculatorRefs = useRef<Map<number, CalculatorRef>>(new Map());

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('pwa-calc-notes');
      if (savedNotes) {
        setNotes(savedNotes);
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pwa-calc-notes', notes);
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  }, [notes]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard input if there's an active calculator and not typing in notes
      if (!activeCalculatorId) return;
      
      // Check if user is typing in any input field, textarea, or contenteditable element
      const target = event.target as HTMLElement;
      const isEditableElement = target instanceof HTMLTextAreaElement || 
                               target instanceof HTMLInputElement || 
                               (target as any).isContentEditable ||
                               target.closest('.ql-editor') || // Quill editor
                               target.closest('[contenteditable]');
      
      if (isEditableElement) {
        return;
      }

      const activeCalculatorRef = calculatorRefs.current.get(activeCalculatorId);
      if (!activeCalculatorRef) return;

      // Prevent default behavior for calculator keys
      const calculatorKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '=', '.', 'Enter', 'Escape', 'Backspace'];
      if (calculatorKeys.includes(event.key)) {
        event.preventDefault();
      }

      // Map keyboard keys to calculator inputs
      let key = event.key;
      if (key === 'Enter') key = '=';
      else if (key === 'Escape') key = 'Clear';
      else if (key === 'Backspace') key = 'Backspace';
      else if (key === '*') key = '×';
      else if (key === '/') key = '÷';

      activeCalculatorRef.handleKeyboardInput(key);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeCalculatorId]);

  const setCalculatorActive = useCallback((id: number) => {
    setActiveCalculatorId(id);
  }, []);

  const registerCalculatorRef = useCallback((id: number, ref: CalculatorRef) => {
    calculatorRefs.current.set(id, ref);
  }, []);

  const unregisterCalculatorRef = useCallback((id: number) => {
    calculatorRefs.current.delete(id);
  }, []);

  const handleNotesFocus = useCallback(() => {
    if (activeCalculatorId) {
      setTemporarilyInactiveCalculatorId(activeCalculatorId);
      setActiveCalculatorId(null);
    }
  }, [activeCalculatorId]);

  const handleNotesBlur = useCallback(() => {
    if (temporarilyInactiveCalculatorId) {
      setActiveCalculatorId(temporarilyInactiveCalculatorId);
      setTemporarilyInactiveCalculatorId(null);
    }
  }, [temporarilyInactiveCalculatorId]);

  const addCalculator = useCallback(() => {
    const newId = Date.now();
    setCalculators(prev => [...prev, { id: newId }]);
    setActiveCalculatorId(newId); // Automatically set new calculator as active
  }, []);

  const removeCalculator = useCallback((id: number) => {
    setCalculators(prev => prev.filter(calc => calc.id !== id));
    // If removing active calculator, clear active state
    if (activeCalculatorId === id) {
      setActiveCalculatorId(null);
    }
  }, [activeCalculatorId]);

  // Page navigation handler
  const handleNavigation = useCallback((page: string) => {
    setCurrentPage(page);
  }, []);

  // Home page content (original calculator app)
  const renderHomePage = () => (
    <>
      <header className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-cyan-400">All-In-One Calculator and Note-Taking App</h1>
        </div>
        <button
          onClick={addCalculator}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105"
        >
          <AddIcon />
          <span className="ml-2 hidden sm:inline">Add Calculator</span>
        </button>
      </header>

      <main className="grow flex flex-col lg:flex-row p-4 sm:p-6 gap-6">
        <div className="grow lg:w-3/5 xl:w-2/3">
          {calculators.length > 0 && (
            <div className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">
                <strong>Keyboard Shortcuts:</strong> Click on a calculator to select it, then use:
              </p>
              <div className="text-xs text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-2">
                <span>• Numbers: 0-9</span>
                <span>• Operators: + - * /</span>
                <span>• Enter: Calculate</span>
                <span>• Esc: Clear, ⌫: Backspace</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 auto-rows-min">
            {calculators.map(calc => (
              <Calculator 
                key={calc.id} 
                id={calc.id} 
                isActive={activeCalculatorId === calc.id}
                onClose={removeCalculator} 
                onSetActive={setCalculatorActive}
                onRegisterRef={registerCalculatorRef}
                onUnregisterRef={unregisterCalculatorRef}
              />
            ))}
             {calculators.length === 0 && (
              <div className="md:col-span-2 2xl:col-span-3 flex items-center justify-center h-64 text-gray-500 text-center">
                <div>
                  <p className="text-lg mb-2">Click "Add Calculator" to get started.</p>
                  <p className="text-sm">Tip: Click on a calculator to make it active, then use your keyboard for input!</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 lg:w-2/5 xl:w-1/3 h-64 lg:h-auto min-h-[400px]">
          <Notes 
            value={notes} 
            onChange={setNotes}
            onFocus={handleNotesFocus}
            onBlur={handleNotesBlur}
          />
        </div>
      </main>
    </>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return renderHomePage();
      case 'features':
        return <Features />;
      case 'use-cases':
        return <UseCases />;
      case 'about':
        return <About />;
      default:
        return renderHomePage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Navigation currentPage={currentPage} onNavigate={handleNavigation} />
      <div className="flex-1">
        {renderCurrentPage()}
      </div>
      <Footer />
    </div>
  );
};

export default App;