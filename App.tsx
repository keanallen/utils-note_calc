import React, { useState, useEffect, useCallback, useRef } from 'react';
import Calculator from './components/Calculator';
import Notes from './components/Notes';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Features from './pages/Features';
import UseCases from './pages/UseCases';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { AddIcon } from './components/icons';
import Router from './utils/router';
import { loadNotesFromStorage, saveNotesToStorage, testLocalStorage, SAVE_DEBOUNCE_DELAY } from './utils/storage';

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
  const insertCalculationResultRef = useRef<((result: string) => void) | null>(null);
  const routerRef = useRef<Router | null>(null);
  const [notesLoaded, setNotesLoaded] = useState<boolean>(false); // Track if notes have been loaded
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For debounced saving

  // Initialize router
  useEffect(() => {
    const handleRouteChange = (route: string) => {
      setCurrentPage(route);
    };

    const handleTitleChange = (title: string) => {
      document.title = title;
    };

    routerRef.current = new Router(handleRouteChange, handleTitleChange);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((notesToSave: string) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout for debounced saving
    saveTimeoutRef.current = setTimeout(() => {
      const success = saveNotesToStorage(notesToSave);
      if (!success) {
        console.error('⚠️ Failed to save notes - data may be lost');
      } else {
        console.log(`💾 Notes saved (debounced): ${notesToSave.length} characters`);
      }
      saveTimeoutRef.current = null;
    }, SAVE_DEBOUNCE_DELAY);

  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Force immediate save on unmount
        if (notesLoaded && notes) {
          saveNotesToStorage(notes);
          console.log('💾 Force saved notes on component unmount');
        }
      }
    };
  }, [notes, notesLoaded]);

  // Save immediately when page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Force immediate save before page unload
        if (notesLoaded && notes) {
          saveNotesToStorage(notes);
          console.log('💾 Force saved notes before page unload');
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && saveTimeoutRef.current) {
        // Page is being hidden, force save immediately
        clearTimeout(saveTimeoutRef.current);
        if (notesLoaded && notes) {
          saveNotesToStorage(notes);
          console.log('💾 Force saved notes on page visibility change');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [notes, notesLoaded]);

  useEffect(() => {
    // Test localStorage functionality on app start
    const isStorageWorking = testLocalStorage();
    if (!isStorageWorking) {
      console.error('⚠️ localStorage is not working - notes may not persist');
    }
    
    // Load saved notes
    const savedNotes = loadNotesFromStorage();
    console.log('🔍 Attempting to load notes. Found:', savedNotes ? `${savedNotes.length} characters` : 'nothing');
    
    if (savedNotes) {
      setNotes(savedNotes);
      console.log('✅ Notes loaded successfully');
    } else {
      console.log('ℹ️ No saved notes found, starting fresh');
    }
    
    setNotesLoaded(true); // Mark notes as loaded
  }, []);

  useEffect(() => {
    // Only save notes after they've been initially loaded
    if (notesLoaded) {
      console.log(`🔄 Scheduling debounced save for ${notes.length} characters...`);
      debouncedSave(notes);
    }
  }, [notes, notesLoaded, debouncedSave]);

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

  const handleInsertCalculationResult = useCallback((insertFn: (result: string) => void) => {
    insertCalculationResultRef.current = insertFn;
  }, []);

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
    if (routerRef.current) {
      routerRef.current.navigate(page);
    } else {
      setCurrentPage(page);
    }
  }, []);

  // Home page content (original calculator app)
  const renderHomePage = () => (
    <>

    <button
          onClick={addCalculator}
          className="fixed bottom-10 md:bottom-16 right-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-lg flex items-center transition-colors z-50"
          aria-label="Add new calculator"
        >
          <AddIcon />
          <span className="ml-2 hidden sm:inline">Add Calculator</span>
        </button>

      <section className="grow flex flex-col lg:flex-row p-4 sm:p-6 gap-6">
        <div className="grow lg:w-3/5 xl:w-2/3">
          {calculators.length > 0 && (
            <aside className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700" aria-label="Keyboard shortcuts help">
              <p className="text-sm text-gray-400 mb-2">
                <strong>Keyboard Shortcuts:</strong> Click on a calculator to select it, then use:
              </p>
              <div className="text-xs text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-2" role="list">
                <span role="listitem">• Numbers: 0-9</span>
                <span role="listitem">• Operators: + - * /</span>
                <span role="listitem">• Enter: Calculate</span>
                <span role="listitem">• Esc: Clear, ⌫: Backspace</span>
              </div>
            </aside>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 auto-rows-min" role="list" aria-label="Calculator instances">
            {calculators.map(calc => (
              <div key={calc.id} role="listitem">
                <Calculator 
                  id={calc.id} 
                  isActive={activeCalculatorId === calc.id}
                  onClose={removeCalculator} 
                  onSetActive={setCalculatorActive}
                  onRegisterRef={registerCalculatorRef}
                  onUnregisterRef={unregisterCalculatorRef}
                  onCalculationResult={insertCalculationResultRef.current}
                />
              </div>
            ))}
             {calculators.length === 0 && (
              <div className="md:col-span-2 2xl:col-span-3 flex items-center justify-center h-64 text-gray-500 text-center" role="status" aria-label="No calculators available">
                <div>
                  <p className="text-lg mb-2">Click "Add Calculator" to get started.</p>
                  <p className="text-sm">Tip: Click on a calculator to make it active, then use your keyboard for input!</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <aside className="shrink-0 lg:w-2/5 xl:w-1/3 h-64 lg:h-auto min-h-[400px]" aria-label="Notes editor">
          <Notes 
            value={notes} 
            onChange={setNotes}
            onFocus={handleNotesFocus}
            onBlur={handleNotesBlur}
            onInsertCalculationResult={handleInsertCalculationResult}
          />
        </aside>
      </section>
    </>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return renderHomePage();
      case 'features':
        return <Features onNavigate={handleNavigation} />;
      case 'use-cases':
        return <UseCases onNavigate={handleNavigation} />;
      case 'about':
        return <About onNavigate={handleNavigation}  />;
      case 'privacy-policy':
        return <PrivacyPolicy onNavigate={handleNavigation} />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={handleNavigation} />;
      default:
        return renderHomePage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Navigation currentPage={currentPage} onNavigate={handleNavigation} />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      <Footer onNavigate={handleNavigation} />
    </div>
  );
};

export default App;